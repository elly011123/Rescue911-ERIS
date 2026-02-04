/* ===== ERIS Event Bus + Geo helpers (no backend) ===== */
(() => {
  const ERIS_EVENTS_KEY = 'eris.events';
  const ERIS_SIGNAL_KEY = 'eris.signal';
  const ERIS_EMT_STATE_KEY = 'eris.emtState';

  function jget(key, fallback){
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  }
  function jset(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

  function publish(type, payload){
    const ev = {
      id: (crypto?.randomUUID?.() ?? String(Date.now())+Math.random()),
      type,                                       // 'emt.reached' | 'emt.left' | 'emt.position'
      unit: String(payload.unit || '').trim(),
      location: String(payload.location || '').trim(),
      coords: payload.coords || null,             // {lat,lng,acc} optional
      timestamp: Date.now(),
      meta: payload.meta || {}
    };
    const events = jget(ERIS_EVENTS_KEY, []);
    events.push(ev);
    jset(ERIS_EVENTS_KEY, events);

    const state = jget(ERIS_EMT_STATE_KEY, {});
    if (!state[ev.unit]) state[ev.unit] = { status:'Unknown', location:'', updatedAt:0, lat:null, lng:null, acc:null };
    if (ev.type === 'emt.reached'){
      state[ev.unit].status = 'On site';
      state[ev.unit].location = ev.location;
    } else if (ev.type === 'emt.left'){
      state[ev.unit].status = 'Departed';
      state[ev.unit].location = ev.location;
    }
    if (ev.coords){
      state[ev.unit].lat = ev.coords.lat;
      state[ev.unit].lng = ev.coords.lng;
      state[ev.unit].acc = ev.coords.acc ?? null;
    }
    state[ev.unit].updatedAt = ev.timestamp;
    jset(ERIS_EMT_STATE_KEY, state);

    const sig = { t: ev.timestamp, type: ev.type, unit: ev.unit, location: ev.location, id: ev.id };
    localStorage.setItem(ERIS_SIGNAL_KEY, JSON.stringify(sig));
    setTimeout(() => localStorage.removeItem(ERIS_SIGNAL_KEY), 0);
    return ev;
  }

  function subscribe(handler){
    window.addEventListener('storage', e => {
      if (e.key === ERIS_SIGNAL_KEY && e.newValue){
        try { handler(JSON.parse(e.newValue)); } catch {}
      }
    });
  }

  function formatEvent(ev){
    if (ev.type === 'emt.reached') return `EMT ${ev.unit} reached ${ev.location}`;
    if (ev.type === 'emt.left') return `EMT ${ev.unit} left ${ev.location}`;
    if (ev.type === 'emt.position') return `EMT ${ev.unit} updated position`;
    return ev.type;
  }

  function renderEvents(listEl){
    const events = jget(ERIS_EVENTS_KEY, []).slice().reverse();
    listEl.innerHTML = '';
    for (const ev of events){
      const li = document.createElement('li');
      li.textContent = formatEvent(ev);
      li.style.padding = '6px 0';
      listEl.appendChild(li);
    }
  }

  function renderEmtState(tbody){
    const state = jget(ERIS_EMT_STATE_KEY, {});
    const units = Object.keys(state).sort();
    tbody.innerHTML = '';
    for (const u of units){
      const s = state[u];
      const tr = document.createElement('tr');
      const tdU = document.createElement('td'); tdU.textContent = u; tdU.style.padding = '6px 8px';
      const tdS = document.createElement('td'); tdS.textContent = s.status; tdS.style.padding = '6px 8px';
      const tdL = document.createElement('td'); tdL.textContent = s.location || ''; tdL.style.padding = '6px 8px';
      const tdC = document.createElement('td'); tdC.textContent = (s.lat!=null && s.lng!=null) ? `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}` : ''; tdC.style.padding = '6px 8px';
      tr.append(tdU, tdS, tdL, tdC);
      tbody.appendChild(tr);
    }
  }

  function ensureToastHost(){
    if (document.getElementById('eris-toast-host')) return;
    const host = document.createElement('div');
    host.id = 'eris-toast-host';
    host.style.position = 'fixed';
    host.style.right = '16px';
    host.style.bottom = '16px';
    host.style.zIndex = '9999';
    document.body.appendChild(host);
  }
  function toast(msg){
    ensureToastHost();
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.padding = '10px 12px';
    t.style.marginTop = '8px';
    t.style.borderRadius = '10px';
    t.style.background = '#111';
    t.style.color = '#fff';
    t.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
    t.style.fontSize = '14px';
    document.getElementById('eris-toast-host').appendChild(t);
    setTimeout(() => t.remove(), 4200);
  }

  async function ensureNotifyPermission(){
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied'){
      const p = await Notification.requestPermission();
      return p === 'granted';
    }
    return false;
  }
  function notify(title, body){
    if (!('Notification' in window)) return;
    try { new Notification(title, { body }); } catch {}
  }

  function haversineMeters(lat1,lng1,lat2,lng2){
    const R = 6371000;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  window.ERIS = {
    publish, subscribe,
    loadEvents: () => jget(ERIS_EVENTS_KEY, []),
    loadEmtState: () => jget(ERIS_EMT_STATE_KEY, {}),
    renderEvents, renderEmtState,
    toast, ensureNotifyPermission, notify,
    haversineMeters
  };
})();
