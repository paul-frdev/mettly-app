import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/lib/utils/notifications';

interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onDeleted?: () => void;
}

export function DeleteClientDialog({ open, onOpenChange, clientId, onDeleted }: DeleteClientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState('');

  const handleDelete = async () => {
    if (!password) {
      showError(new Error('Введите пароль для подтверждения'));
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка удаления клиента');
      }
      showSuccess('Аккаунт клиента удалён');
      onOpenChange(false);
      if (onDeleted) onDeleted();
    } catch (error) {
      showError(error);
    } finally {
      setIsDeleting(false);
      setPassword('');
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
            <label htmlFor="password">Пароль</label>
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
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить аккаунт'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 