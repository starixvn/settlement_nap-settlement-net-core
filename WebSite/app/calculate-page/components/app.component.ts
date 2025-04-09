
import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BackGroundService, DetectChangesService, GenerateFilterService, HandleActionsService, PopupService, RequestService } from '../services';
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService, ReCheckInService, VerifyDateService } from '../../shared/services';
import { PageComponent } from './calculation';
import * as _ from 'lodash';
import { AutoCalculatePageComponent, AutoCalculateService } from './auto-calculation';
import { PageBaseComponent } from './base-component';
import { NgIf, DatePipe } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        DatePipe,
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
        AutoCalculateService,
        GenerateFilterService
    ],
    standalone: true,
    imports: [NgIf],
})
export class AppComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public component: ComponentRef<PageBaseComponent>;
    public blockUI = false;
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
        return this.component;
    }


    private getComponentFactory(): ComponentFactory<PageBaseComponent> {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        // return this.componentFactoryResolver.resolveComponentFactory(PageComponent)
        return _.isEqual(pageType, 'Calculation')
            ? this.componentFactoryResolver.resolveComponentFactory(PageComponent)
            : this.componentFactoryResolver.resolveComponentFactory(AutoCalculatePageComponent);
    }
}
