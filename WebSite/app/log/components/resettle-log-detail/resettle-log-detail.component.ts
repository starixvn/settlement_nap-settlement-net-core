import * as _ from 'lodash';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { ResettleLogDetail, Match } from '../../models';
import { HandleResultService } from '../../services/handle-result.service';

@Component({
    selector: 'resettle-log-detail',
    templateUrl: './resettle-log-detail.component.html',
})

export class ResettleLogDetailComponent implements OnChanges {
    @Input() public match: Match;
    listLog: _.Dictionary<ResettleLogDetail[]>;
    isEvenRow = false;
    resourceNameProcessed: string;

    ngOnChanges(): void {
        this.resourceNameProcessed = this.match.resettleLogDetails[0].resourceName;
        this.match.resettleLogDetails.forEach(item => {
            item.resultValue = HandleResultService.HandleResult(this.match, item, this.match.home, this.match.away);
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