import React, { useEffect, useState } from 'react';
import { getAllRefusalReasons, addRefusalReason, updateRefusalReason, deleteRefusalReason } from '../../services/refusalReasonService';
import { RefusalReason } from '../../types/refusalReason';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { useTranslation } from '../../hooks/useTranslation';

// Remplacer par une vraie API de traduction si besoin
async function fakeTranslate(text: string, lang: 'en' | 'ar'): Promise<string> {
  // Ici, retourne simplement le texte sans préfixe
  return text;
}

interface RefusalReasonsConfigProps {
  showAddButton?: boolean;
  hideHeader?: boolean;
  onlyButton?: boolean;
}

export default function RefusalReasonsConfig({ showAddButton, hideHeader, onlyButton }: RefusalReasonsConfigProps) {
  const [reasons, setReasons] = useState<RefusalReason[]>([]);
  const [newFr, setNewFr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingReason, setEditingReason] = useState<RefusalReason | null>(null);
  const [inputLang, setInputLang] = useState<'fr' | 'en' | 'ar'>('fr');
  const [zoom, setZoom] = useState(() => localStorage.getItem('refusalReasonsZoom') || '80');
  const zoomLevels = {
    '40': 0.75,
    '50': 0.80,
    '60': 0.85,
    '70': 0.90,
    '80': 0.95,
    '90': 1.0,
    '100': 1.05
  };

  useEffect(() => {
    getAllRefusalReasons().then(setReasons);
  }, []);

  const handleAdd = async () => {
    if (!newFr.trim()) return;
    setLoading(true);
    let fr = '', en = '', ar = '';
    if (inputLang === 'fr') {
      fr = newFr;
      en = await fakeTranslate(newFr, 'en');
      ar = await fakeTranslate(newFr, 'ar');
    } else if (inputLang === 'en') {
      en = newFr;
      fr = '';
      ar = await fakeTranslate(newFr, 'ar');
    } else if (inputLang === 'ar') {
      ar = newFr;
      fr = '';
      en = await fakeTranslate(newFr, 'en');
    }
    if (editingReason) {
      await updateRefusalReason(editingReason.id, { fr, en, ar });
    } else {
      await addRefusalReason({ fr, en, ar });
    }
    setNewFr('');
    setEditingReason(null);
    setShowAdd(false);
    setInputLang('fr');
    setReasons(await getAllRefusalReasons());
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await deleteRefusalReason(id);
    setReasons(await getAllRefusalReasons());
    setLoading(false);
  };

  const { t } = useTranslation();

  if (onlyButton) {
    return (
      <div className="flex justify-end mb-4">
        <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) { setEditingReason(null); setNewFr(''); } }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('buttons.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingReason
                  ? `Modifier le motif (${inputLang.toUpperCase()})`
                  : t('refusalReasons.addReason')
                }
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} className="space-y-4">
              <div className="flex gap-2">
                <Select value={inputLang} onValueChange={v => setInputLang(v as 'fr' | 'en' | 'ar')} disabled={!!editingReason}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">FR</SelectItem>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="ar">AR</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={inputLang === 'fr' ? 'Motif (français)' : inputLang === 'en' ? 'Reason (English)' : 'سبب (عربي)'}
                  value={newFr}
                  onChange={e => setNewFr(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading || !newFr.trim()} className="flex-1">{editingReason ? t('forms.edit') || 'Modifier' : t('forms.confirm') || 'Valider'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowAdd(false); setEditingReason(null); setNewFr(''); }} disabled={loading}>{t('forms.cancel') || 'Annuler'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  // Enregistre le zoom choisi dans le localStorage
  const handleZoomChange = (value) => {
    setZoom(value);
    localStorage.setItem('refusalReasonsZoom', value);
  };
  return (
    <>
      {/* Sélecteur de zoom */}
      <div className="flex items-center justify-end mb-2">
        <label className="mr-2 text-xs text-muted-foreground">Zoom :</label>
        <select
          value={zoom}
          onChange={e => handleZoomChange(e.target.value)}
          className="border rounded px-2 py-1 text-xs bg-background"
          title="Zoom sur la taille d'écriture du tableau"
        >
          <option value="100">100%</option>
          <option value="90">90%</option>
          <option value="80">80%</option>
          <option value="70">70%</option>
          <option value="60">60%</option>
          <option value="50">50%</option>
          <option value="40">40%</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow style={{ fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>
            <TableHead style={{ fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>FR</TableHead>
            <TableHead style={{ fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>EN</TableHead>
            <TableHead style={{ fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>AR</TableHead>
            <TableHead style={{ fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>{t('forms.actions') || 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reasons.map(r => (
            <TableRow key={r.id} style={{ fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>
              <TableCell onClick={() => { setEditingReason(r); setInputLang('fr'); setNewFr(r.fr); setShowAdd(true); }} style={{ cursor: 'pointer', fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>{r.fr}</TableCell>
              <TableCell onClick={() => { setEditingReason(r); setInputLang('en'); setNewFr(r.en); setShowAdd(true); }} style={{ cursor: 'pointer', fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>{r.en}</TableCell>
              <TableCell onClick={() => { setEditingReason(r); setInputLang('ar'); setNewFr(r.ar); setShowAdd(true); }} style={{ cursor: 'pointer', fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>{r.ar}</TableCell>
              <TableCell style={{ fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }}>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" style={{ fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }} onClick={() => {
                    setEditingReason(r);
                    setInputLang('fr');
                    setNewFr(r.fr);
                    setShowAdd(true);
                  }}>
                    <Edit className="h-4 w-4" style={{ width: `${Math.round(16 * (zoomLevels[zoom] || 1))}px`, height: `${Math.round(16 * (zoomLevels[zoom] || 1))}px` }} />
                  </Button>
                  <Button size="sm" variant="destructive" style={{ fontSize: `${Math.round(14 * (zoomLevels[zoom] || 1))}px` }} onClick={() => handleDelete(r.id)} disabled={loading}>
                    <Trash2 className="h-4 w-4" style={{ width: `${Math.round(16 * (zoomLevels[zoom] || 1))}px`, height: `${Math.round(16 * (zoomLevels[zoom] || 1))}px` }} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
