import { IntervalScorePipe } from './interval-score.pipe';
import { Score } from '../../shared/models';

describe('Pipe: IntervalScorePipe', () => {
  let pipe: IntervalScorePipe;

  beforeEach(() => {
    pipe = new IntervalScorePipe();
  });

  it('should return [item1, item2] when teamName = Home', () => {
    const item1 = new Score("1", "2");
    const item2 = new Score("3", "4");
    const item3 = new Score("5", "6");
    const item4 = new Score("7", "8");
    const items = [item1, item2, item3, item4];
    expect(pipe.transform(items, "Home")).toEqual([item1, item2]);
  });

  it('should return [item3, item4] when teamName = Away', () => {
    const item1 = new Score("1", "2");
    const item2 = new Score("3", "4");
    const item3 = new Score("5", "6");
    const item4 = new Score("7", "8");
    const items = [item1, item2, item3, item4];
    expect(pipe.transform(items, "Away")).toEqual([item3, item4]);
  });

});
