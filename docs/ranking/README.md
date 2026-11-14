# Ranking de la trivia: cómo publicarlo (F18/D24)

El ranking guarda los puntajes en un Google Sheet del equipo. Un Apps Script pegado en ese Sheet recibe los puntajes y entrega el top. Lo publica alguien del equipo con su cuenta de Google, una sola vez. Son unos 10 minutos.

## 1. Crear el Sheet y pegar el script

1. Crea un Google Sheet nuevo, por ejemplo "Ranking trivia Colores Ruidosos".
2. En el menú: **Extensiones → Apps Script**.
3. Borra lo que trae el editor y pega todo el contenido de [`Code.gs`](Code.gs).
4. Guarda (ícono de disquete).

No hace falta preparar pestañas: si no existe `Puntajes`, el script toma la primera pestaña (si está vacía o ya trae los encabezados) y la renombra; si no, crea una nueva.

## 2. Publicarlo como aplicación web

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engrane de "Seleccionar tipo", elige **Aplicación web**.
3. Llena así:
   - **Descripción:** Ranking trivia
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
4. **Implementar.** Google pide autorizar el acceso al Sheet: acepta con la cuenta del equipo. Si aparece "Google no verificó esta app", entra en **Configuración avanzada → Ir a … (no seguro)**. Es tu propio script.
5. Copia la **URL de la aplicación web**. Termina en `/exec`.

"Cualquier usuario" significa que el juego puede enviar y leer puntajes sin que la gente inicie sesión. Nadie puede ver ni editar el Sheet; solo el script escribe en él.

## 3. Conectarlo con el sitio

Pásale la URL a quien mantiene el sitio, o ponla tú en `hugo.toml`:

```toml
[params]
  trivia_ranking_url = "https://script.google.com/macros/s/…/exec"
```

Con la URL puesta, aparecen en `/trivia/` el botón **Ranking** y la opción **Publicar mi puntaje** al terminar una partida. Sin URL, el ranking no se muestra.

La URL no es secreta: el navegador de cada jugador la usa.

## 4. Moderar

- **Borrar un puntaje** (trampa evidente, por ejemplo): borra su fila en la pestaña `Puntajes`. El ranking se actualiza en menos de un minuto.
- **Bloquear a alguien que insiste:** la columna `dispositivo` identifica al navegador. Puedes borrar todas sus filas con un filtro por esa columna.
- **Empezar de cero:** borra todas las filas menos la primera (los encabezados).

Lo que el script ya rechaza solo:
- Puntos fuera de 0–30 o con decimales.
- Partidas de menos de 15 segundos o de más de una hora.
- Nombres que no salen de la ruleta del juego, así que nadie puede escribir el suyo.
- Más de 10 envíos por hora desde el mismo navegador.

## 5. Si cambias el script

Después de editar `Code.gs` en el editor: **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar**. Así la URL sigue siendo la misma.

Si cambias las listas de palabras de los nombres, cámbialas igual en `assets/js/trivia/ranking.js`. Una prueba revisa que coincidan.

## 6. Modos del ranking (F21/D27)

El mismo script guarda los tres modos en la misma pestaña (columna `modo`):

| Modo | Tablas | Puntos máx. | Duración válida |
|---|---|---|---|
| `trivia` | Esta semana · Histórico | 30 | 15 s – 1 h |
| `contrarreloj` | Esta semana · Histórico | 400 | 3 s – 90 s |
| `adivina` | Hoy · Semana (suma de rondas) · Mejor racha | 60 | 5 s – 1 h |

En Adivina la canción solo cuenta la primera ronda publicada por nombre y día (hora de CDMX). Si el sitio dice «El ranking de este modo todavía no está activo», falta publicar la versión nueva del script (paso 5).

## 6. «Yo contra mi corazón» (modo `corazon`, 9–15 nov 2026)

El minijuego usa el **mismo Sheet y la misma URL**: sus puntajes se guardan con `modo = corazon`. Para activarlo hay que publicar una versión nueva del script:

1. Abre el Apps Script del Sheet y reemplaza todo con el [`Code.gs`](Code.gs) actual.
2. **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar.** La URL no cambia.

Mientras no se haga, el juego funciona igual, pero en el ranking dice «EL RANKING AÚN NO ESTÁ DISPONIBLE».

**Qué rechaza el script solo en este modo:**
- puntos por encima de 80 000 o con decimales;
- partidas de menos de 20 segundos o de más de 4 minutos;
- nombres que no salen de su ruleta (Payaso, Pierrot, Faquir… del Latido, de la Aorta, del Bate…);
- cualquier envío después del **domingo 15 de noviembre a las 23:59 (CDMX)**. Ahí el ranking queda congelado como ranking final.
