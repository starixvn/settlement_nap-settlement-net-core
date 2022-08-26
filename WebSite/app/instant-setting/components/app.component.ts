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
    AfterContentChecked
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BlockUIService, HttpRequestService, MessageBoxService, ClosePopupService} from '../../shared/services';
import { TimeSettingComponent } from './time-setting.component';
import { AutoSettingComponent } from './auto-setting.component';
import { RemarkSettingComponent } from './remark-setting.component';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        BlockUIService,
        HttpRequestService,
        MessageBoxService,
        ClosePopupService,
        NgbActiveModal],
})

export class AppComponent implements OnInit, AfterContentChecked {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public blockUI = false;
    public component: ComponentRef<OnInit>;

    constructor(
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly blockUIService: BlockUIService,
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly changeDetector: ChangeDetectorRef
        ) {
    }

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
            default:
                return this.componentFactoryResolver.resolveComponentFactory(AutoSettingComponent);
        }
    }
}