import { CommonModule } from "@angular/common";
import { Component, Injector, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { LogRequest } from "../../models/log-request.model";
import { OutrightService } from "../../services";
import { DatepickerComponent } from "../../../shared/components/date-picker/date-picker.component";
import { DynamicHeightDirective } from "../../../shared/directives";
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from "../../../shared/services";
import LogComponent from "../log.component";
import { NgbCalendar } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'log-page',
    templateUrl: './log-page.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, DatepickerComponent, MatDialogModule, DynamicHeightDirective, LogComponent],
    providers: [VerifyDateService, OutrightService, HttpRequestService, MessageBoxService, BlockUIService],
})
export default class LogPageComponent implements OnInit {
    private calendar: NgbCalendar;
    private verifyDateService: VerifyDateService;

    public request: LogRequest;
    constructor(protected injector: Injector) {
    }

    ngOnInit(): void {
        // this.calendar = this.injector.get(NgbCalendar);
        // this.verifyDateService = this.injector.get(VerifyDateService);
        // this.initData();
    }

}