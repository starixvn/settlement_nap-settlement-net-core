import { Component, Inject, OnInit, ViewChild } from '@angular/core';import * as _ from 'lodash';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { RequestService } from '../../services';
import { TimeMachineResult } from '../../models';
import { ModalDialogMessage } from '../../../shared/models';
import { FastMarketBetType } from '../../constants';
import { Language } from '../../../shared/language.native';

@Component({
  selector: 'input-ou-score',
  templateUrl: './input-ou-score.component.html',
  providers: [ MessageBoxService, HttpRequestService, BlockUIService, RequestService]
})
export class InputOuScoreComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public intervals: TimeMachineResult[] = [];
  public results: TimeMachineResult[] = [];
  public originalInterval: TimeMachineResult[] = [];
  public positionSelected = '';
  public newInterval = new TimeMachineResult();
  public readonly modalDialogMessage = new ModalDialogMessage();
  public readonly modalDialogConfirmMessage = new ModalDialogMessage();
  public readonly fastMarketBetType = FastMarketBetType;
  public title = 'Support Input Score - OU Time Machine';

  constructor(
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    @Inject(MAT_DIALOG_DATA) public data: {matchId: number, betTypeId: number},
    private readonly dialogRef: MatDialogRef<InputOuScoreComponent>,
    private readonly toastrService: ToastrService) { }

  ngOnInit(): void {
    this.getFastMarketResult(this.data.matchId);
    this.modalDialogMessage.title = Language.warningTitle;
    this.modalDialogConfirmMessage.title = Language.confirmationBox;
    this.toastrService.overlayContainer = this.toastContainer;
  }

  public close() {
    this.dialogRef.close();
  }

  public delete(interval: TimeMachineResult) {
    this.intervals = _.filter(this.intervals, item => interval.position !== item.position);
  }
  public add() {
    this.toastrService.clear();
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
      this.toastrService.error(Language.inputForm.isExistInterval);
      return false;
    }
    return true;
  }

  private checkInputScore(interval: TimeMachineResult, position: string) {
    if (_.isEmpty(interval.totalGoal) || _.isEqual(position, '')) {
      this.toastrService.error(Language.inputForm.noInputScore);
      return false;
    }

    if (_.isEqual(interval.totalGoal, '0')) {
      this.toastrService.error(Language.inputForm.scoreInvalid);
      return false;
    }

    return true;
  }

  private getFastMarketResult(matchId: number) {
    this.requestService.getTimeMachineOuResult(matchId).toPromise().then(
      (Result: TimeMachineResult[]) => {
        this.results = Result;
        this.intervals = _.filter(Result, item => Number(item.totalGoal) > 0);
        this.originalInterval = _.cloneDeep(this.intervals);
      });
  }

  public pressOKButton() {
    this.modalDialogConfirmMessage.message = Language.inputForm.confirmOuScore;
    this.messageBoxService.confirm(this.modalDialogConfirmMessage, () => {
      this.dialogRef.close({
        results: this.intervals});
    });
  }

  public pressCancelButton() {
    if (!_.isEqual(this.originalInterval, this.intervals)) {
      this.modalDialogConfirmMessage.message = Language.inputForm.cancelMessage;
      this.messageBoxService.confirm(this.modalDialogConfirmMessage, () => {
        this.dialogRef.close({results: null});
      });
    } else {
      this.dialogRef.close({results: null});
    }
  }
}
