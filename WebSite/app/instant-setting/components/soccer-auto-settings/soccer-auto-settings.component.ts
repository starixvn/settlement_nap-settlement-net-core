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

@Component({
  selector: "soccer-auto-settings",
  standalone: true,
  imports: [AppTableComponent, NumberInputComponent, FormsModule, ReactiveFormsModule, CommonModule, SwitchComponent, ButtonComponent],
  templateUrl: "./soccer-auto-settings.component.html",
  styleUrl: "./soccer-auto-settings.component.scss",
  providers: [
    SoccerAutoSettingsService,
  ]
})
export class SoccerAutoSettingsComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true })
  private readonly toastContainer: ToastContainerDirective;
  private readonly soccerAutoSettingsService = inject(SoccerAutoSettingsService);
  private readonly dialog = inject(MatDialog);
  private readonly messageBoxService = inject(MessageBoxService);
  private readonly toastrService = inject(ToastrService);

  public tableHeaders = [
    "Auto Function",
    "Enabled",
    "Waiting Time",
    "Apply to UnCal Match",
  ];
  public settings = [] = [];
  public isApplyMatch = false;

  ngOnInit(): void {
    this.toastrService.overlayContainer = this.toastContainer;
    const leagueId = +UrlHelper.getUrlParameter("leagueId");
    const matchId = +UrlHelper.getUrlParameter("matchId");

    this.isApplyMatch = leagueId > 0 && matchId == 0;

    this.tableHeaders = this.isApplyMatch
      ? this.tableHeaders
      : this.tableHeaders.filter((header) => header !== "Apply to UnCal Match");

    this.soccerAutoSettingsService.getSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  submit() {
    const confirmBox = new ModalDialogMessage(Language.confirmationBox);
    confirmBox.message = Language.AutoPayoutSetting.ConfirmMessageForAutoSetting;
    confirmBox.hasActionOnNoBtn = true

    this.messageBoxService.confirm(
      confirmBox,
      () => { },
      () => this.messageBoxService.closePopup()
    );
  }

  cancel() {
    this.messageBoxService.closePopup();
  }
}
