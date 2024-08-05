import { Component, inject, OnInit, Type } from '@angular/core';
import { ScoreSourceType } from '../../../../../shared/constants';
import { NewMultipleSelectComponent } from '../../../../../shared/components/multiple-select/multiple-select.component';
import { ItemsSelect, MultipleSelect } from '../../../../../shared/models';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExternalLinkPipe } from "../../../../../score-source-setting/pipes/external-link.pipe";
import { CommonModule } from '@angular/common';
import { EarlyBaseService } from '../../../../../core/services/early-base.service';
import { FilterId } from '../../../../constants/filter-id.constants';
import { EarlySettlementStorage } from '../../../../services/early-settlement/early-settlement.storage';

@Component({
  selector: 'thead[table-result-header]',
  standalone: true,
  imports: [NewMultipleSelectComponent, MatTooltipModule, ExternalLinkPipe, CommonModule],
  providers: [EarlyBaseService],
  templateUrl: './table-result-header.component.html',
})
export class TableResultHeaderComponent implements OnInit {
  #storage = inject(EarlySettlementStorage);
  #earlyBaseService = inject(EarlyBaseService)
  match = this.#storage.match;
  permission = this.#storage.getPermission();
  SOURCE_ID = ScoreSourceType;
  ticketsStatusSelect = new MultipleSelect();
  resultStatusSelect = new MultipleSelect();
  resultTypeSelect = new MultipleSelect();
  groupResultDetail = this.#storage.getGroupResultDetail();
  filterId = FilterId;

  get maxProviderCol() {
    return this.match().matchDetail.providerCount > 2 ? 3 : 2;
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  get outSideCount() {
    return this.match().resultDetails[0].externalScores.filter(x =>
      x.sourceId !== ScoreSourceType.trader && x.sourceId >= ScoreSourceType.screenshot).length
  }

  ngOnInit(): void {
    this.resultTypeSelect.items = this.#earlyBaseService.renderResultType(this.groupResultDetail);
    this.resultStatusSelect.items = this.#earlyBaseService.renderResultStatus(this.permission);
    this.ticketsStatusSelect.items = this.#earlyBaseService.renderTicketStatus();
    this.resultTypeSelect.maxWidth = '150px';
    this.ticketsStatusSelect.maxWidth = '100px';
    this.resultStatusSelect.maxWidth = '150px';
  }

  onSelectFilter(value: ItemsSelect[], type: number) {
    this.#storage.updateFilter(value, type);
  }
}
