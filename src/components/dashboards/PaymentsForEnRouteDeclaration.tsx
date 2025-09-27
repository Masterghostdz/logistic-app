import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '../ui/alert-dialog';

// Affiche les reçus de paiement liés à une déclaration en route (source Firestore, pas local)
const PaymentsForEnRouteDeclaration: React.FC<{ declarationId?: string, isMobile?: boolean }> = ({ declarationId, isMobile }) => {
  const [receipts, setReceipts] = React.useState<any[]>([]);
  const [previewPhotoUrl, setPreviewPhotoUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!declarationId) { setReceipts([]); return; }
    let unsub: (() => void) | undefined;
    (async () => {
      const { listenPayments } = await import('../../services/paymentService');
      unsub = listenPayments((items: any[]) => {
        setReceipts(items.filter(p => p.declarationId === declarationId));
      });
    })();
    return () => { if (unsub) unsub(); };
  }, [declarationId]);

  if (!declarationId) return null;
  if (receipts.length === 0) return <div className="text-muted-foreground text-xs italic px-2 py-1 mt-2">Aucun reçu ajouté</div>;
  return (
    <div className="flex flex-col gap-3 w-full mt-2">
      {receipts.map((receipt, idx) => (
        <div
          key={receipt.id}
          className="relative flex flex-row items-center border rounded-lg bg-muted px-3 py-2 gap-4 w-full min-h-[48px] h-auto shadow-sm"
        >
          <img
            src={receipt.photoUrl}
            alt={`reçu-${idx}`}
            className="object-cover w-16 h-12 rounded-md cursor-pointer hover:opacity-80 transition"
            onClick={() => setPreviewPhotoUrl(receipt.photoUrl)}
          />
          {/* Modal d'aperçu photo reçu */}
          {previewPhotoUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setPreviewPhotoUrl(null)}>
              <div className="bg-white rounded-lg shadow-lg p-2 max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <img src={previewPhotoUrl} alt="Aperçu reçu" className="max-w-[90vw] max-h-[80vh] rounded-lg" />
                <button className="mt-2 px-4 py-1 bg-gray-800 text-white rounded" onClick={() => setPreviewPhotoUrl(null)}>Fermer</button>
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="font-medium truncate">{receipt.companyName || <span className="italic text-muted-foreground">Société non renseignée</span>}</div>
            <div className="text-xs text-muted-foreground truncate">{receipt.status === 'brouillon' ? 'Brouillon' : 'Validée'}</div>
            {!isMobile && (
              <div className="text-xs text-muted-foreground truncate">{new Date(receipt.createdAt).toLocaleString()}</div>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="ml-auto p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Es-tu sûr de vouloir supprimer ce reçu ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      const { deletePayment } = await import('../../services/paymentService');
                      await deletePayment(receipt.id);
                    } catch (e) {
                      console.warn('Failed to delete payment doc:', e);
                    }
                  }}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
};

export default PaymentsForEnRouteDeclaration;
