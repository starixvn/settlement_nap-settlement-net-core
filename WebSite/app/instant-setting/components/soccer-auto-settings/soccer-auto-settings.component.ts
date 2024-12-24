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
import { ResultSetting } from "./types";
import { AutoSettleType } from "../../../shared/constants/auto-settle-type.native";

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
  private readonly soccerAutoSettingsService = inject(
    SoccerAutoSettingsService
  );
  private readonly dialog = inject(MatDialog);
  private readonly messageBoxService = inject(MessageBoxService);
  private readonly toastrService = inject(ToastrService);

  public tableHeaders = [];
  public settings: ResultSetting[] = [];
  public isApplyMatch = false;
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

    const isMatchType = this.typeObject === "Match";
    this.isApplyMatch = !isMatchType;
    this.tableHeaders = tableHeadersConfig[this.typeObject];

    // Retrieve common parameters
    this.matchId = isMatchType ? +UrlHelper.getUrlParameter("matchId") : 0;
    this.leagueId = +UrlHelper.getUrlParameter("leagueId");
    const refundWaitingTime = +UrlHelper.getUrlParameter(isMatchType ? "refundWaitingTimeMatch" : "refundWaitingTime");
    const directWaitingTime = +UrlHelper.getUrlParameter(isMatchType ? "directWaitingTimeMatch" : "directWaitingTime");

    // Retrieve enabled settings
    console.log(typeof UrlHelper.getUrlParameter("isAutoPayoutForLeague"));
    const isAutoPayoutEnabled = Boolean(
      JSON.parse(UrlHelper.getUrlParameter(isMatchType ? "isAutoPayoutForMatch" : "isAutoPayoutForLeague")));
    const isDirectPayoutEnabled = Boolean(
      JSON.parse(UrlHelper.getUrlParameter(isMatchType ? "isDirectPayoutForMatch" : "isDirectPayoutForLeague")));
    const isAutoRefundEnabled = Boolean(
      JSON.parse(UrlHelper.getUrlParameter(isMatchType ? "enabledAutoRefundMatch" : "enabledAutoRefund")));

    this.settings = [
      {
        settleType: AutoSettleType.AutoPayoutSoccer,
        autoFunction: "Auto Payout",
        enabled: isAutoPayoutEnabled,
        waitingTime: refundWaitingTime,
        isApplyChildMatches: false,
      },
      {
        settleType: AutoSettleType.AutoDirect,
        autoFunction: "Direct Payout",
        enabled: isDirectPayoutEnabled,
        waitingTime: directWaitingTime,
        isApplyChildMatches: false,
      },
      {
        settleType: AutoSettleType.AutoRefund,
        autoFunction: "Auto Refund",
        enabled: isAutoRefundEnabled,
        waitingTime: refundWaitingTime,
        isApplyChildMatches: false,
      },
    ];
  }

  submit() {
    const confirmBox = new ModalDialogMessage(Language.confirmationBox);
    confirmBox.message =
      Language.AutoPayoutSetting.ConfirmMessageForAutoSetting;
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
      isApplyAll: this.isApplyMatch,
      resultSettings: this.settings,
      oldResultSettings: [],
    });

    if (!result.isSuccessful) {
      this.toastrService.error(result.errMsg);
      return;
    }

    this.setDialogResponse();
  }

  private setDialogResponse() {
    const response = {
      leagueId: this.leagueId,
      matchId: this.matchId,
      refundWaitingTime: this.getSettingValue(AutoSettleType.AutoRefund, 'waitingTime'),
      directWaitingTime: this.getSettingValue(AutoSettleType.AutoDirect, 'waitingTime'),
      isAutoPayoutEnabled: this.getSettingValue(AutoSettleType.AutoPayoutSoccer, 'enabled'),
      isDirectPayoutEnabled: this.getSettingValue(AutoSettleType.AutoDirect, 'enabled'),
      isAutoRefundEnabled: this.getSettingValue(AutoSettleType.AutoRefund, 'enabled'),
    };

    parent.document.getElementById("dialog-response")?.setAttribute("value", JSON.stringify(response));
  }
  
  private getSettingValue(settleType: AutoSettleType, key: keyof ResultSetting): any {
    return this.settings.find(setting => setting.settleType === settleType)?.[key];
  }

  cancel() {
    this.messageBoxService.closePopup();
  }
}
