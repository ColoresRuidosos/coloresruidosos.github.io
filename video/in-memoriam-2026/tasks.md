# tasks.md: avance del vídeo

✅ hecho · ⏳ pendiente · 🔴→🟢 cubierto por pruebas (primero en rojo, luego el código)

## Fase 1: Spec
- ✅ Spec, plan y lista verificada con dos fuentes por artista
- ✅ Revertir la sección `/in-memoriam/` del sitio (el equipo quería un vídeo, no una página)

## Fase 2: Dominio (TDD)
- ✅ 🔴→🟢 Contrato de `datos.json`: campos, fecha `AAAA-MM[-DD]` válida y **de 2026**, país hispanohablante, dos fuentes https, ids únicos (`tests/video.test.js`)
- ✅ 🔴→🟢 Línea propia ≤ 70 caracteres y sin causa de muerte
- ✅ 🔴→🟢 Orden cronológico (las fechas de solo mes van al final de su mes)
- ✅ 🔴→🟢 Fecha legible: «8 de enero», «enero»
- ✅ 🔴→🟢 Línea de tiempo: duración total, escena y progreso para cualquier `t`, límites exactos
- ✅ 🔴→🟢 Cuadrícula de la ofrenda para N veladoras
- ✅ 🔴→🟢 Generador pseudoaleatorio con semilla (mismo resultado en cada corrida)

## Fase 3: Vídeo
- ✅ `video.html`: intro, tarjetas, ofrenda, pétalos y cierre
- ✅ `render.js`: fotogramas → MP4 1080×1920 a 30 fps + `contacto.png`
- ✅ Revisión visual con la hoja de contacto
- ✅ `pie.md` para la publicación

## Fase 4: Publicación
- ⏳ El equipo revisa la lista y decide B1–B5 (`spec.md`)
- ⏳ Subir a Instagram/TikTok con música de la plataforma
- ⏳ Si se publica en X, agregarlo a awesome-opus5-5-videos (cada entrada necesita la URL del post)
