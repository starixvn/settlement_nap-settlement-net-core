import { Match } from '../../../models';
import { Component, Input, OnChanges, ChangeDetectorRef, inject, ChangeDetectionStrategy, SimpleChanges, OnInit, input } from '@angular/core';
import { AutoSettingPosition } from '../../../constants';
import * as _ from 'lodash';
import { PopupService, MultiSportService, SportMatchService, HandleActionsService, RefreshMatchService } from '../../../services';
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
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'match',
  templateUrl: './match.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, PipesModule, NgbTooltip],
  providers: [IntervalScorePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchComponent implements OnChanges, OnInit {
  @Input() match: Match;
  private sportMatchService = inject(SportMatchService);
  private popupService = inject(PopupService);
  private messageBoxService = inject(MessageBoxService);
  private multiSportService = inject(MultiSportService);
  private refreshMatchService = inject(RefreshMatchService);
  private matchStateService = inject(MatchStateService);
  public store = inject(MultiSportsStore);
  public language = Language;
  public readonly sportTypeCricket = SportType.cricket;
  public readonly sportSupportInstant = SportSupportInstant;
  public readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public matchState: MatchState;
  public state$ = new BehaviorSubject<MatchState>(null)

  constructor(readonly cd: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.state$.subscribe(state => {
      this.matchState = state;
      this.cd.detectChanges();
    })
  }

  // public ChangeDetectionCount = 0
  // public get GetChangeDetectionCount() {

  //   return this.ChangeDetectionCount++
  // }


  ngOnChanges(changes: SimpleChanges) {
      this.sportMatchService.getMatchIntervalScore(this.match, this.store.state.permission);
      this.state$.next(new MatchState(this.matchStateService, this.match, this.store));
  }

  public changeAutoSetting() {
    if (this.store.state.permission.canAutoPayout) {
      this.popupService.openUpdatePayoutForMatch(this.match, this.state$);
    }
  }

  public getLog(matchId: string) {
    this.popupService.popupLog(matchId, this.store.request.fromDate, this.store.request.toDate);
  }

  public popupCalc() {
    this.popupService.popupCalc(this.match, this.state$);
  }

  public popupRefund() {
    this.popupService.popupRefund(this.match, this.state$);
  }

  public popupEarly() {
    this.popupService.popupEarly(this.match, this.state$);
  }

  public popupChangeRemarkSetting() {
    if (this.isChangeSetting()) {
      this.popupService.popupChangeRemark(this.match, this.state$);
    }
  }

  public isChangeSetting() {
    return this.match.isCalculatingSingle !== CalculationStatus.waiting && this.match.isCalculatingSingle !== CalculationStatus.calculating
      && this.match.isCalculatingMP !== CalculationStatus.waiting && this.match.isCalculatingMP !== CalculationStatus.calculating;
  }

  public getInterval() {
    const eSportNormalMaxMap = 9;
    if (_.isEqual(this.match.sportType, SportType.eSports) && this.match.bestOfMap > eSportNormalMaxMap) {
      this.match.isMatchBOMThirty = true;
      return _.slice(this.match.intervalScore, 0, eSportNormalMaxMap);
    }

    return this.match.intervalScore;
  }

  public updateInstant() {
    this.dialogMessage.message = Language.instants.confirm;
    this.dialogMessage.title = Language.confirmationBox;
    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.doUpdateInstant();
    });
  }

  private async doUpdateInstant() {
    const query = new AutoSettingMatchQuery(
      Number(this.match.matchId),
      AutoSettingPosition.autoInstant,
      !this.match.autoCalcSetting.isInstantForMatch
    );
    const result = await this.multiSportService.updateSettingMatch(query);
    if (result.errCode === 0) {
      this.match.autoCalcSetting.isInstantForMatch = !this.match.autoCalcSetting.isInstantForMatch;
      this.refreshMatchService.refreshMatch(this.state$, this.match);
    } else {
      this.dialogMessage.message = result.errMsg;
      this.messageBoxService.alert(this.dialogMessage);
    }
  }
}
