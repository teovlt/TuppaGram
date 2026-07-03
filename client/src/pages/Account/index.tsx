import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Lock, Trash2 } from "lucide-react";
import { UpdatePasswordForm } from "./components/updatePasswordForm";
import { DeleteAccountForm } from "./components/deleteAccountForm";

export const Account = () => {
  const [openUpdatePasswordDialog, setOpenUpdatePasswordDialog] = useState(false);
  const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-bold tracking-tight">Sécurité</CardTitle>
          <CardDescription>Gérez la sécurité de votre compte.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-muted rounded-full">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">Mot de passe</p>
                <p className="text-sm text-muted-foreground">Changez votre mot de passe pour sécuriser votre compte.</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setOpenUpdatePasswordDialog(true)}>
              Modifier
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-bold tracking-tight text-destructive">Zone de danger</CardTitle>
          <CardDescription>Ces actions sont irréversibles.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5 text-card-foreground">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">Supprimer le compte</p>
                <p className="text-sm text-destructive/80">Supprimez définitivement votre compte et vos données.</p>
              </div>
            </div>
            <Button variant="destructive" onClick={() => setOpenDeleteAccountDialog(true)}>
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openUpdatePasswordDialog} onOpenChange={setOpenUpdatePasswordDialog}>
        <UpdatePasswordForm setOpen={setOpenUpdatePasswordDialog} />
      </Dialog>

      <Dialog open={openDeleteAccountDialog} onOpenChange={setOpenDeleteAccountDialog}>
        <DeleteAccountForm setOpen={setOpenDeleteAccountDialog} />
      </Dialog>
    </div>
  );
};
