"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useApi from "@/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"

interface Role {
  id_Rol: number;
  Rol: string;
}

interface Center {
  id_CentroVacunacion: number;
  Nombre: string; // Corrected to match API response
}

interface AddUserFormProps {
  onSuccess: () => void;
}

export function AddUserForm({ onSuccess }: AddUserFormProps) {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm();
  const { data: roles, request: fetchRoles } = useApi<Role[]>();
  const { data: centers, request: fetchCenters } = useApi<Center[]>();
  const { loading: isLoading, request: createUser } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    fetchRoles("/api/roles");
    fetchCenters("/api/vaccination-centers");
  }, [fetchRoles, fetchCenters]);

  const selectedRoleId = watch("id_Rol");
  const selectedRoleObject = roles?.find(role => String(role.id_Rol) === selectedRoleId);

  useEffect(() => {
    if (selectedRoleId) {
      console.log("DEBUG: Selected Role ID:", selectedRoleId);
      console.log("DEBUG: Selected Role Object:", selectedRoleObject);
    }
  }, [selectedRoleId, selectedRoleObject, roles]);

  // Original line was: const selectedRole = roles?.find(role => String(role.id_Rol) === selectedRoleId);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        id_Rol: Number(data.id_Rol),
        id_CentroVacunacion: data.id_CentroVacunacion ? Number(data.id_CentroVacunacion) : null,
      };
      await createUser("/api/users", { method: "POST", body: JSON.stringify(payload) });
      toast({ title: "Success", description: "User created successfully." });
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Error", description: `Failed to create user: ${errorMessage}`, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="Email">Email</Label>
        <Input id="Email" type="email" {...register("Email", { required: true })} />
        {errors.Email && <p className="text-red-500">Email is required.</p>}
      </div>
      <div>
        <Label htmlFor="Clave">Password</Label>
        <Input id="Clave" type="password" {...register("Clave", { required: true })} />
        {errors.Clave && <p className="text-red-500">Password is required.</p>}
      </div>
      <div>
        <Label htmlFor="Cedula_Usuario">Cedula</Label>
        <Input id="Cedula_Usuario" type="text" {...register("Cedula_Usuario", { required: true })} />
        {errors.Cedula_Usuario && <p className="text-red-500">Cedula is required.</p>}
      </div>
      <div>
        <Label htmlFor="id_Rol">Role</Label>
        <Controller
          name="id_Rol"
          control={control}
          rules={{ required: "Role is required." }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.id_Rol} value={String(role.id_Rol)}>
                    {role.Rol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.id_Rol && <p className="text-red-500">{(errors.id_Rol.message as string)}</p>}
      </div>

      {selectedRoleId === '2' && (
        <div>
          <Label htmlFor="id_CentroVacunacion">Vaccination Center</Label>
          <Controller
            name="id_CentroVacunacion"
            control={control}
            rules={{ required: "Center is required for this role." }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a center" />
                </SelectTrigger>
                <SelectContent>
                  {centers?.map((center) => (
                    <SelectItem key={center.id_CentroVacunacion} value={String(center.id_CentroVacunacion)}>
                      {center.Nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.id_CentroVacunacion && <p className="text-red-500">{(errors.id_CentroVacunacion.message as string)}</p>}
        </div>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create User"}
      </Button>
    </form>
  )
}
