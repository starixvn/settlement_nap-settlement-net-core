import { Injectable } from '@angular/core';
import { ItemsSelect, Sport, League } from '../models';
import * as _ from 'lodash';
@Injectable()

export class GenerateFilterService {
    private readonly RunningGroup = 'All "Running" Status';
    private readonly CompletedGroup = 'All "Completed" Status';
    popularSportType = [9, 2, 43, 5];

    public static createListOption(items) {
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
            tickets.push(temp);
        });

        return tickets;
    }

    public renderRemarks() {
        const options = [
            { id: 16, value: "16", text: "MTD Hold" },
            { id: 2, value: "2", text: "Undecided" },
            { id: 1, value: "1", text: "Result Pending" },
            { id: 4, value: "4", text: "Under Settlement" },
            { id: 64, value: "64", text: "Hold Key" },
            { id: 87, value: "87", text: "Not On-hold" },
        ];

        return GenerateFilterService.createListOption(options);
    }

    public renderMatchStatus() {
        const options = [
            { id: 1, value: "1", text: "Closed" },
            { id: 2, value: "2", text: "Running" },
            { id: 3, value: "3", text: "Kick-off/In-play" },
            { id: 4, value: "4", text: "Postponed" },
            { id: 5, value: "5", text: "Completed" },
            { id: 8, value: "8", text: "Completed (Running Ticket)" },
            { id: 6, value: "6", text: "Refund" },
            { id: 7, value: "7", text: "Internal" }];

        return GenerateFilterService.createListOption(options);
    }

    public renderMatchStatusGroupSelect() {
        const options = [
            { id: 1, value: "1", text: "Closed", group: this.RunningGroup },
            { id: 2, value: "2", text: "Running", group: this.RunningGroup },
            { id: 3, value: "3", text: "Internal", group: this.RunningGroup },
            { id: 4, value: "4", text: "Postponed", group: this.RunningGroup },
            { id: 5, value: "5", text: "Completed", group: this.CompletedGroup },
            { id: 6, value: "6", text: "Refund", group: this.CompletedGroup }];

        return this.createGroupItems(options);
    }


    public renderTicketStatus() {
        const selection = [
            { id: 1, value: "1", text: "Marked" },
            { id: 2, value: "2", text: "Un-Calculated Early Settle" },
            { id: 3, value: "3", text: "Un-Calculated Single" },
            { id: 4, value: "4", text: "Un-Calculated Parlay" }];

        return GenerateFilterService.createListOption(selection);
    }

    public renderAutoPayout() {
        const selection = [
            { id: 33, value: "33", text: "Auto Payout" },
            { id: 16, value: "16", text: "Direct Payout" },
            { id: 0, value: "0", text: "OFF" }];

        return GenerateFilterService.createListOption(selection);
    }

    public renderOverStatus() {
        const selection = [
            { id: 1, value: "1", text: "Early Over" },
            { id: 2, value: "2", text: "Main Over" },
            { id: 3, value: "3", text: "Over" },
            { id: 4, value: "4", text: "Settled with Running Ticket" }];

        return GenerateFilterService.createListOption(selection);
    }

    public renderSportTypes(options: Sport[], selected = true) {
        const tickets = new Array<ItemsSelect>();

        options.forEach((item: Sport) => {
            const temp = new ItemsSelect(
                item.sportType,
                item.sportType.toString(),
                item.sportName,
                selected,
                true,
                true,
                []);
            temp.type = item.group;
            tickets.push(temp);
        });
        return tickets;
    }

    public renderLeagues(options: League[]) {
        const tickets = new Array<ItemsSelect>();
        options.forEach((item: League) => {
            const temp = new ItemsSelect(
                item.leagueId,
                item.leagueId.toString(),
                item.leagueName,
                true,
                true,
                true,
                []);
            temp.type = item.group;
            tickets.push(temp);
        });
        return tickets;
    }

    public createGroupItems(items) {
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
            temp.type = item.group;
            tickets.push(temp);
        });

        return tickets;
    }
    public renderNewestLeagues(newLeague: League[], oldLeagues: ItemsSelect[]) {
        const newestLeagues = _.filter(newLeague, item => !_.some(oldLeagues, league => league.id === item.leagueId));
        if (newestLeagues.length > 0) {
            newestLeagues.forEach((item: League) => {
                const temp = new ItemsSelect(
                    item.leagueId,
                    item.leagueId.toString(),
                    item.leagueName,
                    false,
                    true,
                    true,
                    []);
                temp.type = item.group;
                this.reorganizeLeague(oldLeagues, temp);
            });
        }
        return oldLeagues;
    }

    private reorganizeLeague(listLeague: ItemsSelect[], newItem: ItemsSelect) {
        const firstIndexOfGroup = _.findIndex(listLeague, item => item.type === newItem.type);
        const lastIndexOfGroup = _.findLastIndex(listLeague, item => item.type === newItem.type);
        for (let i = firstIndexOfGroup; i <= lastIndexOfGroup; i++) {
            if (listLeague[i].text.localeCompare(newItem.text) > 0) {
                listLeague.splice(i, 0, newItem);
                return;
            }
        }
        listLeague.splice(lastIndexOfGroup, 0, newItem);
    }
}