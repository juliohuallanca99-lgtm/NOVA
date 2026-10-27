# NOVA Store

Tienda de ropa (React + Vite + Tailwind) con estructura lista para sumar accesorios sin rediseñar.

## Ejecutar

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción (carpeta dist)
```

## Desplegar en Vercel

Importa el repositorio en Vercel. Detecta Vite solo: build `npm run build`, salida `dist`.

## Cómo agregar un accesorio

Edita el arreglo `products` en `src/FashionStore.jsx` y agrega un objeto con `type: "accesorio"`,
`collection`, `attributes` (material, color) y `pairsWith` (ids de prendas con las que combina).
Los filtros, la ficha, el carrito y "Completa el look" se actualizan solos.
Con `status: "soon"` el producto aparece como "Próximamente" y captura correos.

## Pendientes

- [ ] Conectar pasarela de pago real (Mercado Pago, Culqi, Izipay o Stripe). Hoy `startCheckout` es una demo.
- [ ] Conectar la lista de espera y el boletín a una herramienta de correo (Klaviyo, Mailchimp o Supabase).
- [ ] Reemplazar las medidas de ejemplo de `SIZE_GUIDE` por las reales.
- [ ] Reemplazar las fotos repetidas del Cinturón y el Reloj (marcadas con `TODO`).
- [ ] Páginas propias por producto con URL (necesarias para SEO) y renderizado en servidor (Next.js) o catálogo desde Shopify.
- [ ] Definir el nicho y adaptar nombres, colecciones y textos.

## Analítica

Los eventos (`view_item`, `add_to_cart`, `begin_checkout`, `waitlist_signup`, `select_filter`) se envían a
`window.dataLayer`; basta agregar Google Tag Manager al `index.html` para recibirlos.
