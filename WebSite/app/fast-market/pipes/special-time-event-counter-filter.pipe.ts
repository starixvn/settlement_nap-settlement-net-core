import { Pipe, PipeTransform } from '@angular/core';
import { EventCounter, SpecialSession } from "../models";
import * as _ from 'lodash';
import { SessionId } from '../constants';
@Pipe({
    name: 'specialTimeEventCounterFilter',
})

export class SpecialTimeEventCounterPipe implements PipeTransform {
    public transform(eventCounterItem: EventCounter[], session: SpecialSession) {
        if (session.apply) {
            if (_.isEqual(session.resourceId, SessionId.suspendedTime)) {
                return this.filterSuspendedTime(eventCounterItem, session);
            } else {
                return this.filterWaterBreak(eventCounterItem, session);
            }
        } else {
            return eventCounterItem;
        }
    }

    private setResultFilter(item: EventCounter, isShow: boolean) {
        item.isShow = isShow;
        item.checked = isShow;
        return isShow;
    }

    private filterWaterBreak(eventCounterItem: EventCounter[], session: SpecialSession) {
        return eventCounterItem.filter((item) => {
            if (item.position > Number(session.startMinute) - 5 && item.position < Number(session.endMinute) + 5) {
                return this.setResultFilter(item, true);
            } else {
                return this.setResultFilter(item, false);
            }
        });
    }

    private filterSuspendedTime(eventCounterItem: EventCounter[], session: SpecialSession) {
        return eventCounterItem.filter((item) => {
            if (item.position > Number(session.startMinute) - 5 && item.position < Number(session.startMinute) + 5) {
                return this.setResultFilter(item, true);
            } else {
                return this.setResultFilter(item, false);
            }
        });
    }
}