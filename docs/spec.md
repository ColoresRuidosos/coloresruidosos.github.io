# spec.md — Colores Ruidosos: fanzine digital autónomo

> Versión consolidada. Reemplaza la spec anterior basada en Vite + revisión por Pull Request.
> Metodología: Spec-Driven Development (qué y por qué). El cómo está en `plan.md`; el avance en `tasks.md`.

## 1. Visión

**Problema.** El equipo quiere un medio vivo sobre la escena indie/rock, pero cuatro amigos con otros trabajos no pueden revisar medios y carteleras todos los días.

**Solución.** Un sitio Hugo que se actualiza solo cada mañana con hasta 3 notas y una agenda de conciertos de Pachuca y CDMX, con una capa humana ligera en Google Sheets para recomendar, corregir y despublicar sin tocar código.

**Principios editoriales**
1. Solo hechos, redacción propia en español. Sin frases copiadas ni citas textuales.
2. Créditos visibles con enlace a cada medio fuente.
3. Sin imágenes ajenas: solo embeds oficiales (Spotify, YouTube).
4. México primero: lo que viene a México, luego Latinoamérica, luego lo general.
5. Transparencia: el sitio indica que las notas se redactan con ayuda de IA.
6. Publicación 100% automática; la corrección es posterior (decisión explícita del equipo).

**Métricas de éxito (v1)**
- 30 días seguidos de corridas sin intervención técnica.
- ≥ 1 nota semanal con relevancia México o Latinoamérica.
- Menos de 1 nota despublicada por error a la semana.

**Fuera de alcance (v1)**
- Qué pasa con la web actual (reseñas, descargas y creador de stickers, tienda): **decisión abierta**.
- Dominio propio (v1 vive en la URL de Netlify).
- Recomendaciones de la comunidad (formulario abierto).
- Fuentes desde X/Instagram.

## 2. Usuarios

| Rol | Necesita |
|---|---|
| Lector | Enterarse de giras y lanzamientos, escuchar ahí mismo, llegar a la fuente original, encontrar conciertos y guardarlos en su calendario |
| Curador (Pardy, Tanelly, Dany, Pratz) | Recomendar, corregir u ocultar eventos y despublicar notas desde el celular, sin GitHub |
| Mantenedor técnico (Edgar) | Resumen diario claro, costos acotados, poder ajustar fuentes, recintos y prompts sin tocar lógica |
| Pipeline (actor automatizado) | Configuración clara y estado persistente para no repetir |

## 3. Funcionalidades

**F1 Ingesta RSS.** Feeds configurables; solo últimas 72 h; un feed caído no detiene la corrida.

**F2 Deduplicación.** Por URL canónica y por hecho (artista + categoría). Varias fuentes del mismo hecho producen una nota con todas las fuentes. No se repite un hecho en 14 días.

**F3 Clasificación y ranking.** Categoría (gira, lanzamiento, anuncio, otro), pertenencia a indie/rock y fechas explícitas. La relevancia se calcula en código: `mx` exige fecha futura en México; `latam`, en un país latinoamericano. Tope diario de 7, con cuota de al menos 3 de escena mexicana y 3 de escena española (se rellenan entre sí antes que con fuentes internacionales).

**F4 Redacción.** Claude redacta título, entrada y cuerpo (≤ 250 palabras) con la voz de la marca. El front matter lo construye el código; las fuentes vienen del RSS, nunca del modelo.

**F5 Validación.** Créditos completos, sin 8+ palabras copiadas, sin citas, longitudes. Un reintento con los errores; si vuelve a fallar, se descarta.

**F6 Embed oficial.** Spotify (artista o álbum con coincidencia exacta) y luego YouTube (canal oficial o Topic). Sin coincidencia: sin embed.

**F7 Publicación automática.** Commit directo a `main` → Netlify despliega. Interruptor `autopublicar`.

**F8 Despublicación.** Pestaña Notas del Sheet → `draft: true/false`.

**F9 Agenda.** JSON-LD de carteleras de recintos + pestaña Eventos del Sheet (siempre gana). Regla de supervivencia por recinto. Eventos del equipo para recintos sin cartelera legible. Solo próximos 60 días.

**F10 Curadores.** Pardy, Tanelly, Dany y Pratz pueden recomendar/firmar un evento desde el Sheet (varios a la vez); sin firma aparece como Cartelera y se muestra igual en cada evento. El sitio filtra la agenda por recinto y por rango de precio, no por curador.

**F11 Calendario `.ics`.** El visitante elige conciertos del mes y descarga un archivo compatible con Google Calendar, Apple y Outlook.

**F12 Observabilidad.** Resumen por corrida en GitHub Actions: publicadas, descartadas con motivo, feeds con error, avisos de recintos y Sheet, tokens usados.

## 4. Flujos

**A. Corrida diaria (8:00 CDMX).** Tests → notas → agenda → despublicaciones → compilar sitio → commit único (solo si hay cambios) → Netlify publica.

**B. Nota.** RSS → ventana 72 h → dedup URL → clasificar (con caché) → agrupar por hecho → excluir publicados → top 3 → redactar → validar (1 reintento) → embed → Markdown.

**C. Agenda.** Por recinto: leer JSON-LD → si falla o trae 0, conservar anteriores → aplicar Sheet (o conservar marcas si no responde) → filtrar futuros → firmar → `data/eventos.json`.

**D. Corregir una nota publicada.** Curador ve error → pestaña Notas: slug + TRUE → siguiente corrida (o corrida manual) la oculta.

**E. Recomendar un evento.** Curador en pestaña Eventos: recinto, fecha, parte del título, casilla con su nombre → siguiente corrida.

## 5. Arquitectura

```
GitHub Actions (cron) ──► pipeline/ (Python)
   autoblog.py ──► RSS · Claude · Spotify/YouTube ──► content/posts/*.md
   scrape_eventos.py ──► recintos (JSON-LD) · Sheet ──► data/eventos.json
   sync_sheet.py ──► Sheet ──► draft true/false
   hugo (verificación) ──► commit único a main
                                   │
Netlify ◄──────────────────────────┘  hugo --gc --minify -b $URL
   /            portada (notas + próximos conciertos)
   /notas/      listado y páginas por nota con Open Graph
   /agenda/     filtros + descarga .ics
```

Estructura, modelo de datos y decisiones: ver `plan.md`.

## 6. Requisitos no funcionales

**Legal y ética:** sin frases copiadas (validador), créditos visibles, sin imágenes de terceros, respeto a `robots.txt` en carteleras, bot identificado, aviso de redacción con IA. *Criterio editorial, no asesoría legal.*

**Seguridad:** llaves solo en GitHub Secrets; HTML crudo deshabilitado en Markdown; el contenido del modelo se trata como no confiable.

**Costo:** modelo ligero para clasificar, modelo principal solo para las 3 notas; caché de clasificaciones; tope de tokens por corrida.

**Confiabilidad:** fallos aislados por fuente y por recinto; corrida idempotente; sin commit si no hay cambios; no se publica si fallan tests o compilación.

**Identidad (SPEC-001):** crema `#F4EFEE`, tinta `#141416`, rojo `#E8322A`, azul `#2255CC`, amarillo `#F2C230`; Syne y Space Grotesk. Colores primarios vibrantes (no tonos apagados). Reglas de contraste: rojo solo en texto grande; amarillo reservado para el sticker "Viene a México", nunca como texto (solo fondo con tinta encima).

**Accesibilidad y rendimiento:** foco visible, enlace para saltar al contenido, filtros con `aria-pressed`, responsive a 360 px, iframes con carga diferida, sin librerías JS.
