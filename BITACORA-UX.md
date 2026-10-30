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

---

## 2026-10-28 — Etapa 2: página «Descubrí La Rioja»

**Objetivo:** nueva página turística integrada a RealityTour, con contenido basado en el portal oficial de Turismo de La Rioja.

**Archivos creados:** `larioja.html`, `css/larioja.css`, `assets/img/larioja/hero-720.jpg`, `assets/img/larioja/hero-1092.jpg`.
**Archivos modificados:** `index.html`, `realitytour.html` (nueva opción de menú), `css/styles.css` (ajuste del menú entre 769 y 960 px).

**Secciones:** portada · índice de secciones · introducción · 01 Historia y cultura (Paseo Cultural Castro Barros, Memorial Facundo Quiroga, Convento de Santo Domingo) · 02 Naturaleza y aventura (Área Natural Juan Caro con Cascada Abrastain y Balcón de los Originarios, El Saladillo, Reserva Takú, Dique Los Sauces, dato del Parque Acuático) · 03 Parques (Parque de la Ciudad, Parque de las Juventudes) · 04 Gastronomía y artesanías (Mercado Artesanal, sabores regionales) · Conocé más (enlace a la fuente, oficina de informes, atribución y aclaración de que no es un sitio oficial).

**Decisiones técnicas:**
- Cascada Abrastain se presenta dentro de Juan Caro, como en la fuente (el trekking a la cascada es parte del área).
- Hoja `css/larioja.css` separada y acotada a `.larioja-page`: no altera las otras páginas. Se cargan las dos hojas; no se duplican reglas del menú.
- Las cabeceras de sección usan `<div>`: `styles.css` aplica `position: fixed` a todo `<header>`.
- Se reutiliza la animación `.hidden`/`.visible` de `main.js` con desplazamiento menor (40px) y se respeta `prefers-reduced-motion`.
- Portada con `<img srcset>` (720/1092 px), `fetchpriority="high"`, `100svh` con respaldo `100vh`.
- Menú: con 6 enlaces, entre 769 y 960 px los textos se partían en dos líneas; en ese rango se reduce `gap`, `padding-left` y tamaño de fuente (0.92em).
- Sin dependencias nuevas; `larioja.html` no carga Swiper.

**Fuente:** [La Rioja, Argentina: Un Tesoro de Historia, Aventura y Naturaleza](https://turismo.larioja.gob.ar/imperdibles/la-rioja-argentina-un-tesoro-de-historia-aventura-y-naturaleza/) (portal de Turismo de La Rioja, consultado el 2026-10-28). Textos redactados de nuevo; no se copió HTML/CSS. Datos de la oficina de informes tomados del pie de la misma página.

**Multimedia:**
- Portada: `assets/img/LaRiojaCapital.jpg` (ya publicada en el sitio, carrusel «¿Qué es la RA?»), recomprimida sin metadatos (408 KB → 197 KB / 86 KB). **Origen y licencia sin confirmar** (no tiene EXIF de autor): pendiente de confirmación del equipo.
- No se usaron fotos del portal: su pie indica «Copyright © 2026, Turismo | La Rioja» y no hay licencia de reutilización.
- Atractivos presentados en tarjetas sin foto (diseño tipográfico).

**Pruebas automatizadas (Playwright + Chromium headless; no son pruebas en dispositivos reales):** 49/49 OK.
- Menú de 6 enlaces en una línea a 769–1440 px en las tres páginas; header de 76 px en todas.
- Menú móvil (iPhone 13, 375×667 y 320×568): abre, X visible y operativa, 6 enlaces dentro de la pantalla, scroll bloqueado y liberado.
- Navegación: index → larioja en la misma pestaña (escritorio y móvil); larioja → index por logo, menú y «Volver a RealityTour».
- larioja: imagen de portada cargada, sin scroll horizontal, 1 `h1` y 6 `h2`, todas las imágenes con `alt`, todos los bloques animados visibles, índice de secciones con compensación del header.
- realitytour: cámara (dispositivo simulado) y pantalla completa sin cambios. Pruebas de la etapa 1: 40/40 OK.
- Sin errores JS nuevos. Persiste `Swiper is not defined` en index: el sandbox bloquea el CDN (preexistente).

**Pendiente / limitaciones:**
- Confirmar origen/licencia de `LaRiojaCapital.jpg`. Faltan fotos con permiso para los atractivos y una foto panorámica (horizontal) de mayor resolución: en escritorio la portada vertical se recorta y se amplía.
- No probado en iPhone/Safari real.
- Preexistente, fuera de alcance: `index.html` tiene scroll horizontal a 320 px de ancho.

**Commit:** `883ca1b` (rama `claude/determined-hawking-1j40dk`).

---

## 2026-10-28 — Integración del chatbot Botpress

**Objetivo:** mostrar el Webchat de Botpress como widget flotante en la página principal.

**Archivo modificado:** `index.html` (únicamente).

**Cambio:** al final del `<body>`, después de `js/main.js`:
`inject.js` (Webchat v3.7, síncrono) y luego el script de configuración del bot (`defer`). El orden garantiza que el cliente de Webchat exista antes de aplicar la configuración; al estar al final, no bloquea el renderizado de la página. Sin cambios de estilos ni de configuración: la apariencia la define Botpress Studio. No se agregó a `realitytour.html` ni a `larioja.html`.

**Pruebas:**
- Sin integraciones previas de Botpress (sin duplicados); HTML bien formado; orden de carga verificado en el navegador: swiper → main.js → inject.js → configuración (defer).
- Regresión (Playwright + Chromium, emulación iPhone y escritorio): 49/49 OK (menú en las tres páginas, navegación, cámara).
- **No se pudo probar el widget:** el entorno bloquea `cdn.botpress.cloud` y `files.bpcontent.cloud`. Con los scripts sin cargar, la página sigue funcionando sin errores nuevos.

**Pendiente:**
- Verificar en el sitio publicado que el botón flotante aparece y abre la conversación (iPhone y escritorio).
- Revisar que el botón no tape elementos inferiores y cómo se superpone con el menú móvil abierto (el z-index lo define Botpress).

**Commit:** `f3da3e4` (rama `claude/determined-hawking-1j40dk`).

---

## 2026-10-30 — Prioridad alta · Etapa 1: desborde horizontal en móviles

**Diagnóstico:**
- El scroll horizontal a 320 px registrado en la etapa 2 (`innerWidth` 387) **era un artefacto del sandbox**: el CDN de Swiper estaba bloqueado y sin `swiper-bundle.min.css` faltaba `.swiper { overflow: hidden }`, por lo que las diapositivas del carrusel desbordaban. Con Swiper cargado (11.2.10 desde npm, servido localmente solo para las pruebas) no hay scroll horizontal de 320 a 1440 px.
- Problema real encontrado: en Contacto, `.contact-item` (`flex: 1 1 45%`, `min-width: auto`) no podía encoger por debajo del correo más largo. La fila excedía el contenedor y `#contact { overflow: hidden }` **recortaba** nombre, correo y teléfono del segundo contacto entre 320 y 390 px.

**Cambio (`css/styles.css`):** `.contact-item` con `min-width: 0` y `overflow-wrap: anywhere`. En pantallas angostas el correo se parte en dos líneas; sin cambios a partir de 414 px.

**Pruebas (Playwright + Chromium; no es Safari):** 61/61 OK. Sin texto recortado en Contacto de 320 a 1440 px; sin scroll horizontal en las tres páginas (320, 390, 1366 px); carrusel RA inicializado y avanzando; slider de Servicio avanzando; menú, navegación y cámara sin cambios; sin errores JS con Swiper cargado.

**Commit:** `59ccb0c`.

---

## 2026-10-30 — Prioridad alta · Etapa 2: compatibilidad iPhone / Safari

**Auditoría `100vh`:**
| Regla | Uso | Decisión |
|---|---|---|
| `.main-section` (hero index, 3 definiciones; rige la última) | alto de portada | `100svh` con respaldo `100vh`: en Safari `100vh` es el alto con barras ocultas y el botón quedaba bajo el centro visible. `svh` evita saltos al ocultarse las barras. |
| `.nav-links` móvil (overlay fijo) | alto del menú | `100dvh` con respaldo `100vh`: un overlay fijo debe medir el área visible actual. |
| `#camera-section` (`80vh` + `margin-top: 10vh`), `.fullscreen-mode` (`100vh`) | cámara | **Sin cambios** (cámara fuera de alcance). Ver pendientes. |
| `.lr-hero` (larioja) | portada | Ya usaba `100svh` con respaldo. |

**Problema encontrado en el menú:** con `justify-content: center` y sin desplazamiento, en pantallas bajas (iPhone SE horizontal 667×375, o 320×460 con barras) «Inicio» y «Contacto» quedaban fuera de la pantalla sin forma de alcanzarlos y otro enlace quedaba debajo de la X.

**Cambios (`css/styles.css`):**
- Menú: `box-sizing: border-box`, `padding: 80px 0` (franja del logo y la X), `overflow-y: auto`, centrado con `margin-top/bottom: auto` en el primer/último `li` (centra si entra; si no, se desplaza sin recortar). Posiciones en vertical idénticas a las anteriores (verificado).
- `.menu-toggle:hover` dentro de `@media (hover: hover)`: en iOS el `:hover` queda fijo tras tocar y las barras seguían en turquesa.
- Hero: `height: 100svh` tras el respaldo `100vh`.

**Áreas seguras:** no hay `viewport-fit=cover`, por lo que Safari mantiene el contenido fuera del notch y la barra de inicio; no se requiere `env(safe-area-inset-*)`. El `env(safe-area-inset-bottom)` de `larioja.css` no tiene efecto (inocuo). No se cambió.

**Scroll del menú:** bloqueo con `html.menu-open { overflow: hidden }` (etapa 1) verificado: el fondo no se mueve, la posición se conserva al cerrar y el menú se desplaza internamente sin arrastrar el fondo (`overscroll-behavior: contain`). En Safari, `overflow: hidden` bloquea el arrastre táctil desde iOS 16; en versiones anteriores puede no bloquearlo.

**Pruebas (Playwright + Chromium con emulación; WebKit no está instalado en el entorno → no hay prueba de Safari):**
- Nuevas: 17/17 OK (menú en horizontal en las tres páginas, enlace final alcanzable y navegable, fondo bloqueado, posición conservada, barras tras cerrar). Contra la versión anterior, las de menú fallan (prueba sensible).
- El `:hover` fijo de iOS **no se reproduce en Chromium**: la corrección se basa en el comportamiento conocido de Safari y queda por verificar en iPhone.
- `svh`/`dvh` en Chromium equivalen a `vh` (no simula barras de Safari): solo se verificó que las reglas se aplican.
- Regresión completa: 61/61 OK (menú, navegación, carruseles, cámara, sin desborde, sin errores JS).

**Pendientes / oportunidades detectadas:**
- (Media) Cámara en iPhone: `#camera-section` con `80vh` + `margin-top: 10vh` y contenedor 9:16 puede exceder el alto visible con barras; el botón de pantalla completa podría requerir desplazamiento. `.fullscreen-mode` con `100vh` puede dejar la parte inferior del video bajo la barra de Safari. Requiere autorización (cámara).
- (Baja) El `env(safe-area-inset-bottom)` de `larioja.css` es inefectivo sin `viewport-fit=cover`.

**Commit:** `5f76dc7`.

---

## 2026-10-30 — Prioridad alta · Etapa 3: multimedia y rendimiento

**Análisis inicial (`index.html`):** video 23,2 MB (H.264 High 1080×1920, 30 fps, 36,2 s, 5,1 Mbit/s, sin audio, índice `moov` al final) + 7,36 MB de imágenes/HTML/CSS/JS. Tres fotos en PNG de 1–1,5 MB y logo de 1886×1296 mostrado a 50 px. `realitytour.html` solo carga el logo; `larioja.html`, logo y portada (ya optimizada).

**Video (`assets/video/hero-mobile.mp4`, mismo nombre):** recodificado con libx264 conservando códec, perfil, resolución, fps, formato de píxel, cuadros (1086) y duración; CRF 29, `-movflags +faststart`. 23,2 MB → 12,8 MB (−45 %), SSIM 0,984 (CRF 24: 20,9 MB / 0,992; CRF 27: 15,6 MB / 0,987). Sin diferencias visibles al comparar cuadros a resolución nativa. No se redujo la resolución (en iPhone se muestra a ~1170 px de ancho). El original sigue disponible en el historial de git (p. ej. `git show 5715724:assets/video/hero-mobile.mp4`).

**Imágenes (`assets/img/web/`, originales conservados):**
| Original | Optimizada | Tamaño | SSIM |
|---|---|---|---|
| imggob.png (carrusel) | imggob-carrusel.jpg | 1,05 MB → 41 KB | 0,994 |
| paseo.png | paseo.jpg | 1,44 MB → 186 KB | 0,977 |
| capturacorregido.png (alfa sin uso visible, aplanado sobre #111112) | capturacorregido.jpg | 1,42 MB → 152 KB | 0,978 |
| relgaCuadrada.png (slider) | relgaCuadrada.jpg | 1,47 MB → 62 KB | 0,996 |
| IAale.jpg / IAjuan.jpg (q86) | IAale.jpg / IAjuan.jpg | 201/293 KB → 145/120 KB | 0,972 / 0,973 |
| logocolor.png (3 páginas) | logocolor.png 218×150 | 105 KB → 16 KB | — |

Se mantuvieron dimensiones (no superan el tamaño mostrado a 3×). Sin cambios: `plaza.jpg`, `catedral.jpg`, `imggob.jpg`, `LaRiojaCapital.jpg` (ahorro < 25 % a costa de calidad).

**Carga diferida:** `loading="lazy"` en el slider de Servicio y en las biografías. El carrusel RA queda con carga normal: dentro del contenedor recortado, las diapositivas diferidas solo se pedirían al entrar en vista y podrían aparecer vacías durante la transición.

**Resultado:** imágenes/HTML/CSS/JS de `index.html`: 7,36 MB → 2,35 MB (−68 %); video 23,2 → 12,8 MB. Total aproximado 30,5 → 15,2 MB.

**Pruebas (Chromium + emulación; Swiper servido localmente):**
- Video: se reproduce (`readyState` 4, tiempo avanzando, sin error).
- Con 4G simulado, las imágenes diferidas no se piden hasta acercarse; tras recorrer, todas cargan. (Sin red simulada, Chromium usa ~3000 px de margen y las carga de inmediato.)
- Regresión 61/61 y pruebas iOS de la etapa 2 17/17; sin scroll horizontal (320/390/1366); revisión visual de portada, carrusel y slider.

**Pendientes / oportunidades:**
- (Media) La primera diapositiva del carrusel «¿Qué es la RA?» (`imggob.png`) es un gráfico de regla, no una fotografía: parece una imagen de prueba. Confirmar con el equipo.
- (Media) Swiper se carga desde CDN con versión flotante `swiper@11`: una actualización menor podría cambiar el comportamiento. Recomendado fijar versión exacta (p. ej. 11.2.10, la probada).
- (Baja) Video: `poster` (primer cuadro liviano) mejoraría la percepción de carga; requiere generar una imagen nueva.
- (Baja) Imágenes del carrusel y del slider sin `width`/`height` ni `alt` descriptivos («Imagen 1…»).
- (Baja) 9 archivos sin uso en `assets/img` (~7 MB) más los originales reemplazados por `web/`: limpieza pendiente de aprobación.
- (Baja) `#contact { overflow: hidden }` y otros `!important` ocultan desbordes en lugar de evitarlos (ya detectado como M2).

**Commit:** `5745f60`.
