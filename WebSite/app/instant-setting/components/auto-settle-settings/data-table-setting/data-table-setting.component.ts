import {Component, inject, OnInit} from "@angular/core";
import {OnlyIntegerDirective} from "../../../../shared/directives";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ToastContainerModule, ToastrService} from "ngx-toastr";
import {ZeroFallbackDirective} from "../../../../shared/directives/zero-fall-back.directive.native";
import {AutoSettleType, GetAutoSettleSettings, ResourceType, ResultSetting} from "../types";
import {NgClass} from "@angular/common";
import {AutoSettleSettingsService} from "../auto-settle-settings.service";
import {UrlHelper} from "../../../../helper";
import {MatDialog} from "@angular/material/dialog";
import {ProviderSelectionComponent} from "../provider-selection/provider-selection.component";
import {Store} from "../store";
import {cloneDeep, isEmpty, set} from 'lodash';
import {MessageBoxService} from "../../../../shared/services";
import {Language} from "../../../../shared/language.native";
import {ModalDialogMessage} from "../../../../shared/models";
import {ResourceTypeNamePipe} from "../resource-type-name.pipe";
import {SettleTypeNamePipe} from "../settle-type-name.pipe";
import {LeagueAutoSettings} from "../../../../shared/models/leagus-auto-settings.model";

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
        ResourceTypeNamePipe,
        SettleTypeNamePipe,
    ],
    providers: [AutoSettleSettingsService],
    standalone: true
})
export class DataTableSettingComponent implements OnInit {
    private  readonly autoSettleSettingsService = inject(AutoSettleSettingsService);
    private  readonly store = inject(Store);
    private readonly dialog = inject(MatDialog);
    private readonly messageBoxService = inject(MessageBoxService);

    public title = "";
    public minProviderOptions = [0,1,2];
    public resultSettings : ResultSetting[] = []


    ngOnInit(): void {
        const leagueId = +UrlHelper.getUrlParameter('leagueId') || 123590;
        const matchId = +UrlHelper.getUrlParameter('matchId') || 0;
        const sportType = +UrlHelper.getUrlParameter('sportType') || 43;
        const typeObject = UrlHelper.getUrlParameter('typeObject');
        const refundWaitingTime = +(UrlHelper.getUrlParameter('refundWaitingTime'));
        const query: GetAutoSettleSettings = {
            leagueId,
            matchId,
            sportType,
            typeObject: typeObject === "League" ? "League" : "Match"
        }

        this.autoSettleSettingsService.getAutoSetting(query).subscribe(res => {
            const refundResultSetting: ResultSetting = {
                resourceType: ResourceType.Main,
                settleType: AutoSettleType.AutoRefund,
                enabled: !!res.resultSettings?.find(x => x.resourceType === ResourceType.Main)?.enabled,
                waitingTime: refundWaitingTime,
                isTraderRequired: false,
                minProvider: 0,
                providers: []
            }
            res.resultSettings.push(refundResultSetting);

            this.store.originalAutoSetting = cloneDeep(res);
            this.store.setAutoSetting(res);
        });

        this.store.getAutoSettings().subscribe(res => {
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
            this.store.autoSettings.isApplyAll = true;
            this.autoSettleSettingsService.updateAutoSetting(this.store.autoSettings).subscribe(res => {
                const response: LeagueAutoSettings = {
                    isApplyAll: this.store.autoSettings.isApplyAll
                }
                parent.document.getElementById('dialog-response').setAttribute('value', JSON.stringify(response));
                this.messageBoxService.closePopup();
            });
        }, () => {
            this.store.autoSettings.isApplyAll = false;
            this.autoSettleSettingsService.updateAutoSetting(this.store.autoSettings).subscribe(res => {
                const response: LeagueAutoSettings = {
                    isApplyAll: this.store.autoSettings.isApplyAll
                }
                parent.document.getElementById('dialog-response').setAttribute('value', JSON.stringify(response));
                this.messageBoxService.closePopup();
            });
        });
    }

    cancel() {
        this.messageBoxService.closePopup();
    }

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