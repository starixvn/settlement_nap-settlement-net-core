import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { ExternalResult, ExternalResultDetail, GroupMap, MatchDetail, Permission, ResultDetail } from "../../models/sportsbook-sop";
import { ItemsSelect, ResultSettingModel, ResultSettingQuery } from "../../models";
import { AioService, BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from "../../services";
import { EarlyBaseComponent } from "./early-base.component";
import { ModalDialogComponent } from "../modal-dialog/modal-dialog.component";
import { ModalContentDialogComponent } from "../modal-dialog/modal-content-dialog.component";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { HttpClientModule } from "@angular/common/http";
import { ResultByTeamNamePipe } from "../../pipes/result-by-team-name.pipe";
import { CalculateAction, ResultStatusId, ScoreSourceType, TicketStatusText } from "../../constants";
import { Language } from "../../language.native";
import * as _ from "lodash";
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { MaterialModule } from '../../../shared/material-module';

describe("Early Base Component", () => {
    let component: EarlyBaseComponent;
    let fixture: ComponentFixture<EarlyBaseComponent>;
    let aioService: AioService;
    let messageBoxService: MessageBoxService;
    let verificationBaseService: VerificationBaseService;
    let closePopupService: ClosePopupService;
    let toastrService: ToastrService;
    const buttonName = "btn-danger";
    const errorMessage = "Error message";
    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
    };
    const unSuccessfulResult = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
    };
    const existMarkedTicket = {
        isExistMarkedTicket: true,
    };
    const notExistMarkedTicket = {
        isExistMarkedTicket: false,
    };

    const resultSettingData = new ResultSettingModel();
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = "H1";
    resultDetail.betTypeName = "Test bet type name";
    resultDetail.homeValue = 'H';
    resultDetail.isShow = true;
    resultDetail.inputType = 0;
    resultDetail.resultSettingData = resultSettingData;
    resultDetail.checked = true;
    const matchDetail = new MatchDetail();
    const permission = new Permission();
    const resultSetting = new ResultDetail();
    resultSetting.resultSettingData = new ResultSettingModel();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                EarlyBaseComponent
            ],
            providers: [
                MessageBoxService,
                AioService,
                HttpRequestService,
                BlockUIService,
                NgbModal,
                VerificationBaseService,
                ResultByTeamNamePipe,
                ClosePopupService,
                ToastContainerDirective,
                { provide: ToastrService, useClass: ToastrService },
                { provide: MessageBoxService, useClass: MessageBoxService },
            ],
            imports: [
                ModalDialogComponent,
                ModalContentDialogComponent,
                HttpClientModule,
                NgbModule,
                MaterialModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot()],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(EarlyBaseComponent);
                component = fixture.componentInstance;
                aioService = fixture.debugElement.injector.get(AioService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                verificationBaseService = fixture.debugElement.injector.get(VerificationBaseService);
                toastrService = fixture.debugElement.injector.get(ToastrService);
                closePopupService = fixture.debugElement.injector.get(ClosePopupService);
                component.permission = new Permission();
                
                // Setup jest mocks
                aioService.saveScore = jest.fn();
                aioService.changeResultSetting = jest.fn();
                aioService.checkMarkedTickets = jest.fn();
                verificationBaseService.getChangedScores = jest.fn();
                verificationBaseService.getOutsideScores = jest.fn();
                verificationBaseService.allResultsHaveScoreSources = jest.fn();
                verificationBaseService.isExistMismatchScore = jest.fn();
                messageBoxService.confirm = jest.fn();
                toastrService.error = jest.fn();
                
            });
    }));

    it("should create the app", () => {
        expect(component).toBeTruthy();
    });

    it("onChangeBetType - Should map is checked when result detail all items is checked", () => {
        resultDetail.checked = true;
        resultDetail.isResultWarning = true;
        const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
        const map = new GroupMap('1', resultDetails);
        component.resultDetails = resultDetails;

        component.onChangeBetType(resultDetails[0], map);

        expect(map.checked).toBe(true);
        expect(resultDetails[0].isResultWarning).toBeFalsy();
    });

    it("onChangeGroupMap - Should checked/unchecked result detail item like group map", () => {
        resultDetail.isResultWarning = true;
        const resultDetails: ResultDetail[] = [resultDetail];
        const map = new GroupMap('1', resultDetails);
        map.checked = true;
        component.resultDetails = resultDetails;
        component.onChangeGroupMap(map);

        expect(resultDetail.checked).toBeTruthy();
        expect(resultDetail.isResultWarning).toBeFalsy();
    });

    it('calculateAndUnCalculateButton - should return false when not exist result checked', () => {
        resultDetail.checked = true;
        component.resultDetails = [resultDetail, resultDetail];

        component.calculateAndUnCalculateButton();

        expect(component.isDisabledCalculate).toBeFalsy();
        expect(component.isDisabledUnCalculate).toBeFalsy();
        expect(component.isDisabledSaveScore).toBeFalsy();
    });

    describe('onSelect filter', () => {
        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(new ItemsSelect(1, "Running", "Running", true, true, true, []));
            const groupMap = new GroupMap('1', [resultDetail]);
            component.resultDetails = [resultDetail];
            component.groupMap = [groupMap];
            component.onSelectTicketsStatus(items);
            component.onSelectResultsStatus(items);
            component.onSelectResultType(items);

            expect(component.ticketStatusSelected).toEqual("Running");
            expect(component.resultStatusSelected).toEqual("Running");
            expect(component.resultTypeSelected).toEqual("Running");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            const groupMap = new GroupMap('1', [resultDetail]);
            component.resultDetails = [resultDetail];
            component.groupMap = [groupMap];
            component.onSelectTicketsStatus(items);
            component.onSelectResultsStatus(items);
            component.onSelectResultType(items);

            expect(component.ticketStatusSelected).toEqual("");
            expect(component.resultStatusSelected).toEqual("");
            expect(component.resultTypeSelected).toEqual("");
        });
    });

    it("isCompleted - Should return true when resultStatusId is Auto or Manual", () => {
        expect(component.isCompleted(2, 0)).toBe(true);
        expect(component.isCompleted(5, 4)).toBe(true);
    });

    it("isRefunded - Should return true when resultStatusId is manual and settlementStatusId is refund", () => {
        expect(component.isRefunded(5, 1)).toBe(true);
    });

    it("onCollapsedClick - Should negative input value", () => {
        const map = new GroupMap('1', []);
        component.onCollapsedClick(map);
        expect(map.collapsed).toBe(true);
    });

    describe('getResultSettingIcon.', () => {
        it('should return "icon-yes" when input is true', () => {
            component.permission.canCalculate = true;
            const result = component.getResultSettingIcon(true);

            expect(result).toEqual('icon-yes');
        });

        it('should return "icon-no" when input is false', () => {
            component.permission = new Permission();
            component.permission.canCalculate = true;
            const result = component.getResultSettingIcon(false);

            expect(result).toEqual('icon-no');
        });

        it('should return "icon-auto-disable" when input is true but not have permission', () => {
            component.permission = new Permission();
            const result = component.getResultSettingIcon(true);

            expect(result).toEqual('icon-auto-disable');
        });

        it('should return "icon-no-disable" when input is false but not have permission', () => {
            component.permission = new Permission();
            const result = component.getResultSettingIcon(false);

            expect(result).toEqual('icon-no-disable');
        });
    });

    it('onResettleCheckboxChange - should change isReSettledTickets', () => {
        component.onResettleCheckboxChange(true);

        expect(component.isReSettledTickets).toBe(true);
    });

    it('hideTicketWaiting - remove result no ticket', () => {
        resultDetail.ticketStatus = TicketStatusText.noTicket;
        const map = new GroupMap('1', [resultDetail]);

        component.hideTicketWaiting([map]);

        expect(map.resultDetail.length).toEqual(0);
    });

    it('setValueResult - should set correct value', () => {
        resultDetail.checked = true;
        component.resultDetails = [resultDetail];
        const map = new GroupMap('1', [resultDetail]);

        component.setValueResult(resultDetail, map, true);

        expect(resultDetail.checked).toBeFalsy();
        expect(resultDetail.resultSettingData.isHoldResult).toBeTruthy();
        expect(map.isHoldResult).toBeTruthy();
    });

    it('setValueGroup - should set correct value', () => {
        resultDetail.checked = true;
        component.resultDetails = [resultDetail];
        const map = new GroupMap('1', [resultDetail]);

        component.setValueGroup(map, true);

        expect(map.checked).toBeFalsy();
        expect(resultDetail.resultSettingData.isHoldResult).toBeTruthy();
        expect(map.isHoldResult).toBeTruthy();
    });

    it('getTextTooltip - return text when test length lower than max', () => {
        expect(component.getTextTooltip('abc', 1)).toEqual('abc');
        expect(component.getTextTooltip('abc', 4)).toEqual(null);
    });

    describe('saveResult', () => {
        it('saveResult - should push successfully', fakeAsync(() => {
            const groupMap = new GroupMap('1', [resultDetail]);
            aioService.saveScore = jest.fn().mockResolvedValue(successfulResult);
            verificationBaseService.getChangedScores = jest.fn().mockReturnValue([]);
            verificationBaseService.getOutsideScores = jest.fn().mockReturnValue([]);
            component.resultDetails = [resultDetail];
            component.groupMap = [groupMap];

            component.doSaveResult('', [], [], '', () => { });
            tick();

            expect(aioService.saveScore).toHaveBeenCalled();
            expect(component.resultDetails[0].checked).toBeFalsy();
        }));

        it('should set error message when save score unsuccessfully', fakeAsync(() => {
            aioService.saveScore = jest.fn().mockResolvedValue(unSuccessfulResult);
            verificationBaseService.getChangedScores = jest.fn().mockReturnValue([]);
            verificationBaseService.getOutsideScores = jest.fn().mockReturnValue([]);

            component.doSaveResult('', [], [], '', () => { });
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));

        it('should call func when save score successfully and type is calc', fakeAsync(() => {
            aioService.saveScore = jest.fn().mockResolvedValue(successfulResult);
            verificationBaseService.getChangedScores = jest.fn().mockReturnValue([]);
            verificationBaseService.getOutsideScores = jest.fn().mockReturnValue([]);
            let actual = false;

            component.doSaveResult(CalculateAction.calculate, [], [], '', () => { actual = true });
            tick();

            expect(actual).toBeTruthy();
        }));
    });

    describe('isChangeSetting.', () => {
        beforeEach(() => {
            component.permission.canCalculate = true;
        });

        it('always show confirm', () => {
            const map = new GroupMap('1', []);

            component.isChangeSetting(resultDetail, map);

            expect(messageBoxService.confirm).toHaveBeenCalled();
        });

        it('should call service with correct param', fakeAsync(() => {
            const map = new GroupMap('1', []);
            resultDetail.resultSettingData.isHoldResult = false;
            resultDetail.resourceId = '7120103';
            component.matchId = 1;
            component.resultDetails = [resultDetail];
            const query = new ResultSettingQuery(1, 1, true, '7120103');
            aioService.changeResultSetting = jest.fn().mockResolvedValue(true);
            messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => {
                callback();
            });

            component.isChangeSetting(resultDetail, map);
            tick();

            expect(aioService.changeResultSetting).toHaveBeenCalledWith(query);
        }));

        it('should set correct value when aioService is successful', fakeAsync(() => {
            const map = new GroupMap('1', [resultDetail]);
            resultDetail.resultSettingData.isHoldResult = false;
            component.resultDetails = [resultDetail];
            
            aioService.changeResultSetting = jest.fn().mockResolvedValue(true);
            messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => {
                callback();
            });

            component.isChangeSetting(resultDetail, map);
            tick();

            expect(resultDetail.resultSettingData.isHoldResult).toBe(true);
            expect(resultDetail.checked).toBe(false);
            expect(map.isHoldResult).toBe(true);
        }));
    });

    describe('changeSettingGroup', () => {
        beforeEach(() => {
            component.permission.canCalculate = true;
        });
        it('always show confirm', () => {
            const map = new GroupMap('1', []);

            component.changeSettingGroup(map);

            expect(messageBoxService.confirm).toHaveBeenCalled();
        });

        it('should call service with correct param', fakeAsync(() => {
            const map = new GroupMap('1', [resultDetail, resultDetail]);
            resultDetail.resourceId = '7120103';
            component.matchId = 1;
            component.resultDetails = [resultDetail];
            const query = new ResultSettingQuery(1, 1, true, '7120103,7120103');
            aioService.changeResultSetting = jest.fn().mockResolvedValue(true);
            messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => {
                callback();
            });

            component.changeSettingGroup(map);
            tick();

            expect(aioService.changeResultSetting).toHaveBeenCalledWith(query);
        }));

        it('should set correct value when service successful', fakeAsync(() => {
            const map = new GroupMap('1', [resultDetail]);
            component.resultDetails = [resultDetail];
            aioService.changeResultSetting = jest.fn().mockResolvedValue(true);
            messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => {
                callback();
            });

            component.changeSettingGroup(map);
            tick();

            expect(map.checked).toBe(false);
            expect(map.isHoldResult).toBe(true);
            expect(resultDetail.checked).toBe(false);
            expect(resultDetail.resultSettingData.isHoldResult).toEqual(map.isHoldResult);
        }));
    });

    describe('getUncalculateMessage', () => {

        it("should use first confirm message", fakeAsync(() => {
            resultDetail.resultStatus = '2';
            component.resultDetails = [resultDetail];

            component.getUncalculateMessage();

            expect(component.confirmationDialogMessage.message).toEqual(
                Language.UnCalculationConfirmMessageEarly1
            );
            expect(toastrService.error).not.toHaveBeenCalled();
        }));

        it("should use second confirm message", fakeAsync(() => {
            resultDetail.resultStatusId = ResultStatusId.RunningZero;
            resultDetail.checked = true;
            component.resultDetails = [resultDetail];

            component.getUncalculateMessage();

            expect(component.confirmationDialogMessage.message).toEqual(
                Language.UnCalculationConfirmMessageEarly2
            );
        }));
    });

    describe('checkMarkedTickets', () => {
        it("should alert when exist marked ticket", fakeAsync(() => {
            component.resultDetails = [resultDetail];

            aioService.checkMarkedTickets = jest.fn().mockResolvedValue(existMarkedTicket);

            component.checkMarkedTickets([resultDetail], () => { });
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
        }));

        it('should alert when not exist marked ticket', fakeAsync(async () => {
            const result = new ResultDetail();
            result.resultSettingData = new ResultSettingModel();
            result.resultSettingData.isConfirmedRefund = false;
            result.checked = true;
            component.resultDetails = [result];
            aioService.checkMarkedTickets = jest.fn().mockResolvedValue(notExistMarkedTicket);

            component.checkMarkedTickets([result], () => { });
            tick();

            expect(component.confirmationDialogMessage.message).toEqual("Are you sure you want to REFUND the selected result?");
            expect(messageBoxService.confirm).toHaveBeenCalled();
        }));
    });

    it('getClass - should return correct value', () => {
        expect(component.getClass("")).toEqual("input-score");
        expect(component.getClass("a")).toEqual("team-score");
    });

    describe('getDropdownTooltip', () => {
        it('should return tooltip when its longer than max length', () => {
            component.matchDetail = matchDetail;
            component.matchDetail.homeName = 'abcde';

            const result = component.getDropdownTooltip('H', 4);

            expect(result).toEqual('abcde');
        });

        it('should return null when its shorter than max length', () => {
            component.matchDetail = matchDetail;
            component.matchDetail.homeName = 'abcd';

            const result = component.getDropdownTooltip('H', 4);

            expect(result).toEqual(null);
        });
    });

    it('isConfirmed - return true when has permission leader and result confirmed', () => {
        permission.isLeader = true;
        component.matchDetail = matchDetail;
        component.permission = permission;
        resultDetail.resultSettingData = new ResultSettingModel();
        resultDetail.resultSettingData.isConfirmedRefund = true;

        const result = component.isConfirmed(resultDetail);

        expect(result).toBe(true);
    });

    describe('confirmRefund', () => {
        it('should show alert when exist differentStates', () => {
            resultDetail.resultSettingData.isConfirmedRefund = true;
            const resultSecond = _.cloneDeep(resultDetail);
            resultSecond.resultSettingData.isConfirmedRefund = false;
            component.permission = permission;
            component.matchDetail = matchDetail;
            component.resultDetails = [resultDetail, resultSecond];

            component.confirmRefund();

            expect(toastrService.error).toHaveBeenCalled();
        })
    });

    describe('undoConfirmedResult', () => {
        it('should show alert when exist result not confirmed', () => {
            resultSetting.resultSettingData.isConfirmedRefund = false;

            component.undoConfirmedResult([resultSetting], 0, '', []);

            expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot continue due to selected results have different confirm states! Please select confirmed or not confirmed results only.");
        });


        it('should call service change result setting when all result confirmed', fakeAsync(async () => {
            resultSetting.resultSettingData.isConfirmedRefund = true;
            aioService.changeConfirmResultSetting = jest.fn();

            component.undoConfirmedResult([resultSetting], 0, '', []);
    
            expect(aioService.changeConfirmResultSetting).toHaveBeenCalled();
        }));
    });

    describe('verifyScoreSourcesAndCalculate', () => {
        let confirmChangedResults: jest.Mock;

        beforeEach(() => {
            confirmChangedResults = jest.fn();
        });

        it('should show error when not all maps have screenshot sources', () => {
            // Arrange
            verificationBaseService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(false);
            
            // Act
            component.verifyScoreSourcesAndCalculate(confirmChangedResults);
            
            // Assert
            expect(toastrService.error).toHaveBeenCalledWith(Language.sop.notScreenshot);
            expect(confirmChangedResults).not.toHaveBeenCalled();
        });

        it('should show error when there are mismatched score screenshots', () => {
            // Arrange
            verificationBaseService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
            verificationBaseService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(true);
            
            // Act
            component.verifyScoreSourcesAndCalculate(confirmChangedResults);
            
            // Assert
            expect(toastrService.error).toHaveBeenCalledWith(Language.sop.mismatchedScreenshot);
            expect(confirmChangedResults).not.toHaveBeenCalled();
        });

        it('should call confirmCalculateMismatchScores when all results have score sources', () => {
            // Arrange
            verificationBaseService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
            verificationBaseService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);
            verificationBaseService.allResultsHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationBaseService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            
            // Act
            component.verifyScoreSourcesAndCalculate(confirmChangedResults);
            
            // Assert
            expect(confirmChangedResults).toHaveBeenCalled();
        });

        it('should show error when not all results have score sources and user is not a leader', () => {
            // Arrange
            verificationBaseService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
            verificationBaseService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);
            verificationBaseService.allResultsHaveScoreSources = jest.fn().mockReturnValue(false);
            component.permission.isLeader = false;
            
            // Act
            component.verifyScoreSourcesAndCalculate(confirmChangedResults);
            
            // Assert
            expect(toastrService.error).toHaveBeenCalledWith(Language.eSports.nonLeader.insufficientSources);
            expect(confirmChangedResults).not.toHaveBeenCalled();
        });

        it('should show confirmation dialog when not all results have score sources and user is a leader', () => {
            // Arrange
            verificationBaseService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
            verificationBaseService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);
            verificationBaseService.allResultsHaveScoreSources = jest.fn().mockReturnValue(false);
            component.permission.isLeader = true;
            messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());
            verificationBaseService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            
            // Act
            component.verifyScoreSourcesAndCalculate(confirmChangedResults);
            
            // Assert
            expect(component.confirmationDialogMessage.message).toEqual(Language.eSports.leader.insufficientSources);
            expect(messageBoxService.confirm).toHaveBeenCalled();
            expect(confirmChangedResults).toHaveBeenCalled();
        });

        it('should show error when there are mismatch scores and user is not a leader', () => {
            // Arrange
            verificationBaseService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
            verificationBaseService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);
            verificationBaseService.allResultsHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationBaseService.isExistMismatchScore = jest.fn().mockReturnValue(true);
            component.permission.isLeader = false;
            
            // Act
            component.verifyScoreSourcesAndCalculate(confirmChangedResults);
            
            // Assert
            expect(toastrService.error).toHaveBeenCalledWith(Language.eSports.nonLeader.mismatchedResult);
            expect(confirmChangedResults).not.toHaveBeenCalled();
        });

        it('should show confirmation dialog when there are mismatch scores and user is a leader', () => {
            // Arrange
            verificationBaseService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
            verificationBaseService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);
            verificationBaseService.allResultsHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationBaseService.isExistMismatchScore = jest.fn().mockReturnValue(true);
            component.permission.isLeader = true;
            messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());
            
            // Act
            component.verifyScoreSourcesAndCalculate(confirmChangedResults);
            
            // Assert
            expect(component.confirmationDialogMessage.message).toEqual(Language.eSports.leader.mismatchedResult);
            expect(messageBoxService.confirm).toHaveBeenCalled();
            expect(confirmChangedResults).toHaveBeenCalled();
        });
    });

    describe('autoFillConfirmedSDT', () => {
        let externalResults: ExternalResult[];
        let resultDetails: ResultDetail[];
        let confirmRefundExternalResult: ExternalResult;
        let externalResultDetail: ExternalResultDetail;

        beforeEach(() => {
            // Arrange
            externalResultDetail = new ExternalResultDetail(
                ScoreSourceType.confirmRefundSource,
                '6130110',
                'Confirm Refund Source',
                '',
                '2',
                '1'
            );

            confirmRefundExternalResult = new ExternalResult(
                ScoreSourceType.confirmRefundSource,
                [externalResultDetail]
            );

            externalResults = [confirmRefundExternalResult];

            const resultDetail = new ResultDetail();
            resultDetail.resourceId = '6130110';
            resultDetail.resultSettingData = new ResultSettingModel();
            resultDetail.resultSettingData.isConfirmedRefundSdt = true;
            resultDetail.homeValue = '';
            resultDetail.awayValue = '';

            resultDetails = [resultDetail];
        });

        it('should fill confirmed SDT values when user is leader and confirm refund source exists', () => {
            // Arrange
            const isLeader = true;

            // Act
            component.autoFillConfirmedSDT(isLeader, externalResults, resultDetails);

            // Assert
            expect(resultDetails[0].homeValue).toBe('2');
            expect(resultDetails[0].awayValue).toBe('1');
        });

        it('should not fill values when user is not leader', () => {
            // Arrange
            const isLeader = false;

            // Act
            component.autoFillConfirmedSDT(isLeader, externalResults, resultDetails);

            // Assert
            expect(resultDetails[0].homeValue).toBe('');
            expect(resultDetails[0].awayValue).toBe('');
        });

        it('should not fill values when confirm refund source does not exist', () => {
            // Arrange
            const isLeader = true;
            const externalResultsWithoutConfirm = [];

            // Act
            component.autoFillConfirmedSDT(isLeader, externalResultsWithoutConfirm, resultDetails);

            // Assert
            expect(resultDetails[0].homeValue).toBe('');
            expect(resultDetails[0].awayValue).toBe('');
        });

        it('should not fill values when result is not confirmed SDT', () => {
            // Arrange
            const isLeader = true;
            resultDetails[0].resultSettingData.isConfirmedRefundSdt = false;

            // Act
            component.autoFillConfirmedSDT(isLeader, externalResults, resultDetails);

            // Assert
            expect(resultDetails[0].homeValue).toBe('');
            expect(resultDetails[0].awayValue).toBe('');
        });

        it('should handle multiple result details with mixed confirmation states', () => {
            // Arrange
            const isLeader = true;
            
            const resultDetail2 = new ResultDetail();
            resultDetail2.resourceId = '6130111';
            resultDetail2.resultSettingData = new ResultSettingModel();
            resultDetail2.resultSettingData.isConfirmedRefundSdt = false;
            resultDetail2.homeValue = '';
            resultDetail2.awayValue = '';

            const externalResultDetail2 = new ExternalResultDetail(
                ScoreSourceType.confirmRefundSource,
                '6130111',
                'Confirm Refund Source',
                '',
                '3',
                '0'
            );

            confirmRefundExternalResult.resultDetails = [externalResultDetail, externalResultDetail2];
            resultDetails = [resultDetails[0], resultDetail2];

            // Act
            component.autoFillConfirmedSDT(isLeader, externalResults, resultDetails);

            // Assert
            expect(resultDetails[0].homeValue).toBe('2');
            expect(resultDetails[0].awayValue).toBe('1');
            expect(resultDetails[1].homeValue).toBe('');
            expect(resultDetails[1].awayValue).toBe('');
        });

        it('should not fill values when resource ID does not match', () => {
            // Arrange
            const isLeader = true;
            resultDetails[0].resourceId = '9999999'; // Different resource ID

            // Act
            component.autoFillConfirmedSDT(isLeader, externalResults, resultDetails);

            // Assert
            expect(resultDetails[0].homeValue).toBe('');
            expect(resultDetails[0].awayValue).toBe('');
        });
    });
});
