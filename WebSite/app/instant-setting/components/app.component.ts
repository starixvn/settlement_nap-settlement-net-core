import {
    Component,
    ComponentFactoryResolver,
    ComponentFactory,
    OnInit,
    ViewContainerRef,
    ViewChild,
    ElementRef,
    ComponentRef,
    ChangeDetectorRef,
    AfterContentChecked,
    inject
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BlockUIService, HttpRequestService, MessageBoxService, ClosePopupService} from '../../shared/services';
import { AutoSettingComponent } from './auto-setting/auto-setting.component';
import { RemarkSettingComponent } from './remark-setting/remark-setting.component';
import { CommonModule } from '@angular/common';
import {DataTableSettingComponent} from "./auto-settle-settings/data-table-setting/data-table-setting.component";
import { TimeSettingComponent } from './time-setting/time-setting.component';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [TimeSettingComponent, RemarkSettingComponent, AutoSettingComponent, CommonModule],
    providers: [
        BlockUIService,
        HttpRequestService,
        MessageBoxService,
        ClosePopupService,
        NgbActiveModal],
    standalone: true
})

export class AppComponent implements OnInit, AfterContentChecked {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;

    private readonly componentFactoryResolver = inject(ComponentFactoryResolver)
    private readonly blockUIService = inject(BlockUIService);
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly changeDetector = inject(ChangeDetectorRef);

    public blockUI = false;
    public component: ComponentRef<OnInit>;

    ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
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
            case "DirectTime":
            case "InstantTime":
                return this.componentFactoryResolver.resolveComponentFactory(TimeSettingComponent);
            case "RemarkSetting":
                return this.componentFactoryResolver.resolveComponentFactory(RemarkSettingComponent);
            case "AdvancedLeagueSettings":
                return this.componentFactoryResolver.resolveComponentFactory(DataTableSettingComponent);
            default:
                return this.componentFactoryResolver.resolveComponentFactory(AutoSettingComponent);
        }
    }
}