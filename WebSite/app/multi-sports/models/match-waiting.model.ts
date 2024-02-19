import { AutoSetting, MoreScore, Remark, Score } from "../../shared/models";

export class MatchWaiting {
  public matchId: string;
  public moreScores: MoreScore;
  public halfTimeHomeScore: number;
  public halfTimeAwayScore: number;
  public finalHomeScore: number;
  public finalAwayScore: number;
  public eventStatus: string;
  public newEventStatus: string;
  public suspenderHalfTime: string;
  public suspenderFullTime: string;
  public remark: Remark;
  public isCalculatingSingle: number;
  public isCalculatingMP: number;
  public isExistRunningTicket: boolean;
  public isExistMarkedTicket: boolean;
  public isCalculated: boolean;
  public isCalRefund: boolean;
  public isHalfTimeCal: boolean;
  public isMultiCaled: boolean;
  public isRefund: boolean;
  public earlySettleStatus: string;
  public betStatus: string;
  public autoPayoutStatus: number;
  public autoInstantStatus: number
  public isNotConsistentExFtScore: boolean;
  public isNotConsistentExHtScore: boolean;
  public confirmFullTimeScore: string;
  public confirmHalfTimeScore: string;
  public autoCalcSetting : AutoSetting;
  public eventStatusColor: string;
  public isHavingIntervalScore: boolean;
  public exHalfTimeScore: string;
  public exFullTimeScore: string;
}