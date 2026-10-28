# Bitácora UX/UI — RealityTour (UmbrelaV1)

Línea de trabajo exclusiva de interfaz y experiencia de usuario. Independiente de la bitácora de RA/geolocalización (repositorio `Cloude`).

- Repositorio: `lgqseiscelularlg-source/UmbrelaV1`
- Rama de trabajo: `claude/determined-hawking-1j40dk`

---

## 2026-10-28 — Auditoría inicial (sin cambios de código)

**Objetivo:** relevar estructura, tecnologías y problemas de la interfaz.

**Resumen:**
- Sitio estático: `index.html` (landing), `realitytour.html` (cámara), `css/styles.css` único, `js/main.js`, `js/realitytour.js`. Dependencia externa: Swiper 11 (CDN).
- Sin librerías de RA en este repo. Componente a preservar: cámara en `realitytour.js` (`getUserMedia`, cambio de cámara, pantalla completa simulada) y sus IDs/clases.
- Problemas principales: menú móvil que no se cierra con el botón, navegación distinta entre páginas, uso de `100vh` sin áreas seguras en iPhone, recursos pesados (video 23 MB, imágenes sin optimizar), CSS duplicado/sin uso, clase `.hidden` usada como animación, accesibilidad básica incompleta.
- Mejoras priorizadas: A1–A4 (alta), M1–M4 (media), B1–B5 (baja).

**Pendiente:** etapas siguientes según aprobación.

---

## 2026-10-28 — Etapa 1: menú de navegación (A1, A4)

**Objetivo:** que el menú móvil se pueda cerrar con su botón, sea accesible y quede unificado entre páginas.

**Archivos:** `index.html`, `realitytour.html`, `css/styles.css`, `js/main.js`.

**Cambios:**
- Botón: `<div class="menu-toggle">` → `<button type="button">` con `aria-label` (Abrir/Cerrar menú), `aria-expanded` y `aria-controls="nav-menu"`; barras como `<span>`.
- Capas: `.nav-links` móvil `z-index` 9999 → 1001 (dentro del contexto del header), quedando debajo del botón (1002). Era la causa de que la X no se pudiera tocar.
- Ícono X: rotación de las barras 1 y 3 y ocultamiento de la 2 bajo `.menu-toggle.active` (la clase ya estaba prevista en el CSS pero nunca se aplicaba).
- Scroll de fondo: clase `menu-open` en `<html>` (`overflow: hidden`). Se usa `<html>` y no `<body>` porque `realitytour.js` escribe `body.style.overflow` inline al salir de pantalla completa y anularía la regla.
- Menú cerrado con `visibility: hidden` (con retardo igual a la transición) para que sus enlaces no reciban foco; misma animación de apertura y cierre.
- Teclado: Enter/Espacio nativos del botón; Escape cierra y devuelve el foco. Foco visible con `:focus-visible`.
- Si la vista pasa a escritorio (>768px) con el menú abierto, se cierra para no dejar el scroll bloqueado.
- Área táctil del botón ampliada con `padding: 8px; margin: -8px` (sin mover el ícono).
- Navegación unificada en ambas páginas: Inicio, ¿Qué es la RA?, Nuestro Servicio, ¿Quiénes somos?, Contacto (`realitytour.html` apunta a `index.html#…`).

**Sin cambios en:** `js/realitytour.js`, cámara, carruseles, video.

**Pruebas (Playwright + Chromium headless, emulación iPhone 13 y escritorio 1366×800):** 40/40 comprobaciones OK.
- Abrir/cerrar con la X en ambas páginas; X por encima del panel (`elementFromPoint`); barras cruzadas.
- Scroll bloqueado con el menú abierto y restaurado al cerrar; también tras usar pantalla completa en `realitytour.html`.
- Enter, Espacio y Escape; enlaces cierran el menú y navegan (incluido `realitytour.html` → `index.html#contact` / `#ra`).
- Escritorio: hamburguesa oculta y cinco enlaces visibles en ambas páginas.
- Cámara (dispositivo simulado): stream asignado y pantalla completa operativa.
- Error `Swiper is not defined` observado también en `main` sin cambios: el sandbox bloquea el CDN de jsDelivr. No relacionado.

**Pendiente / limitaciones:**
- No probado en iPhone/Safari real ni en motor WebKit (solo Chromium con emulación).
- `overflow: hidden` en `<html>` bloquea el scroll en iOS 16+; en versiones anteriores de Safari podría no bloquear el arrastre táctil.
- El header oculto por scroll sigue usando estilos inline desde `main.js` (fuera del alcance de esta etapa).

**Commit:** `70cdcc0` (rama `claude/determined-hawking-1j40dk`).
