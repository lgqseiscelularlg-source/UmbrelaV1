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

---

## 2026-10-31 — Video de portada no arranca en iPhone hasta el primer scroll (investigación)

**Síntoma (prueba real, iPhone/WebKit):** al cargar, el video queda quieto; arranca con un pequeño scroll; luego sigue normal. En escritorio funciona.

**Investigación del código:**
- `<video autoplay muted loop playsinline preload="auto">` con atributos correctos para Safari iOS. Sin pista de audio (verificado con ffprobe). La optimización del 30/10 conservó códec, perfil, resolución y cuadros; agregó `faststart` (favorece el arranque). El problema es previo (el script de respaldo existe desde 2025-10-16).
- `js/main.js` no tiene ninguna lógica de reproducción ni reacciona al scroll para el video.
- Único código que inicia el video: script en línea de `index.html` → en `DOMContentLoaded` llama `play()`; **solo si la promesa se rechaza** registra `touchstart`/`click` en `window` que vuelven a llamar `play()`. En iPhone, un scroll empieza con `touchstart`.
- Conclusión verificada: el síntoma coincide exactamente con la rama de **rechazo del primer `play()`**. Reproducido en Chromium simulando el rechazo (NotAllowedError o AbortError): video quieto en 0 s hasta el primer toque; sin rechazo, reproduce desde la carga. El `catch` descarta el motivo del error.

**Causa raíz no confirmada:** falta saber *por qué* WebKit rechaza ese `play()`. Hipótesis: (1) Modo de bajo consumo de iOS (bloquea toda reproducción automática; `NotAllowedError`); (2) política de WebKit de reproducción automática solo para videos que considera visibles (el video usa `z-index: -1`); (3) otra política de WebKit. No hay WebKit/Safari en el entorno ni acceso a webkit.org: no se aplicó ninguna corrección especulativa.

**Cambio:** `js/diag-video.js` (cargado en `<head>` de `index.html`), **inactivo salvo con `?diagvideo`** en la URL. Muestra un panel con el resultado y motivo de cada `play()`, eventos del video, estado (`readyState`, `muted`, `autoplay`, `playsInline`, tamaño, visibilidad) y gestos. Probado en Chromium: sin el parámetro no aparece ni cambia nada (regresión 61/61); con rechazo simulado registra el motivo.

**Pendiente:** abrir `index.html?diagvideo` en el iPhone afectado, sin tocar la pantalla durante 4 s, y enviar captura del panel (también con Modo de bajo consumo desactivado). Con ese dato se aplica la corrección y se elimina la herramienta.

**Commit:** `99262c5`.

---

## 2026-10-31 — Prioridad media · Etapa 0: cierre del diagnóstico del video

**Conclusión (pruebas reales del equipo en iPhone, Safari y Chrome):** el video de portada se reproduce automáticamente con el **Modo de bajo consumo desactivado**. Con el modo activado, iOS bloquea la reproducción automática (incluso de videos silenciados) y el primer `play()` se rechaza; el script existente de `index.html` lo inicia con el primer toque (por eso arrancaba al hacer scroll). Es una restricción del sistema, no un defecto del sitio.

**Cambios:** eliminado `js/diag-video.js` y su `<script>` en `index.html` (sin otras dependencias). `index.html` queda idéntico al estado previo al diagnóstico (`ba368ac`). Sin `poster` ni mecanismos para forzar la reproducción, según lo indicado.

**Pruebas (Chromium):** video reproduce (`readyState` 4, tiempo avanzando, sin error); regresión 61/61.

---

## 2026-10-31 — Prioridad media · Etapa 1: cámara en Safari iOS

**Método:** Chromium no reproduce las barras dinámicas de Safari. Se emuló maquetando con el alto grande (en Safari, `vh` = barras ocultas) y midiendo qué queda fuera del alto chico visible al cargar. Valores aproximados: iPhone 13 745/664, iPhone SE 627/548, iPhone 15 Pro Max 832/740.

**Problemas encontrados (antes):**
- Botón de pantalla completa fuera del área visible al cargar en iPhone 13, SE y 15 Pro Max.
- iPhone SE: la caja empieza en y=37 y el botón de cambiar cámara queda tapado por el header fijo (76px).
- Pantalla completa (`100vh`): 79–92px del video quedan bajo la barra de Safari.
- Causa: `#camera-section` con `80vh` + `margin-top: 10vh` + `padding: 20px` no considera el header ni la diferencia entre alto grande y visible; la caja 9:16 se dimensiona solo por ancho.

**Cambios (`css/styles.css`, sin tocar `js/realitytour.js`):**
- `#camera-section`: `box-sizing: border-box`, `height: 100svh` (respaldo `100vh`), `padding: 86px 20px 20px` (header + aire); se quita `margin-top: 10vh`.
- `.camera-container`: `width: min(100%, 400px, calc((100svh - 110px) * 9 / 16))` (respaldo con `vh`): el ancho se limita también por el alto disponible; `aspect-ratio: 9/16` se conserva.
- `.camera-container.fullscreen-mode`: `height: 100dvh` tras el respaldo `100vh`.

**Resultado (emulado con `svh`):** en los cuatro casos ambos botones visibles y sin quedar bajo el header; relación 1,766–1,771 (9:16 + borde); pantalla completa sin partes ocultas. **Compromiso visual:** la caja es más chica en teléfonos para entrar completa (iPhone 13: 350→316px de ancho; SE: 335→250; 15 Pro Max: 390→358; escritorio: 404→392).

**Pruebas:** regresión 61/61 (cámara con dispositivo simulado, pantalla completa, menú, navegación, carruseles) y pruebas iOS 17/17. **Sin prueba en Safari real:** verificar en iPhone que la caja y ambos botones se vean al cargar, con barras visibles y ocultas, y que la pantalla completa ocupe todo el alto visible.

**Pendiente:** en Safari < 15.4 (sin `svh`/`dvh`) rige el respaldo `vh` (comportamiento similar al anterior, sin recorte bajo el header).

---

## 2026-10-31 — Prioridad media · Etapa 2: Swiper con versión fija

**Problema:** `index.html` cargaba Swiper desde jsDelivr con versión flotante (`swiper@11`, CSS y JS): una nueva 11.x se aplicaría sin aviso.

**Verificación:** según el registro npm, la última 11.x es **11.2.10** (2025-06-28); después solo hay 12.x–14.x, que `@11` no toma. Por lo tanto `@11` resuelve hoy a 11.2.10, la misma versión usada en todas las pruebas: fijarla no cambia lo que funciona.

**Referencias:** solo `index.html` (CSS en `<head>` y JS). Uso: `new Swiper(".ra-swiper")` en `js/main.js` (carrusel «¿Qué es la RA?»). El slider «Nuestro Servicio» **no usa Swiper** (intervalo propio en `main.js`).

**Cambio (`index.html`):** `swiper@11` → `swiper@11.2.10` en las dos URLs. Sin cambios de configuración, diseño ni animaciones.

**Pruebas (Chromium; Swiper 11.2.10 de npm servido solo en la URL exacta):** la página pide exactamente las dos URLs fijadas; `Swiper` disponible, efecto `coverflow`, 5 diapositivas, CSS de Swiper aplicado (`overflow: hidden`); carrusel avanzando y slider de Servicio avanzando a 320/390/1366 px; regresión 61/61. El CDN real está bloqueado en el entorno: verificar en el sitio publicado.

**Opcional (no aplicado):** agregar `integrity` (SRI) a ambos recursos.

---

## 2026-10-31 — Prioridad media · Etapa 3: auditoría de CSS y animaciones

**Hallazgos (inventario automático de `styles.css` + verificación en las tres páginas):**
- **Duplicados:** 25 selectores definidos 2–3 veces en el mismo contexto; el resultado depende del orden. Contradicciones relevantes: `.ra-text` (5 propiedades pisadas), `.ra-swiper` (`overflow: hidden` → `visible`, `max-width` 800 → 1600), `.ra-swiper img` (alto 300px → 100%), flechas de Swiper (color y escala), `.overlay` (opacidad 0,5 → 0,4), `.ra-section` (padding), `.contact-section`/`.bio`/`.nav-links li a` en móvil.
- **Sin uso (ningún elemento en ninguna página, incluso con menú abierto y pantalla completa):** `.description`, `.image-slider`, `.ra-content`, `.service-image(:hover)`, `.slider-image(.active)`, `.swiper-pagination-bullet(-active)`, `.contact-section.hidden`, `#exit-fullscreen-btn.hidden`, y `header.scrolled` (ahora usado, ver cambios).
- **`!important` (11):** casi todos parchean la animación `.hidden`: `.bio.hidden` (móvil), `#contact .hidden` (transform/margin/padding), `.contact-section.hidden` y `#exit-fullscreen-btn.hidden` (estos dos no aplican a nada). Otros: `.main-section { background: none }`, `.contact-link` (color/decoración).
- **`overflow: hidden`:** legítimos en carrusel, slider, cámara, botón CTA, hero y bloqueo del menú. **`#contact { overflow: hidden }`** oculta desbordes en vez de evitarlos (ya ocultaba el recorte del segundo contacto corregido el 30/10); se agregó por el «scroll fantasma» que produce `translateY(150px)` de `.hidden` al final de la página.
- **Carrusel RA:** las reglas CSS de `transform`/`scale` en `.swiper-slide`, `-active`, `-next`, `-prev` son pisadas por los estilos en línea del efecto coverflow de Swiper (no tienen efecto visual sobre la transformación).
- **Encabezado (`main.js`):** ocultaba y cambiaba el fondo con estilos en línea (`style.transform`, `style.backgroundColor`) en cada evento de scroll; `header.scrolled` existía sin uso; el `transform` en línea quedaba siempre aplicado (aun `translateY(0)`); con el header oculto, un enlace enfocado con teclado quedaba fuera de vista.
- **`.hidden` / `.visible`:** revelado único por `IntersectionObserver` (umbral 0) con 1,2 s de opacidad + desplazamiento 150px + escala. Hay `.hidden` anidados (contenedor e hijos), lo que suma desplazamientos. Sin JS o sin `IntersectionObserver`, el contenido quedaría invisible.
- **`prefers-reduced-motion`:** `index.html` no lo respetaba (revelados de 1,2 s y scroll suave); `larioja.html` sí. El autoplay del carrusel (coverflow) y el fundido del slider de Servicio siguen activos con movimiento reducido (es configuración JS).

**Cambios (pequeños, sin cambio visual con la configuración por defecto):**
- `js/main.js`: el header usa clases — `header-oculto` al bajar y `scrolled` (regla existente) para el fondo — en lugar de estilos en línea.
- `css/styles.css`: `header.header-oculto:not(:focus-within) { transform: translateY(-100%) }` (mismo desplazamiento y transición; visible si un enlace interno tiene el foco del teclado).
- `css/styles.css`: `@media (prefers-reduced-motion: reduce)` → `.hidden` visible sin transformación ni transición y `scroll-behavior: auto`.

**Pruebas (Chromium):** nuevas 29/29 (header: visible y transparente al cargar, se oculta al bajar, reaparece oscuro al subir, transparente arriba, sin estilos en línea, foco de teclado; movimiento reducido en index y larioja). Regresión 61/61, iOS 17/17, cámara (4 dispositivos) OK.

**Requiere aprobación (no aplicado):**
- (Media) Consolidar los 25 selectores duplicados conservando el valor efectivo (sin cambio visual, pero toca muchas reglas).
- (Media) Rediseñar el revelado `.hidden` para no depender de `translateY` en el final de página y eliminar los `!important` de `#contact`/`.bio` y `#contact { overflow: hidden }`.
- (Media) Con movimiento reducido, pausar el autoplay del carrusel RA y del slider de Servicio (cambia comportamiento JS).
- (Baja) Eliminar los selectores sin uso listados.
- (Baja) Renombrar `.hidden` (p. ej. `.reveal`) para evitar confusión con «oculto».

---

## 2026-10-31 — Prioridad media · Etapa 4: revisión de contenido visual (sin cambios)

**Imagen:** `assets/img/imggob.png` (1024×1024), subida el 2025-10-19 (`ab70537`, «Add files via upload») y referenciada desde ese día (`80ef26a`). Desde el 30/10 se sirve optimizada como `assets/img/web/imggob-carrusel.jpg` (`index.html`, primera diapositiva del carrusel «¿Qué es la RA?», `alt="Imagen 1"`). No se usa en otras páginas.

**Por qué parece contenido de prueba:**
- Es un gráfico gris con dos reglas graduadas cruzadas (números 0–1000 y 40–400, con secuencias no ordenadas: 120, 230, 900, 400…), sin fotografía ni elementos de RealityTour.
- Las otras diapositivas son fotos o maquetas de RA (225.000–257.000 colores); esta tiene 9.239 colores (fondo casi plano).
- Su nombre coincide con `imggob.jpg` (Casa de Gobierno con interfaz de RA, usada en el slider de Servicio): probablemente se esperaba una versión cuadrada de esa imagen y se subió por error una lámina de guías o reglas de un editor.

**Impacto:** con `realIndex` 0 y `centeredSlides`, es la **diapositiva central y destacada** al llegar a la sección (verificado en escritorio 1366 px y en iPhone 13): lo primero que se ve del carrusel no comunica qué es la RA.

**Acción:** ninguna (no se reemplaza ni elimina sin aprobación). Opciones para decidir: reemplazarla por la imagen correcta del equipo, o quitar la diapositiva (quedan 4).

**Nuevo hallazgo (Media, requiere aprobación):** las flechas del carrusel se ven **azules** (`rgb(0, 122, 255)`, color por defecto de Swiper) en lugar del turquesa de la marca (`#24b1ba`). Causa: `styles.css` se carga antes que `swiper-bundle.min.css` y, a igual especificidad, Swiper gana. Por la misma razón no rigen `.ra-swiper { overflow: visible }` ni otras reglas de Swiper en `styles.css`. Solución propuesta: definir `--swiper-navigation-color: #24b1ba` en `.ra-swiper` (variable prevista por Swiper). Cambia un color visible, por eso no se aplicó.

---

## 2026-10-31 — Confirmaciones del equipo

- **Cámara validada en iPhone real con Safari:** controles, visualización y pantalla completa funcionan correctamente (cambios del 31/10, etapa 1 de prioridad media).
- **Primera diapositiva del carrusel «¿Qué es la RA?»:** es una imagen de prueba colocada intencionalmente. Se conserva sin cambios.
- **Video de portada:** restricción de iOS con Modo de bajo consumo; no requiere cambios.

---

## 2026-10-31 — Mantenimiento · Etapa 1: consolidación de CSS duplicado

**Método de verificación (nuevo):** comparador de estilos computados entre el commit anterior (servido aparte) y la copia de trabajo: **todas** las propiedades CSS de **todos** los elementos (incluidos `::before`/`::after`), en las 3 páginas × 10 anchos (320, 390, 768, 769, 960, 961, 1024, 1025, 1366, 1920: ambos lados de cada media query), en los estados carga, todo revelado, header oculto con fondo, menú móvil abierto, pantalla completa de la cámara y `:hover`/`:active`/`:focus-visible`/`:focus-within` forzados (390, 769, 1366 px); más 69 capturas comparadas por píxel. Movimiento automático congelado solo en la prueba. Determinismo: dos corridas sobre el mismo código → 0 diferencias. Sensibilidad: un error intencional (dejar `.overlay` en 0,5) se detecta en estilos y píxeles.

**Consolidado (se conserva el valor efectivo en la posición de la última regla):** `.main-section`, `.overlay`, `.cta-button` (segunda definición era un subconjunto), bloques `@media (max-width: 768px)` de Contacto (dos consecutivos → uno), menú móvil (`.nav-links li`, `li a`, `li a:hover`, dos juegos dentro del mismo `@media`), carrusel RA (`.ra-swiper`, `.swiper-slide`, `-active`, `-next/-prev`, `img`, flechas y su `:hover`: dos versiones completas → una).

**Eliminado por estar completamente anulado:** primera `.ra-text`; primera `.bio`; `.ra-section` dentro del grupo de secciones; `.menu-toggle` dentro del grupo con `.logo` (móvil); en móvil, `.main-section` (alto pisado; `margin-top: 0` = valor inicial), `.bio` y `.bio-container`.

**No consolidado (no es seguro / cumple otra función):**
- Grupo `.biography-section, .services-section` (padding + text-align) y sus reglas propias: aportan propiedades distintas.
- Carrusel en móvil: `.ra-swiper img { height: 240px }` y `.ra-swiper .swiper-slide { width: 90%; height: 380px; filter: none; opacity: 1; transform: scale(1) }`. **Hoy no tienen efecto** (las reglas generales posteriores, de igual especificidad, las anulan: en móvil las diapositivas laterales siguen con desenfoque). Se conservan, antes de las generales y con un comentario, porque recuperarlas cambiaría la apariencia.

**Resultado:** `styles.css` 1135 → 987 líneas; de 25 selectores duplicados quedan los 2 intencionales. **Comparador: 220 estados, 0 diferencias; 69 capturas, 0 píxeles distintos.** Regresión funcional 61/61.

**Nuevo hallazgo (Baja):** el diseño móvil previsto del carrusel (sin desenfoque, diapositiva al 90 %) nunca se aplicó por el orden de las reglas. Decidir si recuperarlo (cambio visual).

---

## 2026-10-31 — Mantenimiento · Etapa 2: animaciones `.hidden` y visibilidad del contenido

**Diagnóstico:**
- `.hidden` (opacidad 0 + `translateY(150px)` + escala) se aplicaba por CSS siempre; solo `main.js` (`IntersectionObserver`) agregaba `.visible`. **Sin JavaScript, si `main.js` no cargaba, si faltaba `IntersectionObserver` o si fallaba su inicialización, 16 bloques de index y 18 de larioja quedaban invisibles** (verificado en la versión anterior).
- Contacto es la última sección: un `translateY` positivo en sus elementos ocultos extiende el alto desplazable más allá del final (el «scroll fantasma» original). Se había compensado con `#contact .hidden { transform: none !important; … }`, `.contact-section.hidden { transform: none !important }` (no aplica a ningún elemento) y `#contact { overflow: hidden }`, que además ocultaba desbordes reales (el recorte del segundo contacto corregido el 30/10).
- `.bio.hidden { … !important }` (móvil) y `#exit-fullscreen-btn.hidden { display: none !important }` (no aplica: `realitytour.js` usa `style.display`): los `!important` no eran necesarios por especificidad.

**Cambios:**
- `index.html` y `larioja.html` (`<head>`): script en línea que agrega `js-reveal` a `<html>` solo si existe `IntersectionObserver`. En `load`, si `main.js` no marcó `reveal-ready`, quita `js-reveal` y todo queda visible (no hay temporizadores ni reintentos).
- `js/main.js`: agrega `reveal-ready` después de observar los elementos.
- `css/styles.css`: `.hidden`/`.visible` → `:where(.js-reveal) .hidden/.visible` (`:where()` no suma especificidad: cascada idéntica). `.bio.hidden` y `#contact .hidden` sin `!important` (ya ganan por especificidad; se conservan sus valores, p. ej. Contacto solo con fundido). Eliminados `.contact-section.hidden`, `#exit-fullscreen-btn.hidden` y `#contact { overflow: hidden }`.
- `css/larioja.css`: `.larioja-page .hidden` → `:where(.js-reveal) .larioja-page .hidden` (misma especificidad).

**Pruebas (Chromium):**
- Nuevas 13/13: con todo funcionando la animación sigue activa; sin JS, con `main.js` bloqueado, sin `IntersectionObserver` o con error al observar → 0 bloques invisibles (antes: 16–18). Contacto al final (320/390/1366): alto desplazable igual antes y después de revelarse, la sección termina exactamente en el borde de la pantalla, sin desbordes.
- Comparador de estilos (220 estados) + revalidación de pseudoclases con identificación corregida (144 estados): **única diferencia `#contact` overflow `hidden → visible`**, prevista; **0 píxeles distintos** en todas las capturas.
- Regresión 61/61; header 29/29.

**`!important` restantes (no relacionados con la animación, sin cambios):** `.main-section { background: none !important }` y `.contact-link` (color y subrayado). Pendiente evaluar si son necesarios.
