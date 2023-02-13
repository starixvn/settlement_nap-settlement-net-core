import { ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Outright } from '../models/outright.model';
import { BlockUIService } from '../../shared/services';
import { FilterRequest } from '../models/filter-request.model';
import { FilterComponent } from './main-page/filter.component';
import { LeagueTeamComponent } from './main-page/league-team.component';
import { CommonModule } from '@angular/common';
import { LogComponent } from './popup/log.component';
import MainPageComponent from './main-page/main-page.component';
import { PageType } from '../../shared/constants';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [CommonModule, FilterComponent, LeagueTeamComponent, LogComponent, MainPageComponent, MatDialogModule],
    providers: [BlockUIService]
})
export default class AppComponent implements OnInit {
    public blockUI = false;
    // public outright: Outright;
    // public filterRequest: FilterRequest;

    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public component: ComponentRef<OnInit>;



    constructor(protected injector: Injector,
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly changeDetector: ChangeDetectorRef) { }

    // public ngOnInit() {
    //     this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    // }

    // public search(outright: Outright) {
    //     this.outright = outright;
    // }

    // public getRequest(request: FilterRequest) {
    //     this.filterRequest = request;
    // }

    ngOnInit() {
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.createComponent();
    }

    ngAfterContentChecked() {
        this.changeDetector.detectChanges();
    }

    private createComponent() {
        const factory = this.getComponentFactory();
        this.component = this.container.createComponent(factory);
        return this.component;
    }

    private getComponentFactory(): ComponentFactory<OnInit> {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        switch (pageType) {
            case PageType.OutrightLog:
                return this.componentFactoryResolver.resolveComponentFactory(LogComponent);
            default:
                return this.componentFactoryResolver.resolveComponentFactory(MainPageComponent);
        }
    }
}
