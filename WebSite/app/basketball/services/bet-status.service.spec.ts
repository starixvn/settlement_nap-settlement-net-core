import { BetStatusService } from "./bet-status.service";
import { TestBed, inject } from "@angular/core/testing";
import { Match } from "../models";
import { ResultDetail } from "../../shared/models/sportsbook-sop/result-detail.model";
import { Permission, MatchDetail } from "../../shared/models/sportsbook-sop";

export class CreateDataTest {
    public static CreateResultDetail(
      resourceId: string,
      home: string,
      away: string,
      checked: boolean
    ) {
      const item = new ResultDetail();
      item.resourceId = resourceId;
      item.checked = checked;
      item.homeValue = home;
      item.awayValue = away;
      item.originalAwayValue = away;
      item.originalHomeValue = home;
      return item;
    }
  }

describe('BasketBall - BetStatus Service', () => {
    let service: BetStatusService;

    let resultDetail = new ResultDetail();
    resultDetail.resourceId = "Q1"
    resultDetail.checked = false;

    const matchDetail = new MatchDetail();
    matchDetail.matchId = 1;
    const match = new Match(matchDetail);
    match.permission = new Permission();

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BetStatusService,
            ],

        });
    });

    beforeEach(inject([BetStatusService], (betStatusService: BetStatusService) => {
        service = betStatusService;
    }));

    describe('getBetStatus - For uncalculate', () => {
        beforeEach(() => {
            match.resultDetails = [];
            const resultDetailQ2 = CreateDataTest.CreateResultDetail('Q2', '', '', true);
            const resultDetailFirstHalf = CreateDataTest.CreateResultDetail('01', '', '', true);
            const resultDetailQ3 = CreateDataTest.CreateResultDetail('Q3', '', '', true);
            const resultDetailQ4 = CreateDataTest.CreateResultDetail('Q4', '', '', true);
            const resultDetailOT = CreateDataTest.CreateResultDetail('OT', '', '', false);
            const resultDetailFinal = CreateDataTest.CreateResultDetail('00', '', '', true);
            match.resultDetails = [resultDetail, resultDetailQ2, resultDetailFirstHalf,
                resultDetailQ3, resultDetailQ4, resultDetailOT, resultDetailFinal];
        });

        it('should return "Refund" bet status.', () => {
            match.matchDetail.betStatus = 'Refund';
            match.isScoreDirect = true;
            match.resultDetails[6].checked = false;

            const result = service.getBetStatus(true, match, match.resultDetails);

            expect(result).toEqual('Refund;');
        });

        it('should return bet status when all quarter are checked', () => {
            match.matchDetail.betStatus = '';
            match.resultDetails.forEach(item => item.checked = true);
            match.resultDetails[6].checked = false;
            match.isScoreDirect = false;

            const result = service.getBetStatus(true, match, match.resultDetails);
            const expected = '0-0,0-0,0-0,0-0,0-0';

            expect(result).toEqual(expected);
        });

        it('should return bet status when all quarter are unchecked', () => {
            match.matchDetail.betStatus = '';
            match.resultDetails.forEach(item => item.checked = false);
            match.resultDetails[6].checked = false;
            match.resultDetails[0].originalAwayValue = '1';
            match.resultDetails[0].originalHomeValue = '';
            match.isScoreDirect = false;

            const result = service.getBetStatus(true, match, match.resultDetails);
            const expected = '0-1,0-0,0-0,0-0,0-0';

            expect(result).toEqual(expected);
        });

    });

    describe('getBetStatus - For calculate', () => {
        beforeEach(() => {
            match.resultDetails = [];
            resultDetail = CreateDataTest.CreateResultDetail('Q1', '1', '2', false);
            const resultDetailQ2 = CreateDataTest.CreateResultDetail('Q2', '1', '1', true);
            const resultDetailFirstHalf = CreateDataTest.CreateResultDetail('01', '1', '1', true);
            const resultDetailQ3 = CreateDataTest.CreateResultDetail('Q3', '1', '1', true);
            const resultDetailQ4 = CreateDataTest.CreateResultDetail('Q4', '1', '1', true);
            const resultDetailOT = CreateDataTest.CreateResultDetail('OT', '1', '1', false);
            const resultDetailFinal = CreateDataTest.CreateResultDetail('00', '1', '1', true);
            match.resultDetails = [resultDetail, resultDetailQ2, resultDetailFirstHalf,
                resultDetailQ3, resultDetailQ4, resultDetailOT, resultDetailFinal];
        });

        it('should return bet status', () => {
            match.matchDetail.betStatus = 'Refund';
            match.isScoreDirect = false;
            match.resultDetails[6].checked = false;
            match.resultDetails[0].checked = true;

            const result = service.getBetStatus(false, match, match.resultDetails);

            expect(result).toEqual('Refund;1-2,1-1,1-1,1-1,1-1');
        });

        it('should return bet status when all quarter are checked', () => {
            match.matchDetail.betStatus = '';
            match.isScoreDirect = false;
            match.resultDetails.forEach(item => item.checked = true);

            const result = service.getBetStatus(false, match, match.resultDetails);
            const expected = '1-2,1-1,1-1,1-1,1-1';

            expect(result).toEqual(expected);
        });

        it('should return bet status when all quarter are unchecked', () => {
            match.matchDetail.betStatus = '';
            match.isScoreDirect = false;
            match.resultDetails.forEach(item => item.checked = false);

            const result = service.getBetStatus(false, match, match.resultDetails);
            const expected = '1-2,1-1,1-1,1-1,1-1';

            expect(result).toEqual(expected);
        });

        it('should return "Refund" bet status.', () => {
            match.matchDetail.betStatus = 'Refund';
            match.isScoreDirect = true;
            match.resultDetails[6].checked = false;

            const result = service.getBetStatus(false, match, match.resultDetails);

            expect(result).toEqual('Refund;');
        });
    });

});