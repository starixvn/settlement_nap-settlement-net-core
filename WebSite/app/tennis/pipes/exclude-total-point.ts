import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ResourcesIds } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
@Pipe({
  name: 'excludeTotalPoint',
  standalone: true
})
export class ExcludeTotalPointPipe implements PipeTransform {
  public transform(resultDetail: ResultDetail[]): ResultDetail[] {
    return resultDetail.filter((game) =>  game.resourceId !== ResourcesIds.totalGames);
  }
}
