import { describe, it, expect } from 'bun:test';
import { fitWithin } from './resize-image';
describe('fitWithin', () => {
  it('caps the longest side at 1080', () => { expect(fitWithin(4000, 3000)).toEqual({ width: 1080, height: 810 }); });
  it('never upscales small images', () => { expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 }); });
});
