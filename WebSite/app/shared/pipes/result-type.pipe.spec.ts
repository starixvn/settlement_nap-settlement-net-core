
import { ResultDetail } from '../models/sportsbook-sop';
import { ResultTypePipe } from './result-type.pipe';

describe('Pipe: ResultTypePipe', () => {
    let pipe: ResultTypePipe;
    beforeEach(() => {
        pipe = new ResultTypePipe();
    });

    it('should return new list after filter by groupName', () => {
        const item1 = new ResultDetail();
        item1.groupName = "Group 1";
        item1.isShow = false;

        const item2 = new ResultDetail();
        item2.resultStatus = "Group 2";
        const filterGroupName = ['Group 1'];

        const expectedList = new ResultDetail();
        expectedList.groupName = "Group 1";
        expectedList.isShow = true;

        const items = [item1, item2];
        expect(pipe.transform(items, filterGroupName)).toEqual([expectedList]);
    });

    it('should return empty list after filter by groupName', () => {
        const item1 = new ResultDetail();
        item1.groupName = "Group 1";
        const item2 = new ResultDetail();
        item2.resultStatus = "Group 2";
        const filterGroupName = ['Group Test'];
        const items = [item1, item2];
        expect(pipe.transform(items, filterGroupName)).toEqual([]);
    });

   
});
