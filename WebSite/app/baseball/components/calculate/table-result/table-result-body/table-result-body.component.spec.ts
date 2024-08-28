import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TableResultBodyComponent } from "./table-result-body.component";
import { CalculateStorage } from "../../../../services/calculate/calculate.storage";
import { ResultRowStateService } from "../../../../services/result-row-state.service";
import { VerificationBaseService } from "../../../../../core/services/verification-base.service";
import { NotifyService } from "../../../../services/notify.service";
import { CalculateService } from "../../../../services/calculate/calculate.service";
import { AioService, HttpRequestService, IntervalCalculationService } from "../../../../../shared/services";
import { HttpClientModule } from "@angular/common/http";
import { ResultByTeamNamePipe } from "../../../../../shared/pipes/result-by-team-name.pipe";
import { IntervalBackgroundPipe } from "../../../../../shared/pipes/interval-background.pipe";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { ResourceNamePipe } from "../../../../pipes/resource-name.pipe";

describe("TableResultRowComponent", () => {
  let component: TableResultBodyComponent;
  let fixture: ComponentFixture<TableResultBodyComponent>;
  let storage: CalculateStorage;
  let resultRowState: ResultRowStateService;
  let verificationService: VerificationBaseService;
  let notifyService: NotifyService;
  let calculateService: CalculateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableResultBodyComponent,HttpClientModule, ToastrModule.forRoot()],
      providers: [
        CalculateStorage,
        ResultRowStateService,
        VerificationBaseService,
        NotifyService,
        CalculateService,
        AioService, 
        HttpRequestService,
        ResultByTeamNamePipe,
        IntervalBackgroundPipe,
        ToastrService,
        IntervalCalculationService,
        ResourceNamePipe
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableResultBodyComponent);
    component = fixture.componentInstance;
    storage = TestBed.inject(CalculateStorage);
    resultRowState = TestBed.inject(ResultRowStateService);
    verificationService = TestBed.inject(VerificationBaseService);
    notifyService = TestBed.inject(NotifyService);
    calculateService = TestBed.inject(CalculateService);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
