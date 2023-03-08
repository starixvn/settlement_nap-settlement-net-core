import { Component, OnInit } from '@angular/core';
import { Remark, Permission, RemarkAndPermission, ChangeSettingQuery } from '../models';
import { UrlHelper } from '../../helper';
import { RequestService } from '../services/request.service';
import { ModalDialogMessage } from '../../shared/models';
import { MessageBoxService } from '../../shared/services';
import { Language } from '../../shared/language.native';
import { SettingType, TooltipMessage } from '../constants';
import { HttpUrlEncodingCodec } from '@angular/common/http';

@Component({
  selector: 'settlement-setting',
  templateUrl: './remark-setting.component.html',
  providers: [
    RequestService,
    HttpUrlEncodingCodec,
  ],
})

export class RemarkSettingComponent implements OnInit {
  public matchId: string;
  public matchCode: string;
  public remark: Remark;
  public permission: Permission;
  public errorMessage: string;
  public tooltipMessage = TooltipMessage;
  public readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();
  constructor(
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly urlEncoder: HttpUrlEncodingCodec,
  ) { }

  ngOnInit() {
    this.matchId = UrlHelper.getUrlParameter('matchId');
    this.matchCode = this.urlEncoder.decodeValue(UrlHelper.getUrlParameter('matchCode'));
    this.getRemarkAndPermissionInfo();
  }

  private getRemarkAndPermissionInfo() {
    this.requestService.getRemarkInfo(this.matchId).subscribe((queryResult: RemarkAndPermission) => {
      this.remark = queryResult.match.remark;
      this.permission = queryResult.permission;
    });
  }

  public changeMTDHoldSetting() {
    this.dialogMessage.title = Language.confirmationBox;
    this.dialogMessage.message = Language.UpdateSettingConfirmMessage.MTDHold.replace('MATCH_CODE', this.matchCode);

    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.changeMatchSetting(SettingType.mtdHold, !this.remark.isMtdHold);
    });
  }

  public changeUndecidedSetting() {
    this.dialogMessage.title = Language.confirmationBox;
    this.dialogMessage.message = Language.UpdateSettingConfirmMessage.Undecided.replace('MATCH_CODE', this.matchCode);

    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.changeMatchSetting(SettingType.undecided, !this.remark.isUndecided);
    });
  }

  public changePendingSetting() {
    this.dialogMessage.title = Language.confirmationBox;
    this.dialogMessage.message = Language.UpdateSettingConfirmMessage.Pending.replace('MATCH_CODE', this.matchCode);

    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.changeMatchSetting(SettingType.pending, !this.remark.isPending);
    });
  }

  public changeUnderSettleSetting() {
    this.dialogMessage.title = Language.confirmationBox;
    this.dialogMessage.message = Language.UpdateSettingConfirmMessage.UnderSettlement.replace('MATCH_CODE', this.matchCode);

    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.changeMatchSetting(SettingType.underSettlement, !this.remark.isUnderSettle);
    });
  }

  private changeMatchSetting(type: number, isEnabled: boolean) {
    const query: ChangeSettingQuery = {
      matchId: this.matchId,
      type,
      isEnabled
    };

    this.requestService.changeSetting(query).subscribe((result: RemarkAndPermission) => {
      const remark = result.match.remark;
      const eventStatus = result.match.eventStatus;
      this.remark = remark;
      this.refreshRemarkStatusOnMainPage(remark, eventStatus, result.match.newEventStatus);
    });
  }

  public refreshRemarkStatusOnMainPage(remark: Remark, eventStatus: string, newEventStatus: string) {
    const mainPage = 'Sportsbook';
    window.parent[mainPage]?.refreshRemarkStatus(this.matchId, remark, eventStatus,newEventStatus, this.permission);
  }
}
