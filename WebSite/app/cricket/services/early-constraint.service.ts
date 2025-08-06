import { Injectable } from '@angular/core';
import { ResultControlGroup } from '../constants';
import * as _ from 'lodash';
import { MatchDetail, ResultDetail, GroupMap, InputOption, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { EarlyBaseService } from '../../core/services/early-base.service';
import { ResultByPlayerNamePipe, ResultValuePipe } from '../pipes';
import { Language } from '../../shared/language.native';
import { ItemsSelect, MultipleSelect } from '../../shared/models';
@Injectable()
export class EarlyConstraintService extends EarlyBaseService {
    constructor(
        private readonly resultValuePipe: ResultValuePipe,
        private readonly resultByPlayerNamePipe: ResultByPlayerNamePipe) {
        super();
    }

    private isEmptyHomeOrAwayValue(item: ResultDetail) {
        return item.homeValue === null || _.isEmpty(item.homeValue)
            || item.awayValue === null || _.isEmpty(item.awayValue);
    }

    getGroupMap(resultDetail: ResultDetail[], matchDetail: MatchDetail) {
        resultDetail.forEach(item => item.groupName = item.groupName.replace('Home', matchDetail.homeName)
            .replace('Away', matchDetail.awayName));
        const list = _.uniqBy(resultDetail, (item) => item.groupName);
        const maps: GroupMap[] = [];

        list.forEach((item) => {
            const newResultDetail = resultDetail.filter((x) => x.groupName === item.groupName);
            maps.push(new GroupMap(item.groupName, newResultDetail));
        });
        maps.forEach(item => {
            item.isHoldResult = item.resultDetail.every(i => i.resultSettingData.isHoldResult);
            item.teamName = _.includes(item.groupName, matchDetail.homeName) ? matchDetail.homeName :
                _.includes(item.groupName, matchDetail.awayName) ? matchDetail.awayName : '';
        });

        return maps;
    }

    async verifyBeforeCalculation(selectedResultDetail: ResultDetail[], isLeader: boolean) {
        const existResultConfirmed = _.find(selectedResultDetail, item => item.resultSettingData.isConfirmedRefund);
        this.verifyResultValue(selectedResultDetail);
        const isInValid = this.isInValidResultValue(selectedResultDetail);

        if (!_.isNil(existResultConfirmed)) {
            return Language.confirmRefund.calculateResultNotConfirmed;
        } else if (isInValid) {
            return isLeader ? Language.sop.leader.blankResult : Language.sop.nonLeader.blankResult;
        } else {
            return "";
        }
    }

    private verifyResultValue(resultDetail: ResultDetail[]) {
        resultDetail.forEach((item: ResultDetail) => {
            if (_.isEqual(ResultControlGroup.CoupleScores, item.inputType)) {
                item.isResultWarning = this.isEmptyHomeOrAwayValue(item);
            } else {
                item.isResultWarning = this.isEmptyHome(item);
            }
        });
    }

    private renderPlayersSelect(inputOptions: InputOption[], value: string) {
        const options = [];
        inputOptions.forEach((item) => {
            const checked = value.includes(item.value);
            options.push({ id: item.playerId, value: item.value, text: item.optionName, checked });
        });

        return this.createListOption(options);
    }

    getPlayerResultName(result: ResultDetail) {
        if (result.inputType === ResultControlGroup.PlayerSelect && _.isEqual(result.homeValue, "N")) {
            return "None";
        }

        return this.resultByPlayerNamePipe.transform(result.homeValue, result.inputOptions);
    }

    getResultNameByValue(result: ResultDetail) {
        return this.resultValuePipe.transform(result.homeValue, result.betType);
    }

    generateMultipleResultSelect(resultDetails: ResultDetail[]) {
        resultDetails.forEach((result) => {
            if (result.inputOptions && result.inputOptions.length > 0) {
                result.multipleResultSelect = this.createMultipleResultSelect();
                result.multipleResultSelect.items = this.renderPlayersSelect(result.inputOptions, result.homeValue);
                result.multipleResultSelect.maxWidth = '160px';

                this.generateExternalMultipleResultSelect(result.externalScores, result.inputOptions);
            }
        });
    }

    private generateExternalMultipleResultSelect(externalScores: ExternalResultDetail[], inputOptions: InputOption[]) {
        externalScores.forEach((externalScore) => {
            if (externalScore.sourceId >= 100) {
                externalScore.multipleResultSelect = this.createMultipleResultSelect();
                externalScore.multipleResultSelect.items = this.renderPlayersSelect(inputOptions, externalScore.homeValue);
                externalScore.multipleResultSelect.maxWidth = '70px';
            }
        });
    }

    private createMultipleResultSelect() {
        const multipleResultSelect = new MultipleSelect();
        multipleResultSelect.disableCheckAll = true;

        return multipleResultSelect;
    }

    getOtherInfo(resultDetails: ResultDetail[]) {
        resultDetails.forEach(resultDetail => {
            if (resultDetail.inputType === ResultControlGroup.PlayerMultipleSelect) {
                const selectedItems = resultDetail.multipleResultSelect.items.filter(item => item.checked);
                const otherInfo = selectedItems.length > 0 ? selectedItems.map(item => item.id).join(',') : '';
                resultDetail.otherInfo = otherInfo;
            }

            if (resultDetail.inputType === ResultControlGroup.PlayerSelect) {
                const isNoneValue = _.isEqual(resultDetail.homeValue, 'N');
                
                resultDetail.otherInfo = isNoneValue ? '' : _.find(resultDetail.inputOptions, option =>
                    _.isEqual(resultDetail.homeValue, option.value))?.playerId.toString();
            }

            if (resultDetail.inputType === ResultControlGroup.ScoreWithLabel) {
                resultDetail.otherInfo = resultDetail.inputOptions[0]?.playerId.toString();
            }
            
        });
    }

    autoFillItemSelect(resultDetail: ResultDetail, correctScore: ExternalResultDetail = null) {
        if (resultDetail.inputType === ResultControlGroup.PlayerMultipleSelect) {
            if (_.isNil(correctScore)) {
                resultDetail.multipleResultSelect = _.cloneDeep(resultDetail.multipleResultSelect);
                resultDetail.multipleResultSelect.items.forEach(item => item.checked = false);
            } else {
                resultDetail.multipleResultSelect = _.isNil(correctScore.multipleResultSelect)
                    ? { ...resultDetail.multipleResultSelect, items: this.renderPlayersSelect(resultDetail.inputOptions, correctScore.homeValue) }
                    : _.cloneDeep(correctScore.multipleResultSelect);
                resultDetail.multipleResultSelect.maxWidth = '160px';
            }
        }
    }

    public createListOption(items) {
        const tickets = new Array<ItemsSelect>();
        items.forEach((item) => {
            const temp = new ItemsSelect(
                item.id,
                item.value,
                item.text,
                item.checked,
                true,
                true,
                []);
            if (item.hasPermission ?? true) {
                tickets.push(temp);
            }
        });

        return tickets;
    }
}