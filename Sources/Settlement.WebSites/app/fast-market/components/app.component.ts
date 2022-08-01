import { Component, OnInit, ViewChild } from '@angular/core';
import { RequestService } from '../services';
import { HttpRequestService, BlockUIService, MessageBoxService, ClosePopupService } from '../../shared/services';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';

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
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public blockUI = false;
    constructor(private readonly blockUIService: BlockUIService) {
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    }
}