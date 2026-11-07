# spec.md — Reel "¿Qué tan fan eres?" · Love of Lesbian (Colores Ruidosos)

> Spec-Driven Development: qué y por qué. El cómo está en `plan.md`, el orden de trabajo (tests primero) en `tasks.md`, la dirección en `TREATMENT.md`.

## 1. Visión

**Problema.** Los reels de Colores Ruidosos se estancan en ~15k reproducciones / ~10k espectadores. Datos reales de los dos últimos (México vs. José Madero; Trivia LoL):

| Métrica | Madero | Trivia LoL | Lectura |
|---|---|---|---|
| Visualizaciones | 15,480 | 15,178 | techo actual |
| Tiempo promedio | 9 s | 9 s | lo valioso debe pasar antes del s 9 |
| Comentarios | 24 | 26 | **punto débil**: casi nadie comenta |
| Compartidos / guardados | 223 / 248 | 109 / 207 | el contenido sí se valora |
| Inicio | "muy atractivo" | — | el gancho de 3 s ya funciona |

**Solución.** Un reel que se *juega* mientras se ve: 5 preguntas de la trivia con cuenta regresiva de 3 s. Cada respuesta es una pequeña recompensa (retención), el resultado es una identidad que se presume en comentarios (Pequeño lesbiano / Lesbianito / Viejo lesbiano), y el final enlaza con la trivia completa y las últimas fechas anunciadas en México.

**Métricas de éxito**
- > 20,000 visualizaciones en 7 días.
- Tiempo promedio ≥ 12 s (hoy 9 s).
- ≥ 100 comentarios (hoy ~25): el objetivo principal.
- Compartidos ≥ 200 (mantener).

**Fuera de alcance:** canciones de la banda en el audio, portadas o logos copiados, voz en off.

## 2. Usuarios

| Rol | Necesita |
|---|---|
| Fan que hace scroll (sin sonido) | Entender el juego en el primer cuadro, poder responder antes de que se revele, saber su categoría |
| Fan que no sigue la cuenta | Un motivo para comentar/etiquetar y llegar a `/trivia/` |
| Equipo (Pardy, Tanelly, Dany, Pratz) | Verificar los datos antes de publicar; publicar como colaboración con cuentas fan |
| Edgar | Poder rehacer el reel con otras preguntas u otra banda sin reescribir el motor |

## 3. Funcionalidades

- **R1 Gancho en el cuadro 0.** Título "¿QUÉ TAN FAN ERES?" y la primera pregunta ya visibles; nada de intro ni logo.
- **R2 Cinco preguntas** con dificultad creciente; cada una: pregunta → 4 opciones → cuenta 3·2·1 → revelación en verde. Fuente: `docs/trivia.md`, solo preguntas con fuente ✅.
- **R3 Colores por época.** Cada pregunta vive en la época de su disco; la profundidad de color crece con los años (1997 = 4 colores, 2005 = 8 bits, 2009+ = 16 bits). La pregunta final vuelve a 1997.
- **R4 Final con categoría:** 5/5 Viejo lesbiano · 3–4 Lesbianito · 0–2 Pequeño lesbiano, y la llamada "COMENTA LA TUYA".
- **R5 Cierre:** últimas fechas anunciadas en México (CDMX 24–26 nov, Puebla 28 nov) y `coloresruidosos.github.io/trivia`.
- **R6 Bucle:** el último cuadro empalma con el primero.
- **R7 Sonido:** chiptune original, blips de texto, tics de cuenta regresiva, fanfarria de acierto; funciona igual en silencio.
- **R8 Entregables:** `ultima-partida.mp4` 1080×1920 24 fps, `poster.jpg`, `ultima-partida.srt`, `CREDITS`, `FACTS.md`, `build.sh`.

## 4. Flujos

1. Scroll → cuadro 0 con la pregunta 1 → el fan responde en su cabeza → s 4: revelación (primera recompensa antes del s 9).
2. Preguntas 2–4 más rápidas → silencio de 1 s → "PREGUNTA FINAL" en 1997 → revelación sorpresa.
3. Pantalla de categoría → el fan comenta la suya → fechas y enlace → bucle al inicio.

## 5. Arquitectura

Página web determinista (`render(t)`) con framebuffer indexado de 180×320 px escalado ×6; render con Chromium headless (`core/render/video.mjs`); partitura y foley sintetizados en Python desde los mismos eventos; mezcla y masterizado a −14 LUFS con `core/render/mux.sh`. Detalle en `plan.md`.

## 6. Requisitos no funcionales

- **Zona segura de Reels/TikTok:** texto clave fuera del 15 % inferior y del 10 % derecho.
- **Legibilidad:** cada texto en pantalla ≥ caracteres ÷ 15 + 1.5 s (`readcheck.mjs`).
- **Veracidad:** cada dato con fuente ✅ en `FACTS.md`; un fan lo revisa antes de publicar. "Últimas fechas *anunciadas*", nunca "último concierto".
- **Derechos:** sin letras, sin audio de la banda, sin portadas; escenas pixel originales.
- **Determinismo:** cualquier cuadro se renderiza solo; sin `Math.random()` sin semilla.
- **Sonido:** −14 LUFS, sin cuadros negros.
