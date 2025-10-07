import { useToast, toast } from "@/hooks/use-toast";

// Semantic helpers for backward-compatible API
function success(message: string, description?: string) {
  return toast({ title: message, description, variant: 'success' });
}

function warning(message: string, description?: string) {
  return toast({ title: message, description, variant: 'warning' });
}

function info(message: string, description?: string) {
  return toast({ title: message, description, variant: 'default' });
}

function error(message: string, description?: string) {
  return toast({ title: message, description, variant: 'destructive' });
}

export { useToast, toast, success, warning, info, error };
