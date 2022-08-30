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
        if (match.isMergedParlay) {
            return !_.isNull(match.remark) && !remarkSetting && isSingleNotCalculating;
        } else {
            const isMPNotCalculating = _.isNull(match.isCalculatingMP) || (!_.isEqual(match.isCalculatingMP, CalculationStatus.waiting) &&
                !_.isEqual(match.isCalculatingMP, CalculationStatus.calculating))
            return !_.isNull(match.remark) && !remarkSetting && isSingleNotCalculating && isMPNotCalculating;
        }
    }
}