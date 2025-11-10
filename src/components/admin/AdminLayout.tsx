import React, { useState, ReactNode, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Vote, 
  Monitor, 
  Menu, 
  X,
  LogOut,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange,
  onLogout
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const getNavItems = () => {
    if (!user) return [];
    
    const userRole = user.role || user.type;
    
    console.log('🛡️ User Role:', userRole, 'Building navigation...');

    // Poll Monitor: ONLY Poll Monitor tab
    if (userRole === 'poll_monitor') {
      console.log('🔒 Poll Monitor detected - showing only Poll Monitor tab');
      return [
        { id: 'monitor', label: 'Poll Monitor', icon: Monitor }
      ];
    }

    // Auditor: ONLY Dashboard tab
    if (userRole === 'auditor') {
      console.log('🔒 Auditor detected - showing only Dashboard tab');
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ];
    }

    // Admin: Dashboard, Add Candidates, Add Voters, Poll Monitor
    if (userRole === 'admin') {
      console.log('🔒 Admin detected - showing Dashboard, Candidates, Voters, Poll Monitor');
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'candidates', label: 'Add Candidates', icon: Vote },
        { id: 'voters', label: 'Add Voters', icon: Users },
        { id: 'monitor', label: 'Poll Monitor', icon: Monitor }
      ];
    }

    // Super Admin: Everything including Add Admin
    if (userRole === 'super_admin' || userRole === 'super_admin') {
      console.log('🔓 Super Admin detected - showing all tabs');
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admins', label: 'Add Admin', icon: UserPlus },
        { id: 'candidates', label: 'Add Candidates', icon: Vote },
        { id: 'voters', label: 'Add Voters', icon: Users },
        { id: 'monitor', label: 'Poll Monitor', icon: Monitor }
      ];
    }

    // Default fallback (should not happen)
    console.warn('⚠️ Unknown role:', userRole);
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];
  };

  const navItems = getNavItems();

  // Ensure users stay on their allowed tabs
  useEffect(() => {
    if (user && navItems.length > 0) {
      const currentTabIsAllowed = navItems.some(item => item.id === activeTab);
      if (!currentTabIsAllowed) {
        console.log('🔄 Redirecting to allowed tab:', navItems[0].id);
        onTabChange(navItems[0].id);
      }
    }
  }, [user, navItems, activeTab, onTabChange]);

  const getPanelTitle = () => {
    if (!user) return 'Admin Panel';
    
    const userRole = user.role || user.type;
    
    if (userRole === 'poll_monitor') return 'Poll Monitor';
    if (userRole === 'auditor') return 'Auditor Dashboard';
    if (userRole === 'admin') return 'Admin Panel';
    if (userRole === 'super_admin' || userRole === 'super_admin') return 'Super Admin Panel';
    
    return 'Admin Panel';
  };

  const getRoleDisplay = () => {
    if (!user) return 'Loading...';
    
    const userRole = user.role || user.type;
    
    if (userRole === 'poll_monitor') return 'Poll Monitor (View Only)';
    if (userRole === 'auditor') return 'Auditor (View Only)';
    if (userRole === 'admin') return 'Admin';
    if (userRole === 'super_admin' || userRole === 'super_admin') return 'Super Admin';
    
    return userRole || 'User';
  };

  const isViewOnly = () => {
    if (!user) return false;
    
    const userRole = user.role || user.type;
    return userRole === 'poll_monitor' || userRole === 'auditor';
  };

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
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {getPanelTitle()}
              </h1>
              {isViewOnly() && (
                <span className="text-xs text-blue-600 font-medium flex items-center mt-1">
                  <Eye className="w-3 h-3 mr-1" />
                  View Only Access
                </span>
              )}
            </div>
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
              {isViewOnly() && (
                <span className="ml-2 text-xs text-blue-600">(View Only)</span>
              )}
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
                {user?.fullName || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {getRoleDisplay()}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
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
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {getPanelTitle()}
              </h1>
              {isViewOnly() && (
                <span className="text-xs text-blue-600 font-medium flex items-center mt-1">
                  <Eye className="w-3 h-3 mr-1" />
                  View Only Access
                </span>
              )}
            </div>
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