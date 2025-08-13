import { ResourceNamePipe } from './resource-name.pipe';
import { ResourceIds } from '../../shared/constants';

describe('ResourceNamePipe', () => {
  let pipe: ResourceNamePipe;

  beforeEach(() => {
    pipe = new ResourceNamePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    describe('special resources', () => {
      it('should return "Series" for fullTime when sessionTime is 1', () => {
        const result = pipe.transform(ResourceIds.fullTime, false, 1);
        expect(result).toBe('Series');
      });

      it('should return "Match" for fullTime when sessionTime is not 1', () => {
        const result = pipe.transform(ResourceIds.fullTime, false, 0);
        expect(result).toBe('Match');
      });

      it('should return "Extra Inning" for extraInning when not refund', () => {
        const result = pipe.transform(ResourceIds.extraInning, false, 0);
        expect(result).toBe('Extra Inning');
      });

      it('should return "E.I" for extraInning when refund', () => {
        const result = pipe.transform(ResourceIds.extraInning, true, 0);
        expect(result).toBe('E.I');
      });

      it('should return "Total Hits" for totalHits', () => {
        const result = pipe.transform(ResourceIds.totalHits, false, 0);
        expect(result).toBe('Total Hits');
      });

      it('should return "Total Hits" for totalHits when refund', () => {
        const result = pipe.transform(ResourceIds.totalHits, true, 0);
        expect(result).toBe('Total Hits');
      });
    });

    describe('regular resources (innings)', () => {
      it('should return "1st Inning" for resource ending with "01" when not refund', () => {
        const result = pipe.transform('inning01', false, 0);
        expect(result).toBe('1st Inning');
      });

      it('should return "1" for resource ending with "01" when refund', () => {
        const result = pipe.transform('inning01', true, 0);
        expect(result).toBe('1');
      });

      it('should return "2nd Inning" for resource ending with "02" when not refund', () => {
        const result = pipe.transform('inning02', false, 0);
        expect(result).toBe('2nd Inning');
      });

      it('should return "2" for resource ending with "02" when refund', () => {
        const result = pipe.transform('inning02', true, 0);
        expect(result).toBe('2');
      });

      it('should return "3rd Inning" for resource ending with "03" when not refund', () => {
        const result = pipe.transform('inning03', false, 0);
        expect(result).toBe('3rd Inning');
      });

      it('should return "3" for resource ending with "03" when refund', () => {
        const result = pipe.transform('inning03', true, 0);
        expect(result).toBe('3');
      });

      it('should return "4th Inning" for resource ending with "04" when not refund', () => {
        const result = pipe.transform('inning04', false, 0);
        expect(result).toBe('4th Inning');
      });

      it('should return "4" for resource ending with "04" when refund', () => {
        const result = pipe.transform('inning04', true, 0);
        expect(result).toBe('4');
      });

      it('should return "10th Inning" for resource ending with "10" when not refund', () => {
        const result = pipe.transform('inning10', false, 0);
        expect(result).toBe('10th Inning');
      });

      it('should return "10" for resource ending with "10" when refund', () => {
        const result = pipe.transform('inning10', true, 0);
        expect(result).toBe('10');
      });

      it('should return "11th Inning" for resource ending with "11" when not refund', () => {
        const result = pipe.transform('inning11', false, 0);
        expect(result).toBe('11th Inning');
      });

      it('should return "11" for resource ending with "11" when refund', () => {
        const result = pipe.transform('inning11', true, 0);
        expect(result).toBe('11');
      });

      it('should return "12th Inning" for resource ending with "12" when not refund', () => {
        const result = pipe.transform('inning12', false, 0);
        expect(result).toBe('12th Inning');
      });

      it('should return "12" for resource ending with "12" when refund', () => {
        const result = pipe.transform('inning12', true, 0);
        expect(result).toBe('12');
      });

      it('should return "21th Inning" for resource ending with "21" when not refund', () => {
        const result = pipe.transform('inning21', false, 0);
        expect(result).toBe('21th Inning');
      });

      it('should return "21" for resource ending with "21" when refund', () => {
        const result = pipe.transform('inning21', true, 0);
        expect(result).toBe('21');
      });

      it('should return "22th Inning" for resource ending with "22" when not refund', () => {
        const result = pipe.transform('inning22', false, 0);
        expect(result).toBe('22th Inning');
      });

      it('should return "22" for resource ending with "22" when refund', () => {
        const result = pipe.transform('inning22', true, 0);
        expect(result).toBe('22');
      });

      it('should return "23th Inning" for resource ending with "23" when not refund', () => {
        const result = pipe.transform('inning23', false, 0);
        expect(result).toBe('23th Inning');
      });

      it('should return "23" for resource ending with "23" when refund', () => {
        const result = pipe.transform('inning23', true, 0);
        expect(result).toBe('23');
      });

      it('should return "24th Inning" for resource ending with "24" when not refund', () => {
        const result = pipe.transform('inning24', false, 0);
        expect(result).toBe('24th Inning');
      });

      it('should return "24" for resource ending with "24" when refund', () => {
        const result = pipe.transform('inning24', true, 0);
        expect(result).toBe('24');
      });
    });

    describe('Game vs Inning naming', () => {
      it('should return "1st Game" when sessionTime is 1 and not refund', () => {
        const result = pipe.transform('inning01', false, 1);
        expect(result).toBe('1st Game');
      });

      it('should return "1" when sessionTime is 1 and refund', () => {
        const result = pipe.transform('inning01', true, 1);
        expect(result).toBe('1');
      });

      it('should return "2nd Game" when sessionTime is 1 and not refund', () => {
        const result = pipe.transform('inning02', false, 1);
        expect(result).toBe('2nd Game');
      });

      it('should return "2" when sessionTime is 1 and refund', () => {
        const result = pipe.transform('inning02', true, 1);
        expect(result).toBe('2');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for resource without numeric ending', () => {
        const result = pipe.transform('invalidResource', false, 0);
        expect(result).toBe('');
      });

      it('should return empty string for resource with non-numeric ending', () => {
        const result = pipe.transform('inningAB', false, 0);
        expect(result).toBe('');
      });

      it('should return empty string for empty resource', () => {
        const result = pipe.transform('', false, 0);
        expect(result).toBe('');
      });

      it('should return empty string for resource with single character ending', () => {
        const result = pipe.transform('inning1', false, 0);
        expect(result).toBe('');
      });

      it('should handle resource with more than 2 characters ending', () => {
        const result = pipe.transform('inning123', false, 0);
        expect(result).toBe('23th Inning');
      });
    });

    describe('default parameters', () => {
      it('should use default isRefund = false when not provided', () => {
        const result = pipe.transform('inning01', undefined, 0);
        expect(result).toBe('1st Inning');
      });

      it('should use default sessionTime = 0 when not provided', () => {
        const result = pipe.transform('inning01', false);
        expect(result).toBe('1st Inning');
      });

      it('should use both default parameters when not provided', () => {
        const result = pipe.transform('inning01');
        expect(result).toBe('1st Inning');
      });
    });
  });
}); 