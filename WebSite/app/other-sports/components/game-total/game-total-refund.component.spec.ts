import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, fakeAsync, TestBed, tick, flush } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatchAio } from "../../models";
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";
import { ScoreBySettlementPipe } from "../../../shared/pipes/score-by-settlement.pipe";
import { ModalContentDialogComponent } from "../../../shared/components/modal-dialog/modal-content-dialog.component";
import { ModalDialogComponent } from "../../../shared/components/modal-dialog/modal-dialog.component";
import { HedgeMatchDetail, MatchDetail, Permission, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { AioService, BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { GameTotalRefundComponent } from "./game-total-refund.component";
import { GameTotalVerificationService } from "./game-total-verification.service";
import { GameTotalService } from "./game-total.service";
import { ResourceNameByIdPipe } from "../../pipes/resource-name-by-id.pipe";
import { ApiKeys } from "../../constants";
import { of } from "rxjs";
import { ResourceHeaderPipe, ScoreByPermissionPipe } from "../../pipes";
import { ResultSettingModel } from "../../../shared/models";
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from "ngx-toastr";
import { jest } from '@jest/globals';

describe('GameTotalRefundComponent', () => {
    let component: GameTotalRefundComponent;
    let fixture: ComponentFixture<GameTotalRefundComponent>;
    let gameTotalService: GameTotalService;
    let messageBoxService: MessageBoxService;
    let verificationService: GameTotalVerificationService;
    let aioService: AioService;
    let closePopupService: ClosePopupService;
    let toastrService: ToastrService;

    const permission = {
        canCalculate: true,
        canRefund: true,
        canUncalculate: true,
        isLeader: true,
        canChangeScoreSource: true,
        isTrader: true,
    } as Permission;

    const resultDetail = new ResultDetail();
    resultDetail.resourceId = "0101";
    const totalSet = new ResultDetail();
    totalSet.resourceId = "00";
    totalSet.resultSettingData = new ResultSettingModel();

    const matchDetail = new MatchDetail();
    matchDetail.homeName = 'hTeam';
    matchDetail.betStatus = '';
    const match = new MatchAio(matchDetail);
    match.permission = permission;
    match.resultDetails = [resultDetail];

    const existMarkedTicket = {
        isExistMarkedTicket: true,
    };
    const notExistMarkedTicket = {
        isExistMarkedTicket: false,
    };

    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
        childMatchIds: "",
        settledSessionId: "",
        hasResultAmendment: false,
        isOrg: false,
    };

    const unsuccessfulResult = {
        errCode: 1,
        errMsg: "error message",
        isSuccessful: false,
        childMatchIds: "",
        settledSessionId: "",
        hasResultAmendment: false,
        isOrg: false,
    };


    const buttonName = "btn-danger";

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GameTotalRefundComponent,
                ResourceHeaderPipe,
                ScoreByPermissionPipe,
            ],
            imports: [
                HttpClientModule,
                NgbModule,
                FormsModule,
                NoopAnimationsModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot(),
                ModalDialogComponent,
                ModalContentDialogComponent,
                IntervalBackgroundPipe,
                ScoreBySettlementPipe
            ],
            providers: [
                AioService,
                GameTotalService,
                BlockUIService,
                HttpRequestService,
                GameTotalVerificationService,
                ClosePopupService,
                MessageBoxService,
                IntervalBackgroundPipe,
                ResourceNameByIdPipe,
                NgbModal,
                ToastContainerDirective,
                { provide: ToastrService, useClass: ToastrService },
                { provide: MessageBoxService, useClass: MessageBoxService },
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameTotalRefundComponent);
        component = fixture.componentInstance;
        aioService = fixture.debugElement.injector.get(AioService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        verificationService = fixture.debugElement.injector.get(GameTotalVerificationService);
        gameTotalService = fixture.debugElement.injector.get(GameTotalService);
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        jest.spyOn(toastrService, 'clear');
        jest.spyOn(toastrService, 'error');
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getMatch', () => {
        it('should call with correct parameters', () => {
            const matchId = 123;
            const matchQuery = {
                matchId,
                apikey: ApiKeys.NormalMatch,
                settleType: "MNL"
            };
            jest.spyOn(aioService, 'getMatch').mockReturnValue(Promise.resolve(match));
            component.getMatch(matchId);

            expect(aioService.getMatch).toHaveBeenCalledWith(matchQuery);
        });

        it('should set correct value when get match success', async () => {
            match.resultDetails = [resultDetail, resultDetail];
            match.matchDetail.playTime = 0;
            jest.spyOn(gameTotalService, 'getResultDetail').mockReturnValue(match.resultDetails);
            jest.spyOn(gameTotalService, 'getClass');
            jest.spyOn(aioService, 'getMatch').mockReturnValue(Promise.resolve(match));
            jest.spyOn(gameTotalService, 'resetHomeAway');
            await component.getMatch(1);

            expect(gameTotalService.getClass).toHaveBeenCalledTimes(2);
            expect(component.permission).toEqual(match.permission);
            expect(component.matchDetail).toEqual(match.matchDetail);
            expect(component.resultDetails).toEqual(match.resultDetails);
        });
    });

    describe('Refund', () => {
        it('should show alert when match has marked ticket', async () => {
            component.match = match;
            jest.spyOn(aioService, 'checkMarkedTickets').mockReturnValue(Promise.resolve(existMarkedTicket));
            jest.spyOn(messageBoxService, 'alert');

            await component.refund();

            expect(toastrService.error).toHaveBeenCalled();
        });

        it('should show confirm when match is normal', async () => {
            component.match = match;
            jest.spyOn(aioService, 'checkMarkedTickets').mockReturnValue(Promise.resolve(notExistMarkedTicket));
            jest.spyOn(messageBoxService, 'confirm');

            await component.refund();

            expect(messageBoxService.confirm).toHaveBeenCalled();
        });

        it('should push query and close popup when click ok on confirm box', fakeAsync(async () => {
            match.resultDetails = [resultDetail];
            component.match = match;
            component.matchDetail = matchDetail;
            jest.spyOn(aioService, 'checkMarkedTickets').mockResolvedValue(notExistMarkedTicket);
            jest.spyOn(aioService, 'push').mockResolvedValue(successfulResult);
            jest.spyOn(closePopupService, 'closePopup');

            await component.refund();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(aioService.push).toHaveBeenCalled();
        }));

        it('should show error mrg when push is failed', fakeAsync(async () => {
            component.match = match;
            component.matchDetail = matchDetail;
            jest.spyOn(aioService, 'checkMarkedTickets').mockResolvedValue(notExistMarkedTicket);
            jest.spyOn(aioService, 'push').mockResolvedValue(unsuccessfulResult);

            await component.refund();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();
            flush();

            expect(toastrService.error).toHaveBeenCalledWith(unsuccessfulResult.errMsg);
        }));
    });

    describe('confirmRefund', () => {
        it('call service changeConfirmResultSetting when total set is not confirmed', () => {
            totalSet.resultSettingData.isConfirmedRefund = false;
            match.resultDetails = [totalSet];
            component.match = match;
            jest.spyOn(aioService, 'changeConfirmResultSetting');

            component.confirmRefund(new HedgeMatchDetail(), false);

            expect(aioService.changeConfirmResultSetting).toHaveBeenCalled();
        });

        it('call service undoConfirmedResult when total set is confirmed', () => {
            totalSet.resultSettingData.isConfirmedRefund = true;
            match.resultDetails = [totalSet];
            component.match = match;
            jest.spyOn(aioService, 'undoConfirmedResult');

            component.confirmRefund(new HedgeMatchDetail(), false);

            expect(aioService.undoConfirmedResult).toHaveBeenCalled();
        });
    });
});
