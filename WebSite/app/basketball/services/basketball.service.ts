import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ResourcesIds } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { Language } from '../../shared/language.native';

@Injectable()
export class BasketballService {
    constructor(
        private readonly intervalBackgroundPipe: IntervalBackgroundPipe,
        private readonly resourceNameByIdPipe: ResourceNameByIdPipe) { }

    public findResultDetail(resultDetails: ResultDetail[], resourceId: string) {
        return _.find(resultDetails, (item) => _.isEqual(item.resourceId, resourceId) && item.checked);
    }

    public getResultDetail(resultDetailList: ResultDetail[], isPopupCalc = true): ResultDetail[] {
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

    public isDisabledUndoButton(resultDetails: ResultDetail[]) {
        const quarters = _.filter(resultDetails, (item) => !_.isEqual(item.resourceId, ResourcesIds.ot));
        return _.every(quarters, (item) => !item.checked);
    }

    public getIntervalBackground(settlementStatusId: number) {
        return this.intervalBackgroundPipe.transform(settlementStatusId);
    }

    public confirmationMessage(resultDetails: ResultDetail[]) {
        let confirmMessage = `${Language.CalculationConfirmMessage}<br/>${Language.CalculationAdditionalConfirmation}<br/>`;
        resultDetails.forEach((item: ResultDetail) => {
            const betTypeName = this.resourceNameByIdPipe.transform(item.resourceId);
            const value = `${item.homeValue}-${item.awayValue}`;
            confirmMessage += `${betTypeName}: ${value}<br/>`;
        });

        return confirmMessage;
    }

    public getExternalResults(resultDetail: ResultDetail[], externalSourceId: number) {
        const externalResults = [];
        _.forEach(resultDetail, (item : ResultDetail) => {
            const externalFirstHalfResult = _.find(item.externalScores, result => result.sourceId === externalSourceId);
            externalResults.push(externalFirstHalfResult);
        });
        return externalResults;
    }
}