import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ResultStatusId } from '../../shared/constants';
import { Selection } from '../models';

@Injectable()
export class CalculationConstraintService {
    public isValidResultValue(selection: Selection[]) {
        const resultWarning = _.find(selection, (x: Selection) => x.isResultWarning);
        return _.isEmpty(resultWarning);
    }

    public highlightedResultValue(selection: Selection[]) {
        selection.forEach((item: Selection) => {
            item.isResultWarning = this.isEmptyHomeValue(item);
        });
    }

    private isEmptyHomeValue(item: Selection) {
        return item.checked && (item.result === null || item.result === '');
    }

    public disableCalculate(selection: Selection[]) {
        const canCalculate = _.find(selection, (x: Selection) => x.checked);
        return _.isEmpty(canCalculate);
    }

    public disableUnCalculate(selection: Selection[]) {
        const canUnCalculate = _.find(selection, (x: Selection) =>
            x.checked
            && (x.resultStatusId === ResultStatusId.AutoCompleted
                || x.resultStatusId === ResultStatusId.ManualCompleted));
        return _.isEmpty(canUnCalculate);
    }
}