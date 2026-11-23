// Sprites dibujados por código (v0.1). 16×16, una letra por color de data/palette.js; «.» es transparente.
// Cuando lleguen las hojas de Gemini, render/atlas.js las usará con estos mismos nombres (spec §5).
const BUNNY_CARA = [
  '......dddd......', '....ddPPPPdd....', '...dPPPPPPPPd...', '..dPPPPPPPPPPd..', '.dPPPPPPPPPPPPd.',
  'dLdPPPPPPPPPPdLd', 'dLdPbbbPPbbbPdLd', 'dLdPbWBPPbWBPdLd', 'dLdPbBBPPbBBPdLd', 'dLdPPbbPPbbPPdLd',
  'dLdPPPPKKPPPPdLd', 'dLdPPPKPPKPPPdLd', 'dLdPPPPPPPPPPdLd', 'dLLddPPPPPPddLLd',
];
const BUNNY_LADO = [
  '......dddd......', '....ddPPPPdd....', '...dPPPPPPPPd...', '..dPPPPPPPPPPd..', '.dPPPPPPPPPPPPd.',
  'dLLdPPPPPPPPPPd.', 'dLLdPPPPPPbbbPd.', 'dLLdPPPPPPbWBPd.', 'dLLdPPPPPPbBBPd.', 'dLLdPPPPPPPbbPd.',
  'dLLdPPPPPPPPKPd.', 'dLLdPPPPPPPKPPd.', 'dLLdPPPPPPPPPd..', '.dLLdddPPPPdd...',
];
const BUNNY_ESPALDA = BUNNY_CARA.map((r, i) => (i >= 6 && i <= 11 ? 'dLdPPPPPPPPPPdLd' : r));

export const SPRITES = {
  'bunny.frente.0': [...BUNNY_CARA, '.dLd.dPPPPd.dLd.', '..d..dd..dd..d..'],
  'bunny.frente.1': [...BUNNY_CARA, '.dLd..dPPd..dLd.', '..d...dddd...d..'],
  'bunny.lado.0': [...BUNNY_LADO, '.dLLd.dPPPd.....', '..dd...dd.dd....'],
  'bunny.lado.1': [...BUNNY_LADO, '.dLLd..dPPd.....', '..dd....dddd....'],
  'bunny.espalda.0': [...BUNNY_ESPALDA, '.dLd.dPPPPd.dLd.', '..d..dd..dd..d..'],
  'bunny.espalda.1': [...BUNNY_ESPALDA, '.dLd..dPPd..dLd.', '..d...dddd...d..'],
  'bunny.cuclillas': [
    '......dddd......', '....ddPPPPdd....', '...dPPPPPPPPd...', '..dPPPPPPPPPPd..', '.dPPPPPPPPPPPPd.',
    'dLdPPPPPPPPPPdLd', 'dLdPbbbPPbbbPdLd', 'dLdPPPPPPPPPPdLd', 'dLdPCPPPPPPCPdLd', 'dLLLLPPKKPPLLLLd',
    'dLLLLPKPPKPLLLLd', 'dLLLLPPPPPPLLLLd', '.dLLdPPPPPPdLLd.', '..dd.dPPPPd.dd..', '....dPPddPPd....', '....dddd.ddd....',
  ],
  'coronado.0': [
    '..Y...Y..Y...Y..', '..YY.YYYYYY.YY..', '..YYYYYYYYYYYY..', '..yYyYyYYyYyYy..', '..rRRRRRRRRRRr..',
    '.rRRRRRWWRRRRRr.', 'rRRRRRWKKWRRRRRr', 'rRRRRRRWWRRRRRRr', 'rRYYYRRRRRRYYYRr', 'rRRYKYRRRRYKYRRr',
    'rRRRRRRRRRRRRRRr', 'rKKKKKKKKKKKKKKr', 'rKWWKWWKKWWKWWKr', '.rKWWWWWWWWWWKr.', '..rKKKKKKKKKKr..', '...rrrrrrrrrr...',
  ],
  'coronado.1': [
    '...Y..Y..Y..Y...', '..YY.YYYYYY.YY..', '..YYYYYYYYYYYY..', '..yYyYyYYyYyYy..', '..rRRRRRRRRRRr..',
    '.rRRRRRWWRRRRRr.', 'rRRRRRWKKWRRRRRr', 'rRRRRRRWWRRRRRRr', 'rRYYYRRRRRRYYYRr', 'rRRYKYRRRRYKYRRr',
    'rRRRRRRRRRRRRRRr', 'rKKKKKKKKKKKKKKr', 'rKKWWKWWWWKWWKKr', '.rKWWWWWWWWWWKr.', '..rKKKKKKKKKKr..', '...rrrrrrrrrr...',
  ],
  'osito.0': [
    '................', '..ddd......ddd..', '.dpLpd....dpLpd.', '.dpppddddddpppd.', '..dpPPPPPPPPpd..',
    '.dPPPPPPPPPPPPd.', '.dPKKPPPPPPKKPd.', '.dPKWPPPPPPKWPd.', '.dPPPPLLLLPPPPd.', '.dPPPLLKKLLPPPd.',
    '.dPPPPKLLKPPPPd.', '..dPPPPKKPPPPd..', '.ddpdPPPPPPdpdd.', '.dpPdPPLLPPdPpd.', '..dd.dPPPPd.dd..', '.....dd..dd.....',
  ],
  'osito.1': [
    '................', '..ddd......ddd..', '.dpLpd....dpLpd.', '.dpppddddddpppd.', '..dpPPPPPPPPpd..',
    '.dPPPPPPPPPPPPd.', '.dPKKPPPPPPKKPd.', '.dPKWPPPPPPKWPd.', '.dPPPPLLLLPPPPd.', '.dPPPLLKKLLPPPd.',
    '.dPPPPKLLKPPPPd.', '..dPPPPKKPPPPd..', 'dpd.dPPPPPPd.dpd', '.d.ddPPLLPPdd.d.', '..dd.dPPPPd.dd..', '.....dd..dd.....',
  ],
  'estrellita.0': [
    '.......yy.......', '......yYYy......', '......yYYy......', '.....yYYYYy.....', 'yyyyyYYYYYYyyyyy',
    'yYYYYYYYYYYYYYYy', '.yYYWWYYYYWWYYy.', '..yYWKYYYYWKYy..', '...yYYYYYYYYy...', '...yYYYKKYYYy...',
    '..yYYYYYYYYYYy..', '..yYYYYyyYYYYy..', '.yYYYYy..yYYYYy.', '.yYyy......yyYy.', '..K..........K..', '.KK..........KK.',
  ],
  'estrellita.1': [
    '.......yy.......', '......yYYy......', '......yYYy......', '.....yYYYYy.....', 'yyyyyYYYYYYyyyyy',
    'yYYYYYYYYYYYYYYy', '.yYYWWYYYYWWYYy.', '..yYWKYYYYWKYy..', '...yYYYYYYYYy...', '...yYYYKKYYYy...',
    '..yYYYYYYYYYYy..', '..yYYYYyyYYYYy..', '.yYYYYy..yYYYYy.', '.yYyy......yyYy.', '...K........K...', '...KK......KK...',
  ],
  'gotita.0': [
    '.......rr.......', '.......RR.......', '......rRRr......', '......rRRr......', '.....rRRRRr.....',
    '....rRWRRRRr....', '....rRWRRRRr....', '...rRRRRRRRRr...', '..rRWWRRRRWWRr..', '..rRWKRRRRWKRr..',
    '.rRRRRRRRRRRRRr.', '.rRRRRRKKRRRRRr.', '.rRRRRKRRKRRRRr.', '..rRRRRRRRRRRr..', '...rrRRRRRRrr...', '.....rrrrrr.....',
  ],
  'gotita.1': [
    '................', '.......rr.......', '.......RR.......', '......rRRr......', '.....rRRRRr.....',
    '....rRWRRRRr....', '....rRWRRRRr....', '...rRRRRRRRRr...', '..rRWWRRRRWWRr..', '..rRWKRRRRWKRr..',
    '.rRRRRRRRRRRRRr.', '.rRRRRRKKRRRRRr.', '.rRRRRKRRKRRRRr.', '..rRRRRRRRRRRr..', '..rrRRRRRRRRrr..', '....rrrrrrrr....',
  ],
  'nube.0': [
    '................', '................', '................', '................', '......LLLL......',
    '....LLWWWWLL....', '..LLWWWWWWWWLL..', '.LWWWKWWWWKWWWL.', '.LWWWKWWWWKWWWL.', '.LWWWWWWWWWWWWL.',
    '..LLWWWWWWWWLL..', '....LLLLLLLL....', '................', '................', '................', '................',
  ],
  'item.hyper': [
    '................', '.........V.V....', '........VvVv....', '.......vVVv..Y..', '......OOvv..YWY.',
    '.....OOOO....Y..', '....OOOoO.......', '...OOOOOo.......', '...OoOOO........', '..OOOoO.........',
    '..OOOO..........', '.OOoO...........', '.OO.............', '.O..............', '................', '................',
  ],
  'bonus.estrella': [
    '................', '................', '.......YY.......', '.......YY.......', '......YYYY......',
    '.YYYYYYYYYYYYYY.', '..YYYYYYYYYYYY..', '...YYYKYYKYYY...', '....YYYYYYYY....', '....YYYYYYYY....',
    '...YYYYyyYYYY...', '...YYYy..yYYY...', '..YYy......yYY..', '..y..........y..', '................', '................',
  ],
  'bonus.bolsita': [
    '...K............', '....K...........', '.....K..........', '......K.........', '.......K........',
    '....RRRRRRRR....', '...RrrrrrrrrR...', '...RRRRRRRRRR...', '...RRRRYYRRRR...', '...RRRRYYRRRR...',
    '...RRRRRRRRRR...', '...RRRRRRRRRR...', '...rRRRRRRRRr...', '....rrrrrrrr....', '................', '................',
  ],
  'bonus.koi': [
    '................', '................', '................', '................', '................',
    '......OOOO......', '...WWOOOOWWO..O.', '..WWKWOOOWWWOOO.', '.WWWWWOOWWWOOOO.', '..WOOWWWWWOO.OO.',
    '...OOOWWOOO...O.', '......OOOO......', '................', '................', '................', '................',
  ],
  'bonus.micro': [
    '................', '......gggg......', '.....gGgGgg.....', '.....GgGgGg.....', '.....gGgGgg.....',
    '......gggg......', '.......KK.......', '.......KK.......', '.......pp.......', '.......pp.......',
    '.......pp.......', '.......pp.......', '.......KK.......', '................', '................', '................',
  ],
  'bonus.nube': [
    '................', '................', '................', '................', '................',
    '......YYYY......', '....YYWWYYYY....', '..YYYWYYYYYYYY..', '.YYYYYYYYYYYYYY.', '.yYYYYYYYYYYYYy.',
    '..yyYYYYYYYYyy..', '....yyyyyyyy....', '................', '................', '................', '................',
  ],
  'item.besito': [
    '................', '................', '................', '...pp....pp.....', '..pPPp..pPPp....',
    '.pPLPPppPPPPp...', '.pPLPPPPPPPPp...', '.pPPPPPPPPPPp...', '..pPPPPPPPPp....', '...pPPPPPPp.....',
    '....pPPPPp......', '.....pPPp.......', '......pp........', '................', '................', '................',
  ],
  'item.desaparezco': [
    '................', '................', '...L.L....L.L...', '..L...L..L...L..', '..L....LL....L..',
    '.L............L.', '.L..L......L..L.', 'L..............L', 'L.....L..L.....L', '.L.....LL.....L.',
    '.L............L.', '..LL........LL..', '....LLLLLLLL....', '................', '................', '................',
  ],
  'mini.vida': ['..dddd..', '.dPPPPd.', 'dPPPPPPd', 'dPBPPBPd', 'dLPPPPLd', 'dLPKKPLd', 'dLPPPPLd', '.dd..dd.'],
};

// Estado triste (Zanahoria Hyperpop): los mismos enemigos en azul.
const TRISTE = { R: 'C', r: 'c', Y: 'C', y: 'c', P: 'C', p: 'c', d: 'c', L: 'W' };
for (const t of ['coronado', 'osito', 'estrellita', 'gotita']) {
  for (const f of [0, 1]) SPRITES[`${t}.triste.${f}`] = SPRITES[`${t}.${f}`].map((r) => r.replace(/./g, (ch) => TRISTE[ch] || ch));
}

export const BONUS_POR_ESCENARIO = ['bonus.estrella', 'bonus.bolsita', 'bonus.koi', 'bonus.micro', 'bonus.nube'];
