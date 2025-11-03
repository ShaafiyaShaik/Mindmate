'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  onShowAgents: () => void;
}

export default function Navigation({ onShowAgents }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Role-based navigation items
  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { href: '/student', label: 'Companion', icon: '💬', description: 'Personal chat' },
          { href: '/insights', label: 'Insights', icon: '📊', description: 'Your trends' },
          { href: '/resources', label: 'Resources', icon: '📚', description: 'Help & guides' },
          { href: '/data', label: 'Simulate', icon: '🧪', description: 'Test data' },
          { href: '/privacy', label: 'Privacy', icon: '🔒', description: 'Security' },
        ];
      case 'counselor':
        return [
          { href: '/counselor/alerts', label: 'Alerts', icon: '🚨', description: 'Triage queue' },
          { href: '/counselor/cases', label: 'My Cases', icon: '📋', description: 'Assigned cases' },
          { href: '/counselor/relay', label: 'Relay Chat', icon: '�', description: 'Anonymous chat' },
          { href: '/counselor/students', label: 'Students', icon: '👥', description: 'Anonymized roster' },
          { href: '/counselor/resources', label: 'Resources', icon: '�', description: 'Share materials' },
          { href: '/counselor/reports', label: 'Reports', icon: '📊', description: 'Analytics & exports' },
          { href: '/counselor/settings', label: 'Settings', icon: '⚙️', description: 'Protocols & help' },
        ];
      case 'admin':
        return [
          { href: '/admin/insights', label: 'Insights', icon: '📊', description: 'Campus analytics' },
          { href: '/admin/counselors', label: 'Counselors', icon: '👥', description: 'Staff management' },
          { href: '/admin/students', label: 'Students', icon: '🎓', description: 'Student overview' },
          { href: '/admin/settings', label: 'Settings', icon: '⚙️', description: 'System config' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-sage-200/50 shadow-soft">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-soft-blue-500 to-lavender-500 rounded-2xl flex items-center justify-center shadow-medium animate-float">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-xl font-display font-bold gradient-text">MindMate</h1>
                <p className="text-xs text-warm-gray-500 -mt-1">Student Wellness Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center">
            <div className="flex items-center space-x-1 bg-sage-50/70 rounded-2xl p-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    isActive(item.href)
                      ? 'bg-white text-soft-blue-700 shadow-medium'
                      : 'text-warm-gray-600 hover:text-warm-gray-800 hover:bg-white/60'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-xs text-warm-gray-400 group-hover:text-warm-gray-500">
                      {item.description}
                    </span>
                  </div>
                  {isActive(item.href) && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-soft-blue-500 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
            
            {/* Agents Toggle */}
            <button
              onClick={onShowAgents}
              className="ml-4 group px-4 py-3 rounded-xl text-sm font-medium text-warm-gray-600 hover:text-warm-gray-800 hover:bg-sage-50 transition-all duration-200 flex items-center space-x-2"
            >
              <span className="text-base group-hover:animate-gentle-pulse">🤖</span>
              <div className="flex flex-col">
                <span>Agents</span>
                <span className="text-xs text-warm-gray-400">AI System</span>
              </div>
            </button>
          </div>

          {/* Status & Profile */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-success-50 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-gentle-pulse"></div>
              <span className="text-xs font-medium text-success-700">System Healthy</span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-warm-gray-700">{user.username}</div>
                  <div className="text-xs text-warm-gray-500">
                    {user.role} • {user.dept} {user.year ? `Year ${user.year}` : ''}
                  </div>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-500 rounded-full flex items-center justify-center shadow-soft cursor-pointer">
                    <span className="text-white text-sm">
                      {user.role === 'student' ? '🎓' : user.role === 'counselor' ? '👨‍⚕️' : '👨‍💼'}
                    </span>
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {user.anon_id}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}