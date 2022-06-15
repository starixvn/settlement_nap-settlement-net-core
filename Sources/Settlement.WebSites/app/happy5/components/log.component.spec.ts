import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { LogComponent } from './index';
import { MatchDetail } from '../models';

describe('Happy 5 - Log Component', () => {
    let component: LogComponent;
    let fixture: ComponentFixture<LogComponent>;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                LogComponent,
            ],
            providers: [],
            imports: [],
        })
            .compileComponents()
            .then(() => {
                const match = new MatchDetail();
                match.matchCode = "01";
                fixture = TestBed.createComponent(LogComponent);
                component = fixture.componentInstance;
                component.match = match;
                component.fromDate = "30-12-2018";
                component.toDate = "31-12-2018";
            });
    }));

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should return right url expected', () => {
        fixture.detectChanges();
        let result;
        result = component.url;
        const expectedUrl = "home/log/?matchCode=01&fromDate=30-12-2018&toDate=31-12-2018&isShowMenu=false&productType=HPF";
        expect(result.changingThisBreaksApplicationSecurity).toEqual(expectedUrl);
    });
});