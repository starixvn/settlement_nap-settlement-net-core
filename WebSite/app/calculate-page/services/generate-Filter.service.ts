import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { League as LeagueFilter,ItemsSelect } from '../../shared/models';
@Injectable()

export class GenerateFilterService {
    private readonly RunningGroup = 'All "Running" Status';
    private readonly CompletedGroup = 'All "Completed" Status';
    constructor() {
    }

    private createListOption(items) {
        const tickets = new Array<ItemsSelect>();
        items.forEach((item) => {
            const temp = new ItemsSelect(
                item.id,
                item.value,
                item.text,
                false,
                true,
                true,
                []);
                if(!_.isUndefined(item.group)) {
                    temp.type = item.group;
                }
            tickets.push(temp);
        });

        return tickets;
    }

    public renderMatchStatus() {
        const options = [
            { id: 1, value: "1", text: "Closed", group: this.RunningGroup },
            { id: 2, value: "2", text: "Running", group: this.RunningGroup },
            { id: 3, value: "3", text: "Internal", group: this.RunningGroup },
            { id: 4, value: "4", text: "Postponed", group: this.RunningGroup },
            { id: 5, value: "5", text: "Irregular Time 1H", group: this.RunningGroup },
            { id: 6, value: "6", text: "Irregular Time", group: this.RunningGroup },
            { id: 7, value: "7", text: "Wrong Team Name", group: this.RunningGroup },
            { id: 8, value: "8", text: "Suspended", group: this.RunningGroup },
            { id: 9, value: "9", text: "Completed", group: this.CompletedGroup },
            { id: 10, value: "10", text: "Refund", group: this.CompletedGroup },
            { id: 11, value: "11", text: "Abandoned", group: this.CompletedGroup }];

        return this.createListOption(options);
    }

    public renderRemarks() {
        const options = [
            { id: 16, value: "16", text: "MTD Hold" },
            { id: 2, value: "2", text: "Undecided" },
            { id: 1, value: "1", text: "Result Pending" },
            { id: 4, value: "4", text: "Under Settlement" },
            { id: 64, value: "64", text: "Hold Key" },
            { id: 87, value: "87", text: "Not On-hold"}];

        return this.createListOption(options);
    }

    public renderLeagues(options: LeagueFilter[]) {
        const tickets = new Array<ItemsSelect>();
        options.forEach((item: LeagueFilter) => {
          const temp = new ItemsSelect(
            item.leagueId,
            item.leagueId.toString(),
            item.leagueName,
            false,
            true,
            true,
            []);
          tickets.push(temp);
        });
        return tickets;
      }
}