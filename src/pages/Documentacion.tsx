import { useState, useEffect, useRef, useCallback } from "react";
import PageMeta from "../components/common/PageMeta";
import {
  Activity, Wind, Sun, Map, AlertTriangle,
  Radio, Network, Bot, Box, Layout, Users, Key, Server,
  Cpu, ArrowRight, Globe, FileText, ChevronDown,
  Menu, Eye, BarChart, Layers, WifiOff, Zap, Droplets,
  Thermometer, Gauge, TrendingUp, Bell, Target
} from "lucide-react";

const SECTIONS = [
  { id: "plataforma", label: "Plataforma", icon: Globe },
  { id: "monitoreo", label: "Monitoreo", icon: Activity },
  { id: "calidad-aire", label: "Calidad de Aire", icon: Wind },
  { id: "solar", label: "Estaciones Solares", icon: Sun },
  { id: "mapa-principal", label: "Mapa Principal", icon: Map },
  { id: "crisis", label: "Centro de Crisis", icon: AlertTriangle },
  { id: "broadcast", label: "Emergencia", icon: Radio },
  { id: "simulacion", label: "Simulación 3D", icon: Box },
  { id: "nodos", label: "Nodos", icon: Network },
  { id: "agente", label: "Agente Centinela", icon: Bot },
  { id: "admin", label: "Administración", icon: Users },
  { id: "auth", label: "Autenticación", icon: Key },
  { id: "api", label: "Arquitectura API", icon: Server },
  { id: "infra", label: "Infraestructura", icon: Layout },
  { id: "flujo", label: "Flujo del Sistema", icon: ArrowRight },
  { id: "autonomo", label: "Sistema Autónomo", icon: WifiOff },
  { id: "impacto", label: "Impacto Social", icon: Target },
  { id: "faq", label: "FAQ", icon: FileText },
  { id: "roadmap", label: "Roadmap", icon: TrendingUp },
] as const;

function Counter({ end, suffix = "", duration = 1500 }: { end: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(ease * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
}

function FadeInSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/70 dark:border-gray-700/50 shadow-lg shadow-gray-200/50 dark:shadow-black/10 p-6 md:p-8 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700/50">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20">
          <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-5 py-4 text-left bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 py-4 bg-white dark:bg-gray-800/30 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700/50">
          {children}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, color = "green" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${colors[color] || colors.green}`}>
      {children}
    </span>
  );
}

const LEVEL_COLORS: Record<string, string> = {
  "Óptimo": "text-green-500",
  "Moderado": "text-amber-500",
  "Alerta": "text-orange-500",
  "Crítico": "text-red-500",
};

export default function Documentacion() {
  const [activeSection, setActiveSection] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    for (const { id } of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileNavOpen(false);
    }
  }, []);

  /* ── Render ── */
  return (
    <>
      <PageMeta title="Documentación — AtratoCentinela AI" description="Documentación completa de la plataforma de monitoreo ambiental y gestión de emergencias" />
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* ── Hero ── */}
        <FadeInSection>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 border border-gray-700/50 p-8 md:p-12 mb-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.06),transparent_50%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Badge color="green">Plataforma Activa</Badge>
                <Badge color="blue">v2.0</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
                Atrato River Environmental Monitoring<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">&amp; Risk Management Platform</span>
              </h1>
              <p className="text-base md:text-lg text-gray-300 max-w-3xl mb-8 leading-relaxed">
                Monitoreo ambiental inteligente, alertas autónomas de emergencia y gestión de crisis
                impulsada por IA para comunidades vulnerables en la cuenca del Río Atrato, Chocó.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                  <p className="text-3xl font-bold text-green-400"><Counter end={7} suffix="+" /></p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Estaciones activas</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                  <p className="text-3xl font-bold text-blue-400"><Counter end={16} suffix="+" /></p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Variables monitoreadas</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                  <p className="text-3xl font-bold text-amber-400"><Counter end={98} suffix="%" /></p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Predicción IA</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                  <p className="text-3xl font-bold text-red-400"><Counter end={50} suffix="0" /></p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Alertas emitidas</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {SECTIONS.slice(0, 4).map((s) => (
                  <button key={s.id} onClick={() => scrollTo(s.id)} className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/10 transition-all backdrop-blur-sm">
                    <s.icon className="w-3.5 h-3.5" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>

        <div className="flex gap-6 relative">
          {/* ── Sidebar Nav ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-28 space-y-0.5 max-h-[70vh] overflow-y-auto no-scrollbar">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    activeSection === s.id
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-l-2 border-green-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile nav toggle */}
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden fixed bottom-6 right-6 z-50 p-3 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-700 transition-all">
            <Menu className="w-5 h-5" />
          </button>

          {mobileNavOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 p-4 overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navegación</h3>
                <div className="space-y-0.5">
                  {SECTIONS.map((s) => (
                    <button key={s.id} onClick={() => scrollTo(s.id)} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                      <s.icon className="w-4 h-4 shrink-0" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ===== 1. PLATAFORMA ===== */}
            <FadeInSection><section id="plataforma">
              <SectionCard title="Visión General de la Plataforma" icon={Globe}>
                <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p><strong>AtratoCentinela AI</strong> es una plataforma integral de monitoreo ambiental y gestión de emergencias diseñada para la cuenca del Río Atrato en el departamento del Chocó, Colombia.</p>
                  <p>Su propósito es enfrentar la crisis de falta de información ambiental en tiempo real y la ausencia de sistemas de alerta temprana que históricamente han dejado vulnerables a las comunidades ribereñas frente a inundaciones, contaminación por minería y desastres naturales.</p>

                  <h4 className="font-bold text-gray-700 dark:text-gray-200 mt-5">Objetivos Principales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {[
                      ["✅", "Monitoreo en Tiempo Real", "Variables ambientales cada 5 minutos"],
                      ["🛡️", "Protección Ambiental", "Vigilancia del ecosistema del río"],
                      ["🚨", "Gestión de Emergencias", "Alertas autónomas a la comunidad"],
                      ["🤖", "Alertas Autónomas", "IA detecta riesgos sin intervención humana"],
                      ["🌱", "Resiliencia Comunitaria", "Preparación ante desastres naturales"],
                      ["📈", "Predicción con IA", "Análisis de tendencias y pronósticos"],
                    ].map(([icon, title, desc], i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                        <span className="text-lg">{icon}</span>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 2. MONITOREO AMBIENTAL ===== */}
            <FadeInSection><section id="monitoreo">
              <SectionCard title="Monitoreo Ambiental" icon={Activity}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>El módulo de monitoreo permite visualizar en tiempo real los datos de las estaciones meteorológicas distribuidas en la cuenca del Atrato.</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {[
                      { var: "Temperatura", unit: "°C", icon: Thermometer, color: "text-red-500" },
                      { var: "Humedad", unit: "%", icon: Droplets, color: "text-blue-500" },
                      { var: "Velocidad del Viento", unit: "m/s", icon: Wind, color: "text-cyan-500" },
                      { var: "Precipitación", unit: "mm", icon: Gauge, color: "text-indigo-500" },
                      { var: "Presión", unit: "hPa", icon: BarChart, color: "text-purple-500" },
                      { var: "Nivel del Río", unit: "m", icon: Eye, color: "text-amber-500" },
                    ].map((v, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                        <v.icon className={`w-5 h-5 ${v.color}`} />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-xs">{v.var}</p>
                          <p className="text-[10px] text-gray-400">{v.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4">Cada estación ofrece visualización mediante gráficos de líneas, tablas estadísticas con valores máximos, mínimos y promedios, y exportación a CSV/PDF para análisis externos.</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge color="blue">Gráficos Chart.js</Badge>
                    <Badge color="blue">Tablas dinámicas</Badge>
                    <Badge color="blue">Exportación CSV</Badge>
                    <Badge color="blue">Exportación PDF</Badge>
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 3. CALIDAD DEL AIRE ===== */}
            <FadeInSection><section id="calidad-aire">
              <SectionCard title="Calidad del Aire" icon={Wind}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Sistema de monitoreo de 9 variables críticas para la calidad del aire, con clasificación AQI (Índice de Calidad del Aire) y análisis de riesgos para la salud ambiental.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    {[
                      { var: "CO₂", desc: "Dióxido de Carbono", level: "Moderado", unit: "ppm" },
                      { var: "PM2.5", desc: "Partículas finas", level: "Alerta", unit: "µg/m³" },
                      { var: "PM10", desc: "Partículas gruesas", level: "Moderado", unit: "µg/m³" },
                      { var: "Radiación", desc: "Radiación solar", level: "Óptimo", unit: "W/m²" },
                      { var: "Ruido", desc: "Contaminación acústica", level: "Moderado", unit: "dB" },
                      { var: "HCHO", desc: "Formaldehído", level: "Óptimo", unit: "ppm" },
                      { var: "TVOC", desc: "Compuestos orgánicos", level: "Óptimo", unit: "ppm" },
                      { var: "Temperatura", desc: "Temperatura ambiente", level: "Óptimo", unit: "°C" },
                      { var: "Humedad", desc: "Humedad relativa", level: "Óptimo", unit: "%" },
                    ].map((v, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">{v.var}</span>
                          <span className={`text-[10px] font-semibold ${LEVEL_COLORS[v.level] || "text-gray-400"}`}>{v.level}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{v.desc} · {v.unit}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4">Los datos se visualizan mediante gráficos de radar, barras apiladas, indicadores de salud ambiental y mapas de calor para análisis territorial.</p>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 4. ESTACIONES SOLARES ===== */}
            <FadeInSection><section id="solar">
              <SectionCard title="Estaciones Solares" icon={Sun}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Módulo especializado en el monitoreo de radiación solar y generación de energía de las estaciones solares instaladas en la región.</p>
                  <ul className="list-disc list-inside space-y-2 mt-3">
                    <li>Monitoreo de radiación solar en tiempo real</li>
                    <li>Analítica energética con mapas de calor</li>
                    <li>Gráficos radar para comparación multidimensional</li>
                    <li>Gráficos apilados de generación por período</li>
                    <li>Indicadores de eficiencia y rendimiento</li>
                  </ul>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 5. MAPA PRINCIPAL ===== */}
            <FadeInSection><section id="mapa-principal">
              <SectionCard title="Mapa Principal" icon={Map}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>El mapa principal integra Google Maps con la visualización de todas las estaciones de monitoreo desplegadas en el territorio del Chocó.</p>
                  <div className="flex items-center gap-4 mt-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">Offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">Crítico</span>
                    </div>
                  </div>
                  <p className="mt-2">Haga clic en cualquier nodo para ver un resumen de sus variables o acceda al panel de monitoreo completo para análisis detallado.</p>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 6. CENTRO DE CRISIS ===== */}
            <FadeInSection><section id="crisis">
              <SectionCard title="Centro de Crisis" icon={AlertTriangle}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>El Centro de Crisis es el corazón del sistema de respuesta a emergencias. Integra múltiples subsistemas para detectar, analizar y responder a situaciones de riesgo.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2 flex items-center gap-2"><Map className="w-4 h-4 text-green-500" /> Mapa de Riesgo</h4>
                      <p className="text-xs">Integración con Google Maps mostrando nodos ambientales con estados: online (verde), offline (naranja) y crítico (rojo). Red mesh animada para visualizar conectividad.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Indicadores Críticos</h4>
                      <p className="text-xs">Monitoreo de 6 variables clave: nivel del río, lluvia, viento, turbidez, pH y oxígeno disuelto, con análisis de tendencias.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2 flex items-center gap-2"><Gauge className="w-4 h-4 text-purple-500" /> Indicador de Riesgo</h4>
                      <p className="text-xs">Medidor circular 0-100% que consolida múltiples variables en un único nivel de riesgo. Umbrales configurables para activación de emergencias.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-500" /> Predicciones IA</h4>
                      <p className="text-xs">Análisis histórico de datos con predicción a 6 horas, incluyendo bandas de confianza para evaluación de riesgos futuros.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2 flex items-center gap-2"><Bell className="w-4 h-4 text-red-500" /> Línea de Tiempo</h4>
                      <p className="text-xs">Historial completo de alertas con filtros por estado (activas/desestimadas), severidad (baja/media/alta/crítica) y tipo (IA/manual). Recomendaciones de emergencia asociadas.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2 flex items-center gap-2"><Layers className="w-4 h-4 text-cyan-500" /> Controles Tácticos</h4>
                      <p className="text-xs">Simulación de escenarios: activación de alertas críticas, desconexión de nodos y restauración de servicios para entrenamiento y pruebas.</p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 7. SISTEMA DE EMERGENCIA ===== */}
            <FadeInSection><section id="broadcast">
              <SectionCard title="Sistema de Transmisión de Emergencia" icon={Radio}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>El sistema de broadcast permite emitir alertas masivas a través de múltiples canales de comunicación, segmentadas por zonas geográficas.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {[
                      { ch: "WhatsApp", desc: "Red comunitaria", color: "bg-green-500" },
                      { ch: "SMS", desc: "Mensajería básica", color: "bg-blue-500" },
                      { ch: "Sirenas", desc: "Alerta acústica", color: "bg-red-500" },
                      { ch: "Radio", desc: "Frecuencia AM/FM", color: "bg-purple-500" },
                    ].map((c, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30 text-center">
                        <div className={`w-3 h-3 rounded-full ${c.color} mx-auto mb-2`} />
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{c.ch}</p>
                        <p className="text-[10px] text-gray-400">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                  <h4 className="font-bold text-gray-700 dark:text-gray-200 mt-4">Zonas de Cobertura</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Quibdó (45k hab.)", "Bojayá (12k hab.)", "Vigía del Fuerte (8k hab.)", "Tutunendo (5k hab.)", "Lloró (3k hab.)"].map((z, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">{z}</span>
                    ))}
                  </div>
                  <p className="mt-4">Modos disponibles: <strong>Manual</strong> (operador selecciona canales y zonas) y <strong>Auto IA</strong> (el sistema detecta condiciones críticas y emite alertas automáticas con intervalo de 20 minutos entre transmisiones).</p>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 8. SIMULACIÓN 3D ===== */}
            <FadeInSection><section id="simulacion">
              <SectionCard title="Simulación 3D de Desastres" icon={Box}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Módulo de simulación tridimensional construido con Three.js y React Three Fiber para visualizar escenarios de desastre y evaluar respuestas de emergencia.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2">Escenarios de Simulación</h4>
                      <ul className="text-xs space-y-1.5 list-disc list-inside text-gray-500 dark:text-gray-400">
                        <li>Inundación progresiva del terreno</li>
                        <li>Sistema de tormentas con lluvia variable</li>
                        <li>Colapso de infraestructura</li>
                        <li>Respuesta autónoma de emergencia</li>
                        <li>Alertas offline sin conectividad</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2">Indicadores en Tiempo Real</h4>
                      <ul className="text-xs space-y-1.5 list-disc list-inside text-gray-500 dark:text-gray-400">
                        <li>Nivel del agua</li>
                        <li>Intensidad de lluvia</li>
                        <li>Velocidad del río</li>
                        <li>Estado de internet y electricidad</li>
                        <li>Estado de sensores</li>
                      </ul>
                    </div>
                  </div>
                  <p className="mt-2">El sistema simula el comportamiento de postes de emergencia autónomos con energía solar que activan alertas locales incluso cuando la infraestructura de red falla.</p>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 9. NODOS ===== */}
            <FadeInSection><section id="nodos">
              <SectionCard title="Seguimiento de Nodos" icon={Network}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Sistema de análisis histórico y seguimiento detallado de cada nodo de monitoreo, con herramientas de filtrado y exportación.</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge color="blue">Filtro por estación</Badge>
                    <Badge color="blue">Datos históricos</Badge>
                    <Badge color="blue">Gráficos de tendencias</Badge>
                    <Badge color="blue">Exportación CSV</Badge>
                    <Badge color="blue">Exportación PDF</Badge>
                    <Badge color="blue">Tabla de lecturas</Badge>
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 10. AGENTE CENTINELA ===== */}
            <FadeInSection><section id="agente">
              <SectionCard title="Agente Centinela AI" icon={Bot}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Asistente conversacional impulsado por inteligencia artificial para consultas ambientales, análisis de alertas y monitoreo asistido.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2">Capacidades</h4>
                      <ul className="text-xs space-y-1.5 list-disc list-inside text-gray-500 dark:text-gray-400">
                        <li>Consultas sobre variables ambientales</li>
                        <li>Análisis de alertas activas</li>
                        <li>Asistencia en monitoreo</li>
                        <li>Historial persistente de conversación</li>
                        <li>Modo manual y automático</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-2">Arquitectura</h4>
                      <ul className="text-xs space-y-1.5 list-disc list-inside text-gray-500 dark:text-gray-400">
                        <li>Frontend: chatbot flotante con persistencia en localStorage</li>
                        <li>Backend: FastAPI con integración a Telegram</li>
                        <li>Historial de conversaciones guardado localmente</li>
                        <li>Integración con APIs de monitoreo en tiempo real</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 11. ADMINISTRACIÓN ===== */}
            <FadeInSection><section id="admin">
              <SectionCard title="Sistema de Administración" icon={Users}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Panel administrativo completo para gestión de estaciones, sensores, usuarios y visitas. Acceso restringido a rol Admin.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    {[
                      { title: "Estaciones", desc: "CRUD completo de estaciones de monitoreo. Configuración de ubicación, parámetros y estado." },
                      { title: "Sensores", desc: "Gestión de sensores asociados a cada estación. Tipos, rangos y calibración." },
                      { title: "Usuarios", desc: "Administración de cuentas con roles: Admin, Cliente, Usuario. Control de acceso granular." },
                      { title: "Visitas", desc: "Registro de visitas técnicas a estaciones con bitácora de mantenimiento." },
                      { title: "Mapa de Comunas", desc: "Visualización geográfica de comunas y corregimientos de Quibdó." },
                      { title: "Perfiles", desc: "Configuración de perfil de usuario con preferencias y datos personales." },
                    ].map((m, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-xs mb-1">{m.title}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                  <h4 className="font-bold text-gray-700 dark:text-gray-200 mt-4">Roles del Sistema</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300">Admin — Acceso total</span>
                    <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">Cliente — Monitoreo y alertas</span>
                    <span className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">Usuario — Visualización básica</span>
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 12. AUTENTICACIÓN ===== */}
            <FadeInSection><section id="auth">
              <SectionCard title="Sistema de Autenticación" icon={Key}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Sistema de autenticación basado en JWT con las siguientes funcionalidades:</p>
                  <ul className="list-disc list-inside space-y-2 mt-3">
                    <li><strong>Inicio de sesión</strong> con credenciales seguras</li>
                    <li><strong>Registro</strong> de nuevos usuarios con validación</li>
                    <li><strong>Recuperación de contraseña</strong> mediante enlace</li>
                    <li><strong>Rutas protegidas</strong> basadas en rol y autenticación</li>
                    <li><strong>Persistencia</strong> de sesión con token JWT en localStorage</li>
                  </ul>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 13. ARQUITECTURA API ===== */}
            <FadeInSection><section id="api">
              <SectionCard title="Arquitectura de APIs" icon={Server}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>La plataforma se conecta con 4 APIs principales que conforman el ecosistema de datos:</p>
                  <div className="space-y-3 mt-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">API de Monitoreo</h4>
                        <Badge color="green">Producción</Badge>
                      </div>
                      <code className="text-xs text-blue-600 dark:text-blue-400">api.helsy.com.co/api/</code>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Variables ambientales, estaciones, descarga CSV</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">API de Gestión</h4>
                        <Badge color="green">Producción</Badge>
                      </div>
                      <code className="text-xs text-blue-600 dark:text-blue-400">nuevo.helsy.com.co/mrv/v1/</code>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CRUD de estaciones y sensores</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">API de IA Predictiva</h4>
                        <Badge color="amber">Activo</Badge>
                      </div>
                      <code className="text-xs text-blue-600 dark:text-blue-400">mrv-ia.onrender.com/</code>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inferencia de IA y análisis predictivo</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Backend Conversacional</h4>
                        <Badge color="purple">Local</Badge>
                      </div>
                      <code className="text-xs text-blue-600 dark:text-blue-400">localhost:8000</code>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Agente conversacional IA e integración Telegram</p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 14. INFRAESTRUCTURA ===== */}
            <FadeInSection><section id="infra">
              <SectionCard title="Infraestructura Frontend" icon={Layout}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Arquitectura de componentes y proveedores que sostienen la plataforma:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {[
                      { p: "AuthProvider", desc: "Gestión de autenticación JWT y sesión de usuario" },
                      { p: "ThemeProvider", desc: "Modo claro/oscuro con persistencia en localStorage" },
                      { p: "SidebarProvider", desc: "Estado del menú lateral: expandido/colapsado/móvil" },
                      { p: "AlertProvider", desc: "Sistema de alertas de crisis y modos manual/IA" },
                      { p: "StationProvider", desc: "Contexto de estaciones, riesgos y broadcast" },
                      { p: "AgentProvider", desc: "Estado del agente conversacional IA" },
                    ].map((pr, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-xs font-mono">{pr.p}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{pr.desc}</p>
                      </div>
                    ))}
                  </div>
                  <h4 className="font-bold text-gray-700 dark:text-gray-200 mt-4">Tecnologías Base</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["React 19", "TypeScript", "Vite", "TailwindCSS", "Three.js", "React Three Fiber", "Chart.js", "Recharts", "Highcharts", "Framer Motion", "React Router", "FastAPI"].map((t, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200">{t}</span>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 15. FLUJO DEL SISTEMA ===== */}
            <FadeInSection><section id="flujo">
              <SectionCard title="Flujo del Sistema" icon={ArrowRight}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>El siguiente diagrama muestra cómo fluye la información desde los sensores hasta las comunidades:</p>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 mt-6 px-2">
                    {[
                      { step: "Sensores", desc: "ESP32 + sensores", icon: Cpu, color: "border-blue-400 text-blue-500" },
                      { step: "Monitoreo", desc: "Variables en tiempo real", icon: Activity, color: "border-cyan-400 text-cyan-500" },
                      { step: "Análisis IA", desc: "Predicción y riesgo", icon: Bot, color: "border-purple-400 text-purple-500" },
                      { step: "Detección", desc: "Umbrales críticos", icon: AlertTriangle, color: "border-amber-400 text-amber-500" },
                      { step: "Alerta", desc: "Broadcast multicanal", icon: Radio, color: "border-red-400 text-red-500" },
                      { step: "Comunidad", desc: "Respuesta y acción", icon: Users, color: "border-green-400 text-green-500" },
                    ].map((s, i) => (
                      <div key={i} className="flex flex-col items-center text-center">
                        <div className={`p-3 rounded-2xl border-2 bg-white dark:bg-gray-800/60 ${s.color} shadow-md`}>
                          <s.icon className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-xs mt-2 text-gray-700 dark:text-gray-200">{s.step}</p>
                        <p className="text-[9px] text-gray-400">{s.desc}</p>
                        {i < 5 && <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 rotate-90 md:rotate-0 mt-1 md:mt-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 16. SISTEMA AUTÓNOMO ===== */}
            <FadeInSection><section id="autonomo">
              <SectionCard title="Sistema de Alerta Autónoma" icon={WifiOff}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/50 mb-4">
                    <p className="font-bold text-amber-800 dark:text-amber-300 text-base mb-2">⚡ Funcionamiento sin Internet ni Electricidad</p>
                    <p className="text-amber-700 dark:text-amber-400 text-sm">El sistema está diseñado para operar de forma completamente autónoma cuando falla la infraestructura de red y eléctrica, garantizando que las alertas lleguen a las comunidades.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Sun className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Energía Solar</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Postes de emergencia alimentados por paneles solares con baterías de respaldo para operación continua 24/7.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Radio className="w-5 h-5 text-purple-500" />
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Radio Frecuencia</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Comunicación por radio de onda corta como respaldo cuando falla la conexión a internet. Transmisión local sin dependencia de la nube.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-red-500" />
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Sirenas Físicas</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Activación autónoma de alarmas sonoras de alta potencia cuando se detectan condiciones de riesgo críticas.</p>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-700 dark:text-gray-200 mt-4">Niveles de Alerta</h4>
                  <div className="flex flex-col gap-2 mt-2">
                    {[
                      { level: "🟡 Advertencia", desc: "Condiciones anormales detectadas. Monitoreo intensificado.", color: "border-amber-300 bg-amber-50 dark:bg-amber-900/10" },
                      { level: "🟠 Riesgo", desc: "Umbrales críticos接近. Preparación para evacuación.", color: "border-orange-300 bg-orange-50 dark:bg-orange-900/10" },
                      { level: "🔴 Emergencia", desc: "Peligro inminente. Activación inmediata de sirenas y broadcast multicanal.", color: "border-red-300 bg-red-50 dark:bg-red-900/10" },
                    ].map((a, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${a.color}`}>
                        <span className="text-lg">{a.level}</span>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{a.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 17. IMPACTO SOCIAL ===== */}
            <FadeInSection><section id="impacto">
              <SectionCard title="Impacto Social" icon={Target}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <p>La plataforma genera un impacto directo en la resiliencia de las comunidades vulnerables de la cuenca del Atrato:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {[
                      { title: "Prevención de Desastres", desc: "Alertas tempranas que permiten evacuaciones oportunas ante crecientes súbitas del río." },
                      { title: "Protección Ambiental", desc: "Vigilancia continua de la calidad del agua para detectar contaminación por minería." },
                      { title: "Comunidades Vulnerables", desc: "Enfoque en poblaciones ribereñas con acceso limitado a sistemas de alerta tradicionales." },
                      { title: "Resiliencia Tecnológica", desc: "Sistemas autónomos que funcionan sin internet ni electricidad, adaptados al territorio." },
                      { title: "Preparación Comunitaria", desc: "Entrenamiento y simulación de escenarios para mejorar la respuesta ante emergencias." },
                      { title: "Datos Abiertos", desc: "Información ambiental disponible para investigadores, autoridades y la comunidad." },
                    ].map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{s.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 18. FAQ ===== */}
            <FadeInSection><section id="faq">
              <SectionCard title="Preguntas Frecuentes" icon={FileText}>
                <div className="space-y-3">
                  {[
                    { q: "¿Cómo funciona la inteligencia artificial?", a: "La IA analiza datos históricos y en tiempo real de las estaciones de monitoreo para predecir condiciones de riesgo hasta con 6 horas de anticipación. Utiliza modelos de inferencia entrenados con patrones ambientales de la cuenca del Atrato, generando bandas de confianza y recomendaciones accionables." },
                    { q: "¿Qué sucede cuando no hay internet?", a: "El sistema está diseñado para ser resiliente. Los nodos ESP32 almacenan datos localmente y utilizan radiofrecuencia (LoRa) como respaldo. Los postes de emergencia con energía solar activan sirenas físicas autónomamente sin depender de la nube. Las alertas críticas se transmiten por radio de onda corta." },
                    { q: "¿Cómo se detectan las inundaciones?", a: "Mediante sensores ultrasónicos de nivel del río (V10) que miden la altura del agua en tiempo real. Combinados con datos de precipitación (V6, V7), el sistema calcula tasas de cambio y activa alertas cuando se superan umbrales críticos preconfigurados." },
                    { q: "¿Cómo se activan las alertas?", a: "En modo manual, el operador selecciona canales (WhatsApp, SMS, Sirenas, Radio) y zonas geográficas. En modo IA, el sistema detecta condiciones críticas automáticamente y emite broadcasts con un intervalo mínimo de 20 minutos entre transmisiones." },
                    { q: "¿Cómo funciona la red mesh?", a: "Los nodos de monitoreo se comunican entre sí formando una red mallada (mesh network). Si un nodo pierde conectividad, los nodos vecinos retransmiten la información, garantizando la cobertura del territorio incluso con infraestructura limitada." },
                    { q: "¿Qué APIs están conectadas?", a: "Cuatro APIs principales: monitoreo ambiental (api.helsy.com.co), gestión de estaciones (nuevo.helsy.com.co/mrv/v1), inferencia IA (mrv-ia.onrender.com) y backend conversacional (localhost:8000). También se integran datos abiertos del IDEAM y CodeChocó." },
                    { q: "¿Cómo funciona la simulación 3D?", a: "Construida con Three.js y React Three Fiber, la simulación permite visualizar escenarios de inundación, tormentas y colapso de infraestructura. Incluye indicadores en tiempo real de nivel de agua, intensidad de lluvia, velocidad del río y estado de sensores." },
                    { q: "¿Quién puede acceder a la plataforma?", a: "El acceso está basado en roles: Admin (control total), Cliente (monitoreo y alertas) y Usuario (visualización básica). Las rutas administrativas requieren autenticación JWT. La información pública es accesible sin registro." },
                  ].map((faq, i) => (
                    <Accordion key={i} title={faq.q}>
                      {faq.a}
                    </Accordion>
                  ))}
                </div>
              </SectionCard>
            </section></FadeInSection>

            {/* ===== 19. ROADMAP ===== */}
            <FadeInSection><section id="roadmap">
              <SectionCard title="Roadmap Futuro" icon={TrendingUp}>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                  <div className="space-y-4 mt-2">
                    {[
                      { status: "En desarrollo", color: "bg-blue-500", items: [
                        "IA predictiva avanzada con modelos multivariables",
                        "Integración con satélites para cobertura remota"
                      ]},
                      { status: "Próximo", color: "bg-amber-500", items: [
                        "Expansión a más estaciones ambientales en toda la cuenca",
                        "Simulaciones avanzadas con escenarios personalizables",
                        "Aplicación móvil para alertas en campo"
                      ]},
                      { status: "Futuro", color: "bg-purple-500", items: [
                        "Integración con drones para monitoreo aéreo",
                        "Red de sensores comunitarios crowdsourced",
                        "Modelos de riesgo climático a largo plazo",
                        "Interfaz en lenguas indígenas (Emberá, Wounaan)"
                      ]},
                    ].map((phase, i) => (
                      <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${phase.color}`} />
                          <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">{phase.status}</span>
                        </div>
                        <ul className="space-y-1.5">
                          {phase.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="text-green-500 mt-0.5">◆</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </section></FadeInSection>

          </div>
        </div>
      </div>
    </>
  );
}