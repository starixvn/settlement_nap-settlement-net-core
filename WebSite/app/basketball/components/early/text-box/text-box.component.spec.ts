import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TextBoxComponent, TextBoxOutSideComponent } from './text-box.component';
import { ResultDetail, ExternalResultDetail } from '../../../../shared/models/sportsbook-sop';

describe('Component: TextBoxComponent', () => {
    let component: TextBoxComponent;
    let fixture: ComponentFixture<TextBoxComponent>;
    
    const resultDetail = new ResultDetail();
    resultDetail.homeValue = 'Test Value';
    resultDetail.betType = '6130110';

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatTooltipModule,
                TextBoxComponent
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(TextBoxComponent);
            component = fixture.componentInstance;
            component.item = resultDetail;
            component.enable = true;
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

});

describe('Component: TextBoxOutSideComponent', () => {
    let component: TextBoxOutSideComponent;
    let fixture: ComponentFixture<TextBoxOutSideComponent>;
    
    const resultDetail = new ResultDetail();
    const externalResult = {
      homeValue: 'External Value',
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatTooltipModule,
                TextBoxOutSideComponent
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(TextBoxOutSideComponent);
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
