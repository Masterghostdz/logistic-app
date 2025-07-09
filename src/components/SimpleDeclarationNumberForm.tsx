
import React, { useState, useEffect } from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

interface SimpleDeclarationNumberFormProps {
  onNumberChange: (number: string) => void;
  onComponentsChange?: (year: string, month: string, programNumber: string) => void;
  initialNumber?: string;
}

const SimpleDeclarationNumberForm: React.FC<SimpleDeclarationNumberFormProps> = ({ 
  onNumberChange, 
  onComponentsChange,
  initialNumber 
}) => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [programNumber, setProgramNumber] = useState('');

  const years = ['24', '25', '26', '27'];
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 1).toString().padStart(2, '0');
    return { value: monthNum, label: monthNum };
  });

  useEffect(() => {
    // Set default values based on current date
    const now = new Date();
    const currentYear = now.getFullYear().toString().slice(-2);
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    
    if (!initialNumber) {
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
  }, [initialNumber]);

  useEffect(() => {
    if (year && month && programNumber) {
      const fullNumber = `DCP/${year}/${month}/${programNumber}`;
      onNumberChange(fullNumber);
      onComponentsChange?.(year, month, programNumber);
    }
  }, [year, month, programNumber, onNumberChange, onComponentsChange]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Programme de Livraison</Label>
        <div className="text-sm text-gray-500 mb-2">
          Format: (DCP/)YY(/)MM(/)XXXX
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">DCP/</span>
        
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="YY" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <span className="text-sm font-medium">/</span>
        
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <span className="text-sm font-medium">/</span>
        
        <Input
          value={programNumber}
          onChange={(e) => setProgramNumber(e.target.value)}
          placeholder="XXXX"
          maxLength={4}
          className="w-20"
          required
        />
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

export default SimpleDeclarationNumberForm;
