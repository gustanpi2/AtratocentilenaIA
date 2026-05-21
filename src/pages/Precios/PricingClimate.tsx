"use client";

import { FaCloudSun, FaTractor, FaUniversity } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function PricingClimate() {
  const { theme } = useTheme();

  const plans = [
    {
      name: "Plan Básico",
      icon: <FaCloudSun className="text-yellow-300 text-5xl" />,
      target: "Personas, técnicos rurales",
      features: [
        "Datos diarios (clima, lluvia, temperatura)",
        "Acceso vía web o app",
      ],
      monthly: "$15",
      annual: "$150 (2 meses gratis)",
      gradientLight: "from-blue-700 via-blue-500 to-yellow-400",
      gradientDark: "from-blue-900 via-blue-700 to-yellow-600",
    },
    {
      name: "Plan Pro",
      icon: <FaTractor className="text-green-400 text-5xl" />,
      target: "Agricultores, PyMEs, ONGs",
      monthly: "$75",
      annual: "$800",
      features: [
        "Datos en tiempo real",
        "Datos históricos 5 años",
        "Alertas por email o SMS",
      ],
      gradientLight: "from-yellow-400 via-green-500 to-green-700",
      gradientDark: "from-yellow-600 via-green-700 to-green-900",
    },
    {
      name: "Plan Institucional",
      icon: <FaUniversity className="text-green-600 text-5xl" />,
      target: "Gobiernos, empresas, universidades",
      features: [
        "API para integración",
        "Datos históricos y forecast",
        "Reportes PDF automáticos",
        "Soporte dedicado",
      ],
      monthly: "$750+",
      annual: "Desde $7,500",
      gradientLight: "from-green-800 via-green-600 to-yellow-500",
      gradientDark: "from-green-900 via-green-800 to-yellow-700",
    },
  ];

  const factors = [
    "Frecuencia y resolución: datos horarios o en tiempo real valen más que datos diarios o semanales.",
    "Acceso API: si permites conexión directa a sistemas, puedes subir precios.",
    "Valor agregado: visualizaciones, alertas personalizadas o informes automáticos aumentan el precio.",
    "Uso institucional o comercial: hasta 10 veces más por el mismo dato si el cliente es una empresa o gobierno.",
  ];

  const example = [
    "Agricultor con plan mensual: $25",
    "Municipalidad: $250/mes",
    "Empresa de seguros agrícolas: $1,200/mes con acceso API",
  ];

  return (
    <div
      className={`min-h-screen py-16 px-6 sm:px-12 transition-colors duration-500
        bg-gradient-to-b
        ${
          theme === "dark"
            ? "from-gray-900 via-gray-800 to-gray-900 text-white"
            : "from-blue-900 via-yellow-800 to-green-900 text-white"
        }
      `}
    >
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-extrabold text-center mb-14 drop-shadow-lg">
          Tabla de precios – Suscripción de datos climáticos
        </h1>

        {/* Planes */}
        <div className="grid md:grid-cols-3 gap-10">
          {plans.map((plan) => {
            const gradient = theme === "dark" ? plan.gradientDark : plan.gradientLight;
            return (
              <div
                key={plan.name}
                className={`flex flex-col rounded-3xl border 
                  ${theme === "dark" ? "border-white/10 bg-gray-800/60" : "border-white/20 bg-white/10"}
                  backdrop-blur-md shadow-lg p-8 transition-transform duration-300 hover:scale-[1.06] hover:shadow-2xl cursor-pointer
                `}
              >

                {/* Icono */}
                <div
                  className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center bg-gradient-to-tr ${gradient} shadow-lg`}
                >
                  {plan.icon}
                </div>

                {/* Nombre */}
                <h2
                  className={`text-3xl font-extrabold mb-1 drop-shadow-md ${
                    theme === "dark" ? "text-white" : "text-white"
                  }`}
                >
                  {plan.name}
                </h2>
                <p className="text-white/80 mb-6 font-medium">{plan.target}</p>

                {/* Features */}
                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 text-white/90 font-semibold"
                    >
                      <span className="inline-block bg-green-400 rounded-full p-2 text-white shadow-md">
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Precio */}
                <div className="pt-6 border-t border-white/30">
                  <p className="text-2xl font-extrabold text-white mb-1">Mensual</p>
                  <p className="text-4xl font-extrabold text-yellow-300 mb-3">
                    {plan.monthly}
                  </p>
                  <p className="text-white/80 text-sm mb-6">Anual: {plan.annual}</p>

                  <button
                    type="button"
                    className="w-full bg-yellow-400 dark:bg-yellow-500 text-blue-900 dark:text-gray-900 font-bold py-3 rounded-xl shadow-md hover:bg-yellow-300 dark:hover:bg-yellow-600 transition-colors"
                  >
                    Seleccionar plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Factores */}
        <section
          className={`mt-20 max-w-4xl mx-auto ${
            theme === "dark" ? "text-white/90" : "text-white/90"
          }`}
        >
          <h2 className="text-4xl font-semibold mb-6 flex items-center gap-3 drop-shadow-md">
            📌 Factores que justifican cobrar más
          </h2>
          <ul className="space-y-4 list-disc pl-6 text-lg leading-relaxed">
            {factors.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>

        {/* Ejemplo práctico */}
        <section className="mt-14 max-w-3xl mx-auto">
          <h2 className="text-4xl font-semibold mb-5 flex items-center gap-3 drop-shadow-md">
            🧮 Ejemplo práctico
          </h2>
          <ul className="space-y-2 pl-6 list-disc text-lg text-white/90 mb-4">
            {example.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          <p className="text-white/80 italic max-w-md mx-auto text-center">
            Puedes usar un modelo freemium o por niveles para atraer clientes distintos.
          </p>
        </section>

        {/* Propuesta comercial */}
        <section
          className={`mt-16 max-w-4xl mx-auto p-8 rounded-3xl shadow-xl backdrop-blur-sm
            ${theme === "dark" ? "bg-gray-900/70 text-white/90" : "bg-white/10 text-white/90"}`}
        >
          <h2 className="text-4xl font-semibold mb-6 flex items-center gap-3">
            🧾 Propuesta comercial
          </h2>
          <p className="mb-4 text-lg leading-relaxed">
            Ofrecemos acceso confiable a datos climáticos históricos y en tiempo real, con distintas soluciones según tus necesidades:
          </p>

          <ul className="list-disc pl-8 space-y-2 text-lg">
            <li>
              <strong>Plan Básico:</strong> ideal para usuarios individuales o técnicos de campo. Incluye datos meteorológicos diarios.
            </li>
            <li>
              <strong>Plan Pro:</strong> pensado para agricultores y pequeñas organizaciones. Añade datos históricos, alertas y soporte básico.
            </li>
            <li>
              <strong>Plan Institucional:</strong> dirigido a gobiernos y empresas. Incluye API, reportes automáticos y soporte especializado.
            </li>
          </ul>

          <p className="mt-4 text-lg">
            También desarrollamos planes personalizados para organizaciones que requieran métricas específicas para reportes de carbono, ESG o proyectos con financiamiento climático.
          </p>
        </section>
      </div>
    </div>
  );
}
