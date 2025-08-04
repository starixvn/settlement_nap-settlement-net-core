import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import * as _ from 'lodash';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { RequestService } from '../../services/request.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../../../shared/services';
import { MatchMoveBet } from '../../models/match.model';
import { RefundType } from '../../models/constant.model';
import { Language } from '../../../../../shared/language.native';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
@Component({
  selector: 'move-bet',
  templateUrl: './move-bet.component.html',
  standalone: true,
  providers: [ToastrService],
  imports: [CommonModule, FormsModule, MatDialogModule, DatePipe, ToastContainerModule]
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
    @Inject(MAT_DIALOG_DATA) public data: { matchId: number, refundType: string }) { 
      this.dialogRef.disableClose = true;
    }

  async ngOnInit(): Promise<void> {
    this.toastrService.overlayContainer = this.toastContainer;
    this.requestService.getMatchDetailThirdPartyBetTickets(this.data.matchId).subscribe((res: MatchMoveBet[]) => {
      this.listMatch = res;
      if (this.listMatch.length < 1) {
        this.toastrService.warning(Language.soccer.emptyMatchToMove);
      }
    });
    this.title = _.isEqual(this.data.refundType, RefundType.refundBetDaq) ? "Betdaq" : "BetFair";
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
