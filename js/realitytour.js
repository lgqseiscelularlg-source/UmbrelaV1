 /* -------------------------------------------- SEGUNDA PAGINA */

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Verificar si estamos en la página realitytour.html
  if (!window.location.pathname.includes("realitytour.html")) return;

  console.log("Cargando configuración de cámara...");

  let currentStream = null;
  let useFrontCamera = false; // Inicia con la cámara trasera

  const video = document.getElementById("camera-stream");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const switchCameraBtn = document.getElementById("switch-camera-btn");
  const exitFullscreenBtn = document.getElementById("exit-fullscreen-btn");
  const cameraContainer = document.querySelector(".camera-container");

  // --- Si algún elemento no existe, no continuar ---
  if (!video || !fullscreenBtn || !switchCameraBtn || !cameraContainer) {
    console.warn("No se encontraron los elementos de cámara.");
    return;
  }

  // --- Detener la cámara actual ---
  function stopCameraStream() {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      currentStream = null;
    }
  }

  // --- Iniciar la cámara ---
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

        // Configuración adicional para evitar íconos de control en iOS
        video.removeAttribute("controls");
        video.setAttribute("playsinline", "true");
        video.setAttribute("autoplay", "true");
        video.muted = true;
      })
      .catch((error) => {
        console.error("Error al acceder a la cámara:", error);
      });
  }

  // Iniciar cámara trasera al cargar la página
  startCamera();

  // --- Alternar cámara frontal / trasera ---
  switchCameraBtn.addEventListener("click", () => {
    useFrontCamera = !useFrontCamera;
    startCamera();
  });

  // --- Pantalla completa (versión estable y compatible) ---
  if (fullscreenBtn && exitFullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      const elem = cameraContainer;

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(); // Safari
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen(); // IE/Edge
      }

      fullscreenBtn.classList.add("hidden");
      exitFullscreenBtn.classList.remove("hidden");
    });

    exitFullscreenBtn.addEventListener("click", () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }

      fullscreenBtn.classList.remove("hidden");
      exitFullscreenBtn.classList.add("hidden");
    });
  }

  // --- Detener cámara al salir de la página ---
  window.addEventListener("beforeunload", stopCameraStream);

  console.log("Configuración de cámara lista.");
});

/* -------------------------------------------- FIN DE SEGUNDA PAGINA */

