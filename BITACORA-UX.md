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
