import { Match } from '../../../models';
import { Component, Input, OnChanges, ChangeDetectorRef, inject, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { AutoSettingPosition } from '../../../constants';
import * as _ from 'lodash';
import { PopupService, MultiSportService, SportMatchService, HandleActionsService } from '../../../services';
import { MessageBoxService } from '../../../../shared/services';
import { Language } from '../../../../shared/language.native';
import { ModalDialogMessage, AutoSettingMatchQuery } from '../../../../shared/models';
import { SportType, CalculationStatus } from '../../../../shared/constants';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../../../shared/pipes/pipes.module.native';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MultiSportsStore } from '../../../services/multi-sports.store';
import { SportSupportInstant } from '../../../constants/sport-instant';
import { MatchState } from '../../../models/match-state.model';
import { IntervalScorePipe } from '../../../../shared/pipes/interval-score.pipe';
import { MatchStateService } from '../../../services/match-state.service';

@Component({
  selector: 'match',
  templateUrl: './match.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, PipesModule, NgbTooltip],
  providers: [IntervalScorePipe, MatchStateService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchComponent implements OnChanges {
  @Input() match: Match;
  private sportMatchService = inject(SportMatchService);
  private popupService = inject(PopupService);
  private messageBoxService = inject(MessageBoxService);
  private multiSportService = inject(MultiSportService);
  private handleActionsService = inject(HandleActionsService);
  private matchStateService = inject(MatchStateService);
  public store = inject(MultiSportsStore);
  public language = Language;
  public readonly sportTypeCricket = SportType.cricket;
  public readonly sportSupportInstant = SportSupportInstant;
  public readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public math = Math;
  public matchState = new MatchState(this.matchStateService);

  constructor(readonly cd: ChangeDetectorRef) { }
    console.log(this.multiSport.sports)
    

  public ChangeDetectionCount = 0
  public get GetChangeDetectionCount() {

    return this.ChangeDetectionCount++
  }


  ngOnChanges(changes: SimpleChanges) {
    this.sportMatchService.getMatchIntervalScore(this.match, this.store.state.permission);
    this.matchState.getState(this.match, this.store);
  }

  public changeAutoSetting(match: Match) {
    if (this.store.state.permission.canAutoPayout) {
      this.popupService.openUpdatePayoutForMatch(match, () => { this.triggerRerender() });
    }
  }

  public getLog(matchId: string) {
    this.popupService.popupLog(matchId, this.store.request.fromDate, this.store.request.toDate);
  }

  public popupCalc(match: Match) {
    this.popupService.popupCalc(match);
  }

  public popupRefund(match: Match) {
    this.popupService.popupRefund(match);
  }

  public popupEarly(match: Match) {
    this.popupService.popupEarly(match);
  }

  public popupChangeRemarkSetting(match: Match) {
    if (this.isChangeSetting(match)) {
      this.popupService.popupChangeRemark(match, () => { this.triggerRerender(); });
    }
  }

  public isChangeSetting(match: Match) {
    return match.isCalculatingSingle !== CalculationStatus.waiting && match.isCalculatingSingle !== CalculationStatus.calculating
      && match.isCalculatingMP !== CalculationStatus.waiting && match.isCalculatingMP !== CalculationStatus.calculating;
  }

  public getInterval(match: Match) {
    const eSportNormalMaxMap = 9;
    if (_.isEqual(match.sportType, SportType.eSports) && match.bestOfMap > eSportNormalMaxMap) {
      match.isMatchBOMThirty = true;
      return _.slice(match.intervalScore, 0, eSportNormalMaxMap);
    }

    return match.intervalScore;
  }

  public updateInstant(match: Match) {
    this.dialogMessage.message = Language.instants.confirm;
    this.dialogMessage.title = Language.confirmationBox;
    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.doUpdateInstant(match);
    });
  }

  private async doUpdateInstant(match: Match) {
    const query = new AutoSettingMatchQuery(
      Number(match.matchId),
      AutoSettingPosition.autoInstant,
      !match.autoCalcSetting.isInstantForMatch
    );
    const result = await this.multiSportService.updateSettingMatch(query);
    if (result.errCode === 0) {
      match.autoCalcSetting.isInstantForMatch = !match.autoCalcSetting.isInstantForMatch;
      this.triggerRerender();
    } else {
      this.dialogMessage.message = result.errMsg;
      this.messageBoxService.alert(this.dialogMessage);
    }
  }

  triggerRerender() {
    this.matchState.getState(this.match, this.store);
    this.cd.detectChanges();
  }
}
