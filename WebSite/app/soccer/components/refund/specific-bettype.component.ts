import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { RequestService } from './services/request.service';
@Component({
    selector: 'specific-bettype',
    templateUrl: './specific-bettype.component.html',
    providers: [
        RequestService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService
    ]
})
export class SpecificBettypeComponent implements OnInit {
    public listBettype: string[];
    public betTypeName: string;
    constructor(private readonly requestService: RequestService,
        private readonly dialogRef: MatDialogRef<SpecificBettypeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { type: string, action: string }) { 
            this.dialogRef.disableClose = true;
        }

    async ngOnInit(): Promise<void> {
        this.listBettype = await this.requestService.getSpecificBetType(this.data.type, this.data.action).toPromise() as string[];
        this.betTypeName = this.listBettype.join(', ');
    }

    public close() {
        this.dialogRef.close();
    }
}
