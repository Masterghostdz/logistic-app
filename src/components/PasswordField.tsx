
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  password: string;
  showLabel?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ password, showLabel = true }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      {showLabel && <span className="text-sm text-gray-600">Mot de passe:</span>}
      <span className="font-mono text-sm">
        {showPassword ? password : '•'.repeat(password.length)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPassword(!showPassword)}
        className="h-6 w-6 p-0"
      >
        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </Button>
    </div>
  );
};

export default PasswordField;
