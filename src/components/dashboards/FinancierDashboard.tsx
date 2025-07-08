
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { FinancialRecord } from '../../types';
import { Plus, DollarSign, Clock, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const FinancierDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [formData, setFormData] = useState({
    type: 'remboursement',
    programNumber: '',
    destinationUnit: '',
    amount: '',
    description: '',
    photos: [] as string[]
  });

  useEffect(() => {
    // Charger les enregistrements financiers depuis localStorage
    const savedRecords = localStorage.getItem('financial_records');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  const generateRecordNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const existingRecords = records.length;
    const number = (existingRecords + 1).toString().padStart(4, '0');
    return `FIN/${year}/${month}/${number}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRecord: FinancialRecord = {
      id: Date.now().toString(),
      number: generateRecordNumber(),
      type: formData.type as 'remboursement' | 'reglement',
      programNumber: formData.programNumber,
      destinationUnit: formData.destinationUnit as any,
      amount: parseInt(formData.amount),
      description: formData.description,
      photos: formData.photos,
      status: 'en_attente',
      createdAt: new Date().toISOString()
    };

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem('financial_records', JSON.stringify(updatedRecords));
    
    // Réinitialiser le formulaire
    setFormData({
      type: 'remboursement',
      programNumber: '',
      destinationUnit: '',
      amount: '',
      description: '',
      photos: []
    });
    
    setShowNewRecord(false);
    toast.success(t('forms.success'));
  };

  const handleProcessRecord = (id: string) => {
    const updatedRecords = records.map(record => 
      record.id === id 
        ? { ...record, status: 'traite' as const, processedAt: new Date().toISOString(), processedBy: user?.id }
        : record
    );
    setRecords(updatedRecords);
    localStorage.setItem('financial_records', JSON.stringify(updatedRecords));
    toast.success('Enregistrement traité');
  };

  const destinationUnits = [
    { value: 'cph_nord', label: t('financial.cph_nord') },
    { value: 'cph_sud', label: t('financial.cph_sud') },
    { value: 'cph_est', label: t('financial.cph_est') },
    { value: 'cph_ouest', label: t('financial.cph_ouest') },
    { value: 'cph_centre', label: t('financial.cph_centre') }
  ];

  const stats = {
    totalRecords: records.length,
    pendingRecords: records.filter(r => r.status === 'en_attente').length,
    processedRecords: records.filter(r => r.status === 'traite').length,
    totalAmount: records.reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: records.filter(r => r.status === 'en_attente').reduce((sum, r) => sum + r.amount, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('financial.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestion des remboursements et règlements
          </p>
        </div>
        <Dialog open={showNewRecord} onOpenChange={setShowNewRecord}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('financial.new')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('financial.new')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remboursement">{t('financial.remboursement')}</SelectItem>
                    <SelectItem value="reglement">{t('financial.reglement')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="programNumber">{t('financial.programNumber')}</Label>
                <Input
                  id="programNumber"
                  value={formData.programNumber}
                  onChange={(e) => setFormData({...formData, programNumber: e.target.value})}
                  placeholder="Ex: DCP/24/01/0001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="destinationUnit">{t('financial.destinationUnit')}</Label>
                <Select value={formData.destinationUnit} onValueChange={(value) => setFormData({...formData, destinationUnit: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('financial.destinationUnit')} />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationUnits.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">{t('financial.amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">{t('financial.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={t('financial.description')}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowNewRecord(false)}>
                  {t('forms.cancel')}
                </Button>
                <Button type="submit">
                  {t('forms.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enregistrements
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Attente
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Traités
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.processedRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Montant Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalAmount.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Attente
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingAmount.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des enregistrements */}
      <Card>
        <CardHeader>
          <CardTitle>Enregistrements financiers</CardTitle>
          <CardDescription>
            Historique des remboursements et règlements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun enregistrement trouvé. Créez votre premier enregistrement !
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{record.number}</div>
                      <div className="text-sm text-gray-500">
                        {record.programNumber} - {new Date(record.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {destinationUnits.find(u => u.value === record.destinationUnit)?.label}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">
                        {record.amount.toLocaleString()} FCFA
                      </div>
                      <Badge className={
                        record.type === 'remboursement' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }>
                        {t(`financial.${record.type}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        record.status === 'en_attente' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }>
                        {t(`financial.${record.status}`)}
                      </Badge>
                      {record.status === 'en_attente' && (
                        <Button
                          size="sm"
                          onClick={() => handleProcessRecord(record.id)}
                        >
                          Traiter
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancierDashboard;
