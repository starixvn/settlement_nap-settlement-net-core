import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnlyIntegerDirective } from '../../../shared/directives/only-integer.directive.native';
import { Player } from './models.native';

@Component({
  selector: 'team-section',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyIntegerDirective],
  template: `
    <div class="team-section">
      <div class="team-name" (click)="toggleTeam()">
        <span class="team-toggle-icon" *ngIf="isCollapsed">+</span>
        <span class="team-toggle-icon" *ngIf="!isCollapsed">-</span>
        <span>{{ teamName }}</span>
      </div>
      <div class="table-container" [class.collapsed]="isCollapsed">
        <table>
          <ng-container [ngTemplateOutlet]="tableHeader"></ng-container>
          <tbody>
            @for (player of players; track player.playerId) {
              <tr>
                <td class="player-col">
                  <div class="player-col-inner">
                    <input
                      type="checkbox"
                      style="margin: 0"
                      [(ngModel)]="player.checked"
                      (ngModelChange)="onCheckboxChange($event, player)"
                    />
                    <span style="font-weight: bold">{{ player.playerName }}</span>
                  </div>
                </td>

                @for (score of player.scores; track $index) {
                  @if (score) {
                    <td
                      class="input-score-col"
                      [class.isHold]="score.isHold"
                      [class.isCalculated]="score.isCalculated"
                      [class.isRefunded]="score.isRefunded"
                      [class.isConfirmedRefund]="score.isConfirmedRefund"
                      [class.isEmpty]="score.isEmpty"
                    >
                      <input
                        type="text"
                        [(ngModel)]="score.value"
                        class="input-score"
                        [class.checked]="score.checked"
                        [class.isConfirmed]="score.isConfirmed"
                        (focus)="score.checked = true"
                        (dblclick)="score.checked = false"
                        myOnlyInteger
                        style="width: 48px"
                      />
                    </td>
                  } @else {
                    <td></td>
                  }
                }

                <td>
                  <div class="button-group">
                    <button
                      class="btn hold-icon"
                      (click)="onHoldResult(player.playerId)"
                      title="Hold results"
                    ></button>
                    <button
                      class="btn unhold-icon"
                      (click)="onUnholdResult(player.playerId)"
                      title="Unhold results"
                    ></button>
                  </div>
                </td>
                <td>
                  <div class="button-group">
                    <button
                      class="btn confirm-icon"
                      (click)="onConfirmResult(player.playerId)"
                      title="Confirm results"
                    ></button>
                    <button
                      class="btn unconfirm-icon"
                      (click)="onUnconfirmResult(player.playerId)"
                      title="Unconfirm results"
                    ></button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <ng-template #tableHeader>
      <thead>
        <tr>
          <th style="width: 150px">Player Name</th>
          <th>Points</th>
          <th>3-Point FG</th>
          <th>Assists</th>
          <th>Blocks</th>
          <th>Rebounds</th>
          <th>Steals</th>
          <th>Hold Result</th>
          <th>Confirm Result</th>
        </tr>
      </thead>
    </ng-template>
  `,
  styleUrls: ['./team-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamSectionComponent {

  @Input() teamName  = '';
  @Input() players: Player[] = [];
  @Input() isCollapsed = false;
  
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() holdResult = new EventEmitter<number>();
  @Output() unholdResult = new EventEmitter<number>();
  @Output() confirmResult = new EventEmitter<number>();
  @Output() unconfirmResult = new EventEmitter<number>();
  @Output() checkboxChange = new EventEmitter<{playerId: number, checked: boolean}>();

  toggleTeam(): void {
    this.toggleCollapse.emit();
  }

  onHoldResult(playerId: number): void {
    this.holdResult.emit(playerId);
  }

  onUnholdResult(playerId: number): void {
    this.unholdResult.emit(playerId);
  }

  onConfirmResult(playerId: number): void {
    this.confirmResult.emit(playerId);
  }

  onUnconfirmResult(playerId: number): void {
    this.unconfirmResult.emit(playerId);
  }

  onCheckboxChange(value: boolean, player: Player) {
   this.checkboxChange.emit({playerId: player.playerId, checked: value});
  }
}