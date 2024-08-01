import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { EarlySettlementStore } from '../../../../services/early-settlement/early-settlement.store';
import { GroupMap, ResultDetail } from '../../../../../shared/models/sportsbook-sop';
import { CommonModule } from '@angular/common';
import { PipesModule } from "../../../../../shared/pipes/pipes.module.native";
import { forEach, isEqual, isNil, join } from 'lodash';
import { ResultSettingQuery } from '../../../../../shared/models';
import { ResultSettingType, ResultStatus, TicketStatusText } from '../../../../../shared/constants';
import { NotifyService } from '../../../../services/notify.service';
import { AioService } from '../../../../../shared/services';
import { Language } from '../../../../../shared/language.native';
import { EarlySettlementService } from '../../../../services/early-settlement/early-settlement.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VerificationBaseService } from '../../../../../core/services/verification-base.service';
import { InputType } from '../../../../constants/input-type.constant';

@Component({
  selector: 'tbody[table-result-body]',
  standalone: true,
  imports: [CommonModule, FormsModule, PipesModule, MatTooltipModule],
  templateUrl: './table-result-body.component.html',
})
export class TableResultBodyComponent  implements OnInit{
  #store = inject(EarlySettlementStore);
  #notifyService = inject(NotifyService);
  #aioService = inject(AioService);
  #earlySettlementService = inject(EarlySettlementService);
  #verificationService = inject(VerificationBaseService);
  permission = this.#store.getPermission();
  match = this.#store.match;
  groupMap = this.#store.getGroupResultDetail();
  #matchId = this.#store.match().matchDetail.matchId
  resultTypeSelected = this.#store.resultType;
  ticketStatusSelected = this.#store.ticketStatus;
  resultStatusSelected = this.#store.resultStatus
  maxProviderCol = this.#store.match().matchDetail.providerCount > 2 ? 3 : 2
  #maxTeamName = 10;
  homeName = this.getTeamName(this.match().matchDetail.homeName);
  awayName = this.getTeamName(this.match().matchDetail.awayName);

  ngOnInit(): void {
      this.autoFillResultOnLoad();
  }

  onCollapsedClick(group: GroupMap) {
    group.collapsed = !group.collapsed;
  }

  onChangeGroupMap(group: GroupMap) {
    group.resultDetail.forEach((item) => {
      if (item.isShow) {
        item.checked = item.resultSettingData.isHoldResult ? false : group.checked;
        item.isResultWarning = false;
      }
    });
    this.#store.updateDisableAction();
  }

  onChangeBetType(resultDetail: ResultDetail, groupMap: GroupMap) {
    resultDetail.isResultWarning = false;
    groupMap.checked = groupMap.resultDetail.every((resultItem) => {
        if (resultItem.isShow) {
            return resultItem.checked;
        }
        return true;
    });

    this.#store.updateDisableAction();
  }


  changeSettingGroup(group: GroupMap) {
    if (this.permission.canCalculate || this.permission.canUncalculate || this.permission.canRefund) {
      const resourceIds = join(group.resultDetail.map(item => item.resourceId), ',');
      const query = new ResultSettingQuery(this.#matchId, ResultSettingType.holdResult,
        !group.isHoldResult, resourceIds);
      this.#notifyService.confirm(Language.holdResultGroupConfirmMessage, async () => {
        this.#aioService.changeResultSetting(query).then((result) => {
          this.#store.updateValueGroup(group, result);
        });
      });
    }
  }

  isChangeSetting(resultDetail: ResultDetail, groupMap: GroupMap) {
    if (this.permission.canCalculate || this.permission.canUncalculate || this.permission.canRefund) {
      this.#notifyService.clearError();
      const query = new ResultSettingQuery(this.#matchId, ResultSettingType.holdResult,
        !resultDetail.resultSettingData.isHoldResult, resultDetail.resourceId);
      this.#notifyService.confirm(Language.holdResultConfirmMessage, async () => {
        const result = await this.#aioService.changeResultSetting(query);
        this.#store.updateHoldStatus(resultDetail, result);
        groupMap.isHoldResult = groupMap.resultDetail.every(item => item.resultSettingData.isHoldResult);
      });
    }
  }

  canSettleResult(resultDetail: ResultDetail) {
    const isRunning = isEqual(resultDetail.ticketStatus, TicketStatusText.running)
      || isEqual(resultDetail.resultStatus, ResultStatus.noResult) || isEqual(resultDetail.resultStatus, ResultStatus.running);
    return isRunning && !resultDetail.isScoreMismatched && !isNil(this.#earlySettlementService.isExistInhouseResult(resultDetail));
  }


  checkResultIsMatched(resultDetail: ResultDetail) {
    const isExistedCoupleResult = resultDetail.inputType === InputType.coupleScore;
    resultDetail.isScoreMismatched = isExistedCoupleResult
      ? this.#verificationService.isMismatchedWarning(resultDetail)
      : this.#verificationService.isEarlyMismatchedWarning(resultDetail);
  }

  private getTeamName(teamName: string) {
    console.log(`${teamName.substring(0, this.#maxTeamName)}...`);
    console.log(this.#maxTeamName);
    return teamName.length > this.#maxTeamName ? `${teamName.substring(0, this.#maxTeamName)}...` : teamName;
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  verifyAndAutoFillResult(resultDetail: ResultDetail) {
    this.match().matchDetail.isSavedScore = false;
    if (resultDetail.inputType === InputType.coupleScore) {
      resultDetail.isScoreMismatched = this.#verificationService.isMismatchedWarning(resultDetail);
      this.#verificationService.autoFillScore(resultDetail);
      resultDetail.isScoreMismatched = this.#verificationService.isMismatchedWarning(resultDetail);
    } else {
      this.#verificationService.autoFillEarlyResult(resultDetail);
      resultDetail.isScoreMismatched = this.#verificationService.isEarlyMismatchedWarning(resultDetail);
    }
  }

   autoFillResultOnLoad() {
    forEach(this.match().resultDetails, (resultDetail) => {
      this.verifyAndAutoFillResult(resultDetail);
    });
  }
}
