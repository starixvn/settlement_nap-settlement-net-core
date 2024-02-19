import { HttpClient, HttpClientModule, HttpHandler } from "@angular/common/http";
import { fakeAsync, inject, TestBed, tick } from "@angular/core/testing";
import { RequestService } from "../../services/request.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop/result-detail.model";
import { BlockUIService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { HalfTimeFullTimeService } from "./halftime-fulltime.service";
import { ResourcesIds } from "../../constants";
import * as _ from 'lodash';
import { Match, MatchDetail } from "../../models";
import { SportType } from "../../../shared/constants";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { Language } from "../../../shared/language.native";
import { ModalContentDialogComponent } from "../../../shared/components/modal-dialog/modal-content-dialog.component";
import { ModalDialogComponent } from "../../../shared/components/modal-dialog/modal-dialog.component";

describe('HalfTimeFullTimeService', () => {
    let service: HalfTimeFullTimeService = null;
    let requestService: RequestService;
    let httpRequestService: HttpRequestService;
    const matchDetail = new MatchDetail();
    const resultDetail = new ResultDetail();
    const halfTime = new ResultDetail();
    halfTime.resourceId = ResourcesIds.halfTime;
    const fullTime = new ResultDetail();
    fullTime.resourceId = ResourcesIds.fullTime;
    const match = new Match();
    const buttonName = "btn-danger";
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                HalfTimeFullTimeService,
                RequestService,
                BlockUIService,
                HttpRequestService,
                HttpClient,
                HttpHandler,
                { provide: MessageBoxService, useClass: MessageBoxService },
            ],
            imports: [
                HttpClientModule,
                NgbModule,
                FormsModule,
            ],
            declarations: [
                ModalDialogComponent,
                ModalContentDialogComponent
            ]
        });

        service = TestBed.inject(HalfTimeFullTimeService);
        requestService = TestBed.inject(RequestService);
        httpRequestService = TestBed.inject(HttpRequestService);
    });

    beforeEach(inject([HalfTimeFullTimeService], (Service: HalfTimeFullTimeService) => {
        service = Service;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    it('should return correct number set on half time', () => {
        const numberSetOnHalfTimeOfBaseBall = service.numberSetOnHalfTime(SportType.baseBall);
        const numberSetOnHalfTimeOfFootball = service.numberSetOnHalfTime(SportType.football);
        const numberSetOnHalfTimeOfHockey = service.numberSetOnHalfTime(SportType.iceHockey);

        expect(numberSetOnHalfTimeOfBaseBall).toBe(5);
        expect(numberSetOnHalfTimeOfFootball).toBe(2);
        expect(numberSetOnHalfTimeOfHockey).toBe(0);
    });

    describe('isReadyMatch', () => {
        it('should return true when match confirmed FT', () => {
            matchDetail.confirmFT = 2;

            const isReadyMatch = service.isReadyMatch(matchDetail);

            expect(isReadyMatch).toBeTruthy();
        });

        it('should return true when match confirmed HT', () => {
            matchDetail.confirmFT = 0;
            matchDetail.confirmHT = 2;

            const isReadyMatch = service.isReadyMatch(matchDetail);

            expect(isReadyMatch).toBeTruthy();
        });

        it('should return true when event status equal completed', () => {
            matchDetail.confirmFT = 0;
            matchDetail.confirmHT = 0;
            matchDetail.eventStatus = 'completed';

            const isReadyMatch = service.isReadyMatch(matchDetail);

            expect(isReadyMatch).toBeTruthy();
        });

        it('should return true when play time enough for baseball', () => {
            matchDetail.confirmFT = 0;
            matchDetail.confirmHT = 0;
            matchDetail.eventStatus = 'running';
            matchDetail.playTime = 61;
            matchDetail.sportType = SportType.baseBall;

            const isReadyMatch = service.isReadyMatch(matchDetail);

            expect(isReadyMatch).toBeTruthy();
        });

        it('should return true when play time enough for other', () => {
            matchDetail.confirmFT = 0;
            matchDetail.confirmHT = 0;
            matchDetail.eventStatus = 'running';
            matchDetail.playTime = 31;
            matchDetail.sportType = SportType.football;

            const isReadyMatch = service.isReadyMatch(matchDetail);

            expect(isReadyMatch).toBeTruthy();
        });
    });

    describe('processScore', () => {
        it('should clear score when user is member and match running', () => {
            matchDetail.isCalRefund = false;
            matchDetail.isCalculated = false;
            matchDetail.isHalfTimeCal = false;
            halfTime.homeValue = "2";
            halfTime.awayValue = "1";
            fullTime.homeValue = "1";
            fullTime.awayValue = "2";
            resultDetail.homeValue = "2";

            service.processScore(matchDetail, halfTime, fullTime, [resultDetail], 0, false);

            expect(halfTime.homeValue).toBeNull();
            expect(halfTime.awayValue).toBeNull();
            expect(fullTime.homeValue).toBeNull();
            expect(fullTime.awayValue).toBeNull();
            expect(resultDetail.homeValue).toBeNull();
        });
        it('should clear score whe match refunded', () => {
            matchDetail.betStatus = 'Refund;';
            halfTime.homeValue = "2";
            halfTime.awayValue = "1";
            fullTime.homeValue = "1";
            fullTime.awayValue = "2";

            service.processScore(matchDetail, halfTime, fullTime, [resultDetail], 0, true);

            expect(halfTime.homeValue).toBeNull();
            expect(halfTime.awayValue).toBeNull();
            expect(fullTime.homeValue).toBeNull();
            expect(fullTime.awayValue).toBeNull();
        });

        it('not touch score whe match calculated', () => {
            matchDetail.betStatus = 'calculated';
            matchDetail.isCalculated = true;
            matchDetail.isHalfTimeCal = false;
            halfTime.homeValue = "2";
            halfTime.awayValue = "1";
            fullTime.homeValue = "1";
            fullTime.awayValue = "2";

            service.processScore(matchDetail, halfTime, fullTime, [resultDetail], 0, false);

            expect(halfTime.homeValue).toBeNull();
            expect(halfTime.awayValue).toBeNull();
            expect(fullTime.homeValue).toEqual("1");
            expect(fullTime.awayValue).toEqual("2");
        });
    });

    describe('copyScore', () => {
        it('should copy external halftime score when result is half time', fakeAsync(() => {
            matchDetail.exHTAwayScore = 2;
            matchDetail.exHTHomeScore = 2;
            halfTime.homeValue = "1";
            halfTime.awayValue = "1";

            service.copyScore(halfTime, matchDetail, "abcde 'provider_name'", "SBO");
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(halfTime.homeValue).toEqual("2");
            expect(halfTime.awayValue).toEqual("2");

        }));
        it('should copy external fulltime score when result is full time', fakeAsync(() => {
            matchDetail.exFTAwayScore = 2;
            matchDetail.exFTHomeScore = 1;

            service.copyScore(fullTime, matchDetail, "abcde 'provider_name'", "SBO");
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(fullTime.homeValue).toEqual("1");
            expect(fullTime.awayValue).toEqual("2");
            expect(service.confirmDialogMessage.message).toEqual('abcde SBO');
        }));
    });

    it('copyAllScore - should copy score after confirm', () => {
        matchDetail.exHTAwayScore = 2;
        matchDetail.exHTHomeScore = 2;
        matchDetail.exFTAwayScore = 2;
        matchDetail.exFTHomeScore = 1;

        service.copyAllScore(halfTime, fullTime, matchDetail, "SBO");
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();

        expect(fullTime.homeValue).toEqual("1");
        expect(fullTime.awayValue).toEqual("2");
        expect(halfTime.homeValue).toEqual("2");
        expect(halfTime.awayValue).toEqual("2");
    });

    it('sumScore - return sum of scores', () => {
        halfTime.homeValue = "2";
        halfTime.awayValue = "1";
        fullTime.homeValue = "1";
        fullTime.awayValue = "2";
        resultDetail.homeValue = "2";
        resultDetail.awayValue = "1";

        const result = service.sumScore([resultDetail, halfTime, fullTime], 3);

        expect(result.homeValue).toEqual("5");
        expect(result.awayValue).toEqual("4");
    });


    describe('compareHalfTimeScore', () => {
        it('return false when match half tim running', () => {
            matchDetail.htStatus = 'Running';
            match.matchDetail = matchDetail;

            const result = service.compareHalfTimeScore([resultDetail, halfTime], match, false, 1);

            expect(result).toBeFalsy();
        });

        it('return true when score halftime changed', () => {
            matchDetail.htStatus = 'Calculated';
            match.matchDetail = matchDetail;
            halfTime.homeValue = "2";
            halfTime.awayValue = "1";
            const resultLastest = _.cloneDeep(halfTime);
            resultLastest.homeValue = "1";
            match.resultDetails = [resultLastest];

            const result = service.compareHalfTimeScore([resultDetail, halfTime], match, false, 1);

            expect(result).toBeTruthy();
        });

        it('return true when match refund all', () => {
            matchDetail.htStatus = 'Calculated';
            match.matchDetail = matchDetail;
            halfTime.homeValue = "2";
            halfTime.awayValue = "1";
            const resultLastest = _.cloneDeep(halfTime);
            match.matchDetail.betStatus = 'Refund;'
            match.resultDetails = [resultLastest];

            const result = service.compareHalfTimeScore([resultDetail, halfTime], match, false, 1);

            expect(result).toBeTruthy();
        });

        it('return false when score half time  changed but match settle direct', () => {
            matchDetail.htStatus = 'Calculated';
            match.matchDetail = matchDetail;
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            const resultLastest = _.cloneDeep(resultDetail);
            resultLastest.homeValue = "1";
            match.matchDetail.betStatus = 'running'
            match.resultDetails = [resultLastest, halfTime];

            const result = service.compareHalfTimeScore([resultDetail, halfTime], match, true, 1);

            expect(result).toBeFalsy();
        });

        it('return true when score half time changed', () => {
            matchDetail.htStatus = 'Calculated';
            match.matchDetail = matchDetail;
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            const resultLastest = _.cloneDeep(resultDetail);
            resultLastest.homeValue = "1";
            match.matchDetail.betStatus = 'running'
            match.resultDetails = [resultLastest, halfTime];

            const result = service.compareHalfTimeScore([resultDetail, halfTime], match, false, 1);

            expect(result).toBeTruthy();
        });
    });

    describe('compareFullTimeScore', () => {
        it('return false when match not calculated', () => {
            matchDetail.ftStatus = 'Running';
            match.matchDetail = matchDetail;

            const result = service.compareFullTimeScore([resultDetail, halfTime], match, false);

            expect(result).toBeFalsy();
        });

        it('return true when score full time changed', () => {
            matchDetail.ftStatus = 'Calculated';
            match.matchDetail = matchDetail;
            fullTime.homeValue = "2";
            fullTime.awayValue = "1";
            const resultLastest = _.cloneDeep(fullTime);
            resultLastest.homeValue = "1";
            match.resultDetails = [resultLastest];

            const result = service.compareFullTimeScore([resultDetail, fullTime], match, false);

            expect(result).toBeTruthy();
        });

        it('return true when match refunded', () => {
            matchDetail.ftStatus = 'Calculated';
            match.matchDetail = matchDetail;
            fullTime.homeValue = "2";
            fullTime.awayValue = "1";
            const resultLastest = _.cloneDeep(fullTime);
            match.matchDetail.betStatus = 'Refund'
            match.resultDetails = [resultLastest];

            const result = service.compareFullTimeScore([resultDetail, fullTime], match, false);

            expect(result).toBeTruthy();
        });

        it('return false when score of set changed but match settle direct', () => {
            matchDetail.ftStatus = 'Calculated';
            match.matchDetail = matchDetail;
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            const resultLastest = _.cloneDeep(resultDetail);
            resultLastest.homeValue = "1";
            match.matchDetail.betStatus = 'running'
            match.resultDetails = [resultLastest, fullTime];

            const result = service.compareFullTimeScore([resultDetail, fullTime], match, true);

            expect(result).toBeFalsy();
        });

        it('return true when score of set changed', () => {
            matchDetail.ftStatus = 'Calculated';
            match.matchDetail = matchDetail;
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            const resultLastest = _.cloneDeep(resultDetail);
            resultLastest.homeValue = "1";
            match.matchDetail.betStatus = 'running'
            match.resultDetails = [resultLastest, fullTime];

            const result = service.compareFullTimeScore([resultDetail, fullTime], match, false);

            expect(result).toBeTruthy();
        });
    });


    describe('compareAllScore', () => {
        it('return false when match not calculated', () => {
            matchDetail.ftStatus = 'Running';
            matchDetail.htStatus = 'Running';
            match.matchDetail = matchDetail;

            const result = service.compareAllScore([resultDetail, halfTime], match, false);

            expect(result).toBeFalsy();
        });

        it('return true when score full time changed', () => {
            matchDetail.ftStatus = 'Calculated';
            match.matchDetail = matchDetail;
            fullTime.homeValue = "2";
            fullTime.awayValue = "1";
            const resultLastest = _.cloneDeep(fullTime);
            resultLastest.homeValue = "1";
            match.resultDetails = [resultLastest];

            const result = service.compareAllScore([resultDetail, fullTime], match, false);

            expect(result).toBeTruthy();
        });

        it('return true when score half time changed', () => {
            matchDetail.ftStatus = 'Calculated';
            match.matchDetail = matchDetail;
            halfTime.homeValue = "2";
            halfTime.awayValue = "1";
            const resultLastest = _.cloneDeep(halfTime);
            resultLastest.homeValue = "1";
            match.resultDetails = [resultLastest, fullTime];

            const result = service.compareAllScore([resultDetail, halfTime, fullTime], match, false);

            expect(result).toBeTruthy();
        });

        it('return true when match refunded', () => {
            matchDetail.ftStatus = 'Calculated';
            match.matchDetail = matchDetail;
            fullTime.homeValue = "2";
            fullTime.awayValue = "1";
            const resultLastest = _.cloneDeep(fullTime);
            match.matchDetail.betStatus = 'Refund'
            match.resultDetails = [resultLastest];

            const result = service.compareAllScore([resultDetail, fullTime], match, false);

            expect(result).toBeTruthy();
        });

        it('return false when score of set changed but match settle direct', () => {
            matchDetail.ftStatus = 'Calculated';
            match.matchDetail = matchDetail;
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            const resultLastest = _.cloneDeep(resultDetail);
            resultLastest.homeValue = "1";
            match.matchDetail.betStatus = 'running'
            match.resultDetails = [resultLastest, fullTime];

            const result = service.compareAllScore([resultDetail, fullTime], match, true);

            expect(result).toBeFalsy();
        });

        it('return true when score of set changed', () => {
            matchDetail.ftStatus = 'Calculated';
            match.matchDetail = matchDetail;
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            const resultLastest = _.cloneDeep(resultDetail);
            resultLastest.homeValue = "1";
            match.matchDetail.betStatus = 'running'
            match.resultDetails = [resultLastest, fullTime];

            const result = service.compareAllScore([resultDetail, fullTime], match, false);

            expect(result).toBeTruthy();
        });
    });

    describe('halfTimeConfirmed', () => {
        beforeAll(() => {
            matchDetail.confirmHT = 1;
            halfTime.awayValue = "1";
            halfTime.homeValue = "2";
        });
        it('return false when match calculated', () => {
            matchDetail.isHalfTimeCal = true;

            const result = service.halfTimeConfirmed(matchDetail, halfTime);

            expect(result).toBeFalsy();
        });

        it('return false when match refunded', () => {

            matchDetail.isHalfTimeCal = false;
            matchDetail.isCalRefund = true;

            const result = service.halfTimeConfirmed(matchDetail, halfTime);

            expect(result).toBeFalsy();
        });

        it('return true when match not settled and result confirmed', () => {
            matchDetail.isHalfTimeCal = false;
            matchDetail.isCalRefund = false;

            const result = service.halfTimeConfirmed(matchDetail, halfTime);

            expect(result).toBeTruthy();
        });
    });

    describe('fullTimeConfirmed', () => {
        beforeAll(() => {
            matchDetail.confirmFT = 1;
            fullTime.awayValue = "1";
            fullTime.homeValue = "2";
        });
        it('return false when match calculated', () => {
            matchDetail.isCalculated = true;

            const result = service.fullTimeConfirmed(matchDetail, fullTime);

            expect(result).toBeFalsy();
        });

        it('return false when match refunded', () => {

            matchDetail.isCalculated = false;
            matchDetail.isCalRefund = true;

            const result = service.fullTimeConfirmed(matchDetail, fullTime);

            expect(result).toBeFalsy();
        });

        it('return true when match not settled and result confirmed', () => {
            matchDetail.isCalculated = false;
            matchDetail.isCalRefund = false;

            const result = service.fullTimeConfirmed(matchDetail, fullTime);

            expect(result).toBeTruthy();
        });
    });

    describe('isScoreConfirmed', () => {
        it('return false when result not confirmed', () => {
            matchDetail.confirmFT = 0;

            const result = service.isScoreConfirmed(matchDetail, fullTime);

            expect(result).toBeFalsy();
        });

        it('return true when result confirmed', () => {
            matchDetail.confirmFT = 1;
            fullTime.awayValue = "1";
            fullTime.homeValue = "2";

            const result = service.isScoreConfirmed(matchDetail, fullTime);

            expect(result).toBeTruthy();
        });
    });

    describe('isExistProviderScore', () => {
        it('return true when half time confirmed and call for half time', () => {
            matchDetail.exHTAwayScore = 1;
            matchDetail.exHTHomeScore = 2;
            matchDetail.exFTAwayScore = null;

            const result = service.isExistProviderScore(matchDetail, true);

            expect(result).toBeTruthy();
        });

        it('return true when full time confirmed and call for FT', () => {
            matchDetail.exHTAwayScore = null;
            matchDetail.exHTHomeScore = 2;
            matchDetail.exFTAwayScore = 2;
            matchDetail.exFTHomeScore = 2;

            const result = service.isExistProviderScore(matchDetail, false);

            expect(result).toBeTruthy();
        });
    });

    describe('isScoreMismatchHalfTime', () => {
        const traderHalfTime = _.cloneDeep(halfTime)
        it('should return false when no source exist', () => {
            halfTime.homeValue = null;
            matchDetail.exHTAwayScore = null;

            service.isScoreMismatchHalfTime(halfTime, matchDetail, traderHalfTime);

            expect(halfTime.isScoreMismatched).toBeFalsy();
        });

        it('should return true when input score and trader score inconsistent', () => {
            matchDetail.confirmHT = 1;
            halfTime.homeValue = "1";
            halfTime.awayValue = "0";
            traderHalfTime.awayValue = "1";
            traderHalfTime.homeValue = "0";

            service.isScoreMismatchHalfTime(halfTime, matchDetail, traderHalfTime);

            expect(halfTime.isScoreMismatched).toBeTruthy();
        });

        it('should return true when trader and provider score inconsistent', () => {
            matchDetail.confirmHT = 1;
            traderHalfTime.awayValue = "1";
            traderHalfTime.homeValue = "0";
            matchDetail.exHTHomeScore = 1;
            matchDetail.exHTAwayScore = 1;
            halfTime.awayValue = null;

            service.isScoreMismatchHalfTime(halfTime, matchDetail, traderHalfTime);

            expect(halfTime.isScoreMismatched).toBeTruthy();
        });


        it('should return true when input score provider score inconsistent', () => {
            matchDetail.confirmHT = 0;
            halfTime.homeValue = "1";
            halfTime.awayValue = "0";
            matchDetail.exHTHomeScore = 1;
            matchDetail.exHTAwayScore = 1;

            service.isScoreMismatchHalfTime(halfTime, matchDetail, traderHalfTime);

            expect(halfTime.isScoreMismatched).toBeTruthy();
        });

        it('should return false when score consistent', () => {
            matchDetail.confirmHT = 0;
            halfTime.homeValue = "1";
            halfTime.awayValue = "1";
            matchDetail.exHTHomeScore = 1;
            matchDetail.exHTAwayScore = 1;

            service.isScoreMismatchHalfTime(halfTime, matchDetail, traderHalfTime);

            expect(halfTime.isScoreMismatched).toBeFalsy();
        });
    });

    describe('isScoreMismatchFullTime', () => {
        const traderFullTime = _.cloneDeep(fullTime)
        it('should return false when no source exist', () => {
            fullTime.homeValue = null;
            matchDetail.exFTHomeScore = null;

            service.isScoreMismatchFullTime(fullTime, matchDetail, traderFullTime);

            expect(fullTime.isScoreMismatched).toBeFalsy();
        });

        it('should return true when input score and trader score inconsistent', () => {
            matchDetail.confirmFT = 1;
            fullTime.homeValue = "1";
            fullTime.awayValue = "0";
            traderFullTime.awayValue = "1";
            traderFullTime.homeValue = "0";

            service.isScoreMismatchFullTime(fullTime, matchDetail, traderFullTime);

            expect(fullTime.isScoreMismatched).toBeTruthy();
        });

        it('should return true when trader and provider score inconsistent', () => {
            matchDetail.confirmFT = 1;
            traderFullTime.awayValue = "1";
            traderFullTime.homeValue = "0";
            matchDetail.exFTHomeScore = 1;
            matchDetail.exFTAwayScore = 1;
            halfTime.awayValue = null;

            service.isScoreMismatchFullTime(fullTime, matchDetail, traderFullTime);

            expect(fullTime.isScoreMismatched).toBeTruthy();
        });


        it('should return true when input score provider score inconsistent', () => {
            matchDetail.confirmFT = 0;
            halfTime.homeValue = "1";
            halfTime.awayValue = "0";
            matchDetail.exFTHomeScore = 1;
            matchDetail.exFTAwayScore = 1;

            service.isScoreMismatchFullTime(fullTime, matchDetail, traderFullTime);

            expect(fullTime.isScoreMismatched).toBeTruthy();
        });

        it('should return false when score consistent', () => {
            matchDetail.confirmFT = 0;
            fullTime.homeValue = "1";
            fullTime.awayValue = "1";
            matchDetail.exHTHomeScore = 1;
            matchDetail.exHTAwayScore = 1;

            service.isScoreMismatchFullTime(fullTime, matchDetail, traderFullTime);

            expect(fullTime.isScoreMismatched).toBeFalsy();
        });
    });

    it('getMessageConfirmRefund - return correct message', () => {
        const messageFT = service.getMessageConfirmRefund("REFUND-FT");
        const messageAll = service.getMessageConfirmRefund("REFUND");

        expect(messageFT).toEqual(Language.RefundFullMessage);
        expect(messageAll).toEqual(Language.RefundConfirmMessage);
    });

    it('getFirstConfirmMessage -  - return correct message', () => {
        const messageHT = service.getFirstConfirmMessage("CAL-HT");
        const messageFT = service.getFirstConfirmMessage("CAL-FT");
        const messageALL = service.getFirstConfirmMessage("CAL");

        expect(messageHT).toEqual(Language.doubleCheckCalculateHalfTime);
        expect(messageFT).toEqual(Language.doubleCheckCalculateFullTime);
        expect(messageALL).toEqual(Language.doubleCheckCalculateAll);
    });

    it('getSecondConfirmMessage -  - return correct message', () => {
        const messageHT = service.getSecondConfirmMessage("CAL-HT");
        const messageFT = service.getSecondConfirmMessage("CAL-FT");
        const messageALL = service.getSecondConfirmMessage("CAL");

        expect(messageHT).toEqual(Language.checkAgainCalculateHalfTime);
        expect(messageFT).toEqual(Language.checkAgainCalculateFullTime);
        expect(messageALL).toEqual(Language.checkAgainCalculateAll);
    });

    describe('autoFillOnload', () => {
        beforeAll(() => {
            resultDetail.homeValue = "1";
            resultDetail.awayValue = "1";
            halfTime.homeValue = "5";
            halfTime.awayValue = "5";
            fullTime.homeValue = "10";
            fullTime.awayValue = "10";
        });

        it('not set score when HT & FT have score', () => {
            service.autoFillOnload([resultDetail, resultDetail], matchDetail, halfTime, fullTime, 1);

            expect(halfTime.homeValue).toEqual("5");
            expect(halfTime.awayValue).toEqual("5");
            expect(fullTime.homeValue).toEqual("10");
            expect(fullTime.awayValue).toEqual("10");
        });

        it('not set score when match refunded', () => {
            matchDetail.betStatus = 'Refund;';
            halfTime.homeValue = "";
            halfTime.awayValue = "";
            fullTime.homeValue = "";
            fullTime.awayValue = "";
            service.autoFillOnload([resultDetail, resultDetail], matchDetail, halfTime, fullTime, 1);

            expect(halfTime.homeValue).toEqual("");
            expect(halfTime.awayValue).toEqual("");
            expect(fullTime.homeValue).toEqual("");
            expect(fullTime.awayValue).toEqual("");
        });

        it('set score when match no refund and result empty', () => {
            matchDetail.betStatus = 'Running';
            halfTime.homeValue = "";
            halfTime.awayValue = "";
            fullTime.homeValue = "";
            fullTime.awayValue = "";
            service.autoFillOnload([resultDetail, resultDetail], matchDetail, halfTime, fullTime, 1);

            expect(halfTime.homeValue).toEqual("1");
            expect(halfTime.awayValue).toEqual("1");
            expect(fullTime.homeValue).toEqual("2");
            expect(fullTime.awayValue).toEqual("2");
        });
    });
});