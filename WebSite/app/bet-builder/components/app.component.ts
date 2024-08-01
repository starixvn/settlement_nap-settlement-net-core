import * as _ from "lodash";
import { interval } from "rxjs";
import { Component, OnInit, OnDestroy, ElementRef,
  ViewContainerRef, ViewChild, ComponentRef } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {
  BlockUIService,
  HttpRequestService,
  MessageBoxService,
  VerifyDateService,
  ReCheckInService,
  DialogBoxService,
  ClosePopupService,
} from "../../shared/services";
import { DatePipe } from '@angular/common';
import{ MatchesComponent } from './matches.component';
import{ CalculationComponent } from './calculation.component';
import { ISubscription } from "rxjs-compat/Subscription";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  providers: [
    DatePipe,
    BlockUIService,
    HttpRequestService,
    MessageBoxService,
    VerifyDateService,
    ReCheckInService,
    ClosePopupService,
    DialogBoxService,
    NgbActiveModal,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
  public blockUI = false;
  public pageType: string;
  public component: ComponentRef<OnInit>;
  private readonly period = 60000;
  private subscriber: ISubscription;
  public intervallTimer = interval(this.period);
  constructor(
    private readonly reCheckInService: ReCheckInService,
    private readonly blockUIService: BlockUIService,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly viewContainerRef: ViewContainerRef
  ) {}

  public ngOnInit() {
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.createComponent();
    this.reCheckIn();
  }

  private createComponent() {
    this.component = this.getComponentFactory();
    return this.component;
  }

  private getComponentFactory() {
    const pageType = this.elementRef.nativeElement.getAttribute('page-type');
    switch (pageType) {
      case "MainPage":
        return this.viewContainerRef.createComponent(MatchesComponent);
      case "ReCalculate":
         return this.viewContainerRef.createComponent(CalculationComponent);
      default:
        throw new Error('Not implemented yet');
    }
  }

  private reCheckIn() {
    this.subscriber = this.intervallTimer.subscribe(() => {
      this.reCheckInService.reCheckin();
    });
  }

  public ngOnDestroy() {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }
}
