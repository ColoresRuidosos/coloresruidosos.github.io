# spec.md — Ciencia Ruidosa #1: "Lo que le pasa a tu cuerpo cuando suena TU canción"

> **Ciencia Ruidosa** es la serie de Colores Ruidosos sobre la ciencia de la música. Estilo fijo de la serie: "Cuerpo de neón" (cuadros aprobados en `../neon-cuerpo/cuadros-de-estilo.jpg`).

## 1. Visión
**Problema:** reels estancados en ~15k; tiempo promedio de 9 s; muy pocos comentarios (24–26).
**Solución:** un reel de ciencia con datos verificados, en el que la música del propio video hace lo que el texto explica (se calla cuando habla del silencio y llega al clímax cuando habla del clímax). Termina con una pregunta personal para comentar.
**Éxito:** > 20k visualizaciones, ≥ 100 comentarios ("¿qué canción te da escalofríos?"), tiempo promedio ≥ 12 s.
**Fuera de alcance:** voz en off; música de terceros; cifras sin fuente.

## 2. Usuarios
Fan que hace scroll sin sonido (todo se entiende con texto) y con sonido (la música demuestra los datos). Equipo: verifica y publica.

## 3. Funcionalidades
- **C1 Gancho (0–3.5 s):** cuerpo de neón entero, ondas de sonido, título; insignia "CIENCIA RUIDOSA #1".
- **C2 Pulso (3.5–9.5):** acercamiento al pecho; el corazón late al pulso de la música y un electro corre abajo.
- **C3 Silencio (9.5–14):** la música se calla de verdad; el corazón late más lento y el electro se aplana.
- **C4 Dopamina (14–23):** paneo vertical a la cabeza. En la anticipación brilla el núcleo caudado; en el clímax (s 19, la caída de la música), el accumbens.
- **C5 Escalofríos (23–28):** barrido al antebrazo; el vello se levanta en ola con el clímax.
- **C6 Cierre (28–33):** vuelve el cuerpo entero, todo encendido; "¿Qué canción te los da? ↓" y "Sigue para más Ciencia Ruidosa".

## 4. Flujos
Scroll → gancho → primer dato antes del s 9 → silencio (sorpresa: el video se calla) → clímax sincronizado → pregunta → comentario.

## 5. Arquitectura
Canvas 2D determinista (`render(t)`), mezcla aditiva para el brillo, 1080×1920 a 30 fps; un solo modelo del cuerpo y una cámara (centro + escala) con fotogramas clave. Música y efectos sintetizados en numpy desde `events.json`; mux a −14 LUFS (`core/render/mux.sh`).

## 6. No funcionales
- Cada dato con fuente en pantalla y en `FACTS.md` (test).
- Zona segura de Reels; tiempos de lectura (`readcheck`).
- Silencio real (cero digital) durante C3, salvo el latido.
- Original: nada de Kurzgesagt ni del video del tuit.
