import crypto from 'node:crypto';

function ensureArray(db, key) {
  if (!Array.isArray(db[key])) {
    db[key] = [];
  }
}

export function addAuditLog(
  db,
  {
    actorUserId = 'system',
    action,
    entityType,
    entityId = null,
    metadata = {},
  },
) {
  ensureArray(db, 'auditLogs');

  const entry = {
    id: crypto.randomUUID(),
    actorUserId,
    action,
    entityType,
    entityId,
    metadata,
    createdAt: new Date().toISOString(),
  };

  db.auditLogs.push(entry);
  return entry;
}

export function addFraudFlag(
  db,
  {
    userId = null,
    referralId = null,
    type,
    severity = 'medium',
    reason,
    metadata = {},
  },
) {
  ensureArray(db, 'fraudFlags');

  const signature = `${userId || 'na'}|${referralId || 'na'}|${type}|${reason}`;
  const existing = db.fraudFlags.find(
    (flag) => flag.signature === signature && !flag.resolvedAt,
  );

  if (existing) {
    return existing;
  }

  const flag = {
    id: crypto.randomUUID(),
    userId,
    referralId,
    type,
    severity,
    reason,
    metadata,
    signature,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedByUserId: null,
    resolutionNote: null,
  };

  db.fraudFlags.push(flag);
  return flag;
}
