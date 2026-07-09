export type Product = {
  name: string;
  store: string;
  price: string;
  before: string;
  tag: string;
  rating: string;
  time: string;
  image: string;
  tone: string;
};

export const categories = [
  "Todos",
  "Mercado",
  "Restaurantes",
  "Farmacia",
  "Tecnologia",
  "Hogar",
  "Ofertas",
];

export const products: Product[] = [
  {
    name: "Canasta organica",
    store: "Mercado Verde",
    price: "$42.900",
    before: "$51.000",
    tag: "Nuevo",
    rating: "4.8",
    time: "18 min",
    image: "🥬",
    tone: "from-emerald-100 to-lime-50",
  },
  {
    name: "Bowl ejecutivo",
    store: "Casa Urbana",
    price: "$28.500",
    before: "$34.000",
    tag: "-16%",
    rating: "4.7",
    time: "22 min",
    image: "🥗",
    tone: "from-orange-100 to-amber-50",
  },
  {
    name: "Kit limpieza hogar",
    store: "ReNova Market",
    price: "$36.200",
    before: "$44.900",
    tag: "Eco",
    rating: "4.9",
    time: "25 min",
    image: "🧴",
    tone: "from-sky-100 to-cyan-50",
  },
  {
    name: "Cafe especial 500g",
    store: "Montana Cafe",
    price: "$31.900",
    before: "$38.000",
    tag: "Top",
    rating: "4.9",
    time: "16 min",
    image: "☕",
    tone: "from-stone-100 to-yellow-50",
  },
  {
    name: "Audifonos wireless",
    store: "Tech Express",
    price: "$119.900",
    before: "$149.900",
    tag: "-20%",
    rating: "4.6",
    time: "30 min",
    image: "🎧",
    tone: "from-violet-100 to-slate-50",
  },
  {
    name: "Desayuno completo",
    store: "Brunch Club",
    price: "$24.900",
    before: "$29.900",
    tag: "Promo",
    rating: "4.8",
    time: "14 min",
    image: "🥐",
    tone: "from-rose-100 to-orange-50",
  },
  {
    name: "Protector solar",
    store: "Farmacia Plus",
    price: "$54.700",
    before: "$62.000",
    tag: "Salud",
    rating: "4.7",
    time: "20 min",
    image: "🧴",
    tone: "from-blue-100 to-indigo-50",
  },
  {
    name: "Pack frutas frescas",
    store: "La Plaza",
    price: "$27.800",
    before: "$33.500",
    tag: "Fresco",
    rating: "4.9",
    time: "17 min",
    image: "🍓",
    tone: "from-red-100 to-pink-50",
  },
];

