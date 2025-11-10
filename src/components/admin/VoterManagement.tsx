import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, Download, User, GraduationCap, Hash, Key, RefreshCw, CheckSquare, Square, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { Voter } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface ExportOptions {
  studentId: boolean;
  fullName: boolean;
  course: boolean;
  yearLevel: boolean;
  section: boolean;
  hasVoted: boolean;
  votedAt: boolean;
  createdAt: boolean;
  password: boolean;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

export const VoterManagement: React.FC = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    year: '',
    section: '',
    hasVoted: ''
  });
  const [selectedExportCourses, setSelectedExportCourses] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentSelection, setShowStudentSelection] = useState(false);
  const { showToast } = useToast();

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    studentId: true,
    fullName: true,
    course: true,
    yearLevel: true,
    section: true,
    hasVoted: true,
    votedAt: false,
    createdAt: false,
    password: true
  });

  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    course: '',
    yearLevel: 1,
    section: '',
    password: ''
  });

  useEffect(() => {
    fetchVoters();
    fetchCourses();
  }, []);

  const fetchVoters = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.course) params.append('course', filters.course);
      if (filters.year) params.append('year', filters.year);
      if (filters.section) params.append('section', filters.section);
      if (filters.hasVoted) params.append('hasVoted', filters.hasVoted);

      const response = await api.get(`/voters?${params.toString()}`);
      
      // Handle potential structured response
      const votersData = response.data || response;
      setVoters(Array.isArray(votersData) ? votersData : []);
      
    } catch (error: any) {
      showToast('error', 'Failed to fetch voters');
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response);
    } catch (error: any) {
      showToast('error', 'Failed to fetch courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fixed search functionality - debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        fetchVoters();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters.course, filters.year, filters.section, filters.hasVoted]);

  // Get unique courses from actual voter data (not from courses API)
  const getUniqueCoursesFromVoters = () => {
    return [...new Set(voters.map(v => v.course))].filter(Boolean).sort();
  };

  // Filter students based on search term for selection modal
  const filteredStudents = voters.filter(voter =>
    voter.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    voter.student_id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Toggle individual student selection
  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select all filtered students
  const selectAllFilteredStudents = () => {
    const filteredIds = filteredStudents.map(student => student.id);
    setSelectedStudents(filteredIds);
  };

  // Clear all student selections
  const clearAllStudents = () => {
    setSelectedStudents([]);
  };

  // Delete all selected students
  const handleDeleteAll = async () => {
    if (selectedStudents.length === 0) {
      showToast('warning', 'No voters selected for deletion');
      return;
    }

    setShowDeleteModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      setDeleting(true);
      
      // Delete voters one by one
      for (const studentId of selectedStudents) {
        await api.delete(`/voters/${studentId}`);
      }

      showToast('success', `Successfully deleted ${selectedStudents.length} voter(s)`);
      setSelectedStudents([]);
      setShowDeleteModal(false);
      fetchVoters();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete voters');
    } finally {
      setDeleting(false);
    }
  };

  // Generate password function
  const generatePassword = () => {
    const { studentId, fullName, yearLevel, section } = formData;

    if (!fullName.trim()) {
      showToast('warning', 'Please enter full name first');
      return;
    }

    if (!studentId.trim()) {
      showToast('warning', 'Please enter student ID first');
      return;
    }

    try {
      const lastThreeDigits = studentId.trim().slice(-3);
      const nameParts = fullName.trim().split(/\s+/);
      const initials = nameParts.map(part => part.charAt(0).toLowerCase()).join('');
      const cleanSection = (section || '').replace(/\s+/g, '').toLowerCase();
      const generatedPassword = `${initials}${yearLevel}${cleanSection}-${lastThreeDigits}`;

      setFormData({ ...formData, password: generatedPassword });
      showToast('success', 'Password generated successfully');
    } catch (error) {
      console.error('Password generation error:', error);
      showToast('error', 'Failed to generate password');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVoter) {
        await api.put(`/voters/${editingVoter.id}`, formData);
        showToast('success', 'Voter updated successfully');
      } else {
        await api.post('/voters', formData);
        showToast('success', 'Voter created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchVoters();
    } catch (error: any) {
      showToast('error', error.message || 'Operation failed');
    }
  };

  const handleEdit = (voter: Voter) => {
    setEditingVoter(voter);
    setFormData({
      studentId: voter.student_id,
      fullName: voter.full_name,
      course: voter.course,
      yearLevel: voter.year_level,
      section: voter.section,
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this voter?')) return;

    try {
      await api.delete(`/voters/${id}`);
      showToast('success', 'Voter deleted successfully');
      fetchVoters();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete voter');
    }
  };

  const toggleExportOption = (option: keyof ExportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const toggleAllExportOptions = (selectAll: boolean) => {
    setExportOptions({
      studentId: selectAll,
      fullName: selectAll,
      course: selectAll,
      yearLevel: selectAll,
      section: selectAll,
      hasVoted: selectAll,
      votedAt: selectAll,
      createdAt: selectAll,
      password: selectAll
    });
  };

  const toggleExportCourse = (course: string) => {
    setSelectedExportCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const selectAllExportCourses = () => {
    const allCourses = getUniqueCoursesFromVoters();
    setSelectedExportCourses(allCourses);
  };

  const clearAllExportCourses = () => {
    setSelectedExportCourses([]);
  };

  const simulateProgress = () => {
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  // Handle export function
  const handleExport = async () => {
    try {
      console.log('🔄 Export process started...');
      
      const selectedOptions = Object.entries(exportOptions)
        .filter(([, value]) => value)
        .map(([key]) => key);
      
      if (selectedOptions.length === 0) {
        showToast('warning', 'Please select at least one field to export');
        return;
      }

      console.log('📊 Selected export options:', selectedOptions);

      setExporting(true);
      const progressInterval = simulateProgress();

      const params = new URLSearchParams();

      // Add selected fields to params - FIXED: use correct parameter name
      selectedOptions.forEach(field => {
        params.append('include[]', field);
      });
      console.log('✅ Added export fields:', selectedOptions);

      // Add selected student IDs if any are selected
      if (selectedStudents.length > 0) {
        selectedStudents.forEach(id => {
          params.append('studentIds', id.toString());
        });
        console.log('✅ Added student IDs:', selectedStudents);
      }

      // Use course filters if no specific students selected
      if (selectedStudents.length === 0 && selectedExportCourses.length > 0) {
        selectedExportCourses.forEach(course => {
          params.append('courses', course);
        });
        console.log('✅ Added course filters:', selectedExportCourses);
      }

      // Apply current filters if no specific selection
      if (selectedStudents.length === 0) {
        if (filters.course) {
          params.append('course', filters.course);
        }
        if (filters.year) {
          params.append('year', filters.year);
        }
        if (filters.section) {
          params.append('section', filters.section);
        }
        if (filters.hasVoted) {
          params.append('hasVoted', filters.hasVoted);
        }
        if (searchTerm) {
          params.append('search', searchTerm);
        }
      }

      // Request password generation
      if (exportOptions.password) {
        params.append('decryptPasswords', 'true');
      }

      const apiUrl = `/voters/export?${params.toString()}`;
      console.log('🌐 API URL:', apiUrl);

      const response = await api.get(apiUrl);
      console.log('📨 API Response:', response);

      clearInterval(progressInterval);
      setExportProgress(100);

      // Handle response
      let exportData = response;
      
      if (response && typeof response === 'object') {
        if (response.success === false) {
          throw new Error(response.error || 'Export failed');
        }
        
        if (response.data !== undefined) {
          exportData = response.data;
        }
      }

      if (!exportData || exportData.length === 0) {
        showToast('warning', 'No data found for the selected filters');
        setExporting(false);
        setExportProgress(0);
        return;
      }

      console.log('📊 Data to export:', exportData[0]); // Log first record

      // Convert to CSV
      const csvContent = convertToCSV(exportData);
      const filename = `voters_export_${new Date().toISOString().split('T')[0]}.csv`;

      downloadCSV(csvContent, filename);

      setTimeout(() => {
        setShowExportModal(false);
        setExporting(false);
        setExportProgress(0);
        setSelectedStudents([]);
        setStudentSearch('');
        showToast('success', `Exported ${exportData.length} record(s) successfully`);
      }, 500);

    } catch (error: any) {
      console.error('❌ Export error:', error);
      setExporting(false);
      setExportProgress(0);
      showToast('error', error.message || 'Failed to export data');
    }
  };

  // Convert to CSV function
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    // Get all unique keys from the first object
    const firstItem = data[0];
    if (!firstItem) return '';
    
    const keys = Object.keys(firstItem);
    if (keys.length === 0) return '';

    console.log('📋 CSV keys found:', keys);

    // Map database keys to friendly headers
    const headerMap: { [key: string]: string } = {
      'student_id': 'Student ID',
      'full_name': 'Full Name', 
      'course': 'Course',
      'year_level': 'Year Level',
      'section': 'Section',
      'has_voted': 'Voting Status',
      'voted_at': 'Voted At',
      'created_at': 'Registered At',
      'password': 'Password'
    };

    const headers = keys.map(key => headerMap[key] || key);

    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        keys.map(key => {
          let value = row[key] || '';
          
          // Handle values that might contain commas or special characters
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = value.replace(/"/g, '""'); // Escape double quotes
            return `"${value}"`;
          }
          
          return value;
        }).join(',')
      )
    ];

    console.log('📄 CSV content preview:', csvRows.slice(0, 2).join('\n'));
    return csvRows.join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      fullName: '',
      course: '',
      yearLevel: 1,
      section: '',
      password: ''
    });
    setEditingVoter(null);
  };

  const filteredVoters = voters;
  const uniqueCourses = getUniqueCoursesFromVoters();
  const uniqueYears = [...new Set(voters.map(v => v.year_level.toString()))];
  const uniqueSections = [...new Set(voters.map(v => v.section))];

  if (loading || coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading voters..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voter Management</h1>
          <p className="text-gray-600">Manage student voters and their information</p>
        </div>
        <div className="flex space-x-3">
          {selectedStudents.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="btn-danger flex items-center space-x-2"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Selected ({selectedStudents.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Voter</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="search-bar">
                <Search className="search-icon w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by Student ID or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div>
              <select
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                className="form-input"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="form-input"
              >
                <option value="">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filters.section}
                onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                className="form-input"
              >
                <option value="">All Sections</option>
                {uniqueSections.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filters.hasVoted}
                onChange={(e) => setFilters({ ...filters, hasVoted: e.target.value })}
                className="form-input"
              >
                <option value="">All Status</option>
                <option value="voted">Has Voted</option>
                <option value="not_voted">Not Voted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Voters Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Student Voters ({filteredVoters.length})
            {selectedStudents.length > 0 && (
              <span className="ml-2 text-sm text-blue-600">
                ({selectedStudents.length} selected)
              </span>
            )}
          </h2>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === voters.length && voters.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(voters.map(v => v.id));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th>Student Details</th>
                  <th>Course & Year</th>
                  <th>Section</th>
                  <th>Voting Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No voters found
                    </td>
                  </tr>
                ) : (
                  filteredVoters.map((voter) => (
                    <tr key={voter.id} className={selectedStudents.includes(voter.id) ? 'bg-blue-50' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(voter.id)}
                          onChange={() => toggleStudentSelection(voter.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{voter.full_name}</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Hash className="w-3 h-3 mr-1" />
                              {voter.student_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{voter.course}</p>
                            <p className="text-sm text-gray-600">Year {voter.year_level}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-gray">
                          Section {voter.section}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${voter.has_voted ? 'badge-success' : 'badge-warning'}`}>
                          {voter.has_voted ? 'Voted' : 'Not Voted'}
                        </span>
                        {voter.has_voted && voter.voted_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(voter.voted_at).toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="text-sm text-gray-600">
                        {new Date(voter.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(voter)}
                            className="action-btn action-btn-primary"
                            title="Edit Voter"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(voter.id)}
                            className="action-btn action-btn-danger"
                            title="Delete Voter"
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
        title={editingVoter ? 'Edit Voter' : 'Add New Voter'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <Hash className="w-4 h-4 inline mr-2" />
                Student ID
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
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
          </div>

          <div className="form-group">
            <label className="form-label">
              <GraduationCap className="w-4 h-4 inline mr-2" />
              Course
            </label>
            <div className="relative">
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="form-input pr-10"
                required
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Year Level</label>
              <select
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: parseInt(e.target.value) })}
                className="form-input"
                required
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex items-center justify-between mb-2">
              <label className="form-label">
                <Key className="w-4 h-4 inline mr-2" />
                Password {editingVoter && '(leave blank to keep current)'}
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="btn-secondary flex items-center space-x-1 text-xs py-1 px-2"
                title="Generate password from full name, year, and section"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Auto Generate</span>
              </button>
            </div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
              required={!editingVoter}
              minLength={6}
            />
            {formData.password && (
              <p className="text-xs text-gray-500 mt-1">
                Generated password: <span className="font-mono">{formData.password}</span>
              </p>
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
              {editingVoter ? 'Update Voter' : 'Create Voter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Selected Voters"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">Warning: This action cannot be undone</p>
                <p className="text-xs text-red-700 mt-1">
                  You are about to delete {selectedStudents.length} voter(s). This will permanently remove all selected voter accounts and their data.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to delete the selected voters?
          </p>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 btn-secondary"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteAll}
              className="flex-1 btn-danger flex items-center justify-center"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedStudents.length})
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Export Selection Modal - Landscape Layout */}
      <Modal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setExporting(false);
          setExportProgress(0);
          setSelectedStudents([]);
          setStudentSearch('');
        }}
        title="Export Voters Data"
        size="xl" // Increased size for landscape layout
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Password Decryption</p>
                <p className="text-xs text-yellow-700">
                  Hashed passwords from the database will be decrypted to plain text during export.
                  This process may take a few moments for large datasets.
                </p>
              </div>
            </div>
          </div>

          {/* Landscape Layout Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Left Column - Student Selection */}
            <div className="lg:col-span-1 space-y-4">
              {/* Student Selection */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium text-gray-700">Select Students:</p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowStudentSelection(!showStudentSelection)}
                      className="btn-secondary text-xs py-1 px-2"
                    >
                      {showStudentSelection ? 'Hide' : 'Select'}
                    </button>
                  </div>
                </div>

                {showStudentSelection && (
                  <div className="space-y-3">
                    <div className="search-bar">
                      <Search className="search-icon w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="search-input text-sm"
                      />
                    </div>

                    <div className="max-h-32 overflow-y-auto border rounded">
                      {filteredStudents.length === 0 ? (
                        <p className="text-center py-4 text-gray-500 text-sm">No students found</p>
                      ) : (
                        filteredStudents.map(student => (
                          <label
                            key={student.id}
                            className="flex items-center space-x-2 p-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{student.full_name}</p>
                              <p className="text-xs text-gray-600 truncate">{student.student_id}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">
                        {selectedStudents.length} selected
                      </span>
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={selectAllFilteredStudents}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Select All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          type="button"
                          onClick={clearAllStudents}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!showStudentSelection && (
                  <p className="text-sm text-gray-600">
                    {selectedStudents.length > 0
                      ? `${selectedStudents.length} student(s) selected`
                      : 'All students will be exported'
                    }
                  </p>
                )}
              </div>

              {/* Course Selection (only show if no specific students selected) */}
              {selectedStudents.length === 0 && (
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-medium text-gray-700">Filter by Course:</p>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={selectAllExportCourses}
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        All
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        type="button"
                        onClick={clearAllExportCourses}
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uniqueCourses.map(course => (
                      <label key={course} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedExportCourses.includes(course)}
                          onChange={() => toggleExportCourse(course)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 truncate">{course}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Field Selection (Landscape) */}
            <div className="lg:col-span-2">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium text-gray-700">Select fields to export:</p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleAllExportOptions(true)}
                      className="btn-secondary text-xs py-1 px-2"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllExportOptions(false)}
                      className="btn-secondary text-xs py-1 px-2"
                    >
                      None
                    </button>
                  </div>
                </div>

                {/* Landscape-oriented grid */}
                <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2">
                  {Object.entries(exportOptions).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                      <button
                        type="button"
                        onClick={() => toggleExportOption(key as keyof ExportOptions)}
                        className="flex items-center space-x-2 w-full text-left"
                      >
                        {value ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700 flex-1">
                          {key === 'studentId' ? 'Student ID' :
                            key === 'fullName' ? 'Full Name' :
                              key === 'yearLevel' ? 'Year Level' :
                                key === 'hasVoted' ? 'Voting Status' :
                                  key === 'votedAt' ? 'Voted At' :
                                    key === 'createdAt' ? 'Registered At' :
                                      key === 'password' ? 'Password' :
                                        key}
                        </span>
                      </button>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {exporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Exporting data...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowExportModal(false);
                setExporting(false);
                setExportProgress(0);
                setSelectedStudents([]);
                setStudentSearch('');
              }}
              className="flex-1 btn-secondary"
              disabled={exporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex-1 btn-primary flex items-center justify-center"
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Exporting... ({exportProgress}%)
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {selectedStudents.length === 1 ? 'Export Student' : 'Export Data'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  
  );
};