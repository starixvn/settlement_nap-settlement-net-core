import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ResourcesIds } from '../constants';
import { SportType } from '../../shared/constants';
@Pipe({
  name: 'resourceHeader',
})
export class ResourceHeaderPipe implements PipeTransform {
  public transform(resourceId: string, sportType = SportType.badminton): string {
    if (_.isEqual(resourceId, ResourcesIds.totalPoints)) {
      return "Total Points";
    } else if (_.isEqual(resourceId, ResourcesIds.totalGames)) {
      return sportType === SportType.badminton ? "Total Games" : "Total Sets";
    } else {
      const gameNumber = resourceId.slice(3);
      return sportType === SportType.badminton ? `${gameNumber}G` : `${gameNumber}S`;
    }
  }
}
