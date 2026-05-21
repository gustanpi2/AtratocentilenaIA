//@ts-ignore
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";
import Helper from "../../service/Helper";

interface RouteParams {
  codigo?: string;
}

const ChangePasswordReset: React.FC = () => {
  //@ts-ignore
  const { codigo } = useParams<RouteParams>();
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const validate = (): boolean => {
    if (!password || password.length < 6) {
      Swal.fire(
        "Error",
        "La contraseña debe tener al menos 6 caracteres",
        "error"
      );
      return false;
    }
    if (password !== confirmPassword) {
      Swal.fire(
        "Error",
        "Las contraseñas no coinciden",
        "error"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(`${Helper.url}ChangePassword.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          codigo,
        }),
      });

      if (response.ok) {
        Swal.fire(
          "Contraseña cambiada",
          "Tu contraseña fue actualizada correctamente",
          "success"
        ).then(() => navigate("/auth"));
      } else {
        Swal.fire(
          "Error",
          "No se pudo cambiar la contraseña",
          "error"
        );
      }
    } catch {
      Swal.fire(
        "Error",
        "Error al conectar con el servidor",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Cambiar contraseña</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Nueva contraseña"
          className="w-full px-4 py-3 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="w-full px-4 py-3 border rounded-lg"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white bg-brand-500 rounded-lg"
        >
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>

      <p className="text-sm text-center">
        <Link to="/auth" className="text-brand-500">
          Volver al login
        </Link>
      </p>
    </div>
  );
};

export default ChangePasswordReset;
