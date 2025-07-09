
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
    { value: '01', label: '01 - Janvier' },
    { value: '02', label: '02 - Février' },
    { value: '03', label: '03 - Mars' },
    { value: '04', label: '04 - Avril' },
    { value: '05', label: '05 - Mai' },
    { value: '06', label: '06 - Juin' },
    { value: '07', label: '07 - Juillet' },
    { value: '08', label: '08 - Août' },
    { value: '09', label: '09 - Septembre' },
    { value: '10', label: '10 - Octobre' },
    { value: '11', label: '11 - Novembre' },
    { value: '12', label: '12 - Décembre' }
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
      <div>
        <Label>Programme de Livraison</Label>
        <div className="mt-2 p-3 bg-gray-50 rounded-md border">
          <div className="flex items-center gap-1 text-sm font-mono">
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

      <div className="grid grid-cols-3 gap-4">
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
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleDeclarationNumberForm;
