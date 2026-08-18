import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { toast } from "sonner";
import TextField from "./TextField";
import Button from "./Button";
import { useAuth } from "../providers/authFirebase";
import { updateUser } from "../firebase/queries/auth";
import type { User } from "../types";

interface ProfileFormValuesInterface {
  name: string;
  lastName: string;
  phoneNumber: string;
}

export default function ProfileForm({ user }: { user: User }) {
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ProfileFormValuesInterface>({
    defaultValues: {
      name: user.name,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber ?? "",
    },
  });

  async function submit(values: ProfileFormValuesInterface) {
    setError(null);
    try {
      const phoneNumber = parsePhoneNumberFromString(
        values.phoneNumber,
        "CO",
      )!.number;
      const displayName = [values.name, values.lastName]
        .filter(Boolean)
        .join(" ");
      await updateUser(user.id, {
        name: values.name,
        lastName: values.lastName,
        displayName,
        phoneNumber,
      });
      await refreshUser();
      toast.success("Perfil actualizado.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Algo salió mal. Inténtalo de nuevo.",
      );
    }
  }

  const fieldError = errors.name?.message ?? errors.phoneNumber?.message ?? error;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="name"
          control={control}
          rules={{ required: "Ingresa tu nombre." }}
          render={({ field }) => (
            <TextField
              label="Nombre"
              value={field.value}
              onChange={field.onChange}
              required
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          rules={{ required: "Ingresa tu apellido." }}
          render={({ field }) => (
            <TextField
              label="Apellido"
              value={field.value}
              onChange={field.onChange}
              required
            />
          )}
        />
      </div>
      <Controller
        name="phoneNumber"
        control={control}
        rules={{
          required: "Ingresa tu número de teléfono.",
          validate: (value) => {
            const parsed = parsePhoneNumberFromString(value, "CO");
            return (
              (parsed?.isValid() && parsed.country === "CO") ||
              "Ingresa un número de teléfono colombiano válido."
            );
          },
        }}
        render={({ field }) => (
          <TextField
            label="Teléfono"
            type="tel"
            placeholder="+57 300 1234567"
            value={field.value}
            onChange={field.onChange}
            className="sm:max-w-xs"
            required
          />
        )}
      />

      {fieldError && <p className="text-sm text-red-600">{fieldError}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        handleClick={() => {}}
        className="self-start"
      >
        {isSubmitting ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
