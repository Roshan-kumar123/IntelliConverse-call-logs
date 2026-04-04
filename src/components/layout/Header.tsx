import { PhoneCall, LogOut, Radio } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function HeaderNav({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <PhoneCall className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-base tracking-tight">
            IntelliConverse
          </span>
          <span className="text-gray-300 text-sm mx-1">|</span>
          <span className="text-gray-500 text-sm">Analytics</span>

          <nav className="flex items-center gap-1 ml-4">
            <HeaderNav to="/calls">
              <PhoneCall className="w-3.5 h-3.5" />
              Call Logs
            </HeaderNav>
            <HeaderNav to="/live">
              <Radio className="w-3.5 h-3.5" />
              Live Calls
            </HeaderNav>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-gray-500">All Systems Operational</span>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-700 leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{user.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center select-none shrink-0">
                {getInitials(user.name)}
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
