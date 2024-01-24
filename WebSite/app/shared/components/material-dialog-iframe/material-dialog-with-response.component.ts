import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataIframe } from '../../models';
import { DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'material-dialog-with-response',
  templateUrl: './material-dialog-with-response.component.html'
})
export class MaterialDialogWithResponseComponent {
  constructor(private readonly dialogRef: MatDialogRef<MaterialDialogWithResponseComponent>,
              private readonly sanitizer: DomSanitizer,
              @Inject(MAT_DIALOG_DATA) public data: DialogDataIframe) {
                this.dialogRef.disableClose = true;
               }

  public src = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.src);

  public closeWithChange() {
    this.dialogRef.close(document.getElementById('dialog-response').getAttribute('value'));
  }

  public close() {
    this.dialogRef.close();
  }
}
