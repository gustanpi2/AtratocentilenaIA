import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

interface Imagen { imagen: string }

const imagenes: Imagen[] = [
  { imagen: "AJRY4167.JPG" }, { imagen: "AZNT5727.JPG" },
  { imagen: "BGNQ8178.JPG" }, { imagen: "BTYI3160.JPG" },
  { imagen: "CMKS7199.JPG" }, { imagen: "CUPB8120.JPG" },
  { imagen: "DDHT8849.JPG" }, { imagen: "DIWZ5895.JPG" },
  { imagen: "DSSY8256.JPG" }, { imagen: "FWJZ3112.JPG" },
  { imagen: "LNKN7981.JPG" }, { imagen: "MGZZ4320.JPG" },
  { imagen: "NKJB4793.JPG" }, { imagen: "RQPA9933.JPG" },
  { imagen: "SSZG2119.JPG" }, { imagen: "UZEO7661.JPG" },
  { imagen: "VBIV5283.JPG" }, { imagen: "WTZB4461.JPG" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const imagenAleatoria = useMemo(() => {
    return imagenes[Math.floor(Math.random() * imagenes.length)].imagen;
  }, []);

  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .al-root { font-family: 'Outfit', sans-serif; }

        /* Panel image fade-in */
        .al-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.8s ease;
        }
        .al-img.loaded { opacity: 1; }
        .al-img.loading { opacity: 0; }

        /* Gradient overlay — richer than plain black */
        .al-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.62) 0%,
            rgba(5,30,18,0.55) 50%,
            rgba(0,0,0,0.70) 100%
          );
        }

        /* Decorative green glow in corner */
        .al-glow {
          position: absolute; z-index: 1;
          bottom: -120px; right: -120px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(132,204,22,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Right panel content */
        .al-panel-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100%; padding: 48px 52px;
          text-align: center;
        }

        /* Logo box */
        .al-logo-wrap {
          padding: 16px 28px;
          border-radius: 18px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.12);
          margin-bottom: 36px;
          transition: background 0.2s;
        }
        .al-logo-wrap:hover {
          background: rgba(255,255,255,0.13);
        }

        /* Stats row */
        .al-stats {
          display: flex; gap: 28px; margin-bottom: 36px;
        }
        .al-stat {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .al-stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px; font-weight: 700; color: #ffffff;
          line-height: 1;
        }
        .al-stat-label {
          font-size: 10.5px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .al-stat-sep {
          width: 1px; background: rgba(255,255,255,0.15);
          align-self: stretch; margin: 4px 0;
        }

        /* Quote card */
        .al-quote {
          max-width: 340px;
          padding: 20px 24px;
          border-radius: 16px;
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 28px;
        }
        .al-quote p {
          margin: 0; font-size: 14.5px;
          color: rgba(255,255,255,0.82);
          line-height: 1.65;
          font-weight: 400;
        }
        .al-quote strong { color: #ffffff; font-weight: 600; }

        /* Photo credit */
        .al-credit {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; color: rgba(255,255,255,0.4);
          letter-spacing: 0.04em;
        }
        .al-credit-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(132,204,22,0.7);
        }

        /* Live indicator */
        .al-live {
          position: absolute; top: 24px; right: 24px; z-index: 3;
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 99px;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(132,204,22,0.3);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #84cc16;
        }
        .al-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #84cc16;
          box-shadow: 0 0 8px rgba(132,204,22,0.7);
          animation: al-blink 2s ease-in-out infinite;
        }
        @keyframes al-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        /* Left (form) panel */
        .al-form-panel {
          position: relative;
          display: flex; flex-direction: column;
          flex: 1; width: 100%;
          min-height: 100vh;
          background: #f8fafc;
          overflow-y: auto;
          padding: 40px 24px;
        }
        .dark .al-form-panel { background: #020817; }

        @media (min-width: 1024px) {
          .al-form-panel { width: 50%; min-height: 0; }
        }

        /* Subtle grid texture */
        .al-form-panel::before {
          content: '';
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .dark .al-form-panel::before {
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
        }

        /* Green accent top bar */
        .al-top-bar {
          position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 100;
          background: linear-gradient(90deg, #22c55e, #84cc16, #16a34a);
        }
        @media (min-width: 1024px) {
          .al-top-bar { right: 50%; }
        }

        .al-form-inner { position: relative; z-index: 1; }
      `}</style>

      <div className="al-root flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Green top accent */}
        <div className="al-top-bar" />

        {/* ── Left: form panel ── */}
        <div className="al-form-panel">
          <div className="al-form-inner w-full max-w-md mx-auto flex flex-col min-h-full">
            {children}
          </div>
        </div>

        {/* ── Right: image panel ── */}
        <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden">
          <img
            src={`/images/ubi/${imagenAleatoria}`}
            alt="Paisaje del Chocó colombiano"
            className={`al-img ${loaded ? "loaded" : "loading"}`}
            onLoad={() => setLoaded(true)}
          />
          <div className="al-overlay" />
          <div className="al-glow" />

          {/* Live badge */}
          <div className="al-live">
            <span className="al-live-dot" />
            Sistema activo
          </div>

          <div className="al-panel-content">
            {/* Logo */}
            <Link to="/" className="al-logo-wrap">
              <img src="/images/mrv_logo.png" alt="MRV Monitor" style={{ height: 44, width: "auto" }} />
            </Link>

            {/* Stats */}
            <div className="al-stats">
              <div className="al-stat">
                <span className="al-stat-value">18+</span>
                <span className="al-stat-label">Estaciones</span>
              </div>
              <div className="al-stat-sep" />
              <div className="al-stat">
                <span className="al-stat-value">24/7</span>
                <span className="al-stat-label">Monitoreo</span>
              </div>
              <div className="al-stat-sep" />
              <div className="al-stat">
                <span className="al-stat-value">RT</span>
                <span className="al-stat-label">Tiempo real</span>
              </div>
            </div>

            {/* Quote */}
            <div className="al-quote">
              <p>
                Monitoreo ambiental en tiempo real para el <strong>Chocó Biogeográfico</strong>.
                Datos precisos para decisiones informadas.
              </p>
            </div>

            {/* Credit */}
            <div className="al-credit">
              <span className="al-credit-dot" />
              <span>mrvmonitor.com</span>
              <span className="al-credit-dot" />
              <span>Fotografía: Yuver Rengifo</span>
              <span className="al-credit-dot" />
            </div>
          </div>
        </div>

        {/* Theme toggler */}
        <div className="fixed z-50 bottom-5 right-5 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </>
  );
}