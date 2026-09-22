# Fourier Interactivo

Guía interactiva de la **Transformada de Fourier** de 0 a 100, orientada a la asignatura de **Comunicaciones I** (Ingeniería de Sistemas, UTP). Explica la serie de Fourier, la transformada, el muestreo y la DFT/FFT con demos visuales, quizzes y ejercicios tipo examen.

Abre un solo archivo (`index.html`) y funciona sin internet: no usa frameworks, CDNs ni dependencias.

---

## Contenido

La teoría está organizada en 5 niveles que conectan lo que ya sabes con lo que estudiarás más adelante:

| Nivel | Tema |
|-------|------|
| **N0 · Intro a señales** | Qué es una señal, senoide, frecuencia/amplitud/fase, dominio del tiempo vs frecuencia |
| **N1 · La idea de Fourier** | Descomponer ondas, síntesis aditiva, armónicos, serie de Fourier, coeficientes a₀, aₙ, bₙ, espectro |
| **N2 · La transformada** | Forma exponencial con e^{jθ}, transformada continua X(f), pares famosos (rect → sinc), ancho de banda |
| **N3 · Muestreo** | Analogía y digital, muestreo, teorema de Nyquist, aliasing, reconstrucción |
| **N4 · DFT y su mundo** | De CTFT a DFT, resolución Δf = fs/N, relación con FFT, contexto FDM/OFDM |

Cada nivel termina con un **quiz** (4 preguntas + explicación) y **ejercicios con solución paso a paso** (14 en total). Hay un quiz final de repaso de 10 preguntas.

## Demos interactivas

1. **Sintetizador de ondas** — construye cualquier señal sumando senos/cosenos y mira el espectro.
2. **Armónicos y Gibbs** — onda cuadrada, triangular y sierra; observa el fenómeno de Gibbs.
3. **Pulso → sinc** — la transformada de un pulso rectangular y el producto tiempo-ancho de banda (banda útil del ECG: 0.5–40 Hz).
4. **Aliasing** — qué pasa cuando muestreas por debajo de Nyquist (frecuencia alias por pliegue).
5. **ECG sintético** — genera un ECG con frecuencia cardiaca ajustable, muéstralo y calcula su DFT en tiempo real (tema del mini-proyecto ESP32 + AD8232).

Todas las demos se dibujan por nosotras en un `<canvas>`, sin librerías.

## Cómo ejecutar

Sin servidor (recomendado):

```
Abrir index.html en el navegador (doble clic)
```

Con servidor local (opcional, por si quieres GitHub Pages / Netlify):

```
python -m http.server 8000
# luego abre http://localhost:8000
```

## Estructura

```
Fourier_Interactivo/
├── index.html        # página completa (teoría + demos + quiz + checklist)
├── css/
│   └── estilos.css   # diseño (sidebar "curva de aprendizaje", responsive)
└── js/
    ├── plots.js      # mini-librería de gráficos sobre canvas (ejes, curvas, espectros)
    ├── demos.js      # las 5 demos interactivas + función ecg() y dft()
    ├── quiz.js       # preguntas, ejercicios y renderizado evaluado
    └── main.js       # navegación, barra de progreso, arranque
```

## Progreso y persistencia

La navegación lateral va marcando lo que ya leíste (IntersectionObserver) y la barra superior muestra el porcentaje completado. Los puntajes de los quizzes y el progreso se guardan en `localStorage` (`fourier_progreso_v1`, `fourier_quiz`); el botón "Reiniciar" los borra.

## Stack

HTML + CSS + JavaScript (vanilla), Canvas API, `localStorage`, sin dependencias externas. Compatible con cualquier navegador moderno; funciona offline.

## Créditos

Material preparado como complemento de estudio para la clase de **Comunicaciones I** (UTP). El contenido práctico se apoya en el mini-proyecto **ECG: ESP32 + AD8232** presentado en clase.

---

*Material educativo de libre uso para estudiar y compartir.*