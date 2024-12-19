import { Component, OnInit } from "@angular/core";
import { AppTableComponent } from "../../../shared/components/table/app-table.component";
import { NumberInputComponent } from "../../../shared/components/number-input/number-input.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SwitchComponent } from "../../../shared/components/switch/switch.component";
import { ButtonComponent } from "../../../shared/components/button/button.component";

@Component({
  selector: "soccer-auto-settings",
  standalone: true,
  imports: [AppTableComponent, NumberInputComponent, FormsModule, ReactiveFormsModule, CommonModule, SwitchComponent, ButtonComponent],
  templateUrl: "./soccer-auto-settings.component.html",
  styleUrl: "./soccer-auto-settings.component.scss",
})
export class SoccerAutoSettingsComponent implements OnInit {
submit() {
}
  ngOnInit(): void {}
  public readonly tableHeaders = [
    "Auto Function",
    "Enabled",
    "Waiting Time",
    "Apply to UnCal Match",
  ];
  public settings = [
    {
      settleType: "Auto Payout",
      enabled: true,
      waitingTime: 5,
      applyToUnCalMatch: false,
    },
    {
      settleType: "Direct Payout",
      enabled: false,
      waitingTime: 5,
      applyToUnCalMatch: false,
    },
    {
      settleType: "Auto Refund",
      enabled: true,
      waitingTime: 5,
      applyToUnCalMatch: false,
    },
    
  ];
}
