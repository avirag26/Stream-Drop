import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';

interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ErrorHandler {
  
  public static handle = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';


    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode,
        path: req.path,
        method: req.method,
      });
    }

    
    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  };

  
  public static notFound = (req: Request, res: Response, next: NextFunction): void => {
    const error: CustomError = new Error(`Route not found - ${req.originalUrl}`);
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    next(error);
  };

 
  public static catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
}


export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
