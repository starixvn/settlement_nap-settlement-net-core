import { Pipe, PipeTransform } from '@angular/core';
import { sportSupport } from '../../score-source-setting/constants';
import * as _ from 'lodash';

@Pipe({
    name: 'gameStatus',
    standalone: true
})
export class GameStatusPipe implements PipeTransform {

    public transform(isActive: boolean, sportType: number) {
        if (_.includes(sportSupport.gameTypes, sportType)) {
            return isActive ? 'Yes' : 'No';
        }
        return '-';
    }
}