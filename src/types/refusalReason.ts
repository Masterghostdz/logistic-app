// Modèle TypeScript pour un motif de refus multilingue
export interface RefusalReason {
  id: string; // id Firestore
  fr: string;
  en: string;
  ar: string;
  createdAt: string;
  createdBy: string; // uid admin
}
