import { Component, Input } from '@angular/core';
import { LeagueSettings } from '../../../models/league-settings.model';
import { FormsModule } from '@angular/forms';
import { LeagueSettingsService } from '../../../services/league-settings.service';

@Component({
  selector: 'auto-type',
  templateUrl: './auto-type.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class AutoTypeComponent {
 @Input() leagueSettings: LeagueSettings;
}
