import { AutoSettingPosition } from "./../constants/change-setting-type.native";
import {inject, Injectable} from "@angular/core";
import {
  PopupProperties,
  Match,
  LeagueMatch,
} from "./../models";
import { DialogBoxService } from "./../../shared/services";
import { AutoSetting, DialogDataIframe } from "./../../shared/models";
import { Language } from "../../shared/language.native";
import { HandleActionsService } from "./handle-actions.service";
import { MultiSportService } from "./multi-sport.service";
import * as _ from "lodash";
import {
  CalculationStatus,
  SportType,
  EventStatus,
} from "../../shared/constants";
import { AutoType } from "../constants";
import { SportSingleAutoType } from "../constants/sport-instant";
import { LeagueAutoSettings } from "../../shared/models/league-auto-settings.model";
import { PopularSports } from "../constants/popular-sports.native";
import { RefreshMatchService } from "./refresh-match.service";
import { MatchState } from "../models/match-state.model";
import { BehaviorSubject } from "rxjs";
import {HttpParams} from "@angular/common/http";
import {TypeObject} from "../../shared/constants/type-object.native";
@Injectable()
export class PopupService {
  private readonly dialogBoxService = inject(DialogBoxService);
  private readonly multiSportService = inject(MultiSportService);
  private readonly handleActionsService = inject(HandleActionsService);
  private readonly refreshMatchService = inject(RefreshMatchService);
  private readonly generalWidthPopup = "845px";
  private readonly generalHeightPopup = "715px";
  private readonly listNewSport = [
    SportType.tennis,
    SportType.badminton,
    SportType.eSports,
    SportType.basketBall,
    SportType.cricket,
    SportType.volleyBall,
    SportType.tableTennis,
    SportType.baseBall
  ];
  public properties = new PopupProperties();



  public popupLog(matchCode: string, fromDate: string, toDate: string) {
    const src = `/home/log?matchCode=${encodeURIComponent(matchCode)}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=ALL`;
    const dialogData = new DialogDataIframe(Language.SettlementLog, src);
    this.dialogBoxService.popup(dialogData, "1011px", "800px");
  }

  public popupCalc(match: Match, state$: BehaviorSubject<MatchState>) {
    this.properties.title = Language.CalcPopupTitle;
    this.setPopupSize(match.sportType);

    if (this.listNewSport.includes(match.sportType)) {
      const sportName = PopularSports.get(match.sportType);
      this.properties.src = `/apps/${sportName}-recalculate?matchId=${match.matchId}&sportType=${match.sportType}`;
    } else {
      this.properties.src = `/apps/other-sports-recalculate?matchId=${match.matchId}&sportType=${match.sportType}`;
    }
    this.openAndHandlePopup(this.properties, match, state$);
  }

  public popupRefund(match: Match, state$: BehaviorSubject<MatchState>) {
    this.properties.title = Language.RefundPopupTitle;
    this.setPopupRefundSize(match.sportType);

    if (_.includes(this.listNewSport, match.sportType)) {
      const sportName = PopularSports.get(match.sportType);
      this.properties.src = `/apps/${sportName}-refund?matchId=${match.matchId}&sportType=${match.sportType}`;
    } else {
      this.properties.src = `/apps/other-sports-refund?matchId=${match.matchId}&sportType=${match.sportType}`;
    }

    this.openAndHandlePopup(this.properties, match, state$);
  }

  public popupEarly(match: Match, state$: BehaviorSubject<MatchState>) {
    this.properties.title = Language.EarlyPopupTitle;
    const sportName = PopularSports.get(match.sportType);
    this.properties.src = `/apps/${sportName}-early?matchId=${match.matchId}&sportType=${match.sportType}`;
    this.properties.width =
      match.sportType === SportType.cricket || match.sportType === SportType.baseBall
        ? "1450px"
        : this.isPopupEarlySOP(match.sportType)
          ? "1570px"
          : "845px";
    this.properties.height = this.isPopupEarlySOP(match.sportType)
      ? "958px"
      : "910px";
    this.openAndHandlePopup(this.properties, match, state$);
  }

  private isPopupEarlySOP(sportType: number) {
    return _.includes(
      [
        SportType.eSports,
        SportType.basketBall,
        SportType.badminton,
        SportType.cricket,
        SportType.volleyBall,
      ],
      sportType
    );
  }

  public popupChangeRemark(match: Match, state$: BehaviorSubject<MatchState>): void {
    this.properties.title = Language.remarkSettingTitle;
    this.properties.src = `/apps/remark-setting?matchId=${match.matchId}&matchCode=${match.matchCode}`;
    this.properties.width = "400px";
    this.properties.height = "250px";
    const frameSrc = encodeURI(this.properties.src);
    const dialogData = new DialogDataIframe(this.properties.title, frameSrc);
    this.dialogBoxService.popup(dialogData, this.properties.width, this.properties.height).subscribe(async () => {
      const settingResult = await this.multiSportService.getRemarkInfo(
        match.matchId
      );
      this.handleActionsService.handleChangeRemarkSetting(
        settingResult,
        match
      );
      this.refreshMatchService.refreshMatch(state$, match);
    });
  }

  public openAndHandlePopup(properties: PopupProperties, match: Match, state$: BehaviorSubject<MatchState>) {
    const frameSrc = encodeURI(properties.src);
    const dialogData = new DialogDataIframe(properties.title, frameSrc);
    this.dialogBoxService
      .popup(dialogData, properties.width, properties.height)
      .subscribe((result) => {
        if (result) {
          this.handleChangedMatch(match, state$);
        }
      });
  }

  public handleChangedMatch(match: Match, state$: BehaviorSubject<MatchState>) {
    match.isCalculatingSingle = CalculationStatus.waiting;
    match.showLink = false;
    match.newEventStatus = EventStatus.waiting;
    this.refreshMatchService.refreshMatch(state$, match);
  }

  private setPopupSize(sportType: number) {
    const groupOne = [SportType.badminton, SportType.eSports];
    const groupTwo = [SportType.beachVolleyball, SportType.volleyBall,SportType.tableTennis];
    if (_.includes(groupOne, sportType)) {
      this.properties.width = "1091px";
      this.properties.height = "760px";
    } else if (_.includes(groupTwo, sportType)) {
      this.properties.width = "900px";
      this.properties.height = "820px";
    } else if (sportType === SportType.cricket) {
      this.properties.width = "1018px";
      this.properties.height = "640px";
    } else if (sportType === SportType.tennis) {
      this.properties.width = this.generalWidthPopup;
      this.properties.height = this.generalHeightPopup;
    } else if (sportType === SportType.basketBall) {
      this.properties.width = "1005px";
      this.properties.height = "820px";
    }else if (sportType === SportType.baseBall) {
      this.properties.width = "1005px";
      this.properties.height = "1000px";
    } else {
      this.properties.width = "820px";
      this.properties.height = "500px";
    }
  }

  private setPopupRefundSize(sportType: number) {
    const sportsSameSize = [
      SportType.badminton,
      SportType.basketBall,
      SportType.tennis,
    ];
    if (_.includes(sportsSameSize, sportType)) {
      this.properties.width = this.generalWidthPopup;
      this.properties.height = this.generalHeightPopup;
    } else if (_.isEqual(sportType, SportType.eSports)) {
      this.properties.width = "920px";
      this.properties.height = "600px";
    } else if (sportType === SportType.baseBall) {
      this.properties.width = "700px";
      this.properties.height = "1000px";
    } else {
      this.properties.width = "780px";
      this.properties.height = "600px";
    }
  }

  public openUpdateTime(league: LeagueMatch, triggerRerender: () => void) {
    const autoType = _.isEqual(league.matches[0].sportType, SportType.cricket)
      ? AutoType.autoPayout
      : AutoType.direct;
    const src = `/apps/change-waiting-time?leagueId=${league.leagueId}&time=${league.autoWaitingTime}&refundWaitingTime=${league.refundWaitingTime}&pageType=DirectTime&autoType=${autoType}`;
    const frameSrc = encodeURI(src);
    const dialogData = new DialogDataIframe(
      Language.payout.titlePopupForLeague,
      frameSrc
    );
    const subscribe = this.dialogBoxService
      .popupHasResponse(dialogData, "600px", "310px")
      .subscribe((result) => {
        if (!_.isUndefined(result)) {
          const results = result.split(",");
          league.autoWaitingTime = Number(results[0]) ?? 0;
          league.refundWaitingTime = Number(results[1]) ?? 0;
          triggerRerender();
        }
        subscribe.unsubscribe();
      });
  }

  public async openAutoSettleSetting(typeObject: TypeObject, league: LeagueMatch, match: Match, state$: BehaviorSubject<MatchState>, triggerRerender: () => void) {
    const getParam = (key: keyof LeagueMatch | keyof Match, defaultValue: number = 0) =>
        league?.[key] || match?.[key] || defaultValue;

    const params = new HttpParams()
        .set('leagueId', getParam('leagueId'))
        .set('typeObject', typeObject)
        .set('matchId', getParam('matchId'))
        .set('sportType', getParam('sportType'))
        .set('refundWaitingTime', getParam('refundWaitingTime'));

    const src = `/apps/advanced-auto-setting-league?${params.toString()}`;
    const title = typeObject === "Match" ? Language.payout.titlePopup : Language.payout.titlePopupForLeague;
    const dialogData = new DialogDataIframe(title, encodeURI(src));

    const subscribe = this.dialogBoxService
        .popupHasResponse(dialogData, "780px", "350px")
        .subscribe((result) => {
          if(!result) {
            subscribe.unsubscribe();
            return;
          }

          const setting = Object.assign(new LeagueAutoSettings(), JSON.parse(result)) as LeagueAutoSettings;

          if(typeObject === "League") {
            this.handleUpdatedLeagueSetting(league, setting, triggerRerender);
            return;
          }
          this.handleUpdatedMatchSetting(match,setting,state$);
        });
  }

  private handleUpdatedLeagueSetting(league: LeagueMatch, settings: LeagueAutoSettings, triggerRerender: () => void) {
    league.autoCalcSetting.isAutoPayoutForLeague = (settings.mainEnabled || settings.earlyEnabled);
    league.autoCalcSetting.isEarlyPayoutForLeague = settings.earlyEnabled;
    league.autoWaitingTime = settings.mainWaitingTime;
    league.refundWaitingTime = settings.refundWaitingTime;

    if (settings.isApplyAll) {
      this.affectAutoPayoutForMatch(league);
      triggerRerender();
    }
  }

  private handleUpdatedMatchSetting(match: Match, setting: LeagueAutoSettings, state$: BehaviorSubject<MatchState>) {
    match.autoCalcSetting.isAutoPayoutForMatch = (setting.mainEnabled || setting.earlyEnabled);
    match.autoCalcSetting.isEarlyPayoutForMatch = setting.earlyEnabled;
    this.refreshMatchService.refreshMatch(state$, match);
  }

  public async openUpdatePayoutForLeague(league: LeagueMatch, triggerRerender: () => void) {
    const isMultiSelect = _.isNil(league.matches[0]) ? true : !_.isEqual(league.matches[0].sportType, SportType.cricket);
    const autoSetting = await this.multiSportService.getSetting(
      league.leagueId,
      0
    );
    this.applyNewSetting(league.autoCalcSetting, autoSetting.setting, false);
    const currentState = league.autoCalcSetting.isAutoPayoutForLeague ? 1 : league.autoCalcSetting.isDirectPayoutForLeague ? 5 : 0
    const src = `/apps/auto-setting-league?leagueId=${league.leagueId}&currentState=${isMultiSelect ? autoSetting.setting : currentState}&pageType=AutoSettingLeague&multiSelect=${isMultiSelect}`;
    const frameSrc = encodeURI(src);
    const dialogData = new DialogDataIframe(
      Language.payout.titlePopupForLeague,
      frameSrc
    );
    const subscribe = this.dialogBoxService
      .popupHasResponse(dialogData, "500px", "270px")
      .subscribe((result) => {
        if (_.isNil(result)) {
          return;
        }
        this.applyNewSetting(
          league.autoCalcSetting,
          result.split(",")[0],
          false,
          !isMultiSelect
        );
        if (_.isEqual(result.split(",")[1], "true")) {
          this.affectAutoPayoutForMatch(league);
          triggerRerender();
        }
        subscribe.unsubscribe();
      }
      );
  }

  public async openUpdateNewPayoutForLeague(league: LeagueMatch, triggerRerender: () => void) {
    const setting = await this.multiSportService.getSetting(
      league.leagueId,
      0
    );

    this.applyNewSetting(league.autoCalcSetting, setting.setting, false);
    const currentState = league.autoCalcSetting.isAutoPayoutForLeague ? 1 : league.autoCalcSetting.isDirectPayoutForLeague ? 5 : 0;
    const src = `/apps/advanced-auto-setting-league?leagueId=${league.leagueId}&sportType=${league.sportType}&autoSetting=${currentState}&waitingTime=${league.autoWaitingTime}&refundWaitingTime=${league.refundWaitingTime}`;
    const frameSrc = encodeURI(src);
    const dialogData = new DialogDataIframe(
      Language.payout.titlePopupForLeague,
      frameSrc
    );
    const subscribe = this.dialogBoxService
      .popupHasResponse(dialogData, "500px", "930px")
      .subscribe((result) => {
        if (_.isNil(result)) {
          return;
        }
        const leagueSettings = Object.assign(new LeagueAutoSettings(), JSON.parse(result));
        this.applyNewSetting(
          league.autoCalcSetting,
          leagueSettings.autoSetting.toString(),
          false,
          true
        );

        league.autoWaitingTime = leagueSettings.waitingTime;
        league.autoRetryTime = leagueSettings.retryTime;
        league.refundWaitingTime = leagueSettings.refundWaitingTime;
        if (leagueSettings.isApplyAll) {
          this.affectAutoPayoutForMatch(league);
          triggerRerender();
        }

        subscribe.unsubscribe();
      }
      );
  }

  private affectAutoPayoutForMatch(leagueMatch: LeagueMatch) {
    leagueMatch.matches.forEach((item, index) => {
      if (
        _.isEqual(
          item.eventStatus.toLowerCase(),
          EventStatus.running.toLowerCase()
        ) ||
        _.isEqual(
          item.eventStatus.toLowerCase(),
          EventStatus.closed.toLowerCase()
        )
      ) {
        item.autoCalcSetting.isAutoPayoutForMatch =
          leagueMatch.autoCalcSetting.isAutoPayoutForLeague;
        item.autoCalcSetting.isDirectPayoutForMatch =
          leagueMatch.autoCalcSetting.isDirectPayoutForLeague;
        item.autoCalcSetting.matchSetting =
          leagueMatch.autoCalcSetting.leagueSetting;
      }
      leagueMatch.matches[index] = { ...item };
    });
  }

  public async openUpdatePayoutForMatch(match: Match, state$: BehaviorSubject<MatchState>) {
    const isMultiSelect = !_.includes(SportSingleAutoType, match.sportType);
    const autoSetting = await this.multiSportService.getSetting(
      0,
      Number(match.matchId)
    );
    this.applyNewSetting(match.autoCalcSetting, autoSetting.setting);
    const currentState = match.autoCalcSetting.isAutoPayoutForMatch ? 1 : match.autoCalcSetting.isDirectPayoutForMatch ? 5 : 0
    const src = `/apps/auto-setting-league?matchId=${match.matchId}&currentState=${isMultiSelect ? autoSetting.setting : currentState}&pageType=AutoSettingMatch&multiSelect=${isMultiSelect}`;
    const frameSrc = encodeURI(src);
    const dialogData = new DialogDataIframe(
      Language.payout.titlePopup,
      frameSrc
    );
    const subscribe = this.dialogBoxService
      .popupHasResponse(dialogData, "500px", "270px")
      .subscribe((result) => {
        if (!_.isNil(result)) {
          this.applyNewSetting(match.autoCalcSetting, result, true, !isMultiSelect);
          this.refreshMatchService.refreshMatch(state$, match);
        }
        subscribe.unsubscribe();
      });
  }

  private applyNewSetting(
    autoSetting: AutoSetting,
    setting: string,
    isMatch = true,
    isNonBinary = false
  ) {
    if (isMatch) {
      autoSetting.isAutoPayoutForMatch = this.getSettingValue(setting, AutoSettingPosition.autoPayout, isNonBinary);
      autoSetting.isDirectPayoutForMatch = this.getSettingValue(setting, AutoSettingPosition.directPayout, isNonBinary);
    } else {
      autoSetting.isAutoPayoutForLeague = this.getSettingValue(setting, AutoSettingPosition.autoPayout, isNonBinary);
      autoSetting.isDirectPayoutForLeague = this.getSettingValue(setting, AutoSettingPosition.directPayout, isNonBinary);
    }
  }

  private getSettingValue(setting: string, position: number, isNonBinary: boolean): boolean {
    return isNonBinary ? Number(setting) === (position + 1) : setting[position] === "1";
  }
}
