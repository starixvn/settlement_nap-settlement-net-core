import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { MatchDetail } from '../models';

@Pipe({ name: 'scoreMatchByPermission' })
export class ScoreMatchByPermissionPipe implements PipeTransform {
    public transform(score: string, matchDetail: MatchDetail, isLeader: boolean) {
        return (isLeader || matchDetail.isCalculated || matchDetail.isCalRefund) && !_.isEmpty(score) ? score : '-';
    }
}