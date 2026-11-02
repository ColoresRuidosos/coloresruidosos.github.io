# in-memoriam.md — F16: In memoriam

> Spec propia de la sección (igual que `docs/trivia.md` para F15). Resumen en `spec.md` (F16), decisión técnica en `plan.md` (D22), avance en `tasks.md` (Fase 7).
> Metodología: Spec-Driven Development. Primero qué y por qué; el código viene después y con pruebas antes.

## 1. Visión

**Problema.** El fanzine cubre la escena indie/rock de México, España y Latinoamérica, pero no tiene un lugar para recordar a quienes la hicieron y ya no están. Cuando muere alguien, la nota del día se pierde en el listado y en un mes ya no aparece.

**Solución.** Una página fija, `/in-memoriam/`, con un muro de artistas de nuestro ámbito que se nos adelantaron: nombre, años, proyectos, una línea propia sobre por qué importan y la fuente que confirma cada fecha. Arriba, quienes se fueron este año; abajo, todos los demás, de lo más reciente a lo más antiguo. Se puede filtrar por México, España y Latinoamérica.

**Principios editoriales (además de los de `spec.md`)**
1. **Veracidad antes que cantidad.** Ninguna fecha se escribe de memoria: cada artista lleva al menos una fuente enlazada (medio reconocido, enciclopedia o comunicado oficial) que confirma el fallecimiento. Al preparar esta spec, la verificación corrigió fechas que se "sabían" (Carlos Berlanga, Germán Coppini, Sergio Algora, Gloria van Aerssen, Manolo Tena). Por eso la regla es estricta.
2. **Si hay duda, se queda fuera.** Fechas que no coinciden entre fuentes se publican solo con la precisión segura (año o año-mes). Una muerte no confirmada nunca se publica (`estado: propuesta`).
3. **Respeto.** No se menciona la causa de muerte, no hay detalles morbosos ni polémicas. Se recuerda la obra, no el final.
4. **Sin imágenes ajenas** (mismo principio que las notas): nada de fotos de prensa. El diseño es tipográfico, con una veladora dibujada por nosotros.
5. **Nuestro ámbito.** Rock, indie, alternativo, punk, pop-rock y cantautores ligados a esa escena. Se excluyen regional mexicano, pop masivo, tropical y urbano, aunque el artista sea muy querido. Los casos frontera los decide el equipo (ver Decisiones abiertas).

**Métricas de éxito**
- 0 errores de fecha reportados en el primer mes.
- La sección se actualiza en menos de 7 días cuando muere un artista del ámbito (la nota del pipeline sirve de aviso).
- Cada año, la sección "Este año" es la base del post de fin de año (diciembre).

**Fuera de alcance (v1)**
- Detección automática de muertes desde el pipeline de notas (el modelo podría confundir aniversarios con fallecimientos: el riesgo es alto y el volumen bajo).
- Fotos o ilustraciones por artista (posible fase 2, solo con ilustraciones propias del equipo, igual que `assets/notas/`).
- Estación de radio "In memoriam" (posible fase 2: basta con agregar una estación en `data/radio.yaml`).
- Comentarios o velas virtuales de visitantes (requiere backend).
- Brasil y otros países no hispanohablantes: **decisión abierta**. v1 cubre países hispanohablantes, que es lo que el fanzine cubre hoy.

## 2. Usuarios

| Rol | Necesita |
|---|---|
| Lector | Recordar, descubrir a quién no conocía, saber de qué banda era y llegar a una fuente seria |
| Curador (Pardy, Tanelly, Dany, Pratz) | Proponer a alguien y saber si ya está; ver que lo publicado está verificado |
| Mantenedor técnico (Edgar) | Agregar una entrada editando un JSON, con pruebas que impidan publicar algo mal formado |

## 3. Funcionalidades

**F16.1 Muro.** Una tarjeta por artista: nombre artístico, nombre completo (si es distinto), país, años (`1959 – 2014`, o solo `† 2025` si no hay nacimiento confirmado), proyectos, semblanza propia (≤ 160 caracteres) y enlace "Fuente".

**F16.2 Este año.** Bloque superior con quienes fallecieron en el año en curso (año de la compilación). Si no hay nadie, el bloque no aparece.

**F16.3 Orden.** Por fecha de fallecimiento, de la más reciente a la más antigua, agrupado por año. Las fechas con menos precisión (`2025-05` o `1980`) se ordenan dentro de su periodo.

**F16.4 Filtro por región.** Todos · México · España · Latinoamérica. Sin JavaScript se ve todo (mejora progresiva). El filtro anuncia cuántos artistas quedan visibles (lector de pantalla).

**F16.5 Contrato de datos.** `data/in_memoriam.json`, validado por pruebas: campos obligatorios, fechas válidas y no futuras, nacimiento antes de fallecimiento, región coherente con el país, fuentes `https`, ids únicos, semblanza sin causa de muerte (se bloquean palabras como *suicidio*, *sobredosis*, *cáncer*, *accidente*).

**F16.6 Estados.** `verificada` se publica; `propuesta` no se publica (lista de pendientes para el equipo, dentro del mismo JSON).

## 4. Flujos

**H. Visitar.** Menú → In memoriam → bloque "Este año" → muro por año → filtro de región → "Fuente" abre el medio en otra pestaña.

**I. Alta de un artista.**
1. Muere alguien del ámbito (normalmente aparece en las notas o lo avisa un curador).
2. Se agrega a `data/in_memoriam.json` con `estado: propuesta`, fuente y fechas.
3. Alguien del equipo abre la fuente y confirma fecha, país y proyectos; si las fuentes no coinciden en el día, se deja año-mes.
4. Pasa a `estado: verificada`. Las pruebas (`node --test`) validan el formato; la siguiente compilación lo publica.

**J. Corregir.** Un lector avisa en redes → se corrige el JSON (o se regresa a `propuesta` para ocultarlo de inmediato) → push.

## 5. Arquitectura

```
data/in_memoriam.json ──► layouts/in-memoriam/section.html (Hugo: orden, agrupado, "Este año")
                                  │
assets/js/in-memoriam/logica.js ──┤ (puro: validar, región, ordenar, filtrar; se prueba con node --test)
assets/js/in-memoriam/muro.js ────┘ (DOM: botones de filtro, solo en /in-memoriam/)
tests-js/in-memoriam.test.js ───► contrato del JSON + lógica
content/in-memoriam/_index.md ──► título y descripción
```

Sin backend, sin llamadas a APIs, sin costo por visita. Modelo de cada entrada:

```json
{
  "id": "gustavo-cerati",
  "nombre": "Gustavo Cerati",
  "nombre_completo": "Gustavo Adrián Cerati",
  "pais": "AR",
  "region": "latam",
  "nacimiento": "1959-08-11",
  "fallecimiento": "2014-09-04",
  "proyectos": ["Soda Stereo"],
  "semblanza": "Texto propio, máx. 160 caracteres, sin causa de muerte.",
  "fuentes": ["https://…"],
  "estado": "verificada"
}
```

Fechas: `AAAA`, `AAAA-MM` o `AAAA-MM-DD`. `nacimiento` y `nombre_completo` son opcionales. `pais` es el país de la escena donde hizo su carrera (Luca Prodan nació en Roma, pero su obra es del rock argentino).

## 6. Requisitos no funcionales

- **Veracidad:** fuente obligatoria por entrada; fechas parciales cuando hay discrepancia; nada de memoria.
- **Tono y respeto:** sin causas de muerte (validado por prueba), sin chistes, sin el rosa de "Viene a México".
- **Identidad (SPEC-001):** la sección usa tinta y crema (luto sobrio) con un solo acento naranja cempasúchil (`--accent-orange`), siempre con texto tinta encima. Veladora en SVG propio.
- **Accesibilidad:** filtro con botones `aria-pressed`, contador en `aria-live`, contraste AA, funciona sin JavaScript, respeta `prefers-reduced-motion` (la flama de la veladora no se anima).
- **Rendimiento:** HTML estático; el JS de la sección pesa < 3 KB y solo se carga en `/in-memoriam/`.
- **Responsive:** sin desborde horizontal a 360 px.

## Decisiones abiertas (para el equipo)

| # | Pregunta | Mientras tanto |
|---|---|---|
| A1 | ¿Incluimos Brasil (Cazuza, Renato Russo, Chico Science, Rita Lee…)? | Fuera |
| A2 | ¿Cantautores de canto nuevo/nueva canción (p. ej. Gabino Palomares, † 2026-09-30)? | En `propuesta` |
| A3 | ¿Artistas latinos de bandas con base en EE. UU. (p. ej. Juan Brujo, de Brujería)? | Fuera |
| A4 | Mauricio Aznar (Más Birras): la fecha de 2000 nunca se confirmó del todo | En `propuesta` |
| A5 | Enrique Sierra (Radio Futura): solo fuentes débiles para el día exacto | En `propuesta` |
| A6 | Armando Vega Gil (Botellita de Jerez): su muerte está ligada a una acusación pública; ¿entra y cómo? | En `propuesta` |

## Registro de verificación (2026-11-02)

Cada entrada `verificada` del JSON lleva su fuente. Cuando las fuentes no coincidían en el día, se publicó con menos precisión:

| Artista | Discrepancia | Se publica |
|---|---|---|
| Canito (Tos) | 2 o 3 de enero de 1980 | `1980-01` |
| David Lerma "El Guadaña" (Bostik) | 18 o 19 de mayo de 2025 | `2025-05` |
| Pappo | Noche del 24 o madrugada del 25 de febrero de 2005 | `2005-02-25` (la mayoría de las fuentes) |
| Jesús de la Rosa (Triana) | 13 o 14 de octubre de 1983 | `1983-10` |
| Federico Moura (Virus) | Nacimiento sin día confirmado | Solo fallecimiento |
| Tino Casal | Nacimiento 1946 o 1950 | Solo fallecimiento |
| Carmen Santonja (Vainica Doble) | Día exacto solo en una ficha de IMDb | `2000` |
| Robe Iniesta, Víctor Coyote, Indio Solari | Solo el año de nacimiento en prensa | Año de nacimiento |
