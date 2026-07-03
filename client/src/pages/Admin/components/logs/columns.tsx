import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { LevelBadge } from "../../../../components/customs/levelBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy, EllipsisVertical, Trash } from "lucide-react";
import { toast } from "sonner";
import { AvatarWithStatusCell } from "../../../../components/customs/avatarStatusCell";
import { LogInterface } from "@/interfaces/Log";

export const getColumns = (deleteLog: (id: string) => void): ColumnDef<LogInterface>[] => [
  {
    accessorKey: "level",
    header: ({ column }) => (
      <Button variant="ghost" className="font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Niveau
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("level");
      return <LevelBadge level={value as any} />;
    },
  },
  {
    accessorKey: "user",
    header: "Utilisateur",
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return <span className="italic text-gray-500"> Utilisateur inconnu</span>;
      }
      return (
        <div className="flex items-center gap-4">
          <AvatarWithStatusCell user={user} />
          <div className="flex flex-col">
            <span className="font-medium">
              {user.name} {user.forename}
            </span>
            <span className="text-sm text-muted-foreground">{user.username}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "message",
    header: ({ column }) => (
      <Button variant="ghost" className="font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Message
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("message")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" className="font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("createdAt");
      const formatted = format(new Date(value as Date), "dd/MM/yyyy HH:mm");
      return <div>{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: "Actions",
    cell: ({ row }) => {
      const log = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 p-0">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              className="flex gap-4"
              onClick={() => {
                navigator.clipboard.writeText(log._id);
                toast.success("ID copié !");
              }}
            >
              <Copy className="w-4 h-4" /> Copier l'ID
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-4 text-destructive hover:text-destructive!" onClick={() => deleteLog(log._id)}>
              <Trash className="w-4 h-4 " />
              <span> Supprimer la log</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
