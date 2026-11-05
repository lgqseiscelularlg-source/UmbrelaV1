# RealityTour — Fase 0: Auditoría técnica para el MVP académico

- **Repositorio auditado:** `lgqseiscelularlg-source/UmbrelaV1`
- **Rama auditada (oficial):** `claude/determined-hawking-1j40dk`, commit base `9bed90b` («Etapa 5: validación integral y cierre técnico de la reorganización»).
- **Fecha:** 5 de noviembre de 2026 · **Fecha objetivo:** 20 de noviembre de 2026 → **quedan 15 días corridos (≈ 11 hábiles).**
- **Alcance:** lectura de código, del historial git y de `BITACORA-UX.md`. **No se modificó código**, no se instalaron dependencias, no se crearon servicios ni se pidieron credenciales.

**Historial del informe**

| Versión | Base | Nota |
|---|---|---|
| v1 | `main` @ `ed297fe` | Primera versión. No se publicó: se hizo sobre una rama que no era la oficial. |
| **v2 (esta)** | `claude/determined-hawking-1j40dk` @ `9bed90b` | Actualizada al código vigente, incluida la reorganización en 5 etapas. Incorpora la aclaración del equipo: RA y geolocalización se desarrollan en repositorios independientes. |

**Convención**

| Etiqueta | Significado |
|---|---|
| **[HECHO]** | Verificado en el código o en el historial git (se cita archivo:línea). |
| **[BITÁCORA]** | Lo afirma `BITACORA-UX.md`; no se volvió a comprobar de forma independiente. |
| **[EQUIPO]** | Aclaración del equipo de RealityTour. |
| **[HIPÓTESIS]** | Suposición razonable, no verificable desde el repositorio. |
| **[RECOMENDACIÓN]** | Propuesta del auditor, sujeta a aprobación. |

---

## 0. Contexto y resumen ejecutivo

**Arquitectura del proyecto [EQUIPO]:**

- `UmbrelaV1` contiene la interfaz web y la apertura de cámara.
- La **realidad aumentada y la geolocalización se desarrollan en repositorios independientes** y todavía tienen trabajo pendiente antes de integrarse a UmbrelaV1. **[BITÁCORA]** La línea 3 de `BITACORA-UX.md` identifica ese repositorio como `Cloude`.
- **Por lo tanto, que no haya RA ni geolocalización en este repositorio es esperado y no es un defecto.** Este informe no exige integrarlas ahora.

**[HECHO]** En la rama oficial no hay código de RA, geolocalización, modelos GLB, base de datos, autenticación ni llamadas a APIs propias. Se buscaron `geolocation`, `getCurrentPosition`, `watchPosition`, `three`, `aframe`, `model-viewer`, `gltf`, `.glb`, `webxr`, `supabase`, `firebase` y `fetch(`, y no hubo coincidencias. Esto confirma que **la base de datos, el panel administrativo, las estadísticas y el feedback se pueden construir ahora y en paralelo**, sin tocar el trabajo de RA.

**Conclusiones principales [RECOMENDACIÓN]:**

1. **Supabase** (PostgreSQL + Auth + Storage + RLS) es la opción más adecuada para un sitio estático en GitHub Pages sin backend propio.
2. **Prioridad hasta el 20/11:** base de datos → panel admin (ABM) → feedback → estadísticas. Todo esto se puede implementar **ahora** en UmbrelaV1.
3. La futura integración de la RA se prepara con un **contrato de datos** (§5.3): la RA va a consumir los puntos turísticos y registrar sus eventos con las mismas funciones que se construyen ahora. Así la integración posterior consiste en "enchufar" la RA, sin rediseñar nada.
4. El código actual quedó bien preparado tras la reorganización. **[HECHO]** Tiene funciones `init…()` por componente (`js/main.js:11-373`) y la cámara aislada en `initCamera()` (`js/realitytour.js:6`). No hay impedimentos técnicos para agregar módulos nuevos.

---

## 1. Estado actual

### 1.1 Estructura del repositorio [HECHO]

```
UmbrelaV1/  (rama claude/determined-hawking-1j40dk)
├── index.html          279 líneas  Inicio: portada con video, «¿Qué es la RA?», «Nuestro Servicio», «¿Quiénes somos?», contacto, chatbot Botpress
├── larioja.html        322 líneas  Guía turística «Descubrí La Rioja» (contenido estático)
├── realitytour.html     76 líneas  Pantalla de cámara
├── css/styles.css    1.583 líneas  Estilos comunes, organizados en secciones por componente
├── css/larioja.css     477 líneas  Estilos acotados a .larioja-page
├── js/main.js          374 líneas  initNavigation, initHeader, initScrollReveal, initCarousels (+ visor y initCarousel)
├── js/realitytour.js    93 líneas  initCamera(): getUserMedia, cámara frontal/trasera, pantalla completa simulada
├── BITACORA-UX.md    1.443 líneas  Bitácora de UX/UI y de la reorganización
└── assets/
    ├── img/web/       8 imágenes optimizadas, en uso (≈ 1 MB)
    ├── img/larioja/   portada de La Rioja (720 y 1092 px)
    ├── img/*          imágenes originales; al menos 13 no se referencian desde HTML/CSS/JS (≈ 12,9 MB)
    └── video/hero-mobile.mp4  ≈ 12,8 MB (antes 23 MB)
```

### 1.2 Tecnologías [HECHO]

| Capa | Tecnología |
|---|---|
| Frontend | HTML5 + CSS3 + JavaScript vanilla, sin frameworks, módulos ES ni build |
| Dependencias externas | Swiper **11.2.10** fijado por CDN (`index.html:25-26`); Botpress Webchat v3.7 (`index.html:275-276`) |
| APIs del navegador | `getUserMedia` (cámara), `IntersectionObserver` |
| Backend / BD / Auth | Ninguno |
| Hosting | **[BITÁCORA]** GitHub Pages (HTTPS), según la sección «Deuda técnica clasificada» de la Etapa 5 |
| Pruebas | **[BITÁCORA]** Baterías manuales y automatizadas con Playwright/Chromium y validación en un iPhone real hecha por el equipo. No hay tests versionados en el repositorio. |

### 1.3 Funcionalidades reutilizables

| Elemento | Dónde | Reutilizable para |
|---|---|---|
| Patrón `init…()` con comprobación de que existan los elementos | `js/main.js:11,54,89,319,370-373`; `js/realitytour.js:6-90` | Agregar `initFeedback()` e `initAnalytics()` sin tocar las funciones existentes |
| Cámara aislada en `initCamera()`, que solo se ejecuta si existe el `<video>` | `js/realitytour.js:6-16`, `92` | Punto de integración de la RA futura |
| Sección vacía `#reality-content` | `realitytour.html:37` | Información del punto y botón «Calificar» cuando la RA se integre |
| Menú, encabezado y estilos unificados en las 3 páginas | `css/styles.css`, `js/main.js` | Darle la misma identidad visual al panel admin y al formulario de feedback |
| Contenido turístico curado (Castro Barros, Santo Domingo, Juan Caro, Dique Los Sauces, etc.) | `larioja.html:108-283` | **Fuente para la carga inicial** de puntos turísticos en la BD |
| Visor ampliado (lightbox) y carruseles | `js/main.js` | No aplica al MVP de datos |

### 1.4 Hallazgos de la v1: estado actualizado

| Hallazgo de la v1 (sobre `main`) | Estado en la rama oficial |
|---|---|
| La página se detectaba con `pathname.includes("realitytour.html")` | **Resuelto** [HECHO]: `initCamera()` comprueba que exista `#camera-stream` (`js/realitytour.js:15`) |
| `<script>` entre `</head>` y `<body>`; `lang="en"` | **Resuelto** [HECHO]: el script está dentro del `<head>` (`index.html:29-45`) y la página usa `lang="es"` (`index.html:2`) |
| Swiper con versión mayor sin fijar | **Resuelto** [HECHO]: versión `11.2.10` |
| Video de portada de 23 MB | **Mejorado** [HECHO]: 12,8 MB |
| Si se rechaza la cámara, el error solo se registra en la consola | **Sigue igual** [HECHO]: `js/realitytour.js:44-46`. Prioridad baja para el MVP de datos; **es importante para la integración de la RA**. |
| Cámara sin `navigator.mediaDevices` (HTTP o navegador antiguo) | **Sigue igual**; la bitácora lo registra como «mejora futura». No ocurre en GitHub Pages (HTTPS). |
| Correos y teléfonos personales publicados | **Sigue igual** [HECHO]: `index.html:253-263` |
| **Nuevo:** chatbot de terceros (Botpress) | [HECHO] `index.html:275-276`. Tiene implicancias de privacidad (§9.2). |
| **Nuevo:** imágenes originales sin uso en el repo | [HECHO] ≈ 12,9 MB que no se cargan en las páginas. Solo afectan el peso del repositorio, no a los usuarios. Prioridad baja. |

---

## 2. Brechas técnicas

| Capacidad | ¿Existe en UmbrelaV1? | ¿Es una brecha? | Qué falta |
|---|---|---|---|
| Base de datos de puntos turísticos | No | **Sí, prioritaria** | Proyecto Supabase, tablas, RLS, carga inicial |
| Panel administrativo (ABM) con login | No | **Sí, prioritaria** | `admin.html`, autenticación, autorización, validación, subida de GLB |
| Estadísticas y dashboard | No | **Sí, prioritaria** | Registro de eventos anónimos, vistas SQL, dashboard en el panel |
| Feedback | No | **Sí, prioritaria** | Formulario de estrellas + comentario, almacenamiento, resumen en el panel |
| Aviso de privacidad | No | Sí | Texto breve: qué se registra, uso del chatbot de terceros |
| RA (modelos 3D) | No | **No** [EQUIPO]: se desarrolla en otro repo | Solo definir el contrato de datos (§5.3) |
| Geolocalización | No | **No** [EQUIPO]: se desarrolla en otro repo | Ídem |
| Modelos GLB | No | Parcial | La BD y el panel deben poder guardarlos y servirlos ahora, aunque se visualicen más adelante |
| Mensaje ante permiso de cámara denegado | Parcial | Sí, al integrar la RA | Mensaje visible al usuario (§6) |

---

## 3. Evaluación tecnológica

### 3.1 Supabase [RECOMENDACIÓN: **sí, es adecuado**]

- **Compatibilidad:** el sitio es estático, en JS vanilla y sin build. `supabase-js` se carga por CDN con versión fija, igual que Swiper hoy. **No hace falta backend propio.**
- **PostgreSQL** cubre las relaciones (puntos ↔ eventos ↔ valoraciones) y las agregaciones del dashboard con SQL estándar.
- **Auth** con email y contraseña, con el registro público desactivado y los usuarios de la Secretaría creados a mano.
- **Storage** guarda los GLB y los entrega por URL pública. El repo de RA podrá consumir esa URL sin depender de UmbrelaV1.
- **RLS (Row Level Security)** permite exponer la clave `anon` en el frontend de forma segura: las políticas definen qué puede hacer cada rol. Es un argumento sólido ante el tribunal.
- Plan gratuito suficiente. **[HIPÓTESIS]** Hay que verificar los límites vigentes; los proyectos gratuitos se pausan tras un período de inactividad, así que conviene usarlo los días previos a la defensa.
- **Ventaja para la integración futura:** la BD queda como **fuente única de verdad compartida**. El repo de RA/geolocalización puede leer los mismos puntos sin pasar por UmbrelaV1.

### 3.2 Alternativas

| Alternativa | Veredicto |
|---|---|
| JSON estático en el repo | Es lo más simple para leer, pero no permite ABM, login, estadísticas ni feedback. Queda como **fallback** de solo lectura. |
| Firebase | Viable y de esfuerzo parecido; NoSQL complica las agregaciones del dashboard y las reglas son más difíciles de explicar. No es más simple. |
| Backend propio (Node/PHP + MySQL) | Requiere hosting, sesiones, subida de archivos y seguridad a mano. **Descartado** por el plazo. |
| Google Sheets / Apps Script | Débil en autenticación, validación y almacenamiento de GLB. **Descartado.** |
| Formularios de terceros (Google Forms) para el feedback | Rápido, pero no se relaciona con los puntos ni con el dashboard. **Descartado** como solución principal. |

**Conclusión:** no hay una alternativa significativamente más simple que cubra las cuatro capacidades. **Recomendación: Supabase.**

### 3.3 Tecnología de RA

**Fuera del alcance de esta fase [EQUIPO].** Solo una observación para cuando se decida la integración [RECOMENDACIÓN]: para que el contrato de §5.3 sirva, el repo de RA tendría que poder cargar un GLB **desde una URL** (no solo desde archivos del propio repo). Esa capacidad la tienen todas las bibliotecas habituales (`<model-viewer>`, three.js, A-Frame, AR.js).

---

## 4. Arquitectura mínima propuesta [RECOMENDACIÓN]

```
┌──────────────────────────── GitHub Pages (UmbrelaV1, HTTPS) ────────────────────────────┐
│ index.html / larioja.html   → sin cambios funcionales (+ acceso al feedback general)     │
│ realitytour.html            → cámara actual intacta; feedback + eventos; RA (futuro)     │
│ admin.html (nuevo)          → login · ABM de puntos · subida de GLB · dashboard           │
│ js/datos.js (nuevo)         → cliente Supabase + obtenerPuntos() + registrarEvento()      │
│                               + enviarValoracion()   ← contrato que también usará la RA  │
│ js/feedback.js (nuevo)      → initFeedback()                                              │
│ js/admin.js (nuevo)         → initAdmin(), ABM y dashboard                                │
└──────────────────────┬──────────────────────────────────────────────────────────────────┘
                       │ supabase-js (CDN, versión fija)
┌──────────────────────▼──────────────────────── Supabase ────────────────────────────────┐
│ Auth: email/contraseña · registro público desactivado                                    │
│ PostgreSQL + RLS: puntos_turisticos · eventos · valoraciones · admins · vistas           │
│ Storage: bucket "modelos" (lectura pública, escritura solo admins, solo .glb, ≤ 10 MB)   │
└──────────────────────▲──────────────────────────────────────────────────────────────────┘
                       │ (futuro) lectura de puntos y URL de GLB, registro de eventos de RA
              Repositorio de RA / geolocalización (Cloude)
```

- **Frontend:** sigue en JS vanilla con el patrón `init…()` de la bitácora. **No se modifican** `js/main.js`, `js/realitytour.js` ni los estilos existentes; solo se agregan archivos y clases nuevas.
- **Backend:** no hay uno propio. La seguridad vive en RLS.
- **Autorización:** se es admin si `auth.uid()` figura en la tabla `admins`. Estar autenticado no alcanza.
- **Validación:** en el formulario (experiencia de usuario) y con `CHECK` en PostgreSQL (fuente de verdad).
- **Botpress:** se mantiene tal como está. No interactúa con la BD.

---

## 5. Modelo de datos preliminar [RECOMENDACIÓN]

### 5.1 Tablas

```sql
admins (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id),
  nombre      text NOT NULL,
  created_at  timestamptz DEFAULT now()
)

puntos_turisticos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       text NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 120),
  descripcion  text CHECK (char_length(descripcion) <= 2000),
  latitud      double precision NOT NULL CHECK (latitud  BETWEEN -90  AND 90),
  longitud     double precision NOT NULL CHECK (longitud BETWEEN -180 AND 180),
  radio_m      integer NOT NULL DEFAULT 50 CHECK (radio_m BETWEEN 10 AND 1000), -- para la geolocalización futura
  modelo_path  text,          -- ruta en el bucket "modelos"; puede quedar vacía hasta tener el GLB
  imagen_url   text,          -- miniatura opcional (p. ej. assets/img/web/…)
  activo       boolean NOT NULL DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
)

eventos (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sesion_id   uuid NOT NULL,       -- aleatorio, guardado en sessionStorage; no identifica a la persona
  tipo        text NOT NULL CHECK (tipo IN (
                'pagina_vista','camara_abierta',          -- se pueden registrar AHORA
                'punto_visto','modelo_cargado','ra_abierta'  -- los registrará la RA AL INTEGRARSE
              )),
  pagina      text CHECK (pagina IN ('inicio','larioja','realitytour')),
  punto_id    uuid REFERENCES puntos_turisticos(id),
  created_at  timestamptz DEFAULT now()
)

valoraciones (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  punto_id    uuid REFERENCES puntos_turisticos(id),   -- NULL = valoración general de RealityTour
  estrellas   smallint NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  comentario  text CHECK (char_length(comentario) <= 500),
  sesion_id   uuid,
  created_at  timestamptz DEFAULT now()
)
```

**Relaciones:**

- `puntos_turisticos 1 ── N eventos`
- `puntos_turisticos 1 ── N valoraciones`
- `admins 1 ── 1 auth.users`

**Decisiones:**

- **Los puntos no se borran, se desactivan** (`activo = false`), para conservar el historial.
- **«Zona geográfica»:** no se guardan coordenadas del turista. La zona se deriva del **punto turístico** asociado al evento, porque cada punto ya tiene latitud y longitud. Se cumple el requisito sin almacenar ubicación personal.
- **Tipos de evento** separados en «ahora» y «al integrar la RA». El dashboard funciona desde el primer día con los primeros y se enriquece cuando lleguen los segundos.

### 5.2 Políticas RLS mínimas

| Tabla | anon (turista) | admin |
|---|---|---|
| `puntos_turisticos` | `SELECT` solo `WHERE activo` | `SELECT`, `INSERT`, `UPDATE` (sin `DELETE`) |
| `eventos` | solo `INSERT` | `SELECT` |
| `valoraciones` | solo `INSERT` | `SELECT` |
| `admins` | — | `SELECT` de la propia fila |
| Storage `modelos` | lectura | subir y reemplazar |

**Vistas para el dashboard:**

- `v_visitas_por_dia`: sesiones distintas y eventos por día
- `v_ranking_puntos`: eventos y valoraciones por punto
- `v_valoracion_promedio`: por punto y global
- `v_eventos_por_pagina`

### 5.3 Contrato de integración con la RA [RECOMENDACIÓN]

`js/datos.js` expone tres funciones. **El panel y el feedback las usan ahora; la RA las usará después**:

| Función | Devuelve / hace | Usuario ahora | Usuario futuro |
|---|---|---|---|
| `obtenerPuntos()` | Puntos activos `{id, nombre, descripcion, latitud, longitud, radio_m, modelo_url, imagen_url}`, con fallback a `puntos-fallback.json` si Supabase no responde | Selector de punto en el feedback | RA/geolocalización: elegir el punto cercano y cargar `modelo_url` |
| `registrarEvento(tipo, datos)` | Inserción en segundo plano (sin `await` bloqueante); nunca lanza errores hacia la interfaz | `pagina_vista`, `camara_abierta` | `punto_visto`, `modelo_cargado`, `ra_abierta` |
| `enviarValoracion(puntoId, estrellas, comentario)` | Valida y guarda | Formulario de feedback | Botón «Calificar este punto» en la vista de RA |

Si el repo de RA se integra como scripts dentro de `realitytour.html`, usa estas funciones directamente. Si queda como aplicación separada, lee las mismas tablas con la misma clave `anon` y queda sujeto a las mismas políticas RLS.

---

## 6. Impacto sobre la RA y la cámara

### 6.1 Ahora (MVP de datos)

| Archivo | Cambio | Riesgo |
|---|---|---|
| `js/realitytour.js` | **Ninguno** | — |
| `js/main.js`, `css/styles.css` existentes | **Ninguno** (solo se agregan archivos y clases nuevas) | — |
| `realitytour.html` | Agregar `<script>` de `js/datos.js` y `js/feedback.js` al final del `<body>`, más un botón «Calificar» en `#reality-content` | Bajo: no comparte IDs con la cámara |
| `index.html`, `larioja.html` | Opcional: enlace a «Calificar RealityTour» y registro de `pagina_vista` | Bajo |
| `admin.html`, `js/admin.js`, `js/datos.js`, `js/feedback.js`, `css/admin.css` | Nuevos | Ninguno sobre las páginas existentes |

**Prueba de regresión obligatoria:** repetir la batería de cámara de la Etapa 5 de la bitácora (trasera y frontal, pantalla completa, X, `beforeunload`) y el menú en las 3 páginas.

### 6.2 Al integrar la RA (después; no se exige ahora)

- **Punto de entrada:** `initCamera()` en `js/realitytour.js` y el contenedor `.camera-container`.
- **Preparativos recomendados al momento de integrar:**
  1. Mensaje visible si se rechaza la cámara (`js/realitytour.js:44-46`).
  2. Manejar la falta de `navigator.mediaDevices`.
  3. Resolver la convivencia de capas (`z-index`, eventos táctiles) entre la RA y los botones `.camera-btn`.
  4. Decidir si la RA reutiliza el `<video>` actual o abre su propia cámara: **no pueden abrir dos streams a la vez** en muchos móviles.
- **Riesgos:** rendimiento (cámara + WebGL), compatibilidad con iOS (sin WebXR), precisión del GPS, dependencia de la red. Se evalúan cuando el repo de RA esté listo.
- **Pruebas:** permiso de cámara y ubicación aceptado o rechazado, punto desactivado en el panel que deja de mostrarse en la RA, sin red (fallback), y un Android y un iPhone reales.

---

## 7. Plan de implementación [RECOMENDACIÓN]

### 7.1 Se puede implementar ahora en UmbrelaV1 (no depende de la RA)

Esfuerzo en horas-persona. La complejidad es B (baja), M (media) o A (alta).

| # | Tarea | Depende de | Compl. | Horas |
|---|---|---|---|---|
| **B — Base de datos (días 1–3)** |||||
| B1 | Proyecto Supabase + tablas + `CHECK` + vistas; script SQL versionado en el repo (`db/esquema.sql`) | — | M | 4 |
| B2 | Políticas RLS + bucket `modelos` + registro público desactivado + alta manual de admins | B1 | M | 4 |
| B3 | Carga inicial: 4–6 puntos tomados de `larioja.html` con sus coordenadas reales | B1 | B | 2 |
| B4 | `js/datos.js`: cliente + `obtenerPuntos()` (con `puntos-fallback.json`) | B2 | B | 3 |
| B5 | Prueba de seguridad: con la clave `anon`, intentar leer `eventos` y modificar puntos (debe fallar) | B2 | B | 1 |
| **C — Panel administrativo (días 3–7)** |||||
| C1 | `admin.html` + `js/admin.js`: login/logout, vista protegida, mensaje si el usuario no es admin | B2 | M | 4 |
| C2 | Listado + alta + edición de puntos con validación (lat/long en rango, longitudes de texto) | C1 | M | 8 |
| C3 | Activar/desactivar | C2 | B | 1 |
| C4 | Subir y reemplazar el GLB en Storage (validar extensión y tamaño) | C2 | M | 4 |
| **E — Feedback (días 5–8)** |||||
| E1 | `js/feedback.js` + `initFeedback()`: modal de 1–5 estrellas, comentario opcional, selector «RealityTour en general / punto X» | B4 | B | 4 |
| E2 | Botón de acceso en `realitytour.html` (y opcionalmente en `index.html`) | E1 | B | 1 |
| **D — Estadísticas (días 6–9)** |||||
| D1 | `registrarEvento()` + `sesion_id` en `sessionStorage` + eventos `pagina_vista` y `camara_abierta` | B4 | B | 3 |
| D2 | Dashboard en el panel: tarjetas KPI (sesiones, eventos, promedio de estrellas) + tabla de ranking + visitas por día (tabla o gráfico simple) | D1, C1 | M | 6 |
| D3 | Últimos comentarios y promedio por punto en el dashboard (render con `textContent`) | E1, D2 | B | 2 |
| **F — Cierre (días 9–11)** |||||
| F1 | Aviso de privacidad breve (eventos anónimos + chatbot de terceros) | — | B | 2 |
| F2 | Regresión: batería de la Etapa 5 + pruebas nuevas en un iPhone y un Android reales | todo | M | 5 |
| F3 | Documentación para el tribunal: arquitectura, modelo de datos, RLS, contrato de §5.3; entrada en la bitácora | todo | B | 4 |
| | **Total** | | | **≈ 58 h** |

**Paralelización:** la persona 1 toma B1–B5 → D1 → E1/E2 y la persona 2 toma C1–C4 → D2/D3. F se hace en conjunto.

**Hito de control: 12/11** con un admin capaz de crear y desactivar un punto, y una valoración enviada desde un móvil visible en el panel.

### 7.2 Dependerá de la integración de la RA (no bloquea el MVP de datos)

| # | Tarea | Depende de | Compl. | Horas (estimación gruesa) |
|---|---|---|---|---|
| R1 | Acordar con el repo de RA el formato de `obtenerPuntos()` y la forma de integración (scripts en `realitytour.html` o aplicación separada) | — | B | 1 |
| R2 | Mensajes de permisos denegados (cámara y ubicación) | R1 | B | 2 |
| R3 | La RA consume `obtenerPuntos()` y carga `modelo_url` | R1, B4, C4 | M | 4–8 |
| R4 | La RA registra `punto_visto`, `modelo_cargado` y `ra_abierta` | R3, D1 | B | 2 |
| R5 | Botón «Calificar este punto» con `punto_id` preseleccionado | R3, E1 | B | 1 |
| R6 | Pruebas de RA en dispositivos reales | R3 | M | 4 |

R1 conviene hacerla **ya** (1 h), aunque el resto espere: es lo que asegura que el MVP de datos sirva para la RA.

---

## 8. Recortes recomendados [RECOMENDACIÓN]

| Recortar / simplificar | Justificación |
|---|---|
| Integrar la RA antes del 20/11 → **opcional**; el MVP de datos se defiende solo | Aclaración del equipo; reduce el riesgo del cronograma |
| «Zona geográfica» con coordenadas del usuario → **zona = punto turístico** | Cumple el requisito sin datos personales |
| Un solo rol «admin», con altas manuales en Supabase y sin recuperación de contraseña por la interfaz | Elimina flujos de email y gestión de usuarios |
| Borrado físico → solo desactivar | Más simple y conserva el historial |
| Comentarios públicos → **solo visibles en el panel** | Evita moderar y el riesgo de contenido ofensivo |
| Dashboard con filtros y exportación → vistas fijas (últimos 30 días, ranking, promedios) | Suficiente para la Secretaría |
| Migrar `larioja.html` a la BD → **no**; queda estático | Es contenido editorial y no forma parte del ABM pedido |
| Eliminar las imágenes sin uso del repo → posponer | No afecta a los usuarios; evita cambios fuera del alcance |
| Multi-idioma, mapa, rutas, notificaciones, PWA offline, sincronización con Google Maps | Fuera del MVP (trabajo futuro) |

---

## 9. Riesgos críticos

### 9.1 Seguridad

| Riesgo | Mitigación [RECOMENDACIÓN] |
|---|---|
| **El repositorio es público** [HECHO] | En el frontend va solo la clave `anon`. La `service_role` **nunca** se sube al repositorio. |
| RLS mal configurada = base de datos abierta | RLS activa en **todas** las tablas + prueba B5 |
| «Autenticado» ≠ «admin» | Registro público desactivado + verificación contra `admins` en cada política |
| XSS en los comentarios que se muestran en el panel | Render con `textContent`, nunca con `innerHTML` |
| Spam en `eventos`/`valoraciones` (inserción anónima) | `CHECK` de longitud y valores + bloqueo de envíos repetidos en el cliente. **[HIPÓTESIS]** Se acepta como limitación conocida del MVP. |
| Archivos maliciosos o pesados en Storage | Solo `.glb`, ≤ 10 MB, escritura exclusiva de admins |
| Versiones de CDN | Fijar la versión exacta de `supabase-js`, como ya se hizo con Swiper |

### 9.2 Privacidad

- **[RECOMENDACIÓN]** No guardar IP, user-agent, email ni coordenadas del turista. Basta con un `sesion_id` aleatorio por pestaña.
- **[HIPÓTESIS]** Aplicaría la **Ley 25.326 de Protección de Datos Personales** (Argentina). Diseñar sin datos personales es la forma más simple de cumplirla.
- **[HECHO]** El chatbot **Botpress** (`index.html:275-276`) envía lo que el usuario escribe a un servicio de terceros. El aviso de privacidad (F1) debería mencionarlo.
- **[HECHO]** Correos y teléfonos personales de los integrantes publicados (`index.html:253-263`). Es decisión del equipo; queda registrado como exposición pública.
- Cuando se integre la geolocalización, la ubicación debería usarse solo en el dispositivo para elegir el punto, sin enviarse a la BD.

### 9.3 Permisos y compatibilidad móvil

- Cámara y ubicación requieren HTTPS. **[BITÁCORA]** GitHub Pages lo cumple.
- **[BITÁCORA]** La cámara, el menú y los carruseles se validaron en un iPhone real; las pruebas automatizadas se hicieron en Chromium sin Safari ni CDN. Las funciones nuevas necesitan la misma validación en un dispositivo real.
- El panel admin tiene que ser usable en móvil y escritorio, pero puede priorizar escritorio (uso de oficina).
- Supabase llega desde el móvil del turista. Con mala señal, `registrarEvento()` no debe bloquear ni mostrar errores, y el feedback debe avisar si falló el envío.

### 9.4 Cronograma y operación

- La RA en otro repositorio **reduce** el riesgo del MVP de datos, pero deja un riesgo de **integración tardía**. Mitigación: hacer R1 ahora y que el contrato (§5.3) sea simple.
- El día de la defensa se depende de Supabase (pausa por inactividad), de los CDN y de la conectividad. Mitigación: usar el proyecto el día anterior, tener el fallback JSON y llevar un video de respaldo.
- No hay tests versionados. **[BITÁCORA]** Las baterías existen pero no están en el repositorio; la regresión sigue siendo manual (tarea F2).

---

## 10. Decisiones pendientes del equipo

1. ¿Aprueban Supabase como plataforma única (BD + Auth + Storage)?
2. ¿Aprueban el modelo de datos (§5) y el contrato de integración (§5.3)?
3. ¿Cómo se integrará la RA: scripts dentro de `realitytour.html` o aplicación separada que lee la misma BD? (Tarea R1.)
4. ¿Qué 4–6 puntos turísticos forman la carga inicial, y quién consigue sus coordenadas?
5. ¿Aceptan los recortes de §8 y el hito de control del 12/11?
