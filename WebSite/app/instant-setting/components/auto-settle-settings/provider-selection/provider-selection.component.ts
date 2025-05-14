import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component, inject, Inject } from "@angular/core";
import { Provider, ResultSetting } from "../types";
import { Store } from "../store";
import { cloneDeep } from 'lodash'
import { Language } from "../../../../shared/language.native";
import {SwitchComponent} from "../../../../shared/components/switch/switch.component";
import {AppTableComponent} from "../../../../shared/components/table/app-table.component";

@Component({
  selector: 'provider-selection',
  templateUrl: './provider-selection.component.html',
  standalone: true,
  imports: [MatDialogModule, DragDropModule, CommonModule, FormsModule, SwitchComponent,AppTableComponent],
})
export class ProviderSelectionComponent {

  private readonly dialogRef = inject(MatDialogRef<ProviderSelectionComponent>);
  private readonly store = inject(Store);

  public resultSetting: ResultSetting | null = null;
  public errorMessage = ""; 
  public headers: string[] = ['Active','Providers', 'Primary', 'Secondary', 'Unassigned'];


  constructor(@Inject(MAT_DIALOG_DATA) public data: ResultSetting) {
    this.dialogRef.disableClose = true;
    this.resultSetting = cloneDeep(data);
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
    this.errorMessage = "";

    if (!this.resultSetting.providers.some(p => p.isActive && p.priority === 1) && this.resultSetting.providers.some(p => p.isActive && p.priority === 2)) {
      this.errorMessage = Language.AutoPayoutSetting.MissingPrimarySource;
      return;
    }

    this.store.setResultSetting(this.resultSetting);
    this.close();
  }
}
