import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ElementRef } from "@angular/core";
import { ModalDialogComponent, ModalContentDialogComponent, MultipleSelectComponent, TreeViewComponent } from '../../shared/components';
import { BetTypesComponent } from './bet-types.component';
import {
    FastMarkets,
    EventCounter,
    TicketCount,
    BetType,
    Permission,
    FastMarketResult,
    ResultItem,
    EventResultItem,
    ValidationItem,
    SpecialSession,
    ResultDetail,
    IntervalEvent
 } from '../models';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { RequestService } from '../services/request.service';
import { FilterComponent } from './filter.component';
import { TicketStatusPipe, ResultStatusPipe, IntervalPipe, SpecialTimeEventCounterPipe, SpecialTimePipe } from '../pipes';
import { UrlHelper } from '../../helper';
import * as _ from 'lodash';
import { Language } from '../../shared/language.native';
import { ResultItemLabel } from '../models/result-item-label.model';
import { TimeMachineService, VerificationService } from '../services';
import { SpecialSessionComponent } from './special-session.component';
import { MaterialModule } from '../../shared/material-module';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('Component: BetTypesComponent', () => {
    let component: BetTypesComponent;
    let fixture: ComponentFixture<BetTypesComponent>;
    let requestService: RequestService;
    let messageBoxService: MessageBoxService;
    let verificationService: VerificationService;
    let timeMachineService: TimeMachineService;
    let toastrService: ToastrService;
    const eventCounter = new EventCounter();
    const betType = new BetType();
    betType.checked = false;
    betType.betTypeId = 221;
    const validationItem: ValidationItem = {
        none: false,
        goal: false,
        corner: false,
        freeKick: false,
        goalKick: false,
        throwIn: false,
        booking: false,
        penalty: false,
    };
    const none = new FastMarketResult();
    none.betType = 223;
    none.resultItem = new ResultItem();
    none.validationItem = validationItem;
    none.position = 0;
    const freeKick = new FastMarketResult();
    freeKick.betType = 223;
    freeKick.resultItem = new ResultItem();
    freeKick.validationItem = validationItem;
    freeKick.position = 0;
    const goalKick = new FastMarketResult();
    goalKick.betType = 223;
    goalKick.resultItem = new ResultItem();
    goalKick.validationItem = validationItem;
    goalKick.position = 0;
    const throwIn = new FastMarketResult();
    throwIn.betType = 223;
    throwIn.resultItem = new ResultItem();
    throwIn.validationItem = validationItem;
    throwIn.position = 0;
    const bookings = new FastMarketResult();
    bookings.betType = 223;
    bookings.resultItem = new ResultItem();
    bookings.validationItem = validationItem;
    bookings.position = 0;
    const penalty = new FastMarketResult();
    penalty.betType = 223;
    penalty.resultItem = new ResultItem();
    penalty.validationItem = validationItem;
    penalty.position = 0;
    const goal = new FastMarketResult();
    goal.betType = 223;
    goal.resultItem = new ResultItem();
    goal.validationItem = validationItem;
    goal.position = 0;
    const corner = new FastMarketResult();
    corner.betType = 223;
    corner.resultItem = new ResultItem();
    corner.validationItem = validationItem;
    corner.position = 0;
    none.resultItem.none = true;
    corner.resultItem.none = false;
    corner.resultItem.corner = true;
    freeKick.resultItem.none = false;
    freeKick.resultItem.freeKick = true;
    goalKick.resultItem.none = false;
    goalKick.resultItem.goalKick = true;
    throwIn.resultItem.none = false;
    throwIn.resultItem.throwIn = true;
    bookings.resultItem.none = false;
    bookings.resultItem.bookings = true;
    penalty.resultItem.none = false;
    penalty.resultItem.penalty = true;
    goal.resultItem.none = false;
    goal.resultItem.goal = true;
    betType.fastMarketResults = [none, goal, corner, freeKick, goalKick, throwIn, bookings, penalty];
    const resultDetail = new ResultDetail();
    const fastMarkets: FastMarkets = {
        matchId: 7000000,
        action: '',
        eventCounters: [eventCounter, eventCounter, eventCounter, eventCounter, eventCounter, eventCounter],
        ticketCount: new TicketCount(),
        eventCounterCollapsed: false,
        eventCounterChecked: false,
        eventCounterHided: false,
        betTypes: [betType],
        permission: new Permission(),
        resultDetail: [resultDetail]
    };

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

    const noMarkedTicket = {
        isExistMarkedTicket: false,
    };

    const existMarkedTicket = {
        isExistMarkedTicket: true,
    };

    class MockElementRef implements ElementRef {
        nativeElement = {};
      }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                BetTypesComponent,
                FilterComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
                SpecialSessionComponent,
                ResultStatusPipe,
                TicketStatusPipe,
                IntervalPipe,
                SpecialTimeEventCounterPipe,
                SpecialTimePipe,
                MultipleSelectComponent,
                TreeViewComponent,
            ],
            providers: [
                HttpRequestService,
                BlockUIService,
                RequestService,
                NgbModal,
                TimeMachineService,
                VerificationService,
                ToastrService,
                { provide: MessageBoxService, useClass: MessageBoxService },
                { provide: ElementRef, useValue: new MockElementRef()} ,
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
                ToastNoAnimationModule.forRoot(),
                ToastContainerModule,
                ToastrModule.forRoot()
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(BetTypesComponent);
                component = fixture.componentInstance;
                requestService = fixture.debugElement.injector.get(RequestService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                verificationService = fixture.debugElement.injector.get(VerificationService);
                timeMachineService = fixture.debugElement.injector.get(TimeMachineService);
                toastrService = fixture.debugElement.injector.get(ToastrService);
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('onCollapsedClick - should collapse bet type', () => {
        betType.collapsed = true;
        spyOn(toastrService, 'clear');

        component.onCollapsedClick(betType);

        expect(betType.collapsed).toBeFalsy();
        expect(toastrService.clear).toHaveBeenCalled();
    });

    describe('onCollapsedEventCounter', () => {
        it('should collapse when input false', () => {
            component.fastMarkets = fastMarkets;
            spyOn(toastrService, 'clear');

            component.onCollapsedEventCounter(false);

            expect(toastrService.clear).toHaveBeenCalled();
            expect(component.fastMarkets.eventCounterCollapsed).toBe(true);
        });

        it('should unCollapse when input true', () => {
            component.fastMarkets = fastMarkets;
            spyOn(toastrService, 'clear');

            component.onCollapsedEventCounter(true);

            expect(toastrService.clear).toHaveBeenCalled();
            expect(component.fastMarkets.eventCounterCollapsed).toBe(false);
        });
    });

    it('ngOnInit - should set components properties and radio result of fast market results', () => {
        const timeMachine = new BetType();
        const timeMachineResult = new FastMarketResult();
        timeMachineResult.resultStatus = 0;
        timeMachine.fastMarketResults = [timeMachineResult];
        spyOn(timeMachineService, 'isIntervalSettled').and.returnValue(true);
        spyOn(requestService, 'getFastMarketResult').and.returnValue(of(fastMarkets));
        spyOn(UrlHelper, 'getUrlParameter').and.returnValue(fastMarkets.matchId);
        spyOn(timeMachineService, 'getCorrespondingInterval').and.returnValue(new FastMarketResult());

        component.ngOnInit();
        none.radioResult = 0;
        goal.radioResult = 1;
        corner.radioResult = 2;
        freeKick.radioResult = 3;
        goalKick.radioResult = 4;
        throwIn.radioResult = 5;
        bookings.radioResult = 6;
        penalty.radioResult = 7;
        const expectedTooltip = "Over/Under value not found. Set default value to: Goal: 0.5; Corner: 0.5; "
        + "Free Kick: 1.5; Goal Kick: 0.5; Throw In: 2.5; Penalty: 0.5."
        + "\nPlease double check for these values before calculating!";

        expect(component.tooltipNextFiveMinutes).toEqual(expectedTooltip);
        expect(component.selectedTicketStatus).toEqual(["2", "3", "5"]);
        expect(component.modalDialogMessage.title).toEqual("Fast Markets confirmation box");
        expect(component.fastMarkets).toEqual(fastMarkets);
    });

    it('refresh - should set fastMarkets', () => {
        component.fastMarkets = fastMarkets;
        spyOn(requestService, 'getFastMarketResult').and.returnValue(of(fastMarkets));
        spyOn(timeMachineService, 'getCorrespondingInterval').and.returnValue(new FastMarketResult());

        component.refresh();

        expect(component.fastMarkets).toEqual(fastMarkets);
    });

    describe('calculateAction', () => {
        it('should calculate successfully and clear error message', fakeAsync(() => {
            const message = 'Are you sure you want to CALCULATE the selected result?';
            component.fastMarkets = fastMarkets;
            spyOn(requestService, 'doSubmitByAction').and.returnValue(of(successfulResult));
            spyOn(messageBoxService, 'closePopup');
            spyOn(verificationService, 'verifyBeforeCalculation').and.returnValue(true);
            spyOn(verificationService, 'verifyChangedSettledTickets').and.returnValue(of(true));
            spyOn(requestService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(toastrService, 'clear');

            component.calculateAction();
            tick();
            let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();
            component.calculateAction();
            buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.modalDialogMessage.message).toEqual(message);
            expect(toastrService.clear).toHaveBeenCalled();
            expect(messageBoxService.closePopup).toHaveBeenCalled();
        }));

        it('should calculate fail and return error message', fakeAsync(() => {
            component.fastMarkets = fastMarkets;
            spyOn(requestService, 'doSubmitByAction').and.returnValue(of(unSuccessfulResult));
            spyOn(verificationService, 'verifyBeforeCalculation').and.returnValue(true);
            spyOn(verificationService, 'verifyChangedSettledTickets').and.returnValue(of(false));
            spyOn(requestService, 'checkingStatus').and.returnValue(of(successfulResult));

            component.calculateAction();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.errorMessage).toEqual(errorMessage);
        }));
    });

    describe('uncalculate', () => {
        it('should success and clear error message', fakeAsync(() => {
            const uncalMessage = 'Are you sure you want to UNCALCULATE the selected result?';
            component.fastMarkets = fastMarkets;
            spyOn(requestService, 'doSubmitByAction').and.returnValue(of(successfulResult));
            spyOn(messageBoxService, 'closePopup');
            spyOn(verificationService, 'verifyBeforeUncalculation').and.returnValue(true);
            spyOn(toastrService, 'clear');

            component.unCalculateAction();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.modalDialogMessage.message).toEqual(uncalMessage);
            expect(toastrService.clear).toHaveBeenCalled();
            expect(messageBoxService.closePopup).toHaveBeenCalled();
        }));

        it('should fail and return error message', fakeAsync(() => {
            component.fastMarkets = fastMarkets;
            spyOn(requestService, 'doSubmitByAction').and.returnValue(of(unSuccessfulResult));
            spyOn(verificationService, 'verifyBeforeUncalculation').and.returnValue(true);

            component.unCalculateAction();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.errorMessage).toEqual(errorMessage);
        }));

        it('should set alert message when there is running result status', fakeAsync(() => {
            none.resultStatus = 0;
            none.checked = true;
            none.isShow = true;
            component.fastMarkets = fastMarkets;
            const uncalMessage = "WARNING! Please double check the results selected to Uncalculate. "
            + "Selected results with Result Status as 'Running' might be affected: "
            + "they will not be auto key-in or auto- settled any more.";
            spyOn(requestService, 'doSubmitByAction').and.returnValue(of(unSuccessfulResult));
            spyOn(verificationService, 'verifyBeforeUncalculation').and.returnValue(true);

            component.unCalculateAction();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.modalDialogMessage.message).toEqual(uncalMessage);
            expect(component.errorMessage).toEqual(errorMessage);
        }));
    });

    describe('refundAction', () => {
        it('should success and clear error message', fakeAsync(() => {
            const uncalMessage = 'Are you sure you want to REFUND the selected result?';
            component.fastMarkets = fastMarkets;
            spyOn(requestService, 'checkingMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(requestService, 'doSubmitByAction').and.returnValue(of(successfulResult));
            spyOn(messageBoxService, 'closePopup');
            spyOn(verificationService, 'verifyBeforeRefund').and.returnValue(true);
            spyOn(requestService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(toastrService, 'clear');

            component.refundAction();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.modalDialogMessage.message).toEqual(uncalMessage);
            expect(toastrService.clear).toHaveBeenCalled();
            expect(messageBoxService.closePopup).toHaveBeenCalled();
        }));

        it('should fail and return error message', fakeAsync(() => {
            component.fastMarkets = fastMarkets;
            spyOn(requestService, 'checkingMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(requestService, 'doSubmitByAction').and.returnValue(of(unSuccessfulResult));
            spyOn(verificationService, 'verifyBeforeRefund').and.returnValue(true);
            spyOn(requestService, 'checkingStatus').and.returnValue(of(successfulResult));

            component.refundAction();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.errorMessage).toEqual(errorMessage);
        }));

        it('should alert when there is marked ticket', fakeAsync(() => {
            component.fastMarkets = fastMarkets;
            spyOn(requestService, 'checkingMarkedTickets').and.returnValue(of(existMarkedTicket));
            spyOn(requestService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(toastrService, 'error');

            component.refundAction();
            tick();
            const expectedMessage = Language.MarkedTicket;

            expect(toastrService.error).toHaveBeenCalledWith(expectedMessage);
        }));
    });

    it('choiceNoneResult - should set false for all other fields', () => {
        const item = new FastMarketResult();
        item.resultItem = new ResultItem();
        item.resultItem.none = true;
        const expectedItem = new FastMarketResult();
        expectedItem.resultItem = new ResultItem();
        expectedItem.resultItem.none = true;
        expectedItem.resultItem.goal = false;
        expectedItem.resultItem.corner = false;
        expectedItem.resultItem.goalKick = false;
        expectedItem.resultItem.freeKick = false;
        expectedItem.resultItem.throwIn = false;
        expectedItem.resultItem.penalty = false;
        component.choiceNoneResult(item);

        expect(item.resultItem).toEqual(expectedItem.resultItem);
    });

    describe('choiceOtherResult', () => {
        it('shoud set true when no item with bet type 221 is selected', () => {
            const item = new FastMarketResult();
            item.resultItem = new ResultItem();
            item.betType = 221;
            component.choiceOtherResult(item);

            expect(item.resultItem.none).toBe(true);
        });

        it('shoud set true when no item with bet type 222 is selected', () => {
            const item = new FastMarketResult();
            item.resultItem = new ResultItem();
            item.betType = 222;
            component.choiceOtherResult(item);

            expect(item.resultItem.none).toBe(true);
        });

        it('shoud set true when no item with bet type 223 is selected', () => {
            const item = new FastMarketResult();
            item.resultItem = new ResultItem();
            item.betType = 223;
            component.choiceOtherResult(item);

            expect(item.resultItem.none).toBe(true);
        });

        it('should set false when an item with bet type 221 is checked', () => {
            const item = new FastMarketResult();
            item.resultItem = new ResultItem();
            item.betType = 221;
            item.resultItem.goal = true;
            component.choiceOtherResult(item);

            expect(item.resultItem.none).toBe(false);
        });

        it('should set false when an item with bet type 222 is checked', () => {
            const item = new FastMarketResult();
            item.resultItem = new ResultItem();
            item.betType = 222;
            item.resultItem.goal = true;
            component.choiceOtherResult(item);

            expect(item.resultItem.none).toBe(false);
        });

        it('should set false when an item with bet type 223 is checked', () => {
            const item = new FastMarketResult();
            item.resultItem = new ResultItem();
            item.betType = 223;
            item.resultItem.goal = true;
            component.choiceOtherResult(item);

            expect(item.resultItem.none).toBe(false);
        });
    });

    describe('ticketStatusBackground', () => {
        it('should return calculated background', () => {
            const result = component.ticketStatusBackground('Calculated');
            const expected = 'bg-calculated';

            expect(result).toEqual(expected);
        });

        it('should return marked background', () => {
            const result = component.ticketStatusBackground('Marked');
            const expected = 'bg-marked';

            expect(result).toEqual(expected);
        });

        it('should return empty background', () => {
            const result = component.ticketStatusBackground('');
            const expected = '';

            expect(result).toEqual(expected);
        });
    });

    describe('resultStatusEvent', () => {
        it('should set selectedResultStatus without running status', () => {
            const resultValue = ['4'];

            component.resultStatusEvent(resultValue);

            expect(component.selectedResultStatus).toEqual(resultValue);
        });

        it('should set selectedResultStatus with running status', () => {
            const resultValue = ['3'];

            component.resultStatusEvent(resultValue);
            const expected = ['3', '0', '1', '2'];

            expect(component.selectedResultStatus).toEqual(expected);
        });
    });

    it('ticketStatusEvent - should set selectedTicketStatus', () => {
        const ticketValue = ['0', '1'];

        component.ticketStatusEvent(ticketValue);

        expect(component.selectedTicketStatus).toEqual(ticketValue);
    });

    describe('intervalEvent', () => {
        it('eventCounterHided should be true', () => {
            component.fastMarkets = fastMarkets;
            const intervalValue = [1, 2, 3];

            component.intervalEvent(new IntervalEvent(intervalValue));

            expect(component.selectedInterval).toEqual(intervalValue);
            expect(component.fastMarkets.eventCounterHided).toBe(true);
        });

        it('eventCounterHided should be false', () => {
            component.fastMarkets = fastMarkets;
            const intervalValue = [];

            component.intervalEvent(new IntervalEvent(intervalValue, true));

            expect(component.fastMarkets.eventCounterHided).toBe(false);
        });
    });

    describe('ngDoCheck', () => {
        it('should set false for eventCounterChecked', () => {
            eventCounter.eventResultItem = new EventResultItem();
            eventCounter.checked = false;
            component.fastMarkets = fastMarkets;

            component.ngDoCheck();

            expect(component.fastMarkets).toBe(fastMarkets);
        });

        it('should update radio result', () => {
            eventCounter.eventResultItem = new EventResultItem();
            eventCounter.checked = true;
            goal.resultStatus = 5;
            betType.betTypeId = 223;
            betType.fastMarketResults.forEach((x) => {
                x.checked = true;
                x.isShow = true;
            });
            component.fastMarkets = fastMarkets;
            component.disabledUnCalculate = true;

            component.ngDoCheck();

            expect(component.fastMarkets).toEqual(fastMarkets);
            expect(component.disabledCalculate).toBe(false);
            expect(component.disabledUnCalculate).toBe(false);
        });

        it('should update next five minutes validation item', () => {
            betType.betTypeId = 222;
            betType.resultName = new ResultItemLabel();
            betType.resultName.goal = '1';
            eventCounter.eventResultItem.goal = '2';
            goal.position = 1;
            goal.resultItem.goal = true;
            goal.validationItem.goal = true;
            component.fastMarkets = fastMarkets;

            component.ngDoCheck();

            expect(component.fastMarkets).toEqual(fastMarkets);
        });

        it('should update time machine bet type validation', () => {
            betType.betTypeId = 228;
            none.checked = true;
            none.isShow = true;
            none.betType = 228;
            component.fastMarkets = fastMarkets;

            component.ngDoCheck();

            expect(none.hasBackground).toBe(true);
        });
    });

    describe('onEventCounterCheckedChange', () => {
        it('should set value correctly when check on next one minute bet type', () => {
            betType.betTypeId = 221;
            eventCounter.checked = true;
            eventCounter.isShow = true;
            eventCounter.position = 4;
            corner.position = 2;
            freeKick.position = 3;
            goalKick.position = 4;
            throwIn.position = 5;
            bookings.position = 6;
            penalty.position = 7;
            none.relatedEventCounter = true;
            none.isShow = false;
            none.checked = true;
            betType.checked = true;
            component.fastMarkets = fastMarkets;

            component.onEventCounterCheckedChange(eventCounter, true);

            expect(component.fastMarkets).toEqual(fastMarkets);
        });

        it('should set value correctly when check on next five minute bet type', () => {
            betType.betTypeId = 222;
            none.isShow = false;
            none.checked = true;
            component.fastMarkets = fastMarkets;

            component.onEventCounterCheckedChange(eventCounter, true);

            expect(component.fastMarkets).toEqual(fastMarkets);
        });

        it('should set value correctly when uncheck on next five minute bet type', () => {
            betType.betTypeId = 222;
            none.isShow = false;
            none.checked = false;
            eventCounter.checked = false;
            component.fastMarkets = fastMarkets;

            component.onEventCounterCheckedChange(eventCounter, true);
            eventCounter.checked = true;

            expect(component.fastMarkets).toEqual(fastMarkets);
        });

        it('should set value correctly when check on other bet type', () => {
            betType.betTypeId = 223;
            none.isShow = false;
            none.checked = true;
            component.fastMarkets = fastMarkets;

            component.onEventCounterCheckedChange(eventCounter, true);

            expect(component.fastMarkets).toEqual(fastMarkets);
        });

        it('should do nothing when no corresponding fast market result', () => {
            betType.betTypeId = 221;
            eventCounter.position = 999;
            component.fastMarkets = fastMarkets;

            component.onEventCounterCheckedChange(eventCounter, true);

            expect(component.fastMarkets).toEqual(fastMarkets);
        })
    });

    describe('onBetTypeCheckedChange', () => {
        it('should check event counter when change one minute bet type', () => {
            none.betType = 221;
            none.checked = true;
            betType.betTypeId = 221;
            component.fastMarkets = fastMarkets;

            component.onBetTypeCheckedChange(none, 1);

            expect(component.fastMarkets).toEqual(fastMarkets);
        });

        it('should uncheck event counter when change one minute bet type', () => {
            none.betType = 221;
            none.checked = false;
            betType.betTypeId = 221;
            component.fastMarkets = fastMarkets;

            component.onBetTypeCheckedChange(none, 1);

            expect(component.fastMarkets).toEqual(fastMarkets);
        });

        it('should check event counter when change five minute bet type', () => {
            const expectedResult = [0];
            none.betType = 222;
            none.checked = true;
            none.relatedEventCounter = true;
            betType.betTypeId = 222;
            component.fastMarkets = fastMarkets;

            component.onBetTypeCheckedChange(none, 0);

            expect(component.selectedPositions.length).toEqual(expectedResult.length);
            expect(component.fastMarkets).toEqual(fastMarkets);
        });

        it('should uncheck event counter when change five minute bet type', () => {
            none.betType = 222;
            none.checked = false;
            betType.betTypeId = 222;
            component.fastMarkets = fastMarkets;

            component.onBetTypeCheckedChange(none, 0);

            expect(component.fastMarkets).toEqual(fastMarkets);
        });
    });

    it('onChangeBetType - should set value correctly', () => {
        betType.betTypeId = 221;
        eventCounter.position = 0;
        component.fastMarkets = fastMarkets;

        component.onChangeBetType(betType);

        expect(component.fastMarkets).toEqual(fastMarkets);
    });

    it('onChangeEventCounter - should check all even counters', () => {
        fastMarkets.eventCounterHided = false;
        fastMarkets.eventCounterChecked = true;
        eventCounter.isShow = true;
        component.fastMarkets = fastMarkets;

        component.onChangeEventCounter();

        expect(component.fastMarkets).toEqual(fastMarkets);
    });

    it('onChangeProceed - should set value correctly', () => {
        component.fastMarkets = fastMarkets;

        component.onChangeProceed(true);

        expect(component.fastMarkets).toEqual(fastMarkets);
    });

    it('filterAndSelectWaterBreak - should set water break time and refund determine check box', () => {
        const specialTime = new SpecialSession('1234');
        specialTime.apply = true;
        specialTime.startMinute = 3;
        specialTime.endMinute = 4;

        component.filterAndSelectWaterBreak(specialTime);

        expect(component.specialTimeFilter).toEqual(specialTime);
        expect(component.isRefundWithSettleDetermined).toBe(true);
    });
});