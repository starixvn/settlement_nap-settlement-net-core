import * as _ from 'lodash';
import { Component, Input, OnChanges, Injector } from "@angular/core";
import { ResettleLogDetail, Match } from '../../models';
import { ResultOtherSportService, ResultSoccerService } from '../../services';
import { SportType } from '../../../shared/constants';

@Component({
    selector: 'resettle-log-detail',
    templateUrl: './resettle-log-detail.component.html',
})

export class ResettleLogDetailComponent implements OnChanges {
    private resultSoccerService: ResultSoccerService;
    private resultOtherSportService: ResultOtherSportService;
    @Input() public match: Match;
    listLog: _.Dictionary<ResettleLogDetail[]>;
    isEvenRow = false;
    resourceNameProcessed: string;
    constructor(protected injector: Injector){
        this.resultSoccerService = this.injector.get(ResultSoccerService);
        this.resultOtherSportService = this.injector.get(ResultOtherSportService);
    }
    ngOnChanges(): void {
        this.resourceNameProcessed = this.match.resettleLogDetails[0].resourceName;
        this.match.resettleLogDetails.forEach(item => {
            if(this.match.sportType== SportType.soccer){
                item.resultValue = this.resultSoccerService.getResultValue(item);
            } else {
                item.resultValue = this.resultOtherSportService.getResultValue(this.match, item, this.match.home, this.match.away);
            }
            item.class = this.isEven(item);
        });
        this.listLog = _.groupBy(this.match.resettleLogDetails, 'resourceId');
    }


    private isEven(logDetail: ResettleLogDetail) {
        if (!_.isEqual(this.resourceNameProcessed, logDetail.resourceName)) {
            this.isEvenRow = !this.isEvenRow;
            this.resourceNameProcessed = logDetail.resourceName;
        }

        return this.isEvenRow ? 'even' : '';
    }
}