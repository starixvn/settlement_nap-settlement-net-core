import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BackGroundService, RequestService, PopupService } from '../../services';
import * as _ from 'lodash';
import { MatchesBaseComponent } from '../base-component';

@Component({
  selector: 'auto-calculate-matches',
  templateUrl: './auto-calculate-matches.component.html'
})
export class AutoCalculateMatchesComponent extends MatchesBaseComponent implements OnChanges, OnInit, OnDestroy {
  constructor(
    protected popupService: PopupService,
    protected requestService: RequestService,
    protected backGroundService: BackGroundService) {
    super(popupService, requestService, backGroundService);
  }

}
