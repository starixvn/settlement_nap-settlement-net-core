import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { AppTableComponent } from "../../../shared/components/table/app-table.component";
import { NumberInputComponent } from "../../../shared/components/number-input/number-input.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SwitchComponent } from "../../../shared/components/switch/switch.component";
import { ButtonComponent } from "../../../shared/components/button/button.component";
import { SoccerAutoSettingsService } from "./soccer-auto-settings.service";
import { MatDialog } from "@angular/material/dialog";
import { MessageBoxService } from "../../../shared/services";
import { ModalDialogMessage } from "../../../shared/models";
import { Language } from "../../../shared/language.native";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { UrlHelper } from "../../../helper";
import { TypeObject } from "../../../shared/constants/type-object.native";
import { AutoSettleType } from "../../../shared/constants/auto-settle-type.native";
import { ResultSetting } from "../../../shared/models/settings";
import * as _ from 'lodash';
@Component({
  selector: "soccer-auto-settings",
  standalone: true,
  imports: [
    AppTableComponent,
    NumberInputComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SwitchComponent,
    ButtonComponent,
  ],
  templateUrl: "./soccer-auto-settings.component.html",
  styles: `
   .button-group {
      display: flex; justify-content: center;column-gap: 10px ;margin-top: 10px;
    }
  `,
  providers: [SoccerAutoSettingsService],
})
export class SoccerAutoSettingsComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true })
  private readonly toastContainer: ToastContainerDirective;
  private readonly soccerAutoSettingsService = inject(SoccerAutoSettingsService);
  private readonly dialog = inject(MatDialog);
  private readonly messageBoxService = inject(MessageBoxService);
  private readonly toastrService = inject(ToastrService);

  public tableHeaders = [];
  public settings: ResultSetting[] = [];
  public originalSettings: ResultSetting[] = [];
  public isMatchType = false;
  public leagueId: number;
  public matchId: number;
  public typeObject = "";

  ngOnInit(): void {
    this.toastrService.overlayContainer = this.toastContainer;
    this.typeObject = UrlHelper.getUrlParameter("typeObject") || "League";

    const tableHeadersConfig = {
      Match: ["Auto Function", "Enabled", "Waiting Time"],
      League: [
        "Auto Function",
        "Enabled",
        "Waiting Time",
        "Apply to UnCal Match",
      ],
    };

    this.isMatchType = this.typeObject === "Match";
    this.tableHeaders = tableHeadersConfig[this.typeObject];
    this.matchId = this.isMatchType ? +UrlHelper.getUrlParameter("matchId") : 0;
    this.leagueId = +UrlHelper.getUrlParameter("leagueId");

    this.setSettings();
  }

  onChangeEnabled(setting: ResultSetting) {
    if (setting.enabled && setting.settleType === AutoSettleType.AutoPayoutSoccer) {  
      this.settings.find(s => s.settleType === AutoSettleType.AutoDirect).enabled = false;
    } else if (setting.enabled && setting.settleType === AutoSettleType.AutoDirect) {
      this.settings.find(s => s.settleType === AutoSettleType.AutoPayoutSoccer).enabled = false;
    }
  }

  submit() {
    const confirmBox = new ModalDialogMessage(Language.confirmationBox);
    confirmBox.message = Language.AutoPayoutSetting.ConfirmMessageForAutoSetting;
    confirmBox.hasActionOnNoBtn = true;

    this.messageBoxService.confirm(
      confirmBox,
      async () => await this.handleAutoSetting(),
      () => this.messageBoxService.closePopup()
    );
  }

  private async handleAutoSetting() {
    const result = await this.soccerAutoSettingsService.updateSettings({
      leagueId: this.leagueId,
      matchId: this.matchId,
      typeObject: this.typeObject as TypeObject,
      resultSettings: this.settings,
      oldResultSettings: this.originalSettings,
    });

    if (!result.isSuccessful) {
      this.toastrService.error(result.errMsg);
      return;
    }

    this.setDialogResponse();
    this.messageBoxService.closePopup();
  }

  private setDialogResponse() {
    const response = {
      leagueId: this.leagueId,
      matchId: this.matchId,
      typeObject: this.typeObject as TypeObject,
      resultSettings: this.settings,
    };

    parent.document.getElementById("dialog-response")?.setAttribute("value", JSON.stringify(response));
  }
  
  cancel() {
    this.messageBoxService.closePopup();
  }

  private setSettings() {
    const refundWaitingTime = +UrlHelper.getUrlParameter(this.isMatchType ? "refundWaitingTimeMatch" : "refundWaitingTime");
    const directWaitingTime = +UrlHelper.getUrlParameter(this.isMatchType ? "directWaitingTimeMatch" : "directWaitingTime");

    const isAutoPayoutEnabled = Boolean(
      JSON.parse(UrlHelper.getUrlParameter(this.isMatchType ? "isAutoPayoutForMatch" : "isAutoPayoutForLeague")));
    const isDirectPayoutEnabled = Boolean(
      JSON.parse(UrlHelper.getUrlParameter(this.isMatchType ? "isDirectPayoutForMatch" : "isDirectPayoutForLeague")));
    const isAutoRefundEnabled = Boolean(
      JSON.parse(UrlHelper.getUrlParameter(this.isMatchType ? "enabledAutoRefundMatch" : "enabledAutoRefund")));

    this.settings = [
      {
        settleType: AutoSettleType.AutoPayoutSoccer,
        settleTypeName: "Auto Payout",
        enabled: isAutoPayoutEnabled,
        waitingTime: refundWaitingTime,
        isApplyChildMatches: false,
      },
      {
        settleType: AutoSettleType.AutoDirect,
        settleTypeName: "Direct Payout",
        enabled: isDirectPayoutEnabled,
        waitingTime: directWaitingTime,
        isApplyChildMatches: false,
      },
      {
        settleType: AutoSettleType.AutoRefund,
        settleTypeName: "Auto Refund",
        enabled: isAutoRefundEnabled,
        waitingTime: refundWaitingTime,
        isApplyChildMatches: false,
      },
    ];

    this.originalSettings = _.cloneDeep(this.settings);
  }
}
