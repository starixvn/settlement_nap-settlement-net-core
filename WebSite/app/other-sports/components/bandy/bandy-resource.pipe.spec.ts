import { BandyResourceNamePipe } from './bandy-resource.pipe';

describe('BandyResourceNamePipe', () => {
  let pipe: BandyResourceNamePipe;

  beforeEach(() => {
    pipe = new BandyResourceNamePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    describe('when showFull is true (default)', () => {
      it('should return "First Half" for resourceId "01"', () => {
        const result = pipe.transform('01');
        expect(result).toBe('First Half');
      });

      it('should return "First Half" for resourceId "01" with showFull explicitly true', () => {
        const result = pipe.transform('01', true);
        expect(result).toBe('First Half');
      });

      it('should return "Full Time" for resourceId "0001"', () => {
        const result = pipe.transform('0001');
        expect(result).toBe('Full Time');
      });

      it('should return "Full Time" for resourceId "0001" with showFull explicitly true', () => {
        const result = pipe.transform('0001', true);
        expect(result).toBe('Full Time');
      });

      it('should return "ET" for resourceId "ET"', () => {
        const result = pipe.transform('ET');
        expect(result).toBe('ET');
      });

      it('should return "ET" for resourceId "ET" with showFull explicitly true', () => {
        const result = pipe.transform('ET', true);
        expect(result).toBe('ET');
      });

      it('should return "PEN" for resourceId "PEN"', () => {
        const result = pipe.transform('PEN');
        expect(result).toBe('PEN');
      });

      it('should return "PEN" for resourceId "PEN" with showFull explicitly true', () => {
        const result = pipe.transform('PEN', true);
        expect(result).toBe('PEN');
      });

      it('should return "Final Score" for resourceId "00"', () => {
        const result = pipe.transform('00');
        expect(result).toBe('Final Score');
      });

      it('should return "Final Score" for resourceId "00" with showFull explicitly true', () => {
        const result = pipe.transform('00', true);
        expect(result).toBe('Final Score');
      });
    });

    describe('when showFull is false', () => {
      it('should return "HT" for resourceId "01"', () => {
        const result = pipe.transform('01', false);
        expect(result).toBe('HT');
      });

      it('should return "FT" for resourceId "0001"', () => {
        const result = pipe.transform('0001', false);
        expect(result).toBe('FT');
      });

      it('should return "ET" for resourceId "ET"', () => {
        const result = pipe.transform('ET', false);
        expect(result).toBe('ET');
      });

      it('should return "PEN" for resourceId "PEN"', () => {
        const result = pipe.transform('PEN', false);
        expect(result).toBe('PEN');
      });

      it('should return "Final Score" for resourceId "00"', () => {
        const result = pipe.transform('00', false);
        expect(result).toBe('Final Score');
      });
    });

    describe('default case for unknown resourceId', () => {
      it('should return empty string for unknown resourceId with showFull true', () => {
        const result = pipe.transform('unknown');
        expect(result).toBe('');
      });

      it('should return empty string for unknown resourceId with showFull false', () => {
        const result = pipe.transform('unknown', false);
        expect(result).toBe('');
      });

      it('should return empty string for empty resourceId', () => {
        const result = pipe.transform('');
        expect(result).toBe('');
      });

      it('should return empty string for null resourceId', () => {
        const result = pipe.transform(null as any);
        expect(result).toBe('');
      });

      it('should return empty string for undefined resourceId', () => {
        const result = pipe.transform(undefined as any);
        expect(result).toBe('');
      });
    });

    describe('edge cases', () => {
      it('should handle numeric resourceId as string', () => {
        const result = pipe.transform('1');
        expect(result).toBe('');
      });

      it('should handle case sensitivity for "et" vs "ET"', () => {
        const result = pipe.transform('et');
        expect(result).toBe('');
      });

      it('should handle case sensitivity for "pen" vs "PEN"', () => {
        const result = pipe.transform('pen');
        expect(result).toBe('');
      });

      it('should handle whitespace in resourceId', () => {
        const result = pipe.transform(' 01 ');
        expect(result).toBe('');
      });

      it('should handle special characters in resourceId', () => {
        const result = pipe.transform('01!');
        expect(result).toBe('');
      });
    });
  });
});
