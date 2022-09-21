import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Ball, MatchDetail } from '../models';
import { MatchStatus } from '../../shared/constants';
import { Language } from '../../shared/language';

@Injectable()
export class BallService {
    public getTotalBall(balls: Ball[]) {
        const totalBall = _.sumBy(balls, (ball: Ball) => {
            return Number(ball.numberBall);
        });
        return totalBall.toString();
    }

    public getBigSmall(totalBall: number) {
        const minAutumn = 53;
        return totalBall >= minAutumn ? "B" : "S";
    }

    public getOddEven(totalBall: number) {
        const two = 2;
        return (totalBall % two) ? "O" : "E";
    }

    public getMoreOddEven(balls: Ball[]) {
        let oddCount = 0;
        let evenCount = 0;
        const two = 2;

        balls.forEach((ball: Ball) => {
            if (ball.numberBall % two) {
                oddCount++;
            } else {
                evenCount++;
            }
        });
        return oddCount > evenCount ? "MO" : "ME";
    }

    public getCombo(totalBall: number) {
        return this.getBigSmall(totalBall) + this.getOddEven(totalBall);
    }

    public getSeasons(totalBall: number) {
        const minSpring = 15;
        const maxSpring = 33;

        const minSummer = 34;
        const maxSummer = 52;

        const minAutumn = 53;
        const maxAutumn = 71;

        const minWinter = 72;
        const maxWinter = 90;

        if (totalBall >= minSpring && totalBall <= maxSpring) {
            return "Sp";
        } else if (totalBall >= minSummer && totalBall <= maxSummer) {
            return "Su";
        } else if (totalBall >= minAutumn && totalBall <= maxAutumn) {
            return "Au";
        } else if (totalBall >= minWinter && totalBall <= maxWinter) {
            return "Wi";
        } else {
            return "";
        }
    }

    public resetValueOnCurrentMatch(match: MatchDetail) {
        if(_.isEqual(match.eventStatus.toLowerCase(), MatchStatus.Completed)) {
            match.totalBall = this.getTotalBall(match.balls);
            match.bigSmall = this.getBigSmall(Number(match.totalBall));
            match.oddEven = this.getOddEven(Number(match.totalBall));
            match.moreOddEven = this.getMoreOddEven(match.balls);
            match.seasons = this.getSeasons(Number(match.totalBall));
            match.combo = this.getCombo(Number(match.totalBall));
        } else {
            match.totalBall = Language.gaming.normal;
            match.bigSmall = Language.gaming.normal;
            match.oddEven = Language.gaming.normal;
            match.moreOddEven = Language.gaming.normal;
            match.seasons = Language.gaming.normal;
            match.combo = Language.gaming.normal;
        }
    }
}