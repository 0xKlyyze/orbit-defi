import pino from 'pino';

export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const createLogger = (bindings?: Record<string, unknown>) => logger.child(bindings || {});