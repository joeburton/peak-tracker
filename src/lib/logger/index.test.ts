import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from './index';

function lastCallArg(spy: ReturnType<typeof vi.fn>): unknown {
  const call = spy.mock.calls[spy.mock.calls.length - 1];
  expect(call).toBeDefined();
  return call![0];
}

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('in test environment (NODE_ENV=test)', () => {
    it('does not output debug messages', () => {
      logger.debug('test debug');
      expect(console.info).not.toHaveBeenCalled();
    });

    it('does not output info messages', () => {
      logger.info('test info');
      expect(console.info).not.toHaveBeenCalled();
    });

    it('does not output warn messages', () => {
      logger.warn('test warn');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('does not output error messages', () => {
      logger.error('test error');
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('in production environment (NODE_ENV=production)', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('does not output debug messages (below min level)', () => {
      logger.debug('debug message');
      expect(console.info).not.toHaveBeenCalled();
    });

    it('outputs info messages as JSON', () => {
      logger.info('hello world');
      expect(console.info).toHaveBeenCalledOnce();
      const output = JSON.parse(lastCallArg(console.info as ReturnType<typeof vi.fn>) as string);
      expect(output).toMatchObject({ level: 'info', message: 'hello world' });
      expect(output.timestamp).toBeDefined();
    });

    it('outputs warn messages via console.warn', () => {
      logger.warn('something fishy');
      expect(console.warn).toHaveBeenCalledOnce();
      const output = JSON.parse(lastCallArg(console.warn as ReturnType<typeof vi.fn>) as string);
      expect(output).toMatchObject({ level: 'warn', message: 'something fishy' });
    });

    it('outputs error messages via console.error', () => {
      logger.error('boom');
      expect(console.error).toHaveBeenCalledOnce();
      const output = JSON.parse(lastCallArg(console.error as ReturnType<typeof vi.fn>) as string);
      expect(output).toMatchObject({ level: 'error', message: 'boom' });
    });

    it('includes context when provided', () => {
      logger.info('with context', { userId: 'abc', peakId: '123' });
      const output = JSON.parse(lastCallArg(console.info as ReturnType<typeof vi.fn>) as string);
      expect(output.context).toEqual({ userId: 'abc', peakId: '123' });
    });

    it('omits context key when not provided', () => {
      logger.info('no context');
      const output = JSON.parse(lastCallArg(console.info as ReturnType<typeof vi.fn>) as string);
      expect(output).not.toHaveProperty('context');
    });
  });

  describe('in development environment (NODE_ENV=development)', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('outputs debug messages', () => {
      logger.debug('verbose debug');
      expect(console.info).toHaveBeenCalledOnce();
      const output = JSON.parse(lastCallArg(console.info as ReturnType<typeof vi.fn>) as string);
      expect(output).toMatchObject({ level: 'debug', message: 'verbose debug' });
    });
  });
});
