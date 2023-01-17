import { Component, OnInit } from '@angular/core';
import { Outright } from '../models/outright.model';
import { BlockUIService } from '../../shared/services';
import { UncalculatePopupComponent } from './popup/uncalculate-popup.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [UncalculatePopupComponent],
    providers:[BlockUIService]
})
export default class AppComponent implements OnInit {
    public blockUI = false;
    public outright: Outright;
    constructor(private readonly blockUIService: BlockUIService,
    ) { }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    }

    public search(outright: Outright) {
        this.outright = outright;
    }
}
