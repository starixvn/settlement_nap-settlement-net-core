import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { OnlyIntegerDirective } from "../../../../shared/directives";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
    ToastContainerDirective,
    ToastContainerModule,
    ToastrService,
} from "ngx-toastr";
import { ZeroFallbackDirective } from "../../../../shared/directives/zero-fall-back.directive.native";
import {
    GetAutoSettleSettings,
    IAutoSettleSettingsResponse,
    ResultSetting,
} from "../types";
import { NgClass, NgStyle } from "@angular/common";
import { AutoSettleSettingsService } from "../auto-settle-settings.service";
import { UrlHelper } from "../../../../helper";
import { MatDialog } from "@angular/material/dialog";
import { ProviderSelectionComponent } from "../provider-selection/provider-selection.component";
import { Store } from "../store";
import { cloneDeep, isEmpty } from "lodash";
import { MessageBoxService } from "../../../../shared/services";
import { Language } from "../../../../shared/language.native";
import { ModalDialogMessage } from "../../../../shared/models";
import { ResourceTypeNamePipe } from "../resource-type-name.pipe";
import { SettleTypeNamePipe } from "../settle-type-name.pipe";
import { LeagueAutoSettings } from "../../../../shared/models/league-auto-settings.model";
import { ResourceType } from "../../../../shared/constants/resource-type.native";
import { AutoSettleType } from "../../../../shared/constants/auto-settle-type.native";
import { TypeObject } from "../../../../shared/constants/type-object.native";
import {BackgroundColor} from "../../../../shared/constants";
import {SwitchComponent} from "../../../../shared/switch/switch.component";

@Component({
    selector: "app-auto-setting",
    templateUrl: `./data-table-setting.component.html`,
    imports: [
        OnlyIntegerDirective,
        ReactiveFormsModule,
        ToastContainerModule,
        ZeroFallbackDirective,
        NgClass,
        NgStyle,
        FormsModule,
        ResourceTypeNamePipe,
        SettleTypeNamePipe,
        SwitchComponent,
    ],
    providers: [AutoSettleSettingsService],
    standalone: true,
})
export class DataTableSettingComponent implements OnInit {

    @ViewChild(ToastContainerDirective, { static: true })
    toastContainer: ToastContainerDirective;

    private readonly autoSettleSettingsService = inject(
        AutoSettleSettingsService
    );
    private readonly store = inject(Store);
    private readonly dialog = inject(MatDialog);
    private readonly messageBoxService = inject(MessageBoxService);
    private readonly toastrService = inject(ToastrService);

    public title = "";
    public minProviderOptions = [0, 1, 2];
    public resultSettings: ResultSetting[] = [];
    public typeObject: TypeObject;
    public resourceType = ResourceType;
    public autoSettleType = AutoSettleType;

    ngOnInit(): void {
        this.toastrService.overlayContainer = this.toastContainer;

        const leagueId = +UrlHelper.getUrlParameter("leagueId");
        const matchId = +UrlHelper.getUrlParameter("matchId");
        const sportType = +UrlHelper.getUrlParameter("sportType");
        this.typeObject = UrlHelper.getUrlParameter("typeObject") as TypeObject;
        const refundWaitingTime = +UrlHelper.getUrlParameter("refundWaitingTime");
        const query: GetAutoSettleSettings = {
            leagueId,
            matchId,
            sportType,
            typeObject: this.typeObject,
        };

        this.store.actionAfterUpdate = () => {
            this.toastrService.clear();
        };

        this.autoSettleSettingsService.getAutoSetting(query).subscribe((res) => {
            this.processAutoSettleResponse(res, refundWaitingTime);
        });

        this.store.getAutoSettings().subscribe((res) => {
            this.resultSettings = res.resultSettings;
            this.title = res.leagueName;
        });
    }

    private processAutoSettleResponse(
        res: IAutoSettleSettingsResponse,
        refundWaitingTime: number
    ) {
        const refundResultSetting: ResultSetting = {
            resourceType: ResourceType.Main,
            settleType: AutoSettleType.AutoRefund,
            enabled: !!res.resultSettings?.find(
                (x) => x.resourceType === ResourceType.Main
            )?.enabled,
            waitingTime: refundWaitingTime,
            isTraderRequired: false,
            minProvider: 0,
            providers: [],
        };
        res.resultSettings.push(refundResultSetting);

        this.store.originResultSettings = cloneDeep(res.resultSettings);
        this.store.setAutoSetting(res);
    }

    getProvidersName(priority: number, resultSetting: ResultSetting) {
        const name = resultSetting.providers
            .filter((x) => x.isActive && x.priority === priority)
            .map((x) => x.sourceName)
            .join(", ");

        return isEmpty(name) ? "any." : name;
    }

    submit() {
        const confirmBox = new ModalDialogMessage(Language.confirmationBox);
        confirmBox.message =
            this.typeObject === "League"
                ? Language.AutoPayoutSetting.ConfirmMessageForAutoSetting
                : Language.AutoPayoutSetting.ConfirmMessageForMatch;
        confirmBox.hasActionOnNoBtn =  this.typeObject === "League";

        this.messageBoxService.confirm(
            confirmBox,
            () => {
                this.store.autoSettings.isApplyAll = this.typeObject === "League";
                this.handleUpdateSetting();
            },
            () => {
                if(this.typeObject === "League") {
                    this.store.autoSettings.isApplyAll = false;
                    this.handleUpdateSetting();
                }
            }
        );
    }

    handleUpdateSetting() {
        this.autoSettleSettingsService
            .updateAutoSetting({
                ...this.store.autoSettings,
                oldResultSettings: this.store.originResultSettings,
            })
            .subscribe((res) => {
                if (!res.isSuccessful) {
                    this.toastrService.error(res.errMsg);
                    return;
                }
                const getSettingValue = (
                    type: ResourceType | AutoSettleType,
                    key: "enabled" | "waitingTime"
                ) =>
                    this.store.autoSettings.resultSettings.find(
                        (setting) =>
                            setting.resourceType === type || setting.settleType === type
                    )?.[key];

                const response: LeagueAutoSettings = {
                    isApplyAll: this.store.autoSettings.isApplyAll,
                    earlyEnabled: getSettingValue(
                        ResourceType.Early,
                        "enabled"
                    ) as boolean,
                    mainEnabled: getSettingValue(ResourceType.Main, "enabled") as boolean,
                    earlyWaitingTime: getSettingValue(
                        ResourceType.Early,
                        "waitingTime"
                    ) as number,
                    mainWaitingTime: getSettingValue(
                        ResourceType.Main,
                        "waitingTime"
                    ) as number,
                    refundWaitingTime: getSettingValue(
                        AutoSettleType.AutoRefund,
                        "waitingTime"
                    ) as number,
                };

                parent.document
                    .getElementById("dialog-response")
                    .setAttribute("value", JSON.stringify(response));
                this.messageBoxService.closePopup();
            });
    }

    cancel() {
        this.messageBoxService.closePopup();
    }

    openProviderPopup(setting: ResultSetting) {
        this.dialog.closeAll();
        this.dialog.open(ProviderSelectionComponent, {
            width: "430px",
            data: setting,
        });
    }

    changeEnableAuto(setting: ResultSetting) {
        setting.enabled = !setting.enabled;
    }

    changeRequiredTrader(setting: ResultSetting) {
        setting.isTraderRequired = !setting.isTraderRequired;
    }

    getBackground(setting: ResultSetting) {
        return {
            "background-color":
                setting.settleType !== this.autoSettleType.AutoRefund &&
                    +setting.minProvider === 0 &&
                    !setting.isTraderRequired
                    ? "#FF0000"
                    : "white",
        };
    }

    getClassTraderToggle(setting) {
        return setting.enabled ? BackgroundColor.iconOn : BackgroundColor.iconOff;
    }

    changeTraderRequired(setting: ResultSetting) {
        console.log(setting.isTraderRequired);
        if(!setting.isTraderRequired) {
            setting.minProvider =  +setting.minProvider === 0 ? 1 : +setting.minProvider;
        }
    }


    changeMinProvider(setting: ResultSetting) {
        if(+setting.minProvider === 0) {
            setting.isTraderRequired = true;
        }
    }
}