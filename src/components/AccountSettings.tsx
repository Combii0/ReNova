"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { useUser, getIdToken, logoutClient } from "@/lib/auth";
import AddressInput from "@/components/AddressInput";

const card = "rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]";
const field = "w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]";
const label = "mb-1 block text-sm font-bold text-[var(--app-text)]";
const eyebrow = "text-sm font-bold uppercase tracking-wide text-[var(--brand)]";
const button = "h-11 w-full rounded-full bg-[var(--app-text)] text-sm font-black text-[var(--app-bg)] disabled:opacity-50";

export default function AccountSettings() {
  const router = useRouter();
  const user = useUser();

  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressOk, setAddressOk] = useState(true);
  const [placeId, setPlaceId] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  const [confirmDelete, setConfirmDelete] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isGoogleUser = user?.providerData.some((p) => p.providerId === "google.com");

  useEffect(() => {
    if (!user) return;

    (async () => {
      const token = await getIdToken(user);
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setDisplayName(data.displayName ?? "");
      setBirthDate(data.birthDate ?? "");
      setPhone((data.phone ?? "").replace(/\D/g, "").replace(/^57/, ""));
      setAddress(data.address ?? "");
      setAddressOk(true);
    })();
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setMessage("");

    if (phone && !/^3\d{9}$/.test(phone)) {
      setError("Escribe un celular colombiano válido (10 dígitos que empiecen por 3).");
      return;
    }
    if (!addressOk) {
      setError("Selecciona una dirección de la lista de sugerencias.");
      return;
    }

    const token = await getIdToken(user);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        displayName,
        birthDate: birthDate || undefined,
        phone: phone || undefined,
        placeId: placeId || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      return;
    }

    if (displayName) await updateProfile(user, { displayName });
    setMessage(data.role === "socio" ? "Datos guardados. Ya eres socio." : "Datos guardados.");
  }

  async function changeCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setMessage("");

    if (!newEmail && !newPassword) {
      setError("Escribe un nuevo correo o una nueva contraseña.");
      return;
    }
    if (newEmail && newEmail !== confirmEmail) {
      setError("Los correos no coinciden.");
      return;
    }

    const token = await getIdToken(user);
    const res = await fetch("/api/users/me/security", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        currentPassword,
        newPassword: newPassword || undefined,
        newEmail: newEmail || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo actualizar");
      return;
    }

    await logoutClient();
    router.push("/login");
  }

  async function deleteAccount() {
    if (!user || confirmDelete !== "ELIMINAR") return;
    setError("");

    const token = await getIdToken(user);
    const res = await fetch("/api/users/me", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setError("No se pudo eliminar la cuenta");
      return;
    }

    await logoutClient();
    router.push("/");
  }

  if (!user) {
    return (
      <section className={card}>
        <p className="text-sm font-bold text-[var(--app-muted)]">
          Inicia sesión para editar tu cuenta.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
      {message && <p className="text-sm font-semibold text-[var(--brand)]">{message}</p>}

      <form onSubmit={saveProfile} className={`${card} space-y-4`}>
        <div>
          <p className={eyebrow}>Cuenta</p>
          <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">Datos personales</h2>
        </div>

        <div>
          <label htmlFor="displayName" className={label}>Nombre</label>
          <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="birthDate" className={label}>Fecha de nacimiento</label>
          <input
            id="birthDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Celular</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[var(--app-text)]">+57</span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className={field}
              placeholder="300 123 4567"
            />
          </div>
        </div>
        <div>
          <label className={label}>Dirección</label>
          <AddressInput
            value={address}
            onChange={(text, ok, id) => {
              setAddress(text);
              setAddressOk(ok);
              setPlaceId(id ?? "");
            }}
          />
        </div>

        <button type="submit" className={button}>Guardar cambios</button>
      </form>

      {!isGoogleUser && (
        <form onSubmit={changeCredentials} className={`${card} space-y-4`}>
          <div>
            <p className={eyebrow}>Seguridad</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">Correo y contraseña</h2>
          </div>

          <div>
            <label htmlFor="currentPassword" className={label}>Contraseña actual</label>
            <input id="currentPassword" type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="newEmail" className={label}>Nuevo correo (opcional)</label>
            <input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={field} />
          </div>
          {newEmail && (
            <div>
              <label htmlFor="confirmEmail" className={label}>Confirmar nuevo correo</label>
              <input id="confirmEmail" type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} className={field} />
            </div>
          )}
          <div>
            <label htmlFor="newPassword" className={label}>Nueva contraseña (opcional)</label>
            <input id="newPassword" type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={field} placeholder="Mínimo 8 caracteres" />
          </div>

          <p className="text-xs font-bold text-[var(--app-muted)]">
            Al actualizar tendrás que iniciar sesión de nuevo.
          </p>
          <button type="submit" className={button}>Actualizar</button>
        </form>
      )}

      <section className={`${card} space-y-4`}>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-red-600">Zona de peligro</p>
          <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">Eliminar cuenta</h2>
        </div>
        <p className="text-sm font-bold text-[var(--app-muted)]">
          Escribe ELIMINAR para confirmar. Se borran tu perfil y tus pedidos, y no se puede deshacer.
        </p>
        <input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} className={field} placeholder="ELIMINAR" />
        <button
          type="button"
          onClick={deleteAccount}
          disabled={confirmDelete !== "ELIMINAR"}
          className="h-11 w-full rounded-full bg-red-500/10 text-sm font-black text-red-600 disabled:opacity-50"
        >
          Eliminar mi cuenta
        </button>
      </section>
    </div>
  );
}