import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface PhoneNumbersFieldProps {
  phones: string[];
  onChange: (phones: string[]) => void;
  label?: string;
  addLabel?: string;
  required?: boolean;
}

const PhoneNumbersField: React.FC<PhoneNumbersFieldProps> = ({
  phones,
  onChange,
  label,
  addLabel,
  required = false,
}) => {
  const { t } = useTranslation();
  const resolvedLabel = label || t('planificateur.phoneNumbers') || t('forms.mobile') || 'Numéros de téléphone';
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
  <Label>{resolvedLabel} {required && '*'}</Label>
      {phones.map((phone, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={phone}
            onChange={(e) => handlePhoneChange(index, e.target.value)}
            placeholder={t('forms.phoneIndexedPlaceholder')?.replace('{index}', String(index + 1)) || (`Téléphone ${index + 1}`)}
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
        {addLabel || t('planificateur.add') || t('buttons.add')}
      </Button>
    </div>
  );
};

export default PhoneNumbersField;
