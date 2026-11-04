// Los 8 mundos del Museo (spec §3.1 y §3.0f C). `levels` vacío = «PRÓXIMAMENTE».
// `requires`: mundo que hay que terminar para abrir la puerta.
export const WORLDS = [
  { id: 'carmesi', name: 'CARMESÍ', year: 2016, color: '#c02a38', costume: 'clasico', requires: null },
  { id: 'noche', name: 'NOCHE', year: 2017, color: '#1a1a1a', costume: 'vampiro', requires: 'carmesi' },
  { id: 'alba', name: 'ALBA', year: 2018, color: '#e9e4d8', costume: 'clasico', requires: 'noche', soon: true },
  { id: 'psalmos', name: 'PSALMOS', year: 2019, color: '#2a5aa8', costume: 'clasico', requires: 'alba', soon: true },
  { id: 'giallo', name: 'GIALLO', year: 2022, color: '#e8b81c', costume: 'clasico', requires: 'psalmos', soon: true },
  { id: 'aurora', name: 'AURORA', year: 2023, color: '#b4572e', costume: 'clasico', requires: 'giallo', soon: true },
  { id: 'sarajevo', name: 'SARAJEVO', year: 2024, color: '#a58ad0', costume: 'rojo', requires: 'aurora', soon: true },
  { id: 'querido', name: 'QUERIDO…', year: 2026, color: '#3e8a4c', costume: 'bandana', requires: 'sarajevo', soon: true },
];
export const worldById = (id) => WORLDS.find((w) => w.id === id);
