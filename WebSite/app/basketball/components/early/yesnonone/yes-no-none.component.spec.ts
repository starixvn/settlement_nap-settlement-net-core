import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { YesNoNoneComponent, YesNoNoneOutSideComponent } from './yes-no-none.component';
import { ResultDetail, ExternalResultDetail } from '../../../../shared/models/sportsbook-sop';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';

describe('Component: YesNoNoneComponent', () => {
    let component: YesNoNoneComponent;
    let fixture: ComponentFixture<YesNoNoneComponent>;
    
    const resultDetail = new ResultDetail();
    resultDetail.homeValue = 'Y';
    resultDetail.betType = '6130110';

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                YesNoNoneComponent,

            ],
            providers: [
                VerificationBaseService,
                ResultByTeamNamePipe
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(YesNoNoneComponent);
            component = fixture.componentInstance;
            component.item = resultDetail;
            component.enable = true;
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should extend InputFinalBaseComponent', () => {
        expect(component.item).toBe(resultDetail);
        expect(component.enable).toBe(true);
    });
});

describe('Component: YesNoNoneOutSideComponent', () => {
    let component: YesNoNoneOutSideComponent;
    let fixture: ComponentFixture<YesNoNoneOutSideComponent>;
    
    const resultDetail = new ResultDetail();
    const externalResult = {
      homeValue: 'N'
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                YesNoNoneOutSideComponent
            ],
            providers: [
                VerificationBaseService,
                ResultByTeamNamePipe
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(YesNoNoneOutSideComponent);
            component = fixture.componentInstance;
            component.resultDetail = resultDetail;
            component.externalResult = externalResult as ExternalResultDetail;
            component.enable = true;
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
