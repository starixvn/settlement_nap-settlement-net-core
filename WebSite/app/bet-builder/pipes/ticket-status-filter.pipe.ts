import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { Selection } from "../models";
import { CalculationFilterService } from '../services';

@Pipe({
    name: 'ticketStatusFilter',
})

export class TicketStatusPipe implements PipeTransform {
    private readonly calculationFilterService: CalculationFilterService;

    constructor(calculationFilterService: CalculationFilterService) {
        this.calculationFilterService = calculationFilterService;
    }

    public transform(selectionItems: Selection[], selectedTicketStatus: string[]) {
        return this.calculationFilterService.getSelectionByTicketStatus(selectionItems, selectedTicketStatus);
    }
}