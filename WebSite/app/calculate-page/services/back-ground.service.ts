import { Injectable } from "@angular/core";
import { BackgroundColor, CalculationStatus, EventStatus } from "../../shared/constants";
import { Match } from "../../shared/models";
import * as _ from 'lodash';

@Injectable()
export class BackGroundService {
    public isShowLink(match: Match) {
        const remark = match.remark
        const remarkSetting = remark.isMtdHold || remark.isUndecided || remark.isPending || remark.isUnderSettle || remark.isKeyHold;
        const isSingleNotCalculating = _.isNull(match.isCalculatingSingle) ||
                                     (!_.isEqual(match.isCalculatingSingle, CalculationStatus.waiting)
                                     && !_.isEqual(match.isCalculatingSingle, CalculationStatus.calculating));
        return !_.isNull(match.remark)  && isSingleNotCalculating;
    }

    public completedBackground(match: Match) {
        return _.isEqual(match.eventStatus.toLowerCase(), EventStatus.completed.toLocaleLowerCase()) ? BackgroundColor.autoSettleCompleted : BackgroundColor.autoSettleRunningBlinking;
    }

    public fastMarkedCompletedBackground(match: Match) {
        return _.isEqual(match.fastMarketStatus, EventStatus.completed) ? BackgroundColor.calculated : '';
    }
}