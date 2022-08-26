import { Injectable } from '@angular/core';
import { MaterialDialogComponent, MaterialDialogWithResponseComponent } from '../components';
import { DialogDataIframe } from '../models';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
@Injectable()
export class DialogBoxService {
    constructor(
        private readonly dialog: MatDialog) {
    }
    public popup(dialogData: DialogDataIframe, width: string, height: string): Observable<boolean> {
        this.dialog.closeAll();
        const dialog = this.dialog.open(MaterialDialogComponent, {
            width,
            height,
            panelClass: 'custom-dialog-container',
            data: dialogData
        });
        return dialog.afterClosed();
    }

    public popupHasResponse(dialogData: DialogDataIframe, width: string, height: string): Observable<string> {
        this.dialog.closeAll();
        const dialog = this.dialog.open(MaterialDialogWithResponseComponent, {
            width,
            height,
            panelClass: 'custom-dialog-container',
            data: dialogData
        });
        return dialog.afterClosed();
    }
}