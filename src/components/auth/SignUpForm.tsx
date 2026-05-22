import { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Checkbox from "../form/input/Checkbox";
import AccountValidation from "./AccountValidation";
import Helper from "../../service/Helper";

interface SignUpData {
  nombre: string; apellido: string; username: string;
  email: string; password: string; confirmPassword: string;
}

/* ─── Spinner ────────────────────────────────────────────────────── */
const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "su-spin 0.8s linear infinite" }}>
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <style>{`@keyframes su-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
  </svg>
);

/* ─── Strength meter ─────────────────────────────────────────────── */
const PasswordStrength = ({ password }: { password: string }) => {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = ["#e5e7eb", "#f87171", "#fb923c", "#facc15", "#22c55e"];
  const color = score > 0 ? colors[score] : colors[0];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= score ? color : "#f0f0f0",
            transition: "background 0.25s",
          }} className="dark:bg-slate-800" />
        ))}
      </div>
      {score > 0 && (
        <p style={{ margin: 0, fontSize: 11, color, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
          {labels[score]}
        </p>
      )}
    </div>
  );
};

/* ─── EyeToggle ──────────────────────────────────────────────────── */
const EyeToggle = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
    style={{
      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 30, height: 30, borderRadius: 7,
      border: "none", background: "transparent", cursor: "pointer",
      color: "#9ca3af", transition: "color 0.15s, background 0.15s",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#22c55e"; (e.currentTarget as HTMLElement).style.background = "#f0fdf4"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
  >
    {visible ? <EyeIcon className="w-4 h-4" /> : <EyeCloseIcon className="w-4 h-4" />}
  </button>
);

/* ─── Step indicator ─────────────────────────────────────────────── */
const StepIndicator = ({ step }: { step: 1 | 2 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, justifyContent: "center" }}>
    {[1, 2].map((s, i) => (
      <>
        <div
          key={s}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: s <= step ? "#22c55e" : "#f3f4f6",
            color: s <= step ? "#fff" : "#9ca3af",
            fontSize: 12, fontWeight: 700,
            transition: "all 0.3s",
            boxShadow: s === step ? "0 0 0 4px rgba(34,197,94,0.18)" : "none",
          }}
        >
          {s < step ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : s}
        </div>
        {i === 0 && (
          <div style={{ width: 48, height: 2, background: step > 1 ? "#22c55e" : "#f3f4f6", transition: "background 0.3s" }} />
        )}
      </>
    ))}
  </div>
);

/* ─── SignUpForm ─────────────────────────────────────────────────── */
export default function SignUpForm() {
  const [form, setForm] = useState<SignUpData>({
    nombre: "", apellido: "", username: "",
    email: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!form.nombre || !form.apellido || !form.username) {
      Swal.fire({ icon: "error", title: "Campos incompletos", text: "Todos los campos son obligatorios", confirmButtonColor: "#22c55e" });
      return false;
    }
    if (!form.email.includes("@")) {
      Swal.fire({ icon: "error", title: "Email inválido", text: "Ingresa un correo electrónico válido", confirmButtonColor: "#22c55e" });
      return false;
    }
    if (form.password.length < 6) {
      Swal.fire({ icon: "error", title: "Contraseña débil", text: "Mínimo 6 caracteres", confirmButtonColor: "#22c55e" });
      return false;
    }
    if (form.password !== form.confirmPassword) {
      Swal.fire({ icon: "error", title: "No coinciden", text: "Las contraseñas no son iguales", confirmButtonColor: "#22c55e" });
      return false;
    }
    if (!isChecked) {
      Swal.fire({ icon: "warning", title: "Términos requeridos", text: "Debes aceptar los términos y condiciones", confirmButtonColor: "#22c55e" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const searchRes = await fetch(`${Helper.url}auth/SignUp/search/mail`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email: form.email }),
      });
      const searchData = await searchRes.json();
      if (searchData.existe) {
        Swal.fire({ icon: "error", title: "Email en uso", text: "Ya existe una cuenta con este correo", confirmButtonColor: "#22c55e" });
        setLoading(false);
        return;
      }
      const signUpRes = await fetch("https://api.helsy.com.co/SignUp.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          nombre: form.nombre, apellido: form.apellido,
          username: form.username, email: form.email, password: form.password,
        }),
      });
      if (signUpRes.ok) {
        Swal.fire({ icon: "success", title: "¡Cuenta creada!", text: "Revisa tu correo para validar tu cuenta", confirmButtonColor: "#22c55e" });
        setEnviado(true);
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error de conexión", text: "No se pudo conectar con el servidor", confirmButtonColor: "#22c55e" });
    } finally {
      setLoading(false);
    }
  };

  if (enviado) return <AccountValidation />;

  const step1Complete = form.nombre && form.apellido && form.username;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .su-root { font-family: 'Outfit', sans-serif; }

        .su-field {
          width: 100%; height: 44px;
          padding: 0 14px;
          border-radius: 11px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; color: #111827;
          outline: none;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .dark .su-field { background: #0f172a; border-color: #1e293b; color: #e2e8f0; }
        .su-field::placeholder { color: #9ca3af; }
        .dark .su-field::placeholder { color: #334155; }
        .su-field:focus {
          background: #fff; border-color: #84cc16;
          box-shadow: 0 0 0 3px rgba(132,204,22,0.14);
        }
        .dark .su-field:focus {
          background: #020817; border-color: #84cc16;
          box-shadow: 0 0 0 3px rgba(132,204,22,0.1);
        }
        .su-field-pw { padding-right: 44px; }

        .su-label {
          display: block;
          font-size: 12px; font-weight: 600;
          color: #374151; letter-spacing: 0.02em;
          margin-bottom: 5px; text-transform: uppercase;
        }
        .dark .su-label { color: #475569; }

        .su-card {
          background: #fff;
          border: 1.5px solid #f0f0f0;
          border-radius: 20px;
          padding: 32px 32px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          max-width: 440px; margin: 0 auto; width: 100%;
        }
        .dark .su-card {
          background: #0a1628; border-color: #1e293b;
          box-shadow: 0 4px 32px rgba(0,0,0,0.3);
        }

        .su-back {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 13px; color: #6b7280; text-decoration: none; font-weight: 500;
          transition: color 0.15s; margin-bottom: 28px;
        }
        .su-back:hover { color: #22c55e; }
        .dark .su-back { color: #334155; }
        .dark .su-back:hover { color: #84cc16; }

        .su-submit {
          width: 100%; height: 46px;
          border-radius: 12px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(34,197,94,0.28);
        }
        .su-submit:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(34,197,94,0.35);
        }
        .su-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .su-next {
          width: 100%; height: 44px;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600; color: #374151;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.18s;
        }
        .su-next:hover:not(:disabled) {
          background: #f0fdf4; border-color: #86efac; color: #16a34a;
        }
        .dark .su-next { background: #0f172a; border-color: #1e293b; color: #475569; }
        .dark .su-next:hover:not(:disabled) {
          background: rgba(132,204,22,0.06); border-color: rgba(132,204,22,0.25); color: #84cc16;
        }
        .su-next:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Terms */
        .su-terms {
          display: flex; align-items: flex-start; gap: 10;
          padding: 14px 16px; border-radius: 12px;
          background: #f9fafb; border: 1.5px solid #f0f0f0;
        }
        .dark .su-terms { background: #0f172a; border-color: #1e293b; }
      `}</style>

      <div className="su-root flex flex-col h-full py-8">
        {/* Back */}
        <Link to="/" className="su-back">
          <ChevronLeftIcon className="w-4 h-4" />
          Volver
        </Link>

        {/* Card */}
        <div className="su-card">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div className="flex justify-center mb-4">
              <img src="/images/logonew.png" alt="AtratoCentinela AI" className="h-9 dark:hidden" />
              <img src="/images/LOGO-2-0-DARK.png" alt="AtratoCentinela AI" className="h-9 hidden dark:block" />
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}
              className="dark:text-white">
              Crear cuenta
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }} className="dark:text-slate-600">
              Únete a AtratoCentinela AI
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator step={step} />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Step 1 */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="su-label">Nombre</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange}
                      placeholder="Ana" className="su-field" />
                  </div>
                  <div>
                    <label className="su-label">Apellido</label>
                    <input name="apellido" value={form.apellido} onChange={handleChange}
                      placeholder="García" className="su-field" />
                  </div>
                </div>
                <div>
                  <label className="su-label">Nombre de usuario</label>
                  <input name="username" value={form.username} onChange={handleChange}
                    placeholder="ana.garcia" className="su-field" />
                </div>
                <button
                  type="button"
                  disabled={!step1Complete}
                  className="su-next"
                  style={{ marginTop: 4 }}
                  onClick={() => setStep(2)}
                >
                  Continuar
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="su-label">Correo electrónico</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="ana@ejemplo.com" autoComplete="email" className="su-field" />
                </div>

                <div>
                  <label className="su-label">Contraseña</label>
                  <div style={{ position: "relative" }}>
                    <input name="password" type={showPassword ? "text" : "password"}
                      value={form.password} onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      className="su-field su-field-pw" />
                    <EyeToggle visible={showPassword} onToggle={() => setShowPassword(p => !p)} />
                  </div>
                  <PasswordStrength password={form.password} />
                </div>

                <div>
                  <label className="su-label">Confirmar contraseña</label>
                  <input name="confirmPassword" type="password" value={form.confirmPassword}
                    onChange={handleChange} placeholder="••••••••" className="su-field" />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p style={{ margin: "5px 0 0", fontSize: 11, color: "#f87171", fontFamily: "'JetBrains Mono', monospace" }}>
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="su-terms">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.5, marginLeft: 10 }}
                    className="dark:text-slate-400">
                    Acepto los{" "}
                    <span style={{ color: "#16a34a", fontWeight: 600, cursor: "pointer" }}
                      className="dark:text-lime-500">
                      términos y condiciones
                    </span>{" "}
                    de uso de la plataforma
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      height: 46, borderRadius: 12, padding: "0 18px",
                      border: "1.5px solid #e5e7eb", background: "transparent",
                      cursor: "pointer", color: "#6b7280",
                      fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500,
                      transition: "all 0.15s",
                    }}
                    className="dark:border-slate-800 dark:text-slate-600"
                  >
                    ← Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="su-submit"
                    style={{ flex: 1 }}
                  >
                    {loading ? (
                      <><Spinner /> Creando cuenta...</>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Crear mi cuenta
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Sign in link */}
            <p style={{ margin: "20px 0 0", textAlign: "center", fontSize: 13, color: "#9ca3af" }}
              className="dark:text-slate-700">
              ¿Ya tienes cuenta?{" "}
              <Link to="/signin" style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none" }}
                className="dark:text-lime-500">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}