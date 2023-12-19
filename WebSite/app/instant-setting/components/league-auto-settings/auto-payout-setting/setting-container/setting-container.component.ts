import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnlyIntegerDirective } from '../../../../../shared/directives';
import { ResultSettings } from '../../../../models/league-settings.model';
import { LeagueSettingsService } from '../../../../services/league-settings.service';

@Component({
  selector: 'setting-container',
  templateUrl: './setting-container.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [OnlyIntegerDirective, LeagueSettingsService]
})
export class SettingContainerComponent {
  @Input() resultSettings: ResultSettings;
  @Input() isEarly: boolean = false;
}
