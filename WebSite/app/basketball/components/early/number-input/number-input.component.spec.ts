import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NumberInputComponent, NumberInputOutSideComponent } from './number-input.component';
import { ResultDetail, ExternalResultDetail } from '../../../../shared/models/sportsbook-sop';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';
import { MixMultiStatsService } from '../../../services/mix-multi-stats.service';
import { MixDoubleDoubleService } from '../../../services/mix-double-double.service';
import { MixHeadHeadService } from '../../../services/mix-head-head.service';
import { MixCoreService } from '../../../services/mix-core.service';
import { createMockVerificationService, createMockMixMultiStatsService, createMockMixDoubleDoubleService, createMockMixHeadHeadService, createMockMixCoreService } from '../../../test-helpers/mock-services';

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
                { provide: VerificationBaseService, useValue: createMockVerificationService() },
                { provide: MixMultiStatsService, useValue: createMockMixMultiStatsService() },
                { provide: MixDoubleDoubleService, useValue: createMockMixDoubleDoubleService() },
                { provide: MixHeadHeadService, useValue: createMockMixHeadHeadService() },
                { provide: MixCoreService, useValue: createMockMixCoreService() },
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
                { provide: VerificationBaseService, useValue: createMockVerificationService() },
                { provide: MixMultiStatsService, useValue: createMockMixMultiStatsService() },
                { provide: MixDoubleDoubleService, useValue: createMockMixDoubleDoubleService() },
                { provide: MixHeadHeadService, useValue: createMockMixHeadHeadService() },
                { provide: MixCoreService, useValue: createMockMixCoreService() },
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
