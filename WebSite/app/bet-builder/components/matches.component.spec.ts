import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    MatchesComponent,
    MatchDetailComponent,
    CalculationComponent,
} from '.';
import { LeagueSettingService, MatchSettingService, RefreshMatchService, PopupService, RequestService } from '../services';
import {
    HttpRequestService,
    BlockUIService,
    MessageBoxService,
    DialogBoxService,
} from '../../shared/services';
import {
    ModalDialogComponent,
    MultipleSelectComponent,
    TreeViewComponent,
    ModalContentDialogComponent,
    MaterialDialogComponent,
} from "../../shared/components";
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import { MatchDetail, AutoSetting, Permission } from '../models';
import { ResultStatusPipe, SelectionPipe, TicketStatusPipe } from '../pipes';
import { MatchStatus } from '../../shared/constants';
import { Resources } from '../constants';
import { MaterialModule } from '../../shared/material-module';
import { MultiSports, SportLeagues, LeagueMatches, MatchWaitingRequest } from '../models';

describe('Bet Builder - Matches Component', () => {
    let component: MatchesComponent;
    let fixture: ComponentFixture<MatchesComponent>;
    let match: MatchDetail;
    let matchSettingService: MatchSettingService;
    let messageBoxService: MessageBoxService;
    let leagueSettingService: LeagueSettingService;
    const request = {} as MatchWaitingRequest;
    const mockLeague = new LeagueMatches();
    const mockSport: SportLeagues = {
        id: 1,
        name: 'mock sport',
        collapse: false,
        leagues: [mockLeague]

    };
    const permission = new Permission();
    const mockMultiSport: MultiSports = {
        request,
        permission,
        sportLeagues: [mockSport]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                MatchesComponent,
                ModalDialogComponent,
                MatchDetailComponent,
                CalculationComponent,
                ScoreBySettlementPipe,
                MultipleSelectComponent,
                ResultStatusPipe,
                TicketStatusPipe,
                SelectionPipe,
                TreeViewComponent,
                ModalContentDialogComponent,
                MaterialDialogComponent
            ],
            providers: [
                NgbModal,
                LeagueSettingService,
                MatchSettingService,
                RefreshMatchService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
                PopupService,
                RequestService,
                DialogBoxService,
            ],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule
            ],
        }).compileComponents()
            .then(() => {
                match = new MatchDetail();
                match.matchId = 1;
                match.matchCode = "Match Code";
                const autoCalcSetting = new AutoSetting();
                autoCalcSetting.isAutoSettingForLeague = false;
                autoCalcSetting.isAutoSettingForMatch = true;
                match.autoCalcSetting = autoCalcSetting;

                fixture = TestBed.createComponent(MatchesComponent);
                component = fixture.componentInstance;

                matchSettingService = fixture.debugElement.injector.get(MatchSettingService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                leagueSettingService = fixture.debugElement.injector.get(LeagueSettingService);
            });
    }));

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    describe('isProcessingMatch', () => {
        it('should return True when the parlayStatus is waiting or calculating', () => {
            const result = component.isProcessingMatch("Waiting");
            expect(result).toBe(true);
        });
    });

    describe('getColorParlayStatus', () => {
        it('should return class name is waiting if the parlayStatus is waiting', () => {
            const result = component.getColorParlayStatus("Waiting");
            expect(result).toBe("event-status waiting");
        });

        it('should return class name is calculating if the parlayStatus is calculating', () => {
            const result = component.getColorParlayStatus("Calculating");
            expect(result).toBe("event-status calculating");
        });

        it('should return empty class name if the parlayStatus is not waiting and calculating', () => {
            const result = component.getColorParlayStatus("Running");
            expect(result).toBe("event-status ");
        });
    });

    describe('getBackground', () => {
        it('should return calculated background if the parlayStatus is completed', () => {
            const parlayStatus = MatchStatus.Completed;
            const result = component.getBackground(parlayStatus, "");
            expect(result).toBe("calculated");
        });

        it('should return running background if the parlayStatus is running and eventStatus is completed', () => {
            const parlayStatus = MatchStatus.Running;
            const eventStatus = MatchStatus.Completed;
            const result = component.getBackground(parlayStatus, eventStatus);
            expect(result).toBe("bg-auto-settle-running");
        });

        it('should return no background if the parlayStatus is not completed and running', () => {
            const parlayStatus = MatchStatus.Refund;
            const eventStatus = MatchStatus.Completed;
            const result = component.getBackground(parlayStatus, eventStatus);
            expect(result).toBe("");
        });
    });

    describe('getAutoSettingTooltip', () => {
        it('should return OFF setting if isAuto is true', () => {
            const result = component.getAutoSettingTooltip(true);
            expect(result).toBe(Resources.turnOffAutoSetting);
        });

        it('should return ON setting if isAuto is false', () => {
            const result = component.getAutoSettingTooltip(false);
            expect(result).toBe(Resources.turnOnAutoSetting);
        });
    });

    describe('getClassNameViewLog', () => {
        it('should hyperlink class when has permission view log', () => {
            component.multiSports = mockMultiSport;
            component.multiSports.permission.canViewSettlementLog = true;
            const result = component.getClassNameViewLog();
            expect(result).toBe("code-link");
        });

        it('should not link class when has not permission view log', () => {
            component.multiSports = mockMultiSport;
            component.multiSports.permission.canViewSettlementLog = false;
            const result = component.getClassNameViewLog();
            expect(result).toBe("no-link");
        });
    });

    describe('updateMatchSetting function', () => {
        it('should call updateMatchSetting, show right confirm message for setting match', (() => {
            match.isShowLink = true;
            spyOn(messageBoxService, 'confirm').and.returnValue(Promise.resolve(true));

            component.updateMatchSetting(match);
            const message = component.modalDialogMessage.message;

            expect(message).toContain(Resources.confirmUpdateAutoSettingMatch);
        }));

        it('should call updateMatchSetting, open Confirm dialog & call updateMatch from matchSettingService '
            + 'when Yes button is clicked ', (done) => {
                component.multiSports = mockMultiSport;
                match.isShowLink = true;
                spyOn(matchSettingService, 'updateMatch').and.callThrough();
                const spy = spyOn(messageBoxService, 'confirm').and.returnValue(Promise.resolve(true));

                component.updateMatchSetting(match);
                expect(messageBoxService.confirm).toHaveBeenCalled();

                spy.calls.mostRecent().returnValue.then(() => {
                    fixture.detectChanges();
                    const confirmationTitle = document.getElementsByClassName('modal-title');
                    expect(confirmationTitle.length).toBe(0);
                    done();
                });
            });
    });

    describe('updateLeagueSetting function', () => {
        beforeEach(() => {
            component.multiSports = mockMultiSport;
        });
        it('should call updateLeagueSetting, has implemented NO action on Confirm dialog', () => {
            spyOn(leagueSettingService, 'getConfirmMessage').and.returnValue("");

            component.updateLeagueSetting(mockLeague);

            expect(component.modalDialogMessage.hasActionOnNoBtn).toBe(true);
        });

        it('should call updateLeagueSetting, open Confirm dialog & call updateLeague from leagueSettingService '
            + 'when Yes button is clicked ', (done) => {
                spyOn(leagueSettingService, 'updateLeague').and.callThrough();
                const spy = spyOn(messageBoxService, 'confirm').and.returnValue(Promise.resolve(true));
                component.updateLeagueSetting(mockLeague);
                expect(messageBoxService.confirm).toHaveBeenCalled();
                const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
                buttonYes.click();

                spy.calls.mostRecent().returnValue.then(() => {
                    fixture.detectChanges();
                    const confirmationTitle = document.getElementsByClassName('modal-title');
                    expect(confirmationTitle.length).toBe(0);
                    done();
                });
            });
    });

    it('isExistedSport should return true when sportLeagues is exist', () => {
        component.multiSports = mockMultiSport;

        const expected = component.isExistedSport;
        expect(expected).toEqual(true);
    });
});