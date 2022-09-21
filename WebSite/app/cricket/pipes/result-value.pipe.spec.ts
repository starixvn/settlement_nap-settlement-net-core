import { ResultValuePipe } from './result-value.pipe';

describe('Pipe: ResultValuePipe', () => {
  let pipe: ResultValuePipe;

  beforeEach(() => {
    pipe = new ResultValuePipe();
  });

  it('return - when value is empty', () => {
    expect(pipe.transform("")).toBe("-");
  });

  it('return Caught when value is C', () => {
    expect(pipe.transform("C")).toBe("Caught");
  });

  it('return Not Caught when value is NC', () => {
    expect(pipe.transform("NC")).toBe("Not Caught");
  });

  it('return Bowled when value is B', () => {
    expect(pipe.transform("B")).toBe("Bowled");
  });

  it('return LBW when value is LBW', () => {
    expect(pipe.transform("LBW")).toBe("LBW");
  });

  it('return Run Out when value is RO', () => {
    expect(pipe.transform("RO")).toBe("Run Out");
  });

  it('return Stumped when value is S', () => {
    expect(pipe.transform("S")).toBe("Stumped");
  });

  it('return Others when value is OT', () => {
    expect(pipe.transform("OT")).toBe("Others");
  });

  it('return Yes when value is Y', () => {
    expect(pipe.transform("Y")).toBe("Yes");
  });

  it('return None when value is N and bettype = 9662 or 9663', () => {
    expect(pipe.transform("N", "9662")).toBe("None");
  });

  it('return No when value is N and bettype != 9662 or 9663', () => {
    expect(pipe.transform("N", "9660")).toBe("No");
  });

  it('return correct input value', () => {
    expect(pipe.transform("Normal")).toBe("Normal");
  });

});
