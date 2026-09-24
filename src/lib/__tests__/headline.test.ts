import { describe, expect, it } from 'vitest';
import { splitHeadline } from '../headline';

describe('splitHeadline', () => {
  it('splits the live home headline into two editorial lines', () => {
    expect(splitHeadline('Clean Cuts. Sharp Fades.')).toEqual(['Clean Cuts.', 'Sharp Fades.']);
  });

  it('returns the original string when there is no sentence break', () => {
    expect(splitHeadline('Marena Cutz')).toEqual(['Marena Cutz']);
  });

  it('handles empty input', () => {
    expect(splitHeadline('')).toEqual(['']);
  });
});
