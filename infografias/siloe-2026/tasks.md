# tasks.md: avance de la infografía

✅ hecho · ⏳ pendiente · 🔴→🟢 cubierto por pruebas (primero en rojo)

## Fase 1: Spec y verificación
- ✅ Investigación y registro de verificación (`spec.md`)
- ✅ Plan (`plan.md`)

## Fase 2: Datos (TDD)
- ✅ 🔴→🟢 Cada dato: id único, texto, estado válido
- ✅ 🔴→🟢 Un dato `verificado` tiene ≥ 2 fuentes https de dominios distintos
- ✅ 🔴→🟢 Solo se publican los `verificado`; los bloques obligatorios (banda, integrantes, discos, México) están verificados
- ✅ 🔴→🟢 Discos en orden cronológico

## Fase 3: Pieza
- ✅ `infografia.html` (1080×1350) y `exportar.js`
- ✅ Revisión visual del PNG
- ✅ `pie.md`

## Fase 4: Publicación
- ⏳ Confirmar en Ticketmaster MX u OCESA en qué fechas abre Siloé y, si se confirma, agregarlas
- ⏳ Publicar

## Fase 5: Vídeo dinámico (`spec-video.md`)
- ✅ Elegir el prompt base del repo (`aschapmann-724497`, con la técnica de `notdwd-766641`) y leer la identidad del sitio desde el código
- ✅ 🔴→🟢 `escenas.js`: guion solo con datos verificados, línea de tiempo, resorte con rebote, pulso de 120 BPM, cortinilla entre escenas (`tests/video.test.js`)
- ✅ `video.html` (seek(t), 1080×1920) y `render-video.js`
- ✅ Revisión de fotogramas (que nada se encime ni se corte) y render final

## Fase 6: Charla-showcase en El Claustro (I5, S6, F6)
- ✅ 🔴→🟢 `datos.js` acepta la fuente oficial del organizador; la fecha del showcase cae en martes
- ✅ 🔴→🟢 El guion del vídeo incluye el showcase
- ✅ Vídeo actualizado y revisado (la infografía se queda sin el showcase, por decisión del equipo)
- ⏳ Agregar la URL de la publicación de El Claustro cuando exista
