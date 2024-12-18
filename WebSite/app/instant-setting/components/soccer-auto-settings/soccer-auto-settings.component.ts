import { Component, OnInit } from '@angular/core';
import { AppTableComponent } from "../../../shared/components/table/app-table.component";
import { NumberInputComponent } from '../../../shared/components/number-input/number-input.component';

@Component({
  selector: 'soccer-auto-settings',
  standalone: true,
  imports: [AppTableComponent, NumberInputComponent],
  templateUrl: './soccer-auto-settings.component.html',
  styleUrl: './soccer-auto-settings.component.scss'
})
export class SoccerAutoSettingsComponent implements OnInit {
  ngOnInit(): void {
  }
  public readonly tableHeaders = ["Auto Function", "Enabled", "Waiting Time", "Apply to UnCal Match"];
  public settings = [1];

  public onOffOptions = [
    {
      value: "1",
      label: "ON"
    },
    {
      value: "0",
      label: "OFF"
    }
  ]

  public payoutOptions = [
    {
      value: "1",
      label: "Auto Payout"
    },
    {
      value: "2",
      label: "Direct Payout"
    },
    {
      value: "0",
      label: "OFF"
    },
  ]
}
