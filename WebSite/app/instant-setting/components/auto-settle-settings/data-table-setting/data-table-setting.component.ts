import {Component, inject, OnInit} from "@angular/core";
import {OnlyIntegerDirective} from "../../../../shared/directives";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ToastContainerModule, ToastrService} from "ngx-toastr";
import {ZeroFallbackDirective} from "../../../../shared/directives/zero-fall-back.directive.native";
import { ResultSetting} from "../types";
import {NgClass} from "@angular/common";
import { AutoSettleSettingsService } from "../auto-settle-settings.service";
import { UrlHelper } from "../../../../helper";
import {MatDialog } from "@angular/material/dialog";
import {ProviderSelectionComponent} from "../provider-selection/provider-selection.component";
import { Store } from "../store";
import {cloneDeep, isEmpty} from 'lodash';
import {MessageBoxService} from "../../../../shared/services";
import {Language} from "../../../../shared/language.native";
import {ModalDialogMessage} from "../../../../shared/models";

@Component({
    selector: "app-auto-setting",
    templateUrl: `./data-table-setting.component.html`,
    imports: [
        OnlyIntegerDirective,
        ReactiveFormsModule,
        ToastContainerModule,
        ZeroFallbackDirective,
        NgClass,
        FormsModule,
    ],
    providers: [AutoSettleSettingsService],
    standalone: true
})
export class DataTableSettingComponent implements OnInit {
    private  readonly autoSettleSettingsService = inject(AutoSettleSettingsService);
    private  readonly store = inject(Store);
    private readonly dialog = inject(MatDialog);
    private readonly messageBoxService = inject(MessageBoxService);
    private readonly toastrService = inject(ToastrService);

    public title = "";
    public minProviderOptions = [0,1,2];
    public resultSettings : ResultSetting[] =[]


    ngOnInit(): void {
        const leagueId = +UrlHelper.getUrlParameter('leagueId') || 97078;
        const matchId = +UrlHelper.getUrlParameter('matchId') || 97078;
        const sportType = +UrlHelper.getUrlParameter('sportType') || 43;
        const autoSetting = +UrlHelper.getUrlParameter('autoSetting');
        const refundWaitingTime = +(UrlHelper.getUrlParameter('refundWaitingTime'));

        console.log("DataTableSettingComponent",leagueId, sportType, autoSetting);

        this.autoSettleSettingsService.getAutoSetting(leagueId, sportType).subscribe(res => {
            res.resultSettings[0].enabled = autoSetting === 1; // payout
            res.resultSettings[1].enabled = autoSetting === 5; // early
            res.typeObject = "League"

            const refundResultSetting: ResultSetting = {
                typeResult: "Main",
                typeSettle: "Refund",
                enabled: false,
                waitingTime: refundWaitingTime,
                isTraderRequired: false,
                minProvider: 0,
                providers: []
            }

            res.resultSettings.push(refundResultSetting);

            this.store.originalAutoSetting = cloneDeep(res);
            this.store.setAutoSetting(res);
        });


        this.store.getAutoSetting().subscribe(res => {
            console.log("subscribe",res);
            this.resultSettings = res.resultSettings;
            this.title = res.leagueName;
        })

    }

    getProvidersName(priority: number, resultSetting: ResultSetting) {
        const name = resultSetting.providers
            .filter(x => x.isActive && x.priority === priority)
            .map(x => x.sourceName).join(', ');
        return isEmpty(name) ? 'any.' : name;
    }

    submit() {
        const confirmBox = new ModalDialogMessage(Language.confirmationBox);
        confirmBox.message = Language.AutoPayoutSetting.ConfirmMessageForAutoSetting;
        confirmBox.hasActionOnNoBtn = true;
        this.messageBoxService.confirm(confirmBox, () => {
            console.log('yes')
        }, () => {
        console.log('no');
        });
    }

    cancel() {}

    openProviderPopup(setting:ResultSetting) {
        this.dialog.closeAll();
        this.dialog.open(ProviderSelectionComponent, {
            width: '400px',
            data: setting
        });

    }

    changeEnableAuto(setting: ResultSetting) {
        setting.enabled = !setting.enabled;
    }

    changeRequiredTrader(setting: ResultSetting) {
        setting.isTraderRequired = !setting.isTraderRequired;
    }
}