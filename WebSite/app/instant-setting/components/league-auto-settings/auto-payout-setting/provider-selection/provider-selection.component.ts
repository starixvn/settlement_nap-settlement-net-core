import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LeagueSettingsStore } from '../../../../services/league-settings.store';
import { ProviderSource, ResultSettings } from '../../../../models/league-settings.model';
import { distinctUntilChanged, map } from 'rxjs';
import * as _ from 'lodash';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'provider-selection',
  templateUrl: './provider-selection.component.html',
  standalone: true,
  imports: [MatDialogModule, DragDropModule, CommonModule, FormsModule]
})
export class ProviderSelectionComponent implements OnInit {
  public providerSources: ProviderSource[];
  private resultSettings: ResultSettings;
  private primaryId = 1;
  private secondaryId = 2;
  constructor(
    private readonly dialogRef: MatDialogRef<ProviderSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public isEarly: boolean,
    public store: LeagueSettingsStore) { }
  ngOnInit(): void {
    this.providerSources = this.store.state.providers;
    this.resultSettings = this.isEarly ? this.store.state.earlyResultSettings : this.store.state.mainResultSettings;
    this.setPriority();
  }

  private setPriority() {
    const primaryProviders = this.resultSettings.primaryProvider.split(', ');
    const secondaryProviders = this.resultSettings.secondaryProvider.split(', ');
    this.providerSources.forEach(p => {
      const isPrimary = primaryProviders.indexOf(p.sourceName) > -1;
      const isSecondary = secondaryProviders.indexOf(p.sourceName) > -1;
      p.priority = isPrimary ? 1 : (isSecondary ? 2 : 0);
    });
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
    this.resultSettings.primaryProvider = this.providerSources.filter(p => p.priority == this.primaryId).map(p => p.sourceName).join(', ');
    this.resultSettings.secondaryProvider = this.providerSources.filter(p => p.priority == this.secondaryId).map(p => p.sourceName).join(', ');
    if (this.isEarly) {
      this.store.setState({ ... this.store.state, earlyResultSettings: { ...this.resultSettings } });
    } else {
      this.store.setState({ ... this.store.state, mainResultSettings: { ...this.resultSettings } });
    }
    this.dialogRef.close();
  }
}
