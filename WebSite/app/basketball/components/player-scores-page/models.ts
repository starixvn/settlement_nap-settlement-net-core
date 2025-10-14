import { ResultStatusId } from "../../../shared/constants/result-status-id.native";
import { ResultSettingModel } from "../../../shared/models/result-setting.model";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";

export type playerScoreType = 'points' | 'threePointFG' | 'rebounds' | 'assists' | 'blocks' | 'steals';

export interface Player {
  playerId: number;
  playerName: string;
  teamId: number;
  checked: boolean;
  scores: IPlayerScore[];
}

export interface IPlayerScore {
  playerId: number;
  playerName: string;
  teamId: number;
  key: playerScoreType;
  resourceId: string;
  value: string;
  checked: boolean;
  isConfirmed: boolean;
  isHold: boolean;
  isCalculated: boolean;
  isRefunded: boolean;
  isConfirmedRefund: boolean;
}


export class PlayerScore implements IPlayerScore {
  teamId: number;
  playerId: number;
  playerName: string;
  key: playerScoreType;
  resourceId: string;
  value: string;
  checked = false;
  isConfirmed= false;
  isHold= false;
  isCalculated= false;
  isRefunded= false;
  isConfirmedRefund= false;
  

  static fromResultDetail(resultDetail: ResultDetail): PlayerScore {
    const resourceIdMapping = {
      '653': 'points',
      '662': 'threePointFG', 
      '659': 'rebounds',
      '656': 'assists',
      '665': 'blocks',
      '667': 'steals'
    };
    const p = new PlayerScore();
    p.key = resourceIdMapping[resultDetail.resourceId.substring(0, 3)] as playerScoreType;
    p.resourceId = resultDetail.resourceId;
    p.value = resultDetail.homeValue;
    p.isConfirmed = resultDetail.resultStatusId === ResultStatusId.TraderConfirm;
    p.isHold = resultDetail.resultSettingData.isHoldResult;
    p.isCalculated = resultDetail.resultStatusId === ResultStatusId.AutoCompleted || resultDetail.resultStatusId === ResultStatusId.ManualCompleted;
    p.isRefunded = resultDetail.resultStatusId === ResultStatusId.Refund;
    p.isConfirmedRefund = resultDetail.resultSettingData.isConfirmedRefund;

    p.playerId = +resultDetail.oddFlex[0].info.playerId;
    p.playerName = resultDetail.oddFlex[0].info.playerName;
    p.teamId = +resultDetail.oddFlex[0].info.teamId;

    return p;
  }

  static toResultDetail(playerScore: PlayerScore): ResultDetail {
    const p = new ResultDetail();
    p.betType = playerScore.key;
    p.resourceId = playerScore.resourceId;
    p.homeValue = playerScore.value;
    p.checked = playerScore.checked;
    p.resultStatusId = playerScore.isConfirmed ? 3 : 0;
    p.resultSettingData = new ResultSettingModel();
    p.resultSettingData.isConfirmedRefund = playerScore.isConfirmedRefund;
    return p;
  }
}