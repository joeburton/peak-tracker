type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): number {
  if (process.env.NODE_ENV === 'test') return Infinity;
  if (process.env.NODE_ENV === 'development') return LEVELS.debug;
  return LEVELS.info;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (LEVELS[level] < getMinLevel()) return;

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context !== undefined ? { context } : {}),
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case 'debug':
    case 'info':
      console.info(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'error':
      console.error(output);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
};
