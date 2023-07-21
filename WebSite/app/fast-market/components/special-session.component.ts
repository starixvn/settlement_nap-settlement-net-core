import { ResultDetail, UpdateWaterBreakQuery, SpecialSession } from "../models";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import { ThemePalette } from "@angular/material/core";
import * as _ from "lodash";
import { RequestService } from "../services";
import { ModalDialogMessage, Result } from "../../shared/models";
import { MessageBoxService } from "../../shared/services";
import { Language } from "../../shared/language.native";
import { SessionId } from "../constants";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";

@Component({
  selector: "special-session",
  templateUrl: "./special-session.component.html",
})
export class SpecialSessionComponent implements OnChanges, OnInit {
  @Input() resultDetail: ResultDetail[];
  @Input() matchId: number;
  @Input() toastContainer: ToastContainerDirective;
  @Output() public readonly waterBreakFilter = new EventEmitter();
  @Output() public readonly listSpecialSessions = new EventEmitter();
  public slideColor: ThemePalette = "warn";
  public waterBreakOne = new SpecialSession(SessionId.waterBreakOne);
  public waterBreakTwo = new SpecialSession(SessionId.waterBreakTwo);
  public waterBreakThree = new SpecialSession(SessionId.waterBreakThree);
  public waterBreakFour = new SpecialSession(SessionId.waterBreakFour);

  public suspendedTime = new SpecialSession(SessionId.suspendedTime);
  public readonly modalDialogMessage = new ModalDialogMessage();
  private readonly maxMinute = 90;
  private readonly maxSecond = 59;
  private readonly tenNumber = 10;
  public originalWaterBreakOne: SpecialSession;
  public originalWaterBreakTwo: SpecialSession;
  public originalWaterBreakThree: SpecialSession;
  public originalWaterBreakFour: SpecialSession;
  public originalSuspendedTime: SpecialSession;
  public checked = true;

  constructor(
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly toastrService: ToastrService
  ) {}

  ngOnChanges(): void {
    this.verifyResult();
    this.createBackupSessions(SessionId.waterBreakOne);
    this.createBackupSessions(SessionId.waterBreakTwo);
    this.createBackupSessions(SessionId.waterBreakThree);
    this.createBackupSessions(SessionId.waterBreakFour);
    this.createBackupSessions(SessionId.suspendedTime);
    const specialSessions = this.getValidSpecialSessions();
    this.listSpecialSessions.emit(specialSessions);
  }

  ngOnInit(): void {
    this.toastrService.overlayContainer = this.toastContainer;
  }

  public verifyResult() {
    this.generateSession(SessionId.waterBreakOne, this.waterBreakOne);
    this.generateSession(SessionId.waterBreakTwo, this.waterBreakTwo);
    this.generateSession(SessionId.waterBreakThree, this.waterBreakThree);
    this.generateSession(SessionId.waterBreakFour, this.waterBreakFour);
    this.generateSession(SessionId.suspendedTime, this.suspendedTime);
  }

  public generateSession(sessionId: string, session: SpecialSession) {
    const existedWaterBreak = _.find(this.resultDetail, (result) =>
      _.isEqual(result.resourceId, sessionId)
    );
    if (existedWaterBreak) {
      this.generateResult(existedWaterBreak, session);
      this.getColorSession(session);
    } else {
      this.resetWaterBreak(sessionId);
    }
  }

  private resetWaterBreak(sessionId: string) {
    switch (sessionId) {
      case SessionId.waterBreakOne:
        this.waterBreakOne = new SpecialSession(SessionId.waterBreakOne);
        break;
      case SessionId.waterBreakTwo:
        this.waterBreakTwo = new SpecialSession(SessionId.waterBreakTwo);
        break;
      case SessionId.waterBreakThree:
        this.waterBreakThree = new SpecialSession(SessionId.waterBreakThree);
        break;
      case SessionId.waterBreakFour:
        this.waterBreakFour = new SpecialSession(SessionId.waterBreakFour);
        break;
      default:
        this.suspendedTime = new SpecialSession(SessionId.suspendedTime);
        break;
    }
  }
  private generateResult(resultDetail: ResultDetail, session: SpecialSession) {
    const splitResult = resultDetail.otherInfo.replace(",", ":").split(":");
    session.startMinute = Number(resultDetail.homeValue);
    session.startSecond = Number(splitResult[1]);
    session.apply = true;
    session.resultStatusId = resultDetail.resultStatusId;
    if (_.isEqual(resultDetail.resourceId, SessionId.suspendedTime)) {
      return;
    } else {
      session.endMinute = resultDetail.awayValue;
      session.endSecond = Number(splitResult[3]);
    }
  }

  public changeMinute(session: SpecialSession) {
    session.startMinute =
      session.startMinute > this.maxMinute
        ? Math.floor(session.startMinute / this.tenNumber)
        : session.startMinute;
    session.endMinute =
      session.endMinute > this.maxMinute
        ? Math.floor(session.endMinute / this.tenNumber)
        : session.endMinute;
    this.getColorSession(session);
  }

  public changeSecond(session: SpecialSession) {
    session.startSecond =
      session.startSecond > this.maxSecond
        ? Math.floor(session.startSecond / this.tenNumber)
        : session.startSecond;
    session.endSecond =
      session.endSecond > this.maxSecond
        ? Math.floor(session.endSecond / this.tenNumber)
        : session.endSecond;
    this.getColorSession(session);
  }

  public getColorSession(session: SpecialSession) {
    if (_.isEqual(session.resourceId, SessionId.suspendedTime)) {
      return;
    } else {
      if (this.isWaterBreakTimeEmpty(session) || !session.apply) {
        session.color = "";
        return;
      }

      if (
        Number(session.startMinute) > Number(session.endMinute) ||
        (Number(session.startMinute) === Number(session.endMinute) &&
          Number(session.startSecond) >= Number(session.endSecond))
      ) {
        session.color = "invalidTime";
      } else {
        session.color = "";
      }
    }
  }

  private createBackupSessions(sessionId: string) {
    switch (sessionId) {
      case SessionId.waterBreakOne:
        this.originalWaterBreakOne = { ...this.waterBreakOne };
        break;
      case SessionId.waterBreakTwo:
        this.originalWaterBreakTwo = { ...this.waterBreakTwo };
        break;
      case SessionId.waterBreakThree:
        this.originalWaterBreakThree = { ...this.waterBreakThree };
        break;
      case SessionId.waterBreakFour:
        this.originalWaterBreakFour = { ...this.waterBreakFour };
        break;
      default:
        this.originalSuspendedTime = { ...this.suspendedTime };
        break;
    }
  }

  private isLessThanEndTime(
    session: SpecialSession,
    suspendSession: SpecialSession
  ) {
    return (
      session.endMinute <= suspendSession.startMinute &&
      session.endSecond <= suspendSession.startSecond
    );
  }

  private isWaterBreakTimeEmpty(session: SpecialSession) {
    return (
      _.isNil(session.startMinute) ||
      _.isEmpty(session.startMinute.toString()) ||
      _.isNil(session.startSecond) ||
      _.isEmpty(session.startSecond.toString()) ||
      _.isNil(session.endMinute) ||
      _.isEmpty(session.endMinute.toString()) ||
      _.isNil(session.endSecond) ||
      _.isEmpty(session.endSecond.toString())
    );
  }

  private isSuspendedTimeEmpty(session: SpecialSession) {
    return (
      _.isNil(session.startMinute) ||
      _.isEmpty(session.startMinute.toString()) ||
      _.isNil(session.startSecond) ||
      _.isEmpty(session.startSecond.toString())
    );
  }

  public saveAndSelectWaterBreak(session: SpecialSession) {
    this.toastrService.clear();
    session.isSaveButtonPressed = true;

    if (!this.verifyBeforeSavingWaterBreak(session)) {
      return;
    }

    const originalSession = this.getOriginalSession(session.resourceId);
    if (session.apply) {
      this.updateWaterBreak(session, originalSession);
      return;
    }

    this.deleteWaterBreak(session, originalSession);
  }

  private getOriginalSession(sessionId: string) {
    switch (sessionId) {
      case SessionId.waterBreakOne:
        return this.originalWaterBreakOne;
      case SessionId.waterBreakTwo:
        return this.originalWaterBreakTwo;
      case SessionId.waterBreakThree:
        return this.originalWaterBreakThree;
      case SessionId.waterBreakFour:
        return this.originalWaterBreakFour;
      default:
        return new SpecialSession("");
    }
  }

  public saveAndSelectSuspendedTime(session: SpecialSession) {
    this.toastrService.clear();
    session.isSaveButtonPressed = true;

    if (this.verifyBeforeSavingSuspendedTime(session)) {
      if (session.apply) {
        this.updateSuspendedTime(session, this.originalSuspendedTime);
      } else {
        this.deleteSuspendedTime(session, this.originalSuspendedTime);
      }
    }
  }

  private updateWaterBreak(
    session: SpecialSession,
    originalSession: SpecialSession
  ) {
    if (
      !originalSession.apply ||
      Number(session.startMinute) !== Number(originalSession.startMinute) ||
      Number(session.startSecond) !== Number(originalSession.startSecond) ||
      Number(session.endMinute) !== Number(originalSession.endMinute) ||
      Number(session.endSecond) !== Number(originalSession.endSecond)
    ) {
      const message = Language.fastMarket.updateWaterBreak;
      this.confirmSaveAndSelect(session, message);
    } else {
      const message = Language.fastMarket.selectWaterBreak;
      this.confirmSelection(session, message);
    }
  }

  private deleteWaterBreak(
    session: SpecialSession,
    originalSession: SpecialSession
  ) {
    if (originalSession.apply) {
      const message = Language.fastMarket.removeWaterBreak;
      this.confirmSaveAndSelect(session, message);
    } else {
      const message = Language.fastMarket.alertSelectWaterBreak;
      this.alertOnSelection(message);
    }
  }

  private updateSuspendedTime(
    session: SpecialSession,
    originalSession: SpecialSession
  ) {
    if (
      !originalSession.apply ||
      Number(session.startMinute) !== Number(originalSession.startMinute) ||
      Number(session.startSecond) !== Number(originalSession.startSecond)
    ) {
      const message = Language.fastMarket.updateSuspendedTime;
      this.confirmSaveAndSelect(session, message);
    } else {
      const message = Language.fastMarket.selectSuspendedTime;
      this.confirmSelection(session, message);
    }
  }

  private deleteSuspendedTime(
    session: SpecialSession,
    originalSession: SpecialSession
  ) {
    if (originalSession.apply) {
      const message = Language.fastMarket.removeSuspendedTime;
      this.confirmSaveAndSelect(session, message);
    } else {
      const message = Language.fastMarket.alertSelectSuspendedTime;
      this.alertOnSelection(message);
    }
  }

  private confirmSelection(session: SpecialSession, message: string) {
    this.modalDialogMessage.title = Language.confirmationBox;
    this.modalDialogMessage.message = message;
    this.messageBoxService.confirm(this.modalDialogMessage, () => {
      const closedStatus = 5;
      if (session.resultStatusId !== closedStatus) {
        this.doSaveAndSelect(session);
      } else {
        this.doSelect(session);
      }
    });
  }

  private alertOnSelection(message: string) {
    this.toastrService.clear();
    this.toastrService.error(message);
  }

  private confirmSaveAndSelect(session: SpecialSession, message: string) {
    this.modalDialogMessage.title = Language.confirmationBox;
    this.modalDialogMessage.message = message;
    this.messageBoxService.confirm(this.modalDialogMessage, () => {
      this.doSaveAndSelect(session);
    });
  }

  private doSaveAndSelect(session: SpecialSession) {
    const query = _.isEqual(session.resourceId, SessionId.suspendedTime)
      ? this.initSuspendedTimeUpdateQuery(session)
      : this.initWaterBreakUpdateQuery(session);
    this.requestService
      .updateWaterBreakSetting(query)
      .subscribe((result: Result) => {
        if (result.isSuccessful) {
          this.doSelect(session);
          const specialSessions = this.getValidSpecialSessions();
          this.listSpecialSessions.emit(specialSessions);
          this.createBackupSessions(session.resourceId);
        }
      });
  }

  private doSelect(session: SpecialSession) {
    const temp = new SpecialSession("");
    Object.assign(temp, session);
    this.waterBreakFilter.emit(temp);
    if (!session.apply) {
      this.clearSessionValues(session.resourceId);
    }
  }

  private initWaterBreakUpdateQuery(
    session: SpecialSession
  ): UpdateWaterBreakQuery {
    const actionId = 81020;
    const isApply = session.apply ? "YES" : "NO";
    const startTime = `${session.startMinute}:${session.startSecond}`;
    const endTime = `${session.endMinute}:${session.endSecond}`;
    const remark = session.apply
      ? `${isApply}:${session.resourceId}(${startTime}-${endTime})`
      : `${isApply}:${session.resourceId}`;
    const resultDetail: ResultDetail = {
      resourceId: session.resourceId,
      homeValue: Number(session.startMinute),
      awayValue: Number(session.endMinute),
      otherInfo: `${startTime},${endTime}`,
      isApply: session.apply ? 1 : 0,
      resultStatusId: session.resultStatusId,
    };

    return {
      matchId: this.matchId,
      actionId,
      waterBreakDetail: resultDetail,
      remark,
    };
  }

  private initSuspendedTimeUpdateQuery(
    session: SpecialSession
  ): UpdateWaterBreakQuery {
    const actionId = 81024;
    const isApply = session.apply ? "YES" : "NO";
    const time = `${session.startMinute}:${session.startSecond}`;
    const remark = session.apply
      ? `${isApply}:${session.resourceId}(${time})`
      : `${isApply}:${session.resourceId}`;
    const resultDetail: ResultDetail = {
      resourceId: session.resourceId,
      homeValue: Number(session.startMinute),
      awayValue: 0,
      otherInfo: time,
      isApply: session.apply ? 1 : 0,
      resultStatusId: session.resultStatusId,
    };

    return {
      matchId: this.matchId,
      actionId,
      waterBreakDetail: resultDetail,
      remark,
    };
  }

  private verifyBeforeSavingWaterBreak(session: SpecialSession) {
    if (
      (this.isWaterBreakTimeEmpty(session) || !_.isEmpty(session.color)) &&
      session.apply
    ) {
      this.toastrService.clear();
      this.toastrService.error(Language.fastMarket.errorWaterBreak);
      return false;
    }

    if (
      session.apply &&
      (this.verifyWaterBreakWithSuspendedTime(session) ||
        !_.isEmpty(session.color))
    ) {
      this.toastrService.clear();
      this.toastrService.error(Language.fastMarket.errorWaterBreak);
      return false;
    }

    return true;
  }

  private verifyBeforeSavingSuspendedTime(session: SpecialSession) {
    if (this.isSuspendedTimeEmpty(session) && session.apply) {
      this.toastrService.clear();
      this.toastrService.error(Language.fastMarket.errorSuspendedTime);
      return false;
    }

    const validEndTime = [
      this.originalWaterBreakOne,
      this.originalWaterBreakTwo,
      this.originalWaterBreakThree,
      this.originalWaterBreakFour,
    ].filter(
      (originalWater) =>
        originalWater.apply && !this.isWaterBreakTimeEmpty(originalWater)
    );

    const allValidEndTimes = validEndTime.every((originalWater) =>
      this.isLessThanEndTime(originalWater, session)
    );

    if (!allValidEndTimes) {
      this.toastrService.clear();
      this.toastrService.error(Language.fastMarket.errorWaterBreak);
      return false;
    }

    return true;
  }

  private verifyWaterBreakWithSuspendedTime(session: SpecialSession) {
    return (
      !this.isSuspendedTimeEmpty(this.originalSuspendedTime) &&
      !this.isLessThanEndTime(session, this.originalSuspendedTime)
    );
  }

  public isErrorOnVerification(timeElement: number, session: SpecialSession) {
    return (
      (_.isNil(timeElement) || _.isEmpty(timeElement.toString())) &&
      session.apply &&
      session.isSaveButtonPressed
    );
  }

  public isErrorEndTimeOnVerification(
    timeElement: number,
    session: SpecialSession
  ) {
    return (
      this.verifyWaterBreakWithSuspendedTime(session) &&
      session.apply &&
      session.isSaveButtonPressed
    );
  }

  private clearSessionValues(resourceId: string) {
    switch (resourceId) {
      case SessionId.waterBreakOne:
        this.waterBreakOne = new SpecialSession(SessionId.waterBreakOne);
        break;
      case SessionId.waterBreakTwo:
        this.waterBreakTwo = new SpecialSession(SessionId.waterBreakTwo);
        break;
      case SessionId.waterBreakThree:
        this.waterBreakThree = new SpecialSession(SessionId.waterBreakThree);
        break;
      case SessionId.waterBreakFour:
        this.waterBreakFour = new SpecialSession(SessionId.waterBreakFour);
        break;
      default:
        this.suspendedTime = new SpecialSession(SessionId.suspendedTime);
        break;
    }
  }

  private getValidSpecialSessions() {
    const validSessions = [];
    if (
      this.waterBreakOne.apply &&
      !this.isWaterBreakTimeEmpty(this.waterBreakOne)
    ) {
      validSessions.push(this.waterBreakOne);
    }

    if (
      this.waterBreakTwo.apply &&
      !this.isWaterBreakTimeEmpty(this.waterBreakTwo)
    ) {
      validSessions.push(this.waterBreakTwo);
    }

    if (
      this.waterBreakThree.apply &&
      !this.isWaterBreakTimeEmpty(this.waterBreakThree)
    ) {
      validSessions.push(this.waterBreakThree);
    }

    if (
      this.waterBreakFour.apply &&
      !this.isWaterBreakTimeEmpty(this.waterBreakFour)
    ) {
      validSessions.push(this.waterBreakFour);
    }

    if (
      this.suspendedTime.apply &&
      !this.isSuspendedTimeEmpty(this.suspendedTime)
    ) {
      validSessions.push(this.suspendedTime);
    }

    return validSessions;
  }
}
