/* ============================================================
   main.js — Navegación, progreso y arranque de la guía
   ============================================================ */

(function () {
  const CLAVE_PROGRESO = "fourier_progreso_v1";
  let leidos = {};

  try {
    leidos = JSON.parse(localStorage.getItem(CLAVE_PROGRESO) || "{}");
  } catch (e) {
    leidos = {};
  }

  function guardar() {
    localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(leidos));
  }

  function marcarLeido(id) {
    if (leidos[id]) return;
    leidos[id] = true;
    guardar();
    pintarNav();
    pintarBarra();
  }

  function pintarNav() {
    document.querySelectorAll(".nav-link").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const id = href.replace("#", "");
      if (id && leidos[id]) a.classList.add("leido");
      else a.classList.remove("leido");
    });
  }

  function pintarBarra() {
    const secciones = Array.from(document.querySelectorAll(".seccion"));
    const total = secciones.length;
    const vistos = secciones.filter((s) => leidos[s.id]).length;
    const pct = total ? Math.round((vistos / total) * 100) : 0;
    const fill = document.getElementById("progress-fill");
    const num = document.getElementById("progress-num");
    if (fill) fill.style.width = pct + "%";
    if (num) num.textContent = pct + "%";
  }

  function initObsSecciones() {
    const secciones = document.querySelectorAll(".seccion");
    if (!("IntersectionObserver" in window)) {
      secciones.forEach((s) => marcarLeido(s.id));
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((en) => {
          if (en.isIntersecting) {
            // marcar como leída tras una pausa breve (evita falsos positivos al scrollear rápido)
            const id = en.target.id;
            setTimeout(() => marcarLeido(id), 800);
            resaltarNav(id);
          }
        });
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: 0 }
    );
    secciones.forEach((s) => obs.observe(s));
  }

  function resaltarNav(id) {
    document.querySelectorAll(".nav-link").forEach((a) => {
      a.classList.toggle("activo", a.getAttribute("href") === "#" + id);
    });
  }

  function initMenuMovil() {
    const btn = document.getElementById("btn-menu");
    const side = document.getElementById("sidebar");
    if (!btn || !side) return;
    btn.addEventListener("click", () => side.classList.toggle("abierta"));
    side.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => side.classList.remove("abierta"))
    );
  }

  function initBotonReset() {
    const b = document.getElementById("btn-reset");
    if (!b) return;
    b.addEventListener("click", () => {
      if (!confirm("¿Borrar el progreso de lectura y los puntajes de los quizzes?")) return;
      localStorage.removeItem(CLAVE_PROGRESO);
      localStorage.removeItem("fourier_quiz");
      location.reload();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initObsSecciones();
    initMenuMovil();
    initBotonReset();
    pintarNav();
    pintarBarra();

    try { Demos.init(); } catch (e) { console.error("Error en demos:", e); }
    try { QuizUI.init(); } catch (e) { console.error("Error en quiz:", e); }
  });
})();
