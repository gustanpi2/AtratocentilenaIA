import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { LogoutButton } from "../components/auth/LogoutButton";
import { useAuth } from "../context/AuthContext";

/* ─── SVG Icons ──────────────────────────────────────────────────── */
const IconMenuOpen = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4.5" width="16" height="1.8" rx="0.9" fill="currentColor" />
    <rect x="2" y="9.1" width="11" height="1.8" rx="0.9" fill="currentColor" />
    <rect x="2" y="13.7" width="16" height="1.8" rx="0.9" fill="currentColor" />
  </svg>
);

const IconMenuClose = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.9" />
    <path d="M13.5 13.5L17.5 17.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

const IconDots = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="4.5" cy="10" r="1.5" fill="currentColor" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

/* ─── AppHeader ──────────────────────────────────────────────────── */
const AppHeader: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { isAuthenticated } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .ah-root { font-family: 'Outfit', sans-serif; }
        .ah-root .mono { font-family: 'JetBrains Mono', monospace; }

        /* Icon button */
        .ah-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          background: #fff; cursor: pointer;
          color: #6b7280;
          transition: color 0.18s, background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.12s;
        }
        .dark .ah-icon-btn {
          background: #0f172a; border-color: #1e293b; color: #94a3b8;
        }
        .ah-icon-btn:hover {
          color: #16a34a; background: #f0fdf4; border-color: #86efac;
          box-shadow: 0 2px 8px rgba(22,163,74,0.1);
        }
        .dark .ah-icon-btn:hover {
          color: #84cc16; background: rgba(132,204,22,0.07);
          border-color: rgba(132,204,22,0.28); box-shadow: 0 2px 8px rgba(132,204,22,0.1);
        }
        .ah-icon-btn:active { transform: scale(0.93); }

        /* Search */
        .ah-search { position: relative; width: 100%; max-width: 420px; }
        .ah-search input {
          width: 100%; height: 40px;
          padding: 0 52px 0 42px;
          border-radius: 11px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; color: #111827;
          outline: none;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        .dark .ah-search input {
          background: #0f172a; border-color: #1e293b; color: #e2e8f0;
        }
        .ah-search input::placeholder { color: #9ca3af; }
        .dark .ah-search input::placeholder { color: #475569; }
        .ah-search input:focus {
          background: #ffffff; border-color: #84cc16;
          box-shadow: 0 0 0 3px rgba(132,204,22,0.14);
        }
        .dark .ah-search input:focus {
          background: #020817; border-color: #84cc16;
          box-shadow: 0 0 0 3px rgba(132,204,22,0.1);
        }
        .ah-search-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: #9ca3af; pointer-events: none;
          transition: color 0.2s;
        }
        .ah-search:focus-within .ah-search-icon { color: #84cc16; }
        .ah-kbd {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; gap: 2px;
          padding: 2px 7px; border-radius: 6px;
          border: 1px solid #e5e7eb; background: #f3f4f6;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: #9ca3af;
          pointer-events: none;
          transition: all 0.2s;
        }
        .dark .ah-kbd { background: #1e293b; border-color: #334155; color: #64748b; }
        .ah-search:focus-within .ah-kbd {
          border-color: rgba(132,204,22,0.4); color: #84cc16; background: #f0fdf4;
        }
        .dark .ah-search:focus-within .ah-kbd {
          background: rgba(132,204,22,0.08); border-color: rgba(132,204,22,0.25); color: #84cc16;
        }

        /* Separator */
        .ah-sep { width: 1px; height: 22px; background: #e5e7eb; border-radius: 99px; flex-shrink: 0; }
        .dark .ah-sep { background: #1e293b; }
      `}</style>

      <header
        className="ah-root sticky top-0 z-[9999] w-full dark:border-slate-800/70"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(229,231,235,0.9)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.03), 0 2px 16px rgba(0,0,0,0.04)",
        }}
      >
        {/* Dark overlay */}
        <div
          className="dark:block hidden"
          style={{
            position: "absolute", inset: 0, zIndex: -1,
            background: "rgba(2,8,23,0.97)",
            borderBottom: "1px solid rgba(30,41,59,0.9)",
          }}
        />

        <div className="flex flex-col lg:flex-row items-center lg:px-6">

          {/* ── Row 1: Left zone ── */}
          <div className="flex items-center gap-3 w-full px-4 py-3 lg:px-0 lg:h-[62px] lg:flex-1">

            {/* Sidebar toggle */}
            <button onClick={handleToggle} className="ah-icon-btn" aria-label="Menú lateral">
              {isMobileOpen ? <IconMenuClose /> : <IconMenuOpen />}
            </button>

            {/* Mobile logo */}
            <Link to="/" className="lg:hidden flex-1 flex justify-center">
              <img className="dark:hidden h-8 w-auto" src="/images/LOGO-2-0.png" alt="Logo" />
              <img className="hidden dark:block h-8 w-auto" src="/images/logo/logo-dark.svg" alt="Logo oscuro" />
            </Link>

            {/* Desktop search bar */}
            <div className="hidden lg:flex flex-1 mx-4">
              <div className="ah-search">
                <span className="ah-search-icon"><IconSearch /></span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar estaciones, sensores, usuarios..."
                />
                <span className="ah-kbd mono">⌘ K</span>
              </div>
            </div>

            {/* Mobile dots */}
            <button
              className="ah-icon-btn lg:hidden"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Más opciones"
            >
              <IconDots />
            </button>
          </div>

          {/* ── Row 2: Right actions ── */}
          <div
            className={`
              flex items-center gap-3 w-full px-4 pb-3 lg:pb-0 lg:flex lg:w-auto
              ${isMenuOpen ? "flex" : "hidden"}
            `}
            style={isMenuOpen ? { borderTop: "1px solid rgba(229,231,235,0.7)" } : {}}
          >
            {/* Mobile search */}
            <div className="lg:hidden w-full mb-1">
              <div className="ah-search" style={{ maxWidth: "100%" }}>
                <span className="ah-search-icon"><IconSearch /></span>
                <input type="text" placeholder="Buscar..." />
              </div>
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="ah-sep hidden lg:block" />
              <ThemeToggleButton />
              {isAuthenticated && (
                <>
                  <span className="ah-sep" />
                  <LogoutButton />
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default AppHeader;