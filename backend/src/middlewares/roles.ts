import { NextFunction, Response } from 'express';

import { prisma } from '../config/database';
import { ApiError } from '../utils/errors';

import { AuthRequest } from './auth';

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Rol insuficiente'));
    }
    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requireSeller = requireRole('SELLER', 'ADMIN');

/**
 * Solo administradores de tienda (OWNER o ADMIN) o el admin global.
 * Los empleados (EMPLOYEE) no pasan este middleware.
 */
export function requireStoreAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role === 'ADMIN') return next();
  if (req.user.role === 'SELLER' && (req.user.storeRole === 'OWNER' || req.user.storeRole === 'ADMIN')) return next();
  return next(ApiError.forbidden('Solo el administrador de la tienda puede realizar esta acción'));
}

/**
 * Solo staff del foro: ADMIN global o MODERATOR (09-spec G3.1).
 */
export function requireForumStaff(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role === 'ADMIN' || req.user.role === 'MODERATOR') return next();
  return next(ApiError.forbidden('Solo el staff del foro puede realizar esta acción'));
}

/**
 * Moderación por departamento (09-spec G3.1): ADMIN pasa siempre; MODERATOR solo si su
 * ForumProfile.department coincide con el departamento pedido.
 */
export function requireDepartmentModerator(department: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role === 'ADMIN') return next();
    if (req.user.role !== 'MODERATOR') {
      return next(ApiError.forbidden('Solo el staff del foro puede realizar esta acción'));
    }
    try {
      const profile = await prisma.forumProfile.findUnique({
        where: { userId: req.user.id },
        select: { department: true },
      });
      if (profile && profile.department === department) return next();
      return next(ApiError.forbidden('Solo moderadores de este departamento'));
    } catch (error) {
      return next(error);
    }
  };
}
