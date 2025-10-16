/* -------------------------------------------- SEGUNDA PAGINA */

document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("realitytour.html")) return;

  let currentStream = null;
  let useFrontCamera = false;

  const video = document.getElementById("camera-stream");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const switchCameraBtn = document.getElementById("switch-camera-btn");
  const exitFullscreenBtn = document.getElementById("exit-fullscreen-btn");
  const cameraContainer = document.querySelector(".camera-container");

  if (!video || !cameraContainer) return;

  // Detener stream actual
  function stopCameraStream() {
    if (currentStream) {
      currentStream.getTracks().forEach((t) => t.stop());
      currentStream = null;
    }
  }

  // Iniciar cámara
  function startCamera() {
    const constraints = { video: { facingMode: useFrontCamera ? "user" : "environment" } };

    stopCameraStream();

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        currentStream = stream;
        video.srcObject = stream;
        video.removeAttribute("controls");
        video.setAttribute("playsinline", "true");
        video.muted = true;
      })
      .catch((err) => console.error("Error al acceder a la cámara:", err));
  }

  startCamera();

  // Cambiar cámara
  switchCameraBtn.addEventListener("click", () => {
    useFrontCamera = !useFrontCamera;
    startCamera();
  });

  // Pantalla completa (modo estable)
  fullscreenBtn.addEventListener("click", () => {
    const elem = cameraContainer;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();

    cameraContainer.classList.add("fullscreen-mode");
    fullscreenBtn.classList.add("hidden");
    exitFullscreenBtn.classList.remove("hidden");
  });

  // Salir de pantalla completa
  exitFullscreenBtn.addEventListener("click", () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();

    cameraContainer.classList.remove("fullscreen-mode");
    fullscreenBtn.classList.remove("hidden");
    exitFullscreenBtn.classList.add("hidden");
  });

  // Al salir de fullscreen con gestos o sistema
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      cameraContainer.classList.remove("fullscreen-mode");
      fullscreenBtn.classList.remove("hidden");
      exitFullscreenBtn.classList.add("hidden");
    }
  });

  window.addEventListener("beforeunload", stopCameraStream);
});

/* -------------------------------------------- FIN DE SEGUNDA PAGINA */
