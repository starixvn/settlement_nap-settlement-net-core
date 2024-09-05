import { ScorePipe } from './score.pipe';

describe('Score by Settlement Pipe', () => {
    const pipe = new ScorePipe();
    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return "-" when score is null or empty', () => {
      expect(pipe.transform(null)).toBe("-");
    });

    it('should return right score when has score', () => {
      const result = pipe.transform(2);
      expect(result).toEqual(2);
  });
});