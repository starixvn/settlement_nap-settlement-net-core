import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ResourcesIds } from '../constants';
import { ExternalResult, ExternalResultDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { Language } from '../../shared/language.native';
import { ResourceItem } from '../../shared/models/resource-item.model';
import { ResultStatusId, ScoreSourceType } from '../../shared/constants';

@Injectable()
export class BasketballService {
    constructor(
        private readonly intervalBackgroundPipe: IntervalBackgroundPipe,
        private readonly resourceNameByIdPipe: ResourceNameByIdPipe) { }

    findResultDetail(resultDetails: ResultDetail[], resourceId: string) {
        return _.find(resultDetails, (item) => _.isEqual(item.resourceId, resourceId) && item.checked);
    }

    getResultDetail(resultDetailList: ResultDetail[], isPopupCalc = true): ResultDetail[] {
        const resultDetail = resultDetailList.filter((map) => map.resourceId.length === 2);
        const quarter1 = _.find(resultDetail, (item) => item.resourceId === ResourcesIds.quarter1);
        const quarter2 = _.find(resultDetail, (item) => item.resourceId === ResourcesIds.quarter2);
        const quarter3 = _.find(resultDetail, (item) => item.resourceId === ResourcesIds.quarter3);
        const quarter4 = _.find(resultDetail, (item) => item.resourceId === ResourcesIds.quarter4);
        const halfTime = _.find(resultDetail, (item) => item.resourceId === ResourcesIds.htScore);
        const fullTime = _.find(resultDetail, (item) => item.resourceId === ResourcesIds.finalScore);
        const overtime = _.find(resultDetail, (item) => item.resourceId === ResourcesIds.ot);
        const result: ResultDetail[] = [];

        if (isPopupCalc) {
            result.push(quarter1);
            result.push(quarter2);
            result.push(halfTime);
            result.push(quarter3);
            result.push(quarter4);
            result.push(overtime);
            result.push(fullTime);
        } else {
            result.push(quarter1);
            result.push(quarter2);
            result.push(quarter3);
            result.push(quarter4);
            result.push(overtime);
            result.push(halfTime);
            result.push(fullTime);
        }

        return result;
    }

    getResourceExternalRefund(isLeader: boolean, externalResults: ExternalResult[], resultDetails: ResultDetail[]) {
        const resultConfirmRefund = externalResults.find(r => r.sourceId === ScoreSourceType.confirmRefundSource);
        if (isLeader && resultConfirmRefund) {
            resultDetails.forEach(result => this.resourceConfirmed(resultConfirmRefund.resultDetails ,result));
        }
    }

    private resourceConfirmed(externalResults: ExternalResultDetail[], resultDetail :ResultDetail){
        const resource = externalResults.find(resultConfirmed => resultConfirmed.resourceId === resultDetail.resourceId);
        if(resource) {
            resultDetail.homeValue = resource.homeValue;
            resultDetail.awayValue = resource.awayValue;
        } 
    }

    private resourceNormal(resultDetail :ResultDetail){
        if(resultDetail.resultStatusId == ResultStatusId.AutoCompleted || resultDetail.resultStatusId == ResultStatusId.ManualCompleted) {
            return new ResourceItem(resultDetail.resourceId, resultDetail.homeValue, resultDetail.awayValue);
        }
        return new ResourceItem(resultDetail.resourceId, "", "");
    }

    isDisabledUndoButton(resultDetails: ResultDetail[]) {
        const quarters = _.filter(resultDetails, (item) => !_.isEqual(item.resourceId, ResourcesIds.ot));
        return _.every(quarters, (item) => !item.checked);
    }

    getIntervalBackground(settlementStatusId: number) {
        return this.intervalBackgroundPipe.transform(settlementStatusId);
    }

    confirmationMessage(resultDetails: ResultDetail[]) {
        let confirmMessage = `${Language.CalculationConfirmMessage}<br/>${Language.CalculationAdditionalConfirmation}<br/>`;
        resultDetails.forEach((item: ResultDetail) => {
            const betTypeName = this.resourceNameByIdPipe.transform(item.resourceId);
            const value = `${item.homeValue}-${item.awayValue}`;
            confirmMessage += `${betTypeName}: ${value}<br/>`;
        });

        return confirmMessage;
    }

    getExternalResults(resultDetail: ResultDetail[], externalSourceId: number) {
        const externalResults = [];
        _.forEach(resultDetail, (item: ResultDetail) => {
            const externalFirstHalfResult = _.find(item.externalScores, result => result.sourceId === externalSourceId);
            externalResults.push(externalFirstHalfResult);
        });
        return externalResults;
    }
}