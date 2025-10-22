import { OddFlexModel, ResultDetail } from "../../../../shared/models/sportsbook-sop";
import { PlayerScoreStatusChecker } from "../result-status.checker";
import { playerScoreType } from "./player-score.type";

export interface IPlayerScore {
  playerId: number;
  playerName: string;
  teamId: number;
  key: playerScoreType;
  resourceId: string;
  value: string;
  otherInfo: string;
  checked: boolean;
  isConfirmed: boolean;
  isHold: boolean;
  isCalculated: boolean;
  isRefunded: boolean;
  isConfirmedRefund: boolean;
  isEmpty: boolean;
}

export class PlayerScore implements IPlayerScore {
  teamId: number;
  playerId: number;
  playerName: string;
  key: playerScoreType;
  resourceId: string;
  value: string;
  otherInfo: string;
  checked = false;
  isConfirmed = false;
  isHold = false;
  isCalculated = false;
  isRefunded = false;
  isConfirmedRefund = false;
  isEmpty = false;

  static fromResultDetail(resultDetail: ResultDetail): PlayerScore {
    return new PlayerScoreBuilder()
      .withResourceId(resultDetail.resourceId)
      .withValue(resultDetail)
      .withStatusFlags(resultDetail)
      .withPlayerInfo(resultDetail.oddFlex)
      .build();
  }

  static toResultDetail(playerScore: PlayerScore): ResultDetail {
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = playerScore.resourceId;
    resultDetail.homeValue = playerScore.value;
    return resultDetail;
  }
}

class PlayerScoreBuilder {
  private readonly playerScore: PlayerScore;

  constructor() {
    this.playerScore = new PlayerScore();
  }

  withResourceId(resourceId: string): PlayerScoreBuilder {
    this.playerScore.resourceId = resourceId;
    this.playerScore.key = this.getScoreTypeFromResourceId(resourceId);
    return this;
  }

  withValue(resultDetail: ResultDetail): PlayerScoreBuilder {
    const { isConfirmedRefundSdt } = resultDetail.resultSettingData;
    if(isConfirmedRefundSdt && resultDetail.externalScores.length) {
      this.playerScore.value = resultDetail.externalScores[0].homeValue || "";
    } else {
      this.playerScore.value = resultDetail.homeValue || "";
    }
    return this;
  }

  withStatusFlags(resultDetail: ResultDetail): PlayerScoreBuilder {
    this.playerScore.isConfirmed = PlayerScoreStatusChecker.isConfirmed(resultDetail);
    this.playerScore.isHold = PlayerScoreStatusChecker.isHold(resultDetail);
    this.playerScore.isCalculated = PlayerScoreStatusChecker.isCalculated(resultDetail);
    this.playerScore.isRefunded = PlayerScoreStatusChecker.isRefunded(resultDetail);
    this.playerScore.isConfirmedRefund = PlayerScoreStatusChecker.isConfirmedRefund(resultDetail);
    this.playerScore.otherInfo = resultDetail.otherInfo || "";
    return this;
  }

  withPlayerInfo(oddFlexInfos: OddFlexModel[]): PlayerScoreBuilder {
    if (oddFlexInfos.length) {
      const oddFlexInfo = oddFlexInfos[0];
      this.playerScore.playerId = Number(oddFlexInfo.info.playerId) || 0;
      this.playerScore.playerName = oddFlexInfo.info.playerName || "";
      this.playerScore.teamId = Number(oddFlexInfo.info.teamId) || 0;
    } else {
      this.playerScore.playerId = 0;
      this.playerScore.playerName = "";
      this.playerScore.teamId = 0;
    }
    return this;
  }

  build(): PlayerScore {
    return this.playerScore;
  }

  private getScoreTypeFromResourceId(resourceId: string): playerScoreType {
    const resourceIdMapping: Record<string, playerScoreType> = {
      "653": "points",
      "662": "threePointFG",
      "659": "rebounds",
      "656": "assists",
      "665": "blocks",
      "667": "steals",
    };

    const resourcePrefix = resourceId?.substring(0, 3);
    const scoreType = resourceIdMapping[resourcePrefix];

    return scoreType;
  }
}
