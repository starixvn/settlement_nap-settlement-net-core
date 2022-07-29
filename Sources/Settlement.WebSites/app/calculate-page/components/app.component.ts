import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BackGroundService, DetectChangesService, HandleActionsService, PopupService, RequestService } from '../services';
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService, ReCheckInService, VerifyDateService } from '../../shared/services';
import { interval } from 'rxjs';
import { FilterQuery, Matches } from '../models';
import { PageComponent } from './calculation';
import * as _ from 'lodash';
import { AutoCalculatePageComponent, AutoCalculateService } from './auto-calculation';
import { PageBaseComponent } from './base-component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [
    BlockUIService,
    VerifyDateService,
    MessageBoxService,
    RequestService,
    HttpRequestService,
    PopupService,
    ReCheckInService,
    DialogBoxService,
    HandleActionsService,
    BackGroundService,
    DetectChangesService,
    AutoCalculateService
  ],
})
export class AppComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
  public component: ComponentRef<PageBaseComponent>;
  private readonly period = 60000;
  public blockUI = false;
  public matches: Matches;
  public intervalTimer = interval(this.period);
  public change = 0;
  public filterQuery: FilterQuery;
  public autoCalculation: boolean;
  constructor(private readonly blockUIService: BlockUIService,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
  ) { }

  ngOnInit(): void {
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.createTemplateComponent();
  }

  private createTemplateComponent() {
    const factory = this.getComponentFactory();
    this.component = this.container.createComponent(factory);
    this.component.instance.rootApi =this.elementRef.nativeElement.getAttribute('api-url');
    return this.component;
  }


  private getComponentFactory(): ComponentFactory<PageBaseComponent> {
    const pageType = this.elementRef.nativeElement.getAttribute('page-type');
    return _.isEqual(pageType, 'Calculation')
      ? this.componentFactoryResolver.resolveComponentFactory(PageComponent)
      : this.componentFactoryResolver.resolveComponentFactory(AutoCalculatePageComponent);
  }
}
