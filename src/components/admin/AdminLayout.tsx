import React, { useState, ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Vote, 
  Monitor, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.isSuperAdmin ? [
      { id: 'admins', label: 'Add Admin', icon: UserPlus }
    ] : []),
    { id: 'candidates', label: 'Add Candidates', icon: Vote },
    { id: 'voters', label: 'Add Voters', icon: Users },
    { id: 'monitor', label: 'Poll Monitor', icon: Monitor }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar w-64 ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="../../src/assets/logo.png"
              alt="Logo"
              className="w-14 h-14 rounded-full"
            />
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden action-btn action-btn-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={`nav-item w-full text-left ${
                activeTab === item.id ? 'nav-item-active' : ''
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.isSuperAdmin ? 'Super Admin' : user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="nav-item w-full text-left text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex-1">
        <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="action-btn action-btn-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};