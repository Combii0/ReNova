# ♻️ ReNova

**ReNova** es una plataforma web colombiana donde las personas dan una segunda vida a los objetos que ya no usan.

La **donación es el centro de la experiencia**: cualquier producto puede publicarse sin precio para que llegue a quien lo necesita. Quien prefiera vender también puede hacerlo, pero la idea de fondo es que nada útil termine en la basura.

> Haz que cada objeto tenga una nueva historia.

---

## 🚀 ¿Qué hace ReNova?

ReNova permite a los usuarios:

- 🎁 Publicar productos como **donación** o con precio.
- 🛒 Explorar el market y enviar **solicitudes** desde el carrito.
- ✅ Aceptar o rechazar solicitudes desde **Mi tienda**.
- 💬 Coordinar la entrega mediante un **chat** entre comprador y vendedor.
- 🤖 Pedir ayuda a **Helpy**, el asistente con IA de la plataforma.

En ReNova no hay pagos dentro de la aplicación: tanto las compras como las donaciones siguen el mismo flujo de solicitud.

---

## 🔄 ¿Cómo funciona?

1. Un **socio** publica un producto con foto, categoría y descripción, y puede marcarlo como donación.
2. Los compradores abren el detalle del producto y lo agregan al carrito.
3. Se envía una solicitud al vendedor, que la acepta o la rechaza.
4. Si la acepta, el producto queda **reservado** y sale del market.
5. Ambos hablan por el chat para acordar la entrega.

---

## 🔐 Seguridad

- Verificación en dos pasos con código de 6 dígitos enviado al correo.
- Inicio de sesión con Google.
- Teléfono, dirección y mensajes del chat guardados cifrados.
- Direcciones validadas con Google Maps (solo Colombia).
- Roles: `comprador`, `socio` y `admin`. Se pasa a socio al registrar fecha de nacimiento (16 años o más), celular y dirección.

---

## Equipo de desarrollo

| Rol | Nombre |
|:--|:--|
| 👨‍💻 Frontend | **Juan Andres Granados** |
| 👨‍💻 Backend | **Nicolas Rojas** |
| 👨‍💻 Fullstack | **Santiago Hernandez** |
| 👩‍💼 Scrum Master | **Paula Solano** |
| 👩‍🎨 Diseñadora UX/UI | **Mariana Castro** |

---

## ⚙️ Tecnologías principales

```bash
Frontend: Next.js, React, TypeScript y Tailwind CSS
Backend: Firebase (Authentication y Firestore) y API Routes de Next.js
Imágenes: Cloudinary
Mapas y direcciones: Google Maps y Google Places
Correos: Nodemailer
Asistente con IA: Gemini API
Despliegue de Aplicación: Vercel
```

---

## 🛠️ Estado del proyecto

ReNova está en desarrollo y por ahora solo funciona en Colombia. Próximamente: calificaciones entre usuarios y confirmación de entrega por ambas partes.