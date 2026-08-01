import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express 4 does not catch rejected promises from async handlers — an
 * unhandled rejection (e.g. a thrown ZodError or ApiError) crashes the whole
 * process instead of reaching errorHandler. Wrap every async controller with
 * this so failures are routed to next(err) like a synchronous throw would be.
 */
export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
