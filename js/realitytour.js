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
// === MODO PANTALLA COMPLETA COMPATIBLE CON MÓVILES ===
// --- Pantalla completa (versión estable y compatible) ---
// --- Pantalla completa (versión estable y compatible y robusta) ---
(function setupFullscreen() {
  if (!fullscreenBtn) return; // si no hay botón, no hacemos nada

  // Detecta iOS (incluye iPadOS en modo desktop)
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // 1) Entrar a fullscreen al hacer click en el botón
  fullscreenBtn.addEventListener("click", () => {
    // En iOS Safari suele funcionar mejor pedir fullscreen al <video>
    const target = isIOS ? video : cameraContainer;

    try {
      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen(); // Safari
      } else if (video && video.webkitEnterFullScreen) {
        // fallback exclusivo de iOS para <video>
        video.webkitEnterFullScreen();
      }
    } catch (err) {
      console.warn("No se pudo entrar a pantalla completa:", err);
    }

    // Mostrar/ocultar botones (si existen)
    fullscreenBtn.classList.add("hidden");
    if (exitFullscreenBtn) exitFullscreenBtn.classList.remove("hidden");
  });

  // 2) Salir de fullscreen con la X (si existe)
  if (exitFullscreenBtn) {
    exitFullscreenBtn.addEventListener("click", () => {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (video && video.webkitExitFullScreen) {
          video.webkitExitFullScreen();
        }
      } catch (err) {
        console.warn("No se pudo salir de pantalla completa:", err);
      }

      fullscreenBtn.classList.remove("hidden");
      exitFullscreenBtn.classList.add("hidden");
    });
  }

  // 3) Re-sincronizar UI si el usuario sale de fullscreen manualmente (Esc/gesto)
  const syncUI = () => {
    const inFS =
      document.fullscreenElement || document.webkitFullscreenElement;
    if (inFS) {
      fullscreenBtn.classList.add("hidden");
      if (exitFullscreenBtn) exitFullscreenBtn.classList.remove("hidden");
    } else {
      fullscreenBtn.classList.remove("hidden");
      if (exitFullscreenBtn) exitFullscreenBtn.classList.add("hidden");
    }
  };

  document.addEventListener("fullscreenchange", syncUI);
  document.addEventListener("webkitfullscreenchange", syncUI);
})();


    
      // Detener la cámara cuando se cambia de página
  window.addEventListener("beforeunload", stopCameraStream);
    
  }

  /* -------------------------------------------- FIN DE SEGUNDA PAGINA */
