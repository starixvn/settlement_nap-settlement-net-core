import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { EarlyStore } from "../../../store/early.store";
import { ResultDetail } from "../../../../shared/models/sportsbook-sop";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { VerificationBaseService } from "../../../../core/services/verification-base.service";
import { InputFinalBaseComponent, InputOutSideBaseComponent } from "../input-base.component";


@Component({
  selector: 'team-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <select [(ngModel)]="item.homeValue" [ngClass]="{'warning':item.isResultWarning}"
                            [disabled]="!enable || !permission.isLeader"
                            (ngModelChange)="checkResultIsMatched(item)"
                            [matTooltip]="getDropdownTooltip(item.homeValue, 25, homeTeam, awayTeam)" matTooltipPosition="above">
                            <option></option>
                            <option value="H">{{homeTeam}}</option>
                            <option value="A">{{awayTeam}}</option>
                            <option value="N" *ngIf="hasNoneOption(item.betType)">None</option>
   </select>

  `
})
export class TeamSelectionComponent extends InputFinalBaseComponent {

  earlyStore = inject(EarlyStore);
  verificationBaseService = inject(VerificationBaseService);

  permission = this.earlyStore.permission();
  homeTeam = this.earlyStore.getHomeTeam();
  awayTeam = this.earlyStore.getAwayTeam();

  checkResultIsMatched(resultDetail: ResultDetail) {
    resultDetail.isScoreMismatched = this.verificationBaseService.isEarlyMismatchedWarning(resultDetail);
  }
}


@Component({
  selector: 'team-selection-out-side',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <select [(ngModel)]="externalResult.homeValue" [disabled]="!enable"
                            [matTooltip]="getDropdownTooltip(externalResult.homeValue, 25, homeTeam, awayTeam)" matTooltipPosition="above">
                            <option></option>
                            <option value="H">{{homeTeam}}</option> 
                            <option value="A">{{awayTeam}}</option>
                            <option value="N" *ngIf="hasNoneOption(resultDetail.betType)">None</option>
   </select>
  `
})
export class TeamSelectionOutSideComponent extends InputOutSideBaseComponent {
  earlyStore = inject(EarlyStore);
  homeTeam = this.earlyStore.getHomeTeam();
  awayTeam = this.earlyStore.getAwayTeam();
}



