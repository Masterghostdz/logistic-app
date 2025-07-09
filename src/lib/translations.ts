
export const translations = {
  fr: {
    // Header
    header: {
      title: "Logigrine",
      profile: "Profil",
      settings: "Paramètres",
      logout: "Déconnexion",
      welcome: "Bienvenue"
    },
    // Navigation
    nav: {
      dashboard: "Tableau de bord",
      declarations: "Déclarations",
      chauffeurs: "Chauffeurs",
      warehouses: "Entrepôts",
      financial: "Financier",
      users: "Utilisateurs",
      settings: "Paramètres"
    },
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
    // Dashboard
    dashboard: {
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
      pending: "En Attente",
      validated: "Validées",
      refused: "Refusées"
    },
    // Declarations
    declarations: {
      title: "Mes déclarations",
      new: "Nouvelle déclaration",
      number: "Numéro",
      date: "Date",
      distance: "Distance (km)",
      deliveryFees: "Frais de livraison (DZD)",
      notes: "Notes",
      photos: "Photos justificatives",
      status: "Statut",
      actions: "Actions",
      edit: "Modifier",
      delete: "Supprimer",
      validate: "Valider",
      refuse: "Refuser",
      pending: "En cours",
      validated: "Validé",
      refused: "Refusé",
      createdDate: "Date création",
      searchPlaceholder: "Rechercher par numéro, notes...",
      filterPlaceholder: "Filtrer par statut",
      noDeclarations: "Aucune déclaration trouvée",
      noDeclarationsWithFilters: "Aucune déclaration trouvée avec ces critères",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cette déclaration ?",
      programNumberRequired: "Le numéro de programme doit contenir 4 chiffres",
      distanceOrFeesRequired: "Veuillez renseigner soit la distance soit les frais de livraison"
    },
    // Chauffeurs
    chauffeurs: {
      title: "Gestion des chauffeurs",
      new: "Nouveau chauffeur",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      vehicleType: "Type de véhicule",
      employeeType: "Type d'employé",
      internal: "Interne",
      external: "Externe (TP)",
      active: "Actif",
      inactive: "Inactif"
    },
    // Warehouses
    warehouses: {
      title: "Gestion des entrepôts",
      new: "Nouvel entrepôt",
      name: "Nom",
      company: "Société",
      phone: "Téléphone",
      address: "Adresse",
      coordinates: "Coordonnées GPS",
      latitude: "Latitude",
      longitude: "Longitude",
      map: "Carte des entrepôts"
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
    },
    // Forms
    forms: {
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      delete: "Supprimer",
      confirm: "Confirmer",
      required: "Champ requis",
      success: "Opération réussie",
      error: "Erreur lors de l'opération"
    },
    // Settings
    settings: {
      title: "Paramètres",
      language: "Langue",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",
      changePassword: "Changer le mot de passe",
      currentPassword: "Mot de passe actuel",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe"
    },
    // Vehicle types
    vehicles: {
      mini_vehicule: "Mini véhicule",
      fourgon: "Fourgon",
      camion_2_5t: "Camion 2.5T",
      camion_3_5t: "Camion 3.5T",
      camion_5t: "Camion 5T",
      camion_7_5t: "Camion 7.5T",
      camion_10t: "Camion 10T",
      camion_15t: "Camion 15T",
      camion_20t: "Camion 20T"
    }
  },
  en: {
    // Header
    header: {
      title: "Logigrine",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      welcome: "Welcome"
    },
    // Navigation
    nav: {
      dashboard: "Dashboard",
      declarations: "Declarations",
      chauffeurs: "Drivers",
      warehouses: "Warehouses",
      financial: "Financial",
      users: "Users",
      settings: "Settings"
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
    // Dashboard
    dashboard: {
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
      pending: "Pending",
      validated: "Validated",
      refused: "Refused"
    },
    // Declarations
    declarations: {
      title: "My Declarations",
      new: "New Declaration",
      number: "Number",
      date: "Date",
      distance: "Distance (km)",
      deliveryFees: "Delivery Fees (DZD)",
      notes: "Notes",
      photos: "Supporting Photos",
      status: "Status",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      validate: "Validate",
      refuse: "Refuse",
      pending: "Pending",
      validated: "Validated",
      refused: "Refused",
      createdDate: "Created Date",
      searchPlaceholder: "Search by number, notes...",
      filterPlaceholder: "Filter by status",
      noDeclarations: "No declarations found",
      noDeclarationsWithFilters: "No declarations found with these criteria",
      confirmDelete: "Are you sure you want to delete this declaration?",
      programNumberRequired: "Program number must contain 4 digits",
      distanceOrFeesRequired: "Please enter either distance or delivery fees"
    },
    // Chauffeurs
    chauffeurs: {
      title: "Driver Management",
      new: "New Driver",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      vehicleType: "Vehicle Type",
      employeeType: "Employee Type",
      internal: "Internal",
      external: "External (TP)",
      active: "Active",
      inactive: "Inactive"
    },
    // Warehouses
    warehouses: {
      title: "Warehouse Management",
      new: "New Warehouse",
      name: "Name",
      company: "Company",
      phone: "Phone",
      address: "Address",
      coordinates: "GPS Coordinates",
      latitude: "Latitude",
      longitude: "Longitude",
      map: "Warehouse Map"
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
    },
    // Forms
    forms: {
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      required: "Required field",
      success: "Operation successful",
      error: "Operation error"
    },
    // Settings
    settings: {
      title: "Settings",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password"
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
    }
  },
  ar: {
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
      settings: "الإعدادات"
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
    // Dashboard
    dashboard: {
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
      pending: "معلق",
      validated: "مؤكد",
      refused: "مرفوض"
    },
    // Declarations
    declarations: {
      title: "تصريحاتي",
      new: "تصريح جديد",
      number: "الرقم",
      date: "التاريخ",
      distance: "المسافة (كم)",
      deliveryFees: "رسوم التسليم (دج)",
      notes: "ملاحظات",
      photos: "الصور المبررة",
      status: "الحالة",
      actions: "الإجراءات",
      edit: "تعديل",
      delete: "حذف",
      validate: "تأكيد",
      refuse: "رفض",
      pending: "معلق",
      validated: "مؤكد",
      refused: "مرفوض",
      createdDate: "تاريخ الإنشاء",
      searchPlaceholder: "البحث بالرقم أو الملاحظات...",
      filterPlaceholder: "تصفية حسب الحالة",
      noDeclarations: "لا توجد تصريحات",
      noDeclarationsWithFilters: "لا توجد تصريحات بهذه المعايير",
      confirmDelete: "هل أنت متأكد من حذف هذا التصريح؟",
      programNumberRequired: "رقم البرنامج يجب أن يحتوي على 4 أرقام",
      distanceOrFeesRequired: "يرجى إدخال المسافة أو رسوم التسليم"
    },
    // Chauffeurs
    chauffeurs: {
      title: "إدارة السائقين",
      new: "سائق جديد",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      vehicleType: "نوع المركبة",
      employeeType: "نوع الموظف",
      internal: "داخلي",
      external: "خارجي (TP)",
      active: "نشط",
      inactive: "غير نشط"
    },
    // Warehouses
    warehouses: {
      title: "إدارة المستودعات",
      new: "مستودع جديد",
      name: "الاسم",
      company: "الشركة",
      phone: "الهاتف",
      address: "العنوان",
      coordinates: "إحداثيات نظام GPS",
      latitude: "خط العرض",
      longitude: "خط الطول",
      map: "خريطة المستودعات"
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
    },
    // Forms
    forms: {
      save: "حفظ",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      confirm: "تأكيد",
      required: "حقل مطلوب",
      success: "نجحت العملية",
      error: "خطأ في العملية"
    },
    // Settings
    settings: {
      title: "الإعدادات",
      language: "اللغة",
      theme: "المظهر",
      light: "فاتح",
      dark: "داكن",
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
    }
  }
};

export const getTranslation = (key: string, language: 'fr' | 'en' | 'ar') => {
  const keys = key.split('.');
  let translation: any = translations[language];
  
  for (const k of keys) {
    translation = translation?.[k];
  }
  
  // Fallback mechanism: FR → EN → AR
  if (!translation) {
    if (language !== 'fr') {
      translation = getTranslation(key, 'fr');
    }
    if (!translation && language !== 'en') {
      translation = getTranslation(key, 'en');
    }
    if (!translation && language !== 'ar') {
      translation = getTranslation(key, 'ar');
    }
  }
  
  return translation || key;
};
