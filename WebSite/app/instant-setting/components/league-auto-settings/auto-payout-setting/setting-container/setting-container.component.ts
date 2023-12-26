import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnlyIntegerDirective } from '../../../../../shared/directives';
import { LeagueSettingsStore } from '../../../../services/league-settings.store';
import { distinctUntilChanged, map } from 'rxjs';
import * as _ from 'lodash';
import { ResultSettings } from '../../../../models/league-settings.model';

@Component({
  selector: 'setting-container',
  templateUrl: './setting-container.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [OnlyIntegerDirective]
})
export class SettingContainerComponent {
  @Input() isEarly: boolean = false;
  public resultSettings: ResultSettings;

  constructor(private readonly store: LeagueSettingsStore, private readonly cd: ChangeDetectorRef) {

  }
  ngOnInit(): void {
    this.store.state$.pipe(
      map(state => this.isEarly ? state.earlyResultSettings : state.mainResultSettings),
      distinctUntilChanged((prev, curr) => _.isEqual(prev, curr)))
      .subscribe(data => this.resultSettings = data);
  }
}
