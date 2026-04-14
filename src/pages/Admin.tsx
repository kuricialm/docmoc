import { useState, useEffect } from 'react';
import * as api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit2, Shield, User, KeyRound, Trash2 } from 'lucide-react';
import { formatFileSize } from '@/lib/fileTypes';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  suspended: boolean;
  last_sign_in_at: string | null;
  total_uploaded_size: number;
};

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
  const [editSuspended, setEditSuspended] = useState(false);
  const [passwordResetValue, setPasswordResetValue] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const all = await api.getUsers();
      setUsers(all.map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.fullName,
        role: u.role,
        suspended: !!u.suspended,
        last_sign_in_at: u.lastSignInAt || null,
        total_uploaded_size: u.totalUploadedSize || 0,
      })));
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchUsers(); }, [isAdmin]);

  if (!isAdmin) return <p className="text-center py-20 text-muted-foreground">Access denied</p>;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await api.createUser(inviteEmail, invitePassword, inviteName || inviteEmail, inviteRole);
      toast.success('User created successfully');
      setShowInvite(false);
      setInviteEmail(''); setInviteName(''); setInvitePassword('');
      fetchUsers();
    } catch (err: any) { toast.error(err.message); }
    setInviteLoading(false);
  };

  const handleUserUpdate = async () => {
    if (!editUser) return;
    try {
      await api.updateUser(editUser.id, {
        fullName: editName,
        email: editEmail,
        role: editRole,
        suspended: editSuspended,
      });
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) { toast.error(err.message); }
  };

  const handlePasswordReset = async () => {
    if (!editUser) return;
    try {
      await api.resetUserPassword(editUser.id, passwordResetValue);
      toast.success('Password reset successfully');
      setPasswordResetValue('');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDeleteUser = async () => {
    if (!editUser) return;
    if (!window.confirm(`Delete ${editUser.full_name || editUser.email}? This cannot be undone.`)) return;
    try {
      await api.deleteUser(editUser.id);
      toast.success('User deleted');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) { toast.error(err.message); }
  };

  const formatLastSignIn = (value: string | null) => {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleString();
  };

  return (
    <div className="max-w-3xl space-y-6 animate-page-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">User Management</h2>
        <Button size="sm" onClick={() => setShowInvite(true)} className="gap-1.5 rounded-lg">
          <Plus className="w-3.5 h-3.5" /> Create User
        </Button>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground text-sm">Loading...</p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block divide-y divide-border/30">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors duration-150">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary">
                    {(u.full_name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{u.full_name || u.email}</p>
                    <p className="text-xs text-muted-foreground/70">{u.email}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Last sign-in: {formatLastSignIn(u.last_sign_in_at)}</p>
                    <p className="text-xs text-muted-foreground/70">Uploads: {formatFileSize(u.total_uploaded_size)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                    {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {u.role}
                  </span>
                  {u.suspended && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
                      Suspended
                    </span>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { setEditUser(u); setEditRole(u.role); setEditName(u.full_name || ''); setEditEmail(u.email); setEditSuspended(u.suspended); setPasswordResetValue(''); }} className="gap-1.5 text-xs rounded-lg">
                    <Edit2 className="w-3 h-3" /> Edit User
                  </Button>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border/30">
              {users.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary">
                      {(u.full_name || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.full_name || u.email}</p>
                      <p className="text-xs text-muted-foreground/70 truncate">{u.email}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Last sign-in: {formatLastSignIn(u.last_sign_in_at)}</p>
                      <p className="text-xs text-muted-foreground/70">Uploads: {formatFileSize(u.total_uploaded_size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                      {u.suspended && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
                          Suspended
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setEditUser(u); setEditRole(u.role); setEditName(u.full_name || ''); setEditEmail(u.email); setEditSuspended(u.suspended); setPasswordResetValue(''); }} className="gap-1.5 text-xs rounded-lg">
                      <Edit2 className="w-3 h-3" /> Edit User
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="John Doe" className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Password</Label>
              <Input type="password" value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} required minLength={6} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'user')}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full rounded-lg" disabled={inviteLoading}>
              {inviteLoading ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader><DialogTitle>Edit User: {editUser?.full_name || editUser?.email}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as 'admin' | 'user')}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="suspended"
                type="checkbox"
                checked={editSuspended}
                onChange={(e) => setEditSuspended(e.target.checked)}
              />
              <Label htmlFor="suspended" className="text-xs">Suspend account</Label>
            </div>
            <Button onClick={handleUserUpdate} className="w-full rounded-lg">Save Changes</Button>

            <div className="pt-2 border-t border-border/50 space-y-2">
              <Label className="text-xs">Reset Password</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={passwordResetValue}
                  minLength={4}
                  onChange={(e) => setPasswordResetValue(e.target.value)}
                  placeholder="New password"
                  className="h-10 rounded-lg"
                />
                <Button type="button" variant="secondary" onClick={handlePasswordReset} disabled={passwordResetValue.length < 4}>
                  <KeyRound className="w-4 h-4 mr-1" /> Reset
                </Button>
              </div>
            </div>

            <Button type="button" variant="destructive" onClick={handleDeleteUser} className="w-full rounded-lg">
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
