import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Eye, Search, Mail, Lock, User } from 'lucide-react';
import { Admin } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [viewingAdmin, setViewingAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'admin' as 'admin' | 'auditor' | 'poll_monitor'
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admin/admins');
      setAdmins(response);
    } catch (error: any) {
      showToast('error', 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await api.put(`/admin/admins/${editingAdmin.id}`, formData);
        showToast('success', 'Admin updated successfully');
      } else {
        await api.post('/admin/admins', formData);
        showToast('success', 'Admin created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      showToast('error', error.message || 'Operation failed');
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      password: '',
      fullName: admin.full_name,
      role: admin.role
    });
    setShowModal(true);
  };

  const handleView = (admin: Admin) => {
    setViewingAdmin(admin);
    setShowViewModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      await api.delete(`/admin/admins/${id}`);
      showToast('success', 'Admin deleted successfully');
      fetchAdmins();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete admin');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      role: 'admin'
    });
    setEditingAdmin(null);
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'badge-primary';
      case 'auditor': return 'badge-warning';
      case 'poll_monitor': return 'badge-success';
      default: return 'badge-gray';
    }
  };

  const canControlPoll = (admin: Admin) => {
    return admin.role === 'admin' || admin.role === 'poll_monitor';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading admins..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">Manage system administrators and their roles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Admin</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="card-body">
          <div className="search-bar">
            <Search className="search-icon w-5 h-5" />
            <input
              type="text"
              placeholder="Search admins by email, name, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            System Administrators ({filteredAdmins.length})
          </h2>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Admin Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Poll Access</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{admin.full_name}</p>
                            <p className="text-sm text-gray-600">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getRoleBadgeColor(admin.role)}`}>
                          {admin.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${admin.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${canControlPoll(admin) ? 'badge-success' : 'badge-gray'}`}>
                          {canControlPoll(admin) ? 'Can Control Poll' : 'View Only'}
                        </span>
                      </td>
                      <td className="text-sm text-gray-600">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(admin)}
                            className="action-btn action-btn-secondary"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(admin)}
                            className="action-btn action-btn-primary"
                            title="Edit Admin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="action-btn action-btn-danger"
                            title="Delete Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingAdmin ? 'Edit Admin' : 'Add New Admin'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="form-input"
              required
            >
              <option value="admin">Admin (Full Access + Poll Control)</option>
              <option value="auditor">Auditor (View Only)</option>
              <option value="poll_monitor">Poll Monitor (Poll Control Only)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock className="w-4 h-4 inline mr-2" />
              Password {editingAdmin && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
              required={!editingAdmin}
              minLength={6}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {editingAdmin ? 'Update Admin' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Admin Details"
        size="md"
      >
        {viewingAdmin && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{viewingAdmin.full_name}</h3>
              <p className="text-gray-600">{viewingAdmin.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1">
                  <span className={`badge ${getRoleBadgeColor(viewingAdmin.role)}`}>
                    {viewingAdmin.role.replace('_', ' ').toUpperCase()}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <span className={`badge ${viewingAdmin.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {viewingAdmin.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Poll Access</label>
                <p className="mt-1">
                  <span className={`badge ${canControlPoll(viewingAdmin) ? 'badge-success' : 'badge-gray'}`}>
                    {canControlPoll(viewingAdmin) ? 'Can Control Poll' : 'View Only'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(viewingAdmin.created_at).toLocaleString()}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Admin ID</label>
                <p className="mt-1 text-sm text-gray-900">#{viewingAdmin.id}</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};