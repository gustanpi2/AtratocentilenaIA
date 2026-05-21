import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import toast from "react-hot-toast";

const INITIAL = { email: "", password: "" };

/* ─── Eye toggle button ──────────────────────────────────────────── */
const EyeToggle = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
    style={{
      position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 32, height: 32, borderRadius: 8,
      border: "none", background: "transparent", cursor: "pointer",
      color: "#9ca3af", transition: "color 0.15s, background 0.15s",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#22c55e"; (e.currentTarget as HTMLElement).style.background = "#f0fdf4"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
  >
    {visible ? <EyeIcon className="w-4 h-4" /> : <EyeCloseIcon className="w-4 h-4" />}
  </button>
);

/* ─── Spinner ────────────────────────────────────────────────────── */
const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "si-spin 0.8s linear infinite" }}>
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <style>{`@keyframes si-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
  </svg>
);

/* ─── SignInForm ─────────────────────────────────────────────────── */
export default function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { ruta } = useParams<{ ruta: string }>();
  const [form, setForm] = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      toast.error("Completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Bienvenido 🎉");
      navigate(ruta ? decodeURIComponent(ruta) : "/");
    } catch {
      toast.error("Credenciales incorrectas. Inténtalo de nuevo.");
      setForm(p => ({ ...p, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const invalid = !form.email.trim() || form.password.length < 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .si-root { font-family: 'Outfit', sans-serif; }

        /* Field base */
        .si-field {
          width: 100%; height: 44px;
          padding: 0 44px 0 14px;
          border-radius: 11px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; color: #111827;
          outline: none;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        .dark .si-field { background: #0f172a; border-color: #1e293b; color: #e2e8f0; }
        .si-field::placeholder { color: #9ca3af; }
        .dark .si-field::placeholder { color: #334155; }
        .si-field:focus {
          background: #fff; border-color: #84cc16;
          box-shadow: 0 0 0 3px rgba(132,204,22,0.14);
        }
        .dark .si-field:focus {
          background: #020817; border-color: #84cc16;
          box-shadow: 0 0 0 3px rgba(132,204,22,0.1);
        }

        /* Submit button */
        .si-submit {
          width: 100%; height: 46px;
          border-radius: 12px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: 0.01em;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(34,197,94,0.28);
        }
        .si-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(34,197,94,0.35);
        }
        .si-submit:active:not(:disabled) { transform: translateY(0); }
        .si-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Back link */
        .si-back {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 13px; color: #6b7280; text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .si-back:hover { color: #22c55e; }
        .dark .si-back { color: #334155; }
        .dark .si-back:hover { color: #84cc16; }

        /* Card */
        .si-card {
          background: #fff;
          border: 1.5px solid #f0f0f0;
          border-radius: 20px;
          padding: 36px 36px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
        }
        .dark .si-card {
          background: #0a1628;
          border-color: #1e293b;
          box-shadow: 0 4px 32px rgba(0,0,0,0.3);
        }

        /* Icon avatar */
        .si-avatar {
          width: 64px; height: 64px; border-radius: 18px;
          background: linear-gradient(135deg, #dcfce7, #f0fdf4);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 4px 16px rgba(34,197,94,0.18);
        }
        .dark .si-avatar {
          background: rgba(132,204,22,0.1);
          box-shadow: 0 4px 16px rgba(132,204,22,0.12);
        }

        /* Label */
        .si-label {
          display: block;
          font-size: 12.5px; font-weight: 600;
          color: #374151; letter-spacing: 0.02em;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .dark .si-label { color: #475569; }

        /* Required dot */
        .si-req { color: #f87171; margin-left: 2px; }

        /* Divider */
        .si-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 4px 0;
        }
        .si-divider-line {
          flex: 1; height: 1px; background: #f3f4f6;
        }
        .dark .si-divider-line { background: #0f172a; }
        .si-divider-text {
          font-size: 11px; color: #9ca3af; white-space: nowrap;
        }

        /* Forgot link */
        .si-forgot {
          font-size: 12.5px; font-weight: 500;
          color: #16a34a; text-decoration: none;
          transition: color 0.15s;
        }
        .si-forgot:hover { color: #15803d; text-decoration: underline; }
        .dark .si-forgot { color: #84cc16; }
        .dark .si-forgot:hover { color: #a3e635; }
      `}</style>

      <div className="si-root flex flex-col h-full py-8">
        {/* Back link */}
        <div style={{ marginBottom: 28 }}>
          <Link to="/" className="si-back">
            <ChevronLeftIcon className="w-4 h-4" />
            Volver a la aplicación
          </Link>
        </div>

        {/* Card */}
        <div className="si-card" style={{ flex: 1, maxWidth: 420, margin: "0 auto", width: "100%" }}>
          {/* Avatar + header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="si-avatar">
              <img src="/images/IconGeo.png" alt="Ícono" style={{ width: 36, height: 36, objectFit: "contain" }} />
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}
              className="dark:text-white">
              Bienvenido
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: "#9ca3af" }} className="dark:text-slate-500">
              Inicia sesión para acceder a la plataforma
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Email */}
            <div>
              <label className="si-label">
                Correo electrónico <span className="si-req">*</span>
              </label>
              <input
                name="email"
                type="text"
                value={form.email}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                autoComplete="email"
                className="si-field"
                style={{ paddingRight: 14 }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="si-label" style={{ margin: 0 }}>
                  Contraseña <span className="si-req">*</span>
                </label>
                <Link to="/forgot-password" className="si-forgot">
                  ¿La olvidaste?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="si-field"
                />
                <EyeToggle visible={showPassword} onToggle={() => setShowPassword(p => !p)} />
              </div>
            </div>

            {/* Submit */}
            <div style={{ marginTop: 4 }}>
              <button
                type="submit"
                disabled={loading || invalid}
                className="si-submit"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Verificando...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Acceder a la Plataforma
                  </>
                )}
              </button>
            </div>

            {/* Register link */}
            <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: "#9ca3af" }}
              className="dark:text-slate-600">
              ¿No tienes cuenta?{" "}
              <Link
                to="/signup"
                style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none" }}
                className="dark:text-lime-500"
              >
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}