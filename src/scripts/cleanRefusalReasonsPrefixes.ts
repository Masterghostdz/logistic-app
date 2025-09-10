// Script de nettoyage des préfixes [EN] et [AR] dans les motifs de refus Firestore
import { getAllRefusalReasons, updateRefusalReason } from '../services/refusalReasonService';

function cleanPrefix(text: string) {
  return text.replace(/^\[EN\]\s*/i, '').replace(/^\[AR\]\s*/i, '');
}

export async function cleanAllRefusalReasonsPrefixes() {
  const reasons = await getAllRefusalReasons();
  for (const reason of reasons) {
    const newEn = cleanPrefix(reason.en);
    const newAr = cleanPrefix(reason.ar);
    if (newEn !== reason.en || newAr !== reason.ar) {
      await updateRefusalReason(reason.id, { en: newEn, ar: newAr });
      console.log(`Motif ${reason.id} nettoyé.`);
    }
  }
  console.log('Nettoyage terminé.');
}

// Pour exécution directe (node --loader ts-node/esm ...)
if (require.main === module) {
  cleanAllRefusalReasonsPrefixes();
}
