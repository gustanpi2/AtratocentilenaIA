//@ts-ignore
import { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import Helper from "../../service/Helper";
import ChangePasswordValidation from "./ChangePasswordValidation";

interface ChangePasswordPayload {
  email: string;
  ChangePassword: boolean;
}

const ChangePassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [enviado, setEnviado] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      Swal.fire("Error", "Email no válido", "error");
      return;
    }

    setLoading(true);

    try {
      const searchResponse = await fetch(
        `${Helper.url}Controllers/ChangePassword.php?buscarEmail2=${encodeURIComponent(
          email
        )}`
      );
      const searchData = await searchResponse.json();

      if (!searchData.exists) {
        Swal.fire("Error", "El email no está registrado", "error");
        setLoading(false);
        return;
      }

      const payload: ChangePasswordPayload = {
        email,
        ChangePassword: true,
      };

      const response = await fetch(`${Helper.url}ChangePassword.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire(
          "Correo enviado",
          "Revisa tu email para continuar",
          "success"
        );
        setEnviado(true);
      } else {
        Swal.fire("Error", "No se pudo procesar la solicitud", "error");
      }
    } catch {
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  if (enviado) return <ChangePasswordValidation />;

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto px-6">
      <div
        className="
          bg-white border border-gray-100 shadow-xl rounded-2xl
          p-8 space-y-8
        "
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className="
              mx-auto w-14 h-14 rounded-full
              bg-gradient-to-br from-green-500 to-blue-600
              flex items-center justify-center
              text-white text-xl font-bold shadow-lg
            "
          >
            🔒
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Recuperar cuenta
          </h1>

          <p className="text-sm text-gray-500 leading-relaxed">
            Ingresa tu correo electrónico registrado y te enviaremos un{" "}
            <span className="font-semibold text-green-600">
              código de verificación
            </span>{" "}
            para restablecer tu contraseña.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl
                border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-green-500
                focus:border-green-500
                transition
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-green-600 via-green-500 to-blue-600
              hover:from-green-700 hover:to-blue-700
              transition-all duration-300
              disabled:opacity-60
              shadow-lg
            "
          >
            {loading ? "Enviando..." : "Restablecer contraseña"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <Link
            to="/signin"
            className="
              text-sm font-semibold text-green-600
              hover:text-blue-600 transition
            "
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
