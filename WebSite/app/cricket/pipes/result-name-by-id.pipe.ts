import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ResourcesIds } from '../constants';
import { MatchDetail } from '../models';

@Pipe({
  name: 'resultNamePipe',
  standalone: true
})
export class ResultNameByIdPipe implements PipeTransform {
  public transform(resourceId: string, matchDetail: MatchDetail) {
    if (_.isEqual(resourceId, ResourcesIds.final)) {
      return "Match Winner";
    } else if (_.isEqual(resourceId.substr(0, 1), "A")) {
      const inningNumber = resourceId.substr(1, 1);
      return `Innings ${inningNumber} - ${matchDetail.awayName}`;
    } else {
      const inningNumber = resourceId.substr(1, 1);
      return `Innings ${inningNumber} - ${matchDetail.homeName}`;
    }
  }
}