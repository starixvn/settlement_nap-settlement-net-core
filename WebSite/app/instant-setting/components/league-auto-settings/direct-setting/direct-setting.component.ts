import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeagueSettings } from '../../../models/league-settings.model';
import { LeagueSettingsService } from '../../../services/league-settings.service';

@Component({
  selector: 'direct-setting',
  templateUrl: './direct-setting.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class DirectSettingComponent {
  @Input() leagueSettings: LeagueSettings;
}
