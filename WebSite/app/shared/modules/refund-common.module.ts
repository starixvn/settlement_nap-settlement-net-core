import { AioService } from './../services/aio.service';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToastContainerModule, ToastrService } from "ngx-toastr";
import { BlockUIService, HttpRequestService } from "../services";
import { MessageBoxService } from "../services/message-box.service.native";
import { IntervalBackgroundPipe } from '../pipes/interval-background.pipe';

@NgModule({
    exports: [FormsModule, CommonModule, ToastContainerModule],
    providers: [
        MessageBoxService,
        ToastrService,
        BlockUIService,
        HttpRequestService,
        AioService,
        IntervalBackgroundPipe ]
})
export class RefundCommonModule {
}