import { ResettleLogDetail } from './../../models/resettle-log-detail.model';
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ResettleLogDetailComponent } from "./resettle-log-detail.component";
import { FormsModule } from "@angular/forms";
import { HandleResultService } from "../../services/handle-result.service";
import { Match } from "../../models";

describe('Matches Component', () => {
    let component: ResettleLogDetailComponent;
    let fixture: ComponentFixture<ResettleLogDetailComponent>;
    const resettleLogDetail: ResettleLogDetail = {
        userName: '',
        resourceId: '',
        resourceName: '',
        settlementDate: '',
        homeValue: '',
        awayValue: '',
        action: '',
        resultValue: '',
        betType: '',
        otherInfo: '',
        class: ''
    }
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ResettleLogDetailComponent,
            ],
            providers: [],
            imports: [
                FormsModule,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(ResettleLogDetailComponent);
                component = fixture.componentInstance;
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('ngOnchanges - set value for log detail', () => {
        const match = new Match();
        resettleLogDetail.resourceName = 'a';
        const secondLogDetail = {...resettleLogDetail, resourceName: 'b'};
        match.resettleLogDetails = [resettleLogDetail, secondLogDetail];
        component.match = match;
        HandleResultService.HandleResult = jest.fn().mockReturnValue('resultValue');

        component.ngOnChanges();

        expect(match.resettleLogDetails[0].resultValue).toEqual('resultValue');
        expect(match.resettleLogDetails[0].class).toEqual('');
        expect(match.resettleLogDetails[1].class).toEqual('even');
    });
});