import { BackgroundColor } from "../../shared/constants";
import { MatchStateService } from "../services/match-state.service";
import { MultiSportsStore } from "../services/multi-sports.store";
import { Match } from "./match.model";
import { Permission } from "./permission.model";

export class MatchState {
  hasValue = false;
  undecidedColor = '';
  autoSettingBackgroundColor = '';
  resultHomeConfirmedBackgroundColor = '';
  resultAwayConfirmedBackgroundColor = '';
  totalHomeGames = '';
  totalAwayGames = '';
  halfTimeConfirmBackgroundColor = '';
  finalConfirmBackgroundColor = '';
  halfTimeHomeScore = '';
  halfTimeAwayScore = '';
  isHideHtScore = false;
  finalHomeScore = '';
  finalAwayScore = '';
  isHideFinalScore = false;
  canAutoSettlement = false;
  earlySettleBackground = '';
  isShowEarlySettleLink = '';
  isShowCalcLink = '';
  isShowRefundLink = '';
  eventStatusColor = '';
  calcColumnColor = '';
  instantClass = '';
  remarkTooltip = '';
  remarkClass = '';
  remarkState = '';
  autoSetting = '';

  constructor(private service: MatchStateService) { }

  getState(match: Match, store: MultiSportsStore) {
    this.hasValue = true;
    this.undecidedColor = this.service.getUndecidedColor(match.remark);
    this.autoSettingBackgroundColor = this.service.getBackgroundAutoSetting(match, store.state.permission);
    this.resultHomeConfirmedBackgroundColor = this.service.ResultConfirmedBackGround(match, 'home');
    this.resultAwayConfirmedBackgroundColor = this.service.ResultConfirmedBackGround(match, 'away');
    this.totalHomeGames = this.service.getTotalHomeGames(match);
    this.totalAwayGames = this.service.getTotalAwayGames(match);
    this.halfTimeConfirmBackgroundColor = this.service.isHalfTimeConfirmed(match) ? BackgroundColor.resultConfirmed : '';
    this.finalConfirmBackgroundColor = this.service.isFinalConfirmed(match) ? BackgroundColor.resultConfirmed : '';
    this.halfTimeHomeScore = this.service.getHalfTimeHomeScore(match, store.state.permission);
    this.halfTimeAwayScore = this.service.getHalfTimeAwayScore(match, store.state.permission);
    this.isHideHtScore = this.service.isHideHtScore(match, store.state.permission);
    this.finalHomeScore = this.service.getFinalHomeScore(match, store.state.permission);
    this.finalAwayScore = this.service.getFinalAwayScore(match, store.state.permission);
    this.isHideFinalScore = this.service.isHideFinalScore(match, store.state.permission);
    this.canAutoSettlement = this.service.canAutoSettlement(match.sportType);
    this.earlySettleBackground = this.service.getEarlySettleBackground(match, store.request.overStatus);
    this.isShowEarlySettleLink = this.service.isShowEarlySettleLink(match, store.state.permission);
    this.isShowCalcLink = this.service.isShowCalculationLink(match, store.state.permission);
    this.isShowRefundLink = this.service.isShowRefundLink(match, store.request.matchCode, store.state.permission, store.request.overStatus);
    this.eventStatusColor = this.service.getEventStatusColor(match);
    this.calcColumnColor = this.service.getCalcColumnColor(match);
    this.instantClass = this.service.getClassInstant(match.autoCalcSetting.isInstantForMatch, store.state.permission.canAutoPayout);
    this.remarkTooltip = this.service.getRemarkStatusTooltip(match.remark);
    this.remarkClass = this.service.isChangeSetting(match) ? 'act-change-setting title' : '';
    this.remarkState = this.service.getRemarkState(match.remark);
    this.autoSetting = this.service.getAutoSetting(match.autoCalcSetting);
  }
}

