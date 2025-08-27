import { TestBed, inject, fakeAsync } from '@angular/core/testing';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { FullTimeVerificationService } from './fulltime-verification.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../../shared/services';
import { Match, MatchDetail} from '../../models';
import { ModalDialogMessage } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { of } from 'rxjs';
import { RequestService } from '../..//services/request.service';
import { MappedScoreService } from './mapped-score.service';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';

describe('FullTimeVerificationService', () => {
    let service: FullTimeVerificationService = null;
    let httpRequestService: HttpRequestService;
    let fullTimeRequestService: RequestService;
    let mappedScoreService: MappedScoreService;
    const warningMessage = new ModalDialogMessage();
    warningMessage.title = Language.CalculationWarning;

    const matchDetail = {} as MatchDetail;
    matchDetail.sportType = 44;
    matchDetail.matchId = 123;
    matchDetail.sportName = 'test';
    matchDetail.matchCode = 'abc';

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                FullTimeVerificationService,
                BlockUIService,
                MessageBoxService,
                RequestService,
                HttpRequestService,
                MappedScoreService,
                HttpClient,
                HttpHandler,
            ],
            imports: [
                HttpClientModule,
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
        });

        service = TestBed.inject(FullTimeVerificationService);
        httpRequestService = TestBed.inject(HttpRequestService);
        fullTimeRequestService = TestBed.inject(RequestService);
        mappedScoreService = TestBed.inject(MappedScoreService);
    });

    beforeEach(inject([FullTimeVerificationService], (verificationService: FullTimeVerificationService) => {
        service = verificationService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('checkScoreMuayThai', () => {
        it('should return empty string when sport is not muay thai', () => {
            matchDetail.sportType = 1; // Not Muay Thai

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

        it('should return false when no need to check for recalc tickets', fakeAsync(async () => {
            jest.spyOn(fullTimeRequestService, 'getLastestResult').mockReturnValue(of(match));

            const actualResult = await service.verifyChangedSettledTickets(matchDetail, { matchId: 123 });

            expect(actualResult).toBe(false);
        }));

        it('should return true when need to check for recalc tickets', fakeAsync(async () => {
            lastMatchDetail.ftStatus = 'Calculated';
            match.matchDetail = lastMatchDetail;
            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(match));

            const actualResult = await service.verifyChangedSettledTickets(matchDetail, { matchId: 123 });

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
            matchDetail.exFTHomeScore = null;
            matchDetail.exFTAwayScore = null;
            matchDetail.confirmFT = 0;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(false);
        });

        it('should return true when input score and trader score inconsistent', () => {
            matchDetail.confirmFT = 1;
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.originalFinalAwayScore = 1;
            matchDetail.originalFinalHomeScore = 0;
            matchDetail.exFTHomeScore = null; // No provider score
            matchDetail.exFTAwayScore = null;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(true);
        });

        it('should return false when input score and trader score consistent', () => {
            matchDetail.confirmFT = 1;
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.originalFinalAwayScore = 0;
            matchDetail.originalFinalHomeScore = 1;
            matchDetail.exFTHomeScore = null; // No provider score
            matchDetail.exFTAwayScore = null;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(false); // Should be false because input and trader are consistent
        });

        it('should return true when input score and provider score inconsistent', () => {
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.exFTHomeScore = 0;
            matchDetail.exFTAwayScore = 1;
            matchDetail.confirmFT = 0; // No trader score
            matchDetail.betStatus = 'normal';

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(true);
        });

        it('should return true when trader score and provider score inconsistent', () => {
            matchDetail.finalHomeScore = null;
            matchDetail.finalAwayScore = null;
            matchDetail.confirmFT = 1;
            matchDetail.originalFinalHomeScore = 1;
            matchDetail.originalFinalAwayScore = 0;
            matchDetail.exFTHomeScore = 0;
            matchDetail.exFTAwayScore = 1;
            matchDetail.betStatus = 'normal';

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(true);
        });

        it('should return false when all score are consistent', () => {
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.exFTHomeScore = 1;
            matchDetail.exFTAwayScore = 0;
            matchDetail.confirmFT = 0; // No trader score to compare
            matchDetail.betStatus = 'normal';
            matchDetail.sportType = 1; // Not Muay Thai

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(false);
        });

        it('should return false when all three scores are consistent', () => {
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.exFTHomeScore = 1;
            matchDetail.exFTAwayScore = 0;
            matchDetail.confirmFT = 1;
            matchDetail.originalFinalHomeScore = 1;
            matchDetail.originalFinalAwayScore = 0;
            matchDetail.betStatus = 'normal';
            matchDetail.sportType = 1; // Not Muay Thai

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(false);
        });

        it('should return false when only input score exists', () => {
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.exFTHomeScore = null;
            matchDetail.exFTAwayScore = null;
            matchDetail.confirmFT = 0;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(false);
        });

        it('should return false when only trader score exists', () => {
            matchDetail.finalHomeScore = null;
            matchDetail.finalAwayScore = null;
            matchDetail.exFTHomeScore = null;
            matchDetail.exFTAwayScore = null;
            matchDetail.confirmFT = 1;
            matchDetail.originalFinalHomeScore = 1;
            matchDetail.originalFinalAwayScore = 0;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(false);
        });

        it('should return false when only provider score exists', () => {
            matchDetail.finalHomeScore = null;
            matchDetail.finalAwayScore = null;
            matchDetail.exFTHomeScore = 1;
            matchDetail.exFTAwayScore = 0;
            matchDetail.confirmFT = 0;

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(false);
        });

        it('should return true when trader and provider scores are inconsistent', () => {
            matchDetail.finalHomeScore = null;
            matchDetail.finalAwayScore = null;
            matchDetail.exFTHomeScore = 1;
            matchDetail.exFTAwayScore = 0;
            matchDetail.confirmFT = 1;
            matchDetail.originalFinalHomeScore = 0;
            matchDetail.originalFinalAwayScore = 1;
            matchDetail.betStatus = 'normal';

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(true);
        });

        it('should handle Muay Thai score mapping correctly', () => {
            matchDetail.sportType = 44; // Muay Thai
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.exFTHomeScore = 3; // Provider score
            matchDetail.exFTAwayScore = 0;
            matchDetail.betStatus = '3';
            matchDetail.confirmFT = 0; // No trader score
            
            jest.spyOn(mappedScoreService, 'getMappedScore').mockReturnValue({
                home: 1,
                away: 0,
                round: '3'
            });

            const result = service.isScoreInconsistent(matchDetail);

            expect(mappedScoreService.getMappedScore).toHaveBeenCalledWith(3, 0);
            expect(result).toBe(false);
        });

        it('should detect inconsistency with Muay Thai mapped score', () => {
            matchDetail.sportType = 44; // Muay Thai
            matchDetail.finalHomeScore = 1;
            matchDetail.finalAwayScore = 0;
            matchDetail.exFTHomeScore = 3; // Provider score
            matchDetail.exFTAwayScore = 0;
            matchDetail.betStatus = '2'; // Different round
            
            jest.spyOn(mappedScoreService, 'getMappedScore').mockReturnValue({
                home: 1,
                away: 0,
                round: '3'
            });

            const result = service.isScoreInconsistent(matchDetail);

            expect(result).toBe(true);
        });
    });

    describe('private methods', () => {
                describe('isInputScoreInconsistent', () => {
            it('should return true when input score inconsistent with trader score', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = 0;
                matchDetail.originalFinalHomeScore = 0;
                matchDetail.originalFinalAwayScore = 1;
                matchDetail.confirmFT = 1;

                const result = service['isInputScoreInconsistent'](matchDetail, true, false);

                expect(result).toBe(true);
            });

            it('should return true when input score inconsistent with provider score', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = 0;
                matchDetail.exFTHomeScore = 0;
                matchDetail.exFTAwayScore = 1;
                matchDetail.sportType = 1; // Not Muay Thai
                matchDetail.betStatus = 'normal';

                const result = service['isInputScoreInconsistent'](matchDetail, false, true);

                expect(result).toBe(true);
            });

            it('should return false when all scores are consistent', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = 0;
                matchDetail.exFTHomeScore = 1;
                matchDetail.exFTAwayScore = 0;
                matchDetail.sportType = 1; // Not Muay Thai
                matchDetail.betStatus = 'normal';

                const result = service['isInputScoreInconsistent'](matchDetail, false, true);

                expect(result).toBe(false);
            });
        });

        describe('isInputTraderScoreInconsistent', () => {
            it('should return true when input score differs from trader score', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = 0;
                matchDetail.originalFinalHomeScore = 0;
                matchDetail.originalFinalAwayScore = 1;

                const result = service['isInputTraderScoreInconsistent'](matchDetail);

                expect(result).toBe(true);
            });

            it('should return false when input score matches trader score', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = 0;
                matchDetail.originalFinalHomeScore = 1;
                matchDetail.originalFinalAwayScore = 0;

                const result = service['isInputTraderScoreInconsistent'](matchDetail);

                expect(result).toBe(false);
            });
        });

        describe('isInputProviderScoreInconsistent', () => {
            it('should return true when input score differs from provider score (non-Muay Thai)', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = 0;
                matchDetail.exFTHomeScore = 0;
                matchDetail.exFTAwayScore = 1;
                matchDetail.betStatus = 'normal';
                matchDetail.sportType = 1; // Not Muay Thai

                const result = service['isInputProviderScoreInconsistent'](matchDetail);

                expect(result).toBe(true);
            });

            it('should return true when bet status differs for Muay Thai', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = 0;
                matchDetail.exFTHomeScore = 3;
                matchDetail.exFTAwayScore = 0;
                matchDetail.betStatus = '2';
                matchDetail.sportType = 44; // Muay Thai

                jest.spyOn(mappedScoreService, 'getMappedScore').mockReturnValue({
                    home: 1,
                    away: 0,
                    round: '3'
                });

                const result = service['isInputProviderScoreInconsistent'](matchDetail);

                expect(result).toBe(true);
            });

            it('should return false when all scores and bet status match for Muay Thai', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = 0;
                matchDetail.exFTHomeScore = 3;
                matchDetail.exFTAwayScore = 0;
                matchDetail.betStatus = '3';
                matchDetail.sportType = 44; // Muay Thai

                jest.spyOn(mappedScoreService, 'getMappedScore').mockReturnValue({
                    home: 1,
                    away: 0,
                    round: '3'
                });

                const result = service['isInputProviderScoreInconsistent'](matchDetail);

                expect(result).toBe(false);
            });
        });

        describe('isTraderProviderScoreInconsistent', () => {
            it('should return true when trader score differs from provider score (non-Muay Thai)', () => {
                matchDetail.originalFinalHomeScore = 1;
                matchDetail.originalFinalAwayScore = 0;
                matchDetail.exFTHomeScore = 0;
                matchDetail.exFTAwayScore = 1;
                matchDetail.betStatus = 'normal';
                matchDetail.sportType = 1; // Not Muay Thai

                const result = service['isTraderProviderScoreInconsistent'](matchDetail);

                expect(result).toBe(true);
            });

            it('should return true when bet status differs for Muay Thai', () => {
                matchDetail.originalFinalHomeScore = 1;
                matchDetail.originalFinalAwayScore = 0;
                matchDetail.exFTHomeScore = 3;
                matchDetail.exFTAwayScore = 0;
                matchDetail.betStatus = '2';
                matchDetail.sportType = 44; // Muay Thai

                jest.spyOn(mappedScoreService, 'getMappedScore').mockReturnValue({
                    home: 1,
                    away: 0,
                    round: '3'
                });

                const result = service['isTraderProviderScoreInconsistent'](matchDetail);

                expect(result).toBe(true);
            });

            it('should return false when all scores and bet status match for Muay Thai', () => {
                matchDetail.originalFinalHomeScore = 1;
                matchDetail.originalFinalAwayScore = 0;
                matchDetail.exFTHomeScore = 3;
                matchDetail.exFTAwayScore = 0;
                matchDetail.betStatus = '3';
                matchDetail.sportType = 44; // Muay Thai

                jest.spyOn(mappedScoreService, 'getMappedScore').mockReturnValue({
                    home: 1,
                    away: 0,
                    round: '3'
                });

                const result = service['isTraderProviderScoreInconsistent'](matchDetail);

                expect(result).toBe(false);
            });
        });

        describe('getMappedScores', () => {
            it('should return original scores for non-Muay Thai sports', () => {
                matchDetail.exFTHomeScore = 2;
                matchDetail.exFTAwayScore = 1;
                matchDetail.betStatus = 'normal';
                matchDetail.sportType = 1; // Not Muay Thai

                const result = service['getMappedScores'](matchDetail);

                expect(result).toEqual({
                    home: 2,
                    away: 1,
                    round: 'normal'
                });
            });

            it('should return mapped scores for Muay Thai', () => {
                matchDetail.exFTHomeScore = 3;
                matchDetail.exFTAwayScore = 0;
                matchDetail.betStatus = 'original';
                matchDetail.sportType = 44; // Muay Thai

                jest.spyOn(mappedScoreService, 'getMappedScore').mockReturnValue({
                    home: 1,
                    away: 0,
                    round: '3'
                });

                const result = service['getMappedScores'](matchDetail);

                expect(mappedScoreService.getMappedScore).toHaveBeenCalledWith(3, 0);
                expect(result).toEqual({
                    home: 1,
                    away: 0,
                    round: '3'
                });
            });
        });
    });

    describe('additional test cases', () => {
        describe('isFinalScoreConfirmed', () => {
            it('should return true when confirmFT > 0 and original scores exist', () => {
                matchDetail.confirmFT = 1;
                matchDetail.originalFinalHomeScore = 1;
                matchDetail.originalFinalAwayScore = 0;

                const result = service.isFinalScoreConfirmed(matchDetail);

                expect(result).toBe(true);
            });

            it('should return false when confirmFT = 0', () => {
                matchDetail.confirmFT = 0;
                matchDetail.originalFinalHomeScore = 1;
                matchDetail.originalFinalAwayScore = 0;

                const result = service.isFinalScoreConfirmed(matchDetail);

                expect(result).toBe(false);
            });

            it('should return false when original scores are null', () => {
                matchDetail.confirmFT = 1;
                matchDetail.originalFinalHomeScore = null;
                matchDetail.originalFinalAwayScore = null;

                const result = service.isFinalScoreConfirmed(matchDetail);

                expect(result).toBe(false);
            });
        });

        describe('isExistInputScore', () => {
            it('should return true when both scores exist', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = 0;

                const result = service.isExistInputScore(matchDetail);

                expect(result).toBe(true);
            });

            it('should return false when home score is null', () => {
                matchDetail.finalHomeScore = null;
                matchDetail.finalAwayScore = 0;

                const result = service.isExistInputScore(matchDetail);

                expect(result).toBe(false);
            });

            it('should return false when away score is null', () => {
                matchDetail.finalHomeScore = 1;
                matchDetail.finalAwayScore = null;

                const result = service.isExistInputScore(matchDetail);

                expect(result).toBe(false);
            });
        });

        describe('isExistProviderScore', () => {
            it('should return true when both provider scores exist', () => {
                matchDetail.exFTHomeScore = 1;
                matchDetail.exFTAwayScore = 0;

                const result = service.isExistProviderScore(matchDetail);

                expect(result).toBe(true);
            });

            it('should return false when home provider score is null', () => {
                matchDetail.exFTHomeScore = null;
                matchDetail.exFTAwayScore = 0;

                const result = service.isExistProviderScore(matchDetail);

                expect(result).toBe(false);
            });

            it('should return false when away provider score is null', () => {
                matchDetail.exFTHomeScore = 1;
                matchDetail.exFTAwayScore = null;

                const result = service.isExistProviderScore(matchDetail);

                expect(result).toBe(false);
            });
        });
    });
});