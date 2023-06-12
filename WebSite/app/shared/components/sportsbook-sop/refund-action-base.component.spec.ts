import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from "ngx-toastr";
import { ResultSettingModel, ResultSettingQuery } from "../../models";
import { ResultDetail } from "../../models/sportsbook-sop/result-detail.model";
import { ResultSettingType, SettlementStatusId, TicketStatusText } from "../../constants";
import { AioService, BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from "../../services";
import { RefundActionBaseComponent } from "./refund-action-base.component";
import { Language } from "../../language.native";
import { of } from "rxjs";
import { ModalDialogComponent, } from "../modal-dialog/modal-dialog.component";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { ModalContentDialogComponent } from "../modal-dialog/modal-content-dialog.component";

describe("Refund Base Component", () => {
    let component: RefundActionBaseComponent;
    
    let fixture: ComponentFixture<RefundActionBaseComponent>;
    let aioService: AioService;
    let toastrService: ToastrService;
    let closePopupService: ClosePopupService;
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
        }) .overrideModule(BrowserDynamicTestingModule, {
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
                closePopupService = fixture.debugElement.injector.get(ClosePopupService);
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

    describe("confirmResult", () => {
        it('should show alert when exist result refunded and has no running ticket', () => {
            result.resultSettingData.isConfirmedRefund = false;
            result.settlementStatusId = SettlementStatusId.Refund;
            result.ticketStatus = TicketStatusText.calculated;

            spyOn(toastrService, 'error');

            component.confirmResult([result], 0, '', null);

            expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.refundedNoRunningTicket);
        });

        it('should push request when click ok on confirm box', fakeAsync(async () => {
            result.resultSettingData.isConfirmedRefund = true;
            result.settlementStatusId = SettlementStatusId.Running;
            spyOn(aioService, 'changeResultSetting').and.returnValue(of(true));
            const query = new ResultSettingQuery(0, ResultSettingType.confirmRefund,
                true, '');

            component.confirmResult([result], 0, '', null);

            const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(aioService.changeResultSetting).toHaveBeenCalledWith(query);
        }));
    });
});