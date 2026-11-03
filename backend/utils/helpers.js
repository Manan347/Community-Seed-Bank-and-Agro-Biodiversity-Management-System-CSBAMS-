import db from '../config/db.js';
export const now = () => new Date().toISOString();
export const id = (prefix) => `${prefix}-${String((db.prepare('SELECT COUNT(*) AS n FROM sqlite_master').get().n || 0) + Math.floor(Date.now() % 1000000)).padStart(6, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
export const fail = (message, code = 'VALIDATION_FAILED', status = 400) => Object.assign(new Error(message), { code, status });
export const ok = (res, data, message = '') => res.json({ success: true, data, error: null, message });
export const deriveInventoryStatus = (quantity, threshold) => quantity === 0 ? 'OutOfStock' : quantity <= threshold ? 'LowStock' : 'Available';
export const deriveQualityStatus = ({ germination, purity, moisture }) => {
  if (germination < 70 || purity < 95 || moisture > 14) return 'Poor';
  if (germination < 85 || purity < 98 || moisture > 12) return 'Average';
  return 'Good';
};
export function applyStockChange(varietyId, delta, reason, actorId) {
  const inventory = db.prepare('SELECT * FROM seed_inventories WHERE variety_id=?').get(varietyId);
  if (!inventory) throw fail('Inventory not found', 'NOT_FOUND', 404);
  const quantity = inventory.available_quantity + delta;
  if (quantity < 0) throw fail('Insufficient stock', 'INSUFFICIENT_STOCK', 409);
  db.prepare('UPDATE seed_inventories SET available_quantity=?, updated_date=? WHERE variety_id=?').run(quantity, now(), varietyId);
  db.prepare('INSERT INTO stock_ledger VALUES (?, ?, ?, ?, ?, ?, ?)').run(id('LDG'), varietyId, delta, quantity, reason, actorId, now());
  return { quantity, status: deriveInventoryStatus(quantity, inventory.low_stock_threshold) };
}
export function notify(userId, title, body, type, relatedId = null) { db.prepare('INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, 0, ?)').run(id('NTF'), userId, title, body, type, relatedId, now()); }
