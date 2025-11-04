
import { Injectable } from '@angular/core';
import { EarlyBaseService } from '../../core/services/early-base.service';
import { ResultDetail, GroupMap, MatchDetail } from '../../shared/models/sportsbook-sop';
import { ResultControlGroup } from '../constants/result-control-group.native';
import { Language, } from '../../shared/language.native';
import { isEmpty, isEqual, uniqBy } from 'lodash';
import { ResultStatusId } from '../../shared/constants';
import { PlayerBetTypes, PlayerTypes } from '../constants';
import * as _ from 'lodash';

@Injectable()
export class EarlyService extends EarlyBaseService {
    public getGroupMap(resultDetail: ResultDetail[], matchDetail: MatchDetail) {
        const list = uniqBy(resultDetail, (item) => item.groupName);
        const maps: GroupMap[] = [];

        list.forEach((item) => {
            const newResultDetail = resultDetail.filter((x) => x.groupName === item.groupName);
            maps.push(new GroupMap(item.groupName, newResultDetail));
        });
        maps.forEach(item => {
            item.isHoldResult = item.resultDetail.every(i => i.resultSettingData.isHoldResult);
            item.groupName = this.ReplaceTeamName(item.groupName, matchDetail);
            item.resultDetail.forEach(i => {
                i.groupName = item.groupName;
            });
        });

        return maps;
    }

    private ReplaceTeamName(groupName: string, matchDetail: MatchDetail) {
        const teamNamePattern = /@teamName-(\d+)/;
        const match = groupName.match(teamNamePattern);

        if (match) {
            const teamId = parseInt(match[1]);
            return teamId === matchDetail.homeId
                ? groupName.replace(teamNamePattern, matchDetail.homeName)
                : groupName.replace(teamNamePattern, matchDetail.awayName);
        }

        return groupName;
    }


    getConfirmMessage(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
        let confirmMessage = `${Language.CalculationConfirmMessageEarly}<br/>`;
        resultDetails.forEach((x: ResultDetail) => {
            confirmMessage += `${x.betTypeName}: ${this.getResourceName(x, matchDetail)}<br/>`;
        });

        return confirmMessage;
    }

    getConfirmMessageSDT(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
        let confirmMessage = `${Language.confirmRefund.sdtConfirm.replace("{0}", "")}`;
        resultDetails.forEach((x: ResultDetail) => {
            confirmMessage += `${x.betTypeName}: ${this.getResourceName(x, matchDetail)}<br/>`;
        });

        return confirmMessage;
    }

    private getResourceName(resultDetail: ResultDetail, matchDetail: MatchDetail): string {
        if (resultDetail.inputType === ResultControlGroup.teamSelection) {
            return this.getHomeAwayValue(resultDetail, matchDetail);
        } else if (resultDetail.inputType === ResultControlGroup.textBox) {
            return `${resultDetail.homeValue}`;
        } else if (resultDetail.inputType === ResultControlGroup.playerSelect) {
            return this.getPlayerResultName(resultDetail);
        } else if (resultDetail.inputType === ResultControlGroup.yesNoNone) {
            return this.getYesNoValue(resultDetail);
        }
        return '';
    }


    private getPlayerResultName(resultDetail: ResultDetail): string {
        return resultDetail.oddFlex.find(item => isEqual(item.betChoice, resultDetail.homeValue))?.info.playerName ?? 'None';
    }

    private getHomeAwayValue(resultDetail: ResultDetail, matchDetail: MatchDetail): string {
        if (isEqual(resultDetail.homeValue, "H")) {
            return matchDetail.homeName;
        }

        if (isEqual(resultDetail.homeValue, "A")) {
            return matchDetail.awayName;
        }

        return "Neither";

    }

    private getYesNoValue(resultDetail: ResultDetail): string {
        if (isEqual(resultDetail.homeValue, "Y")) {
            return "Yes";
        }

        if (isEqual(resultDetail.homeValue, "N")) {
            return "No";
        }

        return "None";

    }

    findRelatedResourceInValid(resultDetails: ResultDetail[], selectedResource: ResultDetail[]) {
        const relatedResourceIds = selectedResource.filter(r => r.relatedCalResources).map(r => r.relatedCalResources);
        const resources = relatedResourceIds.map(i => {
            const listIds = i.split(',');
            const relatedResourceInvalid = resultDetails.filter(r => listIds.includes(r.resourceId) &&
                !r.checked &&
                r.resultStatusId !== ResultStatusId.ManualCompleted &&
                r.resultStatusId !== ResultStatusId.AutoCompleted);
            return relatedResourceInvalid.length > 0 ? relatedResourceInvalid.map(r => r.resourceId) : [];
        }).flat();
        
        return resources.length > 0 
                ? resultDetails.filter(r => resources.includes(r.resourceId)).map(r => `${r.resourceId} - ${r.betTypeName}`).join('<br/>') 
                : "";
    }

    private shouldCheckInconsistencyMultiStats(betType: string) {
        const targetBetTypes = [
            PlayerBetTypes.stealsBlocks,
            PlayerBetTypes.reboundsAssists,
            PlayerBetTypes.reboundsPoints,
            PlayerBetTypes.reboundsAssistsPoints
        ];
        return targetBetTypes.includes(betType);
    }

    private checkInconsistencyForMultiStats(resource: ResultDetail, relatedResources: ResultDetail[]): boolean {
        const selectedHomeValue = parseInt(resource.homeValue) || 0;
        const sumOfRelatedHomeValues = relatedResources.reduce((sum, r) => {
            const value = parseInt(r.homeValue) || 0;
            return sum + value;
        }, 0);

        return selectedHomeValue !== sumOfRelatedHomeValues;
    }

    private checkInconsistencyForDoubleOrTriple(
        resource: ResultDetail, 
        relatedResources: ResultDetail[], 
        minGreaterThan9: number, 
        minLessThan10: number
    ): boolean {
        const countGreaterThan9 = relatedResources.filter(r => {
            return !isEmpty(r.homeValue) && parseInt(r.homeValue) > 9;
        }).length;

        if (countGreaterThan9 >= minGreaterThan9) {
            return !isEqual(resource.homeValue, "Y");
        }

        const countLessThan10 = relatedResources.filter(r => {
            return !isEmpty(r.homeValue) && parseInt(r.homeValue) < 10;
        }).length;

        if (countLessThan10 >= minLessThan10) {
            return !isEqual(resource.homeValue, "N");
        }

        return !isEqual(resource.homeValue, "None");
    }

    private checkInconsistencyForDoubleDouble(resource: ResultDetail, relatedResources: ResultDetail[]) {
        return this.checkInconsistencyForDoubleOrTriple(resource, relatedResources, 2, 4);
    }

    private checkInconsistencyForTripleDouble(resource: ResultDetail, relatedResources: ResultDetail[]) {
        return this.checkInconsistencyForDoubleOrTriple(resource, relatedResources, 3, 3);
    }

    private checkInconsistencyForHeadToHead(resource: ResultDetail, relatedResources: ResultDetail[]) {
       return false;  
    }

    isInconsistentWithRelatedResources(resultDetails: ResultDetail[], selectedResource: ResultDetail[]) {
        const inconsistentResourceIds: string[] = [];

        selectedResource.forEach(resource => {
            if (!resource.relatedCalResources || isEmpty(resource.relatedCalResources.trim())) {
                return;
            }

            const relatedResourceIds = resource.relatedCalResources.split(',').map(id => id.trim());
            const relatedResources = resultDetails.filter(r => relatedResourceIds.includes(r.resourceId));

            if (relatedResources.length === 0) {
                return;
            }

            let isInconsistent = false;
            if (this.shouldCheckInconsistencyMultiStats(resource.betType)) {
                isInconsistent = this.checkInconsistencyForMultiStats(resource, relatedResources);
            } else if(_.isEqual(resource.betType, PlayerBetTypes.doubleDouble)) {
                isInconsistent = this.checkInconsistencyForDoubleDouble(resource, relatedResources);
            } else if(_.isEqual(resource.betType, PlayerBetTypes.tripleDouble)) {
                isInconsistent = this.checkInconsistencyForTripleDouble(resource, relatedResources);
            } else if(PlayerTypes.headToHead.includes(resource.betType)) {
                isInconsistent = this.checkInconsistencyForHeadToHead(resource, relatedResources);
            }

            if (isInconsistent) {
                inconsistentResourceIds.push(resource.resourceId);
            }
        });

        return inconsistentResourceIds.length > 0 
                ? resultDetails.filter(r => inconsistentResourceIds.includes(r.resourceId)).map(r => `${r.resourceId} - ${r.betTypeName}`).join('<br/>') 
                : "";
    }
}