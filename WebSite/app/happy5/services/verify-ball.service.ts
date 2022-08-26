import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Ball } from '../models';
@Injectable()
export class VerifyBallService {
    public emptyBall(balls: Ball[]) {
        return _.find(balls, (ball: Ball) =>
            _.isNull(ball.numberBall) || _.isEmpty(ball.numberBall.toString()));
    }

    public outOfRangeBall(balls: Ball[]) {
        const minBall = 1;
        const maxBall = 20;
        return _.find(balls, (ball: Ball) =>
            Number(ball.numberBall) < minBall || Number(ball.numberBall) > maxBall);
    }

    public isDuplicateBall(balls: Ball[]) {
        const map = _.map(balls, (ball: Ball) => {
            return Number(ball.numberBall);
        });

        const newBalls = _.uniq(map);
        return newBalls.length !== balls.length;
    }
}