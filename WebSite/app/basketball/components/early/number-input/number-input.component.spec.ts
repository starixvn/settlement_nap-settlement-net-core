import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NumberInputComponent, NumberInputOutSideComponent } from './number-input.component';
import { ResultDetail, ExternalResultDetail } from '../../../../shared/models/sportsbook-sop';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';

describe('Component: NumberInputComponent', () => {
    let component: NumberInputComponent;
    let fixture: ComponentFixture<NumberInputComponent>;
    
    const resultDetail = new ResultDetail();
    resultDetail.homeValue = 'Test Value';
    resultDetail.betType = '6130110';

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatTooltipModule,
                NumberInputComponent
            ],
            providers: [
                VerificationBaseService,
                ResultByTeamNamePipe
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(NumberInputComponent);
            component = fixture.componentInstance;
            component.item = resultDetail;
            component.enable = true;
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

});

describe('Component: NumberInputOutSideComponent', () => {
    let component: NumberInputOutSideComponent;
    let fixture: ComponentFixture<NumberInputOutSideComponent>;
    
    const resultDetail = new ResultDetail();
    const externalResult = {
      homeValue: 'External Value',
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatTooltipModule,
                NumberInputOutSideComponent
            ],
            providers: [
                VerificationBaseService,
                ResultByTeamNamePipe
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(NumberInputOutSideComponent);
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
