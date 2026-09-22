/* ============================================================
   plots.js — Mini-librería de gráficos en Canvas (sin dependencias)
   Maneja: ejes, funciones continuas, líneas de espectro, stems
   ============================================================ */

const Plots = (() => {
  const COL = {
    grid: "#1c2740",
    axis: "#3a4a6e",
    text: "#8a94ad",
    tiempo: "#4fc3f7",
    armónico: "#7c5cff",
    muestra: "#f2a45c",
    rojo: "#e56767",
    verde: "#4caf7d",
    amarillo: "#e8c860"
  };

  /** Prepara canvas con respecto a la escala del dispositivo */
  function prep(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    return { ctx, w: rect.width, h: rect.height };
  }

  /** Configura un sistema de ejes con límites de datos */
  function ejes(canvas, xMin, xMax, yMin, yMax, opcoes = {}) {
    const p = prep(canvas);
    if (!p) return null;
    const { ctx, w, h } = p;

    const padIzq = opcoes.padIzq ?? 42;
    const padDer = opcoes.padDer ?? 12;
    const padArr = opcoes.padArr ?? 12;
    const padAba = opcoes.padAba ?? 30;

    const px = (x) => padIzq + ((x - xMin) / (xMax - xMin)) * (w - padIzq - padDer);
    const py = (y) => padArr + (1 - (y - yMin) / (yMax - yMin)) * (h - padArr - padAba);

    // Rejilla
    ctx.strokeStyle = COL.grid;
    ctx.lineWidth = 1;
    ctx.font = "10px Consolas, monospace";
    ctx.fillStyle = COL.text;

    const nX = opcoes.gridX ?? 6;
    const nY = opcoes.gridY ?? 4;

    ctx.textAlign = "center";
    for (let i = 0; i <= nX; i++) {
      const xv = xMin + (i * (xMax - xMin)) / nX;
      const xp = px(xv);
      ctx.beginPath();
      ctx.moveTo(xp, padArr);
      ctx.lineTo(xp, h - padAba);
      ctx.stroke();
      ctx.fillText(formatear(xv), xp, h - padAba + 14);
    }

    ctx.textAlign = "right";
    for (let i = 0; i <= nY; i++) {
      const yv = yMin + (i * (yMax - yMin)) / nY;
      const yp = py(yv);
      ctx.beginPath();
      ctx.moveTo(padIzq, yp);
      ctx.lineTo(w - padDer, yp);
      ctx.stroke();
      ctx.fillText(formatear(yv), padIzq - 5, yp + 3);
    }

    // Eje Y = 0 (si está en rango)
    if (yMin < 0 && yMax > 0) {
      ctx.strokeStyle = COL.axis;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(padIzq, py(0));
      ctx.lineTo(w - padDer, py(0));
      ctx.stroke();
    }

    // Etiqueta eje X
    if (opcoes.labelX) {
      ctx.fillStyle = COL.text;
      ctx.textAlign = "right";
      ctx.font = "10px Segoe UI, sans-serif";
      ctx.fillText(opcoes.labelX, w - padDer, h - 4);
    }

    return { ctx, w, h, px, py, xMin, xMax, yMin, yMax, padIzq, padDer, padArr, padAba };
  }

  function formatear(v) {
    if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + "k";
    if (Number.isInteger(v)) return String(v);
    if (Math.abs(v) >= 1) return v.toFixed(1);
    if (v === 0) return "0";
    return v.toFixed(2);
  }

  /** Dibuja una función continua muestreando f en [xMin, xMax] */
  function funcion(E, f, cor = COL.tiempo, ancho = 2) {
    const { ctx, px, py } = E;
    ctx.strokeStyle = cor;
    ctx.lineWidth = ancho;
    ctx.lineJoin = "round";
    ctx.beginPath();
    const muestras = Math.max(120, Math.round(E.w * 2));
    let primero = true;
    for (let i = 0; i <= muestras; i++) {
      const x = E.xMin + (i * (E.xMax - E.xMin)) / muestras;
      const y = f(x);
      if (!isFinite(y)) { primero = true; continue; }
      const yc = Math.max(E.yMin - 1, Math.min(E.yMax + 1, y));
      const X = px(x), Y = py(yc);
      if (primero) { ctx.moveTo(X, Y); primero = false; }
      else ctx.lineTo(X, Y);
    }
    ctx.stroke();
  }

  /** Rellena bajo la curva hasta y=0 */
  function relleno(E, f, cor = "rgba(79,195,247,0.12)") {
    const { ctx, px, py } = E;
    ctx.fillStyle = cor;
    ctx.beginPath();
    const muestras = Math.max(120, Math.round(E.w * 2));
    let primero = true;
    for (let i = 0; i <= muestras; i++) {
      const x = E.xMin + (i * (E.xMax - E.xMin)) / muestras;
      let y = f(x);
      if (!isFinite(y)) y = 0;
      const yc = Math.max(E.yMin, Math.min(E.yMax, y));
      if (primero) { ctx.moveTo(px(x), py(0)); ctx.lineTo(px(x), py(yc)); primero = false; }
      else ctx.lineTo(px(x), py(yc));
    }
    ctx.lineTo(px(E.xMax), py(0));
    ctx.closePath();
    ctx.fill();
  }

  /** Líneas verticales con punto (espectro de líneas / stem plot) */
  function lineasEspectro(E, puntos, cor = COL.armónico, radio = 3.5) {
    // puntos: [{x, y}] con y >= 0 recomendado
    const { ctx, px, py } = E;
    for (const p of puntos) {
      if (p.y < E.yMin || p.x < E.xMin || p.x > E.xMax) continue;
      const X = px(p.x), Y = py(p.y), Y0 = py(Math.max(0, E.yMin));
      ctx.strokeStyle = cor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X, Y0);
      ctx.lineTo(X, Y);
      ctx.stroke();
      ctx.fillStyle = cor;
      ctx.beginPath();
      ctx.arc(X, Y, radio, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Puntos de muestreo (círculos rellenos) */
  function puntos(E, lista, cor = COL.rojo, radio = 3) {
    const { ctx, px, py } = E;
    ctx.fillStyle = cor;
    for (const p of lista) {
      const yc = Math.max(E.yMin, Math.min(E.yMax, p.y));
      ctx.beginPath();
      ctx.arc(px(p.x), py(yc), radio, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Títulos internos del gráfico */
  function titulo(E, txt, cor = COL.text) {
    E.ctx.fillStyle = cor;
    E.ctx.font = "11px Segoe UI, sans-serif";
    E.ctx.textAlign = "left";
    E.ctx.fillText(txt, E.padIzq + 4, E.padArr + 12);
  }

  return { ejes, funcion, relleno, lineasEspectro, puntos, titulo, COL };
})();
