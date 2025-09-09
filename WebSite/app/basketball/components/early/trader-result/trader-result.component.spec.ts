import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { TraderResultComponent } from './trader-result.component';
import { ResultDetail, MatchDetail } from '../../../../shared/models/sportsbook-sop';
import { ResultControlGroup } from '../../../constants/result-control-group.native';
import { OddFlexModel, OddsInfoModel } from '../../../../shared/models/sportsbook-sop/odds-flex.model';

describe('Component: TraderResultComponent', () => {
    let component: TraderResultComponent;
    let fixture: ComponentFixture<TraderResultComponent>;
    
    const mockMatchDetail = new MatchDetail();
    
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
            resultDetail.homeValue = 'player1';
            resultDetail.oddFlex = mockOddFlex;
            component.result = resultDetail;

            // Act
            component.ngOnInit();

            // Assert
            expect(component.playerSelected).toBe('Player One');
        });

        it('should set playerSelected to undefined when no matching betChoice found', () => {
            // Arrange
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.homeValue = 'nonexistent';
            resultDetail.oddFlex = mockOddFlex;
            component.result = resultDetail;

            // Act
            component.ngOnInit();

            // Assert
            expect(component.playerSelected).toEqual('');
        });

        it('should not set playerSelected when inputType is not playerSelect', () => {
            // Arrange
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.textBox;
            resultDetail.homeValue = 'some value';
            resultDetail.oddFlex = mockOddFlex;
            component.result = resultDetail;

            // Act
            component.ngOnInit();

            // Assert
            expect(component.playerSelected).toBe('');
        });

        it('should handle null oddFlex gracefully', () => {
            // Arrange
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.homeValue = 'player1';
            resultDetail.oddFlex = null;
            component.result = resultDetail;

            // Act
            expect(() => component.ngOnInit()).not.toThrow();

            // Assert
            expect(component.playerSelected).toEqual('');
        });

        it('should handle empty oddFlex array', () => {
            // Arrange
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.homeValue = 'player1';
            resultDetail.oddFlex = [];
            component.result = resultDetail;

            // Act
            component.ngOnInit();

            // Assert
            expect(component.playerSelected).toEqual('');
        });
    });
});
