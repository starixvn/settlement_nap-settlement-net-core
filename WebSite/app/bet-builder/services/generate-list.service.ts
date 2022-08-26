import { League, SportType } from './../models';
import { Injectable } from '@angular/core';
import { ItemsSelect } from './../../shared/models';

@Injectable()

export class GenerateListService {
    public renderStatuses() {
        const options = [
            { id: 1, value: "Running", text: "Running" },
            { id: 2, value: "Completed", text: "Completed" },
            { id: 3, value: "No Ticket", text: "No Ticket"}];
        const items = new Array<ItemsSelect>();
        options.forEach((item) => {
            const newItem = new ItemsSelect(
                item.id,
                item.value,
                item.text,
                true,
                true,
                true,
                []);
            items.push(newItem);
        });

        return items;
    }

    public renderSportTypes(options: SportType[]) {
        const sports = new Array<ItemsSelect>();

        options.forEach((item: SportType) => {
            const sport = new ItemsSelect(
                item.sportType,
                item.sportType.toString(),
                item.sportName,
                true,
                true,
                true,
                []);
            sports.push(sport);
        });

        return sports;
    }

    public renderLeagues(options: League[]) {
        const leagues = new Array<ItemsSelect>();
        options.forEach((item: League) => {
            const league = new ItemsSelect(
                item.leagueId,
                item.leagueId.toString(),
                item.leagueName,
                true,
                true,
                true,
                []);
            league.type = item.group;
            leagues.push(league);
        });

        return leagues;
    }
}