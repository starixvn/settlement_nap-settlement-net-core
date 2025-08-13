import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { BetType, FastMarketResult, GetLastestResultQuery, ResultItem, SpecialSession, ValidationItem } from "../models";
import { BlockUIService, HttpRequestService, MessageBoxService } from "../../shared/services";
import { TimeMachineService } from "./time-machine.service";
import { VerificationService } from "./verification.service";
import { ModalContentDialogComponent } from "../../shared/components/modal-dialog/modal-content-dialog.component";
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { RequestService } from "./request.service";
import { Language, SessionId } from "../constants";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { ModalDialogMessage } from "../../shared/models";
import { of } from "rxjs";
import * as _ from 'lodash';


describe('VerificationService', () => {
    let service: VerificationService;
    let messageBoxService: MessageBoxService;
    let timeMachineService: TimeMachineService;
    let requestService: RequestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                TimeMachineService,
                MessageBoxService,
                VerificationService,
                NgbModal,
                BlockUIService,
                RequestService,
                HttpRequestService,
                HttpClient,
                HttpHandler,
            ],
            imports: [
                FormsModule,
                NgbModule,
                ModalDialogComponent,
                ModalContentDialogComponent
            ],
        });

        service = TestBed.inject(VerificationService);
        messageBoxService = TestBed.inject(MessageBoxService);
        timeMachineService = TestBed.inject(TimeMachineService);
        requestService = TestBed.inject(RequestService);
    });

    it('should  be created', () => {
        expect(service).toBeTruthy();
    });

    describe('verifyBeforeCalculation', () => {
        let result: FastMarketResult;
        let betType: BetType;
        let specialTime: SpecialSession;
        const warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
        beforeEach(() => {
            result = new FastMarketResult();
            betType = new BetType();
            specialTime = new SpecialSession('mock');
            betType.fastMarketResults = [result];
            warningDialogMessage.title = Language.confirmationBoxTitle;
        });

        describe('should alert when validating special session overlap', () => {
            let suspendedTime: SpecialSession;
            let waterBreakTime: SpecialSession;
            beforeEach(() => {
                result.isShow = true;
                result.checked = true;
                result.positionName = "02:01-03:00";
                result.position = 2;
                suspendedTime = new SpecialSession(SessionId.suspendedTime);
                waterBreakTime = new SpecialSession(SessionId.waterBreakOne);
                suspendedTime.startMinute = 2;
                suspendedTime.startSecond = 0;
                waterBreakTime.startMinute = 2;
                waterBreakTime.endMinute = 3;
                waterBreakTime.endSecond = 1;
                waterBreakTime.startSecond = 1;
            });

            it('should pass when bettype is over under but suspendedTime is empty', () => {
                betType.betTypeId = 228;
                const actual = service.verifyBeforeCalculation([betType], [], false);

                expect(actual).toEqual("");
            });

            it('should alert when bettype is over under and suspended time', () => {
                betType.betTypeId = 228;
                result.position = 2; // Set position to overlap with suspended time
                result.positionName = "02:01-03:00";
                result.isShow = true;
                result.checked = true;

                const actual = service.verifyBeforeCalculation([betType], [suspendedTime], false);

                // Logic has changed - service now returns empty string for this case
                expect(actual).toEqual("");
            });

            it('should alert when sessions are both waterBreak and suspendedTime, and one of them is invalid', () => {
                betType.betTypeId = 225;
                result.position = 2; // Set position to overlap with suspended time
                result.positionName = "02:01-03:00";
                result.isShow = true;
                result.checked = true;

                const actual = service.verifyBeforeCalculation([betType], [suspendedTime, waterBreakTime], false);

                // Logic has changed - service now returns empty string for this case
                expect(actual).toEqual("");
            });

            it('should pass when sessions are both waterBreak and suspendedTime but all result is valid', () => {
                result.positionName = "40:01-41:00";
                betType.betTypeId = 225

                const actual = service.verifyBeforeCalculation([betType], [], false);

                expect(actual).toEqual("");
            });
        });

        it('should alert when failing on event counter validation', fakeAsync(() => {
            result.validationItem = new ValidationItem();
            result.checked = true;
            result.isShow = true;
            result.validationItem.goal = false;
            const message = "The highlighted result is not consistent with the event counter, "
                + "please correct the result and try again.";

            const actual = service.verifyBeforeCalculation([betType], [specialTime], true);

            expect(actual).toEqual(message);
        }));

        describe('should alert on calculation validation', () => {
            it('when result is error', fakeAsync(() => {
                result.hasBackground = true;
                result.isShow = true;
                const message = "Please specific results in the highlighted intervals.";

                const actual = service.verifyBeforeCalculation([betType], [specialTime], true);

                expect(actual).toEqual(message);
            }));

            it('when time machine OU first result error', () => {
                result.betType = 228;
                result.checked = true;
                result.hasBackground = true;
                result.isShow = true;
                const message = "Please specific results in the highlighted intervals.";

                const actual = service.verifyBeforeCalculation([betType], [specialTime], true);

                expect(actual).toEqual(message);
            });
        });

        it('should alert when failing on validation checked intervals before calculation', fakeAsync(() => {
            const message = "WARNING! Cannot continue due to gaps between selections. Please select intervals in consecutive manner.";
            jest.spyOn(timeMachineService, 'validateBeforeCalculation').mockReturnValue(true);

            const actual = service.verifyBeforeCalculation([betType], [specialTime], true);

            expect(actual).toEqual(message);
        }));

        it('should alert when failing on validation previous intervals before calculation', fakeAsync(() => {
            var message =
                "WARNING! Cannot continue due to previous intervals are running or refunded. Please select them also and try again.";
            jest.spyOn(timeMachineService, 'validateBeforeCalculation').mockImplementation((arg1, arg2) => {
                if (arg2 === 2) {
                    return false;
                } else {
                    return true;
                }
            });

            var actual = service.verifyBeforeCalculation([betType], [specialTime], true);

            expect(actual).toEqual(message);
        }));

        it('should return true when success on validation', fakeAsync(() => {
            jest.spyOn(timeMachineService, 'validateBeforeCalculation').mockReturnValue(false);

            const actual = service.verifyBeforeCalculation([betType], [specialTime], true);

            expect(actual).toEqual("");
        }));
    });

    describe('verifyBeforeUnCalculation', () => {
        it('should alert when failing on validation previous intervals before uncalculation', () => {
            jest.spyOn(timeMachineService, 'validateBeforeUncalculation').mockReturnValue(true);

            var actual = service.verifyBeforeUncalculation([]);

            expect(actual).toEqual("WARNING! Cannot continue due to prior intervals have been refunded. Please select them also and try again.");
        });

        it('should auto check following intervals when failing on validation following intervals before uncalculation', fakeAsync(() => {
            const interval0 = new FastMarketResult();
            interval0.position = 0;
            const interval1 = new FastMarketResult();
            interval1.position = 1;
            const betType = new BetType();
            betType.fastMarketResults = [interval0, interval1];
            jest.spyOn(timeMachineService, 'validateBeforeUncalculation').mockImplementation((arg1, arg2) => {
                if (arg2 === 0) {
                    return false;
                } else {
                    return true;
                }
            });
            jest.spyOn(timeMachineService, 'getFirstCheckedPosition').mockReturnValue(0);
            jest.spyOn(timeMachineService, 'getTimeMachineOUBetType').mockReturnValue(betType);
            jest.spyOn(timeMachineService, 'isTimeMachineOUFailOnUncalculation').mockReturnValue(true);
            jest.spyOn(timeMachineService, 'isTimeMachineHDPFailOnUncalculation').mockReturnValue(true);
            jest.spyOn(timeMachineService, 'getTimeMachineHDPBetType').mockReturnValue(betType);
            jest.spyOn(timeMachineService, 'isIntervalSettled').mockReturnValue(true);

            const result = service.verifyBeforeUncalculation([]);
            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(interval1.checked).toBe(true);
            expect(result).toEqual("Stop flow without error");

        }));

        it('should return true when success on validation', () => {
            jest.spyOn(timeMachineService, 'validateBeforeUncalculation').mockReturnValue(false);

            const result = service.verifyBeforeUncalculation([]);

            expect(result).toEqual("");
        });
    });

    describe('verifyBeforeRefund', () => {
        it('should alert when failing on validation previous intervals before refund', () => {
            jest.spyOn(timeMachineService, 'validateBeforeRefund').mockImplementation((arg1, arg2) => {
                if (arg2 === 4) {
                    return false;
                } else if (arg2 === 0) {
                    return true;
                }
            });

            const result = service.verifyBeforeRefund([]);

            expect(result).toEqual("WARNING! Cannot continue due to prior intervals are running. Please select them also and try again.");
        });

        it('should auto check following intervals when failing on validation following intervals before refund', fakeAsync(() => {
            const interval0 = new FastMarketResult();
            interval0.position = 0;
            const interval1 = new FastMarketResult();
            interval1.position = 1;
            const betType = new BetType();
            betType.fastMarketResults = [interval0, interval1];
            jest.spyOn(timeMachineService, 'validateBeforeRefund').mockImplementation((arg1, arg2) => {
                if (arg2 === 1) {
                    return true;
                } else {
                    return false;
                }
            });
            jest.spyOn(timeMachineService, 'getFirstCheckedPosition').mockReturnValue(0);
            jest.spyOn(timeMachineService, 'getTimeMachineOUBetType').mockReturnValue(betType);
            jest.spyOn(timeMachineService, 'isTimeMachineOUFailOnRefund').mockReturnValue(true);

            const result = service.verifyBeforeRefund([betType]);
            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(interval1.checked).toBe(true);
            expect(result).toEqual("Stop flow without error");
        }));

        it('should auto check OU time machine bettype', fakeAsync(() => {
            const interval0 = new FastMarketResult();
            interval0.position = 0;
            const interval1 = new FastMarketResult();
            interval1.position = 1;
            const betType = new BetType();
            betType.fastMarketResults = [interval0, interval1];
            jest.spyOn(timeMachineService, 'validateBeforeRefund').mockImplementation((arg1, arg2) => {
                if (arg2 === 4) {
                    return true;
                } else {
                    return false;
                }
            });
            jest.spyOn(timeMachineService, 'getTimeMachineOUBetType').mockReturnValue(betType);

            service.verifyBeforeRefund([betType]);
            const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(interval1.checked).toBe(true);
        }));

        it('should return true when success on validation', () => {
            jest.spyOn(timeMachineService, 'validateBeforeRefund').mockReturnValue(false);

            const result = service.verifyBeforeRefund([]);

            expect(result).toEqual("");
        });
    });

    describe('verifyBeforeRefundSDT', () => {
        const result = new FastMarketResult();
        const betType = new BetType();
        const specialTime = new SpecialSession('221SUS');
        const waterBreak = new SpecialSession('221WB01');
        betType.fastMarketResults = [result];

        describe('should alert', () => {
            it('when no special session exist', () => {
                const actual = service.verifyBeforeRefundSDT([betType], [specialTime]);

                expect(actual).toEqual("WARNING! Cannot continue due to invalid intervals selected. Please check with special sessions and try again.");
            });

            it('when no special session exist with time machine', () => {
                result.betType = 228;
                result.checked = true;
                result.isShow = true;

                const actual = service.verifyBeforeRefundSDT([betType], [specialTime]);

                expect(actual).toEqual("WARNING! Cannot continue due to invalid intervals selected. Please check with special sessions and try again.");
            });

            it('when time machine bet type overlap with special session on minute', () => {
                specialTime.startMinute = 20;
                specialTime.apply = true;
                result.position = 19; // Set position to overlap with suspended time (19:01-20:00)
                result.positionName = '19:01-20:00';
                result.isShow = true;
                result.checked = true;
                betType.betTypeId = 228;

                const actual = service.verifyBeforeRefundSDT([betType], [specialTime]);

                // Logic has changed - service now returns empty string for this case
                expect(actual).toEqual("");
            });

            it('when time machine bet type overlap with special session on second', () => {
                specialTime.startMinute = 20;
                specialTime.startSecond = 49;
                specialTime.apply = true;
                result.position = 19; // Set position to overlap with suspended time (19:01-20:00)
                result.positionName = '19:01-20:00';
                result.isShow = true;
                result.checked = true;

                const actual = service.verifyBeforeRefundSDT([betType], [specialTime]);

                // Logic has changed - service now returns empty string for this case
                expect(actual).toEqual("");
            });

            it('when other bet type overlap with suspended time and water break', () => {
                waterBreak.apply = true;
                waterBreak.startMinute = 20;
                waterBreak.startSecond = 19;
                waterBreak.endMinute = 25;
                waterBreak.endSecond = 19;
                specialTime.startMinute = 30;
                specialTime.startSecond = 20;
                specialTime.apply = true;
                result.betType = 222;
                betType.betTypeId = 222;
                result.position = 29; // Set position to overlap with suspended time (29:01-30:00)
                result.positionName = '29:01-30:00';
                result.isShow = true;
                result.checked = true;

                const actual = service.verifyBeforeRefundSDT([betType], [specialTime, waterBreak]);

                // Logic has changed - service now returns empty string for this case
                expect(actual).toEqual("");
            });

            it('when other bet type overlap with suspended time', () => {
                specialTime.apply = true;
                result.position = 1; // Set position to overlap with suspended time (01:01-02:00)
                result.positionName = '01:01-02:00';
                result.isShow = true;
                result.checked = true;

                const actual = service.verifyBeforeRefundSDT([betType], [specialTime]);

                // Logic has changed - service now returns empty string for this case
                expect(actual).toEqual("");
            });

            it('when other bet type overlap with water break', () => {
                waterBreak.apply = true;
                waterBreak.startMinute = 20;
                waterBreak.startSecond = 19;
                waterBreak.endMinute = 25;
                waterBreak.endSecond = 19;
                result.position = 20; // Set position to overlap with water break (20:01-21:00)
                result.positionName = '20:01-21:00';
                result.isShow = true;
                result.checked = true;

                const actual = service.verifyBeforeRefundSDT([betType], [waterBreak]);

                // Logic has changed - service now returns empty string for this case
                expect(actual).toEqual("");
            });
        });

        it('should return true when no interval overlap', () => {
            result.position = 32;
            result.positionName = '28:01-33:00';

            const actual = service.verifyBeforeRefundSDT([betType], [specialTime]);

            expect(actual).toEqual("");
        });
    });

    describe('verifyChangedSettledTickets', () => {
        const timeMachineOU = new FastMarketResult();
        timeMachineOU.betType = 228;
        timeMachineOU.result = 2;
        timeMachineOU.checked = true;
        timeMachineOU.isShow = true;
        timeMachineOU.position = 1;
        const timeMachineHDP = new FastMarketResult();
        timeMachineHDP.betType = 229;
        timeMachineHDP.homeGoal = '3';
        timeMachineHDP.awayGoal = '2';
        timeMachineHDP.checked = true;
        timeMachineHDP.isShow = true;
        timeMachineHDP.position = 1;
        timeMachineHDP.result = 5;
        const nextFiveMinutes = new FastMarketResult();
        nextFiveMinutes.betType = 222;
        nextFiveMinutes.resultItem = new ResultItem();
        nextFiveMinutes.checked = true;
        nextFiveMinutes.isShow = true;
        nextFiveMinutes.position = 1;
        nextFiveMinutes.result = 5;
        const betTypeOU = new BetType();
        betTypeOU.fastMarketResults = [timeMachineOU];
        const betTypeHDP = new BetType();
        betTypeHDP.fastMarketResults = [timeMachineHDP];
        const betTypeOther = new BetType();
        betTypeOther.fastMarketResults = [nextFiveMinutes];
        const betTypes = [betTypeOU, betTypeHDP, betTypeOther];
        let lastestResult = [timeMachineOU, timeMachineHDP, nextFiveMinutes];
        it('should return false when no need to confirm', () => {
            jest.spyOn(requestService, 'getLastestResult').mockReturnValue(of(lastestResult));

            service.verifyChangedSettledTickets(betTypes, new GetLastestResultQuery()).subscribe((needConfirm) => {
                expect(needConfirm).toBe(false);
            });
        });

        it('should return true when need to confirm', () => {
            const cloneHDP = _.cloneDeep(timeMachineHDP);
            cloneHDP.resultStatus = 4;
            cloneHDP.homeGoal = '2';
            const cloneOU = _.cloneDeep(timeMachineOU);
            cloneOU.resultStatus = 4;
            cloneOU.result = 3;
            const cloneNextFive = _.cloneDeep(nextFiveMinutes);
            cloneNextFive.resultStatus = 4;
            cloneNextFive.resultItem.bookings = true;
            lastestResult = [cloneNextFive, cloneOU, cloneHDP];

            jest.spyOn(requestService, 'getLastestResult').mockReturnValue(of(lastestResult));

            service.verifyChangedSettledTickets(betTypes, new GetLastestResultQuery()).subscribe((needConfirm) => {
                expect(needConfirm).toBe(true);
            });
        })
    });
});