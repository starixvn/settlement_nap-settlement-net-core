import { Injectable } from "@angular/core";
import { ItemsSelect } from "../../shared/models";
import { DefaultGames } from '../constants';
import * as _ from 'lodash';

@Injectable()

export class GenerateFilterService {
    private createListOption(items) {
        const tickets: ItemsSelect[] = [];
        items.forEach((item) => {
            const temp = new ItemsSelect(
                item.id,
                item.value,
                item.text,
                true,
                true,
                true,
                []);
            tickets.push(temp);
        });

        return tickets;
    }

    public renderGames() {
        const games = [];
        _.forEach(DefaultGames, (game) => {
            const item = { id: game.gameType, value: game.gameType, text: game.name };
            games.push(item);
        });

        return this.createListOption(games);
    }

    public renderStatus() {
        const options = [
            { id: 1, value: "1", text: "Active" },
            { id: 2, value: "0", text: "Inactive" }
        ];

        return this.createListOption(options);
    }
}