import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import {
  UserPlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../i18n';
import { AxiosError } from 'axios';
import { Table } from '../../components/Table';
import type { Column } from '../../components/Table';

interface User {
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  verified: boolean;
  status: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get('/admin/users');
  return data;
};

export const AdminUsers = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchUsers,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create user form state
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: 'clerk',
  });
  const [createError, setCreateError] = useState('');

  // Helper to translate role
  const translateRole = (role: string): string => {
    const key = role.toLowerCase() === 'user' ? 'publicUser' : role.toLowerCase();
    return t(key) || role;
  };

  // Helper to translate status
  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  // Helper to get status badge style
  const getStatusBadgeClass = (status: string): string => {
    return status === 'active'
      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
  };

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => apiClient.delete(`/admin/users/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
    onError: (err: AxiosError<{ message?: string }>) => {
      window.alert(err.response?.data?.message || t('failedToDeleteUser') || 'Failed to delete user');
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      apiClient.patch(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setEditingId(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: (newUserData: typeof newUser) => apiClient.post('/admin/users', newUserData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setNewUser({ fullName: '', email: '', username: '', password: '', role: 'clerk' });
      setShowCreateForm(false);
      setCreateError('');
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setCreateError(err.response?.data?.message || t('createFailed') || 'User creation failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: string }) =>
      apiClient.patch(`/admin/users/${userId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newUser);
  };

  const startEdit = (user: User) => {
    setEditingId(user.user_id);
    setEditRole(user.role);
  };

  const columns: Column<User>[] = [
    {
      key: 'user_id',
      label: t('id') || 'ID',
      sortable: true,
    },
    {
      key: 'full_name',
      label: t('fullName') || 'Full Name',
      sortable: true,
    },
    {
      key: 'username',
      label: t('username') || 'Username',
      sortable: true,
    },
    {
      key: 'email',
      label: t('email') || 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: t('role') || 'Role',
      sortable: true,
      render: (val, row) =>
        editingId === row.user_id ? (
          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            className="border rounded p-1"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <option value="admin">{t('admin') || 'Admin'}</option>
            <option value="clerk">{t('clerk') || 'Clerk'}</option>
            <option value="judge">{t('judge') || 'Judge'}</option>
            <option value="lawyer">{t('lawyer') || 'Lawyer'}</option>
            <option value="user">{t('publicUser') || 'Public User'}</option>
          </select>
        ) : (
          <span className="capitalize">{translateRole(String(val))}</span>
        ),
    },
    {
      key: 'status',
      label: t('status') || 'Status',
      sortable: true,
      render: (val) => {
        const status = String(val);
        return (
          <span
            className={`inline-flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadgeClass(
              status
            )}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
            {translateStatus(status)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: t('actions') || 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {editingId === row.user_id ? (
            <>
              <button
                onClick={() => roleMutation.mutate({ userId: row.user_id, role: editRole })}
                className="text-green-600 hover:text-green-800"
                aria-label={t('save') || 'Save'}
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-red-600 hover:text-red-800"
                aria-label={t('cancel') || 'Cancel'}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(row)}
                className="text-blue-600 hover:text-blue-800"
                aria-label={t('edit') || 'Edit'}
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  statusMutation.mutate({
                    userId: row.user_id,
                    status: row.status === 'active' ? 'inactive' : 'active',
                  })
                }
                className={`text-sm font-black px-2 py-1 rounded transition-colors ${
                  row.status === 'active'
                    ? 'text-rose-500 hover:text-rose-700'
                    : 'text-emerald-500 hover:text-emerald-700'
                }`}
              >
                {row.status === 'active'
                  ? t('deactivate') || 'Deactivate'
                  : t('activate') || 'Activate'}
              </button>
            </>
          )}
          <button
            onClick={() => {
              const confirmMsg = t('confirmDeleteUser') || 'Delete this user?';
              if (window.confirm(confirmMsg)) {
                deleteMutation.mutate(row.user_id);
              }
            }}
            className="text-red-400 hover:text-red-600"
            aria-label={t('delete') || 'Delete'}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="app-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="app-heading text-2xl font-bold">
          {t('manageUsers') || 'Manage Users'}
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="app-btn-primary flex items-center shadow-lg"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" /> {t('addUser') || 'Add User'}
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="mb-6 p-6 rounded-2xl bg-[var(--app-panel-soft)] border border-[var(--app-border)] shadow-inner">
          <h2 className="app-heading text-lg font-semibold mb-4">
            {t('createNewUser') || 'Create New User'}
          </h2>
          {createError && <div className="app-alert-error mb-4">{createError}</div>}
          <form onSubmit={handleCreateSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t('fullName') || 'Full Name'}
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                className="app-input"
                required
              />
              <input
                type="email"
                placeholder={t('email') || 'Email'}
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="app-input"
                required
              />
              <input
                type="text"
                placeholder={t('username') || 'Username'}
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="app-input"
                required
              />
              <input
                type="password"
                placeholder={t('passwordPlaceholder') || 'Password'}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="app-input"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="app-select"
              >
                <option value="clerk">{t('clerk') || 'Clerk'}</option>
                <option value="judge">{t('judge') || 'Judge'}</option>
                <option value="admin">{t('admin') || 'Admin'}</option>
                <option value="lawyer">{t('lawyer') || 'Lawyer'}</option>
                <option value="user">{t('publicUser') || 'Public User'}</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="app-btn-primary"
              >
                {createMutation.isPending
                  ? t('creating') || 'Creating...'
                  : t('createUser') || 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="app-btn-secondary"
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {isLoading ? (
        <p className="app-muted">{t('loading') || 'Loading...'}</p>
      ) : isError ? (
        <div className="app-alert-error">
          {(error as AxiosError<{ message?: string }>)?.response?.data?.message ||
            t('failedToLoadUsers') ||
            'Failed to load users'}
        </div>
      ) : (
        <Table<User>
          columns={columns}
          data={users ?? []}
          keyField="user_id"
          emptyMessage={t('noUsersFound') || 'No users found.'}
        />
      )}
    </div>
  );
};