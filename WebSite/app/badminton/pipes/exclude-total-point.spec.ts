import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExcludeTotalPointPipe } from './exclude-total-point';
describe('Pipe: ExcludeTotalPoint', () => {
  let pipe: ExcludeTotalPointPipe;
  beforeEach(() => {
    pipe = new ExcludeTotalPointPipe();
  });

  it('should return list resource and exclude resourceId =01', () => {
    const resultDetails: ResultDetail[] = [];
    const itemOne = new ResultDetail();
    itemOne.resourceId = "00";
    const itemTwo = new ResultDetail();
    itemTwo.resourceId = "01";
    const itemThree = new ResultDetail();
    itemThree.resourceId = "7120109";

    resultDetails.push(itemOne);
    resultDetails.push(itemTwo);
    resultDetails.push(itemThree);
    expect(pipe.transform(resultDetails).length).toBe(2);
  });
});
