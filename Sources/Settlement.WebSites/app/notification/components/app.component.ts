import { Component, OnInit, ElementRef } from '@angular/core';
import { ShowNotificationModel } from '../models/notification.model';
import {
    HttpRequestService,
    BlockUIService,
    MessageBoxService
} from '../../shared/services';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        BlockUIService,
        HttpRequestService,
        MessageBoxService
    ]
})

export class AppComponent implements OnInit  {
    public model: ShowNotificationModel;
    constructor(
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly httpRequestService: HttpRequestService) {
    }

    public async ngOnInit() {
        this.model = await this.topNotification().toPromise() as ShowNotificationModel;
    }

    private topNotification() {
        const apiUrl = this.elementRef.nativeElement.getAttribute('api-url');
        const top = this.elementRef.nativeElement.getAttribute('top');
        const url = `${apiUrl}/api/notifications/top-notification?top=${top}`;
        return this.httpRequestService.getJson(url);
    }
}