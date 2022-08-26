import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CalculationConstraintService } from '.';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Selection } from '../models';

describe('BetBuilder - Calculation Constraint Sevice', () => {
    let service: CalculationConstraintService = null;
    const selectionName = "Selection Name";

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CalculationConstraintService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
            ],
            imports: [
                HttpClientModule,
                NgbModule,
            ],
        });
    });

    beforeEach(inject([CalculationConstraintService], (calculationConstraintService: CalculationConstraintService) => {
        service = calculationConstraintService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    it('Not any warning on selection item should return true', () => {
        const selections: Selection[] = [];
        const item = new Selection(selectionName);
        selections.push(item);

        const item1 = new Selection(selectionName);
        selections.push(item1);

        const expected = service.isValidResultValue(selections);

        expect(expected).toBe(true);
    });

    it('should exist a selection item with resultWarning true when result item is null or empty.', () => {
        const selections: Selection[] = [];
        const item = new Selection(selectionName);
        item.result = null;
        item.checked = true;
        selections.push(item);

        service.highlightedResultValue(selections);

        const value = selections[0].isResultWarning;

        expect(value).toBe(true);
    });

    it('Not any checked on selection item should return true.', () => {
        const selections: Selection[] = [];
        const item = new Selection(selectionName);
        item.checked = false;
        selections.push(item);

        const expected = service.disableCalculate(selections);

        expect(expected).toBe(true);
    });

    it('Not any checked and result statusId = 2 or 5 on selection item should return true.', () => {
        const selections: Selection[] = [];
        const item = new Selection(selectionName);
        item.checked = false;
        item.resultStatusId = 1;
        selections.push(item);

        const expected = service.disableUnCalculate(selections);

        expect(expected).toBe(true);
    });
});