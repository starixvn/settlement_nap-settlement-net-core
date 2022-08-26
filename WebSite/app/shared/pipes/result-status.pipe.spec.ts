
import { ResultDetail } from '../models/sportsbook-sop';
import { ResultSettingModel } from '../models';
import { ResultStatusPipe } from './result-status.pipe';

describe('Pipe: ResultStatusPipe', () => {
    let pipe: ResultStatusPipe;
    beforeEach(() => {
        pipe = new ResultStatusPipe();
    });

    it('should return new list after filter by result status', () => {
        const item1 = new ResultDetail();
        item1.resultStatus = "Running";
        item1.isShow = false;

        const item2 = new ResultDetail();
        item2.resultStatus = "No Result";

        const filterResultStatus = ['Running'];
        const items = [item1, item2];

        const expectedList = new ResultDetail();
        expectedList.resultStatus = "Running";
        expectedList.isShow = true;
        expect(pipe.transform(items, filterResultStatus)).toEqual([expectedList]);
    });

    it('should return empty list after filter by result status', () => {
        const item1 = new ResultDetail();
        item1.resultStatus = "Running";
        item1.isShow = false;

        const item2 = new ResultDetail();
        item2.resultStatus = "No Result";

        const filterResultStatus = ['Completed'];
        const items = [item1, item2];

        expect(pipe.transform(items, filterResultStatus)).toEqual([]);
    });

    it('should return new list after filter by result status is Confirmed and isConfirmedRefund = true', () => {
        const item1 = new ResultDetail();
        item1.resultStatus = "Confirmed";
        item1.isShow = false;
        const resultSettingData = new ResultSettingModel();
        resultSettingData.isConfirmedRefund = true;
        item1.resultSettingData = resultSettingData;

        const item2 = new ResultDetail();
        item2.resultStatus = "No Result";
        item2.resultSettingData = new ResultSettingModel();


        const filterResultStatus = ['Confirmed'];
        const items = [item1, item2];

        const expectedList = new ResultDetail();
        expectedList.resultStatus = "Confirmed";
        expectedList.isShow = true;
        expectedList.resultSettingData = resultSettingData;

        const actual = pipe.transform(items, filterResultStatus);

        expect(actual).toEqual([expectedList]);
    });
});
