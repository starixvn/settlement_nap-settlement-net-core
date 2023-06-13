import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from "ngx-toastr";
import { ResourceItem, ResultSettingModel, ResultSettingQuery } from "../../models";
import { ResultDetail } from "../../models/sportsbook-sop/result-detail.model";
import { ResultSettingType, SettlementStatusId, SportType, TicketStatusText } from "../../constants";
import { AioService, BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from "../../services";
import { RefundActionBaseComponent } from "./refund-action-base.component";
import { Language } from "../../language.native";
import { of } from "rxjs";
import { ModalDialogComponent, } from "../modal-dialog/modal-dialog.component";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { ModalContentDialogComponent } from "../modal-dialog/modal-content-dialog.component";
import { HedgeMatchDetail, MatchDetail } from "../../../shared/models/sportsbook-sop";

describe("Refund Base Component", () => {
    let component: RefundActionBaseComponent;

    let fixture: ComponentFixture<RefundActionBaseComponent>;
    let aioService: AioService;
    let toastrService: ToastrService;
    const result = new ResultDetail();
    result.resultSettingData = new ResultSettingModel();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                RefundActionBaseComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
            providers: [
                AioService,
                HttpRequestService,
                BlockUIService,
                NgbModal,
                ClosePopupService,
                AioService,
                MessageBoxService,
                ToastContainerDirective,
                { provide: ToastrService, useClass: ToastrService },
                { provide: MessageBoxService, useClass: MessageBoxService },
            ],
            imports: [
                HttpClientModule,
                NgbModule,
                ToastNoAnimationModule.forRoot(),
                ToastContainerModule,
                ToastrModule.forRoot()],
        }).overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
            },
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(RefundActionBaseComponent);
                component = fixture.componentInstance;
                aioService = fixture.debugElement.injector.get(AioService);
                toastrService = fixture.debugElement.injector.get(ToastrService);
            });
    }));

    it("should create the app", () => {
        expect(component).toBeTruthy();
    });

    describe('undoConfirmedResult', () => {
        it('should show alert when exist result not confirmed', () => {
            result.resultSettingData.isConfirmedRefund = false;
            spyOn(toastrService, 'error');

            component.undoConfirmedResult([result], 0, '', null);

            expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.differentStates);

        });

        it('should push request when click ok on confirm box', fakeAsync(async () => {
            result.resultSettingData.isConfirmedRefund = true;
            spyOn(aioService, 'changeResultSetting').and.returnValue(of(true));
            const query = new ResultSettingQuery(0, ResultSettingType.confirmRefund,
                false, '');

            component.undoConfirmedResult([result], 0, '', null);

            const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(aioService.changeResultSetting).toHaveBeenCalledWith(query);
        }));
    });


    describe('confirmRefundSdt', () => {
        beforeEach(() => {
            toastrService.error = jest.fn();
            aioService.changeConfirmResultSDTSetting = jest.fn();
        })
        it('should call changeConfirmResultSDTSetting with the correct parameters when validation passes', () => {
            const resultDetails: ResultDetail[] = [
                { resourceId: 'Resource1', homeValue: '1', awayValue: '2', settlementStatusId: SettlementStatusId.Calculated },
                { resourceId: 'Resource2', homeValue: '3', awayValue: '4', settlementStatusId: SettlementStatusId.Calculated, checked: true },
            ] as ResultDetail[];

            component.resultDetails = resultDetails;
            component.applyHedgeMatch = true;
            component.hedgeMatchDetail = new HedgeMatchDetail;
            component.matchDetail = { matchId: 123 } as MatchDetail;

            component.confirmRefundSdt();

            expect(toastrService.error).not.toHaveBeenCalled();
            expect(aioService.changeConfirmResultSDTSetting).toHaveBeenCalledWith(
                123,
                [
                    { resourceId: 'Resource2', homeValue: '3', awayValue: '4' },
                ] as ResourceItem[],
                true,
                component.hedgeMatchDetail
            );
        });

        it('should call toastrService.error when match after first selected not emtpy', () => {
            const resultDetails: ResultDetail[] = [
                { resourceId: 'Resource1', homeValue: '1', awayValue: '1', settlementStatusId: SettlementStatusId.Calculated, checked: true },
                { resourceId: 'Resource2', homeValue: '3', awayValue: '4', settlementStatusId: SettlementStatusId.Calculated, checked: true },
            ] as ResultDetail[];
            component.resultDetails = resultDetails;

            component.confirmRefundSdt();

            expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.sdtErrorMessage);
            expect(aioService.changeConfirmResultSDTSetting).not.toHaveBeenCalled();
        });

        it('should call toastrService.error when match first selected is emtpy', () => {
            const resultDetails: ResultDetail[] = [
                { resourceId: 'Resource1', homeValue: '', awayValue: '', settlementStatusId: SettlementStatusId.Calculated, checked: true },
                { resourceId: 'Resource2', homeValue: '', awayValue: '', settlementStatusId: SettlementStatusId.Calculated, checked: true },
            ] as ResultDetail[];
            component.resultDetails = resultDetails;

            component.confirmRefundSdt();

            expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.sdtErrorMessage);
            expect(aioService.changeConfirmResultSDTSetting).not.toHaveBeenCalled();
        });

        it('should call toastrService.error when exist result after first selected is not calculated', () => {
            const resultDetails: ResultDetail[] = [
                { resourceId: 'Resource1', homeValue: '', awayValue: '', settlementStatusId: SettlementStatusId.Running },
                { resourceId: 'Resource2', homeValue: '', awayValue: '', settlementStatusId: SettlementStatusId.Calculated, checked: true },
            ] as ResultDetail[];
            component.resultDetails = resultDetails;

            component.confirmRefundSdt();

            expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.sdtErrorMessage);
            expect(aioService.changeConfirmResultSDTSetting).not.toHaveBeenCalled();
        });
    });

    describe('existResultNotConfirmed', () => {
        it('should return true when all selected resources have not been confirmed and match support sdt settle', () => {
            const resultDetails = [
                { resourceId: 'Resource1', resultSettingData: { isConfirmedRefund: false, isConfirmedRefundSdt: false }, checked: true },
                { resourceId: 'Resource2', resultSettingData: { isConfirmedRefund: false, isConfirmedRefundSdt: false }, checked: true },
            ] as ResultDetail[];

            component.resultDetails = resultDetails;
            component.matchDetail = { sportType: SportType.basketBall } as MatchDetail;

            const result = component.existResultNotConfirmed();

            expect(result).toBe(true);
        });

        it('should return false when all selected resources have been confirmed and match support sdt settle', () => {
            const resultDetails = [
                { resourceId: 'Resource1', resultSettingData: { isConfirmedRefund: true, }, checked: true },
                { resourceId: 'Resource2', resultSettingData: { isConfirmedRefundSdt: true }, checked: true },
            ] as ResultDetail[];

            component.resultDetails = resultDetails;
            component.matchDetail = { sportType: SportType.basketBall } as MatchDetail;

            const result = component.existResultNotConfirmed();

            expect(result).toBe(false);
        });

        it('should return false when exist selected resources not confirmed  and match not support sdt settle', () => {
            const resultDetails = [
                { resourceId: 'Resource1', resultSettingData: { isConfirmedRefund: true, }, checked: true },
                { resourceId: 'Resource2', resultSettingData: { isConfirmedRefundSdt: true }, checked: true },
            ] as ResultDetail[];

            component.resultDetails = resultDetails;
            component.matchDetail = { matchId: SportType.badminton } as MatchDetail;

            const result = component.existResultNotConfirmed();

            expect(result).toBe(true);
        });
    });
});