# spec.md: infografía «Siloé viene a México»

> Spec-Driven Development: qué y por qué. El cómo está en `plan.md`; el avance, en `tasks.md`.
> Pieza para redes (Instagram, feed vertical), no una sección del sitio.

## 1. Visión

**Problema.** Siloé, trío indie pop-rock de Valladolid, viene a México en noviembre de 2026 como invitado de Morat en el Palacio de los Deportes. Mucha gente en México no lo conoce todavía y la oportunidad de presentarlo es ahora.

**Solución.** Una infografía de 1080×1350 (formato vertical del feed de Instagram) que presenta a la banda en un vistazo: quiénes son, sus cinco discos, dos datos que enganchan y cuándo y dónde verlos en México. Con la identidad del fanzine y el sticker rosa «Viene a México».

**Regla de veracidad (no negociable).** Cada dato que aparece en la imagen tiene **al menos dos fuentes independientes** registradas en `datos.json`, **o el anuncio oficial del organizador** (fuente primaria) registrado con quién lo emite, por qué medio y cuándo lo recibió el equipo. *(Ampliación del 2026-11-02, por el flyer oficial de El Claustro.)* Un dato con una sola fuente no se publica; queda en `pendientes` para que el equipo lo confirme. Las pruebas lo hacen cumplir y la imagen solo dibuja datos `verificado`.

**Métricas de éxito**
- 0 correcciones después de publicar.
- Guardados y compartidos por encima del promedio de las publicaciones del fanzine.

**Fuera de alcance**
- Versión historia (1080×1920) y carrusel: se agregan después, con el mismo `datos.json`.
- Fotos de la banda: sin imágenes ajenas (principio del fanzine). Es una pieza tipográfica.

## 2. Usuarios

| Rol | Necesita |
|---|---|
| Seguidor en México | Saber en 10 segundos quién es Siloé, por dónde empezar a escucharlos y dónde verlos |
| Equipo (Pardy, Tanelly, Dany, Pratz) | Un PNG listo y el texto del pie con las fuentes |
| Mantenedor (Edgar) | Corregir o agregar un dato editando `datos.json` y volver a exportar con un comando |

## 3. Funcionalidades

- **I1 Datos con evidencia.** `datos.json`: cada dato tiene id, texto, fuentes (≥ 2, https, de dominios distintos) y estado (`verificado` o `pendiente`).
- **I2 Bloques.** Cabecera (nombre, origen, género y sticker «Viene a México»), integrantes, línea de tiempo de discos, «para que los conozcas» (2 datos) y la fecha en México.
- **I5 Charla-showcase en El Claustro (solo en el vídeo).** Martes 3 de noviembre de 2026, 14:00, Patio Gran Claustro (Universidad del Claustro de Sor Juana, CDMX). Fuente: flyer oficial de El Claustro. Una prueba comprueba que la fecha cae en martes, como dice el flyer. Por decisión del equipo aparece en el vídeo, no en la infografía, que se queda como estaba.
- **I3 Exportación.** `node exportar.js` genera `siloe-viene-a-mexico.png` (1080×1350).
- **I4 Pie.** `pie.md` con el texto de la publicación y las fuentes.

## 4. Flujos

**A. Publicar.** `node --test tests/*.test.js` → `node exportar.js` → revisar el PNG → publicar con `pie.md`.

**B. Confirmar un pendiente.** Alguien del equipo encuentra la segunda fuente (por ejemplo, las fechas exactas en Ticketmaster MX u OCESA) → agrega la URL a `datos.json` → `verificado` → se vuelve a exportar.

## 5. Arquitectura

```
datos.json ──► datos.js (puro: validar, publicables) ──► tests/infografia.test.js
     │
     ▼
infografia.html (HTML/CSS, 1080×1350, lee datos.json y pinta solo lo verificado)
     │
exportar.js (Playwright: captura) ──► siloe-viene-a-mexico.png
```

## 6. Requisitos no funcionales

- **Veracidad:** dos fuentes por dato, comprobado por prueba; las fechas sin confirmar no salen.
- **Identidad SPEC-001:** crema, tinta, bordes de 3 px, sombras duras; verde = Lanzamiento (discos), naranja = Gira (México); el rosa solo en el sticker «Viene a México». Anton, Space Grotesk y Space Mono.
- **Legibilidad en celular:** texto ≥ 26 px en el lienzo de 1080; contraste AA.
- **Sin red al exportar:** tipografías locales.

## Registro de verificación (2026-11-02)

| Dato | Fuentes | Estado |
|---|---|---|
| Trío indie pop-rock de Valladolid | Rolling Stone en Español; La Ganzúa | ✅ |
| Fito Robles (voz), Xavi Road (guitarra y producción), Jaco Betanzos (batería, desde 2022) | Rolling Stone en Español; Cierra por Fuera | ✅ |
| *La Verdad* (22 de abril de 2016) | Qobuz; La Higuera | ✅ |
| *La Luz* (2018) | Qobuz; Last.fm | ✅ |
| *Metrópolis* (2020) | Deezer; Last.fm | ✅ |
| *Santa Trinidad* (27 de octubre de 2023) | Deezer; La Ganzúa | ✅ |
| *Terrorismo Emocional* (8 de mayo de 2026, 10 canciones) | La Ganzúa; Apple Music | ✅ |
| «Nada que se parezca a ti», campaña de turismo de Castilla y León 2023 | Turismo Castilla y León (oficial); Cortes de Castilla y León (BOCCL) | ✅ |
| Tocaron ante el papa León XIV en Madrid (junio de 2026) | La Ganzúa; esMadrid (programa oficial) | ✅ |
| En México: invitados de Morat, Palacio de los Deportes, noviembre de 2026 | Navarra Arena; Cádiz Directo; Nosoloindie | ✅ |
| Charla-showcase en El Claustro: martes 3 de noviembre de 2026, 14:00, Patio Gran Claustro | Flyer oficial de El Claustro (compartido por el equipo el 2026-11-02); no aparece en la web todavía | ✅ (fuente oficial) |
| Días exactos en México: 14, 15 y 17 de noviembre | Solo Cádiz Directo (cita a Ticketmaster) | ⏳ pendiente |
| Beca de Fito Robles en Berklee | Cierra por Fuera; Vigoé (fuentes menores) | ⏳ pendiente |
| Origen del nombre (estanque de Siloé) | Solo Fnac | ⏳ pendiente |
| Título del disco por una broma de Santi Balmes | Solo La Ganzúa | ⏳ pendiente |
| Teloneros de Franz Ferdinand en México (feb–mar 2026) | Una nota sin confirmar | ❌ fuera |
