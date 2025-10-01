import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { ResultDetail } from '../../shared/models/sportsbook-sop/result-detail.model';

@Pipe({ name: 'ticketStatus', standalone: true })
export class TicketStatusPipe implements PipeTransform {
    public transform(resultDetails: ResultDetail[], args: string, AllResultDetails: ResultDetail[]) {
        resultDetails.forEach((item) => {
            let hasResultStatus = _.isNil(args)
                || args.length === 0
                || _.includes(args, item.ticketStatus)
                || this.filterConfirmedTrader(args, item);
            if(!_.includes(args, "Running;") && _.isEqual(item.ticketStatus, "Running") && args.length > 0) {
                hasResultStatus = false;
            }

            this.isExistedItem(hasResultStatus, item);
        });

        this.processRelatedResources(AllResultDetails);
        const a = resultDetails.filter(item => item.isShow);
        return a;
    }

    private filterConfirmedTrader(args: string, resultDetail: ResultDetail) {
        if (_.includes(args, 'Confirmed by Trader')) {
            return resultDetail.resultStatusId === 3;       
        }
        return false;
    }

    private isExistedItem(hasResultStatus: boolean, item: ResultDetail) {
        if (hasResultStatus) {
            item.isShow = true;
        } else {
            item.isShow = false;
        }
    }

    private processRelatedResources(resultDetails: ResultDetail[]) {
        const resourcesToShow = new Set<string>();
        
        resultDetails.forEach(item => {
            if (item.isShow && item.relatedCalResources) {
                const relatedResourceIds = this.parseRelatedResources(item.relatedCalResources);
                relatedResourceIds.forEach(resourceId => {
                    resourcesToShow.add(resourceId);
                });
            }
        });

        resultDetails.forEach(item => {
            if (resourcesToShow.has(item.resourceId)) {
                item.isShow = true;
            }
        });
    }

    private parseRelatedResources(relatedCalResource: string): string[] {
        if (!relatedCalResource) {
            return [];
        }
        
        return relatedCalResource
            .split(/[,;\s]+/)
            .map(id => id.trim())
            .filter(id => id.length > 0);
    }
}
