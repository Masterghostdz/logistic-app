export const translations = {
  fr: {
    caissier: {
      statsTitle: "Indicateurs des Recouvrements et Paiements",
      viewPaymentTitle: "Consulter le reçu",
      viewPaymentDesc: "Consultation du reçu (lecture seule)",
      createPaymentTitle: "Ajouter un reçu de paiement",
  createPaymentDesc: "Remplissez le formulaire pour ajouter un reçu de paiement.",
  profileTitle: "Profil Caissier",
      paymentsTitle: "Gestion des paiements",
      recouvrementTitle: "Gestion des Recouvrements",
      recentRecouvrements: "Recouvrements récents",
      notReceived: "Non Reçu",
      paymentsValidatedTitle: "Validé",
      // Created for CreateRecouvrementDialog
      createRecouvrement: "Créer un recouvrement",
      emptyDashboard: "Espace Caissier (façade, aucun contenu)",
      recouvrementEmpty: "Section Recouvrement (façade, aucun contenu)",
      tracageEmpty: "Section Traçage (façade, aucun contenu)",
      // Dashboard / stats
      dashboardTitle: "Tableau de bord - Caissier",
  // French labels for Caissier dashboard stats
  paymentsPendingTitle: "Paiements non validés",
  paymentsNoCompanyTitle: "Sans société",
  paymentsStatsTitle: "Indicateurs des paiements",
  recouvrementsTitle: "Indicateurs des recouvrements"
    },
    // Recouvrement specific labels
    recouvrement: {
      noProgramReference: "Pas de référence programme",
      cancel: "Annulation recouvrement",
      return: "Retourner",
      // Notices / toasts used in recouvrement flows
      sent: "Recouvrement envoyé",
      created: "Recouvrement créé",
      revoked: "Recouvrement annulé"
    },
    planificateur: {
      statsTitle: "Indicateurs des déclarations",
      add: "Ajouter",
      paymentsStatsTitle: "Indicateurs des paiements",
      clientsTitle: "Gestion des Clients",
      dashboardTitle: "Tableau de bord - Planificateur",
      recentDeclarations: "Déclarations récentes",
      declarationsTitle: "Gestion des Déclarations",
      warehousesTitle: "Gestion des Entrepôts",
        paymentsTitle: "Gestion des paiements",
      phoneNumbers: "Numéros de téléphone",
      status: "Statut"
    },
    notification: {
      validated: "Déclaration de {ref} est Validée",
      refused: "Déclaration de {ref} est Réfusée",
      default: "Déclaration de {ref}",
      noPaymentReceipts: "Aucun reçu de paiement",
      none: "Aucune notification"
    },
    roles: {
      admin: "Administrateur",
      planificateur: "Planificateur",
      chauffeur: "Chauffeur",
      client: "Client",
      financier: "Financier",
      financier_unite: "Financier Unité",
    caissier: "Caissier",
    },
    buttons: {
      back: "Retour",
      myClients: "Mes clients",
      add: "Ajouter",
      settings: "Paramètres",
      centerMap: "Centrer la carte",
      gps: "GPS",
      screenshot: "Capture d'écran",
      camera: "Caméra",
      saving: "Enregistrement...",
      mapMode: "Mode carte",
      listMode: "Mode liste",
      changeLayer: "Changer le fond de carte",
      viewWarehouses: "Voir la liste des entrepôts",
      createWarehouse: "Créer un nouvel entrepôt"
    },
    common: {
      searchPlaceholder: "Rechercher...",
      filterPlaceholder: "Filtrer...",
      zoom: "Zoom",
      mobile: "Mobile",
      desktop: "Desktop"
    },
    loading: {
      default: "Chargement..."
    },
    filters: {
      all: "Tous"
    },
    camera: {
      error: {
        save: "Erreur lors de l'enregistrement de la photo. Veuillez réessayer."
      }
    },
    admin: {
      fullName: "Nom complet",
      username: "Nom d'utilisateur",
      role: "Rôle",
      lastLogin: "Connexion",
      phone: "Téléphone",
      password: "Mot de passe",
      actions: "Actions"
    },
    companies: {
      name: "Société",
      company: "Société",
      address: "Adresse",
      phone: "Téléphone",
      email: "Email",
      actions: "Actions",
      select: "Sélectionner une société"
    },
    payments: {
      sendReceipts: "Envoyer des reçus",
      sendDialogDescription: "Envoyer des reçus de paiement",
      send: "Envoyer",
      validate: "Valider",
      received: "Reçu",
      markReceived: "Marquer comme reçu",
      confirmDeleteReceipt: "Confirmez-vous la suppression de ce reçu ?",
      undo: "Annuler",
      // added keys for recouvrement flows
      deleted: "Reçu supprimé",
      validated: "Reçu validé"
    },
      payment: {
        errors: {
          saveFailed: "Erreur lors de l'enregistrement du reçu",
          noPhoto: "Photo du reçu requise",
          programRequired: "Référence programme requise"
        }
      },
      
    vehicleTypes: {
      name: "Nom",
      primeKilometrique: "Prime kilométrique",
      actions: "Actions"
    },
    tabs: {
  dashboard: "Tableau de bord",
  recouvrement: "Recouvrement",
  payment: "Paiement",
  declarations: "Déclarations",
  tracage: "Traçage",
  warehouses: "Entrepôts",
  clients: "Clients",
      chauffeurs: "Chauffeurs"
    },
    header: {
      title: "Logigrine",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      welcome: "Welcome"
    },
    // Navigation
    // Authentication
    auth: {
      login: "Connexion",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      loginButton: "Se connecter",
      invalidCredentials: "Identifiants invalides",
      loggingIn: "Connexion en cours...",
      welcome: "Bienvenue sur Logigrine",
      subtitle: "Système de gestion logistique",
      demoAccounts: "Comptes de démonstration :",
      demoNote: "Note : Ces mots de passe sont sécurisés et hachés côté serveur",
      detectedMode: "Mode détecté :"
    },
    // Login status band
    login: {
      connected: "Vous êtes connecté",
      connecting: "Connexion au serveur",
      notConnected: "Non connecté au serveur",
      offline: "Hors ligne"
    },
    // Dashboard
    dashboard: {
    clickToFilter: "Cliquez pour filtrer",
    breakdownDetected: "Déclarations en panne détectées",
      selectRefusalReason: "Sélectionner un motif de refus",
      selectReasonPlaceholder: "Choisir un motif...",
  overview: "Vue d'ensemble",
  statistics: "Statistiques",
  recentActivity: "Activité récente",
  totalDeclarations: "Total déclarations",
  pendingValidations: "Validations en attente",
  totalChauffeurs: "Total chauffeurs",
  totalWarehouses: "Total entrepôts",
  monthlyStats: "Statistiques mensuelles",
  chauffeurTitle: "Tableau de bord - Chauffeur",
  newDeclaration: "Nouvelle Déclaration",
  createNewDeclaration: "Créer une nouvelle déclaration",
  myDeclarationsSummary: "Résumé de mes Déclarations",
  myDeclarations: "Mes Déclarations",
  warehouseMap: "Carte des Entrepôts",
  onRoad: "En route",
  pending: "En attente",
  validated: "Validé",
  refused: "Refusé",
  online: "En ligne",
  offline: "Hors ligne"
    ,
  breakdown: "En panne"
    },
    // Declarations
  declarations: {
      confirmCancelTitle: "Confirmer l’annulation",
      history: "Historique de la déclaration",
      view: "Consulter la déclaration",
      confirmCancelDescription: "Êtes-vous sûr de vouloir annuler la création de cette déclaration ? Les informations saisies seront perdues.",
      confirmDeleteTitle: "Confirmer la suppression",
      confirmDeleteDescription: "Êtes-vous sûr de vouloir supprimer cette déclaration ? Cette action est irréversible.",
      paymentReceipts: "Reçus de paiement (photos)",
      noPaymentReceipts: "Aucun reçu de paiement",
  noReceiptsAdded: "Aucun reçu ajouté",
    synchronized: "Synchronisé",
    programNumber: "Numéro de programme",
      // recouvrement helpers
      savedMessage: "Déclaration enregistrée",
      recoveredMessage: "Déclaration marquée comme recouvrée",
      // Table headers & labels
      number: "Numéro",
      chauffeur: "Chauffeur",
      chauffeurName: "Nom du chauffeur",
      date: "Date",
      createdDate: "Date de création",
      validated: "Validé",
    distance: "Distance (km)",
    deliveryFees: "Frais de livraison (DZD)",
  primeDeRoute: "Prime de route (DZD)",
    // Recouvrement / payments headers
    payments: "Paiements",
    recoveredAmount: "Montant Recouvré",
    recovered: "Recouvré",
    notRecovered: "Non Recouvré",
      notes: "Notes",
      photos: "Photos justificatives",
      status: "Statut",
      actions: "Actions",
      edit: "Modifier",
      delete: "Supprimer",
      validate: "Valider",
      refuse: "Refuser",
      refused: "Refusé",
      searchPlaceholder: "Rechercher par numéro, notes...",
      filterPlaceholder: "Filtrer par statut",
      noDeclarations: "Aucune déclaration trouvée",
      noDeclarationsWithFilters: "Aucune déclaration trouvée avec ces critères",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cette déclaration ?",
      programNumberRequired: "Le numéro de programme doit contenir 4 chiffres",
      distanceOrFeesRequired: "Veuillez renseigner soit la distance soit les frais de livraison",
      referenceAlreadyExists: "Une déclaration avec cette référence existe déjà pour ce chauffeur.",
      breakdownConfirm: "Êtes-vous sûr de vouloir signaler une panne pour cette déclaration ? Cette action est irréversible.",
      breakdownSuccess: "Déclaration signalée en panne."
    },
  en: {
    caissier: {
      statsTitle: "Collections and payments summary",
      recouvrementsTitle: "Collections indicators",
      recentRecouvrements: "Recent collections",
      paymentsStatsTitle: "Payments indicators",
      paymentsNoCompanyTitle: "No company",
      dashboardTitle: "Cashier Dashboard",
      notReceived: "Not received",
      paymentsValidatedTitle: "Validated",
      createPaymentTitle: "Add payment receipt",
      createPaymentDesc: "Fill the form to add a payment receipt.",
      viewPaymentTitle: "View receipt",
      viewPaymentDesc: "Receipt consultation (read-only)",
      paymentsTitle: "Payments management",
      recouvrementTitle: "Collections management",
      emptyDashboard: "Cashier area (placeholder, no content)",
      recouvrementEmpty: "Collection section (placeholder, no content)",
      tracageEmpty: "Trace section (placeholder, no content)"
    },
    planificateur: {
      add: "Add",
      statsTitle: "Declarations summary",
      paymentsStatsTitle: "Payments summary",
      clientsTitle: "Clients Management",
      dashboardTitle: "Planner Dashboard",
      recentDeclarations: "Recent Declarations",
      declarationsTitle: "Declarations Management",
      warehousesTitle: "Warehouses Management",
    },
    buttons: {
      back: "Back"
    },
    profile: {
      title: "My Profile",
      personalInfo: "Personal Information",
      contactAndVehicle: "Contact & Vehicle",
      notProvided: "Not provided",
      userNotFound: "User not found",
      securityTitle: "Security",
      securityDescription: "Change your password to secure your account",
      changePassword: "Change password"
    },
    forms: {
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password"
    },
    tabs: {
      tracage: "Tracking"
    },
  },
  ar: {
    // planificateur moved to final `ar` block to avoid duplication
    planificateur: {
      add: "إضافة",
      paymentsStatsTitle: "ملخص المدفوعات",
      paymentsTitle: "إدارة المدفوعات",
    },
    roles: {
      admin: "مسؤول",
      planificateur: "مخطط",
      chauffeur: "سائق",
      financier: "المالي",
      financier_unite: "مالي الوحدة",
      client: "عميل"
    },
    // Caissier translations (cashier dashboard / stats)
    caissier: {
      statsTitle: "مؤشرات التحصيلات والمدفوعات",
      dashboardTitle: "لوحة القيادة - أمين الصندوق",
      recouvrementsTitle: "مؤشرات التحصيلات",
      recentRecouvrements: "التحصيلات الأخيرة",
      paymentsPendingTitle: "حالات المدفوعات غير المعتمدة",
      paymentsNoCompanyTitle: "بدون شركة",
      paymentsStatsTitle: "ملخص المدفوعات",
      notReceived: "غير مستلم",
      paymentsValidatedTitle: "معتمد",
      paymentsTitle: "إدارة المدفوعات"
    },
    profile: {
      title: "الملف الشخصي",
      personalInfo: "المعلومات الشخصية",
      contactAndVehicle: "جهات الاتصال والمركبة",
      notProvided: "غير متوفر",
      userNotFound: "المستخدم غير موجود",
      securityTitle: "الأمان",
      securityDescription: "قم بتغيير كلمة المرور الخاصة بك لتأمين حسابك",
      changePassword: "تغيير كلمة المرور"
    },
    forms: {
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور",
      cancel: "إلغاء",
      confirm: "تأكيد"
    },
    // Recouvrement labels (Arabic)
    recouvrement: {
      noProgramReference: "بدون مرجع البرنامج",
      // Notices / toasts used in recouvrement flows
      sent: "تم إرسال التحصيل",
      created: "تم إنشاء التحصيل",
  revoked: "تم إلغاء التحصيل",
      cancel: "إلغاء التحصيل",
      return: "إرجاع"
    },
    common: {
      searchPlaceholder: "ابحث...",
      filterPlaceholder: "تصفية...",
      zoom: "تكبير"
    },
    loading: {
      default: "جارٍ التحميل..."
    },
    filters: {
      all: "الكل"
    },
    camera: {
      error: {
        save: "حدث خطأ أثناء حفظ الصورة. يرجى المحاولة مرة أخرى."
      }
    },
    buttons: {
      myClients: "عملائي",
      add: "إضافة",
      settings: "الإعدادات",
      centerMap: "توسيع الخريطة",
      gps: "نظام تحديد المواقع",
      screenshot: "لقطة شاشة",
      mapMode: "وضع الخريطة",
      listMode: "وضع القائمة",
      changeLayer: "تغيير خلفية الخريطة",
      viewWarehouses: "عرض قائمة المستودعات",
      createWarehouse: "إنشاء مستودع جديد"
    },
    tabs: {
  dashboard: "لوحة القيادة",
  recouvrement: "التحصيل",
  payment: "الدفع",
  declarations: "التصريحات",
  tracage: "تتبع",
  warehouses: "المستودعات",
  clients: "العملاء",
      chauffeurs: "السائقين"
    },
  declarations: {
      confirmCancelTitle: "تأكيد الإلغاء",
      confirmCancelDescription: "هل أنت متأكد أنك تريد إلغاء إنشاء هذا التصريح؟ سيتم فقدان المعلومات المدخلة.",
      confirmDeleteTitle: "تأكيد الحذف",
  confirmDeleteDescription: "هل أنت متأكد أنك تريد حذف هذا التصريح؟ هذا الإجراء لا يمكن التراجع عنه.",
  paymentReceipts: "إيصالات الدفع (صور)",
  noPaymentReceipts: "لا يوجد إيصال دفع",
      noReceiptsAdded: "لم يتم إضافة إيصال",
        synchronized: "تم المزامنة",
  primeDeRoute: "منحة الطريق (دج)",
      // ...existing keys...
    },
        // tabs property moved to root of language object
      status: "Statut",
      actions: "Actions",
      edit: "Modifier",
      delete: "Supprimer",
      validate: "Valider",
      refuse: "Refuser",
    declare: "Déclarer",
  pending: "En attente",
  validated: "Validé",
  refused: "Refusé",
  onRoad: "En route",
  breakdown: "En panne",
  breakdownButton: "Signaler une panne",
      createdDate: "Date création",
      searchPlaceholder: "Rechercher par numéro, notes...",
      filterPlaceholder: "Filtrer par statut",
      noDeclarations: "Aucune déclaration trouvée",
      noDeclarationsWithFilters: "Aucune déclaration trouvée avec ces critères",
  confirmDelete: "Êtes-vous sûr de vouloir supprimer cette déclaration ?",
  programNumberRequired: "Le numéro de programme doit contenir 4 chiffres",
  distanceOrFeesRequired: "Veuillez renseigner soit la distance soit les frais de livraison",
  referenceAlreadyExists: "Une déclaration avec cette référence existe déjà pour ce chauffeur.",
  breakdownConfirm: "Êtes-vous sûr de vouloir signaler une panne pour cette déclaration ? Cette action est irréversible.",
  breakdownSuccess: "Déclaration signalée en panne."
    },
    // Chauffeurs
    chauffeurs: {
  title: "Gestion des chauffeurs",
  add: "Ajouter",
  new: "Nouveau chauffeur",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      vehicleType: "Type de véhicule",
      employeeType: "Type d'employé",
      employeeTypeShort: {
        interne: "Int.",
        externe: "Ext."
      },
      fullName: "Nom complet",
      username: "Nom d'utilisateur",
      position: "Position",
      gps: "GPS",
      enPanne: "En Panne",
      internal: "Interne",
      external: "Externe",
  active: "Actif",
  inactive: "Inactif",
  connexion: "Connexion",
  // used by autocomplete placeholder and other components
  search: "Rechercher par nom ou téléphone...",
  searchPlaceholder: "Rechercher par nom ou téléphone...",
  select: "Sélectionner un chauffeur",
      filterPlaceholder: "Filtrer...",
      columnNumber: "Numéro",
      columnChauffeur: "Chauffeur",
      deleteTitle: "Confirmer la suppression",
      deleteDesc: "Êtes-vous sûr de vouloir supprimer ce chauffeur ? Cette action est irréversible.",
      cancel: "Annuler",
      delete: "Supprimer",
      gpsEnabled: "GPS activé",
      gpsDisabled: "GPS désactivé",
      tpPrefix: "TP - "
      ,
      actions: "Actions",
      status: "Statut"
    },
    // Warehouses
    warehouses: {
      title: "Gestion des entrepôts",
      new: "Nouvel entrepôt",
      name: "Nom",
      company: "Société",
      phone: "Téléphone",
      address: "Adresse",
      active: "Actif",
      inactive: "Inactif",
      status: "Statut",
      actions: "Actions",
      coordinates: "Coordonnées GPS",
      latitude: "Latitude",
      longitude: "Longitude",
      map: "Carte des entrepôts",
      searchPlaceholder: "Rechercher par nom ou ville...",
      filterPlaceholder: "Filtrer..."
    },
    // Financial
    financial: {
      title: "Gestion financière",
      new: "Nouvel enregistrement",
      remboursement: "Remboursement",
      reglement: "Règlement",
  programReference: "Référence programme",
  programNumber: "Numéro de programme",
      destinationUnit: "Unité de destination",
      amount: "Montant (DZD)",
      description: "Description",
      pending: "En attente",
      processed: "Traité",
      cph_nord: "CPH Nord",
      cph_sud: "CPH Sud",
      cph_est: "CPH Est",
      cph_ouest: "CPH Ouest",
      cph_centre: "CPH Centre"
      ,
      save: "Enregistrer"
    },
    // Forms
    forms: {
      notes: "Notes",
      myClients: "Mes clients",
      selectPlaceholder: "Sélectionner un type",
      add: "Ajouter",
      replacePhotoConfirm: "Voulez-vous remplacer la photo existante ?",
      save: "Enregistrer",
  cancel: "Annuler",
  close: "Fermer",
      edit: "Modifier",
      delete: "Supprimer",
      confirm: "Confirmer",
      yes: "Oui",
      no: "Non",
      required: "Champ requis",
      success: "Opération réussie",
      error: "Erreur lors de l'opération",
  name: "Nom",
  firstName: "Prénom",
  mobile: "Téléphone mobile",
      phonePlaceholder: "Numéro de téléphone",
    amount: "Montant",
    saving: "Enregistrement...",
      // generic form placeholders
  phoneIndexedPlaceholder: "Téléphone {index}",
  latitude: "Latitude",
  longitude: "Longitude",
  photo: "Photo",
  import: "Importer",
      geolocation: "Position géographique",
      address: "Adresse",
      addressPlaceholder: "Adresse du client",
      passwordMasked: "Mot de passe masqué"
      ,
      actions: "Actions",
      password: "Mot de passe"
      ,
      // helpers used by payment dialogs
      traceability: "Historique",
      creator: "Créateur"
    },
    // New form strings used by deletion & traceability UI (French)
    forms_extra: {
      cannotDeleteValidated: "Impossible de supprimer un reçu validé",
      unauthorized: "Non autorisé",
      deleteFailed: "Suppression échouée",
      traceability: "Historique",
      creator: "Créateur"
    },
    clients: {
      name: "Nom",
      searchPlaceholder: "Rechercher par nom...",
      creator: "Créateur",
      status: "Statut",
      actions: "Actions",
      viewOnMap: "Voir sur la carte",
      validate: "Valider"
    },
    profile: {
      title: "Mon Profil",
      personalInfo: "Informations personnelles",
      contactAndVehicle: "Contact & Véhicule",
      notProvided: "Non renseigné",
      userNotFound: "Utilisateur non trouvé"
      ,
      securityTitle: "Sécurité",
      securityDescription: "Modifiez votre mot de passe pour sécuriser votre compte",
      changePassword: "Changer le mot de passe"
    },
    // buttons already defined earlier in this language block; avoid duplicate
    // Settings
    settings: {
      title: "Paramètres",
      description: "Personnalisez votre expérience utilisateur et le mode d'affichage.",
    viewMode: "Mode d'affichage",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    language: "Langue",
  mini_vehicule: "Mini véhicule",
  fourgon: "Fourgon",
    camion_2_5t: "Camion 2.5T",
      camion_3_5t: "Camion 3.5T",
      camion_5t: "Camion 5T",
      camion_7_5t: "Camion 7.5T",
      camion_10t: "Camion 10T",
      camion_15t: "Camion 15T",
      camion_20t: "Camion 20T"
    },
    // Traceability
    traceability: {
      created: "Déclaration Créée",
      modified: "Déclaration Modifiée",
      validated: "Déclaration Validée",
      createdDraft: "Déclaration brouillon créée",
      sentReceipts: "Reçus envoyés",
      revokedRecouvrement: "Annulation recouvrement",
      refused: "Déclaration Refusée",
      declared: "Déclaration Envoyée",
      breakdown: "Un panne Signalée",
      paymentReceiptCreated: "Reçu de paiement créé",
      clientHistory: "Historique du client",
      clientCreated: "Client créé",
      clientModified: "Client modifié",
      clientValidated: "Client validé",
      clientRejected: "Client rejeté",
      clientArchived: "Client archivé",
      unknownUser: "Utilisateur inconnu",
      none: "Aucune trace"
    },
    tracage: {
      title: "Traçage"
    }
  },
  en: {
    caissier: {
      statsTitle: "Collections and payments summary",
      recouvrementsTitle: "Collections indicators",
      recentRecouvrements: "Recent collections",
      paymentsStatsTitle: "Payments indicators",
      paymentsNoCompanyTitle: "No company",
      dashboardTitle: "Cashier Dashboard",
      notReceived: "Not received",
      paymentsValidatedTitle: "Validated",
      createPaymentTitle: "Add payment receipt",
      createPaymentDesc: "Fill the form to add a payment receipt.",
      viewPaymentTitle: "View receipt",
      viewPaymentDesc: "Receipt consultation (read-only)",
      paymentsTitle: "Payments management",
      recouvrementTitle: "Collections management",
      emptyDashboard: "Cashier area (placeholder, no content)",
      recouvrementEmpty: "Collection section (placeholder, no content)",
      tracageEmpty: "Trace section (placeholder, no content)"
    },
    // Recouvrement labels (English)
    recouvrement: {
      noProgramReference: "No program reference",
      cancel: "Revoke collection",
      return: "Return",
      // Notices / toasts used in collection flows
      sent: "Collection sent",
      created: "Collection created",
      revoked: "Collection revoked"
    },
    payments: {
      sendReceipts: "Send receipts",
      sendDialogDescription: "Send payment receipts",
      send: "Send",
      validate: "Validate",
      confirmDeleteReceipt: "Confirm deletion of this receipt?",
      confirmDeleteTitle: "Delete receipt",
      undo: "Undo",
      deleted: "Receipt deleted",
      validated: "Receipt validated",
    },
    roles: {
      admin: "Administrator",
      planificateur: "Planner",
      chauffeur: "Driver",
      financier: "Financial",
      financier_unite: "Unit Financial",
      client: "Client",
    caissier: "Cashier",
    },
    common: {
      searchPlaceholder: "Search...",
      filterPlaceholder: "Filter..."
    ,  zoom: "Zoom"
    },
    loading: {
      default: "Loading..."
    },
    filters: {
      all: "All"
    },
    camera: {
      error: {
        save: "Error saving photo. Please try again."
      }
    },
    buttons: {
      myClients: "My Clients",
      add: "Add",
      settings: "Settings",
      centerMap: "Center map",
      gps: "GPS",
      screenshot: "Screenshot",
      mapMode: "Map mode",
      listMode: "List mode",
      changeLayer: "Change layer",
      viewWarehouses: "View warehouses",
      createWarehouse: "Create warehouse"
    },
    planificateur: {
      add: "Add",
      statsTitle: "Declarations indicators",
      clientsTitle: "Clients Management",
      dashboardTitle: "Planner Dashboard",
      recentDeclarations: "Recent Declarations",
      declarationsTitle: "Declarations Management",
      warehousesTitle: "Warehouses Management",
      paymentsStatsTitle: "Payments summary"
    },
    // planificateur duplicate removed
    header: {
      profile: "Profile",
      settings: "Settings",
      logout: "Logout"
    },
    // settings duplicate removed
    // planificateur duplicate removed
    // Navigation
    nav: {
      dashboard: "Dashboard",
      declarations: "Declarations",
      chauffeurs: "Drivers",
      payment: {
        errors: {
          saveFailed: "Failed to save receipt",
          noPhoto: "Receipt photo required",
          programRequired: "Program reference required"
        }
      },
      warehouses: "Warehouses",
      financial: "Financial",
      users: "Users",
  // settings key removed (duplicate)
    },
    // Authentication
    auth: {
      login: "Login",
      username: "Username",
      password: "Password",
      loginButton: "Sign In",
      invalidCredentials: "Invalid credentials",
      welcome: "Welcome to Logigrine",
      subtitle: "Logistics Management System",
      loggingIn: "Logging in...",
      demoAccounts: "Demo accounts:",
      demoNote: "Note: These passwords are securely hashed on the server",
      detectedMode: "Detected mode:"
    },
    // Admin table headers
    admin: {
      fullName: "Full Name",
      username: "Username",
      role: "Role",
      lastLogin: "Last Login",
      phone: "Phone",
      password: "Password",
      actions: "Actions"
    },
    companies: {
      name: "Name",
      company: "Company",
      address: "Address",
      phone: "Phone",
      email: "Email",
      actions: "Actions",
      select: "Select a company"
    },
    vehicleTypes: {
      name: "Name",
      primeKilometrique: "Kilometric allowance",
      actions: "Actions"
    },
    // Login status band
    login: {
      connected: "You are connected",
      connecting: "Connecting to server...",
      notConnected: "Not connected to server",
      offline: "Offline"
    },
    // Dashboard
    dashboard: {
      selectRefusalReason: "Select a refusal reason",
      selectReasonPlaceholder: "Choose a reason...",
  overview: "Overview",
  statistics: "Statistics",
  recentActivity: "Recent Activity",
  totalDeclarations: "Total Declarations",
  pendingValidations: "Pending Validations",
  totalChauffeurs: "Total Drivers",
  totalWarehouses: "Total Warehouses",
  monthlyStats: "Monthly Statistics",
  chauffeurTitle: "Driver Dashboard",
  newDeclaration: "New Declaration",
  createNewDeclaration: "Create a new declaration",
  myDeclarationsSummary: "My Declarations Summary",
  myDeclarations: "My Declarations",
  warehouseMap: "Warehouse Map",
  onRoad: "On Road",
  pending: "Pending",
  validated: "Validated",
  refused: "Refused",
  online: "Online",
  offline: "Offline"
    },
    // Declarations
    declarations: {
      title: "My Declarations",
      history: "Declaration history",
      view: "View declaration",
      new: "New Declaration",
      chauffeur: "Driver",
      number: "Number",
      date: "Date",
      distance: "Distance (km)",
  deliveryFees: "Delivery Fees (DZD)",
  primeDeRoute: "Route Allowance (DZD)",
    // Recouvrement / payments headers
    payments: "Payments",
    recoveredAmount: "Recovered Amount",
    recovered: "Recovered",
    notRecovered: "Not Recovered",
      paymentReceipts: "Payment receipts (photos)",
    noReceiptsAdded: "No receipts added",
    synchronized: "Synchronized",
      programNumber: "Program Number",
  // recouvrement helpers
  savedMessage: "Declaration saved",
  recoveredMessage: "Declaration marked as recovered",
      notes: "Notes",
      photos: "Supporting Photos",
      status: "Status",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      validate: "Validate",
      refuse: "Refuse",
    declare: "Declare",
  pending: "Pending",
  validated: "Validated",
  refused: "Refused",
  onRoad: "On Road",
  breakdown: "Breakdown",
  breakdownButton: "Report breakdown",
      createdDate: "Created Date",
      searchPlaceholder: "Search by number, notes...",
  chauffeurName: "Driver Name",
      filterPlaceholder: "Filter by status",
      noDeclarations: "No declarations found",
      noDeclarationsWithFilters: "No declarations found with these criteria",
  confirmDelete: "Are you sure you want to delete this declaration?",
  programNumberRequired: "Program number must contain 4 digits",
  distanceOrFeesRequired: "Please enter either distance or delivery fees",
  referenceAlreadyExists: "A declaration with this reference already exists for this driver.",
  breakdownConfirm: "Are you sure you want to mark this declaration as breakdown? This action is irreversible.",
  breakdownSuccess: "Declaration marked as breakdown."
    },
    // Chauffeurs
    chauffeurs: {
  title: "Driver Management",
  add: "Add",
  new: "New Driver",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      vehicleType: "Vehicle Type",
      employeeType: "Employee Type",
      employeeTypeShort: {
        interne: "Int.",
        externe: "Ext."
      },
      fullName: "Full Name",
      username: "Username",
      position: "Position",
      gps: "GPS",
      enPanne: "Breakdown",
      internal: "Internal",
      external: "External",
  active: "Active",
  inactive: "Inactive",
  connexion: "Connection",
  // used by autocomplete placeholder and other components
  search: "Search by name or phone...",
  searchPlaceholder: "Search by name or phone...",
  select: "Select a driver",
      filterPlaceholder: "Filter...",
      columnNumber: "Number",
      columnChauffeur: "Driver",
      deleteTitle: "Confirm deletion",
      deleteDesc: "Are you sure you want to delete this driver? This action is irreversible.",
      cancel: "Cancel",
      delete: "Delete",
      gpsEnabled: "GPS enabled",
      gpsDisabled: "GPS disabled",
      tpPrefix: "TP - "
      ,
      actions: "Actions",
      status: "Status"
    },
    // Warehouses
    warehouses: {
      title: "Warehouse Management",
      new: "New Warehouse",
      name: "Name",
      company: "Company",
      phone: "Phone",
      address: "Address",
      active: "Active",
      inactive: "Inactive",
      status: "Status",
      actions: "Actions",
      coordinates: "GPS Coordinates",
      latitude: "Latitude",
      longitude: "Longitude",
      map: "Warehouse Map",
      searchPlaceholder: "Search by name or city...",
      filterPlaceholder: "Filter..."
    },
    // Financial
    financial: {
      title: "Financial Management",
      new: "New Record",
      remboursement: "Reimbursement",
      reglement: "Settlement",
      programNumber: "Program Number",
      destinationUnit: "Destination Unit",
      amount: "Amount (DZD)",
      description: "Description",
      pending: "Pending",
      processed: "Processed",
      cph_nord: "CPH North",
      cph_sud: "CPH South",
      cph_est: "CPH East",
      cph_ouest: "CPH West",
      cph_centre: "CPH Center"
      ,
      save: "Save"
    },
    // Forms
    forms: {
      notes: "Notes",
      myClients: "My Clients",
      selectPlaceholder: "Select a type",
      add: "Add",
      replacePhotoConfirm: "Do you want to replace the existing photo?",
      save: "Save",
  cancel: "Cancel",
  close: "Close",
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      required: "Required field",
      success: "Operation successful",
      error: "Operation error",
  name: "Name",
  firstName: "First Name",
  mobile: "Mobile phone",
  phonePlaceholder: "Phone number",
    amount: "Amount",
    saving: "Saving...",
  // generic form placeholders
  phoneIndexedPlaceholder: "Phone {index}",
  latitude: "Latitude",
  longitude: "Longitude",
  photo: "Photo",
      geolocation: "Geolocation",
      address: "Address",
      addressPlaceholder: "Client address",
      passwordMasked: "Password masked"
      ,
      actions: "Actions",
      password: "Password"
    ,
    // helpers used by payment dialogs
    traceability: "Traceability",
    creator: "Creator"
    },
    // New form strings used by deletion & traceability UI (English)
    forms_extra: {
      cannotDeleteValidated: "Cannot delete a validated receipt",
      unauthorized: "Unauthorized",
      deleteFailed: "Delete failed",
      traceability: "Traceability",
      creator: "Creator"
    },
    clients: {
      name: "Name",
      creator: "Creator",
      status: "Status",
      actions: "Actions",
      viewOnMap: "View on map",
      validate: "Validate"
    },
    profile: {
      title: "My Profile",
      personalInfo: "Personal Information",
      contactAndVehicle: "Contact & Vehicle",
      notProvided: "Not provided",
      userNotFound: "User not found"
    },
    // Settings
    settings: {
      title: "Settings",
      description: "Customize your user experience and display mode.",
      viewMode: "Display mode",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
  confirmPassword: "Confirm Password",
    },
    tabs: {
  dashboard: "Dashboard",
  recouvrement: "Collection",
  payment: "Payment",
  declarations: "Declarations",
  tracage: "Tracking",
  warehouses: "Warehouses",
  clients: "Clients",
      chauffeurs: "Drivers"
    },
    // Vehicle types
    vehicles: {
      mini_vehicule: "Mini Vehicle",
      fourgon: "Van",
      camion_2_5t: "2.5T Truck",
      camion_3_5t: "3.5T Truck",
      camion_5t: "5T Truck",
      camion_7_5t: "7.5T Truck",
      camion_10t: "10T Truck",
      camion_15t: "15T Truck",
      camion_20t: "20T Truck"
    },
    // Traceability
    traceability: {
      created: "Declare Created",
      modified: "Declare Modified",
      validated: "Declare Validated",
      sentReceipts: "Receipts sent",
      revokedRecouvrement: "Revoked collection",
      refused: "Declare Refused",
      declared: "Declare sent",
      breakdown: "Reported as breakdown",
      paymentReceiptCreated: "Payment receipt created",
      clientHistory: "Client history",
      clientCreated: "Client created",
      clientModified: "Client modified",
      clientValidated: "Client validated",
      clientRejected: "Client rejected",
      clientArchived: "Client archived",
      unknownUser: "Unknown user"
      ,
      none: "No trace"
    },
    tracage: {
      title: "Tracking"
    }
  },
  ar: {
    // common UI strings (search/filter/zoom) — ensure present in final AR block
    common: {
      searchPlaceholder: "ابحث...",
      filterPlaceholder: "تصفية...",
      zoom: "تكبير"
    },
    filters: {
      all: "الكل"
    },
    camera: {
      error: {
        save: "حدث خطأ أثناء حفظ الصورة. يرجى المحاولة مرة أخرى."
      }
    },
    caissier: {
      payment: {
        errors: {
          saveFailed: "فشل في حفظ الإيصال",
          noPhoto: "صورة الإيصال مطلوبة",
          programRequired: "مرجع البرنامج مطلوب"
        }
      },
      viewPaymentTitle: "عرض الإيصال",
      viewPaymentDesc: "استعراض الإيصال (للقراءة فقط)",
      createPaymentTitle: "إضافة إيصال دفع",
      createPaymentDesc: "املأ النموذج لإضافة إيصال دفع.",
      profileTitle: "ملف أمين الصندوق",
      
      recouvrementTitle: "إدارة التحصيل",
      recentRecouvrements: "التحصيلات الأخيرة",
      emptyDashboard: "مساحة أمين الصندوق (نموذج، لا يوجد محتوى)",
      recouvrementEmpty: "قسم التحصيل (نموذج، لا يوجد محتوى)",
      tracageEmpty: "قسم التتبع (نموذج، لا يوجد محتوى)",
      // Dashboard / stats
      dashboardTitle: "لوحة القيادة - أمين الصندوق",
      recouvrementsTitle: "مؤشرات التحصيلات",
      paymentsPendingTitle: "المدفوعات غير المعتمدة",
      paymentsNoCompanyTitle: "بدون شركة",
      paymentsStatsTitle: "ملخص المدفوعات",
      notReceived: "غير مستلم",
      paymentsValidatedTitle: "معتمد",
      paymentsTitle: "إدارة المدفوعات"
    },
    // Recouvrement labels (Arabic)
    recouvrement: {
      noProgramReference: "بدون مرجع البرنامج",
      // Notices / toasts used in recouvrement flows
      sent: "تم إرسال التحصيل",
      created: "تم إنشاء التحصيل",
  revoked: "تم إلغاء التحصيل",
      cancel: "إلغاء التحصيل",
      return: "إرجاع"
    },
    roles: {
      admin: "مسؤول",
      planificateur: "مخطط",
      chauffeur: "سائق",
      financier: "المالي",
      financier_unite: "مالي الوحدة",
    client: "عميل",
    caissier: "أمين الصندوق",
    },
    tabs: {
      dashboard: "لوحة القيادة",
      recouvrement: "التحصيل",
      payment: "الدفع",
      declarations: "التصريحات",
      tracage: "تتبع",
      warehouses: "المستودعات",
      clients: "العملاء",
      chauffeurs: "السائقين"
    },
    // Planificateur translations (moved/merged here so final `ar` block contains them)
    planificateur: {
      clientsTitle: "إدارة العملاء",
      dashboardTitle: "لوحة تحكم المخطط",
      recentDeclarations: "التصريحات الحديثة",
      declarationsTitle: "إدارة التصريحات",
      warehousesTitle: "إدارة المستودعات",
      add: "إضافة",
      statsTitle: "مؤشرات التصريحات",
      company: "الشركة",
      phoneNumbers: "أرقام الهاتف",
      status: "الحالة",
      paymentsStatsTitle: "ملخص المدفوعات",
      paymentsTitle: "إدارة المدفوعات",
    },
    // Header
    header: {
      title: "لوجيجرين",
      profile: "الملف الشخصي",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      welcome: "مرحبا"
    },
    // Navigation
    nav: {
      dashboard: "لوحة التحكم",
      declarations: "التصريحات",
      chauffeurs: "السائقين",
      warehouses: "المستودعات",
      financial: "المالية",
      users: "المستخدمين",
  // settings key removed (duplicate)
    },
    // Authentication
    auth: {
      login: "تسجيل الدخول",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      loginButton: "دخول",
      invalidCredentials: "بيانات اعتماد غير صحيحة",
      welcome: "مرحبا بك في لوجيجرين",
      subtitle: "نظام إدارة اللوجستيات",
      loggingIn: "تسجيل الدخول...",
      demoAccounts: "حسابات تجريبية:",
      demoNote: "ملاحظة: هذه كلمات المرور مؤمنة ومشفرة على الخادم",
      detectedMode: "الوضع المكتشف:"
    },
    // Admin table headers
    admin: {
      fullName: "الاسم الكامل",
      username: "اسم المستخدم",
      role: "الدور",
      lastLogin: "آخر اتصال",
      phone: "الهاتف",
      password: "كلمة المرور",
      actions: "الإجراءات"
    },
      companies: {
        name: "الاسم",
        company: "الشركة",
        address: "العنوان",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        actions: "الإجراءات",
        select: "اختر شركة"
      },
      vehicleTypes: {
        name: "الاسم",
        primeKilometrique: "علاوة المسافة",
        actions: "الإجراءات"
      },
    // Login status band
    login: {
      connected: "أنت متصل",
      connecting: "جارٍ الاتصال بخادم",
      notConnected: "غير متصل بخادم",
      offline: "غير متصل بالإنترنت"
    },
    // Dashboard
    dashboard: {
      selectRefusalReason: "اختر سبب الرفض",
      selectReasonPlaceholder: "اختر السبب...",
  overview: "نظرة عامة",
  statistics: "الإحصائيات",
  recentActivity: "النشاط الأخير",
  totalDeclarations: "إجمالي التصريحات",
  pendingValidations: "التحقق المعلق",
  totalChauffeurs: "إجمالي السائقين",
  totalWarehouses: "إجمالي المستودعات",
  monthlyStats: "الإحصائيات الشهرية",
  chauffeurTitle: "لوحة تحكم السائق",
  newDeclaration: "تصريح جديد",
  createNewDeclaration: "إنشاء تصريح جديد",
  myDeclarationsSummary: "ملخص تصريحاتي",
  myDeclarations: "تصريحاتي",
  warehouseMap: "خريطة المستودعات",
  onRoad: "في الطريق",
  pending: "معلق",
  validated: "مؤكد",
  refused: "مرفوض",
  online: "متصل",
  offline: "غير متصل"
    },
    // Declarations
    declarations: {
      title: "تصريحاتي",
      new: "تصريح جديد",
      chauffeur: "سائق",
      number: "الرقم",
      date: "التاريخ",
      distance: "المسافة (كم)",
      deliveryFees: "رسوم التسليم (دج)",
      primeDeRoute: "منحة الطريق (دج)",
        // Recouvrement / payments headers
        payments: "المدفوعات",
        recoveredAmount: "المبلغ المحصل",
        recovered: "محصل",
        notRecovered: "غير محصل",
      notes: "ملاحظات",
      photos: "الصور المبررة",
      status: "الحالة",
      actions: "الإجراءات",
      edit: "تعديل",
      delete: "حذف",
      validate: "تأكيد",
      refuse: "رفض",
  paymentReceipts: "إيصالات الدفع (صور)",
  noReceiptsAdded: "لم يتم إضافة إيصال",
  programNumber: "رقم البرنامج",
    // recouvrement helpers
    savedMessage: "تم حفظ التصريح",
    recoveredMessage: "تم وضع التصريح كمحصل",
    declare: "تصريح",
  pending: "معلق",
  validated: "مؤكد",
  refused: "مرفوض",
  onRoad: "في الطريق",
  breakdown: "عطل تقني",
  breakdownButton: "الإبلاغ عن عطل تقني",
      createdDate: "تاريخ الإنشاء",
      searchPlaceholder: "البحث بالرقم أو الملاحظات...",
  chauffeurName: "اسم السائق",
      filterPlaceholder: "تصفية حسب الحالة",
      noDeclarations: "لا توجد تصريحات",
      noDeclarationsWithFilters: "لا توجد تصريحات بهذه المعايير",
  confirmDelete: "هل أنت متأكد من حذف هذا التصريح؟",
  programNumberRequired: "رقم البرنامج يجب أن يحتوي على 4 أرقام",
  distanceOrFeesRequired: "يرجى إدخال المسافة أو رسوم التسليم",
  referenceAlreadyExists: "يوجد تصريح بهذه المرجعية لهذا السائق بالفعل.",
  breakdownConfirm: "هل أنت متأكد أنك تريد الإبلاغ عن عطل تقني لهذا التصريح؟ هذا الإجراء لا يمكن التراجع عنه.",
  breakdownSuccess: "تم الإبلاغ عن التصريح كعطل تقني."
    },
    // Chauffeurs
    chauffeurs: {
  title: "إدارة السائقين",
  add: "إضافة",
  new: "سائق جديد",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      vehicleType: "نوع المركبة",
      employeeType: "نوع الموظف",
      employeeTypeShort: {
        interne: "داخلي",
        externe: "خارجي"
      },
      fullName: "الاسم الكامل",
      username: "اسم المستخدم",
      position: "المنصب",
      gps: "GPS",
      enPanne: "عطل تقني",
      internal: "داخلي",
      external: "خارجي",
  active: "نشط",
  inactive: "غير نشط",
  connexion: "الاتصال",
  // used by autocomplete placeholder and other components
  search: "البحث بالاسم أو الهاتف...",
  searchPlaceholder: "البحث بالاسم أو الهاتف...",
  select: "اختر سائق",
      filterPlaceholder: "تصفية...",
      columnNumber: "الرقم",
      columnChauffeur: "السائق",
      deleteTitle: "تأكيد الحذف",
      deleteDesc: "هل أنت متأكد أنك تريد حذف هذا السائق؟ هذا الإجراء لا يمكن التراجع عنه.",
      cancel: "إلغاء",
      delete: "حذف",
      gpsEnabled: "GPS مفعل",
      gpsDisabled: "GPS معطل",
      tpPrefix: "TP - "
      ,
      actions: "الإجراءات",
      status: "الحالة"
    },
    // Warehouses
    warehouses: {
      title: "إدارة المستودعات",
      new: "مستودع جديد",
      name: "الاسم",
      company: "الشركة",
      phone: "الهاتف",
      address: "العنوان",
      active: "نشط",
      inactive: "غير نشط",
      status: "الحالة",
      actions: "الإجراءات",
      coordinates: "إحداثيات نظام GPS",
      latitude: "خط العرض",
      longitude: "خط الطول",
      map: "خريطة المستودعات",
      searchPlaceholder: "ابحث بالاسم أو المدينة...",
      filterPlaceholder: "تصفية..."
    },
    // Financial
    financial: {
      title: "الإدارة المالية",
      new: "سجل جديد",
      remboursement: "تعويض",
      reglement: "تسوية",
      programNumber: "رقم البرنامج",
      destinationUnit: "وحدة الوجهة",
      amount: "المبلغ (دج)",
      description: "الوصف",
      pending: "معلق",
      processed: "معالج",
      cph_nord: "CPH الشمال",
      cph_sud: "CPH الجنوب",
      cph_est: "CPH الشرق",
      cph_ouest: "CPH الغرب",
      cph_centre: "CPH الوسط",
      save: "حفظ"
    },
    // Forms
    forms: {
      notes: "ملاحظات",
      myClients: "عملائي",
      selectPlaceholder: "اختر نوعًا",
      add: "إضافة",
      replacePhotoConfirm: "هل تريد استبدال الصورة الحالية؟",
      save: "حفظ",
  cancel: "إلغاء",
  close: "إغلاق",
      edit: "تعديل",
      delete: "حذف",
      confirm: "تأكيد",
      yes: "نعم",
      no: "لا",
      required: "حقل مطلوب",
      success: "نجحت العملية",
      error: "خطأ في العملية",
  name: "الاسم",
  firstName: "الاسم الأول",
  mobile: "الهاتف المحمول",
  phonePlaceholder: "رقم الهاتف",
    amount: "المبلغ",
    saving: "جارٍ الحفظ...",
  // generic form placeholders
  phoneIndexedPlaceholder: "الهاتف {index}",
  latitude: "خط العرض",
  longitude: "خط الطول",
  photo: "صورة",
      geolocation: "الموقع الجغرافي",
      address: "العنوان",
      addressPlaceholder: "عنوان العميل",
      passwordMasked: "كلمة المرور مخفية"
      ,
      actions: "الإجراءات",
      password: "كلمة المرور"
    ,
    // helpers used by payment dialogs
    traceability: "سجل التتبع",
    creator: "المنشئ"
    },
    clients: {
      name: "الاسم",
      searchPlaceholder: "ابحث بالاسم...",
      creator: "المنشئ",
      status: "الحالة",
      actions: "الإجراءات",
      viewOnMap: "عرض على الخريطة",
      validate: "تأكيد"
    },
    profile: {
      title: "الملف الشخصي",
      personalInfo: "المعلومات الشخصية",
      contactAndVehicle: "الاتصال والمركبة",
      notProvided: "غير متوفر",
      userNotFound: "المستخدم غير موجود"
      ,
      securityTitle: "الأمان",
      securityDescription: "قم بتغيير كلمة المرور الخاصة بك لتأمين حسابك",
      changePassword: "تغيير كلمة المرور"
    },
    // Settings
    settings: {
      title: "الإعدادات",
      description: "خصص تجربتك وطريقة العرض.",
      viewMode: "وضع العرض",
  light: "فاتح",
  dark: "داكن",
  language: "اللغة",
  theme: "المظهر",
      changePassword: "تغيير كلمة المرور",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور"
    },
    // Vehicle types
    vehicles: {
      mini_vehicule: "مركبة صغيرة",
      fourgon: "شاحنة صغيرة",
      camion_2_5t: "شاحنة 2.5 طن",
      camion_3_5t: "شاحنة 3.5 طن",
      camion_5t: "شاحنة 5 طن",
      camion_7_5t: "شاحنة 7.5 طن",
      camion_10t: "شاحنة 10 طن",
      camion_15t: "شاحنة 15 طن",
      camion_20t: "شاحنة 20 طن"
    },
    // Traceability
    traceability: {
      created: "تم إنشاء التصريح",
      modified: "تم تعديل التصريح",
      validated: "تم تأكيد التصريح",
      sentReceipts: "تم إرسال الإيصالات",
      revokedRecouvrement: "تم التراجع عن التحصيل",
      refused: "تم رفض التصريح",
      declared: "تم التصريح",
      breakdown: "تم الإبلاغ عن عطل",
      paymentReceiptCreated: "تم إنشاء إيصال الدفع",
      clientHistory: "سجل العميل",
      clientCreated: "تم إنشاء العميل",
      clientModified: "تم تعديل العميل",
      clientValidated: "تم تأكيد العميل",
      clientRejected: "تم رفض العميل",
      clientArchived: "تم أرشفة العميل",
      unknownUser: "مستخدم غير معروف"
      ,
      none: "لا توجد أي آثار"
    },
    tracage: {
      title: "تتبع"
    }
  }
};
// Ensure 'ar' has all keys present in 'en' (then 'fr') to avoid accidental fallbacks to French
const fillMissingTranslations = () => {
  const langs: Array<'fr'|'en'|'ar'> = ['en', 'fr'];
  const target = translations['ar'] as any;

  const ensure = (srcObj: any, dstObj: any) => {
    for (const key of Object.keys(srcObj)) {
      const srcVal = srcObj[key];
      if (typeof srcVal === 'object' && srcVal !== null && !Array.isArray(srcVal)) {
        if (!(key in dstObj) || typeof dstObj[key] !== 'object' || dstObj[key] === null) {
          dstObj[key] = {};
        }
        ensure(srcVal, dstObj[key]);
      } else {
        if (!(key in dstObj) || dstObj[key] === undefined || dstObj[key] === null || dstObj[key] === '') {
          dstObj[key] = srcVal;
        }
      }
    }
  };

  for (const lang of langs) {
    const src = translations[lang] as any;
    if (src) ensure(src, target);
  }
};

try {
  fillMissingTranslations();
} catch (e) {
  // non-fatal, leave translations as-is if the helper fails
  // console.warn('fillMissingTranslations failed', e);
}

// Safety: ensure English translations explicitly contain profile/security and forms password keys
// This avoids cases where duplicate blocks or object ordering cause a fallback to French/other languages
try {
  const en = (translations as any).en = (translations as any).en || {};
  en.profile = en.profile || {};
  en.profile.securityTitle = en.profile.securityTitle || 'Security';
  en.profile.securityDescription = en.profile.securityDescription || 'Change your password to secure your account';
  en.profile.changePassword = en.profile.changePassword || 'Change password';

  en.forms = en.forms || {};
  en.forms.currentPassword = en.forms.currentPassword || 'Current Password';
  en.forms.newPassword = en.forms.newPassword || 'New Password';
  en.forms.confirmPassword = en.forms.confirmPassword || 'Confirm Password';
  en.forms.confirm = en.forms.confirm || 'Confirm';
  en.forms.cancel = en.forms.cancel || 'Cancel';
} catch (e) {
  // ignore, not fatal
}

// Ensure the `declarations.myDeclarations` key exists for common languages
;(function ensureMyDeclarationsKey() {
  try {
    if (!translations.fr) (translations as any).fr = {};
    if (!(translations as any).fr.declarations) (translations as any).fr.declarations = {};
    if (!(translations as any).fr.declarations.myDeclarations) (translations as any).fr.declarations.myDeclarations = 'Mes déclarations';

    if (!translations.en) (translations as any).en = {};
    if (!(translations as any).en.declarations) (translations as any).en.declarations = {};
    if (!(translations as any).en.declarations.myDeclarations) (translations as any).en.declarations.myDeclarations = 'My Declarations';

    if (!translations.ar) (translations as any).ar = {};
    if (!(translations as any).ar.declarations) (translations as any).ar.declarations = {};
    if (!(translations as any).ar.declarations.myDeclarations) (translations as any).ar.declarations.myDeclarations = 'إعلاناتي';
  } catch (e) {
    // ignore any issues when patching translations at runtime
  }
})();

// Ensure declarations.breakdown exists for all languages (fix accidental overwrites)
;(function ensureDeclarationsBreakdown() {
  try {
    if (!translations.fr) (translations as any).fr = {};
    (translations as any).fr.declarations = (translations as any).fr.declarations || {};
    if (!(translations as any).fr.declarations.breakdown) (translations as any).fr.declarations.breakdown = 'En panne';

    if (!translations.en) (translations as any).en = {};
    (translations as any).en.declarations = (translations as any).en.declarations || {};
    if (!(translations as any).en.declarations.breakdown) (translations as any).en.declarations.breakdown = 'Breakdown';

    if (!translations.ar) (translations as any).ar = {};
    (translations as any).ar.declarations = (translations as any).ar.declarations || {};
    if (!(translations as any).ar.declarations.breakdown) (translations as any).ar.declarations.breakdown = 'عطل تقني';
  } catch (e) {
    // ignore
  }
})();

// Ensure declarations.breakdownButton exists for all languages (fix accidental overwrites)
;(function ensureDeclarationsBreakdownButton() {
  try {
    if (!translations.fr) (translations as any).fr = {};
    (translations as any).fr.declarations = (translations as any).fr.declarations || {};
    if (!(translations as any).fr.declarations.breakdownButton) (translations as any).fr.declarations.breakdownButton = 'Signaler une panne';

    if (!translations.en) (translations as any).en = {};
    (translations as any).en.declarations = (translations as any).en.declarations || {};
    if (!(translations as any).en.declarations.breakdownButton) (translations as any).en.declarations.breakdownButton = 'Report breakdown';

    if (!translations.ar) (translations as any).ar = {};
    (translations as any).ar.declarations = (translations as any).ar.declarations || {};
    if (!(translations as any).ar.declarations.breakdownButton) (translations as any).ar.declarations.breakdownButton = 'الإبلاغ عن عطل تقني';
  } catch (e) {
    // ignore
  }
})();

export const getTranslation = (key: string, language: string) => {
  // Accept language codes like 'ar-DZ' or 'en-US' and normalize to base code
  const originalLanguage = language;
  const baseLang = (language || 'fr').split('-')[0] as 'fr' | 'en' | 'ar';
  const keys = key.split('.');
  let translation: any = translations[baseLang];

  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k];
    } else {
      translation = undefined;
      break;
    }
  }
  // Debugging: only log in development to avoid flooding production logs (mobile/webview)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      console.log('[getTranslation]', { key, language: originalLanguage, baseLang, value: translation });
    }
  } catch (e) {
    // ignore if process is not available (e.g., some WebView envs)
  }

  // Fallback mechanism: try baseLang, then prefer English, then French, then Arabic
  // This avoids returning French when Arabic keys are missing (English is usually a better fallback)
  const order: Array<'fr' | 'en' | 'ar'> = ['en', 'fr', 'ar'];

  if (translation) return translation;

  for (const lang of order) {
    // If baseLang is equal to this lang, we already tried it
    if (lang === baseLang) continue;
    let t: any = translations[lang];
    for (const k of keys) {
      if (t && typeof t === 'object' && k in t) {
        t = t[k];
      } else {
        t = undefined;
        break;
      }
    }
    if (t) return t;
  }

  return key;
};
