import { isEqual } from 'lodash';
import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Selection, GroupSelection } from '../models';
import { ItemsSelect, MultipleSelect } from '../../shared/models';
import { ResultStatusId, TicketStatus } from '../../shared/constants';

@Injectable()
export class CalculationFilterService {
    public initialTicketStatus() {
        const ticketStatusSelect: MultipleSelect = new MultipleSelect();
        ticketStatusSelect.items = [];
        ticketStatusSelect.maxWidth = '110px';

        const items: ItemsSelect[] = [];
        items.push(new ItemsSelect(TicketStatus.Running, "Running", "Running", true, true, true, []));
        items.push(new ItemsSelect(TicketStatus.Calculated, "Calculated", "Calculated", true, true, true, []));

        ticketStatusSelect.items = items;

        return ticketStatusSelect;
    }

    public initialResultStatus() {
        const resultStatusSelect: MultipleSelect = new MultipleSelect();
        resultStatusSelect.items = [];
        resultStatusSelect.maxWidth = '165px';

        const items: ItemsSelect[] = [];
        items.push(new ItemsSelect(ResultStatusId.RunningOne, ResultStatusId.RunningOne.toString(), "Running", true, true, true, []));
        items.push(new ItemsSelect(ResultStatusId.ManualCompleted, ResultStatusId.ManualCompleted.toString(),
            "Completed (Manual)", true, true, true, []));
        items.push(new ItemsSelect(ResultStatusId.AutoCompleted, ResultStatusId.AutoCompleted.toString(),
            "Completed (Auto)", true, true, true, []));

        resultStatusSelect.items = items;

        return resultStatusSelect;
    }

    public initialSelection(): MultipleSelect {
        const selectionSelect = new MultipleSelect();
        selectionSelect.items = [];
        selectionSelect.maxWidth = '400px';
        selectionSelect.selectionTitle = "All";
        selectionSelect.isCheckAll = true;

        return selectionSelect;
    }

    public groupBySelectionName(listSelection: Selection[]) {
        const listSelectionGroupByName = this.listSelectionGroupByName(listSelection);
        const groupSelection: GroupSelection[] = [];

        listSelectionGroupByName.forEach((item) => {
            const newList = listSelection.filter((x) => this.hasDashOnSelectionName(item.selectionName, x.selectionName)
                || this.hasNotDashOnSelectionName(item.selectionName, x.selectionName));
            groupSelection.push(new GroupSelection(item.selectionName, newList));
        });

        return groupSelection;
    }

    private hasDashOnSelectionName(groupName: string, selectionName: string) {
        const name = selectionName.split('-');
        if (this.hasDashCharacter(selectionName)) {
            return _.isEmpty(name[0])
                ? name[1].toLowerCase() === groupName.replace("-", "").toLowerCase()
                : name[0].toLowerCase() === groupName.toLowerCase();
        }

        return false;
    }

    private hasNotDashOnSelectionName(groupName: string, selectionName: string) {
        return !this.hasDashCharacter(selectionName) && selectionName.toLowerCase() === groupName.replace("-", "").toLowerCase();
    }

    private listSelectionGroupByName(listSelection: Selection[]) {
        const selections: Selection[] = [];

        _.forEach(listSelection, (item) => {
            const selectionName = this.getSelectionName(item.selectionName);
            selections.push(new Selection(selectionName));
        });

        return _.uniqBy(selections, (selection: Selection) => selection.selectionName);
    }

    private hasDashCharacter(name: string) {
        return name.split('-').length > 1;
    }

    private getSelectionName(name: string) {
        const selectionName = name.trim().split('-');
        return this.hasDashCharacter(name)
            ? _.isEmpty(selectionName[0]) ? selectionName[1] : selectionName[0] : name;
    }

    public renderSelection(groupSelection: GroupSelection[], selectedSelection: string[]) {
        const items: ItemsSelect[] = [];
        groupSelection.forEach((item) => {
            const temp = new ItemsSelect(
                0,
                item.name,
                item.name.slice(0, -1),
                this.currentSelectedSelection(selectedSelection, item.name),
                true,
                true,
                []);

            items.push(temp);
        });

        return items;
    }

    private currentSelectedSelection(selectedSelection: string[], value: string) {
        return _.isNil(selectedSelection) || _.isEmpty(selectedSelection) ? true : _.includes(selectedSelection, value);
    }

    public getSelectionByResultStatus(listSelection: Selection[], selectedResultStatus: string[]) {
        return _.isNil(listSelection)
            ? []
            : listSelection.filter((item) => _.isNil(selectedResultStatus)
                || selectedResultStatus.length === 0
                || _.indexOf(selectedResultStatus, item.resultStatusId.toString()) !== -1);
    }

    public getSelectionByTicketStatus(listSelection: Selection[], selectedTicketStatus: string[]) {
        return _.isNil(listSelection)
            ? []
            : listSelection.filter((item) => _.isNil(selectedTicketStatus)
                || selectedTicketStatus.length === 0
                || _.indexOf(selectedTicketStatus, item.ticketStatus) !== -1);
    }

    public getSelectionByGroupName(groupSelections: GroupSelection[], selectedName: string[]) {
        const listSelection: Selection[] = [];
        const group = this.getGroupSelectedName(groupSelections, selectedName);

        group.forEach((item: GroupSelection) => {
            item.selections.forEach((selection: Selection) => {
                listSelection.push(selection);
            });
        });

        return listSelection;
    }

    public getGroupSelectedName(groupSelections: GroupSelection[], selectedName: string[]) {
        return _.isNil(groupSelections)
            ? []
            : groupSelections.filter((item) => _.isNil(selectedName)
                || selectedName.length === 0
                || _.indexOf(selectedName, item.name.toString()) !== -1);
    }
}