/* Diagnóstico TEMPORAL del video de portada (solo con ?diagvideo en la URL).
   No cambia el comportamiento del sitio: registra eventos, el resultado de play()
   y el estado del elemento, y los muestra en un panel. Eliminar tras el diagnóstico. */
(function () {
  if (!/[?&]diagvideo\b/.test(location.search)) return;

  var t0 = performance.now();
  var lines = [];
  var panel = null;
  function ms() { return Math.round(performance.now() - t0) + "ms"; }
  function log(msg) {
    lines.push(ms() + " " + msg);
    if (panel) panel.firstChild.textContent = lines.join("\n");
  }

  // Resultado de cada play(): quién lo llamó (carga o gesto) y por qué falló
  var origPlay = HTMLMediaElement.prototype.play;
  var lastGesture = null;
  ["touchstart", "click", "scroll"].forEach(function (type) {
    window.addEventListener(type, function () {
      if (lastGesture !== type) log("evento " + type);
      lastGesture = type;
    }, { capture: true, passive: true });
  });
  HTMLMediaElement.prototype.play = function () {
    var self = this;
    var origin = lastGesture ? "tras " + lastGesture : "sin gesto";
    log("play() llamado (" + origin + ") readyState=" + self.readyState);
    var p = origPlay.apply(this, arguments);
    if (p && p.then) {
      p.then(function () { log("play() OK"); },
             function (e) { log("play() RECHAZADO: " + e.name + " – " + e.message); });
    }
    return p;
  };

  function state(v) {
    var r = v.getBoundingClientRect();
    return "paused=" + v.paused + " t=" + v.currentTime.toFixed(2) +
      " ready=" + v.readyState + " net=" + v.networkState +
      " muted=" + v.muted + " defaultMuted=" + v.defaultMuted +
      " autoplay=" + v.autoplay + " playsInline=" + v.playsInline +
      " rect=" + Math.round(r.width) + "x" + Math.round(r.height) + "@" + Math.round(r.top) +
      " doc=" + document.visibilityState;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var v = document.getElementById("mobileVideo");
    panel = document.createElement("div");
    panel.setAttribute("style", "position:fixed;left:0;right:0;bottom:0;max-height:45vh;overflow:auto;" +
      "z-index:2147483647;background:rgba(0,0,0,.85);color:#7CFC9A;font:11px/1.35 monospace;" +
      "padding:8px;white-space:pre-wrap;-webkit-user-select:text;user-select:text");
    panel.appendChild(document.createTextNode(""));
    document.body.appendChild(panel);
    log(navigator.userAgent);
    if (!v) { log("sin #mobileVideo"); return; }

    var cs = getComputedStyle(v);
    log("css video: z-index=" + cs.zIndex + " position=" + cs.position + " opacity=" + cs.opacity + " visibility=" + cs.visibility);
    log("inicio: " + state(v));
    ["loadstart", "loadedmetadata", "loadeddata", "canplay", "canplaythrough", "play", "playing",
     "pause", "waiting", "stalled", "suspend", "emptied", "abort", "error"].forEach(function (type) {
      v.addEventListener(type, function () {
        log("video " + type + (type === "error" && v.error ? " code=" + v.error.code : "") + " | " + state(v));
      });
    });
    var firstTime = true;
    v.addEventListener("timeupdate", function () {
      if (firstTime && v.currentTime > 0) { firstTime = false; log("primer avance de tiempo | " + state(v)); }
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { log("visible en viewport: " + e.isIntersecting + " (" + e.intersectionRatio.toFixed(2) + ")"); });
      }).observe(v);
    }
    setTimeout(function () { log("a los 3 s: " + state(v)); }, 3000);
  });
})();
