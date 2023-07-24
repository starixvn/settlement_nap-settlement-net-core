import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { MessageBoxService } from '../../shared/services';
import { VerificationService } from '.';
import { Match, TicketCount, HedgeMatchDetail } from '../models';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import * as _ from 'lodash';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ExternalResultDetail, MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';

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
        return item;
    }
}
describe('Basketball - Verify Service', () => {
    let service: VerificationService = null;
    let messageBoxService: MessageBoxService;
    const resultDetail = CreateDataTest.CreateResultDetail('Q1', '1', '', true);
    const externalResultDetail = new ExternalResultDetail(1, '1', '', '', '2', '1');


    const ticketCounts: TicketCount = {
        groupId: 0,
        groupName: null,
        betRunningCount: 0,
        betMarkedCount: 0,
        betSettledCount: 0,
    };

    const match = new Match(new MatchDetail());
    match.resultDetails = [resultDetail];
    match.hedgeMatchDetail = new HedgeMatchDetail();
    match.isScoreDirect = false;
    match.ticketCounts = ticketCounts;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ModalDialogComponent,
            ],
            providers: [
                VerificationService,
                MessageBoxService,
                IntervalBackgroundPipe,
                ResultByTeamNamePipe
            ],
            imports: [
                NgbModule,
            ]
        }).overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [ModalDialogComponent]
            },
        }).compileComponents();

        service = TestBed.inject(VerificationService);
        messageBoxService = TestBed.inject(MessageBoxService);
    });

    beforeEach(inject([VerificationService], (verifyService: VerificationService) => {
        service = verifyService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('verifyScore', () => {
        beforeAll(() => {
            const quarter1 = CreateDataTest.CreateResultDetail('Q1', '1', '', false);
            const quarter2 = CreateDataTest.CreateResultDetail('Q2', '', '1', false);
            const quarter3 = CreateDataTest.CreateResultDetail('Q3', '1', '', false);
            const quarter4 = CreateDataTest.CreateResultDetail('Q4', '', '0', true);
            match.resultDetails = [quarter1, quarter2, quarter3, quarter4];
            match.isScoreDirect = false;
        });

        it('should show right message confirm when halftime score is not consistent.', () => {
            const halfTime = CreateDataTest.CreateResultDetail('01', '0', '0', true);
            const expected = "The 'First Half' values do not consist with the results computed from individual sets: 0-0 vs 1-1. Do you want to update them to 1-1?";
            messageBoxService.confirm = jest.fn();

            service.verifyScore(halfTime, true, match.isScoreDirect, match.resultDetails);

            expect(messageBoxService.confirm).toHaveBeenCalled();
            expect(service.confirmationDialogMessage.message).toEqual(expected);
        });

        it('should show right message confirm when Full Time score is not consistent.', () => {
            const fullTime = CreateDataTest.CreateResultDetail('00', '0', '0', true);
            const expected = "The 'Full Time' values do not consist with the results computed from individual sets: 0-0 vs 2-1. Do you want to update them to 2-1?";
            messageBoxService.confirm = jest.fn();

            service.verifyScore(fullTime, false, match.isScoreDirect, match.resultDetails);

            expect(messageBoxService.confirm).toHaveBeenCalled();
            expect(service.confirmationDialogMessage.message).toEqual(expected);
        });

        it('should set value quarter when press yes on confirmbox.', fakeAsync(() => {
            const halfTime = CreateDataTest.CreateResultDetail('01', '0', '0', true);

            service.verifyScore(halfTime, true, match.isScoreDirect, match.resultDetails);
            tick();
            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(halfTime.homeValue).toEqual('1');
            expect(halfTime.awayValue).toEqual('1');
        }));

        it('should pass when input directly is checked.', () => {
            const fullTime = CreateDataTest.CreateResultDetail('00', '0', '0', true);
            match.isScoreDirect = true;
            messageBoxService.confirm = jest.fn();

            service.verifyScore(fullTime, false, match.isScoreDirect, match.resultDetails);

            expect(messageBoxService.confirm).not.toHaveBeenCalled();
        });

        it('should do nothing when full time has no score', () => {
            const fullTime = CreateDataTest.CreateResultDetail('00', '', '', true);
            match.isScoreDirect = false;
            messageBoxService.confirm = jest.fn();

            service.verifyScore(fullTime, false, match.isScoreDirect, match.resultDetails);

            expect(messageBoxService.confirm).not.toHaveBeenCalled();
        })
    });

    describe('isExistInhouseResult', () => {
        it('should return false when result has no inhouse result', () => {
            resultDetail.externalScores = [];

            const result = service.isExistInHouseResult(resultDetail);

            expect(result).toBe(false);
        });

        it('should return true when result has inhouse result', () => {
            resultDetail.externalScores = [externalResultDetail];
            externalResultDetail.homeValue = '1';
            resultDetail.resultStatusId = 5;

            const result = service.isExistInHouseResult(resultDetail);

            expect(result).toEqual(true);
        });

        it('should return false when result has trader result only', () => {
            resultDetail.externalScores = [externalResultDetail];
            externalResultDetail.sourceId = 100;
            externalResultDetail.homeValue = '1';
            externalResultDetail.fromResultDetail = true;
            resultDetail.resultStatusId = 0;

            const result = service.isExistInHouseResult(resultDetail);

            expect(result).toEqual(false);
        });
    });

    describe('isInputScoreInvalid', () => {
        it('should return false when maps have score', () => {
            resultDetail.resourceId = 'Q1';
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '2';

            const result = service.isInputScoreInvalid([resultDetail], false);

            expect(result).toBe(false);
        });
    });

    describe('isScoreConsecutive', () => {
        it('should return true when score is consecutive', () => {
            const map1 = new ResultDetail();
            map1.resourceId = 'Q1';
            const map2 = new ResultDetail();
            map2.resourceId = 'Q2';

            const result = service.isScoreConsecutive([map1, map2]);

            expect(result).toBe(true);
        });

        it('should return true when score is empty', () => {
            const result = service.isScoreConsecutive([]);

            expect(result).toBe(true);
        });

        it('should return false when only 1 score existed', () => {
            const result = service.isScoreConsecutive([resultDetail]);

            expect(result).toBe(false);
        });

        it('should return false when score is not consecutive', () => {
            const map1 = new ResultDetail();
            map1.resourceId = 'Q1';
            const map3 = new ResultDetail();
            map3.resourceId = 'Q3';

            const result = service.isScoreConsecutive([map1, map3]);

            expect(result).toBe(false);
        });
    });

    it('verifyIntervalsCalculated - should return true when interval not calculated', () => {
        const fullTime = CreateDataTest.CreateResultDetail('00', '', '', true);
        resultDetail.checked = false;
        resultDetail.settlementStatusId = 0;

        const result = service.verifyIntervalsCalculated(fullTime, match.resultDetails, false);

        expect(result).toBe(true);
    });

    test.each([
        [
            CreateDataTest.CreateResultDetail('01', '2', '1', true),
            CreateDataTest.CreateResultDetail('00', '1', '0', true),
            true,
            true,
        ],
        [
            CreateDataTest.CreateResultDetail('01', '2', '1', false),
            CreateDataTest.CreateResultDetail('00', '2', '0', false),
            true,
            true,
        ],
        [
            CreateDataTest.CreateResultDetail('01', '2', '1', false),
            CreateDataTest.CreateResultDetail('00', '2', '0', false),
            false,
            false,
        ],

        [
            CreateDataTest.CreateResultDetail('01', '2', '1', true),
            CreateDataTest.CreateResultDetail('00', '2', '0', false),
            false,
            true,
        ],
    ])('should return %s', (htResult: ResultDetail, ftResult: ResultDetail, onChangeScore: boolean, expected: boolean) => {
        const result = service.isFtScoreLowerThanHtScore(htResult, ftResult, onChangeScore);
        expect(result).toBe(expected);
    });

    it('isTicketOnQuarter - should return true when exist ticket on quarter', () => {
        resultDetail.resourceId = 'Q1';
        resultDetail.ticketStatus = 'Running';
        resultDetail.checked = true;

        const result = service.isTicketOnQuarter(match.resultDetails, match.resultDetails);

        expect(result).toBe(true);
    });

    it('isPinGoalMatch - should return true when leagueGroupId is PinGoal', () => {
        const result = service.isPinGoalMatch(122);

        expect(result).toBe(true);
    });

    describe('allMapHaveScoreSources', () => {
        it('should return true when all maps have score source', () => {
            const ot = CreateDataTest.CreateResultDetail('OT', '2', '1', true);
            const otProvider = new ExternalResultDetail(100, 'OT', '', '', '2', '1');
            const otOutside = new ExternalResultDetail(1005, 'OT', '', '', '2', '1');
            ot.externalScores = [otProvider, otOutside];
            const quarterProvider = new ExternalResultDetail(100, 'Q1', '', '', '1', '1');
            const quarterOutside = new ExternalResultDetail(1005, 'Q1', '', '', '1', '1');
            resultDetail.externalScores = [quarterProvider, quarterOutside];

            const result = service.allMapHaveScoreSources([resultDetail, ot]);

            expect(result).toBe(true);
        });

        it('should return false when not enough score source', () => {
            const ot = CreateDataTest.CreateResultDetail('OT', '2', '1', true);
            resultDetail.externalScores = [];

            const result = service.allMapHaveScoreSources([ot, resultDetail]);

            expect(result).toBe(false);
        });
    });

    describe('isHalfTimeMismatched', () => {
        it('should return true when half time score is mismatched', () => {
            const quarter1 = CreateDataTest.CreateResultDetail('Q1', '1', '2', true);
            const quarter2 = CreateDataTest.CreateResultDetail('Q2', '2', '1', true);
            const halfTime = CreateDataTest.CreateResultDetail('01', '4', '3', true);
            const quarters = [quarter1, quarter2];
            const quartersAndTotal = [quarter1, quarter2, halfTime];

            const result = service.isHalfTimeMismatched(quartersAndTotal, quarters, false);

            expect(result).toBe(true);
        });

        it('should return false when half time score is match', () => {
            const quarter1 = CreateDataTest.CreateResultDetail('Q1', '1', '2', true);
            const quarter2 = CreateDataTest.CreateResultDetail('Q2', '2', '1', true);
            const halfTime = CreateDataTest.CreateResultDetail('01', '3', '3', true);
            const quarters = [quarter1, quarter2];
            const quartersAndTotal = [quarter1, quarter2, halfTime];

            const result = service.isHalfTimeMismatched(quartersAndTotal, quarters, false);

            expect(result).toBe(false);
        });

        it('should return false when match is score direct', () => {
            const quarter1 = CreateDataTest.CreateResultDetail('Q1', '1', '2', true);
            const quarter2 = CreateDataTest.CreateResultDetail('Q2', '2', '1', true);
            const halfTime = CreateDataTest.CreateResultDetail('01', '4', '3', true);
            const quarters = [quarter1, quarter2];
            const quartersAndTotal = [quarter1, quarter2, halfTime];

            const result = service.isHalfTimeMismatched(quartersAndTotal, quarters, true);

            expect(result).toBe(false);
        });
    });

    describe('AutoSumHalfTimeAndFullTime', () => {
        it('sumScoreHalfTime - return correct when scores consecutive', () => {
            const map1 = CreateDataTest.CreateResultDetail('Q1', '1', '1', true);
            const map2 = CreateDataTest.CreateResultDetail('Q2', '2', '2', true);
            const halfTime = CreateDataTest.CreateResultDetail('01', '', '', true);


            service.sumScoreHalfTime([map1, map2], halfTime);

            expect(halfTime.homeValue).toEqual('3');
            expect(halfTime.awayValue).toEqual('3');
        });

        it('sumScoreHalfTime - return correct when scores not consecutive', () => {
            const map1 = CreateDataTest.CreateResultDetail('Q1', '1', '1', true);
            const map3 = CreateDataTest.CreateResultDetail('Q3', '2', '2', true);
            const halfTime = CreateDataTest.CreateResultDetail('01', '', '', true);


            service.sumScoreHalfTime([map1, map3], halfTime);

            expect(halfTime.homeValue).toEqual('');
            expect(halfTime.awayValue).toEqual('');
        });

        it('sumScoreFullTime - return correct when scores consecutive', () => {
            const map1 = CreateDataTest.CreateResultDetail('Q1', '1', '1', true);
            const map2 = CreateDataTest.CreateResultDetail('Q2', '2', '2', true);
            const map3 = CreateDataTest.CreateResultDetail('Q3', '2', '2', true);
            const map4 = CreateDataTest.CreateResultDetail('Q3', '1', '1', true);
            const fullTime = CreateDataTest.CreateResultDetail('00', '', '', true);


            service.sumScoreFullTime([map1, map2, map3, map4], fullTime);

            expect(fullTime.homeValue).toEqual('6');
            expect(fullTime.awayValue).toEqual('6');
        });

        it('sumScoreFullTime - return correct when scores not consecutive', () => {
            const map1 = CreateDataTest.CreateResultDetail('Q1', '1', '1', true);
            const map2 = CreateDataTest.CreateResultDetail('Q2', '2', '2', true);
            const map4 = CreateDataTest.CreateResultDetail('Q3', '1', '1', true);
            const fullTime = CreateDataTest.CreateResultDetail('00', '', '', true);


            service.sumScoreFullTime([map1, map2, map4], fullTime);

            expect(fullTime.homeValue).toEqual('');
            expect(fullTime.awayValue).toEqual('');
        });
    });
});
