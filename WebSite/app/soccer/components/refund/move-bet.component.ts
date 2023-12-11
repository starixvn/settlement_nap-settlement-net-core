import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { RefundType } from './model/constant.native';
import { MatchMoveBet } from './model/match.model';
import { RequestService } from './services/request.service';
import * as _ from 'lodash';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { Language } from '../../../shared/language.native';

@Component({
  selector: 'move-bet',
  templateUrl: './move-bet.component.html',
  providers: [
    RequestService,
    HttpRequestService,
    BlockUIService,
    MessageBoxService
  ]
})
export class MoveBetComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public listMatch: MatchMoveBet[];
  public title: string;
  public matchIdSelected: number;
  constructor(
    private readonly requestService: RequestService,
    private readonly toastrService: ToastrService,
    private readonly dialogRef: MatDialogRef<MoveBetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { matchId: number, refundType: string }) { }

  async ngOnInit(): Promise<void> {
    this.toastrService.overlayContainer = this.toastContainer;
    this.listMatch = await this.requestService.getMatchDetailThirdPartyBetTickets(this.data.matchId).toPromise();
    this.title = _.isEqual(this.data.refundType, RefundType.refundBetDaq) ? "Betdaq" : "BetFair";

    if (this.listMatch.length < 1) {
      this.toastrService.warning(Language.soccer.emptyMatchToMove);
    }
  }

  public close() {
    this.toastrService.clear();
    this.dialogRef.close();
  }

  public moveBet() {
    this.toastrService.clear();
    if (!this.matchIdSelected) {
      this.toastrService.error(Language.soccer.chooseNewMatchError);
    } else {
      this.doMoveBetType();
    }
  }

  private async doMoveBetType() {
    const matchCode = _.find(this.listMatch, item => _.isEqual(item.matchId, this.matchIdSelected)).matchCode;
    const actionName = this.title.toUpperCase();
    const result = await this.requestService.moveBetType(this.data.matchId, this.matchIdSelected, matchCode, actionName);
    this.dialogRef.close({ result });
  }
}
