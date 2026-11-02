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
// - Con prefers-reduced-motion: reduce empieza pausado y sin animación de transición;
//   las imágenes siguen disponibles con los controles.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function initCarousel(root, { speed, onSlideChange, renderBullet, ...swiperOptions }) {
  const pauseButton = root.querySelector(".rt-pause");
  const pagination = root.querySelector(".rt-pagination");
  let userPaused = reducedMotion.matches;
  let onScreen = false;
  let interacting = false;

  const swiper = new Swiper(root.querySelector(".swiper"), {
    ...swiperOptions,
    loop: true,
    speed: reducedMotion.matches ? 0 : speed,
    autoplay: { delay: Number(root.dataset.delay) || 6000, disableOnInteraction: false },
    navigation: { prevEl: root.querySelector(".rt-prev"), nextEl: root.querySelector(".rt-next") },
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
        if (onSlideChange) onSlideChange(s);
      },
    },
  });

  function markCurrentBullet(s) {
    pagination.querySelectorAll(".rt-dot").forEach((dot, i) => {
      if (i === s.realIndex) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function sync() {
    const run = !userPaused && onScreen && !interacting;
    if (run && !swiper.autoplay.running) swiper.autoplay.start();
    if (!run && swiper.autoplay.running) swiper.autoplay.stop();
    if (!run) pagination.style.setProperty("--rt-progress", "0");
    root.classList.toggle("is-paused", userPaused);
    pauseButton.setAttribute("aria-label", userPaused ? "Reanudar avance automático" : "Pausar avance automático");
  }

  pauseButton.addEventListener("click", () => {
    userPaused = !userPaused;
    sync();
  });

  // Puntero encima o foco de teclado dentro: se detiene mientras dure (al salir, el tiempo empieza completo).
  // Solo el foco de teclado (:focus-visible) cuenta: un clic con el mouse también enfoca el botón y no
  // debe dejar el carrusel detenido.
  const keyboardFocusInside = () => !!root.querySelector(":focus-visible");
  root.addEventListener("mouseenter", () => { interacting = true; sync(); });
  root.addEventListener("mouseleave", () => { interacting = keyboardFocusInside(); sync(); });
  root.addEventListener("focusin", () => { interacting = root.matches(":hover") || keyboardFocusInside(); sync(); });
  root.addEventListener("keydown", () => { interacting = true; sync(); });
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) { interacting = root.matches(":hover"); sync(); }
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
    userPaused = event.matches;
    sync();
  });

  markCurrentBullet(swiper);
  if (onSlideChange) onSlideChange(swiper);
  sync();
  return swiper;
}

/* ==== Carrusel coverflow «¿Qué es la RA?» ==== */
const raCarousel = document.querySelector(".ra-carousel");
if (raCarousel) {
  const captionNum = document.querySelector(".ra-caption-num");
  const captionText = document.querySelector(".ra-caption-text");
  initCarousel(raCarousel, {
    effect: "coverflow",
    centeredSlides: true,
    slidesPerView: "auto",
    grabCursor: true,
    speed: 900,
    coverflowEffect: { rotate: 24, stretch: 0, depth: 180, modifier: 1, slideShadows: false },
    // Leyenda visible de la imagen activa (data-caption, independiente del alt)
    onSlideChange(swiper) {
      const slide = swiper.slides[swiper.activeIndex];
      const total = String(swiper.slides.length).padStart(2, "0");
      captionNum.textContent = `${String(swiper.realIndex + 1).padStart(2, "0")} / ${total}`;
      captionText.textContent = slide ? slide.dataset.caption : "";
    },
  });
}

// Movimiento reducido para el slider de «Nuestro Servicio» (se reemplaza en su propio rediseño)
/* ==== Slider suave en "Nuestro Servicio" ==== --------------------------------------------------------*/
const slides = document.querySelectorAll(".service-slider .slide");
let currentSlide = 0;

let serviceTimer = null;

function syncServiceSlider() {
  if (reducedMotion.matches) {
    clearInterval(serviceTimer);
    serviceTimer = null;
  } else if (!serviceTimer) {
    serviceTimer = setInterval(() => {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }, 4000); // cambia cada 4 segundos
  }
}

if (slides.length > 0) {
  syncServiceSlider();
  reducedMotion.addEventListener("change", syncServiceSlider);
}


  
});
