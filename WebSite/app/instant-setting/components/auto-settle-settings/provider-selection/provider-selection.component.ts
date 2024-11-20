import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component, inject, Inject } from "@angular/core";
import { Provider, ResultSetting } from "../types";
import { Store } from "../store";
import { cloneDeep } from 'lodash'

@Component({
  selector: 'provider-selection',
  templateUrl: './provider-selection.component.html',
  standalone: true,
  imports: [MatDialogModule, DragDropModule, CommonModule, FormsModule],
})
export class ProviderSelectionComponent {

  private readonly dialogRef = inject(MatDialogRef<ProviderSelectionComponent>);
  private readonly store = inject(Store);

  public resultSetting: ResultSetting | null = null;
  public errorMessage: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ResultSetting) {
    this.dialogRef.disableClose = true;
    this.resultSetting = cloneDeep(data);
  }




  close() {
    this.dialogRef.close();
  }

  submit() {
    this.store.setResultSetting(this.resultSetting);
    this.close();
  }

  changeActiveProvider(provider: Provider) {
    provider.isActive = !provider.isActive;
  }

}
