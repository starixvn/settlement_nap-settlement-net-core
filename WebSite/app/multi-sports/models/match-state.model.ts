import { map } from "lodash";
import { BackgroundColor } from "../../shared/constants";
import { MatchStateService } from "../services/match-state.service";
import { MultiSportsStore } from "../services/multi-sports.store";
import { Match } from "./match.model";
import {SportNewAutoPayout} from "../constants/sport-instant";

export class MatchState {
  hasValue: boolean;
  undecidedColor: string;
  autoSettingBackgroundColor: string;
  instantSettingBackgroundColor: string;
  resultHomeConfirmedBackgroundColor: string;
  resultAwayConfirmedBackgroundColor: string;
  totalHomeGames: string;
  totalAwayGames: string;
  halfTimeConfirmBackgroundColor: string;
  finalConfirmBackgroundColor: string;
  halfTimeHomeScore: string;
  halfTimeAwayScore: string;
  isHideHtScore: boolean;
  finalHomeScore: string;
  finalAwayScore: string;
  isHideFinalScore: boolean;
  canAutoSettlement: boolean;
  earlySettleBackground: string;
  isShowEarlySettleLink: string;
  isShowCalcLink: string;
  isShowRefundLink: string;
  eventStatusColor: string;
  calcColumnColor: string;
  instantClass: string;
  remarkTooltip: string;
  remarkClass: string;
  remarkState: string;
  autoSetting: string;
  mercyAbandonedInfo: {
    isMercy: boolean;
    isAbandoned: boolean;
    position: string;
    otherInfo: string;
  };
  hasProviderHT: boolean;
  hasProviderFT: boolean;

  constructor(service: MatchStateService, match: Match, store: MultiSportsStore) {
    this.hasValue = true;
    this.undecidedColor = service.getUndecidedColor(match.remark);
    this.autoSettingBackgroundColor = service.getBackgroundAutoSetting(match, store.state.permission);
    this.instantSettingBackgroundColor = service.getBackgroundAutoSetting(match, store.state.permission, false);
    this.resultHomeConfirmedBackgroundColor = service.ResultConfirmedBackGround(match, 'home');
    this.resultAwayConfirmedBackgroundColor = service.ResultConfirmedBackGround(match, 'away');
    this.totalHomeGames = service.getTotalHomeGames(match);
    this.totalAwayGames = service.getTotalAwayGames(match);
    this.halfTimeConfirmBackgroundColor = service.isHalfTimeConfirmed(match) ? BackgroundColor.resultConfirmed : '';
    this.finalConfirmBackgroundColor = service.isFinalConfirmed(match) ? BackgroundColor.resultConfirmed : '';
    this.halfTimeHomeScore = service.getHalfTimeHomeScore(match, store.state.permission);
    this.halfTimeAwayScore = service.getHalfTimeAwayScore(match, store.state.permission);
    this.isHideHtScore = service.isHideHtScore(match, store.state.permission);
    this.finalHomeScore = service.getFinalHomeScore(match, store.state.permission);
    this.finalAwayScore = service.getFinalAwayScore(match, store.state.permission);
    this.isHideFinalScore = service.isHideFinalScore(match, store.state.permission);
    this.canAutoSettlement = service.canAutoSettlement(match.sportType);
    this.earlySettleBackground = service.getEarlySettleBackground(match, store.request.overStatus);
    this.isShowEarlySettleLink = service.isShowEarlySettleLink(match, store.state.permission);
    this.isShowCalcLink = service.isShowCalculationLink(match, store.state.permission);
    this.isShowRefundLink = service.isShowRefundLink(match, store.request.matchCode, store.state.permission, store.request.overStatus);
    this.eventStatusColor = service.getEventStatusColor(match);
    this.calcColumnColor = service.getCalcColumnColor(match);
    this.instantClass = service.getClassInstant(match.autoCalcSetting.isInstantForMatch, store.state.permission.canAutoPayout);
    this.remarkTooltip = service.getRemarkStatusTooltip(match.remark);
    this.remarkClass = service.isChangeSetting(match) ? 'act-change-setting title' : '';
    this.remarkState = service.getRemarkState(match.remark);
    this.autoSetting = SportNewAutoPayout.includes(match.sportType) ? service.getAutoNewSetting(match.autoCalcSetting) : service.getAutoSetting(match.autoCalcSetting);
    this.mercyAbandonedInfo = service.getMercyAbandonedInfo(match);
    this.hasProviderHT = match.hasProviderHT;
    this.hasProviderFT = match.hasProviderFT;
  }
}

