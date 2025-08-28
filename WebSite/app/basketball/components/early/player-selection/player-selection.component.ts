import { forEach } from 'lodash';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputFinalBaseComponent, InputOutSideBaseComponent } from "../input-base.component";
import { PlayerSelection } from "../../../models/player-selection.model";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'player-select',
  standalone: true,
  imports: [ FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
   <select [disabled]="!enable" [(ngModel)]="item.homeValue">
    <option *ngFor="let selection of playerSelections" [value]="selection.betChoice">{{selection.playerName}}</option>
    <option value="none">None</option>
  </select>
  `
})
export class PlayerSelectionComponent extends InputFinalBaseComponent implements OnInit  {
  playerSelections: PlayerSelection[];
  
  ngOnInit(): void {
    this.createSelection();
  }

  private createSelection(){
    this.playerSelections = this.item.oddFlex?.map(item => {
      return new PlayerSelection(item.betChoice, item.info.playerName);
    });
  }
}

@Component({
  selector: 'player-select',
  standalone: true,
  imports: [ FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
   <select [disabled]="!enable" [(ngModel)]="externalResult.homeValue">
    <option *ngFor="let selection of playerSelections" [value]="selection.betChoice">{{selection.playerName}}</option>
   </select>
  `
})
export class PlayerSelectionOutSideComponent extends InputOutSideBaseComponent implements OnInit  {
  playerSelections: PlayerSelection[];
  
  ngOnInit(): void {
    this.createSelection();
  }

  private createSelection(){
    this.playerSelections = this.resultDetail.oddFlex?.map(item => {
      return new PlayerSelection(item.betChoice, item.info.playerName);
    });
  }
}