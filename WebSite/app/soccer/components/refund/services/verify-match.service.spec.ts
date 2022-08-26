import { TestBed } from "@angular/core/testing";
import { SettlementStatusId } from "../../../../shared/constants";
import { ResultDetail } from "../../../models";
import { BetStatus } from "../../../constants";
import { MainRefundButtonStatus, SubRefundAllButtonStatus, SubRefundFTButtonStatus } from "../model/button-status";
import { MatchDetail } from "../model/match.model";
import { VerifyMatchService } from "./verify-match.service";

describe('Soccer refund - VerifyMatchService', () => {
    let service: VerifyMatchService;

    const matchDetail = {} as MatchDetail;
    const halfTimeResultDetail = {} as ResultDetail;
    const fullTimeResultDetail = {} as ResultDetail;

    halfTimeResultDetail.resourceId = '01';
    fullTimeResultDetail.resourceId = '00';
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            VerifyMatchService,
        ], imports: [
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(VerifyMatchService);
    });

    describe('setDisableRefund', () => {
        it('should return correct status button when match refund full time ', () => {
            const expected = new MainRefundButtonStatus(true, false, true);
            halfTimeResultDetail.settlementStatusId = SettlementStatusId.Calculated;
            fullTimeResultDetail.settlementStatusId = SettlementStatusId.RefundFullTime;
            matchDetail.betStatus = BetStatus.refundFT;

            expect(service.setDisableRefund(matchDetail, [halfTimeResultDetail, fullTimeResultDetail])).toEqual(expected);
        });

        it('should return correct status button when match refund All ', () => {
            const expected = new MainRefundButtonStatus(true, true, false);
            halfTimeResultDetail.settlementStatusId = SettlementStatusId.Refund;
            fullTimeResultDetail.settlementStatusId = SettlementStatusId.Refund;
            matchDetail.betStatus = 'refund;';

            expect(service.setDisableRefund(matchDetail, [halfTimeResultDetail, fullTimeResultDetail])).toEqual(expected);
        });

        it('should return correct status button when match refund half time ', () => {
            const expected = new MainRefundButtonStatus(false, false, true);
            halfTimeResultDetail.settlementStatusId = SettlementStatusId.RefundHalfTime;
            fullTimeResultDetail.settlementStatusId = SettlementStatusId.Running;
            matchDetail.betStatus = 'refund ht';

            expect(service.setDisableRefund(matchDetail, [halfTimeResultDetail, fullTimeResultDetail])).toEqual(expected);
        });

        it('should return correct status button when match refund half time and match calculated fulltime', () => {
            const expected = new MainRefundButtonStatus(false, true, true);
            halfTimeResultDetail.settlementStatusId = SettlementStatusId.RefundHalfTime;
            fullTimeResultDetail.settlementStatusId = SettlementStatusId.Calculated;
            matchDetail.betStatus = 'refund ht';

            expect(service.setDisableRefund(matchDetail, [halfTimeResultDetail, fullTimeResultDetail])).toEqual(expected);
        });

        it('should return correct status button when match refund half time and fulltime', () => {
            const expected = new MainRefundButtonStatus(false, false, true);
            halfTimeResultDetail.settlementStatusId = SettlementStatusId.RefundHalfTime;
            fullTimeResultDetail.settlementStatusId = SettlementStatusId.Refund;
            matchDetail.betStatus = 'refund;';

            expect(service.setDisableRefund(matchDetail, [halfTimeResultDetail, fullTimeResultDetail])).toEqual(expected);
        });

        it('should return correct status button when match calculated', () => {
            const expected = new MainRefundButtonStatus(true, true, true);
            halfTimeResultDetail.settlementStatusId = SettlementStatusId.Calculated;
            fullTimeResultDetail.settlementStatusId = SettlementStatusId.Calculated;
            matchDetail.isCalculated = true;
            matchDetail.betStatus = '';

            expect(service.setDisableRefund(matchDetail, [halfTimeResultDetail, fullTimeResultDetail])).toEqual(expected);
        });

        it('should enable all when match pass all case', () => {
            const expected = new MainRefundButtonStatus(false, false, false);
            halfTimeResultDetail.settlementStatusId = SettlementStatusId.Running;
            fullTimeResultDetail.settlementStatusId = SettlementStatusId.Running;
            matchDetail.isCalculated = false;
            matchDetail.betStatus = '';

            expect(service.setDisableRefund(matchDetail, [halfTimeResultDetail, fullTimeResultDetail])).toEqual(expected);
        });
    });

    describe('setDisableSubRefundFT', () => {
        it('should return correct status button when match refund all Pos ', () => {
            const expected = new SubRefundFTButtonStatus(true, false);

            expect(service.setDisableSubRefundFT(SettlementStatusId.Calculated, SettlementStatusId.RefundFullTime)).toEqual(expected);
        });

        it('should return correct status button when match refund all SUS', () => {
            const expected = new SubRefundFTButtonStatus(false, true);

            expect(service.setDisableSubRefundFT(SettlementStatusId.Calculated, SettlementStatusId.Abandoned2H)).toEqual(expected);
        });

        it('should enable all button when match pass all case', () => {
            const expected = new SubRefundFTButtonStatus(false, false);

            expect(service.setDisableSubRefundFT(SettlementStatusId.Refund, SettlementStatusId.Abandoned2H)).toEqual(expected);
        });
    });

    describe('setDisableSubRefundAll', () => {
        it('should return correct status button when match refund FT & HT', () => {
            const expected = new SubRefundAllButtonStatus(false, true);

            expect(service.setDisableSubRefundAll(SettlementStatusId.Refund, SettlementStatusId.Refund)).toEqual(expected);
        });


        it('should return correct status button when match refund abandoned 1h', () => {
            const expected = new SubRefundAllButtonStatus(true, false);

            expect(service.setDisableSubRefundAll(SettlementStatusId.Abandoned1H, SettlementStatusId.Abandoned1H)).toEqual(expected);
        });

        it('should enable all button when match pass all case', () => {
            const expected = new SubRefundAllButtonStatus(false, false);

            expect(service.setDisableSubRefundAll(SettlementStatusId.Refund, SettlementStatusId.Abandoned1H)).toEqual(expected);
        });
    });

    it('validateScoreFullTime - return true when exist score empty', () => {
        matchDetail.finalAwayScore = 1;
        matchDetail.finalHomeScore = null;

        expect(service.validateScoreFullTime(matchDetail)).toBeTruthy();
        expect(matchDetail.isWarningFinalHomeScore).toBeTruthy();
        expect(matchDetail.isWarningFinalAwayScore).toBeFalsy();
    });

    it('validateScoreHalfTime - return true when exist score empty', () => {
        matchDetail.halfTimeAwayScore = 1;
        matchDetail.halfTimeHomeScore = null;

        expect(service.validateScoreHalfTime(matchDetail)).toBeTruthy();
        expect(matchDetail.isWarningHalfTimeHomeScore).toBeTruthy();
        expect(matchDetail.isWarningHalfTimeAwayScore).toBeFalsy();
    });

    it('isRefundHalfTimeBetStatus - return true when match refunded', () => {
        matchDetail.betStatus = 'Refund HT;';
        
        expect(service.isRefundHalfTimeBetStatus(matchDetail)).toBeTruthy();
    });

});