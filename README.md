# ReNova

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