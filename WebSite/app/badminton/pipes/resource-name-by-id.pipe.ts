import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ResourcesIds } from '../constants';
import { SportType } from '../../shared/constants';

@Pipe({ name: 'resourceName' })
export class ResourceNameByIdPipe implements PipeTransform {
    public transform(resourceId: string, sportType = SportType.badminton) {
        if (_.isEqual(resourceId, ResourcesIds.totalGames)) {
            return "Match";
        } else if (_.isEqual(resourceId, ResourcesIds.totalPoints)) {
            return "Total Points";
        } else {
            const gameNumber = resourceId.slice(3);
            return sportType === SportType.badminton ? `Game ${gameNumber}` : `Set ${gameNumber}`;
        }
    }
}