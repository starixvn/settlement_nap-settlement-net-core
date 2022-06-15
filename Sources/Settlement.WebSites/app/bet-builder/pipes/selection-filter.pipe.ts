import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { GroupSelection } from "../models";
import { CalculationFilterService } from '../services';

@Pipe({
    name: 'selectionFilter',
})

export class SelectionPipe implements PipeTransform {
    private readonly calculationFilterService: CalculationFilterService;

    constructor(calculationFilterService: CalculationFilterService) {
        this.calculationFilterService = calculationFilterService;
    }

    public transform(groupSelections: GroupSelection[], selectedName: string[]) {
        return this.calculationFilterService.getGroupSelectedName(groupSelections, selectedName);
    }
}