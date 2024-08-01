import { Component, inject, input, OnInit } from '@angular/core';
import { ScoreSourceType } from '../../../../../shared/constants';
import { ExternalSourceNamePipe } from '../../../../../shared/pipes/external-source-name.pipe';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CalculateStore } from '../../../../services/calculate/calculate.store';

@Component({
  selector: 'thead[table-result-header]',
  standalone: true,
  imports: [ExternalSourceNamePipe, FormsModule, MatTooltipModule, CommonModule],
  templateUrl: './table-result-header.component.html',
})
export class TableResultHeaderComponent{
  private store = inject(CalculateStore);
  match = this.store.getMatch();
  SOURCE_ID = ScoreSourceType;

  get maxProviderCol() {
    return this.match.matchDetail.providerCount > 2 ? 3 : 2;
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  get outSideCount() {
    return this.match.resultDetails[0].externalScores.filter(x =>
      x.sourceId !== ScoreSourceType.trader && x.sourceId >= ScoreSourceType.screenshot).length
  }
}
