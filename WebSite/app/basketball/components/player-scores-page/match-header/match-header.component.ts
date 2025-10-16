import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatchDetail } from "../../../models";

@Component({
  selector: 'match-header',
  standalone: true,
  template: `
    <div class="match-header">
      <h1 class="league">{{ matchDetail.leagueName }}</h1>
      <h2 class="match-team">
        <span>{{ matchDetail.homeName }} -vs- {{ matchDetail.awayName }}</span>
        <button class="btn refresh-icon" (click)="onRefresh()"></button>
      </h2>
    </div>
  `,
  styles: `
    .league {
      font-size: 1.2rem;
      font-weight: bold;
    }
    .match-team {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.2rem;
      font-weight: bold;
    }
  `
})
export class MatchHeaderComponent {
  @Input() matchDetail!: MatchDetail;
  @Output() refresh = new EventEmitter<void>();

  onRefresh(): void {
    this.refresh.emit();
  }
}