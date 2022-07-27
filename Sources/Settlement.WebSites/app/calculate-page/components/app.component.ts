import { Component, ElementRef, OnInit } from '@angular/core';
import { BackGroundService, CalculatePageService, DetectChangesService, HandleActionsService, PopupService } from '../services';
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService, ReCheckInService, VerifyDateService } from '../../shared/services';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';
import { FilterQuery, Matches } from '../models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [
    BlockUIService,
    VerifyDateService,
    MessageBoxService,
    CalculatePageService,
    HttpRequestService,
    PopupService,
    ReCheckInService,
    DialogBoxService,
    HandleActionsService,
    BackGroundService,
    DetectChangesService
  ],
})
export class AppComponent implements OnInit {
  private subscriber: ISubscription;
  private readonly period = 60000;
  public blockUI = false;
  public matches: Matches;
  public intervalTimer = interval(this.period);
  public change = 0;
  public rootApi: string;
  public filterQuery: FilterQuery;
  constructor(private readonly blockUIService: BlockUIService,
    private readonly reCheckInService: ReCheckInService,
    private readonly elementRef: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.rootApi = this.elementRef.nativeElement.getAttribute('api-url');
    this.reCheckIn();
  }
  public search($event) {
    this.matches = $event.matches;
    this.filterQuery = $event.filterQuery;
  }

  private reCheckIn() {
    this.subscriber = this.intervalTimer.subscribe(() => {
      this.reCheckInService.reCheckin();
    });
  }

  public ngOnDestroy() {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }
}
