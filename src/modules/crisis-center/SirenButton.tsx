import { useAlerts } from "../alerts/AlertProvider";
import { playSiren, stopSiren } from "../alerts/AlertSound";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";

export const SirenButton = () => {
  const { isSirenActive, toggleSiren } = useAlerts();

  const handleToggle = () => {
    if (isSirenActive) {
      stopSiren();
    } else {
      playSiren();
    }
    toggleSiren();
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm tracking-wider transition-all duration-300 shadow-lg ${
        isSirenActive
          ? "bg-red-600 text-white shadow-red-500/40 animate-alert-pulse ring-2 ring-red-400"
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 shadow-gray-200 dark:shadow-gray-800"
      }`}
    >
      <span className="text-lg">
        {isSirenActive ? <FaVolumeUp /> : <FaVolumeMute />}
      </span>
      <span>{isSirenActive ? "SIRENA ACTIVA" : "ACTIVAR SIRENA"}</span>
      {isSirenActive && (
        <span className="absolute -top-1 -right-1 w-3 h-3">
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping" />
          <span className="absolute inset-0 rounded-full bg-red-500" />
        </span>
      )}
    </button>
  );
};
