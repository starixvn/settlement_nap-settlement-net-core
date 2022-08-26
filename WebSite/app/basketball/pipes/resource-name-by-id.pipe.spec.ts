import { ResourceNameByIdPipe } from './resource-name-by-id.pipe';

describe('Pipe: resourceName', () => {
  let pipe: ResourceNameByIdPipe;
  beforeEach(() => {
    pipe = new ResourceNameByIdPipe();
  });

  it('providing resourceId = QX returns name "Quater X"', () => {
    expect(pipe.transform("QX")).toBe("Quarter X");
  });

  it('providing resourceId = 00 returns name "Full Time"', () => {
    expect(pipe.transform("00")).toBe("Full Time");
  });

  it('providing any resourceId = 01 returns name "First Half"', () => {
    expect(pipe.transform("01")).toBe("First Half");
  });

  it('providing any resourceId = OT returns name "Over Time"', () => {
    expect(pipe.transform("OT")).toBe("Over Time");
  });

  it('Should returns right resourceId', () => {
    expect(pipe.transform("123")).toBe("123");
  });
});
