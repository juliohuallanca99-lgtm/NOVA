import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Instagram,
  Facebook,
  MessageCircle,
  Minus,
  Plus,
  Ruler,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

/* ------------------------------------------------------------------ */
/* CONFIGURACIÓN                                                       */
/* ------------------------------------------------------------------ */
const FREE_SHIPPING_FROM = 199; // S/
const LOW_STOCK_AT = 5;

// Analítica: empuja eventos al dataLayer (GA4/GTM hoy, Segment mañana).
const track = (event, data = {}) => {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
  } catch {
    /* sin analítica: no rompe la tienda */
  }
};

// Imágenes responsivas (Unsplash permite cambiar el ancho por URL).
const sized = (url, w) => url.replace(/w=\d+/, `w=${w}`);

/* ------------------------------------------------------------------ */
/* MODELO DE DATOS (agnóstico al tipo de producto)                     */
/* Para sumar accesorios: agregar objetos aquí (o venir de Shopify).   */
/* Nada del diseño depende de que sea ropa.                            */
/* ------------------------------------------------------------------ */
const SIZES = {
  prenda: ["XS", "S", "M", "L", "XL"],
  calzado: ["37", "38", "39", "40", "41", "42"],
  accesorio: ["Única"],
};

// Valores de EJEMPLO: reemplazar con las medidas reales de tu taller/proveedor.
const SIZE_GUIDE = {
  prenda: {
    head: ["Talla", "Pecho (cm)", "Cintura (cm)"],
    rows: [
      ["XS", "82-86", "62-66"],
      ["S", "86-90", "66-70"],
      ["M", "90-96", "70-76"],
      ["L", "96-102", "76-82"],
      ["XL", "102-110", "82-90"],
    ],
  },
  calzado: {
    head: ["Talla PE", "Largo del pie (cm)"],
    rows: [["37", "23.5"], ["38", "24.2"], ["39", "25.0"], ["40", "25.7"], ["41", "26.5"], ["42", "27.2"]],
  },
};

const categories = [
  { name: "Mujer", subtitle: "Temporada esencial", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85" },
  { name: "Hombre", subtitle: "Estilo urbano", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=85" },
  { name: "Accesorios", subtitle: "El detalle final", image: "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=1200&q=85" },
];

const products = [
  {
    id: 1, name: "Blazer Essential", category: "Mujer", type: "prenda", collection: "Oficina flexible",
    price: 169.9, oldPrice: 219.9, tag: "-23%", stock: 4,
    attributes: { material: "Mezcla de lana", color: "Negro" },
    fit: "Calce regular. Si estás entre dos tallas, elige la mayor.",
    description: "Corte limpio que pasa de la oficina a la cena sin cambiar de look.",
    pairsWith: [5, 7, 8],
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2, name: "Camisa Oxford", category: "Hombre", type: "prenda", collection: "Oficina flexible",
    price: 99.9, tag: "Nuevo", stock: 12,
    attributes: { material: "Algodón", color: "Celeste" },
    fit: "Calce regular, manga a la muñeca.",
    description: "Algodón suave y cuello estructurado que mantiene la forma.",
    pairsWith: [7, 8, 4],
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3, name: "Vestido Aura", category: "Mujer", type: "prenda", collection: "Fin de semana urbano",
    price: 139.9, tag: "Más vendido", stock: 9,
    attributes: { material: "Viscosa", color: "Arena" },
    fit: "Caída fluida, talla holgada en cadera.",
    description: "Ligero y cómodo, pensado para días largos.",
    pairsWith: [5, 6],
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4, name: "Casaca Urban", category: "Hombre", type: "prenda", collection: "Ciudad y viaje",
    price: 189.9, stock: 3,
    attributes: { material: "Poliéster reciclado", color: "Verde oliva" },
    fit: "Calce amplio para llevar capas debajo.",
    description: "Resistente al viento, con bolsillos que sí se usan.",
    pairsWith: [5, 6, 2],
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5, name: "Bolso Terra", category: "Accesorios", type: "accesorio", collection: "Ciudad y viaje",
    price: 119.9, tag: "Nuevo", stock: 15,
    attributes: { material: "Cuero vegano", color: "Marrón" },
    description: "Capacidad para el día entero, con correa ajustable.",
    pairsWith: [1, 3, 4],
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6, name: "Zapatilla Street", category: "Calzado", type: "calzado", collection: "Fin de semana urbano",
    price: 159.9, oldPrice: 199.9, tag: "Oferta", stock: 7,
    attributes: { material: "Cuero vegano", color: "Blanco" },
    fit: "Calce true to size.",
    description: "Suela cómoda y diseño limpio que combina con todo.",
    pairsWith: [3, 4],
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85",
  },
  // --- Accesorios "Próximamente": siembran deseo y capturan lista de espera ---
  {
    id: 7, name: "Cinturón Atelier", category: "Accesorios", type: "accesorio", collection: "Oficina flexible",
    price: 79.9, tag: "Próximamente", status: "soon", stock: 0,
    attributes: { material: "Cuero vegano", color: "Negro" },
    description: "Hebilla mate y cuero flexible. Llega pronto.",
    pairsWith: [1, 2],
    // TODO: reemplazar por la foto real del producto
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 8, name: "Reloj Minimal", category: "Accesorios", type: "accesorio", collection: "Oficina flexible",
    price: 249.9, tag: "Próximamente", status: "soon", stock: 0,
    attributes: { material: "Acero", color: "Plateado" },
    description: "Esfera limpia, correa intercambiable. Llega pronto.",
    pairsWith: [1, 2],
    // TODO: reemplazar por la foto real del producto
    image: "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=900&q=85",
  },
];

const categoryFilters = ["Todos", "Novedades", "Mujer", "Hombre", "Accesorios", "Calzado", "Ofertas"];
const navItems = ["Novedades", "Mujer", "Hombre", "Accesorios", "Ofertas"];

const byId = (id) => products.find((p) => p.id === id);
const money = (n) => `S/ ${n.toFixed(2)}`;

const matchesCategory = (p, cat) => {
  if (cat === "Todos") return true;
  if (cat === "Ofertas") return !!p.oldPrice;
  if (cat === "Novedades") return p.tag === "Nuevo";
  return p.category === cat;
};

/* ------------------------------------------------------------------ */
/* SEO: datos estructurados Product (JSON-LD)                          */
/* ------------------------------------------------------------------ */
function ProductSchema({ product }) {
  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: [sized(product.image, 900)],
    description: product.description,
    sku: `NOVA-${product.id}`,
    brand: { "@type": "Brand", name: "NOVA" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: product.price.toFixed(2),
      availability:
        product.status === "soon" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/* ------------------------------------------------------------------ */
/* FICHA DE PRODUCTO (modal)                                           */
/* ------------------------------------------------------------------ */
function ProductModal({ product, onClose, onAdd, onOpen, favorites, toggleFavorite }) {
  const [size, setSize] = useState(product.type === "accesorio" ? "Única" : null);
  const [error, setError] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const soon = product.status === "soon";
  const sizes = SIZES[product.type];
  const guide = SIZE_GUIDE[product.type];
  const pairs = product.pairsWith.map(byId).filter(Boolean);

  useEffect(() => {
    track("view_item", { item_id: product.id, item_name: product.name, price: product.price });
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitWaitlist = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    // TODO: conectar con tu lista (Klaviyo / Mailchimp / Supabase)
    track("waitlist_signup", { item_id: product.id, item_name: product.name });
    setSent(true);
  };

  const add = () => {
    if (!size) {
      setError(true);
      return;
    }
    onAdd(product, size);
    onClose();
  };

  return (
    <>
      <ProductSchema product={product} />
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-[28px] bg-white shadow-2xl md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-[min(960px,94vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]"
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow" aria-label="Cerrar">
          <X size={18} />
        </button>
        <div className="grid md:grid-cols-2">
          <div className="aspect-[4/5] bg-[#eeeae4] md:aspect-auto md:min-h-[560px]">
            <img
              src={sized(product.image, 900)}
              srcSet={`${sized(product.image, 600)} 600w, ${sized(product.image, 900)} 900w, ${sized(product.image, 1400)} 1400w`}
              sizes="(min-width: 768px) 480px, 100vw"
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold tracking-[.2em] text-[#a44d32]">{product.collection.toUpperCase()}</p>
            <h2 className="mt-2 text-3xl font-bold">{product.name}</h2>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-2xl font-bold">{money(product.price)}</span>
              {product.oldPrice && <span className="text-sm text-black/40 line-through">{money(product.oldPrice)}</span>}
            </div>
            <p className="mt-4 text-sm leading-6 text-black/65">{product.description}</p>
            <p className="mt-3 text-xs text-black/50">
              {product.attributes.material} · {product.attributes.color}
            </p>

            {soon ? (
              <div className="mt-6 rounded-2xl bg-[#f7f5f1] p-5">
                <p className="font-semibold">Lanzamiento pronto</p>
                <p className="mt-1 text-sm text-black/55">Deja tu correo y te avisamos primero, con acceso anticipado.</p>
                {sent ? (
                  <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#1e3028]">
                    <Check size={16} /> ¡Listo! Te avisaremos.
                  </p>
                ) : (
                  <form onSubmit={submitWaitlist} className="mt-4 flex gap-2">
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu correo" className="rounded-full bg-white" />
                    <Button type="submit" className="rounded-full px-5">Avísame</Button>
                  </form>
                )}
              </div>
            ) : (
              <>
                {/* Talla + guía JUNTO al botón de compra */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Talla{size && size !== "Única" ? `: ${size}` : ""}
                    </p>
                    {guide && (
                      <button onClick={() => setShowGuide(!showGuide)} className="flex items-center gap-1 text-xs font-semibold underline">
                        <Ruler size={14} /> Guía de tallas
                      </button>
                    )}
                  </div>
                  {sizes.length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSize(s); setError(false); }}
                          className={`min-w-12 rounded-full border px-4 py-2 text-sm font-semibold transition ${size === s ? "border-black bg-black text-white" : "border-black/15 hover:border-black"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {error && <p className="mt-2 text-xs font-semibold text-[#a44d32]">Elige una talla para continuar.</p>}
                  {product.fit && <p className="mt-3 text-xs text-black/55">Calce: {product.fit}</p>}

                  {showGuide && guide && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 text-sm">
                      <table className="w-full text-left">
                        <thead className="bg-[#f2f0ec] text-xs">
                          <tr>{guide.head.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {guide.rows.map((r) => (
                            <tr key={r[0]} className="border-t border-black/5">
                              {r.map((c, i) => <td key={i} className="px-3 py-2">{c}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {product.stock <= LOW_STOCK_AT && (
                  <p className="mt-4 text-xs font-semibold text-[#a44d32]">Quedan pocas unidades ({product.stock}).</p>
                )}

                <div className="mt-5 flex gap-3">
                  <Button onClick={add} className="flex-1 rounded-full py-6 text-base">Agregar al carrito</Button>
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="rounded-full border border-black/15 p-4"
                    aria-label="Guardar en favoritos"
                  >
                    <Heart size={20} className={favorites.includes(product.id) ? "fill-[#a44d32] text-[#a44d32]" : ""} />
                  </button>
                </div>
              </>
            )}

            <ul className="mt-6 space-y-2 text-xs text-black/60">
              <li className="flex items-center gap-2"><Truck size={15} /> Envío gratis desde S/ {FREE_SHIPPING_FROM}</li>
              <li className="flex items-center gap-2"><RefreshCcw size={15} /> Cambios hasta 30 días</li>
              <li className="flex items-center gap-2"><ShieldCheck size={15} /> Pago seguro</li>
            </ul>

            {/* Completa el look: hoy mezcla prendas y accesorios; mañana, más accesorios sin rediseñar */}
            {pairs.length > 0 && (
              <div className="mt-8 border-t border-black/10 pt-6">
                <h3 className="text-sm font-bold">Completa el look</h3>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {pairs.slice(0, 3).map((p) => (
                    <button key={p.id} onClick={() => onOpen(p)} className="text-left">
                      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#eeeae4]">
                        <img src={sized(p.image, 300)} alt={p.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-tight">{p.name}</p>
                      <p className="text-xs text-black/50">{p.status === "soon" ? "Próximamente" : money(p.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* TIENDA                                                              */
/* ------------------------------------------------------------------ */
export default function FashionStore() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [collection, setCollection] = useState("Todas");
  const [material, setMaterial] = useState("Todos");
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nova-cart") || "[]");
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [checkoutNote, setCheckoutNote] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("nova-cart", JSON.stringify(cart));
    } catch {
      /* ignorar */
    }
  }, [cart]);

  // Los filtros por atributo se derivan de los datos: al cargar accesorios nuevos aparecen solos.
  const collections = useMemo(() => ["Todas", ...new Set(products.map((p) => p.collection))], []);
  const materials = useMemo(() => ["Todos", ...new Set(products.map((p) => p.attributes.material))], []);

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          matchesCategory(p, activeFilter) &&
          (collection === "Todas" || p.collection === collection) &&
          (material === "Todos" || p.attributes.material === material) &&
          p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [activeFilter, collection, material, query]
  );

  const filtersActive = activeFilter !== "Todos" || collection !== "Todas" || material !== "Todos" || query;
  const clearFilters = () => {
    setActiveFilter("Todos");
    setCollection("Todas");
    setMaterial("Todos");
    setQuery("");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const remainingForFree = Math.max(0, FREE_SHIPPING_FROM - cartTotal);
  const freeShippingPct = Math.min(100, (cartTotal / FREE_SHIPPING_FROM) * 100);

  const lineKey = (item) => `${item.id}-${item.size}`;

  const addToCart = (product, size) => {
    setCart((current) => {
      const key = `${product.id}-${size}`;
      const found = current.find((item) => lineKey(item) === key);
      return found
        ? current.map((item) => (lineKey(item) === key ? { ...item, qty: item.qty + 1 } : item))
        : [...current, { ...product, size, qty: 1 }];
    });
    track("add_to_cart", { item_id: product.id, item_name: product.name, price: product.price, size });
    setCartOpen(true);
  };

  const changeQty = (key, delta) => {
    setCart((current) =>
      current
        .map((item) => (lineKey(item) === key ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const toggleFavorite = (id) =>
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const openProduct = (product) => {
    setCartOpen(false);
    setSelected(product);
  };

  // Sugerencias en el carrito: lo que combina con lo que ya llevas
  const cartSuggestions = useMemo(() => {
    const inCart = new Set(cart.map((i) => i.id));
    const ids = [...new Set(cart.flatMap((i) => i.pairsWith))];
    return ids
      .filter((id) => !inCart.has(id))
      .map(byId)
      .filter((p) => p && p.status !== "soon")
      .slice(0, 2);
  }, [cart]);

  const goTo = (item) => {
    setActiveFilter(item);
    track("select_filter", { filter: item });
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
  };

  const startCheckout = (method) => {
    track("begin_checkout", { method, value: cartTotal, items: cartCount });
    // TODO: conectar la pasarela real (Mercado Pago / Culqi / Izipay / Stripe, etc.)
    setCheckoutNote(`Demo: aquí se abriría el pago con ${method}.`);
  };

  const quickAction = (product) => {
    if (product.status === "soon" || SIZES[product.type].length > 1) return openProduct(product);
    addToCart(product, SIZES[product.type][0]);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f1] text-[#171717]">
      <div className="bg-[#171717] px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
        ENVÍO GRATIS EN COMPRAS DESDE S/ {FREE_SHIPPING_FROM} · CAMBIOS HASTA 30 DÍAS
      </div>

      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f5f1]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menú">
            {mobileMenu ? <X /> : <Menu />}
          </button>
          <a href="#inicio" className="text-2xl font-black tracking-[0.22em]">NOVA</a>
          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex">
            {navItems.map((item) => (
              <a key={item} href="#productos" onClick={() => goTo(item)} className="transition hover:text-[#a44d32]">{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Buscar"><Search size={20} /></button>
            <button className="relative" aria-label="Favoritos">
              <Heart size={20} />
              <span className="absolute -right-2 -top-2 text-[10px]">{favorites.length}</span>
            </button>
            <button className="relative" onClick={() => setCartOpen(true)} aria-label="Carrito">
              <ShoppingBag size={20} />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#a44d32] text-[9px] text-white">{cartCount}</span>
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="mx-auto max-w-7xl px-5 pb-4">
            <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar prendas, accesorios..." className="rounded-full bg-white" />
          </div>
        )}
        {mobileMenu && (
          <nav className="border-t bg-white px-5 py-4 lg:hidden">
            {navItems.map((item) => (
              <a key={item} href="#productos" className="block py-3 font-semibold" onClick={() => { goTo(item); setMobileMenu(false); }}>{item}</a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section id="inicio" className="relative min-h-[78vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2000&q=90"
            alt="Nueva colección de moda"
            fetchpriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-6 lg:px-8">
            <div className="max-w-xl text-white">
              <Badge className="mb-5 rounded-full bg-white/15 px-4 py-2 text-white backdrop-blur-md">COLECCIÓN 2026</Badge>
              <h1 className="text-5xl font-black leading-[.95] sm:text-7xl">Tu estilo.<br />Tu momento.</h1>
              <p className="mt-6 max-w-md text-base text-white/85 sm:text-lg">Prendas versátiles para vestir con seguridad todos los días.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => goTo("Todos")} className="rounded-full bg-white px-7 text-black hover:bg-white/90">
                  Comprar ahora <ArrowRight className="ml-2" size={18} />
                </Button>
                <Button size="lg" variant="outline" onClick={() => goTo("Novedades")} className="rounded-full border-white bg-transparent px-7 text-white hover:bg-white hover:text-black">
                  Ver novedades
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-[.25em] text-[#a44d32]">DESCUBRE</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Compra por categoría</h2>
            </div>
            <a href="#productos" onClick={() => goTo("Todos")} className="hidden items-center gap-2 text-sm font-semibold sm:flex">Ver todo <ArrowRight size={16} /></a>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {categories.map((category) => (
              <motion.button whileHover={{ y: -5 }} key={category.name} onClick={() => goTo(category.name)} className="group relative h-[430px] overflow-hidden rounded-[28px] text-left shadow-sm">
                <img src={sized(category.image, 800)} alt={category.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute bottom-0 p-7 text-white">
                  <p className="text-sm text-white/75">{category.subtitle}</p>
                  <h3 className="mt-1 text-3xl font-bold">{category.name}</h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Explorar <ArrowRight size={16} /></span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        <section id="productos" className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold tracking-[.25em] text-[#a44d32]">SELECCIÓN NOVA</p>
                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Productos destacados</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categoryFilters.map((filter) => (
                  <button key={filter} onClick={() => setActiveFilter(filter)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${activeFilter === filter ? "bg-black text-white" : "bg-[#f2f0ec] hover:bg-[#e8e4dd]"}`}>{filter}</button>
                ))}
              </div>
            </div>

            {/* Filtros por estilo de vida y por atributo (se alimentan de los datos) */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-black/45">COLECCIÓN</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {collections.map((c) => (
                    <button key={c} onClick={() => setCollection(c)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${collection === c ? "border-black bg-black text-white" : "border-black/15 hover:border-black"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-black/45">MATERIAL</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {materials.map((m) => (
                    <button key={m} onClick={() => setMaterial(m)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${material === m ? "border-black bg-black text-white" : "border-black/15 hover:border-black"}`}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-black/55">
              <span>{visibleProducts.length} {visibleProducts.length === 1 ? "producto" : "productos"}</span>
              {filtersActive && <button onClick={clearFilters} className="font-semibold underline">Limpiar filtros</button>}
            </div>

            {visibleProducts.length === 0 ? (
              <div className="grid h-48 place-items-center text-center text-black/45">
                <div>
                  <p>No encontramos productos con esos filtros.</p>
                  <button onClick={clearFilters} className="mt-2 text-sm font-semibold underline">Ver todo</button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6">
                {visibleProducts.map((product) => (
                  <Card key={product.id} className="group overflow-hidden rounded-[24px] border-0 bg-transparent shadow-none">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#eeeae4]">
                      <button onClick={() => openProduct(product)} className="block h-full w-full" aria-label={`Ver ${product.name}`}>
                        <img
                          src={sized(product.image, 600)}
                          srcSet={`${sized(product.image, 400)} 400w, ${sized(product.image, 600)} 600w, ${sized(product.image, 900)} 900w`}
                          sizes="(min-width: 1024px) 380px, 50vw"
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </button>
                      {product.tag && <Badge className="absolute left-3 top-3 rounded-full bg-white text-black">{product.tag}</Badge>}
                      <button onClick={() => toggleFavorite(product.id)} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm" aria-label="Guardar en favoritos">
                        <Heart size={18} className={favorites.includes(product.id) ? "fill-[#a44d32] text-[#a44d32]" : ""} />
                      </button>
                      {/* Visible siempre en móvil; con hover solo en escritorio */}
                      <Button onClick={() => quickAction(product)} className="absolute bottom-3 left-3 right-3 rounded-full bg-white text-black transition-all hover:bg-black hover:text-white lg:translate-y-14 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                        {product.status === "soon" ? "Avísame" : SIZES[product.type].length > 1 ? "Elegir talla" : "Agregar al carrito"}
                      </Button>
                    </div>
                    <CardContent className="px-1 pt-4">
                      <p className="text-xs text-black/50">{product.category} · {product.collection}</p>
                      <div className="mt-1 flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{product.name}</h3>
                        <div className="text-right">
                          <p className="font-bold">{money(product.price)}</p>
                          {product.oldPrice && <p className="text-xs text-black/40 line-through">{money(product.oldPrice)}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="grid overflow-hidden rounded-[32px] bg-[#1e3028] text-white lg:grid-cols-2">
            <img src={sized("https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=1200&q=85", 1000)} alt="Estilo contemporáneo" loading="lazy" decoding="async" className="h-full min-h-[400px] w-full object-cover" />
            <div className="flex flex-col justify-center p-8 sm:p-14">
              <p className="text-xs font-bold tracking-[.25em] text-[#d4b897]">NUESTRA ESENCIA</p>
              <h2 className="mt-4 text-4xl font-bold">Diseñado para acompañarte</h2>
              <p className="mt-5 leading-7 text-white/70">Una colección pensada para combinar comodidad, calidad y estilo contemporáneo en cada ocasión.</p>
              <Button className="mt-7 w-fit rounded-full bg-white px-6 text-black hover:bg-white/90">Conoce nuestra historia</Button>
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 bg-[#efeae3]">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-3 lg:px-8">
            {[
              [Truck, "Envíos a todo el Perú", "Entrega segura y seguimiento"],
              [RefreshCcw, "Cambios fáciles", "Hasta 30 días para cambiar"],
              [ShieldCheck, "Compra protegida", "Pagos seguros y confiables"],
            ].map(([Icon, title, text]) => (
              <div key={title} className="flex items-center gap-4">
                <div className="rounded-full bg-white p-3"><Icon size={22} /></div>
                <div><h3 className="font-bold">{title}</h3><p className="text-sm text-black/55">{text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p className="text-xs font-bold tracking-[.25em] text-[#a44d32]">COMUNIDAD NOVA</p>
          <h2 className="mt-3 text-3xl font-bold">Recibe novedades y ofertas</h2>
          <p className="mt-3 text-black/55">Sé el primero en conocer nuevos lanzamientos, y acceso anticipado a la línea de accesorios.</p>
          <div className="mx-auto mt-7 flex max-w-lg gap-2 rounded-full bg-white p-2 shadow-sm">
            <Input type="email" placeholder="Tu correo electrónico" className="rounded-full border-0 shadow-none" />
            <Button className="rounded-full px-6">Suscribirme</Button>
          </div>
        </section>
      </main>

      <footer className="bg-[#171717] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4 lg:px-3">
          <div>
            <div className="text-2xl font-black tracking-[.22em]">NOVA</div>
            <p className="mt-4 text-sm leading-6 text-white/55">Moda actual para expresar tu mejor versión.</p>
            <div className="mt-5 flex gap-3"><Instagram size={19} /><Facebook size={19} /><MessageCircle size={19} /></div>
          </div>
          {[
            ["Comprar", "Mujer", "Hombre", "Accesorios", "Ofertas"],
            ["Ayuda", "Preguntas frecuentes", "Envíos", "Cambios y devoluciones", "Contacto"],
            ["Nosotros", "Nuestra historia", "Tiendas", "Trabaja con nosotros", "Términos y privacidad"],
          ].map((col) => (
            <div key={col[0]}>
              <h3 className="font-bold">{col[0]}</h3>
              {col.slice(1).map((item) => (
                <a href="#" key={item} className="mt-3 block text-sm text-white/55 hover:text-white">{item}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-white/40">© 2026 NOVA. Tienda demostrativa.</div>
      </footer>

      {selected && (
        <ProductModal
          key={selected.id}
          product={selected}
          onClose={() => setSelected(null)}
          onAdd={addToCart}
          onOpen={openProduct}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}

      {cartOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setCartOpen(false)} />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Tu carrito ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Cerrar carrito"><X /></button>
            </div>

            {/* Barra de envío gratis: sube el ticket promedio */}
            {cart.length > 0 && (
              <div className="mt-5 rounded-2xl bg-[#f7f5f1] p-4">
                <p className="text-sm font-semibold">
                  {remainingForFree > 0
                    ? `Te faltan ${money(remainingForFree)} para envío gratis`
                    : "¡Tienes envío gratis!"}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                  <div className="h-full rounded-full bg-[#a44d32] transition-all" style={{ width: `${freeShippingPct}%` }} />
                </div>
              </div>
            )}

            <div className="mt-6 flex-1 space-y-5 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="grid h-64 place-items-center text-center text-black/45">
                  <div><ShoppingBag className="mx-auto mb-3" size={38} /><p>Tu carrito está vacío</p></div>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={lineKey(item)} className="flex gap-4">
                    <img src={sized(item.image, 200)} alt={item.name} className="h-24 w-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-xs text-black/50">{item.size !== "Única" ? `Talla ${item.size} · ` : ""}{item.attributes.color}</p>
                      <p className="mt-1 text-sm font-bold">{money(item.price)}</p>
                      <div className="mt-3 flex w-fit items-center gap-3 rounded-full border px-2 py-1">
                        <button onClick={() => changeQty(lineKey(item), -1)} aria-label="Quitar uno"><Minus size={14} /></button>
                        <span className="text-sm">{item.qty}</span>
                        <button onClick={() => changeQty(lineKey(item), 1)} aria-label="Agregar uno"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {cartSuggestions.length > 0 && (
                <div className="border-t pt-5">
                  <h3 className="text-sm font-bold">Completa el look</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {cartSuggestions.map((p) => (
                      <button key={p.id} onClick={() => openProduct(p)} className="text-left">
                        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#eeeae4]">
                          <img src={sized(p.image, 300)} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                        </div>
                        <p className="mt-2 text-xs font-semibold">{p.name}</p>
                        <p className="text-xs text-black/50">{money(p.price)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-5">
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(cartTotal)}</span></div>
              <p className="mt-1 text-xs text-black/45">El envío se calcula al finalizar la compra.</p>

              {/* Pagos express primero */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button disabled={!cart.length} onClick={() => startCheckout("Yape / Plin")} className="rounded-full bg-[#742284] py-5 text-white hover:bg-[#5d1c6a]">Yape / Plin</Button>
                <Button disabled={!cart.length} onClick={() => startCheckout("Apple Pay")} className="rounded-full bg-black py-5 text-white">Apple Pay</Button>
              </div>
              <Button disabled={!cart.length} onClick={() => startCheckout("tarjeta")} variant="outline" className="mt-2 w-full rounded-full py-5">Pagar con tarjeta</Button>
              {checkoutNote && <p className="mt-3 text-center text-xs text-[#a44d32]">{checkoutNote}</p>}
            </div>
          </motion.aside>
        </>
      )}

      <a href="https://wa.me/" target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-30 rounded-full bg-[#25D366] p-4 text-white shadow-xl" aria-label="WhatsApp">
        <MessageCircle />
      </a>
    </div>
  );
}
