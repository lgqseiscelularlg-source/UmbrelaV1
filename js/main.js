document.addEventListener("DOMContentLoaded", function () {

  // Funcionalidad del menú hamburguesa
  const navLinks = document.querySelectorAll(".nav-links a"); // Selecciona todos los enlaces del menú
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-links");

  // Abre o cierra el menú y sincroniza ícono (X), atributos ARIA y bloqueo de scroll
  function setMenuOpen(open) {
    navMenu.classList.toggle("active", open);
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.documentElement.classList.toggle("menu-open", open);
  }

  menuToggle.addEventListener("click", function () {
    setMenuOpen(!navMenu.classList.contains("active"));
  });

  // Cierra el menú al seleccionar una opción
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
    });
  });

  // Cierra el menú con Escape y devuelve el foco al botón
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenu.classList.contains("active")) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  // Si se pasa a escritorio (rotación o redimensión) con el menú abierto, se cierra
  // para no dejar el scroll bloqueado
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) setMenuOpen(false);
  });

  // ============================ NAVBAR OCULTA / MUESTRA EN SCROLL ============================
let lastScrollTop = 0;
const header = document.querySelector("header");
const body = document.body;
const isRealityTourPage = body.classList.contains("realitytour-page");

window.addEventListener("scroll", function () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth; // ✅ CORRECTO
  const isMobile = windowWidth <= 768;
  const nearBottom = scrollTop + windowHeight >= scrollHeight - 10; // casi al final

  // Umbral de desplazamiento
  let scrollThreshold = 100;

  // Solo en móvil + realitytour.html => ocultar más rápido
  if (isRealityTourPage && isMobile) {
    scrollThreshold = 30;
  }

  // Evitar rebote al final de la página
  if (isRealityTourPage && nearBottom) {
    return; // No hacemos nada si está al final
  }

  // Ocultar al bajar (clase en lugar de estilo inline; ver header.header-oculto en styles.css)
  if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
    header.classList.add("header-oculto");
  }
  // Mostrar al subir
  else if (scrollTop < lastScrollTop - 10 && !nearBottom) {
    header.classList.remove("header-oculto");
  }

  // Fondo transparente al inicio, oscuro al desplazarse (header.scrolled)
  header.classList.toggle("scrolled", scrollTop > 100);

  lastScrollTop = scrollTop;
});




  // Comportamiento del contenido al deslizar por primera vez hacia abajo

  let hasScrolled = false;
  const elements = document.querySelectorAll(".hidden");

  // Configuración del Intersection Observer
  const observerOptions = {
    threshold: 0, // Se activará cuando el 10% del elemento sea visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Cuando el elemento entra en la vista
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Deja de observar el elemento una vez que es visible
      }
    });
  }, observerOptions);

  // Aplicar el Observer a cada elemento con la clase .hidden
  elements.forEach((el) => {
    observer.observe(el);
  });
  // Revelado listo: <head> ya no necesita mostrar todo como respaldo (ver index.html)
  document.documentElement.classList.add("reveal-ready");
  
// ==== Carruseles («¿Qué es la RA?» y «Nuestro Servicio») =================================
// - Avance automático por defecto (data-delay en el contenedor .rt-carousel).
// - El botón de pausa es persistente: solo el usuario lo reanuda.
// - Navegar a mano reinicia el tiempo completo (sin cambios inmediatos inesperados).
// - Se detiene mientras no está en pantalla o tiene el puntero o el foco del teclado.
// - Con prefers-reduced-motion: reduce el avance automático continúa (decisión de producto) pero sin
//   animación: las imágenes cambian sin desplazamiento ni movimiento 3D. La pausa sigue disponible.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// ==== Visor ampliado (lightbox), único para ambos carruseles ===============================
// <dialog> nativo: es modal, cierra con Escape y mantiene el foco dentro. Se cierra también con la X
// o tocando fuera de la imagen. Bloquea el desplazamiento de la página y devuelve el foco al cerrar.
const lightbox = (() => {
  let dialog = null;
  let image = null;
  let opener = null;
  let onClose = null;

  // Se crea la primera vez que se abre (las páginas sin carruseles no lo incluyen)
  function create() {
    dialog = document.createElement("dialog");
    dialog.className = "rt-lightbox";
    dialog.setAttribute("aria-label", "Imagen ampliada");
    dialog.innerHTML =
      '<button type="button" class="rt-lightbox-close" aria-label="Cerrar imagen ampliada" autofocus>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line>' +
      '<line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
      '<img class="rt-lightbox-img" alt="">';
    document.body.appendChild(dialog);
    image = dialog.querySelector(".rt-lightbox-img");

    dialog.addEventListener("click", (event) => {
      if (event.target !== image) dialog.close(); // X o cualquier punto fuera de la imagen
    });
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("rt-lightbox-open");
      if (opener) opener.focus({ preventScroll: true });
      if (onClose) onClose();
      opener = onClose = null;
    });
  }

  return {
    open(source, trigger, closed) {
      if (!dialog) create();
      const width = source.naturalWidth || Number(source.getAttribute("width"));
      const height = source.naturalHeight || Number(source.getAttribute("height"));
      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      image.style.setProperty("--ar", (width / height).toFixed(4)); // proporción original, sin recortes
      opener = trigger;
      onClose = closed;
      document.documentElement.classList.add("rt-lightbox-open");
      dialog.showModal();
    },
  };
})();

function initCarousel(root, { speed, onSlideChange, renderBullet, zoom, ...swiperOptions }) {
  const pauseButton = root.querySelector(".rt-pause");
  const pagination = root.querySelector(".rt-pagination");
  let userPaused = false;
  let onScreen = false;
  let mouseOver = false;   // solo puntero de mouse real (no toques)
  let keyboardUse = false; // foco de teclado (:focus-visible) o teclas dentro del carrusel
  let viewerOpen = false;  // visor ampliado abierto desde este carrusel

  const swiper = new Swiper(root.querySelector(".swiper"), {
    ...swiperOptions,
    loop: true,
    speed: reducedMotion.matches ? 0 : speed,
    // waitForTransition: Swiper pausa el autoplay en cada cambio y lo reanuda con el «transitionend» del
    // contenedor. Con velocidad 0 (movimiento reducido) y efectos fade/creative ese evento nunca llega,
    // y el autoplay quedaba pausado para siempre tras el primer avance. Sin animación no hay que esperar.
    autoplay: { delay: Number(root.dataset.delay) || 6000, disableOnInteraction: false, waitForTransition: !reducedMotion.matches },
    // Flechas y botón de pausa son opcionales (no todos los carruseles los muestran)
    navigation: { prevEl: root.querySelector(".rt-prev"), nextEl: root.querySelector(".rt-next"), enabled: !!root.querySelector(".rt-next") },
    pagination: {
      el: pagination,
      clickable: true,
      bulletClass: "rt-dot",
      bulletActiveClass: "is-active",
      renderBullet: renderBullet || ((index, className) =>
        `<button type="button" class="${className}" aria-label="Ir a la imagen ${index + 1}"><i></i></button>`),
    },
    a11y: {
      prevSlideMessage: "Imagen anterior",
      nextSlideMessage: "Imagen siguiente",
      paginationBulletMessage: "Ir a la imagen {{index}}",
      slideLabelMessage: "Imagen {{index}} de {{slidesLength}}",
      itemRoleDescriptionMessage: "diapositiva",
    },
    on: {
      // Progreso del indicador activo (solo se actualiza el contenedor de indicadores)
      autoplayTimeLeft(s, timeLeft, progress) {
        pagination.style.setProperty("--rt-progress", (1 - progress).toFixed(3));
      },
      slideChange(s) {
        markCurrentBullet(s);
        markZoomTargets(s);
        if (onSlideChange) onSlideChange(s);
      },
    },
  });

  // Imagen activa ampliable también con teclado (Enter o Espacio); las demás quedan fuera del orden de foco
  function markZoomTargets(s) {
    if (!zoom) return;
    s.slides.forEach((slide, i) => {
      const target = slide.querySelector(zoom) || slide;
      target.tabIndex = i === s.activeIndex ? 0 : -1;
    });
  }

  // Al cerrar, el foco vuelve a la imagen; el carrusel queda como estaba según cómo se abrió el visor
  // (con teclado sigue detenido mientras el foco esté dentro; con toque o clic se reanuda).
  function openViewer(target, viaKeyboard = false) {
    viewerOpen = true;
    sync();
    lightbox.open(target.matches("img") ? target : target.querySelector("img"), target, () => {
      viewerOpen = false;
      keyboardUse = viaKeyboard;
      sync();
    });
  }

  if (zoom) {
    root.querySelectorAll(`.swiper-slide`).forEach((slide) => {
      const target = slide.querySelector(zoom) || slide;
      const image = target.matches("img") ? target : target.querySelector("img");
      target.setAttribute("role", "button");
      target.setAttribute("aria-label", `Ampliar imagen: ${image.alt}`);
      // Se abre con el «click» nativo (último evento de un toque): Swiper lo cancela si hubo arrastre,
      // así que deslizar no abre el visor; abrir antes (p. ej. en «tap») dejaba que el click de
      // compatibilidad del mismo toque cayera sobre el visor y lo cerrara.
      target.addEventListener("click", () => {
        if (swiper.allowClick && slide === swiper.slides[swiper.activeIndex]) openViewer(target);
      });
      target.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openViewer(target, true);
        }
      });
    });
  }

  function markCurrentBullet(s) {
    pagination.querySelectorAll(".rt-dot").forEach((dot, i) => {
      if (i === s.realIndex) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function sync() {
    const run = !userPaused && onScreen && !mouseOver && !keyboardUse && !viewerOpen;
    if (run && !swiper.autoplay.running) swiper.autoplay.start();
    if (!run && swiper.autoplay.running) swiper.autoplay.stop();
    if (!run) pagination.style.setProperty("--rt-progress", "0");
    root.classList.toggle("is-paused", userPaused);
    if (pauseButton) pauseButton.setAttribute("aria-label", userPaused ? "Reanudar avance automático" : "Pausar avance automático");
  }

  if (pauseButton) pauseButton.addEventListener("click", () => {
    userPaused = !userPaused;
    sync();
  });

  // Mouse encima o uso de teclado dentro: se detiene mientras dure (al salir, el tiempo empieza completo).
  // Los toques NO cuentan: en pantallas táctiles el navegador emula mouseenter y deja :hover activo
  // sin un mouseleave confiable, lo que dejaba el carrusel detenido para siempre en iPhone.
  // Tampoco cuenta el foco que deja un clic con el mouse: solo el foco de teclado (:focus-visible).
  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") { mouseOver = true; sync(); }
  });
  root.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") { mouseOver = false; sync(); }
  });
  root.addEventListener("focusin", () => { keyboardUse = !!root.querySelector(":focus-visible"); sync(); });
  root.addEventListener("keydown", () => { keyboardUse = true; sync(); });
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) { keyboardUse = false; sync(); }
  });

  // Fuera de pantalla: se detiene
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    }, { threshold: 0.25 }).observe(root);
  } else {
    onScreen = true;
  }

  reducedMotion.addEventListener("change", (event) => {
    swiper.params.speed = event.matches ? 0 : speed;
    swiper.params.autoplay.waitForTransition = !event.matches;
    sync();
  });

  markCurrentBullet(swiper);
  markZoomTargets(swiper);
  if (onSlideChange) onSlideChange(swiper);
  sync();
  return swiper;
}

/* ==== Carrusel «¿Qué es la RA?» ==== */
const raCarousel = document.querySelector(".ra-carousel");
if (raCarousel) {
  const captionNum = document.querySelector(".ra-caption-num");
  const captionText = document.querySelector(".ra-caption-text");
  initCarousel(raCarousel, {
    // Desplazamiento horizontal estándar de Swiper (sin giros ni perspectiva) en bucle con las 6 imágenes:
    // - móvil: 1,6 por vista → central completa y una lateral asomando a cada lado (3 visibles);
    // - escritorio: 3 por vista en un contenedor del 60 % del ancho (styles.css) → se ven 2 anteriores,
    //   la central y 2 siguientes. Con 6 imágenes el bucle centrado de Swiper no admite más de 3 por vista;
    //   la sexta queda fuera de la pantalla y es la que el bucle cambia de lado, sin saltos visibles.
    // La central destacada y las laterales más chicas y atenuadas son solo CSS (escala y capa oscura).
    centeredSlides: true,
    slidesPerView: 1.6,
    spaceBetween: 12,
    grabCursor: true,
    speed: 800, // igual a la transición de escala en styles.css (.ra-swiper .swiper-slide)
    breakpoints: { 769: { slidesPerView: 3, spaceBetween: 20 } },
    zoom: ".ra-frame",
    // Leyenda visible de la imagen activa (data-caption, independiente del alt)
    onSlideChange(swiper) {
      const slide = swiper.slides[swiper.activeIndex];
      const total = String(swiper.slides.length).padStart(2, "0");
      captionNum.textContent = `${String(swiper.realIndex + 1).padStart(2, "0")} / ${total}`;
      captionText.textContent = slide ? slide.dataset.caption : "";
    },
  });
}

/* ==== Showcase «Nuestro Servicio» (fundido; miniaturas como indicadores en escritorio) ==== */
const svcCarousel = document.querySelector(".svc-carousel");
if (svcCarousel) {
  const thumbs = [...svcCarousel.querySelectorAll(".swiper-slide img")].map((img) => img.getAttribute("src"));
  initCarousel(svcCarousel, {
    effect: "fade",
    fadeEffect: { crossFade: true },
    speed: 800,
    zoom: "img",
    renderBullet: (index, className) =>
      `<button type="button" class="${className}" aria-label="Ir a la imagen ${index + 1}">` +
      `<img src="${thumbs[index]}" alt="" loading="lazy" width="74" height="52"><i></i></button>`,
  });
}

});
