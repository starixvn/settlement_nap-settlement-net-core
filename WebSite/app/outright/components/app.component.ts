import { ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BlockUIService } from '../../shared/services';
import { FilterComponent } from './main-page/filter.component';
import { LeagueTeamComponent } from './main-page/league-team.component';
import { CommonModule } from '@angular/common';
import { LogPopupComponent } from './popup/log-popup.component.native';
import MainPageComponent from './main-page/main-page.component';
import { PageType } from '../../shared/constants';
import { MatDialogModule } from '@angular/material/dialog';
import LogPageComponent from './main-page/log-page.component.native';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [CommonModule, FilterComponent, LeagueTeamComponent, LogPopupComponent, MainPageComponent, MatDialogModule, LogPageComponent],
    providers: [BlockUIService]
})
export default class AppComponent implements OnInit {
    public blockUI = false;

    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public component: ComponentRef<OnInit>;

    constructor(protected injector: Injector,
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly changeDetector: ChangeDetectorRef) { }

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
        if (pageType === PageType.OutrightLog) {
            return this.componentFactoryResolver.resolveComponentFactory(LogPageComponent);
        }

        return this.componentFactoryResolver.resolveComponentFactory(MainPageComponent);
    }
}
