import React from 'react';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { success, error } from './ui/use-toast';

interface CopyButtonProps {
  value: string;
}

const CopyButton = ({ value }: CopyButtonProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      success('Valeur copiée dans le presse-papiers');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      error('Erreur lors de la copie');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-4 w-4 p-0 hover:bg-gray-100"
      onClick={handleCopy}
    >
      <Copy className="h-3 w-3" />
    </Button>
  );
};

export default CopyButton;
