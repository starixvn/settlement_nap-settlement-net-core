import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { FullTimeVerificationService } from './fulltime-verification.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../../shared/services';
import { Match, MatchDetail} from '../../models';
import { ModalDialogMessage } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { of } from 'rxjs';
import { RequestService } from '../..//services/request.service';

describe('FullTimeVerificationService', () => {
    let service: FullTimeVerificationService = null;
    let httpRequestService: HttpRequestService;
    let messageBoxService: MessageBoxService;
    let fullTimeRequestService: RequestService;
    const warningMessage = new ModalDialogMessage();
    warningMessage.title = Language.CalculationWarning;

    const matchDetail = {} as MatchDetail;
    matchDetail.sportType = 60;
    matchDetail.matchId = 123;
    matchDetail.sportName = 'test';
    matchDetail.matchCode = 'abc';

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
            providers: [
                FullTimeVerificationService,
                BlockUIService,
                MessageBoxService,
                RequestService,
                HttpRequestService,
                HttpClient,
                HttpHandler,
            ],
            imports: [
                HttpClientModule,
            ],
        });

        service = TestBed.inject(FullTimeVerificationService);
        httpRequestService = TestBed.inject(HttpRequestService);
        messageBoxService = TestBed.inject(MessageBoxService);
        fullTimeRequestService = TestBed.inject(RequestService);
    });

    beforeEach(inject([FullTimeVerificationService], (verificationService: FullTimeVerificationService) => {
        service = verificationService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('checkScoreMuayThai', () => {
        it('should return empty string when sport is not muay thai - 44', () => {
            matchDetail.sportType = 60;

            const result = service.checkScoreMuayThai(matchDetail);

            expect(result).toEqual('');
        });
        it('should return correct message when muay thai score is invalid', () => {
            matchDetail.sportType = 44;
            matchDetail.finalAwayScore = 2;
            matchDetail.finalHomeScore = 1;

            const result = service.checkScoreMuayThai(matchDetail);

            expect(result).toEqual('Please input the correct Final Score.');
        });

        it('should return correct message when muay thai ko in round is invalid', () => {
            matchDetail.sportType = 44;
            matchDetail.finalAwayScore = 0;
            matchDetail.finalHomeScore = 1;
            matchDetail.betStatus = '';

            const result = service.checkScoreMuayThai(matchDetail);

            expect(result).toEqual("Please input the correct 'KO at Round'");
        });
    });

    describe('verifyCopyScore', () => {
        it('should show alert when match fulltime settled', () => {
            matchDetail.isFullTimeSettled = true;
            warningMessage.message = Language.scoreSettledWarning;

            const result = service.verifyCopyScore(matchDetail);

            expect(result).toEqual(Language.scoreSettledWarning);
        });

        it('should show alert when external score is empty', () => {
            matchDetail.isFullTimeSettled = false;
            matchDetail.exFTAwayScore = null;

            const result = service.verifyCopyScore(matchDetail);

            expect(result).toEqual(Language.missingScoreWarning);
        });

        it('should return true when score valid and match not fulltime settled', () => {
            matchDetail.isFullTimeSettled = false;
            matchDetail.exFTAwayScore = 1;
            matchDetail.exFTHomeScore = 2;

            const result = service.verifyCopyScore(matchDetail);

            expect(result).toEqual("");
        });
    });

    describe('verifyChangedSettledTickets', () => {
        const match = new Match();
        const lastMatchDetail = new MatchDetail();
        lastMatchDetail.ftStatus = 'Complete';
        lastMatchDetail.finalHomeScore = 4;
        lastMatchDetail.finalAwayScore = 5;
        matchDetail.finalHomeScore = 4;
        matchDetail.finalAwayScore = 3;
        match.matchDetail = lastMatchDetail;

        it('should return false when no need to check for recalc tickets', fakeAsync(() => {
            let actualResult: boolean;
            spyOn(fullTimeRequestService, 'getLastestResult').and.returnValue(of(match));

            service.verifyChangedSettledTickets(matchDetail, { matchId: 123 }).subscribe((result) => {
                actualResult = result;
            });

            expect(actualResult).toBe(false);
        }));

        it('should return true when need to check for recalc tickets', fakeAsync(() => {
            lastMatchDetail.ftStatus = 'Calculated';
            match.matchDetail = lastMatchDetail;
            let actualResult: boolean;
            spyOn(httpRequestService, 'postJson').and.returnValue(of(match));

            service.verifyChangedSettledTickets(matchDetail, { matchId: 123 }).subscribe((result) => {
                actualResult = result;
            });

            expect(actualResult).toBe(true);
        }));
    });

    it('isScoreSourceInsufficient - should return true when missing score source', () => {
        matchDetail.exFTHomeScore = null;
        matchDetail.confirmFT = 0;

        const result = service.isScoreSourceInsufficient(matchDetail);

        expect(result).toBe(true);
    });

    describe('isScoreInconsistent', () => {
        it('should return false when no source exist', () => {
            matchDetail.finalHomeScore = null;
            matchDetail.finalAwayScore = null;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(false);
        });

        it('should return true when input score and trader score inconsistent', () => {
            matchDetail.confirmFT = 1;
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.originalFinalAwayScore = 1;
            matchDetail.originalFinalHomeScore = 0;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(true);
        });

        it('should return true when input score and provider score inconsistent', () => {
            matchDetail.originalFinalHomeScore = 1;
            matchDetail.originalFinalAwayScore = 0;
            matchDetail.exFTHomeScore = 0;
            matchDetail.exFTAwayScore = 1;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(true);
        });

        it('should return true when trader score and provider score inconsistent', () => {
            matchDetail.finalHomeScore = null;
            matchDetail.finalAwayScore = null;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(true);
        });

        it('should return false when all score are consistent', () => {
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.exFTHomeScore = 1;
            matchDetail.exFTAwayScore = 0;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(false);
        });
    });
});