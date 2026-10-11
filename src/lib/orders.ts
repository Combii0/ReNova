// Marca pedidos como vistos y avisa al AppShell para que actualice los puntos rojos
export async function markOrdersRead(token: string | null, ids: string[]) {
  if (ids.length === 0) return;

  await fetch("/api/orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ read: ids }),
  });
  window.dispatchEvent(new Event("renova-orders-change"));
}