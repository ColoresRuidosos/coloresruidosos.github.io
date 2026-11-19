// Servidores ICE (F10.6): para que los móviles con datos conecten aunque su compañía impida la conexión directa,
// se usa un servidor de retransmisión TURN de Metered. Sin clave, o si Metered falla, PeerJS usa sus servidores por defecto.
// La clave de Metered solo sirve para pedir credenciales de TURN; va en la página, así que usamos el plan gratuito.
export const METERED = { app: '', apiKey: '' };   // rellenar con la app y la clave de Metered (spec F10.6)

const STUN = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }];

// Devuelve { iceServers } para PeerJS, o null para dejar la configuración por defecto.
export async function iceConfig({ fetch = globalThis.fetch, metered = METERED, timeoutMs = 3000 } = {}) {
  if (!metered.app || !metered.apiKey || !fetch) return null;
  const url = `https://${metered.app}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(metered.apiKey)}`;
  try {
    const res = await Promise.race([fetch(url), new Promise((_, rej) => setTimeout(() => rej(new Error('tiempo')), timeoutMs))]);
    if (!res || !res.ok) return null;
    const servers = await res.json();
    if (!Array.isArray(servers) || !servers.length) return null;
    return { iceServers: [...STUN, ...servers] };
  } catch {
    return null;
  }
}
