document.addEventListener("DOMContentLoaded", function () {

  // Funcionalidad del menú hamburguesa
  const navLinks = document.querySelectorAll(".nav-links a"); // Selecciona todos los enlaces del menú
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-links");

  menuToggle.addEventListener("click", function () {
    navMenu.classList.toggle("active");
  });

  // Cierra el menú al seleccionar una opción
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active"); // Remueve la clase 'active' para cerrar el menú
    });
  });

  // ============================ NAVBAR OCULTA / MUESTRA EN SCROLL ============================
let lastScrollTop = 0;
const header = document.querySelector("header");
const body = document.body;

// Detectar si estamos en la página RealityTour
const isRealityTourPage = body.classList.contains("realitytour-page");

window.addEventListener("scroll", function () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowWidth = window.innerWidth;

  // === UMBRAL DE SCROLL PERSONALIZADO ===
  let scrollThreshold = 100; // valor por defecto para escritorio

  // Si es versión móvil y estamos en la página RealityTour
  if (isRealityTourPage && windowWidth <= 768) {
    scrollThreshold = 30; // 🔹 Oculta más rápido el header
  }

  // Ocultar al bajar
  if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
    header.style.transform = "translateY(-100%)";
  }
  // Mostrar al subir
  else {
    header.style.transform = "translateY(0)";
  }

  // Fondo transparente al inicio
  if (scrollTop <= 100) {
    header.style.backgroundColor = "transparent";
  } else {
    header.style.backgroundColor = "#111112";
  }

  lastScrollTop = scrollTop;
});



  // Comportamiento del contenido al deslizar por primera vez hacia abajo

  let hasScrolled = false;
  const elements = document.querySelectorAll(".hidden");

  // Configuración del Intersection Observer
  const observerOptions = {
    threshold: 0.1, // Se activará cuando el 10% del elemento sea visible
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
  
/* ==== Carrusel Swiper ¿Qué es la RA? ==== ------------------------------------------------------------------*/
if (document.querySelector(".ra-swiper")) {
  const swiper = new Swiper(".ra-swiper", {
    loop: true,
    centeredSlides: true,
    slidesPerView: "auto",
    spaceBetween: 60,
    speed: 1200,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    effect: "coverflow",
    coverflowEffect: {
      rotate: 0,          // no rotamos
      stretch: 0,         // sin estirar
      depth: 180,         // profundidad del efecto
      modifier: 2,        // intensidad del escalado
      slideShadows: false // evita sombras duras
    },
    breakpoints: {
      0: {
        slidesPerView: 1.1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2.5,
        spaceBetween: 40,
      },
      1200: {
        slidesPerView: 3,
        spaceBetween: 60,
      },
    },
  });

  swiper.autoplay.start();
}

/* ==== Slider suave en "Nuestro Servicio" ==== --------------------------------------------------------*/
const slides = document.querySelectorAll(".service-slider .slide");
let currentSlide = 0;

if (slides.length > 0) {
  setInterval(() => {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
  }, 4000); // cambia cada 4 segundos
}


  
});
