import { ChangeDetectorRef, Component, ComponentRef, ElementRef, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BlockUIService } from '../../shared/services';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main-page/main-page.component';
import { PageType } from '../../shared/constants';
import { MatDialogModule } from '@angular/material/dialog';
import { LogPageComponent } from './main-page/log-page.component.native';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    providers: [BlockUIService]
})
export class AppComponent implements OnInit {
    public blockUI = false;

    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public component: ComponentRef<OnInit>;

    constructor(protected injector: Injector,
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly viewContainerRef: ViewContainerRef,
        private readonly changeDetector: ChangeDetectorRef) { }

    ngOnInit() {
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.createComponent();
    }

    ngAfterContentChecked() {
        this.changeDetector.detectChanges();
    }

    private createComponent() {
        this.component = this.getComponentFactory();
        return this.component;
    }

    private getComponentFactory() {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        if (pageType === PageType.OutrightLog) {
            return this.viewContainerRef.createComponent(LogPageComponent);
        }

        return this.viewContainerRef.createComponent(MainPageComponent);
    }
}
