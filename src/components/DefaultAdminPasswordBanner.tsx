import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DefaultAdminPasswordBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-950 [&>svg]:text-amber-600 dark:text-amber-100">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Default admin password still active</AlertTitle>
      <AlertDescription>
        You are signed in with the built-in Synology bootstrap password. Change it in{' '}
        <Link to="/settings" className="font-medium underline underline-offset-4">
          Settings
        </Link>
        {' '}to secure this installation.
      </AlertDescription>
    </Alert>
  );
}
