import { Component, Input } from "@angular/core";
import * as _ from "lodash";
import { GoalRecord } from "./models/match.model";

@Component({
    selector: 'goal-history',
    templateUrl: './goal-history.component.html',
})

export class GoalHistoryComponent {
    @Input() public goalRecord: string;
    public get halfTimeGoalRecords() {
        const records = this.goalRecord.slice(0, this.goalRecord.indexOf(';')).split('');
        return this.renderGoalRecords(records);
    }

    public get fullTimeGoalRecords() {
        const records = this.goalRecord.replace(';', '').split('');
        return this.renderGoalRecords(records);
    }

    private renderGoalRecords(records: string[]) {
        const goalRecords: GoalRecord[] = [];
        let home = 0;
        let away = 0;
        _.forEach(records, (item) => {
            if(_.isEqual(item, 'H')) {
                home++;
            } else {
                away++;
            }
            const team =  _.isEqual(item, 'H') ? 'Home' : 'Away';
            goalRecords.push(new GoalRecord(team, home, away));
        });

        return goalRecords;
    }

    public isExistGoalRecord() {
        return !_.isNil(this.goalRecord) && !_.isEqual(this.goalRecord, '') && !_.isEqual(this.goalRecord, ';');
    }

    public isExistHalfTimeGoalRecord() {
        return this.isExistGoalRecord() && this.goalRecord.indexOf(';') > 0;
    }
}