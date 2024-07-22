
import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { ResourceIds } from '../../../../constants/resource-id.constant';
import * as _ from 'lodash';
import { CalculateStore } from '../../../../services/calculate/calculate.store';
import { CommonModule } from '@angular/common';
import { NotifyService } from '../../../../services/notify.service';
import { Language } from '../../../../../shared/language.native';
import { CalculateService } from '../../../../services/calculate/calculate.service';
import { TicketStatusText } from '../../../../../shared/constants';

@Component({
  selector: 'tfoot[table-result-footer]',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [CalculateService],
  templateUrl: './table-result-footer.component.html'
})
export class TableResultFooterComponent implements OnInit {
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);
  private calculateService = inject(CalculateService);
  disableScoreDirect = false;
  isInputScoreDirect = false; 
  canUncalculate = this.store.getPermission().canUncalculate;

  ngOnInit(): void {
   this.disableScoreDirect =  _.filter(this.store.getResultDetails(), (item) => !_.isEqual(item.resourceId, ResourceIds.fullTime)
   && item.ticketStatus !== TicketStatusText.noTicket).length > 0;
  }


  get disableUncalculateAndSaveScore() {
    return this.store.getResultDetails().every((item) => !item.checked);
  }

  
  changeInputDirectly(){
    this.store.updateInputScoreDirect(this.isInputScoreDirect);
  }

  calculate() {
    this.notifyService.clearError();
    this.store.onSubmitCalculate();
    this.calculateService.calculate();
  }

  uncalculate(){
    this.notifyService.clearError();
    this.store.onSubmitUncalculate();
    this.calculateService.unCalculate();
  }

  saveScore() {
    this.notifyService.clearError();
    this.notifyService.confirm(Language.eSports.saveScore, () => {
      this.calculateService.saveScore();
    });
  }
}
