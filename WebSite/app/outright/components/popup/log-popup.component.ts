import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { OutrightService } from '../../services/outright.service';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LogRequest } from '../../models/log-request.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DynamicHeightDirective } from '../../../shared/directives';
import LogComponent from '../log.component';

@Component({
    selector: 'log-popup',
    templateUrl: './log-popup.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, DatepickerComponent, MatDialogModule, DynamicHeightDirective, LogComponent],
    providers: [VerifyDateService, OutrightService, HttpRequestService, MessageBoxService, BlockUIService,
    ],
    encapsulation: ViewEncapsulation.None,
})
export class LogPopupComponent implements OnInit {
    private dialogRef: MatDialogRef<LogPopupComponent>;

    public blockUI = true;

    constructor(
        protected injector: Injector,
        @Inject(MAT_DIALOG_DATA) public data: LogRequest
    ) {
        this.dialogRef.disableClose = true;
     }

    ngOnInit(): void {
        this.dialogRef = this.injector.get(MatDialogRef<LogPopupComponent>);
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    }

    public close() {
        this.dialogRef.close();
    }
}
