import { TestBed } from '@angular/core/testing';
import { PenaltyShootoutService } from './index';
import { Score, ResultDetail } from '../../../models';
import { BetTypes } from '../../../constants';
import { ResultSettingModel } from '../../../../shared/models';

export class CreateDataTest {
    public static FakeDataOne(
        map: number,
        betType: string,
        home: string,
        away: string) {
        return {
            resourceId: null,
            resourceName:'',
            homeValue: home,
            awayValue: away,
            resultStatusId: null,
            settlementStatusId: 0,
            resultStatus: null,
            map,
            ticketStatus: null,
            betType,
            betTypeName: null,
            checked: null,
            isResultWarning: true,
            isHomeValueWarning: null,
            isAwayValueWarning: null,
            isInvalidValue: false,
            isNotTaken: false,
            isSettleDetermined: false,
            isSettleDeterminedOriginal: false,
            isInvalidSelectedProceed: false,
            isNotExistedValue: false,
            resultSettingData: new ResultSettingModel(),
        } as ResultDetail;
    }
}

describe(`Soccer - PenaltyShootoutService`, () => {
    let service: PenaltyShootoutService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PenaltyShootoutService],
        });

        service = TestBed.inject(PenaltyShootoutService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should return true when value is existed notTaken.', () => {
        expect(service.isSelectedNotTaken("NT")).toBe(true);
        expect(service.isSelectedNotTaken("1SNT")).toBe(true);
        expect(service.isSelectedNotTaken("1MNT")).toBe(true);
        expect(service.isSelectedNotTaken("NT2S")).toBe(true);
        expect(service.isSelectedNotTaken("NT2M")).toBe(true);
    });

    it('Should return true when home or away is empty.', () => {
        expect(service.isEmptyScore("", "")).toBe(true);
        expect(service.isEmptyScore("1", "")).toBe(true);
        expect(service.isEmptyScore("", "2")).toBe(true);
    });

    describe('isEmptyHomeOrAwayValue', () => {
        it('Should return true when home or away is empty with list bettypes(TimeOfFirstCorner, '
            + 'TimeOfSecondCorner, PenaltyShootoutOddEven, PenaltyShootoutExactTotalGoals, PenaltyWoodwork )', () => {
                const timeOfFirstCorner = CreateDataTest.FakeDataOne(1, BetTypes.TimeOfFirstCorner, "", "");
                expect(service.isEmptyHomeOrAwayValue(timeOfFirstCorner)).toBe(true);

                const timeOfSecondCorner = CreateDataTest.FakeDataOne(1, BetTypes.TimeOfSecondCorner, null, null);
                expect(service.isEmptyHomeOrAwayValue(timeOfSecondCorner)).toBe(true);

                const penaltyShootoutOddEven = CreateDataTest.FakeDataOne(1, BetTypes.PenaltyShootoutOddEven, "1", "");
                expect(service.isEmptyHomeOrAwayValue(penaltyShootoutOddEven)).toBe(true);

                const exactTotalGoals = CreateDataTest.FakeDataOne(1, BetTypes.PenaltyShootoutExactTotalGoals, "", "1");
                expect(service.isEmptyHomeOrAwayValue(exactTotalGoals)).toBe(true);

                const penaltyWoodwork = CreateDataTest.FakeDataOne(1, BetTypes.PenaltyWoodwork, "", "");
                expect(service.isEmptyHomeOrAwayValue(penaltyWoodwork)).toBe(true);
            });

        it('Should return true when home is empty', () => {
            const resultDetail = CreateDataTest.FakeDataOne(1, "", "", "S");
            expect(service.isEmptyHomeOrAwayValue(resultDetail)).toBe(true);
        });

    });

    describe('getScoreValue', () => {
        it('Should return empty when value is null.', () => {
            expect(service.getScoreValue(null)).toEqual("");
        });

        it('Should return correct input value.', () => {
            expect(service.getScoreValue("S")).toEqual("S");
        });
    });

    it('Should return expected list Scores.', () => {
        const expectedScores: Score[] = [];
        expectedScores.push(new Score("S", "S"));
        expectedScores.push(new Score("M", "M"));
        expectedScores.push(new Score("S", "M"));
        expectedScores.push(new Score("M", "S"));
        expectedScores.push(new Score("", ""));

        const resultDetails: ResultDetail[] = [];
        resultDetails.push(CreateDataTest.FakeDataOne(1, BetTypes.HomePenaltyShootout, "S", ""));
        resultDetails.push(CreateDataTest.FakeDataOne(1, BetTypes.AwayPenaltyShootout, "S", ""));
        resultDetails.push(CreateDataTest.FakeDataOne(2, BetTypes.HomePenaltyShootout, "M", ""));
        resultDetails.push(CreateDataTest.FakeDataOne(2, BetTypes.AwayPenaltyShootout, "M", ""));
        resultDetails.push(CreateDataTest.FakeDataOne(3, BetTypes.HomePenaltyShootout, "S", ""));
        resultDetails.push(CreateDataTest.FakeDataOne(3, BetTypes.AwayPenaltyShootout, "M", ""));
        resultDetails.push(CreateDataTest.FakeDataOne(4, BetTypes.HomePenaltyShootout, "M", ""));
        resultDetails.push(CreateDataTest.FakeDataOne(4, BetTypes.AwayPenaltyShootout, "S", ""));

        expect(service.listPenaltyShootoutRound(resultDetails)).toEqual(expectedScores);
    });

    describe('countHomePenaltyShooutoutByScore', () => {
        it('Should return total home score on list scores.', () => {
            const scores: Score[] = [];
            scores.push(new Score("S", "S"));
            scores.push(new Score("M", "M"));
            scores.push(new Score("S", "M"));
            scores.push(new Score("M", "S"));
            expect(service.countHomePenaltyShooutoutByScore(scores)).toEqual("2");
        });

        it('Should return empty when there are any home score = "" on list scores.', () => {
            const scores: Score[] = [];
            scores.push(new Score("S", "S"));
            scores.push(new Score("M", "M"));
            scores.push(new Score("S", "M"));
            scores.push(new Score("M", "S"));
            scores.push(new Score("", "S"));
            expect(service.countHomePenaltyShooutoutByScore(scores)).toEqual("");

        });
    });

    describe('countAwayPenaltyShooutoutByScore', () => {
        it('Should return total away score on list scores.', () => {
            const scores: Score[] = [];
            scores.push(new Score("S", "S"));
            scores.push(new Score("M", "M"));
            scores.push(new Score("S", "S"));
            scores.push(new Score("M", "S"));
            expect(service.countAwayPenaltyShooutoutByScore(scores)).toEqual("3");
        });

        it('Should return empty when there are any away score = "" on list scores.', () => {
            const scores: Score[] = [];
            scores.push(new Score("S", "S"));
            scores.push(new Score("M", "M"));
            scores.push(new Score("S", "M"));
            scores.push(new Score("M", "S"));
            scores.push(new Score("M", ""));
            expect(service.countAwayPenaltyShooutoutByScore(scores)).toEqual("");
        });
    });

    describe('getHomePenaltyShootoutCombo', () => {
        it('Should return empty when all homeValue is empty', () => {
            const scores: Score[] = [];
            scores.push(new Score("", "S"));
            scores.push(new Score("", "M"));

            const actual = service.getHomePenaltyShootoutCombo(scores);
            expect(actual).toEqual("");
        });

        it('Should return homeValue when homeValue is not empty', () => {
            const scores: Score[] = [];
            scores.push(new Score("NT", "S"));
            scores.push(new Score("M", "M"));

            const actual = service.getHomePenaltyShootoutCombo(scores);
            expect(actual).toEqual("NM");
        });
    });

    describe('getAwayPenaltyShootoutCombo', () => {
        it('Should return empty when all awayValue is empty', () => {
            const scores: Score[] = [];
            scores.push(new Score("S", ""));
            scores.push(new Score("M", ""));

            const actual = service.getAwayPenaltyShootoutCombo(scores);
            expect(actual).toEqual("");
        });

        it('Should return awayValue when awayValue is not empty', () => {
            const scores: Score[] = [];
            scores.push(new Score("S", "NT"));
            scores.push(new Score("M", "M"));

            const actual = service.getAwayPenaltyShootoutCombo(scores);
            expect(actual).toEqual("NM");
        });
    });

    it('Should return true when score is empty Or score First Ten match with home/away penaltyShootout.', () => {
        const resultDetail = CreateDataTest.FakeDataOne(6, "", "1", "3");
        expect(service.isMatchedHomeAwayOnPenaltyFirstTen("1", "3", resultDetail)).toBe(true);

        const resultDetailEmptyValue = CreateDataTest.FakeDataOne(6, "", "", "");
        expect(service.isMatchedHomeAwayOnPenaltyFirstTen("1", "3", resultDetailEmptyValue)).toBe(true);
    });

    it('Should return true when score is empty Or match.', () => {
        expect(service.isMatched(0, "1", "")).toBe(true);
        expect(service.isMatched(1, "1", "1")).toBe(true);
    });
});