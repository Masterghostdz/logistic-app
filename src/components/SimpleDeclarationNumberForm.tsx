import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useTranslation } from '../hooks/useTranslation';

interface SimpleDeclarationNumberFormProps {
  onNumberChange: (number: string) => void;
  onComponentsChange: (year: string, month: string, programNumber: string) => void;
  initialYear?: string;
  initialMonth?: string;
  initialProgramNumber?: string;
  readOnly?: boolean;
  noWrapper?: boolean;
}

const SimpleDeclarationNumberForm = ({ 
  onNumberChange, 
  onComponentsChange,
  initialYear = '',
  initialMonth = '',
  initialProgramNumber = '',
  readOnly = false
  , noWrapper = false
}: SimpleDeclarationNumberFormProps) => {
  // Get current date for defaults
  const now = new Date();
  const currentYear = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // Current month with leading zero

  const [year, setYear] = useState(initialYear || currentYear);
  const [month, setMonth] = useState(initialMonth || currentMonth);
  const [programNumber, setProgramNumber] = useState(initialProgramNumber);

  const years = ['24', '25', '26', '27'];
  const months = [
    { value: '01', label: '01' },
    { value: '02', label: '02' },
    { value: '03', label: '03' },
    { value: '04', label: '04' },
    { value: '05', label: '05' },
    { value: '06', label: '06' },
    { value: '07', label: '07' },
    { value: '08', label: '08' },
    { value: '09', label: '09' },
    { value: '10', label: '10' },
    { value: '11', label: '11' },
    { value: '12', label: '12' }
  ];

  // Update local state when initial values change
  useEffect(() => {
    if (initialYear) setYear(initialYear);
    else setYear(currentYear);
    
    if (initialMonth) setMonth(initialMonth);
    else setMonth(currentMonth);
    
    if (initialProgramNumber) setProgramNumber(initialProgramNumber);
  }, [initialYear, initialMonth, initialProgramNumber, currentYear, currentMonth]);

  useEffect(() => {
    if (year && month && programNumber && programNumber.length === 4) {
      const fullNumber = `DCP/${year}/${month}/${programNumber}`;
      onNumberChange(fullNumber);
      onComponentsChange(year, month, programNumber);
    } else {
      onNumberChange('');
      onComponentsChange(year || '', month || '', programNumber || '');
    }
  }, [year, month, programNumber, onNumberChange, onComponentsChange]);

  const handleProgramNumberChange = (value: string) => {
    // Permet seulement les chiffres et limite à 4 caractères
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 4) {
      setProgramNumber(numericValue);
    }
  };

  const { t } = useTranslation();
 
  // If readOnly and initial values are 'NA', render disabled controls showing 'NA'
  const isNAReadOnly = readOnly && (initialYear === 'NA' || initialMonth === 'NA' || initialProgramNumber === 'NA');

  const renderControls = (compact: boolean) => {
    const baseClass = compact ? 'flex items-center gap-1' : 'flex items-center gap-1 p-3 bg-gray-50 rounded-md border';
    if (isNAReadOnly) {
      return (
        <div className={baseClass} dir="ltr">
          <span dir="ltr" className="text-muted-foreground font-mono text-sm">DCP/</span>
          <Select value={''} onValueChange={() => {}} disabled>
            <SelectTrigger className="w-16 h-8 px-2 py-1 text-sm" disabled>
              <SelectValue placeholder="NA" />
            </SelectTrigger>
          </Select>
          <span dir="ltr" className="text-muted-foreground font-mono text-sm">/</span>
          <Select value={''} onValueChange={() => {}} disabled>
            <SelectTrigger className="w-16 h-8 px-2 py-1 text-sm" disabled>
              <SelectValue placeholder="NA" />
            </SelectTrigger>
          </Select>
          <span dir="ltr" className="text-muted-foreground font-mono text-sm">/</span>
          <Input
            type="text"
            value={'NA'}
            readOnly
            className="w-16 h-8 px-2 py-1 text-center text-sm"
            disabled
          />
        </div>
      );
    }

    return (
      <div className={baseClass} dir="ltr">
        <span dir="ltr" className="text-gray-500 font-mono text-sm">DCP/</span>
        <Select value={year} onValueChange={setYear} disabled={readOnly}>
          <SelectTrigger className="w-16 h-8 px-2 py-1 text-sm" disabled={readOnly}>
            <SelectValue placeholder="YY" />
          </SelectTrigger>
          <SelectContent>
            {years.map((yr) => (
              <SelectItem key={yr} value={yr}>{yr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span dir="ltr" className="text-gray-500 font-mono text-sm">/</span>
        <Select value={month} onValueChange={setMonth} disabled={readOnly}>
          <SelectTrigger className="w-16 h-8 px-2 py-1 text-sm" disabled={readOnly}>
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span dir="ltr" className="text-gray-500 font-mono text-sm">/</span>
        <Input
          type="text"
          value={programNumber}
          onChange={(e) => handleProgramNumberChange(e.target.value)}
          placeholder={t('declarations.programNumber') ? 'XXXX' : 'XXXX'}
          className="w-16 h-8 px-2 py-1 text-center text-sm"
          maxLength={4}
          disabled={readOnly}
        />
      </div>
    );
  };
 
  // If parent wants to render the outer wrapper (noWrapper=true), render controls only and let parent render label/wrapper
  if (noWrapper) {
    return renderControls(true);
  }
 
  return (
    <div className="space-y-4">
      <Label>{t('declarations.programNumber') || 'Programme de Livraison'}</Label>
      {renderControls(false)}
    </div>
  );
};

export default SimpleDeclarationNumberForm;
