import { Component, OnInit } from "@angular/core";
import {
  Remark,
  Permission,
  RemarkAndPermission,
  ChangeHoldMatchSettingQuery,
} from "../../models";
import { UrlHelper } from "../../../helper";
import { RequestService } from "../../services/request.service";
import { ModalDialogMessage } from "../../../shared/models";
import { MessageBoxService } from "../../../shared/services";
import { Language } from "../../../shared/language.native";
import { TooltipMessage } from "../../constants";
import { HttpUrlEncodingCodec } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { OnlyIntegerDirective } from "../../../shared/directives";
import { CommonModule } from "@angular/common";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "settlement-setting",
  templateUrl: "./remark-setting.component.html",
  imports: [OnlyIntegerDirective, FormsModule, CommonModule, NgbModule],
  providers: [RequestService, HttpUrlEncodingCodec],
  standalone: true,
})
export class RemarkSettingComponent implements OnInit {
  public matchId: string;
  public matchCode: string;
  public remark: Remark;
  public orgRemark: Remark;
  public isMtdApplyChild = false;
  public isUndecidedApplyChild = false
  public permission: Permission;
  public errorMessage: string;
  public tooltipMessage = TooltipMessage;
  public readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();
  constructor(
    private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly urlEncoder: HttpUrlEncodingCodec
  ) {}

  ngOnInit() {
    this.matchId = UrlHelper.getUrlParameter("matchId");
    this.matchCode = this.urlEncoder.decodeValue(
      UrlHelper.getUrlParameter("matchCode")
    );
    this.getRemarkAndPermissionInfo();
  }

  private getRemarkAndPermissionInfo() {
    this.requestService
      .getRemarkInfo(this.matchId)
      .then(({ match, permission }: RemarkAndPermission) => {
        this.remark = match.remark;
        this.orgRemark = { ...this.remark };
        this.permission = permission;
      });
  }

  public refreshRemarkStatusOnMainPage(
    remark: Remark,
    eventStatus: string,
    newEventStatus: string
  ) {
    const mainPage = "Sportsbook";
    window.parent[mainPage]?.refreshRemarkStatus(
      this.matchId,
      remark,
      eventStatus,
      newEventStatus,
      this.permission
    );
  }

  public submit() {
    this.dialogMessage.title = Language.confirmationBox;
    this.dialogMessage.message = this.isMtdApplyChild || this.isUndecidedApplyChild
      ? Language.UpdateSettingConfirmMessage.ChildMatch
      : Language.UpdateSettingConfirmMessage.ParentMatch;

    this.messageBoxService.confirm(this.dialogMessage, async () => {
      await this.changeHoldMatchSetting();
    });
  }

  public cancel() {
    this.messageBoxService.closePopupNotChanged();
  }

  private async changeHoldMatchSetting() {
    const holdSettings = this.generateCurrentHoldSetting();
    const orgHoldSettings = this.generateHoldSetting(this.orgRemark);
    const query: ChangeHoldMatchSettingQuery = {
      matchId: this.matchId,
      remark: this.remark,
      holdSettings,
      orgHoldSettings,
    };

    const result = await this.requestService.changeHoldMatchSetting(query);
    const { remark } = result.match;
    const { eventStatus, newEventStatus } = result.match;

    this.remark = remark;

    this.refreshRemarkStatusOnMainPage(remark, eventStatus, newEventStatus);

    this.messageBoxService.closePopupNotChanged();
  }

  private generateHoldSetting(value: Remark) {
    const result = Object.keys(new Remark()).map((key) => ({
      name: key,
      value: value[key],
      isApplyChild: false,
    }));

    return result;
  }

  private generateCurrentHoldSetting() {
   return this.generateHoldSetting(this.remark).map( s => {
      if(s.name === 'isMtdHold') {
        return {...s, isApplyChild: this.isMtdApplyChild}
      }
      if(s.name === 'isUndecided') {
        return {...s, isApplyChild: this.isUndecidedApplyChild}
      }
      return {...s}
    })
  }
}
