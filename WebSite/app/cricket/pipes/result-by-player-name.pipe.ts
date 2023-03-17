import { Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";
import { InputOption } from "../../shared/models/sportsbook-sop";

@Pipe({
    name: 'resultByPlayerNamePipe',
    standalone: true
})
export class ResultByPlayerNamePipe implements PipeTransform {
    public transform(value: string, options: InputOption[]) {
        if (_.isNil(value) || _.isEmpty(value)) {
            return '-';
        }

        const playerIds = value.split(',');
        const playerNames = [];
        playerIds.forEach((id) => {
            playerNames.push(_.find(options, option => _.isEqual(option.value, id)).optionName);
        });

        return playerNames.join(', ');
    }
}