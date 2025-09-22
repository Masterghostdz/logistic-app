
import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from '../hooks/useTranslation';

interface DeclarationNumberFormProps {
  onNumberChange: (number: string) => void;
  onComponentsChange?: (year: string, month: string, programNumber: string) => void;
  initialNumber?: string;
}

const DeclarationNumberForm: React.FC<DeclarationNumberFormProps> = ({ 
  onNumberChange, 
  onComponentsChange,
  initialNumber 
}) => {
  // Get current date for defaults
  const now = new Date();
  const currentYear = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // Current month with leading zero

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [programNumber, setProgramNumber] = useState('');

  const years = ['24', '25', '26', '27', '28'];
  const { t } = useTranslation();
  const months = [
    { value: '01', label: t('months.01') || 'Janvier' },
    { value: '02', label: t('months.02') || 'Février' },
    { value: '03', label: t('months.03') || 'Mars' },
    { value: '04', label: t('months.04') || 'Avril' },
    { value: '05', label: t('months.05') || 'Mai' },
    { value: '06', label: t('months.06') || 'Juin' },
    { value: '07', label: t('months.07') || 'Juillet' },
    { value: '08', label: t('months.08') || 'Août' },
    { value: '09', label: t('months.09') || 'Septembre' },
    { value: '10', label: t('months.10') || 'Octobre' },
    { value: '11', label: t('months.11') || 'Novembre' },
    { value: '12', label: t('months.12') || 'Décembre' }
  ];

  useEffect(() => {
    if (!initialNumber) {
      // Set default values to current year and month
      setYear(currentYear);
      setMonth(currentMonth);
    } else {
      // Parse existing number DCP/YY/MM/XXXX
      const parts = initialNumber.replace('DCP/', '').split('/');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setProgramNumber(parts[2]);
      }
    }
  }, [initialNumber, currentYear, currentMonth]);

  useEffect(() => {
    if (year && month && programNumber) {
      const fullNumber = `DCP/${year}/${month}/${programNumber}`;
      onNumberChange(fullNumber);
      onComponentsChange?.(year, month, programNumber);
    }
  }, [year, month, programNumber, onNumberChange, onComponentsChange]);

  const handleProgramNumberChange = (value: string) => {
    // S'assurer que c'est un nombre de 4 chiffres
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 4) {
      setProgramNumber(numericValue.padStart(4, '0'));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('declarations.programNumber') || 'Programme de Livraison'}</Label>
        <div className="mt-2 p-3 bg-gray-50 rounded-md border">
          <div className="flex items-center gap-1 text-sm font-mono" dir="ltr">
            <span className="text-gray-500">DCP/</span>
            <span className={year ? "text-black font-medium" : "text-gray-400"}>
              {year || "YY"}
            </span>
            <span className="text-gray-500">/</span>
            <span className={month ? "text-black font-medium" : "text-gray-400"}>
              {month || "MM"}
            </span>
            <span className="text-gray-500">/</span>
            <span className={programNumber ? "text-black font-medium" : "text-gray-400"}>
              {programNumber || "XXXX"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="year">Année</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {years.map((yr) => (
                <SelectItem key={yr} value={yr}>20{yr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="month">Mois</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="programNumber">Numéro (4 chiffres)</Label>
          <Input
            id="programNumber"
            type="text"
            value={programNumber}
            onChange={(e) => handleProgramNumberChange(e.target.value)}
            placeholder="0000"
            maxLength={4}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default DeclarationNumberForm;
