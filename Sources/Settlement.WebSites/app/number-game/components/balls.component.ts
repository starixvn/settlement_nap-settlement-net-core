import { Component, Input, OnChanges} from "@angular/core";
import * as _ from 'lodash';
import { RedBall } from '../constants';

@Component({
    selector: 'balls',
    templateUrl: './balls.component.html',
})

export class BallsComponent implements OnChanges {
    @Input() public number: string;
    public balls: string[];

    public ngOnChanges() {
       this.balls = _.split(this.number, ',');
    }

    public getColorBall(ball: string) {
        return _.includes(RedBall, Number(ball)) ? "red" : "blue";
    }
}