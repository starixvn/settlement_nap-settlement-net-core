import { Pipe, PipeTransform } from '@angular/core';
import { MatchDetail } from '../models/sportsbook-sop';
import * as _ from 'lodash';

@Pipe({ name: 'resultByTeamName' })
export class ResultByTeamNamePipe implements PipeTransform {
    public transform(result: string, matchDetail: MatchDetail, betTypeGroup = 0) {
        if (!_.isEmpty(result)) {
            if (_.isEqual(result, 'H')) {
                return matchDetail.homeName;
            } else if (_.isEqual(result, 'A')) {
                return matchDetail.awayName;
            } else if (_.isEqual(result, 'D')) {
                return 'Draw';
            } else if (_.isEqual(result, 'N')) {
                return this.noneOrNoOption(betTypeGroup);
            } else if (_.isEqual(result, 'Y')) {
                return 'Yes';
            } else if (_.isEqual(result, 'M')) {
                return 'Middle';
            } else if (_.isEqual(result, 'NM')) {
                return 'Top or Bottom';
            } else {
                return this.optionGroupTwo(result, betTypeGroup);
            }
        } else {
            return '-';
        }
    }

    private noneOrNoOption(betTypeGroup: number) {
        if (betTypeGroup === 3 || betTypeGroup === 13) {
            return 'No';
        } else {
            return 'None';
        }
    }

    private optionGroupTwo(result: string, betTypeGroup: number) {
        if (_.isEqual(result, 'B')) {
            return 'Bottom';
        }

        if (_.isEqual(result, 'NB')) {
            return 'Top or Middle';
        }

        if (_.isEqual(result, 'O')) {
            return 'Overlord';
        }

        return this.TopOrTyrant(result, betTypeGroup);
    }

    private TopOrTyrant(result: string, betTypeGroup: number) {
        if (betTypeGroup === 11 || betTypeGroup === 12) {
            if (_.isEqual(result, 'T')) {
                return 'Tyrant';
            }

            if (_.isEqual(result, 'NT')) {
                return 'Overlord or Middle';
            }
        }

        if (_.isEqual(result, 'T')) {
            return 'Top';
        }

        if (_.isEqual(result, 'NT')) {
            return 'Middle or Bottom';
        }

        return result;
    }
}