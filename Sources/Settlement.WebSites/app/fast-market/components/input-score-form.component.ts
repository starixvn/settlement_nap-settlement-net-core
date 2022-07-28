import { Component, Inject, OnInit } from '@angular/core';
import { TimeMachineResult } from '../models/interval.model';
import * as _ from 'lodash';
import { RequestService } from '../services';
import { ModalDialogMessage } from '../../shared/models';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { Language } from '../../shared/language';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'input-score-form',
  templateUrl: './input-score-form.component.html',
  providers: [ MessageBoxService, HttpRequestService, BlockUIService, RequestService]
})
export class InputScoreFormComponent implements OnInit {
  public intervals: TimeMachineResult[] = [];
  public results: TimeMachineResult[] = [];
  public originalInterval: TimeMachineResult[] = [];
  public positionSelected = '';
  public newInterval = new TimeMachineResult();
  public readonly modalDialogMessage = new ModalDialogMessage();
  public readonly modalDialogConfirmMessage = new ModalDialogMessage();

  constructor(
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    @Inject(MAT_DIALOG_DATA) public data: {matchId: number, apiUrl: string},
    private readonly dialogRef: MatDialogRef<InputScoreFormComponent>) { }

  ngOnInit(): void {
    this.getFastMarketResult(this.data.matchId);
    this.modalDialogMessage.title = Language.warningTitle;
    this.modalDialogConfirmMessage.title = Language.confirmationBox;
  }

  public close() {
    this.dialogRef.close();
  }

  public delete(interval: TimeMachineResult) {
    this.intervals = _.filter(this.intervals, item => interval.position !== item.position);
  }
  public add() {
    this.newInterval.position = Number(this.positionSelected);
    if (this.checkInputScore(this.newInterval, this.positionSelected) && this.checkExistInterval(this.newInterval)) {
      this.newInterval.positionName = _.find(this.results, item => item.position === this.newInterval.position).positionName;
      this.intervals.push(this.newInterval);
      this.intervals.sort((a, b) => a.position - b.position);
      this.resetValue();
    }
  }

  private resetValue() {
    this.newInterval = new TimeMachineResult();
    this.positionSelected = '';
  }

  private checkExistInterval(interval: TimeMachineResult) {
    if (_.find(this.intervals, item => item.position === interval.position)) {
      this.modalDialogMessage.message = Language.inputForm.isExistInterval;
      this.messageBoxService.alert(this.modalDialogMessage);
      return false;
    }
    return true;
  }

  private checkInputScore(interval: TimeMachineResult, position: string) {
    if (_.isEmpty(interval.homeScore) || _.isEmpty(interval.awayScore) || _.isEqual(position, '')) {
      this.modalDialogMessage.message = Language.inputForm.noInputScore;
      this.messageBoxService.alert(this.modalDialogMessage);
      return false;
    }

    if (_.isEqual(interval.homeScore, '0') && _.isEqual(interval.awayScore, '0')) {
      this.modalDialogMessage.message = Language.inputForm.scoreInvalid;
      this.messageBoxService.alert(this.modalDialogMessage);
      return false;
    }

    return true;
  }

  private getFastMarketResult(matchId: number) {
    this.requestService.getTimeMachineHdpResult(matchId).toPromise().then(
      (Result: TimeMachineResult[]) => {
        this.results = Result;
        this.intervals = _.filter(Result, item => Number(item.homeScore) > 0 || Number(item.awayScore) > 0);
        this.originalInterval = _.cloneDeep(this.intervals);
      });
  }

  public pressOKButton() {
    this.modalDialogConfirmMessage.message = Language.inputForm.confirmScore;
    this.messageBoxService.confirm(this.modalDialogConfirmMessage, () => {
      this.dialogRef.close(this.intervals);
    });
  }

  public pressCancelButton() {
    if (!_.isEqual(this.originalInterval, this.intervals)) {
      this.modalDialogConfirmMessage.message = Language.inputForm.cancelMessage;
      this.messageBoxService.confirm(this.modalDialogConfirmMessage, () => {
        this.dialogRef.close();
      });
    } else {
      this.dialogRef.close();
    }
  }
}
