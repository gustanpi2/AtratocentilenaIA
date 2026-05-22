import React from "react";
import PageMeta from "../components/common/PageMeta";
import { Book, Scale, Info, Download, Map, WifiOff, Cpu, Database, Code } from "lucide-react";

const Information: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Información y Guías — AtratoCentinela AI"
        description="Marco legal, diccionario de variables, hardware y tecnologías"
      />
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center space-x-3 mb-6">
          <Info className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Centro de Información y Documentación
          </h1>
        </div>

        {/* 1. Marco Legal - Sentencia T-622 */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Scale className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Marco Legal - Sentencia T-622
            </h2>
          </div>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              La plataforma <strong>AtratoCentinela AI</strong> actúa como una herramienta tecnológica fundamental para el cumplimiento de la <strong>Sentencia T-622 de 2016</strong>, mediante la cual la Corte Constitucional reconoció al <strong>Río Atrato, su cuenca y afluentes como una entidad sujeto de derechos</strong> a la protección, conservación, mantenimiento y restauración a cargo del Estado y las comunidades étnicas.
            </p>
            <p>
              A través de este sistema de monitoreo en tiempo real, facilitamos a las autoridades ambientales (como CodeChocó), a la academia y a los consejos comunitarios, la recolección, visualización y análisis de variables físico-químicas del ecosistema. Esto permite garantizar una vigilancia efectiva de los parámetros vitales del río y proveer alertas tempranas para proteger los derechos bioculturales de las comunidades ribereñas.
            </p>
          </div>
        </section>

        {/* 2. Diccionario de Variables Ambientales */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Diccionario de Variables Ambientales
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-tl-lg">Variable</th>
                  <th scope="col" className="px-6 py-3">Código / Unidad</th>
                  <th scope="col" className="px-6 py-3">Descripción Técnica</th>
                  <th scope="col" className="px-6 py-3 rounded-tr-lg">Impacto en la Comunidad</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">pH</td>
                  <td className="px-6 py-4">V3 / Escala 0-14</td>
                  <td className="px-6 py-4">Mide la acidez o alcalinidad del agua. Valores normales están entre 6.5 y 8.5.</td>
                  <td className="px-6 py-4">Un pH alterado indica contaminación por vertimientos industriales o mineros, afectando la pesca y el agua para consumo.</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Turbidez</td>
                  <td className="px-6 py-4">V4 / NTU</td>
                  <td className="px-6 py-4">Cantidad de partículas suspendidas en el agua que bloquean la luz.</td>
                  <td className="px-6 py-4">Altos niveles indican erosión o deforestación por minería. Dificulta la potabilización y daña la vida acuática.</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Nivel del Río</td>
                  <td className="px-6 py-4">V10 / Metros (m)</td>
                  <td className="px-6 py-4">Altura de la lámina de agua respecto a un punto de referencia cero.</td>
                  <td className="px-6 py-4">Crítico para la navegación y alertas tempranas. Ayuda en la prevención de inundaciones y desbordes.</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Flujo (Caudal)</td>
                  <td className="px-6 py-4">V1 / m³/s</td>
                  <td className="px-6 py-4">Volumen de agua que pasa por una sección transversal del río por unidad de tiempo.</td>
                  <td className="px-6 py-4">Permite entender la disponibilidad hídrica, riesgos de avalanchas y capacidad de transporte de sedimentos.</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Lluvia (Precipitación)</td>
                  <td className="px-6 py-4">V6, V7 / mm</td>
                  <td className="px-6 py-4">Cantidad de lluvia acumulada en 1 hora o 24 horas.</td>
                  <td className="px-6 py-4">Alertas directas sobre clima extremo que puede afectar cultivos y generar crecientes súbitas.</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Temperatura</td>
                  <td className="px-6 py-4">V5 / °C</td>
                  <td className="px-6 py-4">Temperatura ambiental en las cercanías del río.</td>
                  <td className="px-6 py-4">Los aumentos extremos pueden afectar la oxigenación del agua y causar estrés hídrico.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Arquitectura Hardware - Protocolo ESP32 */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Cpu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Arquitectura de Hardware y Protocolo ESP32
            </h2>
          </div>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              Nuestras estaciones de monitoreo operan en base a microcontroladores <strong>ESP32</strong> (Sistemas en Chip de bajo costo y baja energía con Wi-Fi y Bluetooth integrado).
              Estos dispositivos actúan como el núcleo ("Edge Nodo") para adquirir y transmitir datos de los sensores distribuidos en el río.
            </p>
            <ul className="space-y-2 mt-4">
              <li>
                <strong>Adquisición de Datos:</strong> El ESP32 se comunica con los sensores físico-químicos (pH, Turbidez, Ultrasonido para nivel) mediante protocolos como I2C, SPI o conversores analógico-digitales (ADC).
              </li>
              <li>
                <strong>Transmisión y Telemetría:</strong> Los datos se envían a la nube mediante protocolo <strong>MQTT</strong> (Message Queuing Telemetry Transport), ideal para conexiones de poco ancho de banda y entornos de red inestables.
              </li>
              <li>
                <strong>Tolerancia a fallos:</strong> En caso de perder conexión a internet, los ESP32 almacenan métricas en memorias SD locales o usan módulos LoRa/Radio de onda corta para retransmitir las alarmas críticas directamente a la comunidad.
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Datos Abiertos */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Database className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Integración de Datos Abiertos y Públicos
            </h2>
          </div>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              El ecosistema AtratoCentinela cruza la información en tiempo real de nuestros sensores con las bases de datos de la plataforma gubernamental de Datos Abiertos de Colombia y con entidades como el IDEAM o CodeChocó.
            </p>
            <p>
              Variables adicionales integradas del ecosistema de datos abiertos:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 list-disc list-inside">
              <li>Históricos de Caudales Medios Mensuales.</li>
              <li>Zonas Susceptibles a Inundaciones (Mapas de Riesgo).</li>
              <li>Concesiones Mineras Activas.</li>
              <li>Estadísticas de Morbilidad por Infecciones Hídricas.</li>
            </ul>
            <p className="mt-4">
              <strong>Nota para investigadores:</strong> Toda esta información se consolida para su exportación en formatos amigables como CSV y PDF, permitiendo modelos predictivos más precisos por parte de investigadores externos.
            </p>
          </div>
        </section>

        {/* 5. Tecnologías de Desarrollo */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Code className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Tecnologías de Desarrollo Web (Stack)
            </h2>
          </div>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              El dashboard ha sido desarrollado siguiendo las últimas prácticas de rendimiento y estética moderna.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Frontend Core</h3>
                <ul className="list-disc list-inside">
                  <li><strong>React 18</strong> para un ecosistema de componentes reactivos.</li>
                  <li><strong>Vite</strong> como motor de empaquetado ultra rápido.</li>
                  <li><strong>TypeScript</strong> asegurando tipado fuerte y cero errores en producción.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Styling & UI</h3>
                <ul className="list-disc list-inside">
                  <li><strong>Tailwind CSS</strong> para la estilización ágil y diseño responsive.</li>
                  <li><strong>Lucide Icons & React Icons</strong> aportando iconografía consistente.</li>
                  <li>Esquema <em>Glassmorphism</em> y Dark Mode integrado para mejor ergonomía visual.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Centro de Guías y Tutoriales */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
             Centro de Guías y Tutoriales Rápidos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                <Download size={24} />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">Cómo exportar datos históricos</h3>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                <li>Dirígete a la sección <strong>Estaciones y Sensores &gt; Estaciones</strong>.</li>
                <li>Accede al Monitoreo en Tiempo Real de la estación de interés.</li>
                <li>Usa los botones <strong>PDF</strong> o <strong>CSV</strong> ubicados junto a "Ver todas las variables" para descargar toda la data de las gráficas.</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                <Map size={24} />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">Cómo interpretar el mapa</h3>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                <li>Los puntos representan <strong>estaciones sensoras</strong> activas en el Chocó.</li>
                <li>Haz clic sobre un punto para desplegar un resumen de sus variables actuales.</li>
                <li>Al hacer clic en "Ver detalles", accederás al panel de Monitoreo General.</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center mb-4">
                <WifiOff size={24} />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">Alerta Temprana Offline</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Ante fallas de internet en comunidades remotas:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
                <li>Los nodos operan con <strong>Edge Computing</strong>, analizando riesgos localmente.</li>
                <li>Si se detecta peligro, activan de inmediato alarmas físicas sonoras (sirenas).</li>
                <li>Transmiten por radio sin depender de la nube.</li>
              </ul>
            </div>

          </div>
        </section>

      </div>
    </>
  );
};

export default Information;
