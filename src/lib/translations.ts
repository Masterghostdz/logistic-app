export const translations = {
  fr: {
    camera: {
      error: {
        save: "Impossible d'importer la photo. Vérifiez votre connexion."
      }
    },
    planificateur: {
      clientsTitle: "Gestion des Clients",
      dashboardTitle: "Tableau de bord - Planificateur",
      recentDeclarations: "Déclarations récentes",
      declarationsTitle: "Gestion des Déclarations",
      warehousesTitle: "Gestion des Entrepôts",
      add: "Ajouter",
      company: "Société",
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
      caissier: "Caissier"
    },
    buttons: {
      myClients: "Mes clients",
      add: "Ajouter",
      settings: "Paramètres",
      centerMap: "Centrer la carte",
      gps: "GPS",
      screenshot: "Capture d'écran",
      mapMode: "Mode carte",
      listMode: "Mode liste",
      changeLayer: "Changer le fond de carte",
      viewWarehouses: "Voir la liste des entrepôts",
      createWarehouse: "Créer un nouvel entrepôt"
    },
    common: {
      searchPlaceholder: "Rechercher...",
      filterPlaceholder: "Filtrer..."
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
      name: "Nom",
      company: "Société",
      select: "Sélectionner une société",
      address: "Adresse",
      phone: "Téléphone",
      email: "Email",
      actions: "Actions"
    },
    vehicleTypes: {
      name: "Nom",
      primeKilometrique: "Prime kilométrique",
      actions: "Actions"
    },
    tabs: {
      dashboard: "Tableau de bord",
      recouvrement: "Recouvrement",
      declarations: "Déclarations",
      tracage: "Traçage",
      warehouses: "Entrepôts",
      clients: "Clients",
      chauffeurs: "Chauffeurs",
      payment: "Paiement",
      profile: "Profil",
      reports: "Rapports"
    },
    // Traductions spécifiques pour la section Caissier
    caissier: {
      paymentsTitle: "Paiements",
      createPaymentTitle: "Ajouter un reçu de paiement",
      createPaymentDesc: "Remplissez le formulaire pour ajouter un reçu de paiement."
    },
    payment: {
      errors: {
        noPhoto: "Photo du reçu requise",
        programRequired: "Référence programme requise",
        programNotFound: "Aucune déclaration trouvée pour ce numéro de programme",
        saveFailed: "Erreur lors de l'enregistrement"
      }
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
      welcome: "Bienvenue sur Logigrine",
      subtitle: "Système de gestion logistique"
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
  pending: "En Attent",
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
      confirmCancelDescription: "Êtes-vous sûr de vouloir annuler la création de cette déclaration ? Les informations saisies seront perdues.",
      confirmDeleteTitle: "Confirmer la suppression",
      confirmDeleteDescription: "Êtes-vous sûr de vouloir supprimer cette déclaration ? Cette action est irréversible.",
      paymentReceipts: "Reçus de paiement (photos)",
      noPaymentReceipts: "Aucun reçu de paiement",
  noReceiptsAdded: "Aucun reçu ajouté",
    programNumber: "Numéro de programme",
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
      notes: "Notes",
      photos: "Photos justificatives",
      status: "Statut",
      actions: "Actions",
      edit: "Modifier",
      delete: "Supprimer",
      validate: "Valider",
      refuse: "Refuser",
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
  ar: {
    // planificateur moved to final `ar` block to avoid duplication
    roles: {
      admin: "مسؤول",
      planificateur: "مخطط",
      chauffeur: "سائق",
      caissier: "كاشي",
      client: "عميل"
    },
    // Traductions spécifiques pour la section Caissier en arabe
    caissier: {
      paymentsTitle: "المدفوعات",
      createPaymentTitle: "إضافة إيصال دفع",
      createPaymentDesc: "املأ النموذج لإضافة إيصال الدفع."
    },
    common: {
      searchPlaceholder: "ابحث...",
      filterPlaceholder: "تصفية..."
    },
    buttons: {
      myClients: "عملائي",
      add: "إضافة",
      settings: "الإعدادات",
      centerMap: "توسيط الخريطة",
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
      declarations: "التصريحات",
      tracage: "التتبع",
      warehouses: "المستودعات",
      clients: "العملاء",
      chauffeurs: "السائقين",
      recouvrement: "التحصيل",
      payment: "المدفوعات",
      reports: "تقارير"
    },
  declarations: {
      confirmCancelTitle: "تأكيد الإلغاء",
      confirmCancelDescription: "هل أنت متأكد أنك تريد إلغاء إنشاء هذا التصريح؟ سيتم فقدان المعلومات المدخلة.",
      confirmDeleteTitle: "تأكيد الحذف",
  confirmDeleteDescription: "هل أنت متأكد أنك تريد حذف هذا التصريح؟ هذا الإجراء لا يمكن التراجع عنه.",
  paymentReceipts: "إيصالات الدفع (صور)",
  noPaymentReceipts: "لا يوجد إيصال دفع",
      noReceiptsAdded: "لم يتم إضافة إيصال",
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
  pending: "En Attent",
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
      external: "Externe (TP)",
  active: "Actif",
  inactive: "Inactif",
  connexion: "Connexion",
      searchPlaceholder: "Rechercher par nom ou téléphone...",
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
      myClients: "Mes clients",
      add: "Ajouter",
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      addClient: "Ajouter un client",
      editClient: "Modifier le client",
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
      photo: "Photo",
      geolocation: "Position géographique",
      address: "Adresse",
      addressPlaceholder: "Adresse du client",
      passwordMasked: "Mot de passe masqué"
      ,
      actions: "Actions",
      password: "Mot de passe"
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
    },
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
      unknownUser: "Utilisateur inconnu"
    },
    tracage: {
      title: "Suivi des Chauffeurs et Déclarations"
    }
  },
  en: {
    camera: {
      error: {
        save: "Unable to import photo. Please check your connection."
      }
    },
    roles: {
      admin: "Admin",
      planificateur: "Planner",
      chauffeur: "Driver",
      caissier: "Cashier",
      client: "Client"
    },
    common: {
      searchPlaceholder: "Search...",
      filterPlaceholder: "Filter..."
    },
    planificateur: {
      clientsTitle: "Clients Management",
      dashboardTitle: "Planner Dashboard",
      recentDeclarations: "Recent Declarations",
      declarationsTitle: "Declarations Management",
      warehousesTitle: "Warehouses Management",
      add: "Add",
      company: "Company",
      phoneNumbers: "Phone Numbers",
      status: "Status"
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
      subtitle: "Logistics Management System"
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
      select: "Select a company",
      address: "Address",
      phone: "Phone",
      email: "Email",
      actions: "Actions"
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
      new: "New Declaration",
      chauffeur: "Driver",
      number: "Number",
      date: "Date",
      distance: "Distance (km)",
  deliveryFees: "Delivery Fees (DZD)",
  primeDeRoute: "Route Allowance (DZD)",
      paymentReceipts: "Payment receipts (photos)",
      noReceiptsAdded: "No receipts added",
      programNumber: "Program Number",
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
      external: "External (TP)",
  active: "Active",
  inactive: "Inactive",
  connexion: "Connection",
      searchPlaceholder: "Search by name or phone...",
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
      myClients: "My clients",
      add: "Add",
      addClient: "Add a client",
      editClient: "Edit client",
      save: "Save",
      cancel: "Cancel",
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
      photo: "Photo",
      geolocation: "Geolocation",
      address: "Address",
      addressPlaceholder: "Client address",
      passwordMasked: "Password masked"
      ,
      actions: "Actions",
      password: "Password"
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
      confirmPassword: "Confirm Password"
    },
    tabs: {
      dashboard: "Dashboard",
      recouvrement: "Recovery",
      declarations: "Declarations",
      tracage: "Tracking",
      warehouses: "Warehouses",
      clients: "Clients",
      chauffeurs: "Drivers",
      payment: "Payment",
      profile: "Profile",
      reports: "Reports"
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
    },
    tracage: {
      title: "Chauffeurs & Declarations Tracking"
    }
  },
  ar: {
    camera: {
      error: {
        save: "تعذر حفظ الصورة. يرجى التحقق من الاتصال."
      }
    },
    roles: {
      admin: "مسؤول",
      planificateur: "مخطط",
      chauffeur: "سائق",
      caissier: "كاشي",
      client: "عميل"
    },
    // Traductions spécifiques pour la section Caissier en arabe
    caissier: {
      paymentsTitle: "المدفوعات",
      createPaymentTitle: "إضافة إيصال دفع",
      createPaymentDesc: "املأ النموذج لإضافة إيصال الدفع."
    },
    tabs: {
      dashboard: "لوحة القيادة",
      declarations: "التصريحات",
      tracage: "التتبع",
      warehouses: "المستودعات",
      clients: "العملاء",
      chauffeurs: "السائقين",
      recouvrement: "التحصيل",
      payment: "المدفوعات",
      reports: "تقارير"
    },
    // Planificateur translations (moved/merged here so final `ar` block contains them)
    planificateur: {
      clientsTitle: "إدارة العملاء",
      dashboardTitle: "لوحة تحكم المخطط",
      recentDeclarations: "التصريحات الحديثة",
      declarationsTitle: "إدارة التصريحات",
      warehousesTitle: "إدارة المستودعات",
      add: "إضافة",
      company: "الشركة",
      phoneNumbers: "أرقام الهاتف",
      status: "الحالة"
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
      subtitle: "نظام إدارة اللوجستيات"
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
        select: "اختر شركة",
        address: "العنوان",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        actions: "الإجراءات"
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
      external: "خارجي (TP)",
  active: "نشط",
  inactive: "غير نشط",
  connexion: "الاتصال",
      searchPlaceholder: "البحث بالاسم أو الهاتف...",
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
      cph_centre: "CPH الوسط"
      ,
      save: "حفظ"
    },
    // Forms
    forms: {
      myClients: "عملائي",
      add: "إضافة",
      addClient: "إضافة عميل",
      editClient: "تعديل العميل",
      save: "حفظ",
      cancel: "إلغاء",
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
      photo: "صورة",
      geolocation: "الموقع الجغرافي",
      address: "العنوان",
      addressPlaceholder: "عنوان العميل",
      passwordMasked: "كلمة المرور مخفية"
      ,
      actions: "الإجراءات",
      password: "كلمة المرور"
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
    },
    tracage: {
      title: "تتبع السائقين والتصريحات"
    }
  }
};

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

  // Fallback mechanism: try baseLang, then fr -> en -> ar
  const order: Array<'fr' | 'en' | 'ar'> = ['fr', 'en', 'ar'];

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
