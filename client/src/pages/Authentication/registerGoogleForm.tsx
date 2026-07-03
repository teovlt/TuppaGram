import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { registerSchema } from "@/lib/zod/schemas/auth/zod";
import { useAuthContext } from "@/contexts/authContext";
import { z } from "zod";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { RegisterForm } from "@/components/customs/registerForm";

export const RegisterGoogleForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const userData = location.state;

  useEffect(() => {
    if (!userData) {
      navigate("/login", { replace: true });
    }
  }, [userData, navigate]);

  if (!userData) return null;

  const { name, email, photoURL } = userData;

  const defaultValues = {
    name: name.split(" ").slice(1).join(" ") || "",
    forename: name.split(" ")[0] || "",
    username: name.replace(/\s+/g, "").toLowerCase(),
    email: email,
    password: "",
    confirmPassword: "",
    photoURL: photoURL,
  };

  async function register(values: z.infer<typeof registerSchema>) {
    try {
      setLoading(true);
      const response = await axiosConfig.post("/auth/register/", values);
      toast.success(response.data.message);
      setAuthUser(response.data.user);
      localStorage.setItem("accessToken", response.data.accessToken);
      navigate("/");
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  }

  return <RegisterForm onSubmit={register} defaultValues={defaultValues} disabledFields={["email"]} loading={loading} oauth={false} />;
};
