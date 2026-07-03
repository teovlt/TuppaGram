import { User2, ShieldCheck, ShieldQuestion } from "lucide-react";
import { JSX } from "react";

const defaultRoles: Record<string, { icon: JSX.Element; color: string; label: string }> = {
  admin: { icon: <ShieldCheck size={16} />, color: "text-purple-500", label: "Administrateur" },
  user: { icon: <User2 size={16} />, color: "text-blue-500", label: "Utilisateur" },
};

export const UserRoleBadge = ({ role }: { role: "admin" | "user" }) => {
  const { icon, color, label } = defaultRoles[role] || { icon: <ShieldQuestion size={16} />, color: "text-gray-500", label: "Inconnu" };

  return (
    <span className={`flex items-center gap-1 font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};
