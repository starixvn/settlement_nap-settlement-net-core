import { MessageBoxService } from './../../../../shared/services/message-box.service.native';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { LeagueMatch } from "../../../models";
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SportNewAutoPayout, SportSupportInstant } from "../../../constants/sport-instant";
import { MultiSportsStore } from "../../../services/multi-sports.store";
import { Permission } from "../../../models/permission.model";
import { Subject, distinctUntilChanged, map, takeUntil } from "rxjs";
import { isEqual } from "lodash";
import { BackgroundColor } from "../../../../shared/constants";
import { AutoSetting, AutoSettingLeagueQuery } from "../../../../shared/models";
import { Language } from "../../../../shared/language.native";
import { AutoSettingPosition } from "../../../constants";
import { HandleActionsService, MultiSportService, PopupService } from "../../../services";
import { TimeConverterPipe } from '../../../../shared/pipes/time-converter.pipe';
import { MatchComponent } from '../match/match.component';
@Component({
  selector: 'tr[league-row]',
  templateUrl: './league.component.html',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, TimeConverterPipe, MatchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LeagueComponent implements OnInit, OnDestroy {
  @Input() league: LeagueMatch;
  readonly sportSupportInstant = SportSupportInstant;
  readonly sportSupportNewAutoPayout = SportNewAutoPayout;
  permission: Permission;
  language = Language;
  ngUnsubscribe = new Subject();

  constructor(
    private readonly store: MultiSportsStore,
    private readonly multiSportService: MultiSportService,
    private readonly handleActionService: HandleActionsService,
    private readonly messageBoxService: MessageBoxService,
    private readonly popupService: PopupService,
    private readonly cd: ChangeDetectorRef) {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(1);
    this.ngUnsubscribe.complete();
  }

  ngOnInit(): void {
    this.store.state$.pipe(
      takeUntil(this.ngUnsubscribe),
      map(state => state.permission),
      distinctUntilChanged((prev, curr) => isEqual(prev, curr))).subscribe(data => this.permission = data);
  }

  collapseLeague() {
    this.league.collapse = !this.league.collapse;
  }

  getClassInstant() {
    const isInstant = this.league.autoCalcSetting.isInstantForLeague
    if (this.permission.canAutoPayout) {
      return isInstant ? BackgroundColor.iconOn : BackgroundColor.iconOff;
    } else {
      return isInstant ? BackgroundColor.iconOnDisabled : BackgroundColor.iconOffDisabled;
    }
  }

  updateInstantForLeague() {
    this.store.dialogMessage.title = Language.confirmationBox;
    this.store.dialogMessage.message = this.league.autoCalcSetting.isInstantForLeague ? Language.instants.confirmOffLeague : Language.instants.confirmOnLeague;
    this.store.dialogMessage.hasActionOnNoBtn = true;
    this.messageBoxService.confirm(this.store.dialogMessage, () => {
      this.doUpdateSettingLeague(this.league.autoCalcSetting, this.league, true);
    }, () => {
      this.doUpdateSettingLeague(this.league.autoCalcSetting, this.league, false);
    });
  }

  private async doUpdateSettingLeague(autoCalcSetting: AutoSetting, leagueMatch: LeagueMatch, isApplyAll: boolean) {
    this.store.dialogMessage.hasActionOnNoBtn = false;
    const query = new AutoSettingLeagueQuery(
      Number(leagueMatch.leagueId),
      AutoSettingPosition.autoInstant,
      !autoCalcSetting.isInstantForLeague,
      isApplyAll
    );
    const result = await this.multiSportService.updateSettingLeague(query);
    if (result.errCode === 0) {
      autoCalcSetting.isInstantForLeague = !autoCalcSetting.isInstantForLeague;
      if (isApplyAll) {
        this.handleActionService.handleAutoInstantForMatch(leagueMatch, autoCalcSetting.isInstantForLeague);
        this.cd.detectChanges();
      }
    } else {
      this.store.dialogMessage.message = result.errMsg;
      this.messageBoxService.alert(this.store.dialogMessage);
    }
  }

  openUpdateTime() {
    if (this.permission.canAutoPayout) {
      this.popupService.openUpdateTime(this.league,() => { this.cd.markForCheck() });
    }
  }

  changeAutoLeague() {
    if (this.permission.canAutoPayout) {
      SportNewAutoPayout.includes(this.league.sportType) ?
        this.popupService.openUpdateNewPayoutForLeague(this.league,() => { this.cd.markForCheck() })
        : this.popupService.openUpdatePayoutForLeague(this.league,() => { this.cd.markForCheck() });
    }

  }

  getAutoSettingLeague() {
    if (this.league.autoCalcSetting.isAutoPayoutForLeague && this.league.autoCalcSetting.isDirectPayoutForLeague) {
      return "BOTH";
    }
    if (this.league.autoCalcSetting.isAutoPayoutForLeague) {
      return "AUTO";
    }
    if (this.league.autoCalcSetting.isDirectPayoutForLeague) {
      return "DIRECT";
    }

    return "OFF";
  }
}