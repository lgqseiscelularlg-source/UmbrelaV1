// ================================
// RealityTour – Interfaz Optimizada (JS)
// ================================
document.addEventListener("DOMContentLoaded", function () {
  /* --------------------------------------------
     SLIDER AUTOMÁTICO (SECCIÓN RA)
  -------------------------------------------- */
  let currentImageIndex = 0;
  const images = document.querySelectorAll(".slider-image");
  const totalImages = images.length;

  function showNextImage() {
    images[currentImageIndex].classList.remove("active");
    currentImageIndex = (currentImageIndex + 1) % totalImages;
    images[currentImageIndex].classList.add("active");
  }
  if (images.length > 0) {
    setInterval(showNextImage, 3000);
  }

  /* --------------------------------------------
     MENÚ HAMBURGUESA
  -------------------------------------------- */
  const navLinks = document.querySelectorAll(".nav-links a");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-links");

  menuToggle.addEventListener("click", function () {
    navMenu.classList.toggle("active");
  });

  // Cierra el menú al seleccionar una opción
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });

  /* --------------------------------------------
     EFECTO SCROLL: ocultar/mostrar header + BLUR
  -------------------------------------------- */
  const header = document.querySelector("header");
  let lastScrollTop = 0;
  let ticking = false;

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 1. Mostrar/ocultar al deslizar
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          // Bajando
          header.style.top = "-100px";
        } else {
          // Subiendo
          header.style.top = "0";
        }

        // 2. Controlar el fondo blur dinámico
        if (scrollTop <= 100) {
          header.classList.remove("scrolled-up");
          header.style.background = "transparent";
          header.style.backdropFilter = "blur(0px)";
        } else {
          header.classList.add("scrolled-up");
        }

        lastScrollTop = scrollTop;
        ticking = false;
      });
      ticking = true;
    }
  });

  /* --------------------------------------------
     EFECTO DE APARICIÓN EN SCROLL
  -------------------------------------------- */
  const elements = document.querySelectorAll(".hidden");
  const observerOptions = { threshold: 0.1 };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach((el) => observer.observe(el));

  /* --------------------------------------------
     CONFIGURACIÓN PARA SEGUNDA PÁGINA (realitytour.html)
  -------------------------------------------- */
  let currentStream = null;
  let useFrontCamera = false;

  if (window.location.pathname.includes("realitytour.html")) {
    const video = document.getElementById("camera-stream");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const switchCameraBtn = document.getElementById("switch-camera-btn");

    function stopCameraStream() {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        currentStream = null;
      }
    }

    function startCamera() {
      const constraints = {
        video: {
          facingMode: useFrontCamera ? "user" : "environment",
        },
      };

      stopCameraStream();

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          currentStream = stream;
          video.srcObject = stream;
        })
        .catch((error) => {
          console.error("Error al acceder a la cámara: ", error);
        });
    }

    startCamera();

    switchCameraBtn.addEventListener("click", function () {
      useFrontCamera = !useFrontCamera;
      startCamera();
    });

    fullscreenBtn.addEventListener("click", function () {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (video.requestFullscreen) video.requestFullscreen();
        else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
        else if (video.msRequestFullscreen) video.msRequestFullscreen();
        else if (video.mozRequestFullScreen) video.mozRequestFullScreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      }
    });

    window.addEventListener("beforeunload", stopCameraStream);
  }
});
