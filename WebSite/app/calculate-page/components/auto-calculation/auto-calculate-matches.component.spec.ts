import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AutoCalculateMatchesComponent } from './auto-calculate-matches.component';
import { DialogBoxService, HttpRequestService, BlockUIService, MessageBoxService } from './../../../shared/services';
import { RequestService, HandleActionsService, BackGroundService, DetectChangesService, PopupService } from './../../services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material-module';
import { CalculationMatch, FilterAutoQuery, League } from '../../models';
import { BackgroundColor, CalculationStatus } from '../../../shared/constants';
import { Permission } from '../../../shared/models/sportsbook-sop/permission.model';
import { Language } from '../../../shared/language.native';
import { AutoSetting } from '../../../shared/models';
import { of } from 'rxjs';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { AutoSettingType } from '../../constants';

describe('MatchesComponent', () => {
    let component: AutoCalculateMatchesComponent;
    let fixture: ComponentFixture<AutoCalculateMatchesComponent>;
    let requestService: RequestService;
    let messageBoxService: MessageBoxService;
    let handleActionsService: HandleActionsService;
    let popupService: PopupService;
    const mockResultSuccess = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
    };

    const mockResultFailed = {
        errCode: 1,
        errMsg: "Error",
        isSuccessful: false,
    };

    const match = new CalculationMatch();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                BackGroundService,
                RequestService,
                PopupService,
                BlockUIService,
                DialogBoxService,
                HandleActionsService,
                HttpRequestService,
                MessageBoxService,
                DetectChangesService
            ],
            imports: [
                AutoCalculateMatchesComponent,
                ModalDialogComponent,
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AutoCalculateMatchesComponent);
        component = fixture.componentInstance;
        requestService = fixture.debugElement.injector.get(RequestService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        handleActionsService = fixture.debugElement.injector.get(HandleActionsService);
        popupService = fixture.debugElement.injector.get(PopupService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit - should refresh matches', fakeAsync(() => {
        requestService.refreshMatches = jest.fn();
        component.leagues = [new League()];
        component.filterQuery = new FilterAutoQuery();
        component.filterQuery.leagueId = '1';
        component.disableRefresh = false;

        component.ngOnInit();
        tick(6000);
        component.ngOnDestroy();

        expect(requestService.refreshMatches).toHaveBeenCalledWith('1', component.leagues, true);
    }));

    test.each([
        [true, false, BackgroundColor.iconOff],
        [true, true, BackgroundColor.iconOn],
        [false, false, BackgroundColor.iconOffDisabled],
        [false, true, BackgroundColor.iconOnDisabled]])('getClassInstant with permission:%p and input:%p', (hasPermission: boolean, input: boolean, expected: string) => {
            component.permission = new Permission();
            component.permission.canAutoPayout = hasPermission;

            const classResult = component.getClassInstant(input);

            expect(classResult).toEqual(expected);
        });

    test.each([
        [true, true, Language.instants.titleOffInstant],
        [true, false, Language.instants.titleOnInstant],
        [false, true, ""]])('getTittleInstant with permission:%p and input:%p', (hasPermission: boolean, input: boolean, expected: string) => {
            component.permission = new Permission();
            component.permission.canAutoPayout = hasPermission;

            const classResult = component.getTittleInstant(input);

            expect(classResult).toEqual(expected);
        });

    describe('updateInstant', () => {
        test.each([
            [true, CalculationStatus.waiting],
            [true, CalculationStatus.calculating],
            [false, CalculationStatus.success]])('Should not show confirm when match not pass validation', (permission: boolean, calculateStatus: number) => {
                component.permission = new Permission();
                component.permission.canAutoPayout = permission;
                match.isCalculatingSingle = calculateStatus;
                messageBoxService.confirm = jest.fn();

                component.updateInstant(match);

                expect(messageBoxService.confirm).not.toHaveBeenCalled();
            });

        it('should call update instant when match pass validation', fakeAsync(() => {
            component.permission = new Permission();
            component.permission.canAutoPayout = true;
            match.isCalculatingSingle = null;
            match.matchId = '123';
            match.autoCalcSetting = new AutoSetting();
            match.autoCalcSetting.isInstantForMatch = false;
            requestService.updateSettingMatch = jest.fn().mockResolvedValue(mockResultSuccess);

            component.updateInstant(match);
            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(match.autoCalcSetting.isInstantForMatch).toBeTruthy();
            expect(requestService.updateSettingMatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    matchId: 123,
                    autoType: AutoSettingType.instant,
                    isEnabled: true
                })
            );
        }));

        it('should alert when update failed', fakeAsync(() => {
            component.permission = new Permission();
            component.permission.canAutoPayout = true;
            match.isCalculatingSingle = null;
            match.matchId = '123';
            match.autoCalcSetting = new AutoSetting();
            match.autoCalcSetting.isInstantForMatch = false;
            requestService.updateSettingMatch = jest.fn().mockResolvedValue(mockResultFailed);
            messageBoxService.alert = jest.fn();

            component.updateInstant(match);
            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(match.autoCalcSetting.isInstantForMatch).toBeFalsy();
            expect(messageBoxService.alert).toHaveBeenCalled();
        }));
    });

    describe('updateInstantForLeague', () => {
        it('should apply status for all match when select confirm yes', fakeAsync(() => {
            const league = new League();
            league.leagueId = 123;
            const setting = new AutoSetting();
            setting.isInstantForLeague = false;
            requestService.updateSettingLeague = jest.fn().mockResolvedValue(mockResultSuccess);
            handleActionsService.handleAutoInstantForMatch = jest.fn();
            component.updateInstantForLeague(setting, league);

            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(setting.isInstantForLeague).toBeTruthy();
            expect(handleActionsService.handleAutoInstantForMatch).toHaveBeenCalledWith(league, true);
        }));

        it('should not apply status for all match when select confirm no', fakeAsync(() => {
            const league = new League();
            league.leagueId = 123;
            const setting = new AutoSetting();
            setting.isInstantForLeague = true;
            requestService.updateSettingLeague = jest.fn().mockResolvedValue(mockResultSuccess);
            handleActionsService.handleAutoInstantForMatch = jest.fn();
            component.updateInstantForLeague(setting, league);

            const buttonNo = document.getElementsByClassName('btn-default')[0] as HTMLElement;
            buttonNo.click();
            tick();

            expect(setting.isInstantForLeague).toBeFalsy();
            expect(handleActionsService.handleAutoInstantForMatch).not.toHaveBeenCalled();
        }));

        it('should alert when update failed', fakeAsync(() => {
            const league = new League();
            league.leagueId = 123;
            const setting = new AutoSetting();
            setting.isInstantForLeague = true;
            requestService.updateSettingLeague = jest.fn().mockResolvedValue(mockResultFailed);
            messageBoxService.alert = jest.fn();
            component.updateInstantForLeague(setting, league);

            const buttonNo = document.getElementsByClassName('btn-default')[0] as HTMLElement;
            buttonNo.click();
            tick();

            expect(setting.isInstantForLeague).toBeTruthy();
            expect(messageBoxService.alert).toHaveBeenCalled();
        }));
    });

    it('getLog- Always open popup', () => {
        component.filterQuery = new FilterAutoQuery();
        component.filterQuery.fromDate = "2020/10/10";
        component.filterQuery.toDate = "2020/10/11";
        popupService.popupLog = jest.fn();

        component.getLog('123');

        expect(popupService.popupLog).toHaveBeenCalledWith("123", "2020/10/10", "2020/10/11");
    });

    describe('openUpdatePayout', () => {
        test.each([
            [true, CalculationStatus.calculating],
            [true, CalculationStatus.waiting],
            [false, CalculationStatus.success]])('should not openPopup with permission:%p and calculateStatus:%p', (permission: boolean, calculateStatus: number) => {
                match.isCalculatingSingle = calculateStatus;
                component.permission = new Permission();
                component.permission.canAutoPayout = permission;
                popupService.openUpdatePayout = jest.fn();

                component.openUpdatePayout(match);

                expect(popupService.openUpdatePayout).not.toHaveBeenCalled();
            });

        it('should openPopup when pass validation', () => {
            match.isCalculatingSingle = null;
            component.permission = new Permission();
            component.permission.canAutoPayout = true;
            popupService.openUpdatePayout = jest.fn();

            component.openUpdatePayout(match);

            expect(popupService.openUpdatePayout).toHaveBeenCalledWith(match);
        });
    });

    describe('openUpdatePayoutForLeague', () => {
        it('should call open popup when has permission', () => {
            component.permission = new Permission();
            component.permission.canAutoPayout = true;
            popupService.openUpdatePayoutForLeague = jest.fn();
            const league = new League();

            component.openUpdatePayoutForLeague(league);

            expect(popupService.openUpdatePayoutForLeague).toHaveBeenCalledWith(league);
        });

        it('should not open popup when not has permission', () => {
            component.permission = new Permission();
            component.permission.canAutoPayout = false;
            popupService.openUpdatePayoutForLeague = jest.fn();
            const league = new League();

            component.openUpdatePayoutForLeague(league);

            expect(popupService.openUpdatePayoutForLeague).not.toHaveBeenCalled();
        });
    });

    describe('openUpdateTime', () => {
        it('should call open popup when has permission', () => {
            component.permission = new Permission();
            component.permission.canAutoPayout = true;
            popupService.openUpdateTime = jest.fn();
            const league = new League();

            component.openUpdateTime(league, true);

            expect(popupService.openUpdateTime).toHaveBeenCalledWith(league, true);
        });

        it('should not open popup when not has permission', () => {
            component.permission = new Permission();
            component.permission.canAutoPayout = false;
            popupService.openUpdateTime = jest.fn();
            const league = new League();

            component.openUpdateTime(league, true);

            expect(popupService.openUpdateTime).not.toHaveBeenCalled();
        });
    });

    test.each([
        [1, false, ""],
        [0, true, ""],
        [1, true, BackgroundColor.autoSettleRunning]])('getClassInstantStatus - return status with score diff:%p and instant:%p', (scoreDiff: number, instant: boolean, expected: string) => {
            match.autoCalcSetting = new AutoSetting();
            match.autoCalcSetting.isInstantForMatch = instant;
            match.instantScoreDiff = scoreDiff;

            const status = component.getClassInstantStatus(match);

            expect(status).toEqual(expected);
        });

    test.each([
        ["", ""],
        ["LIVE", "live-red"]])("getColorInstant - Return Red when status include 'Live'", (status: string, expected: string) => {
            match.instantStatus = status;

            const color = component.getColorInstant(match);

            expect(color).toEqual(expected);
        });

    describe('updateInstantStatus', () => {
        test.each([
            [null, null],
            ["", "2"],
            ["1", ""]])('Should Stop when exist score instant empty', (home: string, away: string) => {
                match.instantAwayScore = away;
                match.instantHomeScore = home;
                requestService.pushInstantStatus = jest.fn();

                component.doUpdateInstantStatus(match);

                expect(requestService.pushInstantStatus).not.toHaveBeenCalled();
            });

        it('should alert when update failed', fakeAsync(() => {
            match.instantAwayScore = "1";
            match.instantHomeScore = "1";
            requestService.pushInstantStatus = jest.fn().mockResolvedValue(mockResultFailed);
            messageBoxService.alert = jest.fn();

            component.doUpdateInstantStatus(match);
            tick();
            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(messageBoxService.alert).toHaveBeenCalled();
        }));

        it('should push instant score when update success', fakeAsync(() => {
            match.instantAwayScore = "1";
            match.instantHomeScore = "1";
            requestService.pushInstantStatus = jest.fn().mockResolvedValue(mockResultSuccess);
            handleActionsService.handleChangeInstantStatus = jest.fn();

            component.doUpdateInstantStatus(match);
            tick();
            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(requestService.pushInstantStatus).toHaveBeenCalled();
            expect(handleActionsService.handleChangeInstantStatus).toHaveBeenCalledWith(match);
        }));

        it('should alert when push score failed', fakeAsync(() => {
            match.instantAwayScore = "1";
            match.instantHomeScore = "1";
            requestService.pushInstantStatus = jest.fn().mockResolvedValue(mockResultFailed);
            messageBoxService.alert = jest.fn();

            component.doUpdateInstantStatus(match);
            tick();
            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(requestService.pushInstantStatus).toHaveBeenCalled();
            expect(messageBoxService.alert).toHaveBeenCalled();
        }));
    });

    test.each([
        null, ""])("isNullOrEmpty - return true when value null or empty", (value: string) => {
            const actual = component.isNullOrEmpty(value);

            expect(actual).toBeTruthy();
        });
});
