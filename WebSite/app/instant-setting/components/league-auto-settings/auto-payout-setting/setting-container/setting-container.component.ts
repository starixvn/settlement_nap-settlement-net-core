import { DoCheck } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnlyIntegerDirective } from '../../../../../shared/directives';
import { LeagueSettingsStore } from '../../../../services/league-settings.store';
import { distinctUntilChanged, map } from 'rxjs';
import * as _ from 'lodash';
import { ResultSettings } from '../../../../models/league-settings.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProviderSelectionComponent } from '../provider-selection/provider-selection.component';

@Component({
  selector: 'setting-container',
  templateUrl: './setting-container.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ProviderSelectionComponent, MatDialogModule],
  providers: [OnlyIntegerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingContainerComponent {
  @Input() isEarly: boolean = false;
  public resultSettings: ResultSettings;

  constructor(
    private readonly store: LeagueSettingsStore,
    private readonly dialog: MatDialog,
    private readonly cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.store.state$.pipe(
      map(state => this.isEarly ? state.earlyResultSettings : state.mainResultSettings),
      distinctUntilChanged((prev, curr) => prev === curr))
      .subscribe(data => {
        this.resultSettings = data;
        this.cd.detectChanges();
      });
  }

  openProviderSelection() {
    this.dialog.closeAll();
    this.dialog.open(ProviderSelectionComponent, {
      width: '400px',
      data: this.isEarly
    });
  }

  changeSetting() {
    this.resultSettings.hasTrader = !this.resultSettings.hasTrader;
    this.resultSettings.minimumProvider = this.resultSettings.hasTrader ? this.resultSettings.minimumProvider : 2;
    if (this.isEarly) {
      this.store.setState({ ... this.store.state, earlyResultSettings: { ...this.resultSettings } });
    } else {
      this.store.setState({ ... this.store.state, mainResultSettings: { ...this.resultSettings } });
    }
  }
}
