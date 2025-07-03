import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../../../shared/services';
import { RequestService } from '../../services/request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';
@Component({
    selector: 'specific-bettype',
    templateUrl: './specific-bettype.component.html',
    styleUrls: ['./specific-bettype.component.less'],
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule,CdkDrag]
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