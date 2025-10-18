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
// Función para activar y desactivar pantalla completa en dispositivos móviles
fullscreenBtn.addEventListener('click', function () {
  cameraContainer.classList.toggle('fullscreen-mode');

  if (cameraContainer.classList.contains('fullscreen-mode')) {
    // 🔹 Modo “pantalla completa” simulado
    document.body.style.overflow = 'hidden'; // Evita desplazamiento
    document.querySelector('header').style.display = 'none'; // Oculta la barra de navegación
    fullscreenBtn.style.display = 'none'; // Oculta el botón de fullscreen
    exitFullscreenBtn.style.display = 'block'; // Muestra la X
  } else {
    // 🔹 Volver al modo normal
    document.body.style.overflow = 'auto';
    document.querySelector('header').style.display = 'block';
    fullscreenBtn.style.display = 'block'; // Vuelve a mostrar el botón
    exitFullscreenBtn.style.display = 'none'; // Oculta la X
  }
});

// 🔹 Botón X para salir del modo pantalla completa
const exitFullscreenBtn = document.createElement('button');
exitFullscreenBtn.innerHTML = '&times;';
exitFullscreenBtn.id = 'exit-fullscreen-btn';
exitFullscreenBtn.style.position = 'absolute';
exitFullscreenBtn.style.top = '10px';
exitFullscreenBtn.style.left = '10px';
exitFullscreenBtn.style.padding = '10px 15px';
exitFullscreenBtn.style.fontSize = '22px';
exitFullscreenBtn.style.color = 'white';
exitFullscreenBtn.style.backgroundColor = 'rgba(0,0,0,0.2)';
exitFullscreenBtn.style.border = 'none';
exitFullscreenBtn.style.borderRadius = '5px';
exitFullscreenBtn.style.cursor = 'pointer';
exitFullscreenBtn.style.display = 'none';
exitFullscreenBtn.style.zIndex = '10';

cameraContainer.appendChild(exitFullscreenBtn);

// Acción del botón X (salir de pantalla completa)
exitFullscreenBtn.addEventListener('click', () => {
  cameraContainer.classList.remove('fullscreen-mode');
  document.body.style.overflow = 'auto';
  document.querySelector('header').style.display = 'block';
  fullscreenBtn.style.display = 'block'; // Mostrar botón fullscreen
  exitFullscreenBtn.style.display = 'none'; // Ocultar X
});


    
      // Detener la cámara cuando se cambia de página
  window.addEventListener("beforeunload", stopCameraStream);
    
  }

  /* -------------------------------------------- FIN DE SEGUNDA PAGINA */
