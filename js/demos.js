/* ============================================================
   demos.js — Demos interactivos de la guía Fourier
   1. Sintetizador de señales
   2. Constructor de armónicos (serie de Fourier)
   3. Pulso rect → espectro sinc (ancho de banda)
   4. Aliasing / muestreo (Nyquist)
   5. Señal de ECG (proyecto IS723)
   ============================================================ */

const Demos = (() => {
  const C = Plots.COL;

  /* ---------- utilidades ---------- */
  const $ = (id) => document.getElementById(id);
  const val = (id) => parseFloat($(id).value);

  function slider(id, formato = (v) => v.toFixed(1), unidad = "") {
    const el = $(id);
    const out = $(id + "_val");
    const upd = () => { if (out) out.textContent = formato(parseFloat(el.value)) + unidad; };
    el.addEventListener("input", upd);
    upd();
    return el;
  }

  function opciones(id, cb) {
    const el = $(id);
    el.addEventListener("change", cb);
    return el;
  }

  /* ==========================================================
     1. SINTETIZADOR — 3 senoides → tiempo + espectro
     ========================================================== */
  function initSintetizador() {
    if (!$("syn-canvas-t")) return;

    ["1", "2", "3"].forEach((n) => {
      slider("syn_a" + n, (v) => v.toFixed(1));
      slider("syn_f" + n, (v) => v.toFixed(1), " Hz");
      slider("syn_p" + n, (v) => v.toFixed(0), "°");
    });

    const componentes = () =>
      ["1", "2", "3"].map((n) => ({
        A: val("syn_a" + n),
        f: val("syn_f" + n),
        phi: (val("syn_p" + n) * Math.PI) / 180
      }));

    function dibujar() {
      const comps = componentes();
      const fMax = Math.max(...comps.map((c) => c.f), 1);
      const aMax = comps.reduce((s, c) => s + Math.abs(c.A), 1);
      const T = 2 / fMax; // 2 ciclos de la más rápida (o ventana generosa)

      // --- Dominio del tiempo ---
      const x = (t) => comps.reduce((s, c) => s + c.A * Math.sin(2 * Math.PI * c.f * t + c.phi), 0);
      const Et = Plots.ejes($("syn-canvas-t"), 0, T, -aMax * 1.25, aMax * 1.25, {
        labelX: "tiempo t (s)", gridY: 4
      });
      Plots.relleno(Et, x);
      Plots.funcion(Et, x, C.tiempo, 2.2);
      Plots.titulo(Et, "x(t) = suma de senoides", C.tiempo);

      // --- Espectro (líneas de amplitud) ---
      const Ef = Plots.ejes($("syn-canvas-f"), 0, fMax * 1.35, 0, aMax * 1.25, {
        labelX: "frecuencia f (Hz)", padIzq: 36
      });
      const puntos = comps
        .filter((c) => c.A !== 0)
        .map((c) => ({ x: c.f, y: Math.abs(c.A) }));
      Plots.lineasEspectro(Ef, puntos, C.armónico);
      Plots.titulo(Ef, "Espectro |X(f)| — líneas en cada frecuencia", C.armónico);

      // --- Salida textual ---
      const txt = comps
        .map((c, i) => `C${i + 1}: A=${c.A.toFixed(1)}, f=${c.f.toFixed(1)} Hz, φ=${((c.phi * 180) / Math.PI).toFixed(0)}°`)
        .join("   |   ");
      $("syn-salida").textContent =
        txt + `\nFrecuencia dominante: ${comps.reduce((a, b) => (Math.abs(a.A) > Math.abs(b.A) ? a : b)).f.toFixed(1)} Hz`;
    }

    ["1", "2", "3"].forEach((n) => {
      ["a", "f", "p"].forEach((k) => $(k === "a" ? "syn_a" + n : k === "f" ? "syn_f" + n : "syn_p" + n).addEventListener("input", dibujar));
    });

    // Presets rápidos
    document.querySelectorAll("#syn-presets .btn").forEach((b) => {
      b.addEventListener("click", () => {
        const p = b.dataset.preset;
        const sets = {
          grave: [[2.5, 50, 0], [1.2, 100, 0], [0.6, 150, 0]],
          agudo: [[0.8, 800, 0], [1.5, 1200, 0], [1.0, 2400, 0]],
          forma: [[2.0, 200, 0], [0.66, 600, 0], [0.4, 1000, 0]]
        };
        sets[p].forEach((c, i) => {
          $("syn_a" + (i + 1)).value = c[0];
          $("syn_f" + (i + 1)).value = c[1];
          $("syn_p" + (i + 1)).value = c[2];
          ["a", "f", "p"].forEach((k) => $(k === "a" ? "syn_a" + (i + 1) : k === "f" ? "syn_f" + (i + 1) : "syn_p" + (i + 1)).dispatchEvent(new Event("input")));
        });
        document.querySelectorAll("#syn-presets .btn").forEach((x) => x.classList.remove("activo"));
        b.classList.add("activo");
        dibujar();
      });
    });

    dibujar();
  }

  /* ==========================================================
     2. ARMÓNICOS — serie de Fourier (cuadrada / triangular / dentada)
     ========================================================== */
  function initArmonicos() {
    if (!$("arm-canvas-t")) return;

    let N = 5;
    const N_el = slider("arm_N", (v) => String(v.toFixed(0)));

    // Coeficientes b_n (amplitud del armónico n) según forma de onda
    function bN(onda, n) {
      if (onda === "cuadrada") return n % 2 === 1 ? 4 / (Math.PI * n) : 0;
      if (onda === "triangular") return n % 2 === 1 ? (8 / (Math.PI * Math.PI)) * (Math.pow(-1, (n - 1) / 2) / (n * n)) : 0;
      if (onda === "dentada") return (2 / (Math.PI * n)) * Math.pow(-1, n + 1);
      return 0;
    }

    function dibujar() {
      const onda = $("arm_onda").value;
      const f0 = val("arm_f0");
      const w0 = 2 * Math.PI * f0;
      const T = 2 / f0;
      N = parseInt(N_el.value, 10);

      const arm = (t) => {
        let s = 0;
        for (let n = 1; n <= N; n++) s += bN(onda, n) * Math.sin(n * w0 * t);
        return s;
      };

      // Referencia: onda "ideal" con muchísimos armónicos
      const ideal = (t) => {
        let s = 0;
        for (let n = 1; n <= 201; n++) s += bN(onda, n) * Math.sin(n * w0 * t);
        return s;
      };

      const Et = Plots.ejes($("arm-canvas-t"), 0, T, -1.5, 1.5, {
        labelX: "tiempo t (s)"
      });
      // ideal en gris punteado (referencia)
      Plots.funcion(Et, ideal, "#3a4668", 4);
      Plots.funcion(Et, arm, C.armónico, 2.2);
      Plots.titulo(Et, `Suma de ${N} armónico${N > 1 ? "s" : ""} vs. onda ideal`, C.armónico);

      // Espectro: líneas hasta ~12N o 15 armónicos
      const nMax = Math.min(Math.max(N + 4, 12), 40);
      let aMax = 0;
      const pts = [];
      for (let n = 1; n <= nMax; n++) {
        const amp = Math.abs(bN(onda, n));
        if (amp > aMax) aMax = amp;
        if (n <= N) pts.push({ x: n * f0, y: amp });
      }
      const Ef = Plots.ejes($("arm-canvas-f"), 0, (nMax + 1) * f0, 0, Math.max(aMax, 0.1) * 1.2, {
        labelX: "frecuencia (Hz)", padIzq: 36
      });
      Plots.lineasEspectro(Ef, pts, C.armónico);
      Plots.titulo(Ef, "Espectro: líneas en n·f₀ (las que sumaste)", C.armónico);

      const usados = pts.filter((p) => p.y > 0.001).length;
      $("arm-salida").textContent =
        `Onda ${onda}  |  f₀ = ${f0} Hz  |  armónicos usados: ${N}  |  líneas no nulas visibles: ${usados}` +
        (N < 7 ? `\nGibbs: fija los ojos en los bordes — el "sobrepaso" cerca del salto no desaparece al añadir armónicos.` : "");
    }

    N_el.addEventListener("input", dibujar);
    opciones("arm_onda", dibujar);
    slider("arm_f0", (v) => v.toFixed(1), " Hz").addEventListener("input", dibujar);
    dibujar();
  }

  /* ==========================================================
     3. PULSO RECT → espectro sinc (ancho de banda)
     ========================================================== */
  function initPulso() {
    if (!$("pul-canvas-t")) return;

    const tau_el = slider("pul_tau", (v) => v.toFixed(3), " s");

    function dibujar() {
      const tau = parseFloat(tau_el.value);
      const AnchoV = 0.012; // ventana de visualización en segundos

      const rect = (t) => (Math.abs(t) <= tau / 2 ? 1 : 0);
      const Et = Plots.ejes($("pul-canvas-t"), -AnchoV, AnchoV, -0.35, 1.3, {
        labelX: "tiempo t (s)"
      });
      Plots.relleno(Et, rect, "rgba(79,195,247,0.22)");
      Plots.funcion(Et, rect, C.tiempo, 2.2);
      Plots.titulo(Et, `pulso rect de ancho τ = ${(tau * 1000).toFixed(1)} ms`, C.tiempo);

      // |X(f)| = τ·|sinc(f·τ)| — dibujamos la envolvente continua
      const sinc = (u) => (u === 0 ? 1 : Math.sin(Math.PI * u) / (Math.PI * u));
      const fMax = Math.min(400, 2.5 / tau);
      const amp0 = tau;
      const Ef = Plots.ejes($("pul-canvas-f"), -fMax, fMax, -amp0 * 0.18, amp0 * 1.2, {
        labelX: "frecuencia f (Hz)"
      });
      const env = (f) => Math.abs(tau * sinc(f * tau));
      Plots.relleno(Ef, (f) => (f >= 0 ? env(f) : 0), "rgba(124,92,255,0.16)");
      Plots.funcion(Ef, env, C.armónico, 2);
      // Primeros ceros: f = k/τ
      for (let k = 1; k <= 4; k++) {
        const fz = k / tau;
        if (fz > fMax) break;
        [fz, -fz].forEach((f) => {
          const { ctx, px, py } = Ef;
          ctx.strokeStyle = C.rojo;
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px(f), py(0));
          ctx.lineTo(px(f), py(amp0 * 1.1));
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }
      Plots.titulo(Ef, "|X(f)| = τ·|sinc(f·τ)| — primera lóbulo ≈ ancho de banda B", C.armónico);

      const B = 1 / tau;
      $("pul-salida").textContent =
        `τ = ${(tau * 1000).toFixed(1)} ms  →  primer cero en f = 1/τ = ${B.toFixed(0)} Hz\n` +
        `Regla práctica: B ≈ 1/τ. Más angosto en el tiempo ⇒ más ancho en frecuencia.`;
    }

    tau_el.addEventListener("input", dibujar);
    dibujar();
  }

  /* ==========================================================
     4. ALIASING — muestreo por debajo de Nyquist
     ========================================================== */
  function initAliasing() {
    if (!$("ali-canvas-t")) return;

    const f0_el = slider("ali_f0", (v) => v.toFixed(1), " Hz");
    const fs_el = slider("ali_fs", (v) => v.toFixed(0), " Hz");

    function dibujar() {
      const f0 = parseFloat(f0_el.value);
      const fs = parseFloat(fs_el.value);
      const Nyq = fs / 2;
      const hayAlias = f0 > Nyq;

      // Frecuencia alias: pliegue alrededor de fs/2
      let fAlias = f0 % fs;
      if (fAlias > fs / 2) fAlias = fs - fAlias;

      const T = 0.12; // ventana 120 ms
      const x = (t) => Math.sin(2 * Math.PI * f0 * t);
      const xAlias = (t) => Math.sin(2 * Math.PI * fAlias * t);

      const Et = Plots.ejes($("ali-canvas-t"), 0, T, -1.6, 1.6, {
        labelX: "tiempo t (s)"
      });
      // Original (tenue)
      Plots.funcion(Et, x, "#2f3d5e", 5);
      Plots.funcion(Et, x, C.tiempo, 1.6);

      // Muestras
      const pts = [];
      for (let t = 0; t <= T; t += 1 / fs) pts.push({ x: t, y: x(t) });
      Plots.puntos(Et, pts, C.muestra, 4);
      // Tallos del muestreo
      const { ctx, px, py } = Et;
      ctx.strokeStyle = "rgba(242,164,92,0.5)";
      ctx.lineWidth = 1.2;
      for (const p of pts) {
        ctx.beginPath();
        ctx.moveTo(px(p.x), py(0));
        ctx.lineTo(px(p.x), py(p.y));
        ctx.stroke();
      }

      // Reconstrucción alias (solo si hay aliasing)
      if (hayAlias) {
        Plots.funcion(Et, xAlias, C.rojo, 1.8);
      }
      Plots.titulo(Et, hayAlias
        ? `¡ALIASING! la señal "parece" ${fAlias.toFixed(1)} Hz`
        : `Muestreo correcto (Nyquist OK): f₀=${f0} Hz ≤ fs/2=${Nyq} Hz`,
        hayAlias ? C.rojo : C.verde);

      // Espectro: original vs alias
      const Ef = Plots.ejes($("ali-canvas-f"), 0, Math.max(fs * 1.15, f0 * 1.2), 0, 1.3, {
        labelX: "frecuencia (Hz)", padIzq: 30
      });
      Plots.lineasEspectro(Ef, [{ x: f0, y: 1 }], C.tiempo);
      // Espejos alrededor de fs (fenómeno del pliegue)
      for (let k = -2; k <= 3; k++) {
        const fl = Math.abs(f0 + k * fs);
        if (fl > 0 && fl <= Ef.xMax && Math.abs(fl - f0) > 1e-9) {
          Plots.lineasEspectro(Ef, [{ x: fl, y: 0.55 }], C.rojo, 3);
        }
      }
      // Marca fs/2 (sobre el canvas del espectro)
      const { ctx: ctxF, px: pxF, py: pyF } = Ef;
      ctxF.strokeStyle = C.amarillo;
      ctxF.setLineDash([5, 4]);
      ctxF.lineWidth = 1.4;
      ctxF.beginPath();
      ctxF.moveTo(pxF(Nyq), pyF(0));
      ctxF.lineTo(pxF(Nyq), pyF(1.25));
      ctxF.stroke();
      ctxF.setLineDash([]);
      ctxF.fillStyle = C.amarillo;
      ctxF.font = "10px Consolas, monospace";
      ctxF.textAlign = "left";
      ctxF.fillText("fs/2 (Nyquist)", pxF(Nyq) + 4, pyF(1.2));
      Plots.titulo(Ef, "Azul: señal real · Rojo: réplicas por muestreo", C.text);

      $("ali-salida").innerHTML =
        `f₀ = <b>${f0.toFixed(1)} Hz</b> &nbsp;·&nbsp; fs = <b>${fs.toFixed(0)} Hz</b> &nbsp;·&nbsp; Nyquist = fs/2 = ${Nyq.toFixed(1)} Hz<br>` +
        (hayAlias
          ? `<span style="color:var(--red)">⚠ f₀ &gt; fs/2 → la señal se pliega: se reconstruye como ${fAlias.toFixed(1)} Hz (alias). Para evitarlo: fs ≥ 2·f₀ = ${(2 * f0).toFixed(0)} Hz.</span>`
          : `<span style="color:var(--green)">✓ Se cumple Nyquist: la reconstrucción sería fiel. B máx. detectable = ${Nyq.toFixed(1)} Hz.</span>`);
    }

    f0_el.addEventListener("input", dibujar);
    fs_el.addEventListener("input", dibujar);
    dibujar();
  }

  /* ==========================================================
     5. ECG — señal biomédica sintética (proyecto IS723)
     ========================================================== */

  /** Genera un ECG sintético: P, Q, R, S, T como gaussianas repetidas */
  function ecg(t, hr = 72) {
    const T = 60 / hr; // período cardíaco
    const ph = ((t % T) + T) % T; // fase dentro del ciclo
    const g = (mu, s, a) => a * Math.exp(-((ph - mu) * (ph - mu)) / (2 * s * s));
    // Posiciones relativas (s) para T≈0.833 s (72 bpm) escaladas
    const k = T / 0.833;
    return (
      g(0.20 * k, 0.025 * k, 0.12) +   // P
      g(0.36 * k, 0.007 * k, -0.12) +  // Q
      g(0.38 * k, 0.008 * k, 1.0) +    // R
      g(0.40 * k, 0.008 * k, -0.22) +  // S
      g(0.58 * k, 0.040 * k, 0.30)     // T
    );
  }

  /** DFT simple O(N²) — suficiente para N chico en el navegador */
  function dft(x) {
    const N = x.length;
    const mag = new Array(Math.floor(N / 2) + 1).fill(0);
    for (let k = 0; k <= Math.floor(N / 2); k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) {
        const ang = (-2 * Math.PI * k * n) / N;
        re += x[n] * Math.cos(ang);
        im += x[n] * Math.sin(ang);
      }
      mag[k] = (2 * Math.sqrt(re * re + im * im)) / N;
    }
    return mag;
  }

  function initECG() {
    if (!$("ecg-canvas-t")) return;

    opciones("ecg_fs", dibujar);
    opciones("ecg_hr", dibujar);

    function dibujar() {
      const fs = parseInt($("ecg_fs").value, 10);
      const hr = parseInt($("ecg_hr").value, 10);
      const dur = 3; // segundos
      const N = Math.round(fs * dur);

      const señal = [];
      for (let n = 0; n < N; n++) señal.push(ecg(n / fs, hr));

      // --- tiempo ---
      const Et = Plots.ejes($("ecg-canvas-t"), 0, dur, -0.6, 1.3, {
        labelX: "tiempo (s)", gridY: 4
      });
      Plots.funcion(Et, (t) => ecg(t, hr), C.verde, 1.8);
      // puntos de muestreo (cada N-ésimo para que no sature)
      const paso = Math.max(1, Math.floor(N / 160));
      const pts = [];
      for (let n = 0; n < N; n += paso) pts.push({ x: n / fs, y: señal[n] });
      Plots.puntos(Et, pts, C.muestra, 2.2);
      Plots.titulo(Et, `ECG sintético — ${hr} lpm, fs = ${fs} Hz`, C.verde);

      // --- espectro: DFT sobre 1 s (Nfft = fs) ---
      const Nfft = Math.min(fs, 512);
      const ventana = señal.slice(0, Nfft);
      const mag = dft(ventana);
      const fMaxHz = 50;
      const kMax = Math.min(mag.length - 1, Math.round((fMaxHz * Nfft) / fs));
      const aMax = Math.max(...mag.slice(1, kMax + 1), 0.05);

      const Ef = Plots.ejes($("ecg-canvas-f"), 0, fMaxHz, 0, aMax * 1.2, {
        labelX: "frecuencia (Hz)", padIzq: 36
      });
      const ptsF = [];
      for (let k = 1; k <= kMax; k++) {
        ptsF.push({ x: (k * fs) / Nfft, y: mag[k] });
      }
      Plots.lineasEspectro(Ef, ptsF, C.verde, 2.2);
      // Zona del complejo QRS (10–40 Hz)
      const { ctx, px, py } = Ef;
      ctx.fillStyle = "rgba(232,200,96,0.09)";
      ctx.fillRect(px(10), py(aMax * 1.2), px(40) - px(10), py(0) - py(aMax * 1.2));
      ctx.fillStyle = C.amarillo;
      ctx.font = "10px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("zona QRS (10–40 Hz)", (px(10) + px(40)) / 2, py(aMax * 1.15));
      Plots.titulo(Ef, "|X(f)| del ECG (DFT de 1 s)", C.verde);

      const B = 40; // ancho de banda útil típico del ECG
      const Nyq = fs / 2;
      $("ecg-salida").innerHTML =
        `fs = <b>${fs} Hz</b> → Nyquist = ${Nyq} Hz. ECG útil ≈ 0.05–${B} Hz ⇒ requiere fs ≥ ${(2 * B)} Hz teóricamente.<br>` +
        (fs >= 100
          ? `<span style="color:var(--green)">✓ Con fs=${fs} Hz el QRS se muestrea bien (${(fs / B).toFixed(1)}× por banda).</span>`
          : `<span style="color:var(--red)">⚠ fs=${fs} Hz es insuficiente: el contenido de 40 Hz se colapsa (aliasing en el QRS).</span>`) +
        `<br><span style="color:var(--text-dim)">Nota: los filtros del AD8232 dejan pasar ~0.5–40 Hz; en tu proyecto, muestrea a 250–500 Hz como hacen los equipos clínicos.</span>`;
    }

    dibujar();
  }

  /* ---------- init global ---------- */
  function init() {
    initSintetizador();
    initArmonicos();
    initPulso();
    initAliasing();
    initECG();
  }

  return { init, ecg, dft };
})();
