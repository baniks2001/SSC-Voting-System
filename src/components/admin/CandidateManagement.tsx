import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, User, Award, Image } from 'lucide-react';
import { Candidate } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const CandidateManagement: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    party: '',
    position: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates/admin');
      setCandidates(response);
    } catch (error: any) {
      showToast('error', 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCandidate) {
        await api.put(`/candidates/${editingCandidate.id}`, formData);
        showToast('success', 'Candidate updated successfully');
      } else {
        await api.post('/candidates', formData);
        showToast('success', 'Candidate created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCandidates();
    } catch (error: any) {
      showToast('error', error.message || 'Operation failed');
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      party: candidate.party,
      position: candidate.position,
      imageUrl: candidate.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    
    try {
      await api.delete(`/candidates/${id}`);
      showToast('success', 'Candidate deleted successfully');
      fetchCandidates();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete candidate');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      party: '',
      position: '',
      imageUrl: ''
    });
    setEditingCandidate(null);
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPositionColor = (position: string) => {
    const colors = {
      'President': 'badge-purple',
      'Vice President': 'badge-indigo',
      'Secretary': 'badge-green',
      'Senator': 'badge-blue',
      'Treasurer': 'badge-warning',
      'Auditor': 'badge-primary'
      
    };
    return colors[position as keyof typeof colors] || 'badge-gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading candidates..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600">Manage election candidates and their information</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Candidate</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="card-body">
          <div className="search-bar">
            <Search className="search-icon w-5 h-5" />
            <input
              type="text"
              placeholder="Search candidates by name, party, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="responsive-grid">
        {filteredCandidates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No candidates found</p>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="card hover:shadow-lg transition-all duration-300">
              <div className="card-body">
                <div className="flex items-start space-x-4">
                  <img
                    src={candidate.image_url || `https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`}
                    alt={candidate.name}
                    className="candidate-image"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{candidate.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{candidate.party}</p>
                    <span className={`badge ${getPositionColor(candidate.position)}`}>
                      {candidate.position}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{candidate.vote_count || 0}</span> votes
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${candidate.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {candidate.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(candidate)}
                    className="flex-1 btn-secondary btn-sm flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(candidate.id)}
                    className="flex-1 btn-danger btn-sm flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Award className="w-4 h-4 inline mr-2" />
              Party
            </label>
            <input
              type="text"
              value={formData.party}
              onChange={(e) => setFormData({ ...formData, party: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Position</label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="form-input"
              required
            >
              <option value="">Select Position</option>
              <option value="President">President</option>
              <option value="Vice President">Vice President</option>
              <option value="Secretary">Secretary</option>
              <option value="Senator">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Auditor">Auditor</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Image className="w-4 h-4 inline mr-2" />
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`;
                  }}
                />
              </div>
            )}
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
              {editingCandidate ? 'Update Candidate' : 'Create Candidate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};