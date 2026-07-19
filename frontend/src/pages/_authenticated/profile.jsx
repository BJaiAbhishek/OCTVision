import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { api } from '@/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  async function handleChangePassword(event) {
    event.preventDefault();
    const parsed = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }
    setBusy(true);
    try {
      await api.post('/auth/password', { newPassword: parsed.data.newPassword });
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 mb-6 -ml-2"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <h1 className="font-display text-3xl font-bold tracking-tight mb-6">Profile</h1>

          <Card className="mb-6 border border-border shadow-soft bg-card-gradient">
            <CardHeader>
              <CardTitle className="text-lg font-display">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 grid place-items-center">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-semibold font-display">{displayName}</p>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-soft bg-card-gradient">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={busy} className="gap-2">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
