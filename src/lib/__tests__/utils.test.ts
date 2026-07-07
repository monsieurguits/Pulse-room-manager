import { describe, expect, it } from 'vitest';
import { formatDuration } from '@/lib/utils';

describe('formatDuration', () => {
  it('formats seconds under a minute', () => {
    expect(formatDuration(45)).toBe('00:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('02:05');
  });

  it('formats hours when duration exceeds one hour', () => {
    expect(formatDuration(3661)).toBe('01:01:01');
  });

  it('clamps negative values to zero', () => {
    expect(formatDuration(-10)).toBe('00:00');
  });
});
