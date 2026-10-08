"use client";

import { useEffect, useState } from "react";

const CART_KEY = "renova-cart";

function readCart(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveCart(ids: string[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("renova-cart-change"));
}

export function useCart() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const load = () => setIds(readCart());
    load();
    window.addEventListener("renova-cart-change", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("renova-cart-change", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // Cada publicación es única: si ya está en el carrito no se repite
  function addToCart(id: string) {
    const current = readCart();
    if (!current.includes(id)) saveCart([...current, id]);
  }

  function removeFromCart(id: string) {
    saveCart(readCart().filter((item) => item !== id));
  }

  function isInCart(id: string) {
    return ids.includes(id);
  }

  return { ids, addToCart, removeFromCart, isInCart };
}