import {
    AfterViewInit,
    Directive,
    ElementRef,
    Input,
    Renderer2,
} from "@angular/core";
import { fromEvent } from "rxjs";
import { debounceTime, throttleTime } from "rxjs/operators";

@Directive({
    selector: "[dynamicHeight]",
    standalone: true
})
export class DynamicHeightDirective implements AfterViewInit {
    @Input() minHeight: number;
    // @Input() bottomOffset?: number;
    @Input("dynamicHeight") topOffset: number;

    private domElement: HTMLElement;

    constructor(private renderer: Renderer2, private elementRef: ElementRef) {
        this.domElement = this.elementRef.nativeElement as HTMLElement;
        // this.bottomOffset = this.bottomOffset ?? 0

        // register on window resize event
        fromEvent(window, "resize")
            .pipe(throttleTime(500), debounceTime(500))
            .subscribe(() => this.setHeight());
    }

    ngAfterViewInit() {
        this.setHeight();
    }

    private setHeight() {

        const windowHeight = window?.innerHeight;
        const topOffset = this.topOffset || this.calcTopOffset();
        let height = windowHeight - topOffset - 5

        // set min height instead of the calculated
        if (this.minHeight && height < this.minHeight) {
            height = this.minHeight;
        }

        this.renderer.setStyle(this.domElement, "height", `${height}px`);
    }

    private calcTopOffset(): number {
        try {
            const rect = this.domElement.getBoundingClientRect();
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;

            return rect.top + scrollTop;
        } catch (e) {
            return 0;
        }
    }
}