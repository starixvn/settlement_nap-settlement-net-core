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
        const top = Number(this.httpRequestService.getUrlParameter('top'));
        this.model = await this.topNotification(top).toPromise() as ShowNotificationModel;
    }

    private topNotification(top: number) {
        const apiUrl = this.elementRef.nativeElement.getAttribute('api-url');
        const url = `${apiUrl}/api/notifications/top-notification?top=${top}`;
        return this.httpRequestService.getJson(url);
    }
}