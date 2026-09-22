/* ============================================================
   quiz.js — Preguntas de opción múltiple + ejercicios tipo examen
   con soluciones desplegables.
   ============================================================ */

const QUIZ_DATA = {
  /* ---------- NIVEL 0–20: CIMIENTOS ---------- */
  q0: [
    {
      q: "En x(t) = 3·sin(2π·100·t + π/4), ¿cuál es la frecuencia?",
      op: ["3 Hz", "100 Hz", "200 Hz", "100π Hz"],
      r: 1,
      exp: "La forma general es A·sin(2π·f·t + φ). El número que multiplica a t dentro del seno, con 2π ya incluido, es f = 100 Hz. La amplitud es 3 y la fase π/4."
    },
    {
      q: "La frecuencia se mide en hertz (Hz), donde 1 Hz equivale a…",
      op: ["Un radian por segundo", "Un ciclo (periodo) por segundo", "Un segundo por ciclo", "Una amplitud máxima"],
      r: 1,
      exp: "1 Hz = 1 ciclo/s. Si algo oscila 5 veces en un segundo, tiene f = 5 Hz. (Cuidado: ω = 2πf está en rad/s; π rad/s ≈ 0.5 Hz.)"
    },
    {
      q: "Si aumentas la amplitud A de una sinusoide, en el espectro de frecuencias…",
      op: ["La línea se corre a otra frecuencia", "La línea desaparece", "La línea crece en altura", "Aparecen líneas nuevas"],
      r: 2,
      exp: "La posición horizontal de la línea es la frecuencia f; su altura es la amplitud |A|. Cambiar A solo cambia la altura, nunca la posición."
    },
    {
      q: "¿Cuál de estas afirmaciones es CORRECTA sobre el dominio del tiempo?",
      op: ["Muestra qué tan rápido cambia la señal en cada instante, pero oculta de qué frecuencias está hecha", "Muestra directamente las frecuencias presentes", "Es la única representación válida de una señal", "Sirve solo para señales periódicas"],
      r: 0,
      exp: "La gráfica x(t) vs t te dice el valor en cada instante, pero ver 5 picos por segundo 'a simple vista' es poco fiable con ruido o mezclas. El dominio de frecuencia revela esa composición. Por eso existe Fourier."
    }
  ],

  /* ---------- NIVEL 20–40: SERIE DE FOURIER ---------- */
  q1: [
    {
      q: "La serie de Fourier aplica primordialmente a señales…",
      op: ["Periódicas", "De un solo pulso", "Constantes", "Ruidosas"],
      r: 0,
      exp: "La serie de Fourier descompone señales PERIÓDICAS en armónicos n·f₀. Las no periódicas se tratan con la transformada de Fourier (nivel 40–60)."
    },
    {
      q: "La onda cuadrada ideal (simétrica respecto al cero) contiene…",
      op: ["Todos los armónicos pares e impares", "Solo el fundamental", "Solo armónicos impares (1, 3, 5…)", "Ningún armónico"],
      r: 2,
      exp: "La cuadrada impar tiene solo senos (bₙ) y, por su simetría media-imparesa, solo sobreviven los armónicos impares: f₀, 3f₀, 5f₀… Por eso al agregar armónicos impares se aproxima mejor."
    },
    {
      q: "El coeficiente a₀ de la serie corresponde a…",
      op: ["La amplitud máxima", "El valor medio (componente DC) de la señal", "La frecuencia fundamental", "La fase inicial"],
      r: 1,
      exp: "a₀ (o a₀/2 en la forma clásica) es el promedio de x(t) sobre un período: el nivel continuo. Por eso, para una señal centrada en cero, a₀ → 0, como viste en clase."
    },
    {
      q: "El fenómeno de Gibbs ocurre cuando…",
      op: ["La señal tiene ruido", "Se trunca la serie en una discontinuidad y aparece un sobrepaso ~9%", "La frecuencia es muy alta", "Se usa la forma exponencial"],
      r: 1,
      exp: "Cerca de un salto (como los bordes de la onda cuadrada), la suma parcial de armónicos siempre sobrepasa ~9% el valor del salto. Añadir más armónicos hace el lóbulo más angosto, pero NO lo elimina. Pruébalo en el demo de armónicos."
    }
  ],

  /* ---------- NIVEL 40–60: TRANSFORMADA ---------- */
  q2: [
    {
      q: "Al pasar de la serie (T finita) a la transformada de Fourier (T → ∞)…",
      op: ["El espectro se vuelve continuo", "Desaparecen los armónicos fundamental", "La señal se vuelve periódica", "El espectro desaparece"],
      r: 0,
      exp: "Entre armónicos más y más cercanos (Δf = 1/T → 0) las líneas se juntan hasta formar un espectro CONTINUO X(f). Esa es la transformada: el 'límite' natural de la serie."
    },
    {
      q: "La transformada de un impulso δ(t) es…",
      op: ["0", "1 (constante en todas las frecuencias)", "δ(f)", "∞ en f = 0 solamente"],
      r: 1,
      exp: "X(f) = ∫δ(t)·e^{-j2πft}dt = 1. El impulso contiene TODAS las frecuencias con la misma amplitud. Por eso un golpe corto 'suena' con todos los tonos."
    },
    {
      q: "Si x(t) se estira en el tiempo (se hace 2 veces más lenta: x(2t) con a<1, digamos x(t/2)), el espectro…",
      op: ["Se estira también (más frecuencias altas)", "Se comprima hacia frecuencias más bajas", "No cambia", "Se desplaza en fase"],
      r: 1,
      exp: "Principio tiempo–frecuencia: lo lento en el tiempo es bajo en frecuencia. Si x(t) ↔ X(f), entonces x(t/2) ↔ 2·X(2f): el espectro se comprime (se acerca al cero). En audio: una nota grave dura más tiempo."
    },
    {
      q: "En X(f) = ∫ x(t)·e^{-j2πft} dt, el término e^{-j2πft} funciona como…",
      op: ["Un filtro paso-bajo", "Un oscilador de referencia con el que se 'compara' x(t): mide cuánto hay de esa frecuencia", "Un ruido agregado", "Una derivada"],
      r: 1,
      exp: "La integral multiplica x(t) por un coseno/seno de frecuencia f y promedia. Si x(t) contiene esa frecuencia, las contribuciones suman y |X(f)| es grande; si no, se cancelan (ortogonalidad). Es como sintonizar una radio."
    }
  ],

  /* ---------- NIVEL 60–80: MUESTREO Y NYQUIST ---------- */
  q3: [
    {
      q: "Teorema de Nyquist–Shannon: para reconstruir fielmente una señal de ancho de banda B, se requiere…",
      op: ["fs ≥ B", "fs ≥ 2B", "fs ≤ B/2", "fs = B²"],
      r: 1,
      exp: "fs ≥ 2B. Si B = 40 Hz (ECG), necesitas fs ≥ 80 Hz. Los equipos clínicos usan 250–500 Hz con mucha holgura."
    },
    {
      q: "Una señal de 70 Hz se muestrea a fs = 100 Hz. ¿A qué frecuencia 'falsa' (alias) se observa?",
      op: ["70 Hz", "50 Hz", "30 Hz", "10 Hz"],
      r: 2,
      exp: "Nyquist = 50 Hz < 70 Hz → hay aliasing. El pliegulo da f_alias = |f₀ − fs| = |70 − 100| = 30 Hz. Las muestras son indistinguibles de una sinusoide de 30 Hz."
    },
    {
      q: "Si fs = 200 Hz, ¿cuál es la frecuencia máxima que puedes representar sin aliasing?",
      op: ["200 Hz", "100 Hz", "400 Hz", "50 Hz"],
      r: 1,
      exp: "La máxima frecuencia representable es fs/2 = 100 Hz (frecuencia de Nyquist)."
    },
    {
      q: "En el ADC del ESP32 para tu ECG, muestrear MUY por debajo de lo que exige Nyquist provoca…",
      op: ["Mejor resolución", "Aliasing: el contenido alto se cuela como frecuencias falsas bajas", "La señal desaparece", "Aumento del ancho de banda"],
      r: 1,
      exp: "El aliasing introduce componentes falsas en el espectro que NINGÚN filtro digital posterior puede separar de las reales. Por eso se muestrea bien (o se filtra ANALÓGICamente antes, que es parte del trabajo del AD8232)."
    }
  ],

  /* ---------- NIVEL 80–100: DFT/FFT Y COMUNICACIONES ---------- */
  q4: [
    {
      q: "La DFT (Transformada Discreta de Fourier) trabaja con…",
      op: ["Señales continuas infinitas", "N muestras discretas y la devuelve en N frecuencias (bins)", "Solo partes imaginarias", "Señales analógicas"],
      r: 1,
      exp: "La DFT toma N muestras x[0]…x[N−1] y calcula N valores X[0]…X[N−1] (complejos). Es la FT aplicada a datos finitos y discretos: lo que corre el computador (y tu ESP32)."
    },
    {
      q: "Con fs = 500 Hz y N = 1024 muestras, la resolución espectral Δf es…",
      op: ["500 Hz", "0.49 Hz", "1024 Hz", "2 Hz"],
      r: 1,
      exp: "Δf = fs/N = 500/1024 ≈ 0.488 Hz. Cada bin del espectro 'mide' una franja de ~0.49 Hz. Para distinguir frecuencias cercanas, necesitas N grande (más muestras = más tiempo de observación)."
    },
    {
      q: "FFT significa y hace…",
      op: ["Fourier: genera señales", "Fast Fourier Transform: algoritmo O(N log N) que calcula EXACTAMENTE la misma DFT muchísimo más rápido", "Filtro: elimina ruido", "Frecuencia: sintetiza senos"],
      r: 1,
      exp: "La FFT no cambia la matemática de la DFT (O(N²)); solo la reorganiza. Por eso el análisis espectral en tiempo real es posible en microcontroladores como el ESP32."
    },
    {
      q: "En OFDM (usada en WiFi y 4G/5G), cada subportadora se…",
      op: ["Transmite en un instante distinto", "Modula en paralelo sobre una frecuencia ortogonal — la ortogonalidad y la separación se diseñan en el dominio de Fourier", "Se filtra con ruido", "Usa solo senos de 1 Hz"],
      r: 1,
      exp: "OFDM = multiplexación por división de frecuencia ortogonal: muchas subportadoras cercanas sin interferencia entre sí porque sus espectros son ortogonales (los picos de una caen en los ceros de otra). ¡Es Fourier aplicado al diseño de la señal!"
    }
  ],

  /* ---------- CHECKLIST FINAL (0–100) ---------- */
  qf: [
    {
      q: "La idea central de Fourier es que…",
      op: ["Toda señal (con condiciones) puede construirse combinando sinusoides", "Las sinusoides no sirven para comunicar", "El tiempo y la frecuencia son lo mismo", "Solo las señales periódicas existen"],
      r: 0,
      exp: "Ese es el mensaje: sinusoides = elementos básicos. Serie para periódicas, transformada para no periódicas, DFT para datos digitales."
    },
    {
      q: "Señal x(t) = 2 + 5·cos(100πt). Su espectro tiene…",
      op: ["Una sola línea en 100π Hz", "Línea en DC (f=0) de altura 2, y líneas en 50 Hz", "Solo DC", "Espectro continuo"],
      r: 1,
      exp: "La constante 2 es frecuencia 0 (DC). cos(100πt) = cos(2π·50·t) → f = 50 Hz con amplitud 5. Dos líneas: en 0 y en 50 Hz. (La coseno genera dos simétricas en ±50 Hz si dibujas el espectro bilateral.)"
    },
    {
      q: "Más ancho en el tiempo ⇒ en frecuencia…",
      op: ["Más angosto y concentrado", "Más ancho", "Nada cambia", "Desaparece"],
      r: 0,
      exp: "Relación de incertidumbre tiempo–frecuencia (escalamiento): si x(t/a) ↔ |a|·X(a·f). Un pulso largo tiene espectro angosto; un chispazo (pulso corto) se esparce en muchas frecuencias."
    },
    {
      q: "La forma exponencial e^{jθ} de Euler cumple…",
      op: ["e^{jθ} = cos θ + j·sen θ", "e^{jθ} = cos θ − j·sen θ", "e^{jθ} = 2π·f", "e^{jθ} = j·θ"],
      r: 0,
      exp: "Euler: e^{jθ} = cos θ + j sen θ. Permite escribir cos y sen con una sola expresión y hace la integral de Fourier compacta: X(f) = ∫x(t)e^{-j2πft}dt."
    },
    {
      q: "El producto de ortogonalidad ∫sen(nω₀t)·cos(mω₀t)dt sobre un período vale…",
      op: ["Siempre 1", "0 (para n ≠ m, y también para sen·cos mismo n)", "∞", "Depende de la amplitud"],
      r: 1,
      exp: "Seno y coseno de armónicos (o distintos) son ortogonales: su producto integrado es 0. Así se 'cristalizan' los coeficientes aₙ y bₙ al multiplicar la serie por sen/coseno e integrar."
    },
    {
      q: "Tu ECG tiene contenido útil hasta ~40 Hz. El criterio de muestreo mínimo es…",
      op: ["fs ≥ 40 Hz", "fs ≥ 80 Hz", "fs ≥ 400 Hz", "fs ≥ 4000 Hz"],
      r: 1,
      exp: "2B = 80 Hz. En la práctica se usa mucho más (250–500 Hz) por el filtro del ADC, el ruido y para tener resolución temporal fina en el QRS."
    },
    {
      q: "En la DFT, si solo miras |X[k]|, la altura del bin k representa…",
      op: ["La fase de esa frecuencia", "Cuánta energía/amplitud tiene esa frecuencia", "El tiempo de muestreo", "El error de cuantización"],
      r: 1,
      exp: "|X[k]| = magnitud (amplitud relativa) de la componente en f = k·Δf. La fase está en el ángulo de X[k] (arg X[k]). Ambas juntas permiten reconstruir la señal exacta."
    },
    {
      q: "Multiplicar x(t) por un seno cos(2πf_c t) en el tiempo equivale, en frecuencia, a…",
      op: ["Desplazar el espectro de x hacia ±f_c (modulación)", "Comprimir el espectro", "Eliminar el ruido", "Nada"],
      r: 0,
      exp: "Propiedad de la modulación: x(t)·cos(2πf_c t) ↔ ½[X(f−f_c) + X(f+f_c)]. El espectro 'se muda' a la portadora. Esto ES la modulación AM y es la base de FDM/OFDM. Verás en Comunicaciones II."
    },
    {
      q: "Si tu señal x(t) tiene ancho de banda B y la conviertes a digital correctamente (Nyquist), el espectro de la versión muestreada…",
      op: ["Se repite cada fs Hz (copias espectrales)", "Se borra", "Se vuelve una sola línea", "Se invierte"],
      r: 0,
      exp: "Muestrear en tiempo = multiplicar por un tren de impulsos = convolución con un tren de impulsos en frecuencia: el espectro se replica cada fs. Si fs < 2B, las copias se montan (aliasing)."
    },
    {
      q: "¿Estás en el 100 si…?",
      op: ["Puedes explicar por qué una nota grave 'dura' más en el espectro", "Puedes calcular bₙ de una onda, hallar fs mínima de un ECG y decir qué hace la FFT", "Ambas anteriores", "Ninguna es necesaria"],
      r: 2,
      exp: "Si dominas intuición (tiempo↔frecuencia), rigor (coeficientes, integral, Euler), muestreo (Nyquist/aliasing) y discretización (DFT/FFT) + sabes a qué comunicaciones conecta (FDM/OFDM/modulación), ¡llegaste al 100!"
    }
  ]
};

/* ============================================================
   EJERCICIOS ESCRITOS (tipo examen) con soluciones
   ============================================================ */

const EJERCICIOS = {
  e0: [
    {
      tag: "Fundamentos",
      t: "E1 — Identificar parámetros de una señal",
      enun: `La señal x(t) = 4·sin(400π·t − π/3) V se aplica a un osciloscopio.
(a) Identifica amplitud, frecuencia en Hz, frecuencia angular ω y fase.
(b) ¿Cuántos ciclos completa en 5 ms?`,
      pista: "Compara con A·sin(2πf·t + φ). Ojo: ω va en rad/s y ω = 2πf.",
      sol: `
<p><strong>(a)</strong> Comparando con A·sin(2πf·t + φ):</p>
<div class="formula">A = 4 V<br>2πf = 400π ⟹ <span class="destacada">f = 200 Hz</span><br>ω = 400π rad/s ≈ 1256.6 rad/s<br>φ = −π/3 rad = −60°</div>
<p><strong>(b)</strong> Periodo T = 1/f = 1/200 = 5 ms. En 5 ms hace exactamente <strong>1 ciclo</strong>.</p>`
    },
    {
      tag: "Fundamentos",
      t: "E2 — Del gráfico al dominio de frecuencia",
      enun: `Escuchas un tono puro de 440 Hz (la nota A4) mezclado con su armónico doble a menor volumen (amplitud ¼).`
      + `
(a) Escribe la expresión x(t) si la amplitud fundamental es 0.8.
(b) ¿Cómo se vería su espectro de líneas?`,
      pista: "El armónico doble está en 2f. Dibuja dos líneas verticales.",
      sol: `
<div class="formula">x(t) = 0.8·sin(2π·440·t) + 0.2·sin(2π·880·t)</div>
<p><strong>Espectro:</strong> línea en 440 Hz con altura 0.8 y línea en 880 Hz con altura 0.2. Nada más: por eso suena "limpio" comparado con un ruido (que tendría energía en todas las frecuencias).</p>`
    }
  ],

  e1: [
    {
      tag: "Serie de Fourier",
      t: "E3 — Coeficientes de una onda (estilo clase)",
      enun: `Calcule a₀, a₁ y b₁ de la señal periódica x(t) = t definida en (−π, π) con T = 2π (extensión periódica).`,
      pista: "a₀ = (1/T)∫x dt. Aprovecha simetrías: ¿x(t) es par o impar? ¿El producto x(t)·cos(t) es par o impar sobre un intervalo simétrico?",
      sol: `
<p><strong>a₀ (valor medio):</strong> la integral de una función impar (t) sobre (−π,π) es 0:</p>
<div class="formula">a₀ = (1/2π) ∫₋π^π t dt = 0</div>
<p><strong>aₙ:</strong> t·cos(nt) es impar × par = impar → integral simétrica = 0. Entonces <span class="destacada">aₙ = 0 ∀n</span>.</p>
<p><strong>b₁:</strong> t·sen(t) es par × par = par, se integra:</p>
<div class="formula">bₙ = (1/π) ∫₋π^π t·sen(nt) dt = (2/π)·[ −t·cos(nt)/n |₀^π + ∫ cos(nt)/n dt ] = (2/n)·(−1)<sup>n+1</sup></div>
<p>Para n = 1: <span class="destacada">b₁ = 2</span>. (Serie completa: x(t) = Σ (2/n)(−1)^{n+1}·sen(nt) — ¡la "onda sierra"!).</p>`
    },
    {
      tag: "Serie de Fourier",
      t: "E4 — Onda cuadrada: demostrar que solo hay impares",
      enun: `La onda cuadrada de período T con valores +1 y −1 alternándose (media 0) satisface x(t + T/2) = −x(t).
(a) ¿Por qué a₀ = 0?
(b) ¿Por qué los armónicos pares no aparecen?`,
      pista: "Sustituye t → t + T/2 en la serie, con T/2 correspondiente a desplazar n por un semiperiodo: sen(nω₀(t+T/2)) = sen(nω₀t + nπ).",
      sol: `
<p><strong>(a)</strong> a₀ es el valor medio. La onda pasa tanto tiempo en +1 como en −1 → promedio 0.</p>
<p><strong>(b)</strong> Al desplazar un semiperiodo: sen(nω₀(t+T/2)) = sen(nω₀t + nπ) = (−1)ⁿ·sen(nω₀t).
Pero la hipótesis dice que x(t+T/2) = −x(t), lo que exige (−1)ⁿ = −1, es decir, <strong>n impar</strong>. Si n es par, (−1)ⁿ = +1 y esa componente contradice la simetría → su coeficiente es 0.</p>
<div class="formula">x(t) = (4/π)·[ sen(ω₀t) + (1/3)·sen(3ω₀t) + (1/5)·sen(5ω₀t) + … ]</div>`
    },
    {
      tag: "Serie de Fourier",
      t: "E5 — Energía en los primeros armónicos",
      enun: `Para la onda cuadrada anterior, ¿qué porcentaje aproximado de la potencia total está contenida en el fundamental y en los 3 primeros armónicos impares (n = 1, 3, 5)?`,
      pista: "Por Parseval: la potencia de cada armónico es proporcional a (amplitud)². Para cuadrada la amplitud del armónico n es 4/(nπ).",
      sol: `
<p>La potencia total de una cuadrada de amplitud 1 es P = 1. Cada armónico impares aporta Pₙ = (1/2)·(4/(nπ))² = 8/(n²π²).</p>
<div class="formula">P₁ = 8/π² ≈ 81.1%<br>P₃ = 8/(9π²) ≈ 9.0%<br>P₅ = 8/(25π²) ≈ 3.2%<br>Total n=1,3,5 ≈ <span class="destacada">93.3%</span></div>
<p>¡Con solo 3 líneas capturas el 93% de la potencia! Esto justifica transmitir/armar ondas con pocos armónicos.</p>`
    }
  ],

  e2: [
    {
      tag: "Transformada",
      t: "E6 — Transformada del pulso rectangular",
      enun: `Sea x(t) = 1 para |t| ≤ τ/2 y 0 en otro lugar. Demuestre que X(f) = τ·sinc(f·τ), donde sinc(u) = sen(πu)/(πu).
¿Qué ocurre con el ancho de banda si τ se hace más pequeño?`,
      pista: "Aplica la integral directa: ∫_{−τ/2}^{τ/2} 1·e^{−j2πft}dt. Usa e^{−jθ} = cos θ − j sen θ y la simetría.",
      sol: `
<div class="formula">X(f) = ∫_{−τ/2}^{τ/2} e^{−j2πft} dt = [ e^{−j2πft} / (−j2πf) ]_{−τ/2}^{τ/2}<br>= (e^{jπfτ} − e^{−jπfτ}) / (j2πf) = 2j·sen(πfτ)/(j2πf)<br><span class="destacada">X(f) = τ · sen(πfτ)/(πfτ) = τ·sinc(fτ)</span></div>
<p>Primer cero en f = 1/τ. Si τ ↓ (pulso más angosto) → 1/τ ↑ ⇒ el espectro se ABRE. <strong>Pulso estrecho = ancho de banda grande</strong> (relación tiempo–frecuencia). El demo "Pulso → sinc" te lo muestra en vivo.</p>`
    },
    {
      tag: "Transformada",
      t: "E7 — Propiedad de escalamiento",
      enun: `Si x(t) ↔ X(f), halla la transformada de y(t) = x(3t) (señal comprimida 3× en el tiempo). ¿El ancho de banda aumenta o disminuye y en cuánto?`,
      pista: "Cambia de variable u = 3t en la integral de Fourier.",
      sol: `
<div class="formula">Y(f) = ∫ x(3t)·e^{−j2πft}dt — u = 3t, dt = du/3<br>Y(f) = (1/3)∫ x(u)·e^{−j2π(f/3)u}du = <span class="destacada">(1/3)·X(f/3)</span></div>
<p>El espectro se ESTIRA 3× en frecuencia (X(f/3) evalúa más lejos). Comprimir en tiempo = expandir en frecuencia: por eso los pulsos cortos (chip de 1 ns en UWB/radar) ocupan GHz, y una nota de órgano larga es espectralmente muy angosta.</p>`
    },
    {
      tag: "Transformada",
      t: "E8 — Ancho de banda de una señal compuesta",
      enun: `Una señal x(t) = 2·cos(2π·1000·t) + cos(2π·2500·t) se filtra con un ideal paso-bajas de corte en 2000 Hz.
(a) ¿Qué componentes pasan?
(b) ¿Cuál es el ancho de banda de x(t) y del resultado filtrado?`,
      pista: "Ancho de banda = frecuencia máxima presente (basebanda). El filtro elimina todo por encima de fc.",
      sol: `
<p><strong>(a)</strong> Pasan 1000 Hz (amplitud 2); se elimina 2500 Hz &gt; 2000 Hz. Resultado: 2·cos(2π·1000·t).</p>
<p><strong>(b)</strong> B de x(t) = 2500 Hz; B del filtrado = <span class="destacada">1000 Hz</span>.</p>
<p>Nota: filtrar ES operar en el dominio de la frecuencia — todo filtro es "Fourier con interruptor".</p>`
    }
  ],

  e3: [
    {
      tag: "Muestreo",
      t: "E9 — Nyquist en tu proyecto ECG",
      enun: `El contenido útil de un ECG clínico es 0.05 Hz – 40 Hz (además de posible interferencia de 60 Hz de la red).
(a) fs mínima teórica para el rango diagnóstico.
(b) Si además quieres capturar la de 60 Hz sin aliasing, ¿fs mínima?
(c) Justifica por qué el estándar clínico usa 250–500 Hz.`,
      pista: "Nyquist: fs ≥ 2·f_máx. Recuerda: si fs = 100 y f = 60, ¿qué alias sale?",
      sol: `
<p><strong>(a)</strong> f_máx = 40 Hz → fs ≥ <span class="destacada">80 Hz</span>.</p>
<p><strong>(b)</strong> f_máx = 60 Hz → fs ≥ <span class="destacada">120 Hz</span>.</p>
<p><strong>(c)</strong> Con fs = 100 Hz (insuficiente), la de 60 Hz se pliega a |60−100| = 40 Hz ¡justo encima del QRS! Por eso: (i) se muestrea con margen, (ii) los filtros analógicos del AD8232 atenúan fuera de banda ANTES del ADC, y (iii) 250–500 Hz da resolución temporal fina (un bin DFT cómodo: con fs=500 y N=512 → Δf ≈ 1 Hz).</p>`
    },
    {
      tag: "Muestreo",
      t: "E10 — Detectar y corregir un aliasing",
      enun: `En un laboratorio muestrean una señal supuesta de 70 Hz con fs = 100 Hz y la gráfica "lenta" sugiere 30 Hz.
(a) Explica el fenómeno.
(b) ¿Qué dos formas hay de corregirlo?`,
      pista: "Pliegue en fs/2. Recuerda el tren de réplicas del espectro.",
      sol: `
<p><strong>(a)</strong> Nyquist = 50 Hz &lt; 70 Hz. Las réplicas del espectro (centradas en k·fs) invaden la banda base: la copia en f = fs − f₀ = 30 Hz aparece como si fuera la señal real. Las muestras de 70 Hz y 30 Hz son <em>idénticas</em>: no hay forma de distinguirlas DESPUÉS de muestrear.</p>
<p><strong>(b)</strong> ① Aumentar fs ≥ 140 Hz. ② Filtrar analógicamente (anti-alias, paso-bajas &lt; fs/2) ANTES del ADC para quitar el contenido &gt; 50 Hz. Nunca se recupera con software.</p>`
    }
  ],

  e4: [
    {
      tag: "DFT / FFT",
      t: "E11 — Bins y resolución espectral",
      enun: `Tu ESP32 captura ECG con fs = 400 Hz y N = 800 muestras por ventana de análisis.
(a) Δf de la DFT.
(b) ¿En qué bin k aparece una interferencia de 50 Hz?
(c) Si quieres distinguir componentes separadas por 1 Hz, ¿N mínimo?`,
      pista: "Δf = fs/N; k = f/Δf.",
      sol: `
<div class="formula">(a) Δf = 400/800 = <span class="destacada">0.5 Hz</span><br>(b) k = 50/0.5 = <span class="destacada">bin 100</span><br>(c) Δf ≤ 1 ⟹ N ≥ fs/1 = <span class="destacada">800</span> (¡ya lo tienes!)</div>
<p>Las frecuencias "visibles" son f = k·Δf: k = 0 (DC), 1, 2, … hasta N/2 = fs/2. La resolución depende del TIEMPO observado: T_ventana = N/fs = 2 s aquí.</p>`
    },
    {
      tag: "DFT / FFT",
      t: "E12 — FFT: costo computacional",
      enun: `Comparar el costo de la DFT directa vs FFT para N = 1024 puntos. ¿Qué gana el ESP32 con la FFT?`,
      pista: "DFT directa: N² operaciones complejas. FFT radix-2: (N/2)·log₂N mariposas… usa órdenes de magnitud.",
      sol: `
<div class="formula">DFT directa ≈ N² = 1 048 576 operaciones<br>FFT ≈ N·log₂N = 1024 × 10 = 10 240<br>Aceleración ≈ <span class="destacada">102×</span></div>
<p>En un ESP32 a 240 MHz, la FFT de 1024 toma milisegundos; la DFT directa segundos — inviable para vigilancia cardíaca en tiempo real. Por eso el DSP moderno (y tus futuras demodulaciones) viven de la FFT.</p>`
    },
    {
      tag: "Comunicaciones",
      t: "E13 — FDM: empaquetar canales (el futuro Comunicaciones II)",
      enun: `Tres señales de audio (cada una con B = 3 kHz) deben viajar por el mismo medio.
(a) ¿Cuál es el ancho de banda total si NO usamos multiplexación por frecuencia?
(b) Con FDM, si cada una se desplaza a una portadora distinta, ¿qué separación mínima sugieres y qué B total ocupa el sistema de 3 canales con separación 0?`,
      pista: "FDM = desplazar el espectro de cada señal (modulación) a bandas no solapadas — usa la propiedad x(t)·cos(2πf_c t) ↔ ½[X(f−f_c)+X(f+f_c)].",
      sol: `
<p><strong>(a)</strong> Sin FDM no pueden compartir el medio simultáneamente (se superpondrían en la misma banda): solo 3 kHz útiles a la vez, o un medio de 9 kHz si las "pegamos" en tiempo… FDM justamente es lo que evita el solapamiento en FRECUENCIA.</p>
<p><strong>(b)</strong> Cada señal ocupa 3 kHz. Portadoras, por ejemplo: f_c1 = 60 kHz, f_c2 = 64 kHz, f_c3 = 68 kHz (separadas 4 kHz &gt; B). B total del sistema ≈ 58–70 kHz ≈ 12 kHz útiles + guardas. El receptor sintoniza con filtros pasobanda — ¡otra vez Fourier, ahora como filtro!</p>`
    },
    {
      tag: "Comunicaciones",
      t: "E14 — De la teoría a tu proyecto",
      enun: `Conecta cada concepto de la guía con un elemento concreto del proyecto ECG / futuro comunicaciones:
1) Ancho de banda → 2) Nyquist → 3) DFT/FFT → 4) Serie de Fourier → 5) Modulación (x·cos).`,
      pista: "Piensa: AD8232, ESP32 ADC, espectro del QRS, armónicos de una onda cuadrada digital, FDM/OFDM.",
      sol: `
<ol>
<li><strong>B</strong> → el AD8232 deja pasar 0.5–40 Hz: define qué necesitas muestrear.</li>
<li><strong>Nyquist</strong> → fs ≥ 80 Hz teórico; usas 250–500 Hz en el ADC del ESP32.</li>
<li><strong>DFT/FFT</strong> → en el ESP32 calculas el espectro del ECG para detectar frecuencias anómalas o rechazar 60 Hz.</li>
<li><strong>Serie de Fourier</strong> → el complejo QRS "cuadrado" se explica con armónicos impares hasta ~40 Hz; es la misma matemática que tus ejercicios aₙ/bₙ.</li>
<li><strong>Modulación</strong> → en Comunicaciones II, multiplicar por la portadora llevará tu señal (o audio, o datos) a la frecuencia de transmisión; FDM/OFDM empacan muchos "ECGs/usuarios" en un mismo medio.</li>
</ol>`
    }
  ]
};

/* ============================================================
   Renderizado
   ============================================================ */

const QuizUI = (() => {
  const estado = JSON.parse(localStorage.getItem("fourier_quiz") || "{}");

  function renderQuiz(cont, clave) {
    const preguntas = QUIZ_DATA[clave];
    if (!preguntas) return;
    cont.className = "quiz";
    cont.innerHTML = `
      <div class="quiz-cab">
        <span>Quiz — ${cont.dataset.titulo || clave}</span>
        <span class="quiz-score" id="score-${clave}">0 / ${preguntas.length}</span>
      </div>
      <div class="quiz-cuerpo"></div>`;
    const cuerpo = cont.querySelector(".quiz-cuerpo");

    preguntas.forEach((p, i) => {
      const idP = clave + "_" + i;
      const div = document.createElement("div");
      div.className = "pregunta";
      div.innerHTML = `
        <div class="pregunta-texto"><span class="num">${i + 1}.</span>${p.q}</div>
        <div class="opciones"></div>
        <div class="explicacion" id="exp-${idP}"></div>`;
      const ops = div.querySelector(".opciones");
      p.op.forEach((texto, j) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "opcion";
        b.textContent = texto;
        b.addEventListener("click", () => responder(clave, i, j, p, div, ops));
        ops.appendChild(b);
      });
      cuerpo.appendChild(div);
    });

    actualizarScore(clave, preguntas);
  }

  function responder(clave, i, j, p, div, ops) {
    const idP = clave + "_" + i;
    if (estado[idP] !== undefined) return;
    estado[idP] = j;
    localStorage.setItem("fourier_quiz", JSON.stringify(estado));

    const btns = ops.querySelectorAll(".opcion");
    btns.forEach((b, k) => {
      b.disabled = true;
      if (k === p.r) b.classList.add("correcta");
      if (k === j && j !== p.r) b.classList.add("incorrecta");
    });

    const exp = div.querySelector("#exp-" + idP);
    const ok = j === p.r;
    exp.innerHTML = (ok ? "<strong>✔ Correcto. </strong>" : "<strong>✘ Incorrecto. </strong>") + p.exp;
    exp.classList.add("visible");

    const preguntas = QUIZ_DATA[clave];
    actualizarScore(clave, preguntas);
  }

  function actualizarScore(clave, preguntas) {
    let aciertos = 0, contestadas = 0;
    preguntas.forEach((p, i) => {
      const idP = clave + "_" + i;
      if (estado[idP] !== undefined) {
        contestadas++;
        if (estado[idP] === p.r) aciertos++;
      }
    });
    const el = document.getElementById("score-" + clave);
    if (el) el.textContent = `${aciertos} / ${preguntas.length}` + (contestadas < preguntas.length ? ` (${contestadas} respondidas)` : " — ¡completo!");
  }

  function renderEjercicios(cont, clave) {
    const lista = EJERCICIOS[ejeDeNivel(clave)];
    if (!lista) return;
    lista.forEach((e) => {
      const div = document.createElement("div");
      div.className = "ejercicio";
      div.innerHTML = `
        <div class="ejercicio-cab"><span class="ejercicio-tag">${e.tag}</span>${e.t}</div>
        <div class="ejercicio-cuerpo">
          <p>${e.enun.replace(/\n/g, "<br>")}</p>
          <div class="pista">💡 <strong>Pista:</strong> ${e.pista}</div>
          <details class="solucion"><summary>Ver solución paso a paso</summary>
            <div class="sol-cuerpo">${e.sol}</div>
          </details>
        </div>`;
      cont.appendChild(div);
    });
  }

  function ejeDeNivel(clave) {
    return { n0: "e0", n1: "e1", n2: "e2", n3: "e3", n4: "e4", nf: "e4" }[clave] || clave;
  }

  function init() {
    document.querySelectorAll("[data-quiz]").forEach((c) => {
      renderQuiz(c, c.dataset.quiz);
    });
    document.querySelectorAll("[data-ejercicios]").forEach((c) => {
      // evita duplicar si se llama dos veces
      if (c.dataset.rendered) return;
      c.dataset.rendered = "1";
      const nivel = c.dataset.ejercicios;
      // si es contenedor de un nivel específico
      const ejeKey = ejeDeNivel(nivel);
      const lista = EJERCICIOS[ejeKey];
      if (lista && nivel !== "todos") {
        renderEjercicios(c, nivel);
      } else if (nivel === "todos") {
        ["e0", "e1", "e2", "e3", "e4"].forEach((k) => {
          EJERCICIOS[k].forEach((e) => {
            const div = document.createElement("div");
            div.className = "ejercicio";
            div.innerHTML = `
              <div class="ejercicio-cab"><span class="ejercicio-tag">${e.tag}</span>${e.t}</div>
              <div class="ejercicio-cuerpo">
                <p>${e.enun.replace(/\n/g, "<br>")}</p>
                <div class="pista">💡 <strong>Pista:</strong> ${e.pista}</div>
                <details class="solucion"><summary>Ver solución paso a paso</summary>
                  <div class="sol-cuerpo">${e.sol}</div>
                </details>
              </div>`;
            c.appendChild(div);
          });
        });
      }
    });
  }

  return { init };
})();
