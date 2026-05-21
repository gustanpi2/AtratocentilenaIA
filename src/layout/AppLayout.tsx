import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

/* ─── Layout Content ─────────────────────────────────────────────── */
const LayoutContent: React.FC = () => {
  //@ts-ignore
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const wide = isExpanded || isHovered;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        /* Layout root */
        .layout-root {
          min-height: 100dvh;
          display: flex;
          background: #f8fafc;
          font-family: 'Outfit', sans-serif;
        }
        .dark .layout-root {
          background: #020817;
        }

        /* Subtle grid texture for depth on light mode */
        .layout-root::before {
          content: '';
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .dark .layout-root::before {
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
        }

        /* Main column */
        .layout-main {
          position: relative; z-index: 1;
          flex: 1;
          display: flex; flex-direction: column;
          min-width: 0;
          transition: margin-left 0.28s cubic-bezier(.4,0,.2,1);
        }

        /* Content area */
        .layout-content {
          flex: 1;
          padding: 24px 20px;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .layout-content { padding: 28px 28px; }
        }
        @media (min-width: 1280px) {
          .layout-content { padding: 32px 36px; }
        }

        /* Scroll fade at top */
        .layout-main::after {
          content: '';
          position: sticky; top: 62px; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,197,94,0.12), transparent);
          z-index: 10;
          pointer-events: none;
        }
      `}</style>

      <div className="layout-root">
        {/* Sidebar + backdrop */}
        <AppSidebar />
        <Backdrop />

        {/* Main */}
        <main
          className="layout-main"
          style={{
            marginLeft: wide ? 268 : 70,
          }}
        >
          {/* Override margin on mobile */}
          <style>{`
            @media (max-width: 1023px) {
              .layout-main { margin-left: 0 !important; }
            }
          `}</style>

          <AppHeader />

          <div className="layout-content">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

/* ─── AppLayout ──────────────────────────────────────────────────── */
const AppLayout: React.FC = () => (
  <SidebarProvider>
    <LayoutContent />
  </SidebarProvider>
);

export default AppLayout;