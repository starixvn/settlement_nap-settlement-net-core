import { Injectable } from "@angular/core";
import { CalculationStatus } from "../../shared/constants";
import { Match } from "../models";
import * as _ from 'lodash';

@Injectable()
export class BackGroundService {
    public isShowLink(match: Match) {

        const isSingleNotCalculating = _.isNull(match.isCalculatingSingle) ||
            (!_.isEqual(match.isCalculatingSingle, CalculationStatus.waiting)
                && !_.isEqual(match.isCalculatingSingle, CalculationStatus.calculating));

        return !_.isNull(match.remark)  && isSingleNotCalculating;
    }
}