
import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, X } from 'lucide-react';

interface PhoneNumbersFieldProps {
  phones: string[];
  onChange: (phones: string[]) => void;
  label?: string;
  required?: boolean;
}

const PhoneNumbersField: React.FC<PhoneNumbersFieldProps> = ({
  phones,
  onChange,
  label = "Numéros de téléphone",
  required = false
}) => {
  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...phones];
    newPhones[index] = value;
    onChange(newPhones);
  };

  const addPhone = () => {
    onChange([...phones, '']);
  };

  const removePhone = (index: number) => {
    if (phones.length > 1) {
      const newPhones = phones.filter((_, i) => i !== index);
      onChange(newPhones);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      {phones.map((phone, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={phone}
            onChange={(e) => handlePhoneChange(index, e.target.value)}
            placeholder={`Téléphone ${index + 1}`}
            required={required && index === 0}
          />
          {phones.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removePhone(index)}
              className="h-10 w-10 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addPhone}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Ajouter un numéro
      </Button>
    </div>
  );
};

export default PhoneNumbersField;
