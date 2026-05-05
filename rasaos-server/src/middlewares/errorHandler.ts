import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { error as errorResponse } from '../lib/helpers';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('[Error]:', err.message);

    if (err instanceof ZodError) {
        return errorResponse(res, 400, 'Validation Error', { details: err.issues });
    }

    // Handle Prisma errors basic example...
    if (err.name === 'PrismaClientKnownRequestError') {
        return errorResponse(res, 400, 'Database Error', { message: err.message });
    }

    return errorResponse(
        res,
        500,
        'Internal Server Error',
        { message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message }
    );
};
