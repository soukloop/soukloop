/**
 * Production-ready logger utility.
 * 
 * Usage:
 * import { logger } from '@/lib/logger';
 * logger.info('Message', { meta: 'data' });
 * logger.error('Error', error);
 */
const isProduction = process.env.NODE_ENV === 'production';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private log(level: LogLevel, message: string, ...args: any[]) {
        if (isProduction && level === 'debug') {
            return; // Silence debug logs in production
        }

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'info':
                console.log(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'error':
                console.error(prefix, message, ...args);
                break;
            case 'debug':
                console.log(prefix, message, ...args); // Use log for debug to avoid polluting stderr
                break;
        }
    }

    info(message: string, ...args: any[]) {
        this.log('info', message, ...args);
    }

    warn(message: string, ...args: any[]) {
        this.log('warn', message, ...args);
    }

    error(message: string, ...args: any[]) {
        this.log('error', message, ...args);
    }

    debug(message: string, ...args: any[]) {
        this.log('debug', message, ...args);
    }
}

export const logger = new Logger();
