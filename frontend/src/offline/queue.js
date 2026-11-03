const KEY='csbams.offline.queue';
export const pendingWrites=()=>JSON.parse(localStorage.getItem(KEY)||'[]');
export const queueWrite=(path,body)=>{const writes=[...pendingWrites(),{idempotencyKey:crypto.randomUUID(),path,body,createdAt:new Date().toISOString()}];localStorage.setItem(KEY,JSON.stringify(writes));return writes.length};
export const clearWrites=()=>localStorage.removeItem(KEY);
