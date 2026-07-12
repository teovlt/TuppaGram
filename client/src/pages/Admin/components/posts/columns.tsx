import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash } from "lucide-react";
import { format } from "date-fns";

export const getColumns = (callback: (action: string, data: any) => void): ColumnDef<any>[] => [
  {
    accessorKey: "content",
    header: "Contenu",
    cell: ({ row }) => (row.original.content?.substring(0, 30) || "Sans texte") + (row.original.content?.length > 30 ? "..." : ""),
  },
  {
    accessorKey: "author.username",
    header: "Auteur",
  },
  {
    accessorKey: "visibility",
    header: "Visibilité",
  },
  {
    accessorKey: "createdAt",
    header: "Date de création",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm"),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const post = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => callback("delete", post._id)} className="text-destructive">
              <Trash className="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
