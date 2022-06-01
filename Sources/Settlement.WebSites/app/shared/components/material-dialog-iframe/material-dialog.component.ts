import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataIframe } from '../../models';
import { DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'material-dialog',
  templateUrl: './material-dialog.component.html'
})
export class MaterialDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<MaterialDialogComponent>,
              private readonly sanitizer: DomSanitizer,
              @Inject(MAT_DIALOG_DATA) public data: DialogDataIframe) { }

  public src = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.src);

  public closeWithChange() {
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
