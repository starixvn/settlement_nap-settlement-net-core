import { AutoSettingPosition } from "./../constants/change-setting-type.native";
import { Injectable } from "@angular/core";
import {
  PopupProperties,
  Match,
  SportMatch,
  LeagueMatch,
  AutoCalcSetting,
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

@Injectable()
export class PopupService {
  private readonly generalWidthPopup = "845px";
  private readonly generalHeightPopup = "715px";
  private readonly listNewSport = [
    SportType.tennis,
    SportType.badminton,
    SportType.eSports,
    SportType.basketBall,
    SportType.cricket,
    SportType.volleyBall,
  ];
  public properties = new PopupProperties();
  constructor(
    private readonly dialogBoxService: DialogBoxService,
    private readonly handleActionsService: HandleActionsService,
    private readonly multiSportService: MultiSportService
  ) {}
  public popupLog(matchCode: string, fromDate: string, toDate: string) {
    const src = `/home/log?matchCode=${encodeURIComponent(
      matchCode
    )}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=ALL`;
    const dialogData = new DialogDataIframe(Language.SettlementLog, src);
    this.dialogBoxService.popup(dialogData, "1011px", "800px");
  }

  public popupCalc(match: Match, sports: SportMatch[]) {
    this.properties.title = Language.CalcPopupTitle;
    this.setPopupSize(match.sportType);

    if (this.listNewSport.includes(match.sportType)) {
      let sportName = sports
        .find((item) => item.id === match.sportType)
        .name.toLowerCase();
      sportName = _.isEqual(sportName, "volleyball") ? "badminton" : sportName;
      this.properties.src = `/apps/${sportName}-recalculate?matchId=${match.matchId}&sportType=${match.sportType}`;
    } else {
      this.properties.src = `/apps/other-sports-recalculate?matchId=${match.matchId}&sportType=${match.sportType}`;
    }

    this.openAndHandlePopup(this.properties, match);
  }

  public popupRefund(match: Match, sports: SportMatch[]) {
    this.properties.title = Language.RefundPopupTitle;
    this.setPopupRefundSize(match.sportType);

    if (_.includes(this.listNewSport, match.sportType)) {
      let sportName = sports
        .find((item) => item.id === match.sportType)
        .name.toLowerCase();
      sportName = _.isEqual(sportName, "volleyball") ? "badminton" : sportName;
      this.properties.src = `/apps/${sportName}-refund?matchId=${match.matchId}&sportType=${match.sportType}`;
    } else {
      this.properties.src = `/apps/other-sports-refund?matchId=${match.matchId}&sportType=${match.sportType}`;
    }

    this.openAndHandlePopup(this.properties, match);
  }

  public popupEarly(match: Match, sports: SportMatch[]) {
    this.properties.title = Language.EarlyPopupTitle;
    let sportName = sports
      .find((item) => item.id === match.sportType)
      .name.toLowerCase();
    sportName = _.isEqual(sportName, "volleyball") ? "badminton" : sportName;
    this.properties.src = `/apps/${sportName}-early?matchId=${match.matchId}&sportType=${match.sportType}`;
    this.properties.width =
      match.sportType === SportType.cricket
        ? "1400px"
        : this.isPopupEarlySOP(match.sportType)
        ? "1480px"
        : "845px";
    this.properties.height = this.isPopupEarlySOP(match.sportType)
      ? "958px"
      : "910px";
    this.openAndHandlePopup(this.properties, match);
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

  public popupChangeRemark(match: Match) {
    this.properties.title = Language.remarkSettingTitle;
    this.properties.src = `/apps/remark-setting?matchId=${match.matchId}&matchCode=${match.matchCode}`;
    this.properties.width = "500px";
    this.properties.height = "270px";
    const frameSrc = encodeURI(this.properties.src);
    const dialogData = new DialogDataIframe(this.properties.title, frameSrc);
    this.dialogBoxService
      .popup(dialogData, this.properties.width, this.properties.height)
      .subscribe(async () => {
        const settingResult = await this.multiSportService.getRemarkInfo(
          match.matchId
        );
        this.handleActionsService.handleChangeRemarkSetting(
          settingResult,
          match
        );
      });
  }

  public openAndHandlePopup(properties: PopupProperties, match: Match) {
    const frameSrc = encodeURI(properties.src);
    const dialogData = new DialogDataIframe(properties.title, frameSrc);
    this.dialogBoxService
      .popup(dialogData, properties.width, properties.height)
      .subscribe((result) => {
        if (result) {
          this.handleChangedMatch(match);
        }
      });
  }

  public handleChangedMatch(match: Match) {
    match.isCalculatingSingle = CalculationStatus.waiting;
    match.showLink = false;
    match.newEventStatus = EventStatus.waiting;
  }

  private setPopupSize(sportType: number) {
    const groupOne = [SportType.badminton, SportType.eSports];
    const groupTwo = [SportType.beachVolleyball, SportType.volleyBall];
    if (_.includes(groupOne, sportType)) {
      this.properties.width = "1005px";
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
    } else {
      this.properties.width = "780px";
      this.properties.height = "600px";
    }
  }

  public openUpdateTime(league: LeagueMatch) {
    const autoType = _.isEqual(league.matches[0].sportType, SportType.cricket)
      ? AutoType.autoPayout
      : AutoType.direct;
    const src = `/apps/change-waiting-time?leagueId=${league.leagueId}&time=${league.autoWaitingTime}&pageType=DirectTime&autoType=${autoType}`;
    const frameSrc = encodeURI(src);
    const dialogData = new DialogDataIframe(
      Language.payout.titlePopupForLeague,
      frameSrc
    );
    this.dialogBoxService
      .popupHasResponse(dialogData, "600px", "310px")
      .subscribe((result) => {
        if (!_.isUndefined(result)) {
          league.autoWaitingTime = Number(result) ?? 0;
        }
      });
  }

  public async openUpdatePayoutForLeague(league: LeagueMatch) {
    const isMultiSelect = _.isNil(league.matches[0]) ? true :  !_.isEqual(league.matches[0].sportType, SportType.cricket);
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
    this.dialogBoxService
      .popupHasResponse(dialogData, "500px", "270px")
      .subscribe((result) => {
        if (!_.isNull(result)) {
          this.applyNewSetting(
            league.autoCalcSetting,
            result.split(",")[0],
            false,
             !isMultiSelect
          );
          this.affectAutoPayoutForMatch(
            league,
            _.isEqual(result.split(",")[1], "true")
          );
        }
      });
  }

  private affectAutoPayoutForMatch(
    leagueMatch: LeagueMatch,
    isApplyAll: boolean
  ) {
    if (isApplyAll) {
      leagueMatch.matches.forEach((item) => {
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
      });
    }
  }

  public async openUpdatePayoutForMatch(match: Match) {
    const isMultiSelect = !_.isEqual(match.sportType, SportType.cricket);
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
    this.dialogBoxService
      .popupHasResponse(dialogData, "500px", "270px")
      .subscribe((result) => {
        if (!_.isNull(result)) {
          this.applyNewSetting(match.autoCalcSetting, result, true, !isMultiSelect);
        }
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
