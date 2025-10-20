import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { TraderResultComponent } from './trader-result.component';
import { ResultDetail, MatchDetail, ExternalResultDetail } from '../../../../shared/models/sportsbook-sop';
import { ResultControlGroup } from '../../../constants/result-control-group.native';
import { OddFlexModel, OddsInfoModel } from '../../../../shared/models/sportsbook-sop/odds-flex.model';

describe('Component: TraderResultComponent', () => {
    let component: TraderResultComponent;
    let fixture: ComponentFixture<TraderResultComponent>;
    
    const mockMatchDetail = new MatchDetail();
    
    const mockExternalResult = new ExternalResultDetail(1, '00', 'Test Source');
    
    const mockOddFlex: OddFlexModel[] = [
        {
            betChoice: 'player1',
            info: { playerName: 'Player One' } as OddsInfoModel,
            resourceId: '',
            betType: 0,
            oddsInfo: ''
        },
        {
            betChoice: 'player2', 
            info: { playerName: 'Player Two' } as OddsInfoModel,
            resourceId: '',
            betType: 0,
            oddsInfo: ''
        }
    ];

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                TraderResultComponent
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(TraderResultComponent);
            component = fixture.componentInstance;
            component.matchDetail = mockMatchDetail;
            component.externalResult = mockExternalResult;
            component.resultDetail = new ResultDetail();
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should set playerSelected when inputType is playerSelect', () => {
            // Arrange
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.oddFlex = mockOddFlex;
            component.resultDetail = resultDetail;
            
            const externalResult = new ExternalResultDetail(1, '00', 'Test Source', '', 'player1');
            component.externalResult = externalResult;

            // Act
            component.ngOnInit();

            // Assert
            expect(component.playerSelected).toBe('Player One');
        });

        it('should set playerSelected to undefined when no matching betChoice found', () => {
            // Arrange
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.oddFlex = mockOddFlex;
            component.resultDetail = resultDetail;
            
            const externalResult = new ExternalResultDetail(1, '00', 'Test Source', '', 'nonexistent');
            component.externalResult = externalResult;

            // Act
            component.ngOnInit();

            // Assert
            expect(component.playerSelected).toEqual('nonexistent');
        });

        it('should handle empty oddFlex array', () => {
            // Arrange
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.oddFlex = [];
            component.resultDetail = resultDetail;
            
            const externalResult = new ExternalResultDetail(1, '00', 'Test Source', '', 'None');
            component.externalResult = externalResult;

            // Act
            component.ngOnInit();

            // Assert
            expect(component.playerSelected).toEqual('None');
        });
    });
});
