import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createUserWithApi,
  deleteUserWithApi,
  fetchRoles,
  fetchUsers,
  updateUserWithApi,
} from '../../api/vipBookingApi'
import { Icon } from '../../components/icons/Icon'
import { useToast } from '../../context/ToastContext'
import type { RegisteredUser } from '../../types'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function AdminUsersPage() {
  const { confirmToast, showToast } = useToast()
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [activeUser, setActiveUser] = useState<RegisteredUser | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | RegisteredUser['role']>('All')
  const [roleIds, setRoleIds] = useState<Record<RegisteredUser['role'], string>>({ admin: '', guest: '' })

  const reloadUsers = async () => {
    const [nextUsers, nextRoles] = await Promise.all([fetchUsers(), fetchRoles()])
    setUsers(nextUsers)
    setRoleIds({
      admin: nextRoles.find((role) => role.name === 'admin')?.id ?? '',
      guest: nextRoles.find((role) => role.name === 'customer')?.id ?? '',
    })
  }

  useEffect(() => {
    reloadUsers().catch((error) => {
      const message = error instanceof Error ? error.message : 'Could not load users.'
      showToast({ title: 'Could not load users', message, variant: 'error' })
    })
  }, [showToast])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      const roleMatch = roleFilter === 'All' || user.role === roleFilter
      const textMatch = !query || user.email.toLowerCase().includes(query)
      return roleMatch && textMatch
    })
  }, [roleFilter, search, users])

  const openAddUserModal = () => {
    setActiveUser(null)
    setIsUserModalOpen(true)
  }

  const openEditUserModal = (user: RegisteredUser) => {
    setActiveUser(user)
    setIsUserModalOpen(true)
  }

  const closeUserModal = () => {
    setActiveUser(null)
    setIsUserModalOpen(false)
  }

  const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = activeUser
      ? normalizeEmail(activeUser.email)
      : normalizeEmail(String(formData.get('email') ?? ''))
    const password = String(formData.get('password') ?? '').trim()
    const role = String(formData.get('role') ?? 'guest') as RegisteredUser['role']
    const fullName = String(formData.get('fullName') ?? '').trim() || email

    if (!email || !email.includes('@') || (!activeUser && !password)) {
      return
    }

    const duplicateUser = users.find((user) => normalizeEmail(user.email) === email)
    if (duplicateUser && normalizeEmail(activeUser?.email ?? '') !== email) {
      showToast({
        title: 'Email already exists',
        message: 'This email already exists.',
        variant: 'error',
      })
      return
    }

    const adminCount = users.filter((user) => user.role === 'admin').length
    if (activeUser?.role === 'admin' && role === 'guest' && adminCount <= 1) {
      showToast({
        title: 'Admin account required',
        message: 'At least one admin account must remain active.',
        variant: 'warning',
      })
      return
    }

    try {
      let message = ''
      if (activeUser?.id) {
        const user = await updateUserWithApi(activeUser.id, {
          password: password || undefined,
          fullName,
          roleId: roleIds[role],
          status: activeUser.status ?? 'active',
        })
        message = user.apiMessage
      } else {
        const user = await createUserWithApi({
          email,
          password,
          fullName,
          roleId: roleIds[role],
        })
        message = user.apiMessage
      }
      await reloadUsers()
      closeUserModal()
      showToast({ title: 'Account saved', message, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save account.'
      showToast({ title: 'Could not save account', message, variant: 'error' })
    }
  }

  const handleRoleChange = async (email: string, role: RegisteredUser['role']) => {
    const adminCount = users.filter((user) => user.role === 'admin').length
    const activeUser = users.find((user) => normalizeEmail(user.email) === normalizeEmail(email))

    if (activeUser?.role === 'admin' && role === 'guest' && adminCount <= 1) {
      showToast({
        title: 'Admin account required',
        message: 'At least one admin account must remain active.',
        variant: 'warning',
      })
      return
    }

    if (!activeUser?.id || !roleIds[role]) return

    try {
      const user = await updateUserWithApi(activeUser.id, { roleId: roleIds[role], status: activeUser.status ?? 'active' })
      await reloadUsers()
      showToast({ title: 'Role updated', message: user.apiMessage, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update role.'
      showToast({ title: 'Could not update role', message, variant: 'error' })
    }
  }

  const handleDeleteUser = async (user: RegisteredUser) => {
    const adminCount = users.filter((item) => item.role === 'admin').length
    if (user.role === 'admin' && adminCount <= 1) {
      showToast({
        title: 'Admin account required',
        message: 'At least one admin account must remain active.',
        variant: 'warning',
      })
      return
    }

    const shouldDelete = await confirmToast({
      title: 'Delete account?',
      message: `Delete account "${user.email}"?`,
      confirmLabel: 'Delete',
      variant: 'warning',
    })
    if (!shouldDelete) {
      return
    }

    if (!user.id) return

    try {
      const message = await deleteUserWithApi(user.id)
      await reloadUsers()
      showToast({ title: 'Account deleted', message, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete account.'
      showToast({ title: 'Could not delete account', message, variant: 'error' })
    }
  }

  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="panel-title">
              <Icon name="shield" />
              <span>User Role Management</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Assign admin or customer access so each account only sees the correct system functions.
            </p>
          </div>
          <button className="primary-button compact" type="button" onClick={openAddUserModal}>
            <Icon name="plus" />
            Add Account
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex-1 min-w-[240px]">
            <input
              value={search}
              placeholder="Search account email..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {(['All', 'admin', 'guest'] as const).map((role) => (
            <button
              key={role}
              className={`ghost-button compact ${roleFilter === role ? 'border-slate-500 text-white' : ''}`}
              type="button"
              onClick={() => setRoleFilter(role)}
            >
              {role === 'All' ? 'All Roles' : role === 'admin' ? 'Admins' : 'Guests'}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Current Role</th>
                <th>Allowed Surface</th>
                <th>Permission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.email}>
                  <td>
                    <strong>{user.email}</strong>
                  </td>
                  <td>
                    <span className={`status-chip ${user.role === 'admin' ? 'success' : 'pending'}`}>
                      {user.role === 'admin' ? 'Admin' : 'Guest'}
                    </span>
                  </td>
                  <td>
                    {user.role === 'admin'
                      ? 'Admin dashboard, rooms, billing, customers, roles'
                      : 'Booking flow, profile, payment'}
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(event) =>
                        handleRoleChange(user.email, event.target.value as RegisteredUser['role'])
                      }
                    >
                      <option value="guest">Guest</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="link-button" type="button" onClick={() => openEditUserModal(user)}>
                        Edit
                      </button>
                      <button className="link-button" type="button" onClick={() => handleDeleteUser(user)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5}>No accounts found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isUserModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-form-title"
          >
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">Access control</p>
                <h2 id="user-form-title">{activeUser ? 'Edit Account' : 'Add Account'}</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close account form"
                onClick={closeUserModal}
              >
                <Icon name="close" />
              </button>
            </div>
            <form className="admin-room-form" onSubmit={handleUserSubmit}>
              <label>
                Email
                <input
                  name="email"
                  defaultValue={activeUser?.email}
                  disabled={Boolean(activeUser)}
                  placeholder="account@email.com"
                  required
                  type="email"
                />
              </label>
              <label>
                Full name
                <input
                  name="fullName"
                  defaultValue={activeUser?.fullName}
                  placeholder="Account owner"
                  required
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  defaultValue={activeUser?.password}
                  placeholder="Temporary password"
                  required={!activeUser}
                  type="text"
                />
              </label>
              <label className="span-2">
                Role
                <select name="role" defaultValue={activeUser?.role ?? 'guest'}>
                  <option value="guest">Guest</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <div className="admin-modal-actions span-2">
                <button className="ghost-button" type="button" onClick={closeUserModal}>
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  <Icon name={activeUser ? 'check' : 'plus'} />
                  {activeUser ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
