//@ts-ignore
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import axios, { AxiosError } from "axios";
import Helper from "../../service/Helper";

const CODE_LENGTH = 4;

const ChangePasswordValidation: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (
    //@ts-ignore
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    // Solo números (0–9)
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
        `${Helper.url}ChangePassword.php?codigo=${code}`
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "¡Cuenta validada!",
          text: response.data.mensaje,
          confirmButtonText: "Continuar",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = `/auth/change-password-reset/${code}`;
          }
        });
      }
    } catch (err) {
      const error = err as AxiosError<any>;
      let errorMessage =
        "Hubo un error al validar el código. Inténtelo de nuevo.";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Error ${error.response.status}`;
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 w-full max-w-md mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Validando tu cuenta
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Revisa tu correo electrónico e ingresa el código recibido.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {Array.from({ length: CODE_LENGTH }).map((_, index) => (
          <input
            key={index}
            //@ts-ignore
            ref={(el) => (inputRefs.current[index] = el)}
            type="tel"
            maxLength={1}
            value={code[index] || ""}
            onChange={(e) => handleCodeChange(e, index)}
            className="w-12 h-12 text-center text-lg font-semibold border rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-brand-500
                       dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 py-3 text-white bg-brand-500 rounded-lg
                     hover:bg-brand-600 transition"
        >
          Verificar
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-3 text-gray-700 bg-gray-100 rounded-lg
                     hover:bg-gray-200 transition
                     dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Borrar
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordValidation;
