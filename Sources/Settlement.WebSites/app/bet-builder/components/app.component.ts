import * as _ from "lodash";
import { interval } from "rxjs";
import { ISubscription } from "rxjs/Subscription";
import { Component, OnInit, OnDestroy,
  ComponentFactory, ElementRef, ComponentFactoryResolver,
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
import {
  RequestService,
  LeagueSettingService,
  MatchSettingService,
  CalculationFilterService,
  CalculationConstraintService,
  RefreshMatchService,
  GenerateListService,
  PopupService,
} from "../services";
import{ MatchesComponent } from './matches.component';
import{ CalculationComponent } from './calculation.component';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  providers: [
    BlockUIService,
    HttpRequestService,
    MessageBoxService,
    RequestService,
    LeagueSettingService,
    MatchSettingService,
    VerifyDateService,
    CalculationFilterService,
    CalculationConstraintService,
    RefreshMatchService,
    ReCheckInService,
    GenerateListService,
    ClosePopupService,
    PopupService,
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
    private readonly componentFactoryResolver: ComponentFactoryResolver
  ) {}

  public ngOnInit() {
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.createComponent();
    this.reCheckIn();
  }

  private createComponent() {
    const factory = this.getComponentFactory();
    this.component = this.container.createComponent(factory);
    return this.component;
  }

  private getComponentFactory(): ComponentFactory<OnInit> {
    const pageType = this.elementRef.nativeElement.getAttribute('page-type');
    switch (pageType) {
      case "MainPage":
        return this.componentFactoryResolver.resolveComponentFactory(MatchesComponent);
      case "Recalculate":
         return this.componentFactoryResolver.resolveComponentFactory(CalculationComponent);
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
