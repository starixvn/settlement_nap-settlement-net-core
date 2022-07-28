import { ResultDetail, UpdateWaterBreakQuery, SpecialSession } from '../models';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import * as _ from 'lodash';
import { RequestService } from '../services';
import { ModalDialogMessage, Result } from '../../shared/models';
import { MessageBoxService } from '../../shared/services';
import { Language } from '../../shared/language';
import { SessionId } from '../constants';

@Component({
  selector: 'special-session',
  templateUrl: './special-session.component.html'
})
export class SpecialSessionComponent implements OnChanges {
  @Input() resultDetail: ResultDetail[];
  @Input() matchId: number;
  @Output() public readonly waterBreakFilter = new EventEmitter();
  @Output() public readonly listSpecialSessions = new EventEmitter();
  public slideColor: ThemePalette = 'warn';
  public waterBreakOne = new SpecialSession(SessionId.waterBreakOne);
  public waterBreakTwo = new SpecialSession(SessionId.waterBreakTwo);
  public suspendedTime = new SpecialSession(SessionId.suspendedTime);
  public readonly modalDialogMessage = new ModalDialogMessage();
  private readonly maxMinute = 90;
  private readonly maxSecond = 59;
  private readonly tenNumber = 10;
  public originalWaterBreakOne: SpecialSession;
  public originalWaterBreakTwo: SpecialSession;
  public originalSuspendedTime: SpecialSession;
  public checked = true;

  constructor(private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,) { }

  ngOnChanges(): void {
    this.verifyResult();
    this.createBackupSessions(SessionId.waterBreakOne);
    this.createBackupSessions(SessionId.waterBreakTwo);
    this.createBackupSessions(SessionId.suspendedTime);
    const specialSessions = this.getValidSpecialSessions();
    this.listSpecialSessions.emit(specialSessions);
  }

  public verifyResult() {
    this.generateSession(SessionId.waterBreakOne, this.waterBreakOne);
    this.generateSession(SessionId.waterBreakTwo, this.waterBreakTwo);
    this.generateSession(SessionId.suspendedTime, this.suspendedTime);
  }

  public generateSession(sessionId: string, session: SpecialSession) {
    const existedWaterBreak = _.find(this.resultDetail, result => _.isEqual(result.resourceId, sessionId));
    if (existedWaterBreak) {
      this.generateResult(existedWaterBreak, session);
      this.getColorSession(session);
    } else {
      this.resetWaterBreak(sessionId);
    }
  }

  private resetWaterBreak(sessionId: string) {
    if (_.isEqual(sessionId, SessionId.waterBreakOne)) {
      this.waterBreakOne = new SpecialSession(SessionId.waterBreakOne);
    } else if (_.isEqual(sessionId, SessionId.waterBreakTwo)) {
      this.waterBreakTwo = new SpecialSession(SessionId.waterBreakTwo);
    } else {
      this.suspendedTime = new SpecialSession(SessionId.suspendedTime);
    }
  }

  private generateResult(resultDetail: ResultDetail, session: SpecialSession) {
    const splitResult = resultDetail.otherInfo.replace(',', ':').split(':');
    session.startMinute = resultDetail.homeValue;
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
    session.startMinute = session.startMinute > this.maxMinute ? Math.floor(session.startMinute / this.tenNumber) : session.startMinute;
    session.endMinute = session.endMinute > this.maxMinute ? Math.floor(session.endMinute / this.tenNumber) : session.endMinute;
    this.getColorSession(session);
  }

  public changeSecond(session: SpecialSession) {
    session.startSecond = session.startSecond > this.maxSecond ? Math.floor(session.startSecond / this.tenNumber) : session.startSecond;
    session.endSecond = session.endSecond > this.maxSecond ? Math.floor(session.endSecond / this.tenNumber) : session.endSecond;
    this.getColorSession(session);
  }

  public getColorSession(session: SpecialSession) {
    if (_.isEqual(session.resourceId, SessionId.suspendedTime)) {
      return;
    } else {
      if (this.isWaterBreakTimeEmpty(session) || !session.apply) {
        session.color = '';
        return;
      }

      if (Number(session.startMinute) > Number(session.endMinute) ||
        (Number(session.startMinute) === Number(session.endMinute) && Number(session.startSecond) >= Number(session.endSecond))) {
        session.color = "invalidTime";
      } else {
        session.color = '';
      }
    }
  }

  private createBackupSessions(sessionId: string) {
    if (_.isEqual(sessionId, SessionId.waterBreakOne)) {
      this.originalWaterBreakOne = _.cloneDeep(this.waterBreakOne);
    } else if (_.isEqual(sessionId, SessionId.waterBreakTwo)) {
      this.originalWaterBreakTwo = _.cloneDeep(this.waterBreakTwo);
    } else {
      this.originalSuspendedTime = _.cloneDeep(this.suspendedTime);
    }
  }

  private isWaterBreakTimeEmpty(session: SpecialSession) {
    return _.isNil(session.startMinute) || _.isEmpty(session.startMinute.toString()) ||
          _.isNil(session.startSecond) || _.isEmpty(session.startSecond.toString()) ||
          _.isNil(session.endMinute) || _.isEmpty(session.endMinute.toString()) ||
          _.isNil(session.endSecond) || _.isEmpty(session.endSecond.toString());
  }

  private isSuspendedTimeEmpty(session: SpecialSession) {
    return _.isNil(session.startMinute) || _.isEmpty(session.startMinute.toString()) ||
      _.isNil(session.startSecond) || _.isEmpty(session.startSecond.toString());
  }

  public saveAndSelectWaterBreak(session: SpecialSession) {
    session.isSaveButtonPressed = true;
    if (this.verifyBeforeSavingWaterBreak(session)) {
      const originalSession = _.isEqual(session.resourceId, SessionId.waterBreakOne)
        ? this.originalWaterBreakOne : this.originalWaterBreakTwo;
      if (session.apply) {
        this.updateWaterBreak(session, originalSession);
      } else {
        this.deleteWaterBreak(session, originalSession);
      }
    }
  }

  public saveAndSelectSuspendedTime(session: SpecialSession) {
    session.isSaveButtonPressed = true;
    if (this.verifyBeforeSavingSuspendedTime(session)) {
      if (session.apply) {
        this.updateSuspendedTime(session, this.originalSuspendedTime);
      } else {
        this.deleteSuspendedTime(session, this.originalSuspendedTime);
      }
    }
  }

  private updateWaterBreak(session: SpecialSession, originalSession: SpecialSession) {
    if (!originalSession.apply || Number(session.startMinute) !== Number(originalSession.startMinute)
      || Number(session.startSecond) !== Number(originalSession.startSecond)
      || Number(session.endMinute) !== Number(originalSession.endMinute)
      || Number(session.endSecond) !== Number(originalSession.endSecond)) {
      const message = Language.fastMarket.updateWaterBreak;
      this.confirmSaveAndSelect(session, message);
    } else {
      const message = Language.fastMarket.selectWaterBreak;
      this.confirmSelection(session, message);
    }
  }

  private deleteWaterBreak(session: SpecialSession, originalSession: SpecialSession) {
    if (originalSession.apply) {
      const message = Language.fastMarket.removeWaterBreak;
      this.confirmSaveAndSelect(session, message);
    } else {
      const message = Language.fastMarket.alertSelectWaterBreak;
      this.alertOnSelection(message);
    }
  }

  private updateSuspendedTime(session: SpecialSession, originalSession: SpecialSession) {
    if (!originalSession.apply || Number(session.startMinute) !== Number(originalSession.startMinute)
      || Number(session.startSecond) !== Number(originalSession.startSecond)) {
      const message = Language.fastMarket.updateSuspendedTime;
      this.confirmSaveAndSelect(session, message);
    } else {
      const message = Language.fastMarket.selectSuspendedTime;
      this.confirmSelection(session, message);
    }
  }

  private deleteSuspendedTime(session: SpecialSession, originalSession: SpecialSession) {
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
    this.modalDialogMessage.title = Language.InstantSetting.WarningTitle;
    this.modalDialogMessage.message = message;
    this.messageBoxService.alert(this.modalDialogMessage);
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
      ? this.initSuspendedTimeUpdateQuery(session) : this.initWaterBreakUpdateQuery(session);
    this.requestService.updateWaterBreakSetting(query).subscribe((result: Result) => {
      if (result.isSuccessful) {
        this.doSelect(session);
        const specialSessions = this.getValidSpecialSessions();
        this.listSpecialSessions.emit(specialSessions);
        this.createBackupSessions(session.resourceId);
      }
    });
  }

  private doSelect(session: SpecialSession) {
    const temp = new SpecialSession('');
    Object.assign(temp, session);
    this.waterBreakFilter.emit(temp);
    if (!session.apply) {
      this.clearSessionValues(session.resourceId);
    }
  }

  private initWaterBreakUpdateQuery(session: SpecialSession): UpdateWaterBreakQuery {
    const actionId = 81020;
    const isApply = session.apply ? 'YES' : 'NO';
    const startTime = `${session.startMinute}:${session.startSecond}`;
    const endTime = `${session.endMinute}:${session.endSecond}`;
    const remark = session.apply ? `${isApply}:${session.resourceId}(${startTime}-${endTime})` : `${isApply}:${session.resourceId}`;
    const resultDetail: ResultDetail = {
      resourceId: session.resourceId,
      homeValue: session.startMinute,
      awayValue: session.endMinute,
      otherInfo: `${startTime},${endTime}`,
      isApply: session.apply ? 1 : 0,
      resultStatusId: session.resultStatusId,
    };

    return {
      matchId: this.matchId,
      actionId,
      waterBreakDetail: resultDetail,
      remark
    };
  }

  private initSuspendedTimeUpdateQuery(session: SpecialSession): UpdateWaterBreakQuery {
    const actionId = 81024;
    const isApply = session.apply ? 'YES' : 'NO';
    const time = `${session.startMinute}:${session.startSecond}`;
    const remark = session.apply ? `${isApply}:${session.resourceId}(${time})` : `${isApply}:${session.resourceId}`;
    const resultDetail: ResultDetail = {
      resourceId: session.resourceId,
      homeValue: session.startMinute,
      awayValue: 0,
      otherInfo: time,
      isApply: session.apply ? 1 : 0,
      resultStatusId: session.resultStatusId,
    };

    return {
      matchId: this.matchId,
      actionId,
      waterBreakDetail: resultDetail,
      remark
    };
  }

  private verifyBeforeSavingWaterBreak(session: SpecialSession) {
    if ((this.isWaterBreakTimeEmpty(session) || !_.isEmpty(session.color)) && session.apply) {
      this.modalDialogMessage.title = Language.InstantSetting.WarningTitle;
      this.modalDialogMessage.message = Language.fastMarket.errorWaterBreak;
      this.messageBoxService.alert(this.modalDialogMessage);
      return false;
    }

    return true;
  }

  private verifyBeforeSavingSuspendedTime(session: SpecialSession) {
    if (this.isSuspendedTimeEmpty(session) && session.apply) {
      this.modalDialogMessage.title = Language.InstantSetting.WarningTitle;
      this.modalDialogMessage.message = Language.fastMarket.errorSuspendedTime;
      this.messageBoxService.alert(this.modalDialogMessage);
      return false;
    }

    return true;
  }

  public isErrorOnVerification(timeElement: number, session: SpecialSession) {
    return (_.isNil(timeElement) || _.isEmpty(timeElement.toString())) && session.apply && session.isSaveButtonPressed;
  }

  private clearSessionValues(resourceId: string) {
    if (_.isEqual(resourceId, SessionId.waterBreakOne)) {
      this.waterBreakOne = new SpecialSession(SessionId.waterBreakOne);
    } else if (_.isEqual(resourceId, SessionId.waterBreakTwo)) {
      this.waterBreakTwo = new SpecialSession(SessionId.waterBreakTwo);
    } else {
      this.suspendedTime = new SpecialSession(SessionId.suspendedTime);
    }
  }

  private getValidSpecialSessions() {
    const validSessions = [];
    if (this.waterBreakOne.apply && !this.isWaterBreakTimeEmpty(this.waterBreakOne)) {
      validSessions.push(this.waterBreakOne);
    }

    if (this.waterBreakTwo.apply && !this.isWaterBreakTimeEmpty(this.waterBreakTwo)) {
      validSessions.push(this.waterBreakTwo);
    }

    if (this.suspendedTime.apply && !this.isSuspendedTimeEmpty(this.suspendedTime)) {
      validSessions.push(this.suspendedTime);
    }

    return validSessions;
  }
}