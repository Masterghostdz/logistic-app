
import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DeclarationNumberFormProps {
  onNumberChange: (number: string) => void;
  initialNumber?: string;
}

const DeclarationNumberForm: React.FC<DeclarationNumberFormProps> = ({ onNumberChange, initialNumber }) => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [programNumber, setProgramNumber] = useState('');

  const years = ['24', '25', '26', '27', '28'];
  const months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  useEffect(() => {
    // Set default values based on current date
    const now = new Date();
    const currentYear = now.getFullYear().toString().slice(-2);
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    
    if (!initialNumber) {
      setYear(currentYear);
      setMonth(currentMonth);
    } else {
      // Parse existing number DCP/AA/MM/XXXX
      const parts = initialNumber.replace('DCP/', '').split('/');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setProgramNumber(parts[2]);
      }
    }
  }, [initialNumber]);

  useEffect(() => {
    if (year && month && programNumber) {
      const fullNumber = `DCP/${year}/${month}/${programNumber}`;
      onNumberChange(fullNumber);
    }
  }, [year, month, programNumber, onNumberChange]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Numéro de déclaration (Format: DCP/AA/MM/XXXX)</Label>
        <div className="text-sm text-gray-500 mb-2">
          AA = Année, MM = Mois, XXXX = Numéro de programme
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="year">Année (AA)</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger>
              <SelectValue placeholder="AA" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y}>20{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="month">Mois (MM)</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="programNumber">N° Programme (XXXX)</Label>
          <Input
            id="programNumber"
            value={programNumber}
            onChange={(e) => setProgramNumber(e.target.value)}
            placeholder="XXXX"
            maxLength={4}
            required
          />
        </div>
      </div>
      
      {year && month && programNumber && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700">
            Numéro généré: <span className="font-medium">DCP/{year}/{month}/{programNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeclarationNumberForm;
