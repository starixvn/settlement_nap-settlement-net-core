import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { Selection } from "../models";
import { CalculationFilterService } from '../services';

@Pipe({
    name: 'resultStatusFilter',
})

export class ResultStatusPipe implements PipeTransform {
    private readonly calculationFilterService: CalculationFilterService;

    constructor(calculationFilterService: CalculationFilterService) {
        this.calculationFilterService = calculationFilterService;
    }

    public transform(selectionItems: Selection[], selectedResultStatus: string[]) {
        return this.calculationFilterService.getSelectionByResultStatus(selectionItems, selectedResultStatus);
    }
}