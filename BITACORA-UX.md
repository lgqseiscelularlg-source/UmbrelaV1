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

---

## 2026-10-31 — Accesibilidad · Etapa 3: movimiento reducido en carrusel y slider

**Diagnóstico:** con `prefers-reduced-motion: reduce`, el revelado `.hidden` ya se desactivaba (31/10), pero el carrusel RA (autoplay de Swiper cada 2,5 s, coverflow de 1,2 s) y el slider de Servicio (`setInterval` de 4 s con fundido) seguían avanzando solos (verificado en la versión anterior).

**Cambios (`js/main.js`, sin tocar la configuración de Swiper):**
- `matchMedia("(prefers-reduced-motion: reduce)")` compartido.
- Carrusel: `autoplay.stop()` si la preferencia está activa; `autoplay.start()` si no (comportamiento previo). Se reevalúa al cambiar la preferencia con la página abierta.
- Slider de Servicio: el intervalo solo se crea sin la preferencia; se detiene o reanuda si cambia.
- Navegación manual del carrusel (flechas y deslizamiento) sin cambios.

**Pruebas (Chromium, móvil y escritorio):** 11/11. Sin preferencia: carrusel y slider avanzan como antes. Con `reduce`: 5 s sin avance (autoplay detenido, una sola imagen visible en el slider); flechas y deslizamiento funcionan; al desactivar la preferencia se reanudan y al reactivarla se detienen. Contra la versión anterior las pruebas de `reduce` fallan. Regresión 61/61; header y movimiento reducido 29/29. Sin errores JS.

**Consideraciones:** con `reduce`, el slider de Servicio muestra solo la primera imagen (no tiene controles manuales). Las transiciones al navegar manualmente el carrusel (1,2 s) se mantienen por ser iniciadas por el usuario. Video de portada fuera de alcance.

---

## 2026-10-31 — Visual · Etapa 4: color de las flechas del carrusel (autorizado)

**Causa:** `swiper-bundle.min.css` se carga después de `styles.css` y define `.swiper-button-next, .swiper-button-prev { color: var(--swiper-navigation-color, var(--swiper-theme-color)) }`; a igual especificidad, reemplazaba el `color: #24b1ba` propio por el azul por defecto de Swiper (`#007aff`).

**Cambio (`css/styles.css`):** `--swiper-navigation-color: #24b1ba` en `.ra-swiper` (variable oficial de Swiper; la heredan las flechas). Sin otros cambios.

**Verificación (Chromium, 1366 px y iPhone 13):** color `rgb(0, 122, 255)` → `rgb(36, 177, 186)` en flechas e ícono (`::after`). Sin cambios en tamaño (44px), posición, `transition` (`transform 0.3s, color 0.3s`), `:hover` (blanco y escala 1,2) ni navegación. Comparador: las únicas diferencias son el color de las flechas (y propiedades derivadas de `currentColor`) y la variable heredada; 504 píxeles distintos, todos en las flechas. Imágenes y cantidad de diapositivas sin cambios. Regresión 61/61.

---

## 2026-10-31 — Mantenimiento · Etapa 5: limpieza de código y recursos

**Selectores eliminados (`css/styles.css`; sin elementos en ninguna página, incluidos estados dinámicos):** `.service-image(:hover)`, `.ra-content`, `.description`, `.image-slider`, `.slider-image(.active)` (y las versiones móviles de `.ra-content`/`.description`), `.swiper-pagination-bullet(-active)` (Swiper solo genera viñetas con la opción `pagination`, no configurada). Se descartaron falsos positivos: `.visible`, `header.scrolled`, `header.header-oculto` (los agrega `main.js` al desplazarse) y `::-webkit-scrollbar`. `styles.css`: 987 → 920 líneas.

**Textos alternativos:** `alt` genéricos («Imagen 1…5», «Imagen 1…4», «Logo») reemplazados por descripciones del contenido (simulaciones de RA sobre la Catedral, la Casa de Gobierno y un paseo peatonal; monumento con el cartel «La Rioja Argentina»; «RealityTour» en el logo). Las dos imágenes de prueba quedan descritas como «Imagen de prueba: reglas de medición».

**Dimensiones:** `width`/`height` con el tamaño real del archivo servido en las 15 imágenes de las tres páginas (reservan espacio antes de cargar). El comparador detectó que en el logo (CSS solo fija `height: 50px`) el atributo `width` lo estiraba de 73 a 218px; se agregó `width: auto` a `.logo`. Resultado: única diferencia de estilos el `aspect-ratio` computado (igual a la proporción natural de cada archivo); **0 píxeles distintos** en 69 capturas.

**Pruebas:** comparador 220 estados; regresión 61/61; header 29/29; revelado 13/13; movimiento reducido 11/11; iOS 17/17.

**Nuevo hallazgo (para confirmar):** la cuarta imagen del slider «Nuestro Servicio» (`relgaCuadrada`) también es un gráfico de reglas, como la primera del carrusel RA. Por su nombre parece intencional; no se modificó.

**Archivos multimedia candidatos a eliminación (sin referencias en HTML, CSS ni JS; no se eliminaron):**

| Archivo | Tamaño | Alta | Motivo |
|---|---|---|---|
| assets/img/manopaseo.png | 4155 KB | 2025-10-16 | sin uso |
| assets/img/relgaCuadrada.png | 1432 KB | 2025-10-19 | original reemplazado por `web/relgaCuadrada.jpg` |
| assets/img/paseo.png | 1410 KB | 2025-10-16 | original reemplazado por `web/paseo.jpg` |
| assets/img/capturacorregido.png | 1384 KB | 2025-10-16 | original reemplazado por `web/capturacorregido.jpg` |
| assets/img/imggob.png | 1028 KB | 2025-10-19 | original reemplazado por `web/imggob-carrusel.jpg` |
| assets/img/Juan.jpg | 873 KB | 2025-10-16 | sin uso (la bio usa la versión IA) |
| assets/img/CatedralNoche.jpg | 832 KB | 2025-10-16 | sin uso (antes solo en un comentario CSS) |
| assets/img/CatedralSinIconos.jfif | 619 KB | 2025-10-16 | sin uso |
| assets/img/grafica1.jpg | 336 KB | 2025-10-16 | sin uso |
| assets/img/IAjuan.jpg | 286 KB | 2025-10-16 | original reemplazado por `web/IAjuan.jpg` |
| assets/img/CatedralNoche2.jpg | 284 KB | 2025-10-16 | sin uso |
| assets/img/IAale.jpg | 197 KB | 2025-10-16 | original reemplazado por `web/IAale.jpg` |
| assets/img/perfil-umbrella.jpeg | 143 KB | 2025-10-16 | sin uso |
| assets/img/logocolor.png | 102 KB | 2025-10-16 | original reemplazado por `web/logocolor.png` |
| assets/img/Ale.jpg | 53 KB | 2025-10-16 | sin uso (la bio usa la versión IA) |
| assets/img/menu.png | 0,2 KB | 2025-10-16 | sin uso (el menú usa barras CSS) |

Total: 16 archivos, 12,8 MB. Antes de eliminarlos, confirmar que ningún otro proyecto (p. ej. `Cloude`) ni enlace externo los use por URL. Siguen recuperables desde el historial de git.

---

## 2026-11-02 — Rediseño · Sección «¿Qué es la RA?» (propuesta 2 aprobada)

**Implementado (`index.html`, `css/styles.css`, `js/main.js`):**
- Encabezado con etiqueta «Realidad aumentada», título con «RA» en turquesa y texto original.
- Fondo con luz turquesa y retícula tenue (estáticos).
- Carrusel coverflow (Swiper 11.2.10: `rotate 24`, `depth 180`, sin sombras de Swiper): imagen central con borde luminoso y esquinas tipo visor; laterales atenuadas.
- Imágenes completas (`contain`); en los 2 marcos no cuadrados, relleno con la misma imagen desenfocada.
- Cápsula de controles sobre el borde inferior: anterior · 5 indicadores (el activo muestra el progreso) · pausa/reanudar · siguiente.
- Leyenda «0N / 05 · texto» debajo. **Ajuste B:** las leyendas se definen en `data-caption`, independientes de los `alt`, que no cambian.
- Se conservan las 5 imágenes (incluida la de prueba).

**Comportamiento (controlador compartido `initCarousel` en `main.js`, reutilizable por «Nuestro Servicio»):**
- Avance cada 6 s (`data-delay`).
- Pausa persistente: solo el usuario reanuda.
- Navegar a mano (flechas, indicadores, deslizar) reinicia el tiempo completo.
- Se detiene fuera de pantalla (`IntersectionObserver`), con el puntero encima, con foco de teclado (`:focus-visible`) o al usar el teclado dentro.
- Con `prefers-reduced-motion: reduce` empieza pausado, con velocidad 0; todas las imágenes quedan accesibles con los controles y el usuario puede activar el avance.
- Indicadores con `aria-label` («Ir a la imagen N») y `aria-current`; botones con etiquetas en español; módulo a11y de Swiper.

**Rendimiento (ajuste C):** sin `backdrop-filter` (cápsula con fondo casi opaco); laterales atenuadas con una capa de opacidad en lugar de filtros; brillo solo en la imagen activa, sin animar sombras; desenfoque solo en el relleno estático de 2 marcos; sin el desenfoque animado del carrusel anterior.

**Problemas encontrados y corregidos durante la implementación:**
- Un clic con el mouse dejaba el carrusel detenido (el foco del botón contaba como interacción): ahora solo cuenta el foco de teclado.
- Cápsula con `position: absolute; left: 50%` encogía los botones a 28px: `width: max-content` y `flex: none`.
- Un `<header>` usado como encabezado de sección heredaba `header { position: fixed; z-index: 1000 }`: se cambió por `<div>`.

**CSS eliminado:** bloque del carrusel anterior (coverflow con desenfoque, flechas `.swiper-button-*`, reglas móviles que no tenían efecto) y `.ra-text`.

**Pruebas (Chromium; Swiper servido localmente):**
- Carrusel RA 30/30: avance automático y progreso; tiempo completo tras navegar; pausa persistente (también al salir y volver); reanudar; indicadores y etiquetas; teclado (foco visible, Enter, Tab); puntero encima; fuera de pantalla; movimiento reducido (5/5 imágenes accesibles); deslizar en móvil; sin desborde y controles ≥ 44px de alto, dentro de pantalla y sin superposición a 320/390/768/1366; leyendas = `data-caption` ≠ `alt`; sin errores JS.
- Resto del sitio sin cambios: estilos computados de todos los elementos fuera de `#ra` y capturas de header, Inicio, Servicio, Quiénes somos, Contacto, `realitytour.html` y `larioja.html` a 5 anchos → 0 diferencias de estilo y 0 píxeles distintos. Para comparar por píxel se fijó el mismo alto de `#ra` en ambas versiones: sin eso, la diferencia de alto desplaza las secciones siguientes fracciones de píxel y cambia el suavizado.
- Regresión 64/64 (actualizada: el carrusel avanza en pantalla cada 6 s); header 29/29; revelado 13/13; iOS 17/17.

**Limitaciones:** sin WebKit/Safari en el entorno. Verificar en iPhone la fluidez del coverflow, el deslizamiento táctil y la pausa al salir de pantalla.

---

## 2026-11-02 — Rediseño · Sección «Nuestro Servicio» (propuesta 2 aprobada)

**Implementado (`index.html`, `css/styles.css`, `js/main.js`):**
- Escenario en capas: showcase protagonista con proporción exacta de las 4 imágenes (`--svc-ratio`, sin recorte) y fundido (Swiper `fade`, 800 ms).
- Panel superpuesto al borde derecho con etiqueta, título «Nuestro **Servicio»** (corrige «Nuestro Servicios») y tres puntos numerados 01–03: «Tecnología y turismo», «Realidad aumentada», «Historias vivas». Los párrafos se conservan textuales.
- Controles con el mismo controlador `initCarousel` que la sección RA: avance cada 5 s, pausa persistente, reinicio del tiempo al navegar, pausa fuera de pantalla, con puntero o foco de teclado, y movimiento reducido.
- Escritorio: miniaturas (indicadores con progreso) y cápsula ‹ ❚❚ › sobre la imagen.
- Tableta/móvil (≤ 900px): imagen de borde a borde; cápsula ‹ segmentos ❚❚ › montada sobre el borde inferior; panel debajo.
- Preparado para contenido definitivo: reemplazar cada `<img>` (y `--svc-ratio` si cambia la proporción).

**Ajustes pedidos:**
- **A (móvil):** separación entre puntos 16 → 12px, texto 0,95rem / interlineado 1,55. El panel **ya no se superpone a la imagen**: empieza debajo y la cápsula queda mitad sobre la imagen, mitad sobre el panel (cambio respecto de la maqueta, donde el panel tapaba 32px). Cobertura medida de la imagen: panel 0 % y controles 7,2 % a 390px (10,7 % a 320px; 1,9 % a 768px); en escritorio el panel cubre el 11,2 % del borde derecho, como en la propuesta.
- **C (rendimiento):** sin `backdrop-filter`, panel y cápsula con fondo casi opaco; sin zoom en el fundido; sombras y degradado estáticos.

**Problema encontrado y corregido:** en ≤ 900px el panel (`z-index` 3) quedaba encima de la cápsula; el carrusel pasa por encima del panel en ese rango.

**CSS eliminado:** `.services-content`, `.service-slider` (+ escritorio), `.service-description`, `.elegant-text` (+ `:hover` y móvil), `.services-section .overlay` y `.services-section` del grupo de secciones. **JS eliminado:** el `setInterval` del slider anterior.

**Pruebas (Chromium; Swiper servido localmente):**
- Showcase 27/27: avance cada 5 s y progreso; tiempo completo tras navegar; pausa persistente; reanudar; miniaturas y etiquetas; teclado; puntero; fuera de pantalla; movimiento reducido (4/4 imágenes accesibles); deslizar en móvil; sin desborde y controles ≥ 44px, dentro de pantalla y sin superposición a 320/390/768/1366; sin errores JS.
- Carrusel RA 30/30 (sin regresiones).
- Resto del sitio: 0 diferencias de estilo y 0 píxeles distintos fuera de `#ra` y `#services` (30 capturas, 5 anchos, 3 páginas).
- Regresión 64/64; header 29/29; revelado 13/13; iOS 17/17.
- `motion2.test.js` (slider anterior) queda reemplazado por las pruebas de movimiento reducido de ambos carruseles.

**Limitaciones:** sin WebKit/Safari en el entorno. Verificar en iPhone la fluidez del fundido y del coverflow, el deslizamiento táctil, la pausa al salir de pantalla, que la cápsula no se superponga al texto del panel y la legibilidad de los tres puntos.

---

## 2026-11-02 — Corrección · Carruseles detenidos en iPhone (prioridad alta)

**Síntoma (prueba real, iPhone, con y sin ahorro de batería):** «¿Qué es la RA?» y «Nuestro Servicio» no avanzan; los controles muestran pausa al cargar y al pulsar reproducir siguen quietos. En escritorio funcionan.

**Diagnóstico (código de `initCarousel`):** el avance requiere `!userPaused && onScreen && !interacting`.
- `interacting` se activaba con `mouseenter` y se desactivaba con `mouseleave` (también consultaba `:hover`). En pantallas táctiles el navegador emula `mouseenter` en cada toque y deja `:hover` activo; **iOS no envía `mouseleave` hasta tocar otro elemento**. Tras tocar reproducir, pausa, una flecha o la imagen, `interacting` quedaba en `true` y el avance no se reanudaba nunca.
- Reproducido en Chromium con emulación táctil: un toque sobre el carrusel generó `mouseenter` sin `mouseleave` y la versión anterior quedó con `autoplay=false`; Chromium envía `mouseleave` en la mayoría de los toques, así que no reproduce del todo el comportamiento persistente de iOS.
- **Pausa al cargar:** el único camino que inicia en pausa es `prefers-reduced-motion: reduce` (Ajustes → Accesibilidad → Movimiento → Reducir movimiento), independiente del ahorro de batería. Si está activada en el iPhone de prueba, el carrusel no avanza solo por diseño (aprobado).
- `IntersectionObserver` y los temporizadores de Swiper funcionan correctamente; no se encontró evidencia de una restricción de iOS.

**Corrección (`js/main.js`):** la pausa por puntero usa `pointerenter`/`pointerleave` y solo cuenta `pointerType === "mouse"`; los toques no la activan. Se elimina la consulta a `:hover`. La pausa por teclado (foco `:focus-visible` o teclas dentro) se mantiene en una variable separada.

**Pruebas (Chromium):** guion táctil (iPhone 13) — tras tocar pausa y reproducir, el carrusel vuelve a avanzar (antes: detenido); con `reduce`, empieza pausado (diseño). Carrusel RA 30/30 y Servicio 27/27, incluida la pausa con mouse encima en escritorio.

**Pendiente de verificar en iPhone real:** que ambos carruseles avancen solos y que sigan avanzando después de tocarlos. Confirmar si «Reducir movimiento» está activado en el equipo de prueba.

---

## 2026-11-02 — Visor ampliado (lightbox) compartido

**Implementado (`js/main.js`, `css/styles.css`):** un único componente `lightbox` (elemento nativo `<dialog>`, sin bibliotecas) que usan ambos carruseles mediante la opción `zoom` de `initCarousel` (`.ra-frame` en RA, `img` en Servicio). El `<dialog>` se crea la primera vez que se abre; las páginas sin carruseles no lo incluyen.
- Abre la imagen activa al tocarla o hacer clic. Con teclado: la imagen activa tiene `role="button"`, `tabindex="0"` (las demás `-1`) y abre con Enter o Espacio.
- Imagen centrada, con el mayor tamaño posible y su proporción original (`--ar`), sin recortes; fondo oscurecido y levemente desenfocado (`::backdrop`).
- X semitransparente de 44×44px, con el estilo de los botones de la cámara.
- Cierra con la X, tocando fuera de la imagen o con Escape.
- Bloquea el desplazamiento (`html.rt-lightbox-open`).
- Detiene el carrusel mientras está abierto; al cerrar vuelve a la misma imagen, devuelve el foco a ella y restaura el comportamiento: con toque o clic se reanuda (o sigue pausado si el usuario lo había pausado); si se abrió con teclado, sigue detenido mientras el foco esté dentro.
- iPhone: alto visible actual (`100dvh`) y márgenes con `env(safe-area-inset-*)`. Sin pinch-to-zoom.

**Decisiones:**
- Se abre con el `click` nativo y no con el evento `tap` de Swiper. Abrir en `tap` hacía que el click de compatibilidad del mismo toque cayera sobre el visor y lo cerrara (reproducido en emulación táctil).
- Deslizar no abre el visor: Swiper cancela el click tras un arrastre y además se verifica `swiper.allowClick`, necesario con movimiento reducido (velocidad 0, sin animación).

**Pruebas (Chromium, 320/390/768/1366, ambos carruseles): 89/89.**
- Apertura con toque o clic: scroll bloqueado, carrusel detenido y foco en la X.
- Imagen dentro de pantalla, con la proporción original (±1 %) y ocupando el máximo disponible; X de 44px, visible, accesible y sin tapar la imagen.
- Con el visor abierto no se desplaza la página ni avanza el carrusel.
- Cierre con la X: misma imagen, scroll restaurado, avance reanudado y foco devuelto.
- Cierre tocando fuera; tocar la imagen ampliada no cierra; Escape cierra; Enter abre.
- En móvil, deslizar cambia de imagen sin abrir el visor.
- Movimiento reducido: el carrusel sigue sin avance automático al cerrar.
- Carruseles: 30/30 y 27/27. Fuera de `#ra` y `#services`: 0 diferencias de estilo y 0 píxeles distintos.

**Limitaciones:** sin Safari real. Verificar en iPhone: apertura con un toque (sin cierre inmediato), X fuera de la barra de estado y de la isla dinámica, bloqueo del scroll y desenfoque del fondo.

---

## 2026-11-02 — «¿Qué es la RA?»: controles simplificados en móvil

**Cambio (`css/styles.css`):**
- Móvil (≤ 768px): se ocultan anterior, pausa/reproducir y siguiente. Quedan solo los 5 indicadores, sin cápsula, debajo de la imagen activa (24×44px de área táctil, el activo con progreso).
- Se navega deslizando o tocando un indicador; tocar la imagen central abre el visor ampliado.
- Escritorio (> 768px) sin cambios: controles completos y clic en la imagen para ampliarla.
- Coverflow, profundidad, esquinas de visor y demás estética sin cambios.

**Pruebas (Chromium):**
- Por ancho: 0 botones visibles y sin cápsula a 320/390/768; 3 botones a 769/1366; indicadores ≥ 44px de alto, accesibles y sin superposición.
- En móvil táctil, tocar un indicador lleva a esa imagen y el avance automático continúa.
- Carrusel RA 30/30; visor 89/89.
- Fuera de `#ra` (incluido «Nuestro Servicio»): 0 diferencias de estilo y 0 píxeles distintos. El comparador ahora ignora los `id` aleatorios que Swiper asigna al contenedor y congela ambos carruseles en el mismo estado.

---

## 2026-11-02 — «Nuestro Servicio»: sin controles de reproducción e imagen más grande

**Cambios (`index.html`, `css/styles.css`, `js/main.js`):**
- Se eliminan anterior, pausa/reproducir y siguiente en todos los tamaños. Quedan los indicadores: miniaturas en escritorio, segmentos sin cápsula sobre la imagen en móvil.
- Avance automático cada 5 s, que se detiene con el mouse encima, con foco de teclado, fuera de pantalla o con el visor abierto.
- Tocar o hacer clic en la imagen abre el visor.
- Escritorio ≥ 1200px: showcase en 9 de 12 columnas (`max-width` 1320px), unos 22 % más ancho (813 → 988px a 1366px). El panel ocupa las columnas 9–12 (texto de unos 360px). Por debajo de 1200px se mantiene la proporción anterior para no estrechar el panel.
- Móvil: el panel queda unido debajo de la imagen (sin la cápsula que montaba sobre el borde).
- `initCarousel`: el botón de pausa y las flechas pasan a ser opcionales.

**Pruebas (Chromium):**
- Botones visibles por ancho: Servicio 0 en 320/390/768/769/1366; RA 0 en móvil y 3 en escritorio.
- Indicadores ≥ 44px de alto y accesibles; en móvil táctil, tocar un indicador lleva a esa imagen y el avance continúa.
- Visor 89/89.
- Fuera de `#services`: 0 píxeles distintos. Las únicas diferencias de estilo son URL absolutas de `background-image` que incluyen el puerto de cada servidor de prueba (artefacto).
- `carrusel.test.js svc` queda obsoleto (usaba los botones eliminados): sus casos de pausa y flechas ya no aplican.

**Pendiente para la próxima sesión:**
1. **Prueba en iPhone real** (Safari y Chrome): que ambos carruseles avancen solos y sigan avanzando tras tocarlos (corrección `b7e5645`). Confirmar si «Reducir movimiento» está activado en el equipo: si lo está, no avanzan por diseño.
2. Verificar en iPhone el visor ampliado: apertura con un toque, posición de la X respecto de la isla dinámica y la barra de estado, bloqueo del scroll y desenfoque del fondo.
3. Actualizar `carrusel.test.js` para «Nuestro Servicio» (sin botones) y repetir la regresión general completa (`regresion`, `header`, `reveal`, `ios`); en esta sesión se ejecutaron el visor, controles y comparación visual, no la suite general completa tras este último cambio.
4. Accesibilidad: «Nuestro Servicio» ya no tiene un botón de pausa persistente (pedido del equipo); el avance se detiene con puntero, foco o movimiento reducido. Evaluar si es suficiente para el criterio WCAG 2.2.2.

---

## 2026-11-03 — Análisis: carrusel RA circular con 5 imágenes visibles (sin implementar; requiere decisión)

**Confirmaciones del equipo (iPhone y notebook):** visor ampliado correcto; imagen ampliada de «Nuestro Servicio» aprobada; con «Reducir movimiento» desactivado el autoplay funciona en iPhone.

**Medición del carrusel actual (Chromium, 5 posiciones centrales, en reposo y a mitad de transición):**
- 1366px: en reposo 2 imágenes a la izquierda y solo 1 a la derecha; a mitad de transición 3 y 1.
- 390px: 1 por lado en reposo y **0 a la derecha** a mitad de cada transición (el «desaparecen progresivamente» reportado).

**Causas:**
1. Con 5 imágenes, mostrar 2 + central + 2 ocupa todas. Para desplazarse una posición, una imagen debe salir por un borde mientras otra entra por el opuesto: hacen falta 6 a la vez.
2. El modo `loop` de Swiper 11 no duplica: al iniciar cada transición mueve la imagen de un extremo al otro (`loopFix`), y ese salto es la desaparición instantánea de un lado.
3. El ancho actual de las diapositivas (460px / 82vw) no deja lugar para 2 por lado.

**Alternativas de Swiper descartadas:** clonar diapositivas por script (contenido duplicado, excluido por el equipo); `loopAddBlankSlides` (huecos visibles); otros efectos (misma pista lineal).

**Opciones propuestas:**
- **A (recomendada) — anillo 3D propio para el carrusel RA, sin Swiper en esa sección:** cada imagen se ubica según su distancia circular a la activa (−2…+2: posición, giro, escala, profundidad). La que pasa de un extremo al otro viaja por detrás, desvaneciéndose, sin huecos ni saltos y sin duplicar contenido. Se mantiene el aspecto del coverflow, las esquinas de visor, los indicadores, los controles de escritorio, el deslizamiento táctil y el visor ampliado. Costo: unas 120–150 líneas de JS propio, reutilizando el comportamiento de `initCarousel` (temporizador, pausa, visibilidad); Swiper sigue en «Nuestro Servicio».
- **B — Swiper con clones generados por script** (marcados `aria-hidden`): menos código, pero duplica contenido en el DOM.
- **C — mantener Swiper:** ajustar el ancho para ver 2 por lado en reposo, aceptando que en cada avance la imagen del extremo salte de lado.

**Movimiento reducido y WCAG 2.2.2 (análisis para la prioridad 2):**
- WCAG 2.2.2 (nivel A) exige que el contenido que se mueve solo más de 5 s pueda pausarse o detenerse. Hoy cumple solo el RA en escritorio (botón). RA en móvil y «Nuestro Servicio» se detienen con puntero o foco, pero no tienen un control persistente: esto es un riesgo **independiente** de «Reducir movimiento».
- `prefers-reduced-motion` no es un requisito de WCAG A/AA. Avanzar automáticamente con la preferencia activa es aceptable si se elimina el movimiento (cambio instantáneo o fundido breve, sin desplazamiento 3D) y existe una forma de pausar.
- **Propuesta:** con «Reducir movimiento», autoplay activo (6 s / 5 s) con cambio sin animación de desplazamiento; agregar en ambos carruseles y en móvil un botón de pausa discreto (ícono pequeño junto a los indicadores, área táctil de 44px), sin cápsula ni apariencia de reproductor.

---

## 2026-11-03 — Carrusel RA circular: 6 imágenes y 5 posiciones visibles

**Prueba de concepto (fuera del repo, Swiper 11.2.10, sexta diapositiva temporal):**
- Coverflow con `slidesPerView: "auto"`: en móvil solo entra 1 imagen por lado.
- Comprimir con `stretch`: la ±2 queda oculta detrás de la ±1 y la ±3 se ve en el borde, junto con su salto de lado.
- `loopAdditionalSlides`: Swiper avisa «not enough slides» y desbalancea el bucle.
- **Configuración que cumple:** efecto `creative` con `limitProgress: 2` (reproduce el coverflow: giro 24° y profundidad; las imágenes más allá de ±2 quedan apiladas detrás de la ±2, por lo que la sexta cambia de lado sin verse) + `slidesPerView: 3` (el bucle mantiene ≥ 2 diapositivas a cada lado).
- Con `slidesPerView: 3` la imagen central mide 1/3 del contenedor (124px a 390px); en móvil el contenedor de Swiper pasa a 190 % del ancho (la sección ya recorta el exceso) y la central queda en ~63vw.

**Implementado (`index.html`, `css/styles.css`, `js/main.js`, `assets/img/web/dique-los-sauces.jpg`):**
- Sexta diapositiva con `alt` propio y leyenda independiente («Dique Los Sauces, Sanagasta · Foto: Necman etcetera (CC BY-SA 4.0)»). Indicadores y contador pasan a 6 automáticamente.
- Configuración anterior aplicada; paso lateral 34 % en ≤ 768px y 62 % en escritorio. Se eliminan los anchos fijos de diapositiva (460px / 82vw) que Swiper ya no usa.
- Sin clones ni duplicados; las 5 imágenes previas se conservan.

**Imagen agregada:** «Dique Los Sauces en Sanagasta» — autor **Necman etcetera** — licencia **CC BY-SA 4.0** — https://commons.wikimedia.org/wiki/File:Dique_Los_Sauces_en_Sanagasta.jpg. Descargada de upload.wikimedia.org (1920×1440) y redimensionada a 1200×900, JPEG q80, 255 KB. La versión redimensionada se distribuye bajo la misma licencia. Atribución visible en la leyenda y comentario en el HTML. Se descartó «Ciudad de La Rioja.JPG» (dominio público) por ser una calle con lluvia, poco representativa.

**Pruebas (Chromium, sitio real con 6 imágenes):**
- 320/390/768/1366: en las 6 posiciones centrales, 2 + 1 + 2 en reposo con el orden correcto (centro 1 → izq. 5, 6 / der. 2, 3, …), ≥ 2 por lado durante toda la transición (incluida 6 → 1), sin desborde y sin avisos de Swiper.
- Carrusel RA 30/30 (leyenda «0N / 06»); visor 89/89; controles 17/17.
- Fuera de `#ra`: 0 diferencias de estilo y 0 píxeles distintos.
- Las pruebas de deslizamiento se ajustaron para arrastrar dentro de la pantalla: el contenedor de Swiper ahora es más ancho que ella.

---

## 2026-11-03 — Autoplay con «Reducir movimiento» y pausa discreta

**Decisión del equipo:** ambos carruseles avanzan solos (RA cada 6 s, Servicio cada 5 s) también con `prefers-reduced-motion: reduce`.

**Cambios:**
- `js/main.js`: con movimiento reducido, el carrusel ya no empieza pausado. Solo se elimina la animación (`speed` 0): las imágenes cambian sin desplazamiento ni movimiento 3D. La preferencia se reevalúa si cambia con la página abierta (solo la velocidad).
- `index.html` y `css/styles.css`: botón de pausa/reanudar persistente y discreto en RA móvil (antes oculto) y en «Nuestro Servicio» (nuevo). Ícono turquesa de 14px sin cápsula, área táctil de 44 × 44px, etiqueta «Pausar/Reanudar avance automático». RA en escritorio sin cambios.
- Se mantienen: navegación manual, pausa temporal con el visor abierto, con mouse encima o foco de teclado, y fuera de pantalla.

**WCAG 2.2.2 y movimiento reducido:**
- 2.2.2 (nivel A) exige poder pausar contenido que se mueve solo más de 5 s: ahora ambos carruseles tienen un control persistente en todos los tamaños.
- `prefers-reduced-motion` no es requisito A/AA. Con la preferencia activa no hay animación de desplazamiento ni 3D (cambio instantáneo), lo que reduce el impacto en personas sensibles al movimiento; el cambio periódico de imagen sigue ocurriendo por decisión de producto y puede detenerse con el botón.
- Alternativa si se quisiera ser más conservador: con la preferencia activa, intervalos más largos (p. ej. 10 s) o empezar en pausa.

**Pruebas (Chromium; no es Safari):**
- Carrusel RA 30/30: con `reduce` avanza solo con velocidad 0 y el usuario puede pausar.
- Controles 23/23: 1 botón visible (pausa) en RA ≤ 768px y en Servicio, 3 en RA escritorio. En móvil táctil, tocar la pausa detiene el avance (≥ 7 s sin cambios) y volver a tocarla lo reanuda; botón de 44 × 44px.
- Visor 89/89: con `reduce` se detiene abierto y sigue al cerrar.
- Regresión general 64/64, header 29/29, revelado 13/13, iOS 17/17. Fuera de ambos carruseles: 0 diferencias de estilo y de píxeles.

**Pendiente en iPhone real:** con «Reducir movimiento» activado, verificar que ambos carruseles avanzan sin animación y que la pausa discreta se puede tocar con comodidad; verificar el bucle de 6 imágenes y que las cinco posiciones se perciban.

---

## 2026-11-03 — Corrección · Autoplay detenido tras el primer avance (iPhone, ambos carruseles)

**Síntoma (iPhone real, Safari y Chrome):** la primera imagen muestra la barra de progreso, avanza a la segunda y ahí queda: la barra no vuelve a empezar y no hay más avances automáticos. La navegación manual funciona. En «¿Qué es la RA?» el primer cambio se ve brusco.

**Causa (confirmada en el código de Swiper 11.2.10 y reproducida):**
- En cada cambio de imagen, el autoplay de Swiper se pausa (`beforeTransitionStart` → `pause(true, true)`) y, con `waitForTransition: true` (valor por defecto), solo se reanuda al recibir un evento `transitionend` en el contenedor (`swiper-wrapper`).
- Los efectos `fade` («Nuestro Servicio») y `creative` (RA) no mueven el contenedor (`virtualTranslate`): Swiper fabrica ese `transitionend` cuando termina la animación de la diapositiva, **pero solo si la duración es distinta de 0** (`effectVirtualTransitionEnd`, condición `duration !== 0`).
- Desde el cambio «Autoplay también con movimiento reducido» (`998d0d5`), con «Reducir movimiento» la velocidad es 0. El evento nunca llega y el autoplay queda en `running = true, paused = true` para siempre. Como `running` sigue en `true`, `sync()` de `initCarousel` no lo reinicia; la barra queda en 0 porque el tiempo restante se congela.
- El mismo bloqueo ocurre al navegar a mano con velocidad 0 (cualquier cambio de imagen deja el autoplay esperando).
- **Conclusión:** el iPhone de prueba tiene activado «Reducir movimiento». Por eso también el cambio es instantáneo («brusco»): es el comportamiento previsto con la preferencia (velocidad 0, sin desplazamiento), no un problema de fluidez del efecto. Sin la preferencia, el equipo ya había confirmado que el autoplay funcionaba en iPhone.

**Reproducción (Chromium, emulación iPhone 13 táctil, `reducedMotion: reduce`, instrumentación temporal solo en el navegador de prueba, sin cambios en el sitio):**
- Versión anterior: RA avanza a los 6,1 s y Servicio a los 5,1 s; luego 0 avances. Registro: `slideChange → autoplayPause → beforeTransitionStart → transitionStart → transitionEnd → autoplay` y nunca `autoplayResume`. Estado final `running=true, paused=true`, `--rt-progress: 0`. Mismo comportamiento en ambos carruseles y sin errores JS: coincide con lo observado en el iPhone.
- Versión anterior sin la preferencia: avanza normalmente.

**Corrección mínima (`js/main.js`, `initCarousel`):** `autoplay.waitForTransition` = `!reducedMotion.matches`, y se actualiza junto con la velocidad si la preferencia cambia con la página abierta. Sin animación no hay nada que esperar; con animación el comportamiento es exactamente el anterior. Sin temporizadores paralelos, reinicios forzados ni cambios de estilos o de efecto.

**Pruebas (Chromium; no es Safari):**
- Avances consecutivos con `reduce`: RA 5 (cada 6,0–6,1 s), Servicio 6 (cada 5,0–5,1 s). Sin la preferencia: RA 5 (cada ~6,9 s: 6 s + 0,9 s de animación, igual que antes), Servicio 6.
- Escenarios en emulación táctil, con y sin `reduce`, ambos carruseles: avance tras tocar un indicador, tras deslizar, tras abrir y cerrar el visor (detenido mientras está abierto), pausa y reanudación con el botón accesible, detenido fuera de pantalla y avance al volver, barra de progreso activa, y cambio de la preferencia en vivo: **22/22 con `reduce` y 22/22 sin la preferencia**. Versión anterior: 9/22 con `reduce` (falla todo avance posterior al primero) y 21/22 sin la preferencia (falla al activar `reduce` en vivo: 1 avance y se detiene).
- Escritorio 1366px con `reduce`: flecha siguiente y luego 2 avances; mouse encima detiene; al salir reanuda.
- Regresión: `index.html`, `larioja.html` y `realitytour.html` a 390 y 1366px, con y sin `reduce`: 0 errores JS; menú móvil abre y cierra. No se modificaron HTML ni CSS.
- Nota de método: un primer guion de deslizamiento usaba `page.mouse.move`, que genera un `pointerenter` de mouse sin salida y activa (a propósito) la pausa por mouse encima. Era un artefacto de la prueba; con un deslizamiento solo táctil el avance continúa.

**Transición brusca de RA:** no se modificó. Con «Reducir movimiento» el cambio instantáneo es lo esperado. Para evaluar la fluidez real del efecto hay que probar en el iPhone con la preferencia desactivada.

**Pendiente en iPhone real:**
1. Con «Reducir movimiento» activado (Ajustes → Accesibilidad → Movimiento): ambos carruseles deben avanzar varias veces seguidas y la barra debe reiniciarse en cada imagen.
2. Con la preferencia desactivada: lo mismo, y evaluar si la transición de RA sigue viéndose brusca.

---

## 2026-11-03 — Rediseño del movimiento de «¿Qué es la RA?» y composición móvil de «Nuestro Servicio»

**Se conserva** la corrección `autoplay.waitForTransition = !reducedMotion` (`cadf5ac`). Intervalos sin cambios: RA 6 s, Servicio 5 s.

### «¿Qué es la RA?»: desplazamiento horizontal simple

**Antes:** efecto `creative` (giro de 24° y profundidad), con laterales inclinadas y deformadas.

**Ahora (`js/main.js`, `css/styles.css`):** efecto `slide` estándar de Swiper (sin `effect`, sin `creativeEffect`; se elimina `raRing`).
- Configuración: `loop`, `centeredSlides`, `speed: 800`. Móvil: `slidesPerView: 1.6`, `spaceBetween: 12`. Escritorio (≥ 769px): `slidesPerView: 3`, `spaceBetween: 20`, contenedor de Swiper al 60 % del ancho y `overflow: visible` (la sección recorta en los bordes de la pantalla).
- Central destacada y laterales más chicas y atenuadas solo por CSS: `scale(0.84)` en las no activas, `none` en la activa, con una transición de 0,8 s igual al desplazamiento. Se mantiene la capa oscura `.ra-frame::after`. En móvil, la anterior y la siguiente se achican hacia la central (`transform-origin`) para que asome más de cada una.
- Sin giros, perspectiva ni deformación. Las imágenes se mantienen verticales y cuadradas.

**Por qué 3 por vista y no 5 en escritorio (evidencia):** el bucle centrado de Swiper 11.2.10 exige `slides ≥ slidesPerView + max(1, ⌈slidesPerView/2⌉)` (`loopFix`, `swiper-core.mjs`). Con `slidesPerView: 5` hacen falta 8 imágenes. Con las 6 actuales, Swiper avisa «not enough slides for loop mode» y deja vacío el lado derecho (medido: 2 + central + 0). Con `slidesPerView: 3` (necesita 5) el bucle funciona. Las posiciones ±2 quedan fuera del contenedor del 60 % pero dentro de la pantalla, y la sexta (±3) siempre queda fuera de ella. El requisito de cinco visibles se cumple sin duplicar imágenes.

**Detalle técnico:** la regla de Swiper `.swiper-backface-hidden .swiper-slide { transform: translateZ(0) }` carga después de `styles.css` y anulaba la escala. Los selectores propios llevan `.ra-carousel` delante para ganarle.

### «Nuestro Servicio» en móvil (≤ 900px): una sola tarjeta

- Foto, franja de controles y panel de texto forman un único bloque: mismo ancho, borde de 1px, fondo del panel y esquinas de 22px (arriba en la foto, abajo en el panel). Márgenes laterales de 14px y ancho máximo de 640px en tableta.
- Foto en 3:2 (antes 1,41:1, de borde a borde): 360 × 240px a 390px en lugar de 390 × 276px. `object-fit: cover`, sin deformar. Se descartó 16:10 porque recortaba las etiquetas inferiores de la Catedral.
- Indicadores y pausa en una franja propia bajo la foto, centrados, sobre fondo liso (ya no sobre la imagen, y sin el degradado). Contraste de los indicadores inactivos 4,05:1 (antes 2,9:1 sobre la foto variable), del activo y de la pausa 6,6:1. Ícono de pausa de 16px con área de 44 × 44px.
- Escritorio (≥ 901px) sin cambios: 0 diferencias de estilo y de posición a 901, 1024 y 1366px.

### Pruebas (Chromium; no es Safari)

- **Recorrido cuadro a cuadro del RA** (8 avances hacia adelante, más hacia atrás en 390/1366 y 1920), a 320, 390, 768, 1366 y 1920px: 0 saltos (> 15 % del ancho entre cuadros en una imagen visible), 0 deformaciones y 0 desborde horizontal. Visibles en reposo: móvil 3 (central 1 → 6, 1, 2; central 6 → 5, 6, 1), escritorio 5 (central 1 → 5, 6, 1, 2, 3). Contador e indicador sincronizados en todo el ciclo. Sin avisos de Swiper.
- **Avances consecutivos:** con `reduce`, RA 5 (cada 6,0–6,1 s) y Servicio 6 (cada 5 s), cambios instantáneos. Sin la preferencia, RA 5 (cada ~6,8 s: 6 s más 0,8 s de desplazamiento) y Servicio 6.
- **Escenarios en emulación táctil (iPhone 13)**, ambos carruseles: 22/22 con `reduce` y 22/22 sin la preferencia. Cubren tocar un indicador, deslizar, visor abierto y cerrado, pausa y reanudación, fuera de pantalla y regreso, barra de progreso y cambio de preferencia en vivo.
- **Escritorio 1366px con `reduce`:** flecha siguiente; el mouse encima detiene el avance y al salir se reanuda.
- **Controles de Servicio:** a 320, 390 y 768px, debajo de la foto (sin superposición), panel unido, 1 botón visible, 44px, centrados y dentro de la pantalla.
- **Regresión:** `index.html`, `larioja.html` y `realitytour.html` a 390 y 1366px, con y sin `reduce`: 0 errores JS y menú móvil correcto. Fuera de `#ra` y `#services` (header, portada, «Quiénes somos», contacto y las otras dos páginas): 0 diferencias de estilo y de posición.

### Pendiente en iPhone real

1. Fluidez del desplazamiento del RA y de la escala con «Reducir movimiento» desactivado (Safari y Chrome).
2. Con «Reducir movimiento» activado: cambios instantáneos y avance continuo en ambos carruseles.
3. «Nuestro Servicio»: que la tarjeta se vea como un bloque y que los indicadores y la pausa se distingan y se toquen con comodidad.
4. Deslizar el RA con el dedo; tocar la imagen central abre el visor.

---

## 2026-11-03 — «¿Qué es la RA?» en escritorio: tres niveles de profundidad

**Problema:** en escritorio las cuatro laterales tenían el mismo tamaño (84 %) y el carrusel se veía plano.

**Cambio (solo `css/styles.css`, dentro de `@media (min-width: 769px)`):** sin cambios en JS, `initCarousel`, `waitForTransition`, autoplay, móvil, «Nuestro Servicio», imágenes, indicadores, controles ni visor.

| Posición | Escala | Capa oscura | Desplazamiento hacia el centro |
|---|---|---|---|
| −2 / +2 | 60 % | 0,68 | `calc(±42% ∓ 16px)` |
| −1 / +1 | 78 % | 0,31 (opacidad 0,45 × 0,68) | `calc(±11% ∓ 8px)` |
| 0 | 100 % | 0 | — |

- **Cómo se reconoce cada posición, sin JS nuevo:** el bucle de Swiper mantiene el orden del DOM igual al visual. La activa es 0, `swiper-slide-prev` y `-next` son ±1, `.swiper-slide-active ~ .swiper-slide` es +2 (y +3), y el estilo base es −2 (y −3).
- El `translateX` compensa la reducción de escala para que los cinco huecos midan lo mismo (28px). Escala y desplazamiento van en un mismo `transform` y cambian con la transición de 0,8 s del desplazamiento de Swiper; la capa oscura, también en 0,8 s.
- El contenedor de Swiper pasa del 60 % a 2/3 del ancho, para que la central gane tamaño (260 → 290px a 1366) y la sexta imagen (±3) quede siempre fuera de la pantalla entre 769 y 1920px.
- Centro vertical común (`transform-origin` centrado). Sin rotaciones ni perspectiva.
- Con «Reducir movimiento» se mantienen las reglas existentes: sin transición de `transform` ni de la capa (cambio instantáneo).

**Pruebas (Chromium):**
- **Reposo a 769, 1024, 1366 y 1920px:** 5 visibles con escala 60 / 78 / 100 / 78 / 60 %, capa 0,68 / 0,31 / 0 / 0,31 / 0,68. Diferencia de centro vertical 0px, huecos 28 / 28 / 28 / 28px, asimetría 0px, márgenes laterales iguales (53, 81 y 127px a 1024, 1366 y 1920) y 0px de desborde.
- **Movimiento cuadro a cuadro** (7 avances, 7 retrocesos y 6 saltos por indicador, unos 1.400 cuadros por ancho) a 769, 1024, 1366 y 1920px: 0 saltos de posición o de escala. El cambio máximo de escala por cuadro es 2,7 % (5,4 % a 1920 en saltos de varias posiciones), y tras cada movimiento se vuelve a 60/78/100/78/60 con la central igual a `realIndex`.
- **Autoplay:** 5 avances seguidos con `reduce` (cada 6 s, sin transición) y sin la preferencia (cada ~6,8 s), a 1024, 1366 y 1920px.
- **Visor:** abre con clic en la central, el carrusel se detiene, cierra con Escape y el avance continúa. Flecha siguiente y pausa por mouse encima, correctas.
- **Sin cambios fuera del alcance:** RA a 320, 390 y 768px, «Nuestro Servicio», header y «Quiénes somos»: 0 diferencias de estilo y de posición. La sección RA de escritorio quedó unos 30px más alta. Regresión de las 3 páginas: 0 errores JS.
- **Revisión visual a 1024 y 1366px** (reposo y a mitad de transición): los tres niveles se distinguen con claridad, la composición es simétrica, la central queda destacada con sus esquinas de visor y durante el avance cada imagen cambia gradualmente de tamaño y luminosidad.

**Pendiente en navegador real:** fluidez en escritorio (Safari y Chrome).

---

## 2026-11-03 — «¿Qué es la RA?» en escritorio: carrusel más grande y central más dominante

**Pedido:** imágenes un ~20 % más grandes, la central un ~15 % más destacada, laterales inmediatas al 75–80 % y exteriores al 55–65 % de la central, cinco visibles y sin recortes.

**Límite geométrico (verificado antes de cambiar):** el semiancho del conjunto es `central × (0,5 + r₁ + r₂) + 2 huecos`.
- Con la central +38 % (20 % × 15 %), a 1366px el semiancho sería de 809px con 78/60 %, o de 753px con 75/55 %. La pantalla mide 683px de semiancho, así que las exteriores quedarían cortadas.
- Además, el +15 % de dominancia de la central llevaría las inmediatas al 78/1,15 = 68 %, fuera del rango 75–80 % pedido.
- **Se aplicó el máximo compatible con todas las restricciones:** inmediatas al 75 % y exteriores al 55 % (extremos inferiores de los rangos, para que la central domine más) y la central al 25 % del ancho de pantalla.

**Cambio (solo `css/styles.css`, dentro de `@media (min-width: 769px)`):**
- Contenedor de Swiper: `calc(75% + 40px)` (= 3 diapositivas de 25 % más 2 × 20px de separación). Antes era 2/3.
- Escalas 100 / 75 / 55 % (antes 100 / 78 / 60 %). Huecos parejos de 1,2vw: `translateX` de ±1 `calc(∓12,5% ± 1,2vw ∓ 20px)` y de ±2 `calc(∓47,5% ± 2,4vw ∓ 40px)`. Cálculo detallado en el comentario del CSS.
- Sin cambios en atenuación, esquinas de visor, controles, efecto `slide`, duración, autoplay, movimiento reducido, JS, móvil ni «Nuestro Servicio».

**Resultado (central / inmediata / exterior):**

| Ancho | Antes | Ahora | Central | Huecos | Margen lateral |
|---|---|---|---|---|---|
| 1024px | 214 / 167 / 128 | 256 / 192 / 141 | +20 % | 12px | 27px |
| 1366px | 290 / 226 / 174 | 342 / 256 / 188 | +18 % | 16px | 35px |
| 1920px | 413 / 322 / 248 | 480 / 360 / 264 | +16 % | 23px | 50px |

**Pruebas (Chromium):**
- **Reposo a 769, 1024, 1366 y 1920px:** 5 visibles con escala 55 / 75 / 100 / 75 / 55 % y capa 0,68 / 0,31 / 0 / 0,31 / 0,68. Diferencia de centro vertical 0px, huecos iguales, asimetría 0px, desborde 0px, exteriores completas y la sexta fuera de la pantalla.
- **Movimiento cuadro a cuadro** (7 avances, 7 retrocesos y 6 saltos por indicador, unos 1.400 cuadros por ancho): 0 saltos. Máximo por cuadro: 3,2 % de escala; a 1920px, avances simples 24px y 1,6 %, saltos por indicador 42px y 3,2 %. Tras cada movimiento vuelve a 55/75/100/75/55 con la central igual a `realIndex`.
- **Autoplay:** 5 avances seguidos con `reduce` (cada 6 s, sin transición) y sin la preferencia (cada ~6,8 s), a 1024, 1366 y 1920px.
- **Visor:** abre con clic en la central, detiene el avance, cierra con Escape y el avance continúa. Flecha y pausa con mouse encima, correctas.
- **Controles:** misma posición, apoyados sobre el borde inferior de la central y visibles.
- **Sin cambios fuera del alcance:** RA a 320, 390 y 768px, «Nuestro Servicio» y header: 0 diferencias de estilo y de posición. La sección RA de escritorio quedó unos 52px más alta. Regresión de las 3 páginas: 0 errores JS.
- **Comparación visual antes/después a 1024 y 1366px:** el conjunto tiene más presencia, la central domina con claridad y las exteriores se ven completas con margen.

---

## 2026-11-03 — «¿Qué es la RA?» en escritorio: central de 420px a 1366px (cierre del tamaño)

**Pedido:** que la central mida ~400–450px a 1366px, para apreciarla sin el visor, con inmediatas al 75–80 % y exteriores al 55–60 %. Se permite solapamiento lateral moderado.

**Geometría (verificada antes de implementar):** sin solapamiento, una central de 420px no entra (semiancho 781px frente a 683px de pantalla). Con solapamiento sí entra, sin soluciones intermedias:
- central = 30,75 % del ancho (420px a 1366);
- inmediatas al 78 %, con la central tapando ~48px de cada una;
- exteriores al 58 %, con la inmediata tapando ~78px de cada una;
- borde exterior a 2 % de la pantalla y la sexta imagen siempre fuera de ella (≥ 0,6V del centro).

**Cambio (solo `css/styles.css`, dentro de `@media (min-width: 769px)`):**
- Contenedor de Swiper: `calc(92.25% + 40px)` (3 diapositivas de 30,75 % más 2 × 20px).
- `translateX` en % del ancho de la diapositiva: ±1 `calc(∓22.37% ∓ 20px)` con `scale(0.78)`; ±2 `calc(∓72.9% ∓ 40px)` con `scale(0.58)`. Cálculo en el comentario del CSS.
- **Orden de apilado:** central 40, ±1 20, resto 1. El `z-index` se interpola con la misma transición de 0,8 s, así la imagen que llega al centro pasa encima a mitad del avance (medido: a los 295 ms, con 370 y 377px de ancho, casi iguales) y no se ve un salto en la zona solapada. El `.swiper` de Swiper crea su propio contexto de apilado (`z-index: 1`), por eso los controles (`z-index: 5`) siguen encima.
- Sin cambios en atenuación, esquinas, controles, indicadores, efecto `slide`, duración, autoplay, movimiento reducido, JS, visor, móvil ni «Nuestro Servicio».

**Ancho visual real medido** (`getBoundingClientRect` del marco de la central, tras terminar la transición):

| Ancho | Central | Inmediata | Exterior | Solapes | Margen |
|---|---|---|---|---|---|
| 1024px | **315 × 315** | 246 | 183 | 36 / 58px | 20px |
| 1366px | **420 × 420** (antes 342) | 328 | 244 | 48 / 78px | 27px |
| 1920px | **590 × 590** | 461 | 342 | 67 / 109px | 38px |

**Pruebas (Chromium):**
- **Reposo a 769, 1024, 1366 y 1920px:** 5 visibles con escala 58 / 78 / 100 / 78 / 58 % y capa 0,68 / 0,31 / 0 / 0,31 / 0,68. Diferencia de centro vertical 0px, asimetría 0–1px y desborde 0px.
- **Movimiento cuadro a cuadro** (7 avances, 7 retrocesos y 6 saltos por indicador, unos 1.400 cuadros por ancho, cada ancho en una ejecución aislada): 0 saltos. Máximo por cuadro 2,9 % de escala y 33px a 1366. Tras cada movimiento vuelve a 58/78/100/78/58 con la central igual a `realIndex`. Un pico de 85px que apareció con 7 navegadores en paralelo fue un cuadro perdido por la carga del equipo; no se repitió al correr solo.
- **Autoplay:** 5 avances seguidos con `reduce` (cada 6 s, sin transición) y sin la preferencia (cada ~6,8 s), a 1024, 1366 y 1920px.
- **Visor:** abre con clic en la central, detiene el avance, cierra con Escape y el avance continúa. Flecha y pausa con mouse encima, correctas.
- **Nota de método:** a 1920 × 900 la prueba se detuvo tras el primer avance. La causa fue el cursor de la prueba en (2, 2), que quedaba encima del carrusel (ahora más alto, en y = −30…631): al moverse las imágenes debajo, el navegador emitió `pointerenter` y se activó la pausa por mouse encima, que es el comportamiento previsto. Con el cursor fuera del carrusel: 5 avances. No es un fallo del autoplay.
- **Controles:** misma posición, apoyados sobre el borde inferior de la central, visibles y por encima de las imágenes.
- **Revisión visual** con la central en una foto («Ficha informativa de la Casa de Gobierno»): a 1366px se leen la ficha, los títulos de las etiquetas RA y la fachada sin abrir el visor. También a 1024 y 1920px la composición queda equilibrada.
- **Sin cambios fuera del alcance:** RA a 320, 390 y 768px, «Nuestro Servicio» y header: 0 diferencias de estilo y de posición. La sección RA de escritorio quedó unos 80px más alta que en la versión anterior. Regresión de las 3 páginas: 0 errores JS.

---

## 2026-11-03 — Escritorio (> 900px): menos espacio entre «¿Qué es la RA?» y «Nuestro Servicio»

**Diagnóstico (medido a 1366px):** entre la leyenda del carrusel RA (último contenido de la sección) y la foto de «Nuestro Servicio» solo hay dos rellenos: `.ra-section { padding-bottom: 84px }` y `.services-section { padding-top: 110px }`, que suman 194px vacíos. No intervienen márgenes ni `min-height`. A 1024px el vacío llega a 234px, porque el panel es más alto que la foto y `align-items: center` la baja 40px.

**Cambio (`css/styles.css`, nuevo bloque `@media (min-width: 901px)` antes de `.svc-stage`):**
- `.ra-section { padding-bottom: 56px }` (antes 84px).
- `.services-section { padding-top: 68px }` (antes 110px).
- Total: −70px. Móvil y tableta (≤ 900px) conservan sus reglas.

**Resultado (antes → después):**

| Ancho | Leyenda RA → foto | Controles RA → foto | Leyenda RA → panel |
|---|---|---|---|
| 1024px | 234 → 164px (−30 %) | 313 → 243px (−22 %) | 194 → 124px (−36 %) |
| 1366px | 194 → 124px (−36 %) | 273 → 203px (−26 %) | 286 → 216px |
| 1920px | 194 → 124px (−36 %) | 272 → 202px (−26 %) | 287 → 217px |

El espacio vacío visible (desde la leyenda, que es contenido) se reduce un 30–36 %. Medido desde los controles, que incluye la leyenda y su margen, la reducción es del 22–26 %.

**Pruebas (Chromium, contra `17a5706`):**
- **Estilos calculados:** a 1024, 1366 y 1920px solo cambian los dos rellenos y, como consecuencia directa, el centro geométrico de ambas secciones (`transform-origin` y `perspective-origin`) y la posición del contenido respecto de su sección. Header, portada, «Quiénes somos» y contacto: 0 diferencias. A 320, 390, 768 y 900px: 0 diferencias en toda la página.
- **Píxeles:** las secciones se acortan exactamente 28px (RA) y 42px (Servicio). Su contenido es idéntico salvo el brillo de fondo (`radial-gradient` en % del alto de la sección), que se corre ≤ 8 niveles de 255, imperceptible. Únicas excepciones: 9 píxeles en el inicio de la barra de progreso del indicador activo (depende del instante de la captura) y 1 píxel aislado.
- **Comparación visual** de la unión de ambas secciones a 1024, 1366 y 1920px: el único cambio perceptible es la separación. Los controles RA siguen visibles, la foto y el panel de Servicio no se superponen con el carrusel, el título queda dentro del panel y no hay recortes ni desbordes.
- **Regresión:** 3 páginas a 390 y 1366px, con y sin `reduce`: 0 errores JS. Carrusel RA en escritorio: flecha, avance y pausa con mouse encima, correctos.

---

## 2026-11-03 — Móvil · «¿Qué es la RA?»: desplazamiento suave también con «Reducir movimiento», central más grande y sin leyenda

**Problema (iPhone real):** con «Reducir movimiento» las imágenes cambiaban de golpe. La causa: `initCarousel` usaba `speed: 0` con esa preferencia. Además, la central era chica (61 % del ancho) y el contador con la descripción ocupaba espacio.

### A. Transición (`js/main.js`)
- `initCarousel` acepta ahora `speed` como función `(reducido) => ms` y `speedMedia` (consultas de medios que obligan a recalcularla). Con un número sigue funcionando como antes (0 con movimiento reducido): «Nuestro Servicio» no cambia.
- RA: `speed: (reduced) => mobileQuery.matches ? 600 : reduced ? 0 : 800` con `speedMedia: [mobileQuery]` (≤ 768px).
  - Móvil: 600 ms siempre, con y sin la preferencia.
  - Escritorio: 800 ms, o 0 con la preferencia (sin cambios, verificado).
- **Corrección del autoplay conservada y generalizada:** `autoplay.waitForTransition = velocidad efectiva > 0`, tanto al iniciar como al cambiar la preferencia o el tamaño. Swiper solo espera el `transitionend` del contenedor cuando hay transición; con velocidad 0 no espera, así que no vuelve el bloqueo tras el primer avance.
- `css/styles.css`: escala y atenuación de las diapositivas móviles en 0,6 s (igual al desplazamiento). La regla de movimiento reducido que anula esas transiciones queda solo para escritorio: `@media (prefers-reduced-motion: reduce) and (min-width: 769px)`.

**Compromiso de accesibilidad (explícito):** en móvil el carrusel RA **mantiene una animación de desplazamiento de 600 ms aunque la persona haya pedido reducir movimiento**. Es una decisión de producto: el cambio instantáneo se percibía brusco. **No se respeta por completo `prefers-reduced-motion`** en este componente. Mitigaciones: desplazamiento horizontal corto, sin giros, zoom ni parallax; botón de pausa persistente (44 × 44px, WCAG 2.2.2); el avance se detiene fuera de pantalla y con el visor abierto. El resto del sitio, el escritorio y «Nuestro Servicio» siguen respetando la preferencia.

### B. Tamaño
- `slidesPerView` 1,6 → 1,2 y `spaceBetween` 12 → 8: la central ocupa el **83 %** del ancho. La anterior y la siguiente asoman a los costados (al 84 %, reducidas hacia la central, con su capa oscura).
- Proporción cuadrada del marco sin cambios. Esquinas de visor, capa de atenuación, indicadores y pausa, iguales.

| Ancho | Central (antes → ahora) | Asoma de cada lateral |
|---|---|---|
| 320px | 196 → 265px | 19px |
| 375px | — → 311px | 24px |
| 390px | 239 → 324px | 25px |
| 430px | — → 357px | 29px |
| 768px | — → 639px | 57px |

### C. Leyenda
- `.ra-caption { display: none }` solo en ≤ 768px: sin contador ni descripción. El `alt` de cada imagen y la etiqueta accesible del visor siguen intactos. En escritorio no cambia.

### Pruebas (Chromium con emulación táctil; **no se probó en Safari real**: el entorno no lo permite)
- **Cuadro a cuadro** a 320, 375, 390, 430 y 768px, con `reduce` y sin la preferencia, 7 avances:
  - cada avance dura ~600 ms con ~34 cuadros intermedios (antes, con `reduce`: 1 cuadro con un salto de 270px);
  - máximo 17–39px por cuadro según el ancho; 0 desborde; leyenda `display: none`.
- **Prueba larga:** 18 avances seguidos (3 ciclos, con 6 → 1 tres veces) a 320 y 390px con `reduce`: 0 saltos y regreso al orden inicial. En una de unas 15 corridas apareció 1 cuadro con salto a 320px; no se repitió en unos 70 avances posteriores y es compatible con un cuadro perdido del equipo de prueba.
- **Autoplay:** 5 avances seguidos del RA (cada ~6,6 s: 6 s más 0,6 s) y de Servicio (cada 5 s), con y sin `reduce`.
- **Escenarios táctiles (iPhone 13)**, ambos carruseles: 22/22 con `reduce` y 22/22 sin la preferencia, en 6 corridas tras corregir la prueba. Cubren tocar un indicador, deslizar, abrir y cerrar el visor, pausa y reanudación, fuera de pantalla y regreso, barra de progreso y cambio de preferencia en vivo.
- **Nota de método:** sin la preferencia, la animación de revelado (`.hidden`) puede dejar el carrusel bajo el cursor virtual de Playwright en (0, 0). Eso genera un `pointerenter` de tipo mouse y activa la pausa prevista con el mouse encima, que no existe en un iPhone. Los guiones ahora mueven ese cursor fuera de los carruseles. Antes de esa corrección, 1 corrida falló 4 casos por esta causa (registrada con el evento) y otra falló 2 casos que no se repitieron en 5 corridas posteriores con registro del puntero.
- **Escritorio sin cambios (contra `89afb41`):** `speed` y `waitForTransition` idénticos a 769 y 1366px, con y sin `reduce`. Estilos calculados de toda la página a 901, 1024, 1366 y 1920px con `reduce`: 0 diferencias. Sin la preferencia, las diferencias son transiciones capturadas a mitad de camino: la versión anterior contra sí misma da la misma cantidad. Píxeles con los carruseles detenidos a 1024, 1366 y 1920px: solo la franja de 3px de la barra de progreso.

**Pendiente en iPhone real (Safari y Chrome):** con «Reducir movimiento» activado y desactivado, varios avances seguidos con desplazamiento suave, sin detenerse, y comprobar el tamaño de la central.

---

## 2026-11-03 — Móvil · «Nuestro Servicio»: opción B «imagen protagonista»

**Cambio (solo `css/styles.css`, dentro del bloque existente `@media (max-width: 900px)`; escritorio sin cambios):**
- `.svc-stage` pasa a ser un **panel común**: relleno de 10px, borde de 1px rgba(255,255,255,0,1), radio de 26px, fondo del panel con un brillo turquesa muy tenue arriba (`radial-gradient`) y sombra. Contiene la foto, los controles y el texto, que así se leen como una sola composición.
- **Foto protagonista:** 3:2 con las **cuatro esquinas redondeadas** (18px), sombra suave y aro de 1px, `object-fit: cover` (sin deformar). `.svc-carousel` ya no tiene borde ni fondo propios.
- **Controles** (indicadores y pausa) centrados debajo de la foto, sobre el fondo del panel (contraste de los indicadores inactivos ≈ 4:1). Pausa de 44 × 44px.
- **Texto:** `.svc-card` sin caja propia (sin fondo, borde ni sombra), con relleno de 14px 12px 16px dentro del panel común. Título, apartados, textos, colores y tipografías sin cambios.

**Medidas:** foto de 270 × 180 a 320px, 325 × 217 a 375px, 340 × 227 a 390px, 380 × 253 a 430px y 640 × 427 a 768px. Margen interno de 11px por lado, 0px de desborde y el panel de texto dentro del panel común en todos los anchos.

**Pruebas (Chromium con emulación táctil; no es Safari real):**
- Escenarios táctiles de «Nuestro Servicio» (tocar un indicador, deslizar, abrir y cerrar el visor, pausa y reanudación, fuera de pantalla y regreso, barra de progreso): **0 fallos en 10 corridas completas**, con y sin `reduce`.
- **Autoplay:** 5 o más avances seguidos cada 5 s, con y sin `reduce`.
- **Controles** a 320, 390 y 768px: debajo de la foto, sin superposición, centrados, 1 botón visible, 44px y dentro de la pantalla.
- **Escritorio sin cambios (contra `ac79939`):** estilos calculados de toda la página a 901, 1024, 1366 y 1920px: 0 diferencias. Header y «Quiénes somos» en móvil: 0 diferencias. Regresión de las 3 páginas: 0 errores JS.

---

## 2026-11-03 — ABIERTO · Fallo intermitente del autoplay RA en móvil tras pulsar un indicador (causa no confirmada)

**Estado: NO resuelto. Causa NO confirmada.** No se modificó el carrusel RA para intentar corregirlo.

**Síntoma (solo en pruebas automatizadas, Chromium con emulación de iPhone 13):** en el guion de escenarios, después de tocar un indicador del RA (o de deslizar), el carrusel a veces deja de avanzar durante toda la ventana de medición (unos 20 s). Vuelve a avanzar después de abrir y cerrar el visor ampliado, y a partir de ahí todos los casos pasan.

**Condiciones conocidas:**
- Aparece **solo sin «Reducir movimiento»**. Con `reduce`: 0 fallos en todas las corridas.
- Aparece con la versión `ac79939` (RA móvil a 600 ms). Antes de ese commit, el RA móvil con `reduce` usaba velocidad 0, así que no hay un punto de comparación equivalente.
- **Es intermitente:** 4 de 8 corridas en la última tanda (con 4 navegadores en paralelo), y también antes en 2 de unas 10 corridas. Afecta siempre a los primeros casos del RA («avance tras navegación manual», «avance tras deslizar») y una vez también a «tap indicador».
- «Nuestro Servicio» no lo presenta: 0 fallos.

**Pruebas realizadas:**
- **Toque de un indicador** a +0, +100, +300, +500, +650, +1500 y +3000 ms después de un avance automático (con el revelado `.hidden` desactivado): **no se reproduce**. Siempre hay 2–3 avances en los 15 s siguientes y el estado final es `running=true, paused=false`. El momento del toque respecto de la transición no parece ser la causa.
- **Autoplay sin tocar** (5 avances seguidos) y **recorrido cuadro a cuadro** (18 avances): sin fallos.
- **Registro de eventos en las corridas que fallaron:**
  - el foco en el indicador o la pausa nunca se informa como `:focus-visible` (no parece ser la pausa por teclado);
  - aparecieron 2 eventos de puntero de tipo **mouse** (cursor virtual de Playwright) en el conjunto de corridas fallidas: al menos parte de los casos puede ser el artefacto ya documentado (cursor virtual sobre el carrusel después de que el revelado `.hidden` mueve el contenido), pero no alcanza para explicarlos todos;
  - se registraron `autoplayStop` del RA, es decir, `sync()` detiene el avance porque se cumple alguna condición de pausa. No se llegó a aislar cuál.

**Hipótesis pendientes (sin confirmar):**
1. Artefacto del cursor virtual (pausa por mouse encima) en más casos de los registrados.
2. Una condición de `sync()` que queda activa tras el toque, que se limpia al cerrar el visor (allí se reinicia `keyboardUse`).
3. Interacción entre el revelado `.hidden` (solo sin `reduce`), el desplazamiento de la página y la visibilidad (`IntersectionObserver`).

**Próximo paso sugerido:** en una sesión nueva, registrar en cada `sync()` el valor de `userPaused`, `onScreen`, `mouseOver`, `keyboardUse` y `viewerOpen` (instrumentación temporal, fuera de producción) y repetir el guion hasta capturar una falla. **Validar en iPhone real:** tocar un indicador del RA y deslizar, sin «Reducir movimiento», y comprobar que el avance automático continúa.

---

## Caso técnico — Swiper, autoplay y «Reducir movimiento» en iOS

*Registro para la defensa del Trabajo Final Integrador. Resume el incidente a partir del código, los commits de la rama `claude/determined-hawking-1j40dk` y las entradas anteriores de esta bitácora.*

### 1. Contexto

- **Biblioteca:** [Swiper](https://swiperjs.com/) 11.2.10, fijada por versión desde el CDN jsDelivr (`25c3d31`). No se usan otras dependencias para los carruseles.
- **Función de los carruseles:**
  - «¿Qué es la RA?» muestra 6 ejemplos de realidad aumentada en bucle circular, con avance automático cada 6 s.
  - «Nuestro Servicio» presenta 4 fotos del servicio con avance automático cada 5 s.
  - Ambos usan un controlador común, `initCarousel` (`js/main.js`). Se encarga del autoplay, la pausa persistente (botón accesible), la pausa temporal (puntero de mouse, foco de teclado, fuera de pantalla con `IntersectionObserver`, visor ampliado abierto), los indicadores con barra de progreso y el visor.
- **`prefers-reduced-motion`:** es la consulta CSS/JS que expone la opción del sistema operativo. En iOS: Ajustes → Accesibilidad → Movimiento → Reducir movimiento. El sitio la lee con `window.matchMedia("(prefers-reduced-motion: reduce)")` y adapta el comportamiento de los carruseles.
- **Evolución de la decisión:**
  - Primero, con la preferencia activa, el autoplay se detenía (`6e54cab`).
  - Después, por decisión del equipo, se mantuvo el avance automático pero sin animación, con velocidad 0 (`998d0d5`).

### 2. Problemas detectados

Son tres problemas distintos, y conviene no mezclarlos.

**a) Bloqueo del autoplay después del primer avance (funcional).** Se observó en un iPhone real, en Safari y en Chrome, en ambos carruseles:
- la primera imagen mostraba la barra de progreso y avanzaba a la segunda;
- desde ahí la barra no volvía a empezar y no había más avances;
- la navegación manual seguía funcionando.

**b) Transiciones instantáneas y desagradables (visual).** Con «Reducir movimiento» activo, las imágenes de «¿Qué es la RA?» cambiaban de golpe, sin desplazamiento. No era un fallo del código: era la consecuencia directa de la velocidad 0, configurada a propósito. Pero el equipo lo percibió como brusco al probarlo en el iPhone.

**c) Dificultades en las pruebas automatizadas con emulación táctil (método).** Las pruebas se ejecutaron en Chromium (Playwright) emulando un iPhone 13. Aparecieron detenciones que no correspondían al sitio sino al entorno de prueba:
- **Cursor virtual de Playwright:** existe siempre, incluso en modo táctil. Cuando el carrusel quedaba debajo de él (por el desplazamiento de la página o la animación de revelado), el navegador emitía un `pointerenter` de tipo `mouse` y se activaba la pausa por mouse encima, que es el comportamiento previsto. En un iPhone no hay puntero de mouse.
- **Emulación incompleta de iOS:** Chromium no reproduce de forma idéntica Safari iOS. Por ejemplo, en una corrección anterior (`b7e5645`) se vio que iOS no envía `mouseleave` tras un toque, mientras que Chromium sí lo hace en la mayoría de los casos.
- **Fallo intermitente sin causa confirmada:** en la última sesión, el guion de escenarios registró a veces una detención del RA móvil tras pulsar un indicador. Ocurrió solo en la emulación y sin «Reducir movimiento». Su causa **no quedó confirmada** (ver la entrada «ABIERTO · Fallo intermitente…»). En la validación en iPhone real, la navegación manual y el autoplay funcionaron correctamente.

### 3. Causas técnicas

**Problema (a), confirmado en el código de Swiper y reproducido en Chromium (`cadf5ac`):**
- **`speed: 0`:** desde `998d0d5`, con la preferencia activa, `initCarousel` configuraba `speed: 0`. Cada cambio de imagen se aplicaba sin transición CSS.
- **`autoplay.waitForTransition`** (por defecto `true`): en cada cambio de imagen, el autoplay de Swiper se pausa (`beforeTransitionStart` → `pause(true, true)`). Solo se reanuda al recibir un evento `transitionend` en el contenedor de las diapositivas (`swiper-wrapper`).
- **Por qué el evento nunca llegaba:**
  - Los efectos usados entonces, `fade` en Servicio y `creative` en RA, no mueven el contenedor (`virtualTranslate`). Swiper fabrica ese `transitionend` cuando termina la animación de la diapositiva, pero solo si la duración es distinta de 0 (condición `duration !== 0` en `effectVirtualTransitionEnd`).
  - Con velocidad 0 no había transición, el evento no se generaba y el autoplay quedaba en `running = true, paused = true` indefinidamente.
  - Como `running` seguía en `true`, la función `sync()` de `initCarousel` no lo reiniciaba. La barra de progreso quedaba congelada porque el tiempo restante no avanzaba.
  - En términos generales, el navegador no emite `transitionend` cuando no hay transición. Por eso cualquier combinación de velocidad 0 con `waitForTransition: true` puede dejar el autoplay esperando.
- **Por qué el primer avance sí ocurría:** el primer temporizador ya estaba programado. El bloqueo empezaba en la pausa que Swiper hace dentro de ese primer cambio.
- **Evidencia:** registro de eventos `slideChange → autoplayPause → … → autoplay` sin ningún `autoplayResume` posterior. El mismo patrón apareció en ambos carruseles en Chromium con la preferencia emulada, y coincidía exactamente con lo observado en el iPhone.

**Problema (b), confirmado:**
- Con velocidad 0, Swiper aplica la nueva posición en un solo cuadro. En la medición: un salto de 270px en un cuadro a 390px, frente a unos 34 cuadros intermedios con velocidad 600.
- Además, una regla CSS anulaba la transición de escala y atenuación de las imágenes con la preferencia activa.
- **Conclusión:** el cambio «brusco» no se debía a un error del efecto visual. Era el resultado de haber traducido «reducir movimiento» como «sin ninguna animación».

**Lo que no se confirmó:** la causa del fallo intermitente de las pruebas automatizadas (apartado 2c). Las hipótesis son el cursor virtual, una condición de pausa de `sync()` que queda activa, y la interacción con el revelado `.hidden` y el `IntersectionObserver`. Siguen siendo hipótesis.

### 4. Soluciones implementadas

| Objetivo | Cambio | Archivo / función | Commit |
|---|---|---|---|
| Que los toques no dejen el carrusel pausado en iPhone | La pausa por puntero usa `pointerenter`/`pointerleave` y solo cuenta `pointerType === "mouse"`; la pausa por teclado queda en una variable aparte | `js/main.js`, `initCarousel` | `b7e5645` |
| Evitar el bloqueo tras el primer avance | `autoplay.waitForTransition` deja de ser siempre `true`: no se espera la transición cuando no la hay; se actualiza también si cambia la preferencia con la página abierta | `js/main.js`, `initCarousel` | `cadf5ac` |
| Generalizar la protección | `initCarousel` acepta `speed` como función `(reducido) => ms` y `speedMedia` (consultas de medios). La función `speedFor()` calcula la velocidad efectiva y `applySpeed()` la recalcula al cambiar la preferencia o el tamaño de pantalla, con la regla **`waitForTransition = velocidad efectiva > 0`** | `js/main.js`, `initCarousel`, `speedFor`, `applySpeed` | `ac79939` |
| Transición fluida de 600 ms en RA móvil | RA: `speed: (reduced) => mobileQuery.matches ? 600 : reduced ? 0 : 800`, con `speedMedia: [mobileQuery]` (≤ 768px). Escala y atenuación de las diapositivas móviles en 0,6 s (`transition: transform 0.6s`). La regla CSS de movimiento reducido que anula esas transiciones queda solo para escritorio: `@media (prefers-reduced-motion: reduce) and (min-width: 769px)` | `js/main.js`, llamada a `initCarousel` del RA; `css/styles.css` | `ac79939` |
| Efecto horizontal simple en lugar de `creative` | RA con el efecto `slide` estándar de Swiper y la profundidad resuelta solo con CSS (escala y capa oscura) | `js/main.js`, `css/styles.css` | `98bcfbd` (y ajustes de escritorio `22a1cc9`, `1045bfb`, `17a5706`) |
| Navegación manual y pausa accesible | Se conservan los indicadores (tocar para ir a una imagen), el deslizamiento táctil, las flechas en escritorio y el **botón de pausa persistente** (44 × 44px, etiqueta «Pausar/Reanudar avance automático»), incorporado en todos los tamaños en `998d0d5` | `index.html`, `css/styles.css`, `initCarousel` | `998d0d5` |

**Comportamiento resultante:**

| Carrusel / tamaño | Sin «Reducir movimiento» | Con «Reducir movimiento» |
|---|---|---|
| RA en móvil | 600 ms | 600 ms |
| RA en escritorio | 800 ms | 0 (cambio instantáneo) |
| «Nuestro Servicio» | 800 ms | 0 |

En todos los casos `waitForTransition` es `true` solo si hay transición. El autoplay de RA es cada 6 s y el de Servicio cada 5 s.

### 5. Accesibilidad y decisión de producto

- **Decisión consciente:** en móvil, el carrusel «¿Qué es la RA?» **mantiene un desplazamiento animado de 600 ms aunque la persona haya activado «Reducir movimiento»**. El equipo priorizó la fluidez visual sobre el cambio instantáneo, que se percibía brusco.
- **Este componente no respeta por completo** la preferencia de accesibilidad del dispositivo. No debe presentarse como conforme a ella.
- **Medidas que reducen el impacto** (no lo eliminan):
  - movimiento solo horizontal y breve, sin giros, zoom ni perspectiva;
  - el escritorio y «Nuestro Servicio» siguen eliminando la animación con la preferencia activa;
  - el resto del sitio la respeta.
- **Control de pausa persistente:** es una medida complementaria y está relacionada con el criterio WCAG 2.2.2 (poder pausar contenido que se mueve solo). El avance también se detiene fuera de pantalla y con el visor abierto. Esto **no equivale a cumplir automáticamente todas las pautas de accesibilidad**: no se realizó una auditoría formal de accesibilidad de estos componentes.

### 6. Validación

- **Pruebas automatizadas en Chromium** (Playwright con emulación táctil de iPhone 13 y de varios anchos, en sesiones anteriores):
  - registro de eventos de Swiper para reproducir el bloqueo;
  - recorridos cuadro a cuadro para medir la duración y los saltos de las transiciones;
  - 5 o más avances automáticos seguidos, con y sin la preferencia emulada;
  - escenarios táctiles: indicadores, deslizar, visor, pausa y reanudación, salir y volver a la sección;
  - comparación de estilos y de píxeles para comprobar que el escritorio no cambiaba.
  
  Los resultados y sus números están en las entradas de los commits citados.
- **Limitaciones de la emulación:**
  - Chromium no es Safari ni WebKit;
  - la emulación táctil conserva un cursor de mouse virtual que puede activar pausas inexistentes en un iPhone;
  - algunos comportamientos de iOS (eventos de compatibilidad tras un toque) no se reproducen igual;
  - por eso **ninguna corrección se dio por cerrada con la sola prueba en Chromium**;
  - el fallo intermitente observado en la emulación sigue sin causa confirmada.
- **Validación manual en iPhone real (Safari y Chrome), realizada por el usuario** y confirmada como satisfactoria:
  - «¿Qué es la RA?» presenta transiciones fluidas, incluso con «Reducir movimiento» activado;
  - la navegación manual, el autoplay y el botón de pausa funcionan correctamente;
  - el diseño móvil de «Nuestro Servicio» quedó aprobado.
  
  Con esto ambas secciones quedan aprobadas. **Para esta entrada no se ejecutaron pruebas nuevas.**

### 7. Lecciones aprendidas

- **Probar en dispositivos reales:** el bloqueo y la sensación de brusquedad se detectaron en un iPhone. La emulación ayudó a reproducir y medir, pero también introdujo falsos positivos (el cursor virtual). La validación final solo fue concluyente en el dispositivo real.
- **Preferencias del sistema y bibliotecas JavaScript:** una preferencia de accesibilidad bien intencionada (`speed: 0`) chocó con una suposición interna de la biblioteca: que siempre llega un evento de fin de transición. Al adaptar una biblioteca a una preferencia del sistema, hay que revisar qué eventos y estados espera.
- **Separar problemas funcionales de decisiones visuales:** el bloqueo del autoplay era un error y se corrigió primero, con evidencia. La transición instantánea era una consecuencia de diseño y se decidió aparte, como decisión de producto con su compromiso de accesibilidad documentado.
- **Documentar durante el MVP:** registrar síntomas, hipótesis, evidencias y commits en esta bitácora evitó repetir correcciones especulativas. Permitió distinguir lo confirmado de lo no confirmado y deja material verificable para explicar las decisiones.

### 8. Resumen para la defensa

Los carruseles de RealityTour usan la biblioteca Swiper, que avanza automáticamente y, antes de cada nuevo avance, espera la señal del navegador que indica que terminó la animación anterior. Para respetar la opción «Reducir movimiento» de iOS habíamos configurado la animación con duración cero. Sin animación, el navegador nunca emitía esa señal, y por eso los carruseles avanzaban una sola vez y quedaban detenidos. Lo confirmamos en el código de la biblioteca y lo reprodujimos en pruebas automatizadas. La solución fue que el carrusel espere la señal solo cuando realmente hay una animación. Después, como el cambio instantáneo resultaba brusco, decidimos de forma consciente usar en el carrusel móvil «¿Qué es la RA?» un desplazamiento breve de 600 ms incluso con esa opción activada, y conservamos un botón para pausarlo. Documentamos que esto no respeta por completo la preferencia de accesibilidad. El resultado fue validado por el usuario en un iPhone real.

---

## 2026-11-04 — Navegación: el logo lleva al inicio

**Antes:**
- En `index.html` y `realitytour.html` el logo era una imagen suelta, sin acción.
- `larioja.html` ya lo envolvía en un enlace (`<a href="index.html" aria-label="RealityTour, ir al inicio">`), con un destino distinto al de su opción «Inicio» (`index.html#home`).

**Cambio:** se reutilizó el patrón de `larioja.html` en las tres páginas, sin JavaScript nuevo.
- **HTML:** el logo va dentro de `<a … aria-label="RealityTour, ir al inicio">`, con el **mismo `href` que «Inicio» en cada página**: `#home` en `index.html` e `index.html#home` en `larioja.html` y `realitytour.html`.
- **CSS:** en la regla existente `.logo` se agregó `display: block`. Una imagen en línea dentro del enlace suma el espacio de la línea de texto: en el header móvil eran +5px (76 → 81px), medido al probar. Con `display: block` el header conserva exactamente su alto. No se agregaron clases ni reglas nuevas.

**Pruebas (Chromium):**
- **Destino**, en las 3 páginas, con clic a 1366px y con toque en iPhone 13 emulado, partiendo de la página desplazada: el `href` del logo es idéntico al de «Inicio» y lleva a `index.html#home`, con `#home` arriba (`scrollY` 0). Sin errores JS.
- **Teclado:** el logo es el primer elemento con Tab, con foco visible (`:focus-visible`) y nombre accesible «RealityTour, ir al inicio»; Enter lleva al inicio.
- **Aspecto:**
  - capturas del header antes y después, a 390 y 1366px: idénticas píxel a píxel en `larioja.html` y `realitytour.html`;
  - en `index.html` también son idénticas, comparadas con el video de portada oculto (el header es transparente sobre el video);
  - misma geometría del header y del logo en todos los casos.
- **Menú móvil abierto:** el panel cubre el logo, así que no puede tocarse en ese estado y el menú no puede quedar abierto al usarlo. Por eso no hace falta la lógica de cierre de «Inicio».
- **Regresión:** 3 páginas a 390 y 1366px, con y sin `reduce`: 0 errores JS y menú móvil correcto.

---

## Deuda técnica pendiente (inspección breve, 2026-11-04)

Inspección rápida de `index.html`, `larioja.html`, `realitytour.html`, `css/styles.css` (1.590 líneas), `css/larioja.css` (477), `js/main.js` (377) y `js/realitytour.js` (91). **No se corrigió nada.** Sirve para planificar un ordenamiento controlado antes de integrar la funcionalidad definitiva de realidad aumentada.

| Prioridad | Tema | Explicación breve |
|---|---|---|
| **Alta** | `js/realitytour.js` sin estructura | Variables y funciones de la cámara en el ámbito global, con indentación inconsistente. Decide si actuar comprobando `location.pathname.includes("realitytour.html")`, en lugar de buscar los elementos de la página. Registra eventos (`switchCameraBtn`, `fullscreenBtn`) fuera de ese chequeo, y fallaría si el archivo se cargara en otra página. Es la base donde se integrará la RA definitiva: conviene ordenarlo antes (módulo o función de inicialización, sin cambiar el comportamiento). |
| **Media** | `js/main.js` con responsabilidades mezcladas | Un solo `DOMContentLoaded` de ~370 líneas contiene el menú, el header al desplazarse, el revelado `.hidden`, el visor ampliado y los carruseles. El bloque del header tiene otra indentación (añadido como parche) y comentarios de prueba (`// ✅ CORRECTO`). Separar en funciones de inicialización por componente (o archivos) facilitaría el mantenimiento. |
| **Media** | Orden de las hojas de estilo frente a Swiper | `swiper-bundle.min.css` se carga después de `css/styles.css`, por lo que varias reglas propias necesitan más especificidad para ganarle a Swiper (`.ra-carousel .ra-swiper .swiper-slide`, `.svc-carousel .svc-controls .rt-pagination`, documentado en entradas anteriores). Cargar Swiper antes permitiría simplificar esos selectores. Requiere comparación visual completa. |
| **Media** | Script del video de portada fuera de lugar | En `index.html` hay un `<script>` en línea entre `</head>` y `<body>` (posición no válida en HTML; el navegador lo corrige). Debería ir dentro de `main.js` o al final del `body`. **Toca el video de portada**: requiere prueba en iPhone. |
| **Baja** | Selectores repetidos en `css/styles.css` | `.biography-section` está definido dos veces a nivel superior (líneas ~207 y ~1409) y `.svc-controls` dos veces (~679 y ~1153; la segunda pertenece al bloque de «Nuestro Servicio»). Conviene unificarlos para evitar contradicciones al editar. |
| **Baja** | Puntos de corte no unificados | Coexisten 700, 768/769, 900/901 y 1200px. Algunos son intencionales (900px en «Nuestro Servicio»), pero no hay una convención documentada; conviene definirla (comentario o variables) antes de agregar secciones. |
| **Baja** | Comentarios con emojis y notas de prueba | Unos 31 comentarios con emojis en `styles.css`, de etapas anteriores. Son ruido, sin efecto funcional; se pueden normalizar durante el ordenamiento. |
| **Baja** | `!important` en `styles.css` | 6 usos. Revisar si alguno puede eliminarse al reordenar la cascada (ver la fila de Swiper). |

**Sugerencia de orden:** 1) `realitytour.js` (antes de la RA definitiva); 2) separación por componentes en `main.js`; 3) cascada CSS y selectores repetidos, con comparación visual antes y después. Cada paso en commits pequeños y verificables.

---

## 2026-11-04 — Mejora estructural · Etapa 1: organización de `js/realitytour.js`

*Primera de cinco etapas (1 `realitytour.js`, 2 `main.js`, 3 CSS, 4 HTML y recursos, 5 validación). Solo se ejecutó esta etapa.*

**Problemas estructurales encontrados** (deuda técnica del 04/11, prioridad alta):
- `currentStream` y `useFrontCamera` en el ámbito global; `startCamera` y `stopCameraStream` se publicaban en `window`, porque eran funciones declaradas dentro de un bloque `if` sin modo estricto.
- Toda la lógica dependía de `window.location.pathname.includes("realitytour.html")` y no de que existan los elementos de la cámara.
- Indentación muy irregular: hacía parecer que los eventos de los botones estaban fuera del `if`, aunque en realidad estaban dentro.
- La lógica de «salir de pantalla completa» estaba copiada dos veces (rama `else` del botón de pantalla completa y botón X), además de comentarios repetidos y con emojis.

**Modificaciones (solo `js/realitytour.js`):**
- Todo el código queda dentro de una función autoejecutable y una función `initCamera()`. No se crean variables globales.
- `initCamera()` busca los elementos y **solo continúa si existe el `<video id="camera-stream">`**; ya no consulta la URL. Los eventos se registran dentro de la inicialización y solo si sus botones existen: cambiar cámara (si existe el botón) y pantalla completa y X (si existen el contenedor, ambos botones y el `header`).
- Funciones agrupadas por responsabilidad: `stopCameraStream()`, `startCamera()`, `enterFullscreen()` y `exitFullscreen()`. El botón de pantalla completa alterna entre las dos últimas y la X usa `exitFullscreen()`; desaparece la copia de código.
- Indentación uniforme y comentarios breves en español.

**Comportamiento conservado (sin cambios):**
- Arranca con la cámara trasera (`facingMode: "environment"`) al cargar.
- El botón alterna con la frontal (`"user"`) deteniendo antes la pista anterior.
- La pantalla completa simulada aplica los mismos estilos en línea: `overflow` del `body`, `display` del header y de ambos botones.
- La X restaura la vista; la cámara se detiene en `beforeunload`.
- Mismo orden: primero se pide la cámara y luego se registran los botones.
- Mismo mensaje de error en consola.

**Por qué esta estructura:** una función de inicialización con funciones internas es lo más simple que evita globales y deja un punto de entrada claro (`initCamera`) para integrar la RA definitiva. No justifica clases ni módulos ES, que además cambiarían la forma de cargar el script.

**Pruebas (Chromium con cámara simulada `--use-fake-device-for-media-stream`; no hay cámara física en este entorno: no se probó una cámara real):** misma secuencia antes y después en iPhone 13 emulado. Se registraron:
- las llamadas a `getUserMedia` y sus restricciones;
- el estado del `<video>` y de las pistas;
- los estilos en línea al entrar y salir de pantalla completa (con el botón, con la X y con dos clics seguidos);
- la detención de la pista al cambiar de cámara y en `beforeunload`;
- los listeners registrados.

**Resultado: salida idéntica en todos los puntos**, incluido el caso sin `navigator.mediaDevices`. Además:
- variables y funciones del script en `window`: antes `startCamera` y `stopCameraStream`, ahora ninguna;
- cargado en una página sin cámara: 0 errores propios;
- regresión de las 3 páginas a 390 y 1366px: 0 errores JS.

**Pendiente (documentado, no implementado por ser un cambio funcional):**
- Si el navegador no ofrece `navigator.mediaDevices` (navegadores antiguos o página servida por HTTP no seguro), `startCamera()` lanza un error antes de registrar los botones, que dejan de responder. Comportamiento heredado, verificado igual antes y después. Conviene comprobar `navigator.mediaDevices` y mostrar un aviso.
- La pantalla completa usa estilos en línea (`style.display`, `style.overflow`); en la Etapa 3 podría pasar a una clase CSS.
- Validar en un iPhone real que la cámara, el cambio de cámara y la pantalla completa siguen igual.

**Archivos modificados:** `js/realitytour.js` y `BITACORA-UX.md`. **Commit:** el que contiene esta entrada, «Etapa 1: organizar realitytour.js (cámara) sin cambiar su comportamiento».

---

## Mejora estructural — Etapa 2: organización de `main.js`

*Segunda de cinco etapas. Solo se modificó `js/main.js` (y esta bitácora). No se avanzó a la Etapa 3.*

**Problemas estructurales encontrados** (deuda técnica del 04/11, prioridad media):
- Un único `DOMContentLoaded` de ~375 líneas con todas las funcionalidades en secuencia, sin funciones que las delimitaran.
- Indentación rota a mitad del archivo: el bloque del encabezado y todo lo posterior estaban en la columna 0, porque se habían agregado como parches.
- Código muerto: `hasScrolled` (declarada y nunca usada) y la variable intermedia `body`.
- Comentarios desactualizados o de prueba:
  - «se activará cuando el 10 % sea visible», con un umbral que en realidad es 0;
  - `// ✅ CORRECTO`;
  - el comentario general de los carruseles decía que con movimiento reducido cambian «sin animación», algo que no es cierto para el RA móvil desde `ac79939`.
- `mobileQuery` se declaraba dentro del bloque del menú pero también la usaba el carrusel RA, dependencia que no se veía a simple vista.

**Organización anterior:** menú → encabezado → revelado → `reducedMotion` → visor (`lightbox`) → `initCarousel()` → carrusel RA → carrusel Servicio, todo seguido dentro del `DOMContentLoaded`.

**Organización nueva** (el mismo `DOMContentLoaded` sigue siendo el único punto de entrada, sin variables globales):

| Bloque | Contenido |
|---|---|
| Consultas compartidas | `mobileQuery` (menú y carrusel RA) y `reducedMotion` (carruseles), declaradas al comienzo con un comentario sobre quién las usa |
| `initNavigation()` | Menú hamburguesa: `setMenuOpen()`, clic del botón, cierre al elegir una opción, Escape y cierre al pasar a escritorio. Comprueba que existan el botón y el menú |
| `initHeader()` | Oculta y muestra el encabezado al desplazarse y le da fondo oscuro; `lastScrollTop` queda dentro de la función. Comprueba que exista el `header` |
| `initScrollReveal()` | `IntersectionObserver` de los elementos `.hidden` y la clase `reveal-ready` |
| `lightbox` | **Sin cambios** (ya estaba encapsulado): solo se indentó |
| `initCarousel()` | **Sin cambios**: el controlador común de los carruseles, solo se indentó |
| `initCarousels()` | Agrupa las configuraciones de «¿Qué es la RA?» y «Nuestro Servicio», copiadas sin cambios |
| Arranque | `initNavigation(); initHeader(); initScrollReveal(); initCarousels();`, en el mismo orden que antes |

**Dependencias y comportamientos preservados:**
- **Swiper sin cambios:** la configuración, los eventos, las velocidades (RA móvil 600 ms siempre; escritorio 800 ms o 0 con `reduce`; Servicio 800 ms o 0), `autoplay.waitForTransition = velocidad > 0`, los tiempos (6 s y 5 s), las condiciones de pausa (`userPaused`, `onScreen`, `mouseOver`, `keyboardUse`, `viewerOpen`), los indicadores con progreso, el botón de pausa y el visor. **Verificado por programa:** el `lightbox`, `initCarousel()` y las dos configuraciones son idénticos al original línea por línea, salvo los espacios de indentación.
- **Mismo orden de inicialización y de registro de eventos**, incluido el de los dos `change` de `mobileQuery`: primero el cierre del menú, después la velocidad del RA.
- **Pequeños cambios internos sin efecto observable:**
  - los enlaces del menú se buscan dentro del menú (`navMenu.querySelectorAll("a")`) en lugar de `.nav-links a` en toda la página; hay un solo `.nav-links` por página;
  - el umbral del encabezado se calcula con una expresión en lugar de un `if`;
  - se agregaron las comprobaciones de existencia de los elementos del menú y del `header` (presentes en las tres páginas).

**Pruebas (Chromium; misma huella de comportamiento antes y después):**
- **Huella de comportamiento:** en las 3 páginas × iPhone 13 y 1366px × con y sin `reduce` (12 combinaciones, 98 mediciones) se registraron:
  - los listeners registrados por tipo;
  - las clases de `<html>`;
  - el estado de cada Swiper (velocidad, `waitForTransition`, tiempo, vistas, efecto, bucle, indicadores, imágenes ampliables);
  - el menú móvil (abrir, Escape con foco devuelto, cierre al pasar a escritorio, cierre al elegir un enlace);
  - el encabezado en 6 posiciones de desplazamiento;
  - el revelado al cargar y al recorrer la página;
  - el visor de ambos carruseles (abrir, detener, cerrar, devolver el foco);
  - los errores JS.
  
  **Resultado: idéntico.** La única variación es la cantidad de listeners `load` en imágenes que agrega Swiper según qué imágenes terminaron de cargar; varía igual al ejecutar la versión anterior contra sí misma.
- **Escenarios táctiles** de ambos carruseles: 22/22 con `reduce` y 22/22 sin la preferencia (una corrida de cada uno).
- **Autoplay:** 5 avances seguidos del RA y 6 de Servicio, con y sin `reduce`.
- **Transición del RA móvil a 390px:** con `reduce` y sin la preferencia, unos 34 cuadros por avance (~600 ms) y 0 saltos.
- **Escritorio 1366px con `reduce`:** 5 avances, visor correcto, transiciones CSS anuladas como antes; flecha y pausa con mouse encima, correctas.
- **Cámara** de `realitytour.html` (también carga `main.js`): idéntica a la referencia de la Etapa 1.
- **Errores JS:** 0 en todas las ejecuciones.

**Riesgos y limitaciones:**
- Pruebas en Chromium con emulación; no se probó en un iPhone real en esta etapa. Conviene una verificación rápida del menú, el encabezado y ambos carruseles.
- El fallo intermitente documentado («ABIERTO · Fallo intermitente del autoplay RA en móvil tras pulsar un indicador», solo en la emulación) no apareció en estas ejecuciones. No se investigó y sigue registrado como abierto.
- `main.js` sigue siendo un solo archivo (374 líneas), por decisión del plan. Si más adelante crece con la RA, `lightbox` e `initCarousel` son los candidatos naturales para separarse.

**Archivos modificados:** `js/main.js` y `BITACORA-UX.md`. **Commit:** el que contiene esta entrada, «Etapa 2: organizar main.js por responsabilidades sin cambiar su comportamiento».

---

## Mejora estructural — Etapa 3: organización de CSS

*Tercera de cinco etapas. Solo se modificó `css/styles.css` (y esta bitácora). No se avanzó a la Etapa 4.*

**Problemas estructurales encontrados:**
- **Bloques fuera de su sección:**
  - `.biography-section`, `.bio-container` y `.bio img` estaban entre los estilos generales, lejos del resto de «¿Quiénes somos?»;
  - la base de la cámara (`#camera-section`, `.camera-container`, `#camera-stream`, marcada «SEGUNDA PAGINA») estaba antes del menú móvil, separada de su pantalla completa y de sus botones, que estaban al final del archivo;
  - contacto estaba en medio, antes de los carruseles.
- **Selectores duplicados:** `.biography-section` (dos reglas a nivel superior) y `.svc-controls` (una regla suelta con `align-items` en la zona compartida de los carruseles, además de la principal). El ícono de pausa móvil del RA y el de Servicio también estaban en la zona compartida, fuera de su sección.
- **Bloque del menú móvil** (`@media (max-width: 768px)`) con indentación rota.
- **Comentarios:** unos 30 con emojis (🔹, ✅, 📱), código viejo comentado (`/*color: blueviolet;*/`, `/*background: rgb(101, 33, 165);*/`, `/*background: transparent; …*/`), notas de prueba («antes era fixed», «antes max-width: 1200px», «AJUSTADA FINAL», «(CORREGIDA)»), encabezados duplicados («CABECERA» / «CABECERA GLOBAL») y un título desactualizado («visor coverflow»).
- **4 `!important`:** `.main-section { background }` y tres en `.contact-link`.

**Organización nueva de `styles.css`** (secciones con el mismo formato de encabezado):

| Orden | Sección |
|---|---|
| 1 | Generales, con la leyenda de puntos de corte |
| 2 | Encabezado y navegación, incluido el menú hamburguesa móvil a continuación |
| 3 | Botón principal |
| 4 | Aparición de contenido al desplazarse |
| 5 | Portada (video de fondo) |
| 6 | Carruseles: elementos compartidos |
| 7 | Visor ampliado |
| 8 | ¿Qué es la RA? |
| 9 | Nuestro Servicio |
| 10 | ¿Quiénes somos? |
| 11 | Contacto |
| 12 | Página RealityTour: cámara |

El método fue mover bloques completos por programa, sin reescribir reglas a mano, y conservar el orden relativo de las reglas que compiten entre sí.

**Selectores consolidados y reglas reubicadas:**
- **`.biography-section`:** una sola regla con todas sus declaraciones (tipografía, color, fondo, `padding: 4em 1em`, `text-align: center`). Las dos reglas anteriores tenían el mismo `padding` y no se contradecían.
- **`.svc-controls`:** `align-items: center` pasó a la regla principal. `.svc-controls .rt-pause svg` (14px) quedó en la sección de Servicio, antes del bloque ≤ 900px que lo cambia a 16px; se mantiene el orden.
- **`.ra-carousel .rt-pause svg`** (14px en ≤ 768px) pasó al bloque móvil del RA.

**Puntos de corte:** se conservaron todos, porque cada uno cumple una función. Quedan documentados al comienzo de la hoja:
- **768/769px:** móvil y escritorio;
- **769–960px:** escritorio angosto, el menú se compacta;
- **700px:** espaciado de «¿Qué es la RA?» en teléfonos;
- **900/901px:** «Nuestro Servicio» apilado o en capas;
- **1200px:** «Nuestro Servicio» más ancho.

**Swiper:** se **conserva el orden de carga actual** (`styles.css` y después `swiper-bundle.min.css`). Invertirlo cambiaría la cascada de todas las reglas que comparten especificidad con las de Swiper y obligaría a revisar cada carrusel en todos los tamaños. El beneficio sería solo simplificar unos pocos selectores (`.ra-carousel .ra-swiper .swiper-slide`, `.svc-carousel .svc-controls .rt-pagination`). Además, el orden lo define el HTML, que corresponde a la Etapa 4. Queda como deuda.

**`!important`:** se eliminaron los 4, sin efecto en el resultado:
- **`.main-section { background: none }`:** ninguna otra regla asigna fondo a esa sección.
- **`.contact-link`:** el color y `text-decoration` no compiten con otras reglas de enlaces, y en `:hover` la regla `.contact-link:hover` (0,2,0) ya gana a `.contact-link` (0,1,0) por especificidad.

Quedan 0 `!important` en `styles.css` (las dos menciones restantes están en comentarios). `larioja.css` no tenía ninguno ni requería cambios.

**Pruebas y comparaciones (Chromium; antes = `640310d`):**
- **Huella de estilos calculados** de todos los elementos y sus `::before`/`::after`, más la posición y el tamaño de cada elemento y el ancho desplazable de la página:
  - 3 páginas × 7 anchos (320, 375, 390, 430, 768, 900 y 1366px) × con y sin `reduce`;
  - estados adicionales: menú móvil abierto, visor abierto, cámara en pantalla completa y `:hover` del enlace de contacto;
  - carruseles detenidos en la misma imagen y video en el mismo cuadro.
  
  La versión anterior contra sí misma da 0 diferencias, así que la prueba es determinista. **Resultado: 0 diferencias** tras la reorganización y tras quitar los `!important`. Las únicas diferencias crudas son las URL absolutas de `background-image`, que incluyen el puerto de cada servidor de prueba: un artefacto que se normalizó.
- **Píxeles de página completa** de las 3 páginas a 390 y 1366px: **idénticos**.
- **Funcional:**
  - regresión de las 3 páginas: 0 errores JS;
  - escenarios táctiles de ambos carruseles con `reduce`: 22/22;
  - escritorio: flecha, avance y pausa con mouse encima, correctos.

**Riesgos y deuda técnica pendiente:**
- **Orden de carga de Swiper:** para evaluar en la Etapa 4, con comparación visual completa.
- **Pantalla completa de la cámara:** sigue usando estilos en línea desde `js/realitytour.js` (Etapa 1); podría pasar a una clase CSS, pero cambia JS.
- **`styles.css` sigue siendo un solo archivo** (1.583 líneas). Con las secciones ordenadas, separarlo por componentes sería sencillo si crece con la RA.
- **No se probó en un iPhone real en esta etapa.** Como los estilos calculados son idénticos, el riesgo es bajo, pero conviene una mirada rápida.

**Archivos modificados:** `css/styles.css` y `BITACORA-UX.md`. **Commit:** el que contiene esta entrada, «Etapa 3: organizar styles.css por componentes sin cambiar el diseño».
