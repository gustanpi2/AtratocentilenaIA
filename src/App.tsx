import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Páginas públicas
import Maps from "./pages/Maps/Maps";
import Home from "./pages/Dashboard/Home";

// Autenticación
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";

// Layout y utilidades
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import NotFound from "./pages/OtherPage/NotFound";

// Páginas privadas
import { Monitoreo } from "./pages/Monitoring/Monitoreo";
import Variables from "./pages/Variables/Variables";
import Detalles from "./pages/Variables/Detalles";
import Users from "./pages/Users/Users";
import Visits from "./pages/Visits/Visits";
import Estacion from "./pages/Estacion";
import SensoresPage from "./pages/Sensor";
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";

// UI y tablas
import FormElements from "./pages/Forms/FormElements";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";

// Crisis Center
import { CrisisCenter } from "./modules/crisis-center/CrisisCenter";
import { StationProvider } from "./modules/crisis-center/StationContext";
import { AlertBanner } from "./modules/alerts/AlertBanner";
import { Chatbot } from "./modules/chatbot/Chatbot";
import AgentPage from "./pages/Agent/AgentPage";
import { AgentProvider } from "./modules/agent/AgentContext";

// Node Tracking
import { NodeTracking } from "./modules/node-tracking/NodeTracking";

// Contexto de autenticación
import { useAuth } from "./context/AuthContext";
import Comunas from "./pages/Comunas/Comunas";
import Precios from "./pages/Precios/Precios";
import ChangePassword from "./components/auth/ChangePassword";
import { useEffect } from "react";
import axios from "axios";
import Helper from "./service/Helper";

export default function App() {
  const { isAuthenticated } = useAuth();

  const registrarVisita = async (): Promise<void> => {
    const dispositivo: string = navigator.userAgent ?? "Unknown Device";

    try {
      await axios.post(
        `${Helper.url}visitas/register`,
        { dispositivo },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error(
            "Error del servidor:",
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          console.error("No se recibió respuesta del servidor:", error.request);
        } else {
          console.error("Error al configurar la solicitud:", error.message);
        }
      } else {
        console.error("Error inesperado:", error);
      }
    }
  };

  useEffect((): void => {
    registrarVisita();
  }, []);


  return (
    <Router>
      <ScrollToTop />
      <AlertBanner />
      <AgentProvider>
        <Chatbot />
        <StationProvider>
        <Routes>
        {/* Rutas con layout principal */}
        <Route element={<AppLayout />}>
          {/* 🌐 Públicas */}
          <Route index element={<Maps />} />
          <Route path="/crisis" element={<CrisisCenter />} />
          <Route path="/inform" element={<Home />} />
          <Route path="/inform/:estacion" element={<Home />} />
          <Route path="/node-tracking" element={<NodeTracking />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="/monitoring/:id" element={<Monitoreo />} />
          <Route path="/monitoring/variables/:id" element={<Variables />} />
          <Route path="/monitoring/variables/detalles/:codigo/:id" element={<Detalles />} />
          <Route path="/forgot-password" element={<ChangePassword />} />
          {/* Privadas (solo si está autenticado) */}
          {isAuthenticated && (
            <>
              <Route path="/comunas" element={<Comunas />} />
              <Route path="/precios" element={<Precios />} />
              <Route path="/users" element={<Users />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/stations" element={<Estacion />} />
              <Route path="/sensors" element={<SensoresPage />} />
              <Route path="/visits" element={<Visits />} />
              <Route path="/blank" element={<Blank />} />

              {/* UI, tablas y formularios */}
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/basic-tables" element={<BasicTables />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </>
          )}
        </Route>

        {/* 🔐 Rutas de autenticación */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signin/:ruta" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </StationProvider>
      </AgentProvider>
    </Router>
  );
}
