import { HttpClient, HttpClientModule, HttpHandler } from "@angular/common/http";
import { inject, TestBed } from "@angular/core/testing";
import { Match } from "../../models";
import { MatchDetail } from "../../models/match-detail.model";
import { RequestService } from "../../services/request.service";
import { of } from "rxjs";
import { BlockUIService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { VerificationService } from "./verification.service";

describe('VerificationService', () => {
    let service: VerificationService = null;
    let requestService: RequestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                VerificationService,
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

        service = TestBed.inject(VerificationService);
        requestService = TestBed.inject(RequestService);
    });

    beforeEach(inject([VerificationService], (verificationService: VerificationService) => {
        service = verificationService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('isScoreInconsistent', () => {
        it('should return false when score consistent', () => {
            const matchDetail = {
                halfTimeHomeScore: 1,
                halfTimeAwayScore: 2,
                finalHomeScore: 3,
                finalAwayScore: 4
            } as MatchDetail;

            expect(service.isScoreInconsistent(matchDetail)).toBe(false);
        });

        it('should return false when score is empty', () => {
            const matchDetail = {} as MatchDetail;

            expect(service.isScoreInconsistent(matchDetail)).toBe(false);
        });

        it('should return true when score inconsistent', () => {
            const matchDetail = {
                halfTimeHomeScore: 5,
                halfTimeAwayScore: 6,
                finalHomeScore: 3,
                finalAwayScore: 4
            } as MatchDetail;

            expect(service.isScoreInconsistent(matchDetail)).toBe(true);
        });
    });

    describe('isHaltTimeScoreMismatched', () => {
        it('should return false when score matched', () => {
            const matchDetail = {
                confirmHT: 1,
                halfTimeHomeScore: 1,
                halfTimeAwayScore: 2,
                originalHalfTimeHomeScore: 1,
                originalHalfTimeAwayScore: 2,
                exHTHomeScore: 1,
                exHTAwayScore: 2
            } as MatchDetail;

            expect(service.isHaltTimeScoreMismatched(matchDetail)).toBe(false);
        });

        it('should return false 2 out of 3 score types not exist', () => {
            let matchDetail = {
                exHTHomeScore: 1,
                exHTAwayScore: 2
            } as MatchDetail;

            expect(service.isHaltTimeScoreMismatched(matchDetail)).toBe(false);

            matchDetail = {
                halfTimeHomeScore: 1,
                halfTimeAwayScore: 2,
            } as MatchDetail;

            expect(service.isHaltTimeScoreMismatched(matchDetail)).toBe(false);

            matchDetail = {
                confirmHT: 1,
                originalHalfTimeHomeScore: 1,
                originalHalfTimeAwayScore: 2,
            } as MatchDetail;

            expect(service.isHaltTimeScoreMismatched(matchDetail)).toBe(false);
        });

        it('should return true when input score and trader score mismatched', () => {
            const matchDetail = {
                confirmHT: 1,
                halfTimeHomeScore: 1,
                halfTimeAwayScore: 2,
                originalHalfTimeHomeScore: 2,
                originalHalfTimeAwayScore: 2,
            } as MatchDetail;

            expect(service.isHaltTimeScoreMismatched(matchDetail)).toBe(true);
        });

        it('should return true when input score and provider score mismatched', () => {
            const matchDetail = {
                halfTimeHomeScore: 1,
                halfTimeAwayScore: 2,
                exHTHomeScore: 2,
                exHTAwayScore: 2
            } as MatchDetail;

            expect(service.isHaltTimeScoreMismatched(matchDetail)).toBe(true);
        });

        it('should return true when trader score and provider score mismatched', () => {
            const matchDetail = {
                confirmHT: 1,
                exHTHomeScore: 1,
                exHTAwayScore: 1,
                originalHalfTimeHomeScore: 2,
                originalHalfTimeAwayScore: 2,
            } as MatchDetail;

            expect(service.isHaltTimeScoreMismatched(matchDetail)).toBe(true);
        });
    });

    describe('isFinalScoreMismatched', () => {
        it('should return false when score matched', () => {
            const matchDetail = {
                confirmFT: 1,
                finalHomeScore: 1,
                finalAwayScore: 2,
                originalFinalHomeScore: 1,
                originalFinalAwayScore: 2,
                exFTHomeScore: 1,
                exFTAwayScore: 2
            } as MatchDetail;

            expect(service.isFinalScoreMismatched(matchDetail)).toBe(false);
        });

        it('should return false when 2 out of 3 score types not exist', () => {
            let matchDetail = {
                exFTHomeScore: 1,
                exFTAwayScore: 2
            } as MatchDetail;

            expect(service.isFinalScoreMismatched(matchDetail)).toBe(false);

            matchDetail = {
                finalHomeScore: 1,
                finalAwayScore: 2,
            } as MatchDetail;

            expect(service.isFinalScoreMismatched(matchDetail)).toBe(false);

            matchDetail = {
                confirmFT: 1,
                originalFinalHomeScore: 1,
                originalFinalAwayScore: 2,
            } as MatchDetail;

            expect(service.isFinalScoreMismatched(matchDetail)).toBe(false);
        });

        it('should return true when input score and trader score mismatched', () => {
            const matchDetail = {
                confirmFT: 1,
                finalHomeScore: 1,
                finalAwayScore: 2,
                originalFinalHomeScore: 2,
                originalFinalAwayScore: 2,
            } as MatchDetail;

            expect(service.isFinalScoreMismatched(matchDetail)).toBe(true);
        });

        it('should return true when input score and provider score mismatched', () => {
            const matchDetail = {
                finalHomeScore: 1,
                finalAwayScore: 2,
                exFTHomeScore: 2,
                exFTAwayScore: 2
            } as MatchDetail;

            expect(service.isFinalScoreMismatched(matchDetail)).toBe(true);
        });

        it('should return true when trader score and provider score mismatched', () => {
            const matchDetail = {
                confirmFT: 1,
                exFTHomeScore: 1,
                exFTAwayScore: 1,
                originalFinalHomeScore: 2,
                originalFinalAwayScore: 2,
            } as MatchDetail;

            expect(service.isFinalScoreMismatched(matchDetail)).toBe(true);
        });
    });

    describe('isScoreInvalid', () => {
        it('should return true when half time score is invalid', () => {
            const matchDetail = {
                finalHomeScore: 3,
                finalAwayScore: 4,
                halfTimeHomeScore: 1,
            } as MatchDetail;

            expect(service.isScoreInvalid(matchDetail)).toBe(true);
        });

        it('should return true when final score is invalid', () => {
            const matchDetail = {
                finalHomeScore: 3,
                halfTimeHomeScore: 1,
                halfTimeAwayScore: 2,
            } as MatchDetail;

            expect(service.isScoreInvalid(matchDetail)).toBe(true);
        });

        it('should return false when scores are valid', () => {
            const matchDetail = {
                finalHomeScore: 3,
                finalAwayScore: 4,
                halfTimeHomeScore: 1,
                halfTimeAwayScore: 2,
            } as MatchDetail;

            expect(service.isScoreInvalid(matchDetail)).toBe(false);
        });
    });

    describe('isScoreSourceInsufficient', () => {
        describe('action is calculate half time', () => {
            it('should return true when missing ht external scores', () => {
                const matchDetail = {} as MatchDetail;

                expect(service.isScoreSourceInsufficient("CAL-HT", matchDetail)).toBe(true);
            });

            it('should return false when there is ht trader score', () => {
                const matchDetail = {
                    confirmHT: 1,
                    originalHalfTimeHomeScore: 2,
                    originalHalfTimeAwayScore: 3
                } as MatchDetail;

                expect(service.isScoreSourceInsufficient("CAL-HT", matchDetail)).toBe(false);
            });

            it('should return false when there is ht provider score', () => {
                const matchDetail = {
                    exHTHomeScore: 2,
                    exHTAwayScore: 3
                } as MatchDetail;

                expect(service.isScoreSourceInsufficient("CAL-HT", matchDetail)).toBe(false);
            });
        });

        describe('action is calculate full time', () => {
            it('should return true when missing final external scores', () => {
                const matchDetail = {} as MatchDetail;

                expect(service.isScoreSourceInsufficient("CAL-FT", matchDetail)).toBe(true);
            });

            it('should return false when there is final trader score', () => {
                const matchDetail = {
                    confirmFT: 1,
                    originalFinalHomeScore: 2,
                    originalFinalAwayScore: 3
                } as MatchDetail;

                expect(service.isScoreSourceInsufficient("CAL-FT", matchDetail)).toBe(false);
            });

            it('should return false when there is final provider score', () => {
                const matchDetail = {
                    exFTHomeScore: 2,
                    exFTAwayScore: 3
                } as MatchDetail;

                expect(service.isScoreSourceInsufficient("CAL-FT", matchDetail)).toBe(false);
            });
        });

        describe('action is calculate all', () => {
            it('should return true when missing final external scores', () => {
                const matchDetail = {} as MatchDetail;

                expect(service.isScoreSourceInsufficient("CAL", matchDetail)).toBe(true);
            });

            it('should return false when there is final trader score', () => {
                const matchDetail = {
                    confirmFT: 1,
                    originalFinalHomeScore: 2,
                    originalFinalAwayScore: 3,
                    confirmHT: 1,
                    originalHalfTimeHomeScore: 2,
                    originalHalfTimeAwayScore: 3
                } as MatchDetail;

                expect(service.isScoreSourceInsufficient("CAL", matchDetail)).toBe(false);
            });

            it('should return false when there is final provider score', () => {
                const matchDetail = {
                    exFTHomeScore: 2,
                    exFTAwayScore: 3,
                    exHTHomeScore: 2,
                    exHTAwayScore: 3,
                } as MatchDetail;

                expect(service.isScoreSourceInsufficient("CAL", matchDetail)).toBe(false);
            });
        });
    });

    describe('verifyChangedSettledTickets', () => {
        const match = new Match();
        const lastestMatchDetail = {
            ftStatus: 'Running',
            finalHomeScore: 4,
            finalAwayScore: 5,
            htStatus: 'Running',
            halfTimeHomeScore: 2,
            halfTimeAwayScore: 3
        } as MatchDetail;
        match.matchDetail = lastestMatchDetail;

        const matchDetail = {
            finalHomeScore: 4,
            finalAwayScore: 3
        } as MatchDetail;

        it('should return false when no need to check for recalc tickets on calculating FT', () => {
            spyOn(requestService, 'getLastestResult').and.returnValue(of(match));

            service.verifyChangedSettledTickets(matchDetail, "CAL-FT").subscribe((result) => {
                expect(result).toBe(false);
            });
        });

        it('should return true when need to check for recalc tickets on calculating FT', () => {
            lastestMatchDetail.ftStatus = 'Calculated';
            match.matchDetail = lastestMatchDetail;
            spyOn(requestService, 'getLastestResult').and.returnValue(of(match));

            service.verifyChangedSettledTickets(matchDetail, "CAL-FT").subscribe((result) => {
                expect(result).toBe(true);
            });
        });

        it('should return true when need to check for recalc FT tickets on calculating all', () => {
            lastestMatchDetail.ftStatus = 'Calculated';
            match.matchDetail = lastestMatchDetail;
            spyOn(requestService, 'getLastestResult').and.returnValue(of(match));

            service.verifyChangedSettledTickets(matchDetail, "CAL").subscribe((result) => {
                expect(result).toBe(true);
            });
        });

        it('should return false when no need to check for recalc tickets on calculating HT', () => {
            spyOn(requestService, 'getLastestResult').and.returnValue(of(match));

            service.verifyChangedSettledTickets(matchDetail, "CAL-HT").subscribe((result) => {
                expect(result).toBe(false);
            });
        });

        it('should return true when need to check for recalc tickets on calculating HT', () => {
            lastestMatchDetail.htStatus = 'Calculated';
            match.matchDetail = lastestMatchDetail;
            spyOn(requestService, 'getLastestResult').and.returnValue(of(match));

            service.verifyChangedSettledTickets(matchDetail, "CAL-HT").subscribe((result) => {
                expect(result).toBe(true);
            });
        });

        it('should return true when need to check for recalc HT tickets on calculating all', () => {
            lastestMatchDetail.ftStatus = 'Running';
            lastestMatchDetail.htStatus = 'Calculated';
            match.matchDetail = lastestMatchDetail;
            spyOn(requestService, 'getLastestResult').and.returnValue(of(match));

            service.verifyChangedSettledTickets(matchDetail, "CAL").subscribe((result) => {
                expect(result).toBe(true);
            });
        });
    });
});