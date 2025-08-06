import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { ToastrService } from "ngx-toastr";
import { ResultSettingModel, ResultSettingQuery } from "../../models";
import { ResultDetail } from "../../models/sportsbook-sop/result-detail.model";
import { ResultSettingType, SettlementStatusId, SportType } from "../../constants";
import { AioService, MessageBoxService } from "../../services";
import { RefundActionBaseComponent } from "./refund-action-base.component";
import { Language } from "../../language.native";
import { of } from "rxjs";
import { ModalDialogComponent, } from "../modal-dialog/modal-dialog.component";
import { HedgeMatchDetail, MatchDetail } from "../../../shared/models/sportsbook-sop";

describe("Refund Base Component", () => {
    let component: RefundActionBaseComponent;

    let fixture: ComponentFixture<RefundActionBaseComponent>;
    let aioService: any;
    let toastrService: any;
    let messageBoxService: any;
    const result = new ResultDetail();
    result.resultSettingData = new ResultSettingModel();

    beforeEach(waitForAsync(() => {
        aioService = {
            changeResultSetting: jest.fn(),
            changeConfirmResultSDTSetting: jest.fn(),
            changeConfirmResultSetting: jest.fn()
        };
        toastrService = {
            error: jest.fn()
        };
        messageBoxService = {
            confirm: jest.fn()
        };
        TestBed.configureTestingModule({
            declarations: [
                RefundActionBaseComponent
            ],
            imports: [
                ModalDialogComponent
            ],
            providers: [
                { provide: AioService, useValue: aioService },
                { provide: ToastrService, useValue: toastrService },
                { provide: MessageBoxService, useValue: messageBoxService }
            ]
        }).compileComponents();
        
        fixture = TestBed.createComponent(RefundActionBaseComponent);
        component = fixture.componentInstance;
    }));

    it("should create the app", () => {
        expect(component).toBeTruthy();
    });

    describe('undoConfirmedResult', () => {
        it('should show alert when exist result not confirmed', () => {
            result.resultSettingData.isConfirmedRefund = false;
            const errorSpy = jest.fn();
            toastrService.error = errorSpy;

            component.undoConfirmedResult({
              resultDetails: [result],
              matchId: 1,
              resourceIds: "",
              hedgeMatchDetail: null
            });

            expect(errorSpy).toHaveBeenCalledWith(Language.confirmRefund.differentStates);
        });

        it('should push request when click ok on confirm box', fakeAsync(async () => {
            result.resultSettingData.isConfirmedRefund = true;
            const changeConfirmResultSettingSpy = jest.fn().mockReturnValue(of(true));
            aioService.changeConfirmResultSetting = changeConfirmResultSettingSpy;

            component.undoConfirmedResult({
              resultDetails: [result],
              matchId: 1,
              resourceIds: "",
              hedgeMatchDetail: null
            });

            // Mock the button click by calling the callback directly
            const confirmSpy = jest.fn().mockImplementation((message, callback) => {
                callback();
            });
            messageBoxService.confirm = confirmSpy;
            
            tick();

            expect(changeConfirmResultSettingSpy).toHaveBeenCalledWith(
                Language.confirmRefund.undoConfirm,
                1,
                "",
                false,
                null,
                undefined,
                undefined
            );
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
                3,
                [
                    { resourceId: 'Resource2', homeValue: '3', awayValue: '4', otherInfo: '', resourceName: undefined }
                ],
                true,
                component.hedgeMatchDetail,
                undefined
            );
        });

        it('should call toastrService.error when match after first selected not emtpy', () => {
            const resultDetails: ResultDetail[] = [
                { resourceId: 'Resource1', homeValue: '1', awayValue: '1', settlementStatusId: SettlementStatusId.Calculated, checked: true },
                { resourceId: 'Resource2', homeValue: '3', awayValue: '4', settlementStatusId: SettlementStatusId.Calculated, checked: true },
            ] as ResultDetail[];
            component.resultDetails = resultDetails;

            component.confirmRefundSdt();

            expect(toastrService.error).toHaveBeenCalledWith("Cannot continue with Refund due to confirm state or value mismatch. Please check and try again.");
            expect(aioService.changeConfirmResultSDTSetting).not.toHaveBeenCalled();
        });

        it('should call toastrService.error when match first selected is emtpy', () => {
            const resultDetails: ResultDetail[] = [
                { resourceId: 'Resource1', homeValue: '', awayValue: '', settlementStatusId: SettlementStatusId.Calculated, checked: true },
                { resourceId: 'Resource2', homeValue: '', awayValue: '', settlementStatusId: SettlementStatusId.Calculated, checked: true },
            ] as ResultDetail[];
            component.resultDetails = resultDetails;

            component.confirmRefundSdt();

            expect(toastrService.error).toHaveBeenCalledWith("Please input score accordingly.");
            expect(aioService.changeConfirmResultSDTSetting).not.toHaveBeenCalled();
        });

        it('should call toastrService.error when exist result after first selected is not calculated', () => {
            const resultDetails: ResultDetail[] = [
                { resourceId: 'Resource1', homeValue: '', awayValue: '', settlementStatusId: SettlementStatusId.Running },
                { resourceId: 'Resource2', homeValue: '', awayValue: '', settlementStatusId: SettlementStatusId.Calculated, checked: true },
            ] as ResultDetail[];
            component.resultDetails = resultDetails;

            component.confirmRefundSdt();

            expect(toastrService.error).toHaveBeenCalledWith("Please input score accordingly.");
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