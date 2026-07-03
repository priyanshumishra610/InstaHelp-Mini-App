import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
    };

    const result = await query<{
      id: string;
      email: string;
      name: string;
      role_name: string;
      permissions: string[];
    }>(
      `SELECT u.id, u.email, u.name, r.name AS role_name, r.permissions
       FROM admin_users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND u.is_active = TRUE AND u.deleted_at IS NULL`,
      [payload.sub],
    );

    if (!result.rows[0]) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const row = result.rows[0];
    req.user = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role_name,
      permissions: row.permissions,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requirePermission(...required: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const perms = req.user.permissions;
    if (perms.includes("*")) {
      next();
      return;
    }

    const allowed = required.some((reqPerm) => {
      if (perms.includes(reqPerm)) return true;
      const [module] = reqPerm.split(":");
      return perms.includes(`${module}:*`) || perms.includes("*:read");
    });

    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

export async function logAudit(
  adminId: string | undefined,
  action: string,
  module: string,
  entityId: string | null,
  oldValue: unknown,
  newValue: unknown,
  ip?: string,
): Promise<void> {
  await query(
    `INSERT INTO audit_logs (admin_id, action, module, entity_id, old_value, new_value, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      adminId ?? null,
      action,
      module,
      entityId,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      ip ?? null,
    ],
  );
}
