import { TestBed } from "@angular/core/testing";
import { ItemsSelect, MultipleSelect, ResultSettingModel } from "../../shared/models";
import { EarlyConstraintService } from "./early-constraint.service";
import { ExternalResultDetail, InputOption, MatchDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResultByPlayerNamePipe, ResultValuePipe } from "../pipes";

describe('EarlyConstraintService', () => {
    let service: EarlyConstraintService;
    let resultDetail: ResultDetail;
    let resultDetails: ResultDetail[];
    const matchDetail = new MatchDetail();

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                EarlyConstraintService,
                ResultValuePipe,
                ResultByPlayerNamePipe,
            ]
        });

        resultDetail = new ResultDetail();
        resultDetails = [];
        service = TestBed.inject(EarlyConstraintService);
    });

    it('isInValidResultValue - should return true when exist result warning', () => {
        resultDetail.isResultWarning = true;
        resultDetails = [resultDetail];

        const result = service.isInValidResultValue(resultDetails);

        expect(result).toBe(true);
    });

    it('verifyResultValueForBetType - should set warning for all results', () => {
        const coupleScore = new ResultDetail();
        coupleScore.inputType = 3;
        const other = new ResultDetail();
        other.inputType = 1;
        resultDetails = [coupleScore,  other];

        service.verifyResultValueForBetType(resultDetails);

        expect(coupleScore.isResultWarning).toBe(true);
        expect(other.isResultWarning).toBe(true);
    });

    it('getGroupMap - should group results by map', () => {
        const result1 = new ResultDetail();
        result1.groupName = '1';
        const result2 = new ResultDetail();
        result2.groupName = '1';
        const result3 = new ResultDetail();
        result3.groupName = '2';
        resultDetails = [result1, result2, result3];
        const resultSettingData = new ResultSettingModel();
        resultDetails.forEach(item => item.resultSettingData = resultSettingData);
        const maps = service.getGroupMap(resultDetails, matchDetail);

        expect(maps.length).toEqual(2);
    });

    describe('getPlayerResultName', () => {
        it('should return "None" when value is "N"', () => {
            const result = new ResultDetail();
            result.inputType = 5;
            result.homeValue = "N";

            const actual = service.getPlayerResultName(result);

            expect(actual).toEqual("None");
        });

        it('should call pipe to get player name', () => {
            const result = new ResultDetail();
            result.inputType = 6;
            result.homeValue = "01,02";
            const resultByPlayerNamePipe = TestBed.inject(ResultByPlayerNamePipe);
            jest.spyOn(resultByPlayerNamePipe, 'transform').mockReturnValue("Player Name");

            const actual = service.getPlayerResultName(result);

            expect(actual).toEqual("Player Name");
        });
    });

    it('getResultNameByValue - should call pipe to get player name', () => {
        const result = new ResultDetail();
        result.homeValue = "C";
        const resultValuePipe = TestBed.inject(ResultValuePipe);
        jest.spyOn(resultValuePipe, 'transform').mockReturnValue("Result Name");

        const actual = service.getResultNameByValue(result);

        expect(actual).toEqual("Result Name");
    });

    it('generateMultipleResultSelect - should generate multiple select for result and external result', () => {
        resultDetail.inputOptions = [
            new InputOption(),
            new InputOption()
        ];
        resultDetail.homeValue = '';
        resultDetail.externalScores = [new ExternalResultDetail(101, '1234', '')];

        service.generateMultipleResultSelect([resultDetail]);

        expect(resultDetail.multipleResultSelect.items.length).toEqual(2);
    });

    it('getOtherInfo - should get correct other info', () => {
        const result1 = new ResultDetail();
        result1.inputType = 6;
        result1.multipleResultSelect = new MultipleSelect();
        result1.multipleResultSelect.items = [
            new ItemsSelect(1, '', '', true, true, true, []),
            new ItemsSelect(2, '', '', true, true, true, [])
        ];
        const result2 = new ResultDetail();
        result2.inputType = 6;
        result2.multipleResultSelect = new MultipleSelect();
        result2.multipleResultSelect.items = [];
        const result3 = new ResultDetail();
        result3.inputType = 5;
        result3.homeValue = 'N';
        const result4 = new ResultDetail();
        result4.inputType = 5;
        result4.homeValue = '02';
        result4.inputOptions = [{ value: '02', playerId: 222} as InputOption];

        service.getOtherInfo([result1, result2, result3, result4]);

        expect(result1.otherInfo).toEqual('1,2');
        expect(result2.otherInfo).toEqual('');
        expect(result3.otherInfo).toEqual('');
        expect(result4.otherInfo).toEqual('222');
    });
});