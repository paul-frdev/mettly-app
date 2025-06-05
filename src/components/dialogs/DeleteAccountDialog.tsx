import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/lib/utils/notifications';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteAccountDialog({ open, onOpenChange, onDeleted }: DeleteAccountDialogProps) {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password) {
      showError(new Error('Введите пароль для подтверждения'));
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка удаления аккаунта');
      }
      showSuccess('Аккаунт успешно удалён');
      onOpenChange(false);
      setPassword('');
      if (onDeleted) onDeleted();
    } catch (error) {
      showError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить аккаунт</DialogTitle>
          <DialogDescription>
            Это действие необратимо. Введите пароль для подтверждения.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              disabled={isDeleting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setPassword('');
            }}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить аккаунт'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 