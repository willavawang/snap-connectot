/**
 * Read-only Marvel Snap collection client, server-side only.
 * No endpoints or authentication scheme are assumed.
 * Supply a verified base URL and approved authorization header from a secure server environment.
 * Never run this client in GitHub Pages or commit credentials.
 */
export class SnapReadClient {
  constructor({baseUrl, fetchImpl=globalThis.fetch, allowedHost}) {
    const u=new URL(baseUrl);
    if(u.protocol!=='https:' || u.username || u.password || u.search || u.hash || u.pathname!=='/') throw Error('HTTPS origin required');
    if(u.hostname!==allowedHost) throw Error('Host must be explicitly approved');
    this.origin=u.origin;this.fetchImpl=fetchImpl;
  }
  async get(path,{authorization}={}) {
    if(!/^\/[a-zA-Z0-9/_-]+$/.test(path) || path.includes('//') || path.includes('..')) throw Error('Invalid approved path');
    if(!authorization || typeof authorization!=='string') throw Error('Server-side authorization required');
    const response=await this.fetchImpl(this.origin+path,{method:'GET',redirect:'error',headers:{Accept:'application/json',Authorization:authorization},signal:AbortSignal.timeout(10000)});
    if(!response.ok) throw Error('Read failed with HTTP '+response.status);
    const type=response.headers.get('content-type')||'';
    if(!type.toLowerCase().includes('application/json')) throw Error('Expected JSON response');
    const text=await response.text();
    if(text.length>2_000_000) throw Error('Response too large');
    return JSON.parse(text);
  }
}
