import { GroupNameByIdPipe } from './group-name-by-id.pipe';

describe('Pipe: ResourceHeader', () => {
  let pipe: GroupNameByIdPipe;
  beforeEach(() => {
    pipe = new GroupNameByIdPipe();
  });

  it('providing Id = 6 returns name "Penalty Shootout - First 10"', () => {
    expect(pipe.transform(6)).toBe("Penalty Shootout - First 10");
  });

  it('providing Id = 7 returns name "Extra Time - Next Goal Method"', () => {
    expect(pipe.transform(7)).toBe("Extra Time - Next Goal Method");
  });

  it('providing Id = 8 returns name "Penalty Shootout - Sudden Death"', () => {
    expect(pipe.transform(8)).toBe("Penalty Shootout - Sudden Death");
  });

  it('providing Id = 9 returns name "Goal"', () => {
    expect(pipe.transform(9)).toBe("Goal");
  });

  it('providing Id = 10 returns name "Corner"', () => {
    expect(pipe.transform(10)).toBe("Corner");
  });

  it('providing Id is penalty shootout(1->5) returns name "Penalty Shootout - Round"', () => {
    expect(pipe.transform(1)).toBe("Penalty Shootout - Round 1");
  });
});
