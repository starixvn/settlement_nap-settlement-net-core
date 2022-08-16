import { HttpClient, HttpClientModule, HttpHandler } from "@angular/common/http";
import { fakeAsync, inject, TestBed, tick } from "@angular/core/testing";
import { RequestService } from "../../services/request.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop/result-detail.model";
import { BlockUIService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { HalfTimeFullTimeService } from "./halftime-fulltime.service";
import { VerificationService } from "./verification.service";
import { ResourcesIds } from "../../constants";
import * as _ from 'lodash';
import { of } from "rxjs";
import { Match } from "../../models/match.model";
import { MatchDetail } from "../../models";

describe('VerificationService', () => {
    let service: VerificationService = null;
    let requestService: RequestService;
    let httpRequestService: HttpRequestService;
    let halfTimeFullTimeService: HalfTimeFullTimeService;
    const resultDetail = new ResultDetail();
    const halfTime = new ResultDetail();
    halfTime.resourceId = ResourcesIds.halfTime;
    const fullTime = new ResultDetail();
    fullTime.resourceId = ResourcesIds.fullTime;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                VerificationService,
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
            ],
        });

        service = TestBed.inject(VerificationService);
        halfTimeFullTimeService = TestBed.inject(HalfTimeFullTimeService);
        requestService = TestBed.inject(RequestService);
        httpRequestService = TestBed.inject(HttpRequestService);
    });

    beforeEach(inject([VerificationService], (Service: VerificationService) => {
        service = Service;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('isScoreFTInconsistent - isScoreHTInconsistent', () => {
        it('should return true when result not equal sum of scores', () => {
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            fullTime.homeValue = "1";
            fullTime.awayValue = "1";
            halfTime.homeValue = "2";
            halfTime.awayValue = "2";
            const result = service.isScoreFTInconsistent('-', halfTime, fullTime, resultDetail, false);
            const resultSecond = service.isScoreFTInconsistent('-', halfTime, fullTime, resultDetail, false);

            expect(result).toBeTruthy();
            expect(resultSecond).toBeTruthy();
        });
        it('should return false when bet status not include - ', () => {
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            fullTime.homeValue = "2";
            fullTime.awayValue = "1";
            halfTime.homeValue = "2";
            halfTime.awayValue = "1";

            const result = service.isScoreFTInconsistent('refund', halfTime, fullTime, resultDetail, false);
            const resultSecond = service.isScoreFTInconsistent('refund', halfTime, fullTime, resultDetail, false);

            expect(result).toBeFalsy();
            expect(resultSecond).toBeFalsy();
        });

        it('should return false when match select input direct ', () => {
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            fullTime.homeValue = "2";
            fullTime.awayValue = "1";
            halfTime.homeValue = "2";
            halfTime.awayValue = "1";

            const result = service.isScoreFTInconsistent('-', halfTime, fullTime, resultDetail, true);
            const resultSecond = service.isScoreFTInconsistent('-', halfTime, fullTime, resultDetail, true);

            expect(result).toBeFalsy();
            expect(resultSecond).toBeFalsy();
        });

        it('should return false when score half time greater than score fulltime', () => {
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            const resultDetailSecond = _.cloneDeep(resultDetail);
            resultDetailSecond.awayValue = "2";
            fullTime.homeValue = "2";
            fullTime.awayValue = "1";
            halfTime.homeValue = "2";
            halfTime.awayValue = "2";

            const result = service.isScoreFTInconsistent('-', halfTime, fullTime, resultDetail, false);
            const resultSecond = service.isScoreFTInconsistent('-', halfTime, fullTime, resultDetailSecond, true);

            expect(result).toBeTruthy();
            expect(resultSecond).toBeTruthy();
        });

        it('should return false when fulltime score equal sum of score and halftime not exist', () => {
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";
            fullTime.homeValue = "2";
            fullTime.awayValue = "1";

            const result = service.isScoreFTInconsistent('-', null, fullTime, resultDetail, false);

            expect(result).toBeFalsy();
        });
    });

    describe('verifyHalfTimeScore', () => {
        it('should return false when match selected direct and halftime exist score', () => {
            halfTime.homeValue = "1";
            halfTime.awayValue = "1";

            const result = service.verifyHalfTimeScore(halfTime, [resultDetail], true, 1);

            expect(result).toBeFalsy();
        });

        it('should return false when all halftime result exist score', () => {
            const result = service.verifyHalfTimeScore(halfTime, [resultDetail, resultDetail], false, 1);

            expect(result).toBeFalsy();
        });

        it('should return true when exist result empty', () => {
            const resultDetailSecond = _.cloneDeep(resultDetail);
            resultDetailSecond.homeValue = "";
            const result = service.verifyHalfTimeScore(halfTime, [resultDetailSecond, resultDetail], false, 1);

            expect(result).toBeTruthy();
        });
    });

    describe('verifyAllScore', () => {
        it('should return false when match selected direct and fulltime exist score', () => {
            halfTime.homeValue = "1";
            halfTime.awayValue = "1";
            fullTime.homeValue = "1";
            fullTime.awayValue = "1";

            const result = service.verifyAllScore(halfTime, fullTime, [resultDetail], true, false);

            expect(result).toBeFalsy();
        });

        it('should return true when match selected direct, halftime empty and is calc all', () => {
            halfTime.homeValue = "1";
            halfTime.awayValue = "";
            fullTime.homeValue = "1";
            fullTime.awayValue = "1";

            const result = service.verifyAllScore(halfTime, fullTime, [resultDetail], true, true);

            expect(result).toBeTruthy();
        });

        it('should return false when all result exist score', () => {
            const result = service.verifyAllScore(halfTime, fullTime, [resultDetail, resultDetail], false, true);

            expect(result).toBeFalsy();
        });

        it('should return true when exist result empty', () => {
            const resultDetailSecond = _.cloneDeep(resultDetail);
            resultDetailSecond.homeValue = "";
            const result = service.verifyAllScore(halfTime, fullTime, [resultDetailSecond, resultDetail], false, true);

            expect(result).toBeTruthy();
        });
    });

    describe('VerifyChangedSettledTickets', () => {
        it('should call function check score half time  when action is half time calc', () => {
            spyOn(requestService, 'getLastestResult').and.returnValue(of(new Match()));
            spyOn(halfTimeFullTimeService, 'compareHalfTimeScore').and.returnValue(true);
            let actualResult = false;

            service.VerifyChangedSettledTickets(1, [resultDetail], false, "CAL-HT", 1).subscribe((result) => {
                actualResult = result;
            });


            expect(halfTimeFullTimeService.compareHalfTimeScore).toHaveBeenCalled();
            expect(actualResult).toBeTruthy();
        });

        it('should call function check score half time  when action is Full time calc', () => {
            spyOn(requestService, 'getLastestResult').and.returnValue(of(new Match()));
            spyOn(halfTimeFullTimeService, 'compareFullTimeScore').and.returnValue(true);
            let actualResult = false;

            service.VerifyChangedSettledTickets(1, [resultDetail], false, "CAL-FT", 1).subscribe((result) => {
                actualResult = result;
            });


            expect(halfTimeFullTimeService.compareFullTimeScore).toHaveBeenCalled();
            expect(actualResult).toBeTruthy();
        });

        it('should call function check score half time  when action is all calc', () => {
            spyOn(requestService, 'getLastestResult').and.returnValue(of(new Match()));
            spyOn(halfTimeFullTimeService, 'compareAllScore').and.returnValue(true);
            let actualResult = false;

            service.VerifyChangedSettledTickets(1, [resultDetail], false, "CAL", 1).subscribe((result) => {
                actualResult = result;
            });


            expect(halfTimeFullTimeService.compareAllScore).toHaveBeenCalled();
            expect(actualResult).toBeTruthy();
        });
    });

    describe('isScoreMismatched', () => {
        it('should not call half time function when half time null', () => {
            const matchDetail = new MatchDetail();
            spyOn(halfTimeFullTimeService, 'isScoreMismatchHalfTime');
            spyOn(halfTimeFullTimeService, 'isScoreMismatchFullTime');
            service.isScoreMismatched(null, fullTime, matchDetail, resultDetail, resultDetail);

            expect(halfTimeFullTimeService.isScoreMismatchHalfTime).not.toHaveBeenCalled();
            expect(halfTimeFullTimeService.isScoreMismatchFullTime).toHaveBeenCalled();
        });

        it('should call half time function when half time exist ', () => {
            const matchDetail = new MatchDetail();
            spyOn(halfTimeFullTimeService, 'isScoreMismatchHalfTime');
            spyOn(halfTimeFullTimeService, 'isScoreMismatchFullTime');
            service.isScoreMismatched(halfTime, fullTime, matchDetail, resultDetail, resultDetail);

            expect(halfTimeFullTimeService.isScoreMismatchHalfTime).toHaveBeenCalled();
            expect(halfTimeFullTimeService.isScoreMismatchFullTime).toHaveBeenCalled();
        });
    });

    describe('isSourceSufficient', () => {
        it('should return true when exist provider result ', () => {
            spyOn(halfTimeFullTimeService, 'isExistProviderScore').and.returnValue(true);

            const result = service.isSourceSufficient("CAL-HT", new MatchDetail(),halfTime, fullTime);
            const resultFullTime = service.isSourceSufficient("CAL-FT", new MatchDetail(),halfTime, fullTime);

            expect(result).toBeTruthy();
            expect(resultFullTime).toBeTruthy();
        });
        it('should return true when exist confirmed result', () => {
            spyOn(halfTimeFullTimeService, 'isExistProviderScore').and.returnValue(false);
            spyOn(halfTimeFullTimeService, 'isScoreConfirmed').and.returnValue(true);

            const result = service.isSourceSufficient("CAL-HT", new MatchDetail(),halfTime, fullTime);
            const resultFullTime = service.isSourceSufficient("CAL-FT", new MatchDetail(),halfTime, fullTime);

            expect(result).toBeTruthy();
            expect(resultFullTime).toBeTruthy();
        });

        it('should return false when not exist external result ', () => {
            spyOn(halfTimeFullTimeService, 'isExistProviderScore').and.returnValue(false);
            spyOn(halfTimeFullTimeService, 'isScoreConfirmed').and.returnValue(false);

            const result = service.isSourceSufficient("CAL-HT", new MatchDetail(),halfTime, fullTime);
            const resultFullTime = service.isSourceSufficient("CAL-FT", new MatchDetail(),halfTime, fullTime);

            expect(result).toBeFalsy();
            expect(resultFullTime).toBeFalsy();
        });
    });

    describe('isConsistent', () => {
        it('should return halftime status when action is calc halftime', () => {
            fullTime.isScoreMismatched = false;
            halfTime.isScoreMismatched = true;
            const result = service.isConsistent("CAL-HT", halfTime, true, fullTime);

            expect(result).toBeTruthy();
        });

        it('should return fullTime status when action is calc fullTime ', () => {
            fullTime.isScoreMismatched = false;
            halfTime.isScoreMismatched = true;

            const result = service.isConsistent("CAL-FT", halfTime, true, fullTime);

            expect(result).toBeFalsy();
        });

        it('should return fullTime and halfTTime status when action is calc all', () => {
            fullTime.isScoreMismatched = true;
            halfTime.isScoreMismatched = true;

            const result = service.isConsistent("CAL", halfTime, true, fullTime);

            expect(result).toBeTruthy();
        });
    });
});