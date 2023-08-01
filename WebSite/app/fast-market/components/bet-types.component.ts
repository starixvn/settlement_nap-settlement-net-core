import { Component, OnInit, DoCheck, ViewChild, Input } from "@angular/core";
import * as _ from "lodash";
import {
  RequestService,
  TimeMachineService,
  VerificationService,
} from "../services";
import { MessageBoxService, ClosePopupService } from "../../shared/services";
import { ModalDialogMessage } from "../../shared/models";
import { UrlHelper } from "../../helper";
import { Language as SharedLanguage } from "../../shared/language.native";
import {
  FastMarkets,
  BetType,
  FastMarketResult,
  ResultItem,
  Result,
  EventResultItem,
  EventCounter,
  ValidationItem,
  MarkedTickets,
  SettleQuery,
  CheckingMarkedTicketsQuery,
  SpecialSession,
  IntervalEvent,
  GetLastestResultQuery,
  TimeMachineResult,
} from "../models";
import {
  Language,
  FastMarketBetType,
  ResultStatus,
  ResultType,
  ControlType,
  SessionId,
  ErrorMessage,
} from "../constants";
import { MatDialog } from "@angular/material/dialog";
import { InputScoreFormComponent } from "./input-score-form.component";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";

@Component({
  selector: "bet-types",
  templateUrl: "./bet-types.component.html",
  providers: [TimeMachineService, VerificationService],
})
export class BetTypesComponent implements OnInit, DoCheck {
  @Input() toastContainer: ToastContainerDirective;
  public fastMarkets: FastMarkets;
  public checkedProceed: boolean;
  public disabledCalculate = true;
  public disabledUnCalculate = true;
  public isReSettledTickets: boolean;
  public errorMessage: string;
  public selectedResultStatus: string[];
  public selectedTicketStatus: string[];
  public selectedInterval: number[];
  public selectedPositions: number[];
  public specialSessionPositions: number[];
  public specialTimeFilter: SpecialSession = new SpecialSession("");
  public isShowRefundButton: boolean;
  public isRefundWithSettleDetermined: boolean;
  public readonly resultType = ResultType;
  public readonly fastMarketBetType = FastMarketBetType;
  public readonly modalDialogMessage = new ModalDialogMessage();
  public tooltipNextFiveMinutes = Language.tooltipNextFiveMinutes;
  public readonly positionStep = 4;
  public existingSpecialSessions: SpecialSession[];
  public matchId: number;

  constructor(
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly timeMachineService: TimeMachineService,
    private readonly verificationService: VerificationService,
    private readonly matDialog: MatDialog,
    private readonly toastrService: ToastrService
  ) {}

  public ngOnInit() {
    this.selectedTicketStatus = ["2", "3", "5"];
    this.modalDialogMessage.title = Language.confirmationBoxTitle;
    this.matchId = Number(UrlHelper.getUrlParameter("matchId"));
    this.getFastMarketResult(this.matchId);
    this.toastrService.overlayContainer = this.toastContainer;
  }

  public ngDoCheck() {
    if (!_.isNil(this.fastMarkets)) {
      this.doCheckOnInterval();
      this.doCheckOnBetType();
    }
  }

  public refresh() {
    this.getFastMarketResult(this.fastMarkets.matchId);
    this.specialTimeFilter = new SpecialSession("");
    this.isRefundWithSettleDetermined = false;
  }

  public calculateAction() {
    this.toastrService.clear();
    this.requestService
      .checkingStatus(this.fastMarkets.matchId, "CAL", false)
      .subscribe((result: Result) => {
        if (!result.isSuccessful) {
          this.toastrService.error(result.errMsg);
        } else {
          this.doCalculate();
        }
      });
  }

  private doCalculate() {
    const errorMessage = this.verificationService.verifyBeforeCalculation(
      this.fastMarkets.betTypes,
      this.existingSpecialSessions
    );
    if (_.isEmpty(errorMessage)) {
      this.confirmChangedResults();
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  public unCalculateAction() {
    this.toastrService.clear();
    const errorMessage = this.verificationService.verifyBeforeUncalculation(
      this.fastMarkets.betTypes
    );
    if (_.isEmpty(errorMessage)) {
      let uncalMessage =
        "Are you sure you want to UNCALCULATE the selected result?";
      if (this.hasRunningResultStatus()) {
        uncalMessage =
          "WARNING! Please double check the results selected to Uncalculate. ";
        uncalMessage +=
          "Selected results with Result Status as 'Running' might be affected: ";
        uncalMessage +=
          "they will not be auto key-in or auto- settled any more.";
      }

      this.modalDialogMessage.message = uncalMessage;
      this.messageBoxService.confirm(this.modalDialogMessage, () =>
        this.doSubmitByAction("UNDO")
      );
    } else if (!_.isEqual(errorMessage, ErrorMessage.notShowAlert)) {
      this.toastrService.error(errorMessage);
    }
  }

  public refundAction() {
    this.toastrService.clear();
    this.requestService
      .checkingStatus(
        this.fastMarkets.matchId,
        "REFUND",
        this.isRefundWithSettleDetermined
      )
      .subscribe((result: Result) => {
        if (!result.isSuccessful) {
          this.toastrService.error(result.errMsg);
        } else {
          this.doRefund();
        }
      });
  }

  private doRefund() {
    if (this.isRefundWithSettleDetermined) {
      const errorMessage =
        this.verificationService.verifyBeforeRefundSDT(
          this.fastMarkets.betTypes,
          this.existingSpecialSessions
        ) &&
        this.verificationService.verifyBeforeRefund(
          this.fastMarkets.betTypes,
          true
        );
      if (_.isEmpty(errorMessage)) {
        this.modalDialogMessage.message =
          "You chose to Refund with settle determined tickets from selected intervals. Are you sure you want to proceed?";
        this.messageBoxService.confirm(this.modalDialogMessage, () => {
          const errorMessage = this.verificationService.verifyBeforeCalculation(
            this.fastMarkets.betTypes,
            this.existingSpecialSessions,
            true
          );
          if (_.isEmpty(errorMessage)) {
            this.pushRefundQuery();
          } else {
            this.toastrService.error(errorMessage);
          }
        });
      } else if (!_.isEqual(errorMessage, ErrorMessage.notShowAlert)) {
        this.toastrService.error(errorMessage);
      }
    } else {
      const errorMessage = this.verificationService.verifyBeforeRefund(
        this.fastMarkets.betTypes
      );
      if (_.isEmpty(errorMessage)) {
        this.pushRefundQuery();
      } else if (!_.isEqual(errorMessage, ErrorMessage.notShowAlert)) {
        this.toastrService.error(errorMessage);
      }
    }
  }

  private pushRefundQuery() {
    const query = new CheckingMarkedTicketsQuery(
      this.fastMarkets.matchId,
      this.fastMarkets.betTypes
    );

    this.requestService
      .checkingMarkedTickets(query)
      .subscribe((markedTickets: MarkedTickets) => {
        if (markedTickets.isExistMarkedTicket) {
          this.toastrService.error(SharedLanguage.MarkedTicket);
        } else {
          this.modalDialogMessage.message =
            "Are you sure you want to REFUND the selected result?";
          this.messageBoxService.confirm(this.modalDialogMessage, () =>
            this.doSubmitByAction("REFUND")
          );
        }
      });
  }

  public onEventCounterCheckedChange(
    event: EventCounter,
    directlyClick: boolean
  ) {
    for (const betType of this.fastMarkets.betTypes) {
      switch (betType.betTypeId) {
        case FastMarketBetType.nextOneMinute:
          this.handleNextOneMinuteChecked(betType, directlyClick);
          const result = this.findFastMarketResult(betType, event.position);
          if (result) {
            result.checked = event.checked;
          }
          break;

        case FastMarketBetType.nextFiveMinutes:
          this.handleNextFiveMinutesUnChecked(betType, event);
          this.handleNextFiveMinutesChecked(betType, directlyClick);
          break;
        default:
          this.handleOtherBetTypeChecked(betType);
          break;
      }

      betType.checked = event.checked;
    }

    this.handleIntervalSelection();
  }

  private findFastMarketResult(
    betType: BetType,
    position: number
  ): FastMarketResult {
    for (const result of betType.fastMarketResults) {
      if (result.position === position) {
        return result;
      }
    }

    return null;
  }

  private handleNextFiveMinutesUnChecked(
    betType: BetType,
    event: EventCounter
  ) {
    if (!event.checked) {
      const checkedPositions: number[] = [];
      const startPosition = Math.max(event.position - this.positionStep, 0);
      const endPosition = event.position;
      for (let i = startPosition; i <= endPosition; i++) {
        const result = this.findFastMarketResult(betType, i);
        if (result && checkedPositions.indexOf(i) === -1) {
          checkedPositions.push(i);
        }
      }

      const intervalsByPositions = betType.fastMarketResults.filter(
        (item) => checkedPositions.indexOf(item.position) !== -1
      );
      intervalsByPositions.forEach((item) => {
        item.checked = false;
        item.relatedEventCounter = false;
      });
    }
  }

  private listCheckedPositions(betType: BetType) {
    const eventCounterCheckedItems = this.fastMarkets.eventCounters.filter(
      (item) => item.checked && item.isShow
    );
    const checkedPositions: number[] = [];
    eventCounterCheckedItems.forEach((item) => {
      const startPosition = Math.max(item.position - this.positionStep, 0);
      const endPosition = item.position;
      for (let i = startPosition; i <= endPosition; i++) {
        const result = this.findFastMarketResult(betType, i);
        if (result && checkedPositions.indexOf(i) === -1) {
          checkedPositions.push(i);
        }
      }
    });

    return checkedPositions;
  }

  private handleNextFiveMinutesChecked(
    betType: BetType,
    directlyClick: boolean
  ) {
    const checkedPositions = this.listCheckedPositions(betType);
    const intervalsByPositions = betType.fastMarketResults.filter(
      (item) => checkedPositions.indexOf(item.position) !== -1
    );
    intervalsByPositions.forEach((item) => {
      item.checked = true;
      item.relatedEventCounter = directlyClick;
    });

    const intervalsEventCounterByPos = this.fastMarkets.eventCounters.filter(
      (item) => checkedPositions.indexOf(item.position) !== -1 && !item.isShow
    );
    intervalsEventCounterByPos.forEach((item) => {
      item.checked = false;
    });
  }

  private handleNextOneMinuteChecked(betType: BetType, directlyClick: boolean) {
    const checkedPositions = this.listCheckedPositions(betType);

    if (betType.betTypeId === FastMarketBetType.nextOneMinute) {
      const intervalsByPositionsOfNextOneMinute = betType.fastMarketResults.filter(
        (item) => checkedPositions.indexOf(item.position) !== -1
      );

      intervalsByPositionsOfNextOneMinute.forEach((item) => {
        item.relatedEventCounter = directlyClick;
      });
    }

    const intervalsByPositions = betType.fastMarketResults.filter(
      (item) =>
        checkedPositions.indexOf(item.position) !== -1 &&
        !item.isShow &&
        item.checked
    );
    intervalsByPositions.forEach((item) => {
      item.checked = false;
    });
  }

  private handleOtherBetTypeChecked(betType: BetType) {
    const checkedPositions = this.listCheckedPositions(betType);

    const intervalsByPositions = betType.fastMarketResults.filter(
      (item) =>
        checkedPositions.indexOf(item.position) !== -1 &&
        !item.isShow &&
        item.checked
    );
    intervalsByPositions.forEach((item) => {
      item.checked = false;
    });
  }

  public onBetTypeCheckedChange(item: FastMarketResult, totalItems: number) {
    switch (item.betType) {
      case FastMarketBetType.nextOneMinute:
        this.handleEventCounterCheckbox(item.position);
        break;
      case FastMarketBetType.nextFiveMinutes:
        const startPosition = item.position;
        const endPosition = Math.min(
          item.position + this.positionStep,
          totalItems
        );
        for (let i = startPosition; i <= endPosition; i++) {
          this.handleEventCounterCheckbox(i);
        }
        this.handleIntervalSelection();
        break;
    }
  }

  private handleEventCounterCheckbox(position: number) {
    const items: FastMarketResult[] = [];
    for (const betType of this.fastMarkets.betTypes) {
      switch (betType.betTypeId) {
        case FastMarketBetType.nextOneMinute:
          const result = this.findFastMarketResult(betType, position);
          if (result) {
            items.push(result);
          }
          break;
        case FastMarketBetType.nextFiveMinutes:
          const startPosition = Math.max(position - this.positionStep, 0);
          const endPosition = position;
          for (let i = startPosition; i <= endPosition; i++) {
            const resultNext = this.findFastMarketResult(betType, i);
            if (result) {
              items.push(resultNext);
            }
          }
          break;
      }
    }

    const checkedItems = items.filter((item) => item.checked);
    if (checkedItems.length === 0) {
      this.fastMarkets.eventCounters[position].checked = false;
    } else if (items.length === checkedItems.length) {
      this.fastMarkets.eventCounters[position].checked = true;
    }
  }

  private handleIntervalSelection() {
    const selectedPositions = [];
    this.fastMarkets.betTypes.forEach((betType) => {
      betType.fastMarketResults.forEach((result) => {
        if (
          result.relatedEventCounter &&
          selectedPositions.indexOf(result.position) === -1
        ) {
          selectedPositions.push(result.position);
        }
      });
    });

    this.selectedPositions = selectedPositions;
  }

  public onCollapsedClick(betType: BetType) {
    this.toastrService.clear();
    betType.collapsed = !betType.collapsed;
  }

  public onCollapsedEventCounter(collapsed: boolean) {
    this.toastrService.clear();
    this.fastMarkets.eventCounterCollapsed = !collapsed;
  }

  public onChangeBetType(betType: BetType) {
    this.fastMatketsSelection(betType, betType.checked);
    if (
      betType.betTypeId === FastMarketBetType.nextOneMinute ||
      betType.betTypeId === FastMarketBetType.nextFiveMinutes
    ) {
      this.fastMarkets.eventCounters.forEach((eventCounter) => {
        this.handleEventCounterCheckbox(eventCounter.position);
      });
    }
  }

  public onChangeEventCounter() {
    if (!this.fastMarkets.eventCounterHided) {
      const eventCounters = this.fastMarkets.eventCounters.filter(
        (x: EventCounter) => x.isShow
      );
      const isChecked = this.fastMarkets.eventCounterChecked;
      if (!_.isNil(eventCounters)) {
        for (const item of eventCounters) {
          item.checked = isChecked;
          this.onEventCounterCheckedChange(item, false);
        }
      }
    }
  }

  public onChangeProceed(checked: boolean) {
    this.toastrService.clear();
    this.fastMarkets.eventCounterChecked = checked;
    this.onChangeEventCounter();
    for (const betType of this.fastMarkets.betTypes) {
      betType.checked = checked;
      this.fastMatketsSelection(betType, checked);
    }
  }

  public choiceNoneResult(item: FastMarketResult) {
    if (item.resultItem.none) {
      item.resultItem.goal = false;
      item.resultItem.corner = false;
      item.resultItem.freeKick = false;
      item.resultItem.goalKick = false;
      item.resultItem.throwIn = false;
      item.resultItem.penalty = false;
    }
  }

  public choiceOtherResult(item: FastMarketResult) {
    item.resultItem.none = !this.hasChoiceResult(item.betType, item.resultItem);
  }

  public resultStatusEvent(resultValue: string[]) {
    this.selectedResultStatus = resultValue;
    if (_.indexOf(resultValue, _.toString(ResultStatus.threeRunning)) >= 0) {
      const runningStatus = [
        _.toString(ResultStatus.zeroRunning),
        _.toString(ResultStatus.oneRunning),
        _.toString(ResultStatus.twoRunning),
      ];
      this.selectedResultStatus = resultValue.concat(runningStatus);
    }
  }

  public ticketStatusEvent(ticketValue: string[]) {
    this.selectedTicketStatus = ticketValue;
  }

  public intervalEvent(event: IntervalEvent) {
    const maxInterval = 90;
    this.selectedInterval = event.list;
    if (!this.fastMarkets) {
      return;
    }
    this.fastMarkets.eventCounterHided =
      event.list.length < maxInterval && event.list.length > 0;

    if (event.emitFromSelection) {
      this.specialTimeFilter = new SpecialSession("");
      this.specialSessionPositions = event.list;
    }
  }

  private confirmChangedResults() {
    if (this.isReSettledTickets) {
      this.confirmCalculation();
    } else {
      const getLastestResultQuery: GetLastestResultQuery = {
        matchId: this.fastMarkets.matchId,
      };
      this.verificationService
        .verifyChangedSettledTickets(
          this.fastMarkets.betTypes,
          getLastestResultQuery
        )
        .subscribe((needConfirm: boolean) => {
          if (needConfirm) {
            this.modalDialogMessage.title = Language.confirmationBoxTitle;
            this.modalDialogMessage.message = Language.recalculateNotification;
            this.messageBoxService.confirm(this.modalDialogMessage, () => {
              this.isReSettledTickets = true;
            });
          } else {
            this.confirmCalculation();
          }
        });
    }
  }

  private confirmCalculation() {
    this.modalDialogMessage.message =
      "Are you sure you want to CALCULATE the selected result?";
    this.messageBoxService.confirm(this.modalDialogMessage, () =>
      this.doSubmitByAction("CAL")
    );
  }

  private doSubmitByAction(action: string) {
    const query = new SettleQuery(
      this.fastMarkets.eventCounters,
      this.fastMarkets.betTypes,
      this.fastMarkets.matchId,
      action,
      this.isReSettledTickets
    );

    if (_.isEqual(action, "REFUND")) {
      query.isSettleDetermined = this.isRefundWithSettleDetermined;
    }

    if (_.isEqual(action, "CAL")) {
      query.betTypes = this.getTimeMachineHomeAwayResult(query.betTypes);
    }

    this.requestService.doSubmitByAction(query).subscribe((result: Result) => {
      if (result.isSuccessful) {
        this.messageBoxService.closePopup();
      } else {
        this.errorMessage = result.errMsg;
      }
    });
  }

  private showOrHideButton(item: FastMarketResult) {
    const resultStatus = [
      ResultStatus.completedAuto,
      ResultStatus.completedManual,
      ResultStatus.refund,
      ResultStatus.refundWithDetermined,
    ];

    this.disabledCalculate = false;

    if (
      this.disabledUnCalculate &&
      resultStatus.indexOf(item.resultStatus) >= 0
    ) {
      this.disabledUnCalculate = false;
    }
  }

  private manipulateResultRadio() {
    for (const betType of this.fastMarkets.betTypes) {
      for (const item of betType.fastMarketResults) {
        if (this.isRadioResult(item)) {
          this.selectedResult(item);
        }
      }
    }
  }

  private selectedResult(item: FastMarketResult) {
    if (item.resultItem.none) {
      item.radioResult = this.resultType.none;
    } else if (item.resultItem.goal) {
      item.radioResult = this.resultType.goals;
    } else if (item.resultItem.corner) {
      item.radioResult = this.resultType.corners;
    } else if (item.resultItem.freeKick) {
      item.radioResult = this.resultType.freeKick;
    } else if (item.resultItem.goalKick) {
      item.radioResult = this.resultType.goalKick;
    } else if (item.resultItem.throwIn) {
      item.radioResult = this.resultType.throwIn;
    } else if (item.resultItem.bookings) {
      item.radioResult = this.resultType.bookings;
    } else if (item.resultItem.penalty) {
      item.radioResult = this.resultType.penalty;
    }
  }
  private updateRadioResult(item: FastMarketResult) {
    if (this.isRadioResult(item)) {
      item.resultItem.none = false;
      item.resultItem.goal = false;
      item.resultItem.corner = false;
      item.resultItem.freeKick = false;
      item.resultItem.goalKick = false;
      item.resultItem.throwIn = false;
      item.resultItem.bookings = false;
      item.resultItem.penalty = false;

      if (item.radioResult === this.resultType.none) {
        item.resultItem.none = true;
      } else if (item.radioResult === this.resultType.goals) {
        item.resultItem.goal = true;
      } else if (item.radioResult === this.resultType.corners) {
        item.resultItem.corner = true;
      } else if (item.radioResult === this.resultType.freeKick) {
        item.resultItem.freeKick = true;
      } else if (item.radioResult === this.resultType.goalKick) {
        item.resultItem.goalKick = true;
      } else if (item.radioResult === this.resultType.throwIn) {
        item.resultItem.throwIn = true;
      } else if (item.radioResult === this.resultType.bookings) {
        item.resultItem.bookings = true;
      } else if (item.radioResult === this.resultType.penalty) {
        item.resultItem.penalty = true;
      }
    }
  }

  private isRadioResult(item: FastMarketResult) {
    return ControlType.radio.indexOf(item.betType) >= 0;
  }

  private hasChoiceResult(
    betType: number,
    resultItem: ResultItem,
    result?: number,
    homeGoal = "",
    awayGoal = ""
  ) {
    if (betType === FastMarketBetType.nextOneMinute) {
      return this.hasChoiceResultOfNextOneMinute(resultItem);
    } else if (betType === FastMarketBetType.nextFiveMinutes) {
      return this.hasChoiceResultOfNextFiveMinutes(resultItem);
    } else if (betType === FastMarketBetType.timeMachineOverUnder) {
      return !_.isNil(result);
    } else if (betType === FastMarketBetType.timeMachineHDP) {
      return (
        !_.isNil(homeGoal) &&
        !_.isEqual(homeGoal, "") &&
        !_.isNil(awayGoal) &&
        !_.isEqual(awayGoal, "")
      );
    } else {
      return this.hasChoiceResultOfOther(resultItem);
    }
  }

  private hasChoiceResultOfNextOneMinute(resultItem: ResultItem) {
    return (
      resultItem.none ||
      resultItem.goal ||
      resultItem.corner ||
      resultItem.freeKick ||
      resultItem.goalKick ||
      resultItem.throwIn
    );
  }

  private hasChoiceResultOfNextFiveMinutes(resultItem: ResultItem) {
    return (
      resultItem.none ||
      resultItem.goal ||
      resultItem.corner ||
      resultItem.freeKick ||
      resultItem.goalKick ||
      resultItem.throwIn ||
      resultItem.penalty
    );
  }

  private hasChoiceResultOfOther(resultItem: ResultItem) {
    return (
      resultItem.none ||
      resultItem.goal ||
      resultItem.corner ||
      resultItem.freeKick ||
      resultItem.goalKick ||
      resultItem.throwIn ||
      resultItem.bookings ||
      resultItem.penalty
    );
  }

  private doCheckOnInterval() {
    this.disabledCalculate = this.disabledUnCalculate = true;

    let isCheckedEventCounter = true;

    this.fastMarkets.eventCounters.forEach((item) => {
      const resultItem = item.eventResultItem;
      item.hasBackground =
        !this.isValidValue(resultItem.goal) ||
        !this.isValidValue(resultItem.corner) ||
        !this.isValidValue(resultItem.freeKick) ||
        !this.isValidValue(resultItem.goalKick) ||
        !this.isValidValue(resultItem.throwIn) ||
        !this.isValidValue(resultItem.penalty);

      if (!item.checked) {
        isCheckedEventCounter = false;
      }
    });

    this.fastMarkets.eventCounterChecked = isCheckedEventCounter;

    for (const betType of this.fastMarkets.betTypes) {
      let checkedBetType = true;
      for (const item of betType.fastMarketResults) {
        if (!item.checked) {
          checkedBetType = false;
          item.hasBackground = false;
        } else if (item.isShow) {
          this.updateRadioResult(item);
          this.showOrHideButton(item);
          item.hasBackground = !this.hasChoiceResult(
            item.betType,
            item.resultItem,
            item.result,
            item.homeGoal,
            item.awayGoal
          );
        }

        item.relatedEventCounter = false;
      }

      betType.checked = checkedBetType;
      if (
        this.fastMarkets.eventCounters.length > 0 &&
        (betType.betTypeId === FastMarketBetType.nextOneMinute ||
          betType.betTypeId === FastMarketBetType.nextFiveMinutes)
      ) {
        this.doCheckValidation(betType);
      }
    }
  }

  private isValidValue(value: string) {
    return !_.isNil(value) && value !== "";
  }

  private doCheckValidation(betType: BetType) {
    betType.fastMarketResults.forEach((item) => {
      item.validationItem = this.generateValidationItem(betType, item);
    });
  }

  private generateValidationItem(
    betType: BetType,
    item: FastMarketResult
  ): ValidationItem {
    const validationItem = {};
    let eventResultItem: EventResultItem;
    let value: string;
    let checked: boolean;

    for (const propertyName in item.resultItem) {
      if (propertyName !== "") {
        switch (betType.betTypeId) {
          case FastMarketBetType.nextOneMinute:
            eventResultItem = this.fastMarkets.eventCounters[item.position]
              .eventResultItem;
            value = eventResultItem[propertyName];
            checked = item.resultItem[propertyName];
            validationItem[
              propertyName
            ] = this.validNextOneMinuteResultWithEventCounter(value, checked);
            break;
          case FastMarketBetType.nextFiveMinutes:
            const startPosition = item.position;
            const endPosition = Math.min(
              item.position + this.positionStep,
              this.fastMarkets.eventCounters.length
            );
            let total = 0;
            let isValid = true;
            for (let i = startPosition; i <= endPosition; i++) {
              eventResultItem = this.fastMarkets.eventCounters[i]
                .eventResultItem;
              value = eventResultItem[propertyName];
              if (!this.isValidValue(value)) {
                isValid = false;
                break;
              }

              total += Number(value);
            }

            checked = item.resultItem[propertyName];
            validationItem[
              propertyName
            ] = this.validNextFiveMinutesResultWithEventCounter(
              isValid,
              betType.resultName[propertyName],
              total,
              checked
            );
            break;
        }
      }
    }

    return validationItem as ValidationItem;
  }

  private validNextFiveMinutesResultWithEventCounter(
    isValid: boolean,
    resultValue: number,
    total: number,
    checked: boolean
  ) {
    return (
      isValid &&
      ((total > resultValue && checked) || (total < resultValue && !checked))
    );
  }

  private validNextOneMinuteResultWithEventCounter(
    value: string,
    checked: boolean
  ) {
    const numberCheck = 0.5;
    return (
      this.isValidValue(value) &&
      ((Number(value) > numberCheck && checked) ||
        (Number(value) < numberCheck && !checked))
    );
  }

  private doCheckOnBetType() {
    let checked = true;
    for (const betType of this.fastMarkets.betTypes) {
      if (!betType.checked) {
        checked = false;
        break;
      }
    }

    this.checkedProceed = checked;
  }

  private getFastMarketResult(matchId: number) {
    this.requestService.getFastMarketResult(matchId).subscribe(
      (fastMarkets: FastMarkets) => {
          this.fastMarkets = fastMarkets;
          if (!_.isNil(this.fastMarkets)) {
              this.manipulateResultRadio();
              this.resetTimeMachineIntervals();

          }
      });
  }

  private fastMatketsSelection(betType: BetType, checked: boolean) {
    if (!_.isNil(betType)) {
      betType.checked = checked;
      for (const item of betType.fastMarketResults) {
        item.checked = checked;
      }
    }
  }

  private hasRunningResultStatus() {
    let hasRunning = false;
    const runningStatus = [
      ResultStatus.zeroRunning,
      ResultStatus.oneRunning,
      ResultStatus.twoRunning,
      ResultStatus.threeRunning,
    ];

    for (const betType of this.fastMarkets.betTypes) {
      for (const item of betType.fastMarketResults) {
        if (
          runningStatus.indexOf(item.resultStatus) >= 0 &&
          item.checked &&
          item.isShow
        ) {
          hasRunning = true;
          break;
        }
      }
    }

    return hasRunning;
  }

  public ticketStatusBackground(status: string) {
    if (_.isEqual(status, "Calculated")) {
      return "bg-calculated";
    } else if (_.isEqual(status, "Marked")) {
      return "bg-marked";
    } else {
      return "";
    }
  }

  private resetTimeMachineIntervals() {
    const timeMachineBetTypes = this.timeMachineService.getAllTimeMachine(
      this.fastMarkets.betTypes
    );
    if (timeMachineBetTypes.length > 0) {
      _.forEach(timeMachineBetTypes, (betType) => {
        _.forEach(betType.fastMarketResults, (interval) => {
          if (
            interval.resultStatus === ResultStatus.zeroRunning ||
            interval.resultStatus === ResultStatus.threeRunning
          ) {
            interval.result = null;
            interval.homeGoal = "";
            interval.awayGoal = "";
          }
        });
      });
    }
  }

  public verifyInterval(interval: FastMarketResult) {
    if (_.isEmpty(interval.result.toString())) {
      interval.result = null;
    }

    interval.hasBackground = _.isNull(interval.result);
  }

  public verifyHomeAway(interval: FastMarketResult) {
    interval.hasBackground =
      _.isEmpty(interval.homeGoal) || _.isEmpty(interval.awayGoal);
  }

  public filterAndSelectWaterBreak(specialTimeFilter: SpecialSession) {
    if (specialTimeFilter.apply) {
      const selectedPositions = this.getSelectedPositions(specialTimeFilter);

      this.specialSessionPositions = selectedPositions;
    }

    this.specialTimeFilter = specialTimeFilter;
    this.isRefundWithSettleDetermined = specialTimeFilter.apply;
  }

  private getSelectedPositions(specialTimeFilter: SpecialSession) {
    const selectedPositions = [];
    const fiveMinute = 5;
    let index = Number(specialTimeFilter.startMinute) - fiveMinute;
    if (_.isEqual(specialTimeFilter.resourceId, SessionId.suspendedTime)) {
      for (
        index;
        index < Number(specialTimeFilter.startMinute) + fiveMinute;
        index++
      ) {
        if (index > -1) {
          selectedPositions.push(index);
        }
      }
    } else {
      for (
        index;
        index < Number(specialTimeFilter.endMinute) + fiveMinute;
        index++
      ) {
        if (index > -1) {
          selectedPositions.push(index);
        }
      }
    }

    return selectedPositions;
  }

  public getExistingSpecialSession(specialSessions: SpecialSession[]) {
    const existingSpecialSessions = specialSessions.filter(
      (session) => session.apply
    );
    _.forEach(existingSpecialSessions, (session) => {
      session.startMinute = Number(session.startMinute);
      session.startSecond = Number(session.startSecond);
      session.endMinute = Number(session.endMinute);
      session.endSecond = Number(session.endSecond);
    });

    this.existingSpecialSessions = existingSpecialSessions;
  }

  private getTimeMachineHomeAwayResult(betTypes: BetType[]) {
    const homeAwayRange = 10;
    const timeMachineHDP = _.find(
      betTypes,
      (betType) => betType.betTypeId === FastMarketBetType.timeMachineHDP
    );
    if (timeMachineHDP) {
      _.forEach(timeMachineHDP.fastMarketResults, (interval) => {
        interval.result =
          Number(interval.awayGoal) * homeAwayRange + Number(interval.homeGoal);
      });
    }

    return betTypes;
  }

  public openInputForm() {
    this.matDialog.closeAll();
    this.matDialog
      .open(InputScoreFormComponent, {
        width: "510px",
        height: "500px",
        data: {
          matchId: this.matchId,
        },
      })
      .afterClosed()
      .subscribe((results: TimeMachineResult[]) => {
        if (results) {
          const timeMachineHDP = _.find(
            this.fastMarkets.betTypes,
            (betType) => betType.betTypeId === FastMarketBetType.timeMachineHDP
          );
          _.forEach(timeMachineHDP.fastMarketResults, (interval) => {
            if (
              _.some(results, (result) => result.position === interval.position)
            ) {
              const filledScore = _.find(
                results,
                (result) => result.position === interval.position
              );
              interval.homeGoal = filledScore.homeScore;
              interval.awayGoal = filledScore.awayScore;
            } else {
              interval.homeGoal = "0";
              interval.awayGoal = "0";
            }
          });
        }
      });
  }
}
