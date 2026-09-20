"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/types/products";

/** Fetch products from the /api/products endpoint. */
async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) return [];
  return res.json();
}

export function useFirestoreProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchProducts();
        if (!cancelled) setProducts(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}
