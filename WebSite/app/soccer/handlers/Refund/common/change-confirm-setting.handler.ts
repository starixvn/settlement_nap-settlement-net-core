import { join } from "lodash";
import { ResourceItem, ResultSettingQuery } from "../../../../shared/models";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { ResourceIds, ResultSettingType } from "../../../../shared/constants";
import { inject } from "@angular/core";
import { AioService } from "../../../../shared/services/aio.service";
import { LogicService } from "../../../components/sop-refund/services/logic.service";
import { MatchDetailBase, ResultDetail } from "../../../models";
import { MatchDetailSoccer } from "../../../components/calc/models/match.model";

export class ChangeConfirmSettingHandler extends AbstractHandler {
    #aioService = inject(AioService);
    #logicService = inject(LogicService);
    public async handle(storage: RefundBaseStorage): Promise<void> {
        const {matchDetail} = storage.getMatch();
        const selectedResources = storage.getSelectedResource() as ResultDetail[];
        this.addGoalRecord(matchDetail, selectedResources);
        const isEnable = selectedResources.every(item => !item.resultSettingData.isConfirmedRefundSdt && !item.resultSettingData.isConfirmedRefund);
        if (matchDetail.isSettleDetermined || selectedResources.some(item => item.resultSettingData.isConfirmedRefundSdt)) {
            await this.changeConfirmResult(selectedResources, ResultSettingType.confirmRefundSDT, matchDetail.matchId, isEnable, storage);
        } else {
            await this.changeConfirmResult(selectedResources, ResultSettingType.confirmRefund, matchDetail.matchId, isEnable, storage);
        }

        this.#logicService.closePopupNotChanged();
    }

    private addGoalRecord(matchDetail: MatchDetailBase, selectedResources: ResultDetail[]) {
      if (matchDetail.applyGoalRecord) {
        const goalRecord = new ResultDetail();
        goalRecord.resourceId = ResourceIds.goalRecord;
        goalRecord.homeValue = matchDetail.goalRecord;
        selectedResources.push(goalRecord);
      }
    }

    private async changeConfirmResult(selectedResources: any[], settingType: number, matchId: number, isEnabled: boolean, storage: RefundBaseStorage) {
      if (selectedResources.length > 0) {
        const match = storage.getMatch();
        const resourceIds = join(selectedResources.map(item => item.resourceId), ',');
        const resourceItems = selectedResources.map(item => 
          new ResourceItem(item.resourceId, item.resourceName, item.homeValue, item.awayValue)
        );
  
        const query = new ResultSettingQuery(
          matchId, 
          settingType, 
          isEnabled, 
          resourceIds,
          resourceItems,
          match.matchDetail.sportType,
          match.matchDetail.childMatchType
        );
        
        const result = await this.#aioService.changeResultSetting(query);
        return result;
      }
  
      return false;
    }
}