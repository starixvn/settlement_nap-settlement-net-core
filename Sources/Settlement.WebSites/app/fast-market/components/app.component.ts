import { Component, OnInit } from '@angular/core';
import { RequestService } from '../services';
import { HttpRequestService, BlockUIService, MessageBoxService, ClosePopupService } from '../../shared/services';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        ClosePopupService,
        RequestService
    ],
})

export class AppComponent implements OnInit {
    public blockUI = false;
    constructor(private readonly blockUIService: BlockUIService) {
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    }
}