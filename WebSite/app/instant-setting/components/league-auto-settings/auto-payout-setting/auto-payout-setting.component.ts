
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeagueSettings } from '../../../models/league-settings.model';
import { CommonModule } from '@angular/common';
import { SettingContainerComponent } from './setting-container/setting-container.component';
import { LeagueSettingsService } from '../../../services/league-settings.service';

@Component({
  selector: 'auto-payout-setting',
  templateUrl: './auto-payout-setting.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, SettingContainerComponent],
  providers: [LeagueSettingsService]
})
export class AutoPayoutSettingComponent {
  @Input() leagueSettings: LeagueSettings;
}
