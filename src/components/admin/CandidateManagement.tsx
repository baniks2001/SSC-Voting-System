import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, User, Award, Layers } from 'lucide-react';
import { Candidate, Position } from '../../types';
import { api } from '../../utils/api';
import { positionApi } from '../../utils/positionApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const CandidateManagement: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const [candidateFormData, setCandidateFormData] = useState({
    name: '',
    party: '',
    position: ''
  });

  const [positionFormData, setPositionFormData] = useState({
    name: '',
    maxVotes: 1,
    order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCandidates(), fetchPositions()]);
    } catch (error: any) {
      showToast('error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates/admin');
      setCandidates(response);
    } catch (error: any) {
      showToast('error', 'Failed to fetch candidates');
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await positionApi.getPositions();
      setPositions(response);
    } catch (error: any) {
      showToast('error', 'Failed to fetch positions');
    }
  };

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCandidate) {
        await api.put(`/candidates/${editingCandidate.id}`, candidateFormData);
        showToast('success', 'Candidate updated successfully');
      } else {
        await api.post('/candidates', candidateFormData);
        showToast('success', 'Candidate created successfully');
      }
      setShowCandidateModal(false);
      resetCandidateForm();
      fetchCandidates();
    } catch (error: any) {
      showToast('error', error.message || 'Operation failed');
    }
  };

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPosition) {
        await positionApi.updatePosition(editingPosition.id, {
          name: positionFormData.name,
          maxVotes: positionFormData.maxVotes,
          order: positionFormData.order
        });
        showToast('success', 'Position updated successfully');
      } else {
        await positionApi.createPosition({
          name: positionFormData.name,
          maxVotes: positionFormData.maxVotes,
          order: positionFormData.order
        });
        showToast('success', 'Position created successfully');
      }
      setShowPositionModal(false);
      resetPositionForm();
      fetchPositions();
    } catch (error: any) {
      showToast('error', error.message || 'Operation failed');
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setCandidateFormData({
      name: candidate.name,
      party: candidate.party,
      position: candidate.position
    });
    setShowCandidateModal(true);
  };

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    setPositionFormData({
      name: position.name,
      maxVotes: position.maxVotes,
      order: position.order
    });
    setShowPositionModal(true);
  };

  const handleDeleteCandidate = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this candidate? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/candidates/${id}`);
      showToast('success', 'Candidate deleted successfully');
      // Remove candidate from local state immediately for better UX
      setCandidates(prev => prev.filter(candidate => candidate.id !== id));
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete candidate');
      // Refresh the list if there was an error
      fetchCandidates();
    }
  };

  const handleDeletePosition = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this position? This will also delete all associated candidates and cannot be undone.')) return;
    
    try {
      await positionApi.deletePosition(id);
      showToast('success', 'Position deleted successfully');
      // Remove position from local state immediately for better UX
      setPositions(prev => prev.filter(position => position.id !== id));
      // Also refresh candidates in case any were associated with this position
      fetchCandidates();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete position');
      // Refresh the list if there was an error
      fetchPositions();
    }
  };

  const resetCandidateForm = () => {
    setCandidateFormData({
      name: '',
      party: '',
      position: ''
    });
    setEditingCandidate(null);
  };

  const resetPositionForm = () => {
    setPositionFormData({
      name: '',
      maxVotes: 1,
      order: 0
    });
    setEditingPosition(null);
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
        <LoadingSpinner size="lg" text="Loading data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600">Manage election positions and candidates</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPositionModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Layers className="w-5 h-5" />
            <span>Create Position</span>
          </button>
          <button
            onClick={() => setShowCandidateModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Positions Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Positions</h2>
          <p className="text-gray-600">Manage available positions and voting limits</p>
        </div>
        <div className="card-body">
          {positions.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No positions created yet</p>
              <p className="text-sm text-gray-400 mt-2">Create your first position to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((position) => (
                <div key={position.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{position.name}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Max: {position.maxVotes}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <div>Order: {position.order}</div>
                    <div className={`text-xs ${position.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {position.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPosition(position)}
                      className="flex-1 btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePosition(position.id)}
                      className="flex-1 btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
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
                    onClick={() => handleEditCandidate(candidate)}
                    className="flex-1 btn-secondary btn-sm flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCandidate(candidate.id)}
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

      {/* Add/Edit Candidate Modal */}
      <Modal
        isOpen={showCandidateModal}
        onClose={() => {
          setShowCandidateModal(false);
          resetCandidateForm();
        }}
        title={editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
        size="md"
      >
        <form onSubmit={handleCandidateSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={candidateFormData.name}
              onChange={(e) => setCandidateFormData({ ...candidateFormData, name: e.target.value })}
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
              value={candidateFormData.party}
              onChange={(e) => setCandidateFormData({ ...candidateFormData, party: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Position</label>
            <select
              value={candidateFormData.position}
              onChange={(e) => setCandidateFormData({ ...candidateFormData, position: e.target.value })}
              className="form-input"
              required
            >
              <option value="">Select Position</option>
              {positions.map((position) => (
                <option key={position.id} value={position.name}>
                  {position.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCandidateModal(false);
                resetCandidateForm();
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

      {/* Add/Edit Position Modal */}
      <Modal
        isOpen={showPositionModal}
        onClose={() => {
          setShowPositionModal(false);
          resetPositionForm();
        }}
        title={editingPosition ? 'Edit Position' : 'Create New Position'}
        size="md"
      >
        <form onSubmit={handlePositionSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">
              <Layers className="w-4 h-4 inline mr-2" />
              Position Name
            </label>
            <input
              type="text"
              value={positionFormData.name}
              onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
              className="form-input"
              placeholder="e.g., President, Senator, Board Member, etc."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Maximum Votes Allowed
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={positionFormData.maxVotes}
              onChange={(e) => setPositionFormData({ ...positionFormData, maxVotes: parseInt(e.target.value) || 1 })}
              className="form-input"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Number of candidates a voter can select for this position
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Display Order
            </label>
            <input
              type="number"
              min="0"
              value={positionFormData.order}
              onChange={(e) => setPositionFormData({ ...positionFormData, order: parseInt(e.target.value) || 0 })}
              className="form-input"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Lower numbers appear first in the voting interface
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowPositionModal(false);
                resetPositionForm();
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {editingPosition ? 'Update Position' : 'Create Position'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};