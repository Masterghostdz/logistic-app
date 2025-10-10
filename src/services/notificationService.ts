// Récupère les notifications pour le planificateur : uniquement les déclarations en panne
export const getNotificationsForPlanificateur = async (planificateurId) => {
  // Return notifications explicitly targeted to planificateurs
  const q = query(notificationsCollection, where('recipientRole', '==', 'planificateur'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

import { db } from './firebaseClient';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from 'firebase/firestore';
const notificationsCollection = collection(db, 'notifications');

export const addNotification = async (notification) => {
  // Vérifier s'il existe déjà une notification pour cette déclaration et ce statut
  if (!notification.declarationId) throw new Error('declarationId is required in notification');

  // Work on a copy we will store to avoid mutating caller objects and to allow
  // last-minute sanitation (remove chauffeurId for role-targeted notifications,
  // strip refusal reasons from messages shown to chauffeurs, etc.).
  const saveDoc: any = { ...notification };

  // If this notification is targeted to a role (recipientRole), it should not be
  // stored with a chauffeurId — otherwise chauffeurs may receive role-targeted messages
  // (e.g. en_panne notifications intended only for planificateur). Remove chauffeurId
  // when recipientRole is present.
  if (saveDoc.recipientRole && saveDoc.chauffeurId) {
    delete saveDoc.chauffeurId;
  }

  // For notifications destined to a chauffeur, ensure we do NOT include the refusal reason
  // in the stored message. We detect common patterns like 'Motif:' and remove the trailing
  // reason. This keeps the notification concise and avoids exposing internal reason text.
  if (saveDoc.chauffeurId && typeof saveDoc.message === 'string') {
    // Remove any 'Motif: ...' (case-insensitive) suffix
    saveDoc.message = saveDoc.message.replace(/\b[Mm]otif[:\-\s]*.*$/i, '').trim();
    // If the message contains 'refus' (refusé / refused) and now ends abruptly, normalize it
    if (/\brefus\b/i.test(saveDoc.message) || /\brefusé/i.test(saveDoc.message) || /\brefused\b/i.test(saveDoc.message)) {
      // Keep a short, neutral message. If caller provided localized text we preserve the prefix
      // up to the word 'refus' and append a period.
      const base = (saveDoc.message.match(/.*?\brefus\w*/i) || [saveDoc.message])[0];
      saveDoc.message = base.replace(/\s+$/,'') + '.';
    }
  }

  // If a declarationId is provided, try to enrich the notification with programParts
  // and a canonical program reference (DCP/YY/MM/NNNN) so frontends can reliably
  // match the correct declaration (especially for chauffeur UI parsing).
  try {
    if (saveDoc.declarationId && !saveDoc.programParts) {
      const declRef = doc(db, 'declarations', saveDoc.declarationId);
      const declSnap = await getDoc(declRef);
      if (declSnap && declSnap.exists()) {
        const decl = declSnap.data() as any;
        const year = decl.year || '';
        const month = decl.month || '';
        const programNumber = decl.programNumber || decl.programReference || decl.number || '';
        saveDoc.programParts = {
          prefix: 'DCP',
          year: String(year),
          month: String(month),
          number: String(programNumber)
        };
        const programRef = `DCP/${year}/${month}/${programNumber}`;
        // Ensure the message contains the programRef so older UI logic that parses
        // messages to find program refs will work without modifying UI code.
        if (typeof saveDoc.message === 'string') {
          if (!saveDoc.message.includes('DCP/')) {
            saveDoc.message = `${programRef} ${saveDoc.message}`;
          }
        } else {
          saveDoc.message = programRef;
        }
      }
    }
  } catch (e) {
    // non-fatal: continue without enrichment if Firestore lookup fails
    console.warn('Failed to enrich notification with declaration programParts', e);
  }

  // Build a duplicate-check query that works for both chauffeur-targeted and role-targeted notifications
  let duplicateQuery;
  const message = saveDoc.message || '';

  if (saveDoc.chauffeurId) {
    duplicateQuery = query(
      notificationsCollection,
      where('chauffeurId', '==', saveDoc.chauffeurId),
      where('declarationId', '==', saveDoc.declarationId),
      where('message', '==', message)
    );
  } else if (saveDoc.recipientRole) {
    duplicateQuery = query(
      notificationsCollection,
      where('recipientRole', '==', saveDoc.recipientRole),
      where('declarationId', '==', saveDoc.declarationId),
      where('message', '==', message)
    );
  } else {
    // Fallback: check by declarationId + message
    duplicateQuery = query(
      notificationsCollection,
      where('declarationId', '==', saveDoc.declarationId),
      where('message', '==', message)
    );
  }

  const snapshot = await getDocs(duplicateQuery);
  if (snapshot.empty) {
    return await addDoc(notificationsCollection, saveDoc);
  } else {
    // Notification déjà existante, ne pas créer de doublon
    return null;
  }
};

export const getNotificationsForChauffeur = async (chauffeurId) => {
  const q = query(notificationsCollection, where('chauffeurId', '==', chauffeurId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const markNotificationAsRead = async (notificationId) => {
  const notifRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifRef, { read: true });
};
