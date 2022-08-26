import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ResourcesIds, TemplateType } from '../constants';
import { SportType } from '../../shared/constants';
@Pipe({
  name: 'resourceHeader',
})
export class ResourceHeaderPipe implements PipeTransform {
  public transform(resourceId: string, isTotalSet = true, sportType = 0): string {
    if (isTotalSet) {
      return this.ResourceTotalSet(resourceId);
    } else {
      return this.ResourceNameHtFt(resourceId, sportType);
    }
  }

  private ResourceNameHtFt(resourceId: string, sportType: number) {
    if (_.isEqual(resourceId, ResourcesIds.halfTime)) {
      return "HT Score";
    } else if (_.isEqual(resourceId, ResourcesIds.fullTime)) {
      return "Final score";
    } else if (_.isEqual(resourceId, "OT")) {
      return _.isEqual(sportType, SportType.baseBall) ? "E.I" : "OT";
    } else {
      return _.includes([SportType.football, SportType.rugby, SportType.netBall], sportType) ? `${resourceId}Q`
        : _.includes([SportType.iceHockey, SportType.fieldHockey], sportType) ? `${resourceId}P` : resourceId;
    }
  }

  private ResourceTotalSet(resourceId: string) {
    if (_.isEqual(resourceId, ResourcesIds.totalPoints)) {
      return "Total Points";
    } else if (_.isEqual(resourceId, ResourcesIds.totalSets)) {
      return "Total Sets";
    } else {
      const gameNumber = resourceId.charAt(resourceId.length - 1);
      return `${gameNumber}S`;
    }
  }
}
