export async function uploadProductImage(file: File, token: string | null): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen");
  if (file.size > 5 * 1024 * 1024) throw new Error("La imagen no puede pesar más de 5 MB");

  const signRes = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const sign = await signRes.json();
  if (!signRes.ok) throw new Error(sign.error ?? "No se pudo preparar la subida");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("folder", sign.folder);
  form.append("signature", sign.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "No se pudo subir la imagen");

  return data.secure_url as string;
}