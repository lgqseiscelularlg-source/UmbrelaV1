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
if (fullscreenBtn && exitFullscreenBtn) {
  fullscreenBtn.addEventListener("click", () => {
    const elem = cameraContainer;

    // Entrar en pantalla completa
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(); // Safari
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen(); // IE/Edge
    }

    // Oculta botón fullscreen y muestra la X
    fullscreenBtn.classList.add("hidden");
    exitFullscreenBtn.classList.remove("hidden");
  });

  exitFullscreenBtn.addEventListener("click", () => {
    // Salir de pantalla completa
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    // Muestra botón fullscreen y oculta la X
    fullscreenBtn.classList.remove("hidden");
    exitFullscreenBtn.classList.add("hidden");
  });

  // Detectar si el usuario sale de fullscreen manualmente (Android / iOS)
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      fullscreenBtn.classList.remove("hidden");
      exitFullscreenBtn.classList.add("hidden");
    }
  });

  document.addEventListener("webkitfullscreenchange", () => {
    if (!document.webkitFullscreenElement) {
      fullscreenBtn.classList.remove("hidden");
      exitFullscreenBtn.classList.add("hidden");
    }
  });
}


    
      // Detener la cámara cuando se cambia de página
  window.addEventListener("beforeunload", stopCameraStream);
    
  }

  /* -------------------------------------------- FIN DE SEGUNDA PAGINA */
