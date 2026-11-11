// Constantes de ajuste fino (plan §3). Todo lo que se ajusta jugando vive aquí.
export const W = 384;                 // ancho lógico (×5 = 1920)
export const H = 216;                 // alto lógico  (×5 = 1080)
export const FLOOR_TOP = 132;         // carril más al fondo
export const FLOOR_BOTTOM = 206;      // carril más cerca de la cámara
export const LANE = 8;                // |Δy| máximo para que un golpe conecte (F2)
export const GRAV = 0.32;
export const HITSTOP = 3;             // cuadros de pausa al impactar
export const DOUBLE_TAP = 12;         // ticks entre toques para correr (F1)
export const CHAIN_GAP = 14;          // ticks para encadenar el combo después de un golpe
export const GRAB_CONTACT = 8;        // ticks empujando contra un enemigo para agarrarlo
export const GRAB_TICKS = 80;         // duración máxima de un agarre
export const MAX_KNEES = 3;           // al tercer rodillazo lo lanza solo
export const SPECIAL_COST = 0.08;     // F3: 8 % de la vida máxima
export const PLAYER_LIVES = 3;        // F8
export const RESPAWN_TICKS = 60;
export const CONTINUE_TICKS = 600;    // 10 s para continuar
export const RISE_INVUL_PLAYER = 60;  // F4: 1 s invulnerable al levantarse
export const RISE_INVUL_ENEMY = 20;
export const SPAWN_INVUL = 90;
export const TOKENS_PER_PLAYER = 2;   // F5: como mucho 2 atacan a la vez a cada jugador
export const MAX_ON_SCREEN = 8;       // plan §10
export const COUNT_SCALE = [1, 1, 1.5, 2, 2.5];    // F5: enemigos ×N según jugadores
export const HP_SCALE = [1, 1, 1.15, 1.3, 1.45];
export const ASSIST_DAMAGE = 0.7;     // F13: −30 % de daño recibido
export const CAM_MARGIN = 24;         // el jugador más atrasado limita la cámara
export const EDGE = 10;               // margen de los jugadores con el borde de la pantalla
export const MAX_PLAYERS = 4;
