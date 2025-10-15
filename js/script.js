document.addEventListener("DOMContentLoaded", function () {
  let currentImageIndex = 0;
  const images = document.querySelectorAll(".slider-image");
  const totalImages = images.length;

  function showNextImage() {
    images[currentImageIndex].classList.remove("active");
    currentImageIndex = (currentImageIndex + 1) % totalImages;
    images[currentImageIndex].classList.add("active");
  }

  setInterval(showNextImage, 3000); // Cambia de imagen cada 3 segundos

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

  // Funcionalidad de ocultar y mostrar menu hamburguesa e icono
  let lastScrollTop = 0; // Variable para guardar la última posición del scroll
  const nav = document.querySelector("header"); // Selecciona el header que contiene el menú

  window.addEventListener("scroll", function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
      // Desplazamiento hacia abajo
      nav.style.top = "-100px"; // Ajusta este valor según la altura de tu barra de navegación
      nav.style.background = "transparent"; // Fondo transparente al deslizar hacia abajo
    } else {
      // Desplazamiento hacia arriba
      nav.style.top = "0px";
      nav.style.background = "#111112"; // Fondo oscuro al deslizar hacia arriba
    }

    // Hacer la barra transparente en la parte superior de la página
    if (scrollTop <= 100) {
      // Ajusta este valor según sea necesario
      nav.style.background = "transparent";
    }

    lastScrollTop = scrollTop; // Guarda la nueva posición del scroll
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

  /* -------------------------------------------- SEGUNDA PAGINA */

  let currentStream = null;
  let useFrontCamera = false; // Empezamos con la cámara trasera

  // Verificar si estamos en la página realitytour.html
  if (window.location.pathname.includes("realitytour.html")) {
    const video = document.getElementById('camera-stream');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const switchCameraBtn = document.getElementById('switch-camera-btn');
    const cameraContainer = document.querySelector('.camera-container');

      // Función para detener el stream actual
    function stopCameraStream() {
    if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        currentStream = null;
      }
    }
  
    // Función para iniciar la cámara
    function startCamera() {
      const constraints = {
        video: {
          facingMode: useFrontCamera ? "user" : "environment", // Alternar entre cámara frontal y trasera
        },
      };

      // Detener la cámara si ya está en uso
      stopCameraStream();

    // Acceder a la cámara
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {
        currentStream = stream;
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.error("Error al acceder a la cámara: ", error);
      });
    }

    // Iniciar la cámara trasera por defecto al cargar la página
    startCamera();

  // Función para alternar entre la cámara frontal y la trasera
  switchCameraBtn.addEventListener('click', function () {
    useFrontCamera = !useFrontCamera; // Cambiamos entre la cámara frontal y trasera
    startCamera(); // Reiniciamos la cámara con la nueva configuración
  });

// Función para activar y desactivar pantalla completa en dispositivos móviles
  fullscreenBtn.addEventListener('click', function () {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      // Activar pantalla completa en el video
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) { // Para Safari
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) { // Para IE/Edge
        video.msRequestFullscreen();
      } else if (video.mozRequestFullScreen) { // Para Firefox
        video.mozRequestFullScreen();
      }
    } else {
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { // Para Safari
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // Para IE/Edge
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) { // Para Firefox
        document.mozCancelFullScreen();
      }
    }
  });
    
      // Detener la cámara cuando se cambia de página
  window.addEventListener("beforeunload", stopCameraStream);
    
  }

  /* -------------------------------------------- FIN DE SEGUNDA PAGINA */
/* ==== Carrusel Swiper ¿Qué es la RA? ==== */
if (document.querySelector(".ra-swiper")) {
  const swiper = new Swiper(".ra-swiper", {
    loop: true,
    loopAdditionalSlides: 10,
    centeredSlides: true,
    slidesPerView: 3,
    spaceBetween: 50,
    speed: 2000,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    freeMode: true,
    freeModeMomentum: false,
    grabCursor: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  // 🔄 Inicia autoplay estable
  swiper.autoplay.start();
}



  
});
