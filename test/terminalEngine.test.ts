import { describe, expect, it, vi } from 'vitest';
import { TerminalEngine } from '../src/engine/TerminalEngine';

describe('TerminalEngine', () => {
  it('handles secret commands in app layer and skips shell execution', async () => {
    const execute = vi.fn().mockResolvedValue({ code: 0, stdout: 'ok', stderr: '' });
    const engine = new TerminalEngine({ execute } as never);

    const result = await engine.execute('invoke');

    expect(result.isSecret).toBe(true);
    expect(result.output).toContain('not have called me');
    expect(execute).not.toHaveBeenCalled();
  });
});
