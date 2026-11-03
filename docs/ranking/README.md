# Ranking de la trivia: cómo publicarlo (F18/D24)

El ranking guarda los puntajes en un Google Sheet del equipo. Un Apps Script pegado en ese Sheet recibe los puntajes y entrega el top. Lo publica alguien del equipo con su cuenta de Google, una sola vez. Son unos 10 minutos.

## 1. Crear el Sheet y pegar el script

1. Crea un Google Sheet nuevo, por ejemplo "Ranking trivia Colores Ruidosos".
2. En el menú: **Extensiones → Apps Script**.
3. Borra lo que trae el editor y pega todo el contenido de [`Code.gs`](Code.gs).
4. Guarda (ícono de disquete).

No hace falta crear la pestaña `Puntajes`: el script la crea con sus encabezados al recibir el primer puntaje.

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
