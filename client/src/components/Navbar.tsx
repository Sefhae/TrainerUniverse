import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/format';

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="h-8 w-8 transition-transform duration-200 group-hover:scale-110">
        <rect width="64" height="64" fill="#C8FF00" />
        <path d="M37 8 L16 38 H30 L28 56 L48 26 H34 Z" fill="#0A0A0A" />
      </svg>
      <span className="font-display text-2xl leading-none tracking-[0.08em] text-bone">
        FIT<span className="text-volt">CONNECT</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200',
      isActive ? 'text-volt' : 'text-bone/70 hover:text-bone'
    );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex">
          <NavLink to="/trainers" className={navLinkClass}>
            Find a Trainer
          </NavLink>
          <NavLink to="/register" className={navLinkClass}>
            Become a Trainer
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-sm btn-volt">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-bone/60 transition-colors duration-200 hover:text-bone"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-bone/70 transition-colors duration-200 hover:text-bone"
              >
                Log In
              </Link>
              <Link to="/register" className="btn btn-sm btn-volt">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="text-bone md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="animate-slide-down border-t border-white/10 bg-ink md:hidden">
          <nav className="flex flex-col px-5 py-4">
            <Link to="/trainers" className="py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bone/80">
              Find a Trainer
            </Link>
            <Link to="/register" className="py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bone/80">
              Become a Trainer
            </Link>
            <div className="mt-3 flex flex-col gap-2.5 border-t border-white/10 pt-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn btn-volt w-full">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline-light w-full">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-volt w-full">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-outline-light w-full">
                    Log In
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
