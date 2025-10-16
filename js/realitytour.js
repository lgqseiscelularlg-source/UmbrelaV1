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
fullscreenBtn.addEventListener('click', function () {
  cameraContainer.classList.toggle('fullscreen-mode');

  if (cameraContainer.classList.contains('fullscreen-mode')) {
    // 🔹 Modo “pantalla completa” simulado
    document.body.style.overflow = 'hidden'; // Evita desplazamiento
    document.querySelector('header').style.display = 'none'; // Oculta la barra de navegación
    fullscreenBtn.textContent = "Salir de Pantalla Completa";
  } else {
    // 🔹 Volver al modo normal
    document.body.style.overflow = 'auto';
    document.querySelector('header').style.display = 'block';
    fullscreenBtn.textContent = "Pantalla Completa";
  }
});

    
      // Detener la cámara cuando se cambia de página
  window.addEventListener("beforeunload", stopCameraStream);
    
  }

  /* -------------------------------------------- FIN DE SEGUNDA PAGINA */
