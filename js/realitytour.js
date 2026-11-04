/* ==== Cámara de realitytour.html ====
   Este archivo se carga al final del <body>, así que los elementos de la cámara ya existen.
   Todo queda dentro de una función para no crear variables globales. */
(function () {
  // Inicializa la cámara y sus botones
  function initCamera() {
    const video = document.getElementById("camera-stream");
    const cameraContainer = document.querySelector(".camera-container");
    const switchCameraBtn = document.getElementById("switch-camera-btn");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const exitFullscreenBtn = document.getElementById("exit-fullscreen-btn"); // la X para salir
    const header = document.querySelector("header");

    // Comprueba que la cámara esté en la página (si no, no hace nada)
    if (!video) return;

    let currentStream = null;
    let useFrontCamera = false; // empieza con la cámara trasera

    // Detiene la cámara que esté en uso
    function stopCameraStream() {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        currentStream = null;
      }
    }

    // Enciende la cámara elegida (frontal o trasera)
    function startCamera() {
      const constraints = {
        video: {
          facingMode: useFrontCamera ? "user" : "environment",
        },
      };

      stopCameraStream();

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
          currentStream = stream;
          video.srcObject = stream;
        })
        .catch(function (error) {
          console.error("Error al acceder a la cámara: ", error);
        });
    }

    // Pantalla completa simulada: oculta la barra de navegación y muestra la X para salir
    function enterFullscreen() {
      cameraContainer.classList.add("fullscreen-mode");
      document.body.style.overflow = "hidden"; // evita el desplazamiento
      header.style.display = "none";
      fullscreenBtn.style.display = "none";
      exitFullscreenBtn.style.display = "block";
    }

    // Vuelve a la vista normal
    function exitFullscreen() {
      cameraContainer.classList.remove("fullscreen-mode");
      document.body.style.overflow = "auto";
      header.style.display = "block";
      fullscreenBtn.style.display = "block";
      exitFullscreenBtn.style.display = "none";
    }

    // Al cargar la página arranca con la cámara trasera
    startCamera();

    // Cambia entre la cámara frontal y trasera
    if (switchCameraBtn) {
      switchCameraBtn.addEventListener("click", function () {
        useFrontCamera = !useFrontCamera;
        startCamera();
      });
    }

    // Activa o desactiva la vista de pantalla completa
    if (cameraContainer && fullscreenBtn && exitFullscreenBtn && header) {
      fullscreenBtn.addEventListener("click", function () {
        if (cameraContainer.classList.contains("fullscreen-mode")) exitFullscreen();
        else enterFullscreen();
      });

      exitFullscreenBtn.addEventListener("click", exitFullscreen);
    }

    // Apaga la cámara al salir de la página
    window.addEventListener("beforeunload", stopCameraStream);
  }

  initCamera();
})();
