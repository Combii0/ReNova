# ReNova

## English

**ReNova** is a Colombian web platform where people give a second life to objects they no longer use.

**Donation is at the center of the experience**: any product can be posted with no price so it reaches someone who needs it. Whoever prefers to sell can also do so, but the core idea is that nothing useful ends up in the trash.

> Make every object have a new story.

### What does ReNova do?

ReNova lets users:

- Post products as a **donation** or with a price.
- Browse the market and send **requests** from the cart.
- Accept or reject requests from **Mi tienda** (My store).
- Coordinate the delivery through a **chat** between buyer and seller.
- Ask **Helpy**, the platform's AI assistant, for help.

There are no payments inside the app: purchases and donations follow the same request flow.

### How does it work?

1. A **socio** (partner) posts a product with a photo, category and description, and can mark it as a donation.
2. Buyers open the product detail and add it to the cart.
3. A request is sent to the seller, who accepts or rejects it.
4. If accepted, the product is **reserved** and removed from the market.
5. Both talk through the chat to arrange the delivery.

### Security

- Two-step verification with a 6-digit code sent by email.
- Google sign-in.
- Phone, address and chat messages are stored encrypted.
- Addresses validated with Google Maps (Colombia only).
- Roles: `comprador` (buyer), `socio` (partner) and `admin`. A user becomes socio after registering a birth date (16 or older), a mobile phone and an address.

### Development team

| Role | Name |
|:--|:--|
| Frontend | **Juan Andres Granados** |
| Backend | **Nicolas Rojas** |
| Fullstack | **Santiago Hernandez** |
| Scrum Master | **Paula Solano** |
| UX/UI Designer | **Mariana Castro** |

### Main technologies

```bash
Frontend: Next.js, React, TypeScript and Tailwind CSS
Backend: Firebase (Authentication and Firestore) and Next.js API Routes
Images: Cloudinary
Maps and addresses: Google Maps and Google Places
Emails: Nodemailer
AI assistant: Gemini API
App deployment: Vercel
```

### Project status

ReNova is under development and currently only works in Colombia. Coming soon: ratings between users and delivery confirmation by both parties.

---

## Español

**ReNova** es una plataforma web colombiana donde las personas dan una segunda vida a los objetos que ya no usan.

La **donación es el centro de la experiencia**: cualquier producto puede publicarse sin precio para que llegue a quien lo necesita. Quien prefiera vender también puede hacerlo, pero la idea de fondo es que nada útil termine en la basura.

> Haz que cada objeto tenga una nueva historia.

### ¿Qué hace ReNova?

ReNova permite a los usuarios:

- Publicar productos como **donación** o con precio.
- Explorar el market y enviar **solicitudes** desde el carrito.
- Aceptar o rechazar solicitudes desde **Mi tienda**.
- Coordinar la entrega mediante un **chat** entre comprador y vendedor.
- Pedir ayuda a **Helpy**, el asistente con IA de la plataforma.

En ReNova no hay pagos dentro de la aplicación: tanto las compras como las donaciones siguen el mismo flujo de solicitud.

### ¿Cómo funciona?

1. Un **socio** publica un producto con foto, categoría y descripción, y puede marcarlo como donación.
2. Los compradores abren el detalle del producto y lo agregan al carrito.
3. Se envía una solicitud al vendedor, que la acepta o la rechaza.
4. Si la acepta, el producto queda **reservado** y sale del market.
5. Ambos hablan por el chat para acordar la entrega.

### Seguridad

- Verificación en dos pasos con código de 6 dígitos enviado al correo.
- Inicio de sesión con Google.
- Teléfono, dirección y mensajes del chat guardados cifrados.
- Direcciones validadas con Google Maps (solo Colombia).
- Roles: `comprador`, `socio` y `admin`. Se pasa a socio al registrar fecha de nacimiento (16 años o más), celular y dirección.

### Equipo de desarrollo

| Rol | Nombre |
|:--|:--|
| Frontend | **Juan Andres Granados** |
| Backend | **Nicolas Rojas** |
| Fullstack | **Santiago Hernandez** |
| Scrum Master | **Paula Solano** |
| Diseñadora UX/UI | **Mariana Castro** |

### Tecnologías principales

```bash
Frontend: Next.js, React, TypeScript y Tailwind CSS
Backend: Firebase (Authentication y Firestore) y API Routes de Next.js
Imágenes: Cloudinary
Mapas y direcciones: Google Maps y Google Places
Correos: Nodemailer
Asistente con IA: Gemini API
Despliegue de Aplicación: Vercel
```

### Estado del proyecto

ReNova está en desarrollo y por ahora solo funciona en Colombia. Próximamente: calificaciones entre usuarios y confirmación de entrega por ambas partes.