
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface SimpleDeclarationNumberFormProps {
  onNumberChange: (number: string) => void;
  onComponentsChange: (year: string, month: string, programNumber: string) => void;
  initialYear?: string;
  initialMonth?: string;
  initialProgramNumber?: string;
}

const SimpleDeclarationNumberForm = ({ 
  onNumberChange, 
  onComponentsChange,
  initialYear = '',
  initialMonth = '',
  initialProgramNumber = ''
}: SimpleDeclarationNumberFormProps) => {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
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
    if (initialMonth) setMonth(initialMonth);
    if (initialProgramNumber) setProgramNumber(initialProgramNumber);
  }, [initialYear, initialMonth, initialProgramNumber]);

  useEffect(() => {
    if (year && month && programNumber) {
      const fullNumber = `DCP/${year}/${month}/${programNumber}`;
      onNumberChange(fullNumber);
      onComponentsChange(year, month, programNumber);
    } else {
      onNumberChange('');
      onComponentsChange('', '', '');
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
      <Label>Programme de Livraison</Label>
      <div className="flex items-center gap-1 p-3 bg-gray-50 rounded-md border">
        <span className="text-gray-500 font-mono">DCP/</span>
        
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-16 h-8 px-2 py-1 text-sm">
            <SelectValue placeholder="YY" />
          </SelectTrigger>
          <SelectContent>
            {years.map((yr) => (
              <SelectItem key={yr} value={yr}>{yr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <span className="text-gray-500 font-mono">/</span>
        
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-16 h-8 px-2 py-1 text-sm">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <span className="text-gray-500 font-mono">/</span>
        
        <Input
          type="text"
          value={programNumber}
          onChange={(e) => handleProgramNumberChange(e.target.value)}
          placeholder="XXXX"
          className="w-16 h-8 px-2 py-1 text-center text-sm"
          maxLength={4}
        />
      </div>
    </div>
  );
};

export default SimpleDeclarationNumberForm;
