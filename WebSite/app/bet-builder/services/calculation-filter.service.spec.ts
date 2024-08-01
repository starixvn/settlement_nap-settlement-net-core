import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CalculationFilterService } from '.';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Selection, GroupSelection } from '../models';
import { MultipleSelect, ItemsSelect } from '../../shared/models';
import { TicketStatus, ResultStatusId } from '../../shared/constants';

describe('BetBuilder - Calculation Filter Sevice', () => {
    let service: CalculationFilterService = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CalculationFilterService,
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

    beforeEach(inject([CalculationFilterService], (calculationFilterService: CalculationFilterService) => {
        service = calculationFilterService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    it('initialTicketStatus - should init ticket status selection', () => {
        const expected = new MultipleSelect();
        expected.items = [
            new ItemsSelect(TicketStatus.Running, "Running", "Running", true, true, true, []),
            new ItemsSelect(TicketStatus.Calculated, "Calculated", "Calculated", true, true, true, [])
        ];
        expected.maxWidth = '110px';
        expected.checkAllCheckBoxText = 'Check All';
        expected.allItemsCheckedText = 'All';

        const result = service.initialTicketStatus();

        expect(result).toEqual(expected);
    });

    it('initalResultStatus - should init result status selection', () => {
        const expected = new MultipleSelect();
        expected.items = [
            new ItemsSelect(ResultStatusId.RunningOne, ResultStatusId.RunningOne.toString(), "Running", true, true, true, []),
            new ItemsSelect(ResultStatusId.ManualCompleted, ResultStatusId.ManualCompleted.toString(), "Completed (Manual)", true, true, true, []),
            new ItemsSelect(ResultStatusId.AutoCompleted, ResultStatusId.AutoCompleted.toString(), "Completed (Auto)", true, true, true, [])
        ];
        expected.maxWidth = '165px';
        expected.checkAllCheckBoxText = 'Check All';
        expected.allItemsCheckedText = 'All';

        const result = service.initialResultStatus();

        expect(result).toEqual(expected);
    });

    it('initalSelection - should init selection', () => {
        const expected = new MultipleSelect();
        expected.items = [];
        expected.maxWidth = '400px';
        expected.checkAllCheckBoxText = 'Check All';
        expected.allItemsCheckedText = 'All';
        expected.selectionTitle = "All";
        expected.isCheckAll = true;

        const result = service.initialSelection();

        expect(result).toEqual(expected);
    });

    it('groupBySelectionName - should return group selection', () => {
        const selection = new Selection('test name');
        const selections = [selection];
        const expected = [new GroupSelection('test name', selections)];

        const result = service.groupBySelectionName(selections);

        expect(result).toEqual(expected);
    });

    it('renderSelection - should return item selects', () => {
        const selection = new Selection('test name');
        const selections = [selection];
        const groupSelection = [new GroupSelection('test name-', selections)];
        const expected = [new ItemsSelect(0, 'test name-', 'test name', true, true, true, [])];

        const result = service.renderSelection(groupSelection, ['test name-']);

        expect(result).toEqual(expected);
    });

    it('getSelectionByResultStatus - should return correct selection', () => {
        const selection = new Selection('test name');
        selection.resultStatusId = 5;
        const selections = [selection];

        const result = service.getSelectionByResultStatus(selections, ['5']);

        expect(result).toEqual(selections);
    });

    it('getSelectionByTicketStatus - should return correct selection', () => {
        const selection = new Selection('test name');
        selection.ticketStatus = 'Running';
        const selections = [selection];

        const result = service.getSelectionByTicketStatus(selections, ['Running']);

        expect(result).toEqual(selections);
    });

    it('getSelectionByGroupName - should return correct selection', () => {
        const selection = new Selection('test name');
        selection.resultStatusId = 5;
        const selections = [selection];
        const groupSelection = [new GroupSelection('test name-', selections)];

        const result = service.getSelectionByGroupName(groupSelection, ['test name-']);

        expect(result).toEqual(selections);
    });
});