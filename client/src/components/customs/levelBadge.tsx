import { Bug, ShieldQuestion, Info, AlertTriangle, XCircle } from "lucide-react";
import { JSX } from "react";

const defaultIcons: Record<string, { icon: JSX.Element; color: string; label: string }> = {
  info: { icon: <Info size={16} />, color: "text-blue-500", label: "Info" },
  warn: { icon: <AlertTriangle size={16} />, color: "text-yellow-500", label: "Avertissement" },
  error: { icon: <XCircle size={16} />, color: "text-red-500", label: "Erreur" },
  debug: { icon: <Bug size={16} />, color: "text-green-500", label: "Débogage" },
};

export const LevelBadge = ({ level }: { level: "info" | "warn" | "error" | "debug" }) => {
  const { icon, color, label } = defaultIcons[level] || { icon: <ShieldQuestion size={16} />, color: "text-gray-500", label: "Inconnu" };

  return (
    <span className={`flex items-center gap-1 font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};
