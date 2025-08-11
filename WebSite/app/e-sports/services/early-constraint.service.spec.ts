import { TestBed } from "@angular/core/testing";
import { EarlyConstraintService } from "./early-constraint.service";
import { ResultSettingModel } from "../../shared/models";
import { MatchDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResultByTeamNamePipe } from "../../shared/pipes/result-by-team-name.pipe";

describe('EarlyConstraintService', () => {
    let service: EarlyConstraintService;
    let resultDetail: ResultDetail;
    let resultDetails: ResultDetail[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                EarlyConstraintService,
                ResultByTeamNamePipe,
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

    it('isInValidDuration - should return true when exist duration warning', () => {
        resultDetail.isDurationWarning = true;
        resultDetails = [resultDetail];

        const result = service.isInValidDuration(resultDetails);

        expect(result).toBe(true);
    });

    it('verifyResultValueForBetType - should set warning for all results', () => {
        const coupleScore = new ResultDetail();
        coupleScore.betType = '9002';
        const duration1 = new ResultDetail();
        duration1.betType = '9058';
        const duration2 = new ResultDetail();
        duration2.betType = '9058';
        duration2.homeValue = '5';
        duration2.awayValue = '60';
        const other = new ResultDetail();
        other.betType = '9063';
        resultDetails = [coupleScore, duration1, duration2, other];

        service.verifyResultValueForBetType(resultDetails);

        expect(coupleScore.isResultWarning).toBe(true);
        expect(duration1.isResultWarning).toBe(true);
        expect(duration2.isDurationWarning).toBe(true);
        expect(other.isResultWarning).toBe(true);
    });

    it('getGroupMap - should group results by map', () => {
        const result1 = new ResultDetail();
        result1.map = 1;
        const result2 = new ResultDetail();
        result2.map = 1;
        const result3 = new ResultDetail();
        result3.map = 2;
        resultDetails = [result1, result2, result3];
        const resultSettingData = new ResultSettingModel();
        resultDetails.forEach(item => item.resultSettingData = resultSettingData);
        const maps = service.getGroupMap(resultDetails);

        expect(maps.length).toEqual(2);
    });

    describe('getBetTypeGroup', () => {
        it('should return HomeAway group', () => {
            const result = service.getBetTypeGroup('9067');

            expect(result).toBe(1);
        });

        it('should return HomeAwayDraw group', () => {
            const result = service.getBetTypeGroup('9064');

            expect(result).toBe(2);
        });

        it('should return HomeAwayNone group', () => {
            const result = service.getBetTypeGroup('9101');

            expect(result).toBe(0);
        });

        it('should return YesNo group', () => {
            const result = service.getBetTypeGroup('9073');

            expect(result).toBe(3);
        });

        it('should return CoupleScores group', () => {
            const result = service.getBetTypeGroup('9002');

            expect(result).toBe(4);
        });

        it('should return Duration group', () => {
            const result = service.getBetTypeGroup('9058');

            expect(result).toBe(5);
        });

        it('should return Mid Not Mid group', () => {
            expect(service.getBetTypeGroup('9130')).toBe(6);
        });

        it('should return Top Not Top group', () => {
            const result = service.getBetTypeGroup('9135');

            expect(result).toBe(9);
        });

        it('should return Bottom Not Bottom group', () => {
            const result = service.getBetTypeGroup('9114');

            expect(result).toBe(10);
        });

        it('should return Overlord Tyrant group', () => {
            const result = service.getBetTypeGroup('9141');

            expect(result).toBe(11);
        });

        it('should return Tyrant Not Tyrant group', () => {
            const result = service.getBetTypeGroup('9142');

            expect(result).toBe(12);
        });
    });

    it('getConfirmMessage - should return correct confirm message', () => {
        const matchDetail = new MatchDetail();
        matchDetail.homeName = 'Liverpool';
        matchDetail.awayName = 'MNSD';
        const result1 = new ResultDetail();
        result1.groupBetType = 4;
        result1.homeValue = '1';
        result1.awayValue = '2';
        result1.betTypeName = 'Test Name';
        const result2 = new ResultDetail();
        result2.groupBetType = 7;
        result2.homeName = '3';
        result2.betTypeName = 'Test Name';
        const result3 = new ResultDetail();
        result3.groupBetType = 5;
        result3.homeValue = '4';
        result3.awayValue = '5';
        result3.betTypeName = 'Test Name';
        const result4 = new ResultDetail();
        result4.groupBetType = 6;
        result4.homeValue = 'N';
        result4.betTypeName = 'Test Name';
        const resultByTeamNamePipe = TestBed.inject(ResultByTeamNamePipe);
        jest.spyOn(resultByTeamNamePipe, 'transform').mockReturnValue('None');

        const message = service.getConfirmMessage([result1, result2, result3, result4], matchDetail);

        expect(message).toEqual('Are you sure you want to CALCULATE the selected results?<br/>Test Name: &nbspLiverpool(1) - MNSD(2)<br/>Test Name: undefined<br/>Test Name: 4:5<br/>Test Name: None<br/>');
    });
});