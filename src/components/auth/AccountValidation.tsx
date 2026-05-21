import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import Helper from "../../service/Helper";

const CODE_LENGTH = 4;

const AccountValidation: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = code.split("");
    newCode[index] = value;
    const updatedCode = newCode.join("");
    setCode(updatedCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== CODE_LENGTH) {
      Swal.fire({
        icon: "error",
        title: "Código inválido",
        text: "El código debe contener exactamente 4 dígitos.",
      });
      return;
    }

    try {
      const response = await axios.get(
        `${Helper.url}auth/singup/codigo/${code}`
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "¡Cuenta validada!",
          text: response.data.mensaje,
          confirmButtonText: "Continuar",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.replace("/signin");
          }
        });
      }
    } catch (error: any) {
      let errorMessage =
        "Hubo un error al validar el código. Inténtelo de nuevo.";

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage =
          "Error de conexión. Verifique su conexión a Internet.";
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const handleClear = () => {
    setCode("");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto px-6">
      <form
        onSubmit={handleSubmit}
        className="
          bg-white border border-gray-100 shadow-xl rounded-2xl
          p-8 space-y-8
        "
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full
                          bg-gradient-to-br from-green-500 to-blue-600
                          flex items-center justify-center text-white text-xl font-bold shadow-lg">
            ✓
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Valida tu cuenta
          </h2>

          <p className="text-sm text-gray-500 leading-relaxed">
            Ingresa el código de <span className="font-semibold text-green-600">4 dígitos</span>{" "}
            que enviamos a tu correo electrónico.
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-4">
          {Array.from({ length: CODE_LENGTH }).map((_, index) => (
            <input
              key={index}
              //@ts-ignore
              ref={(el) => (inputRefs.current[index] = el)}
              type="tel"
              maxLength={1}
              value={code[index] || ""}
              onChange={(e) => handleCodeChange(e, index)}
              className="
                w-14 h-14 text-center text-xl font-bold
                border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-green-500
                focus:border-green-500
                transition-all
              "
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="
              flex-1 py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-green-600 via-green-500 to-blue-600
              hover:from-green-700 hover:to-blue-700
              transition-all duration-300
              shadow-lg
            "
          >
            Verificar código
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="
              flex-1 py-3 rounded-xl font-semibold
              bg-gray-100 text-gray-700
              hover:bg-yellow-100 hover:text-yellow-700
              transition-all
            "
          >
            Borrar
          </button>
        </div>

        {/* Helper */}
        <p className="text-center text-xs text-gray-400">
          ¿No recibiste el código? Revisa spam o espera unos minutos.
        </p>
      </form>
    </div>
  );
};

export default AccountValidation;
