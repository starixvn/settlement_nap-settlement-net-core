import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PlayerSelectionComponent, PlayerSelectionOutSideComponent } from './player-selection.component';
import { ResultDetail, ExternalResultDetail } from '../../../../shared/models/sportsbook-sop';
import { PlayerSelection } from '../../../models/player-selection.model';
import { OddFlexModel, OddsInfoModel } from '../../../../shared/models/sportsbook-sop/odds-flex.model';

describe('Component: PlayerSelectionComponent', () => {
    let component: PlayerSelectionComponent;
    let fixture: ComponentFixture<PlayerSelectionComponent>;
    
    const oddFlex: OddFlexModel[] = [
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
    
    const resultDetail = new ResultDetail();
    resultDetail.homeValue = 'player1';
    resultDetail.oddFlex = oddFlex;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                PlayerSelectionComponent
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(PlayerSelectionComponent);
            component = fixture.componentInstance;
            component.item = resultDetail;
            component.enable = true;
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call createSelection on initialization', () => {
            jest.spyOn(component, 'createSelection' as any);

            component.ngOnInit();

            expect(component['createSelection']).toHaveBeenCalled();
        });
    });

    describe('createSelection', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should create PlayerSelection objects from oddFlex', () => {
            expect(component.playerSelections[0]).toBeInstanceOf(PlayerSelection);
            expect(component.playerSelections[0].betChoice).toBe('player1');
            expect(component.playerSelections[0].playerName).toBe('Player One');
            
            expect(component.playerSelections[1]).toBeInstanceOf(PlayerSelection);
            expect(component.playerSelections[1].betChoice).toBe('player2');
            expect(component.playerSelections[1].playerName).toBe('Player Two');
        });

        it('should handle empty oddFlex array', () => {
            component.item.oddFlex = [];
            component.ngOnInit();

            expect(component.playerSelections).toEqual([]);
        });

        it('should handle null oddFlex', () => {
            component.item.oddFlex = null;
            component.ngOnInit();

            expect(component.playerSelections).toBeUndefined();
        });
    });

});

describe('Component: PlayerSelectionOutSideComponent', () => {
    let component: PlayerSelectionOutSideComponent;
    let fixture: ComponentFixture<PlayerSelectionOutSideComponent>;
    
    const oddFlex: OddFlexModel[] = [
        {
          betChoice: 'player3',
          info: { playerName: 'Player Three' } as OddsInfoModel,
          resourceId: '',
          betType: 0,
          oddsInfo: ''
        }
    ];
    
    const resultDetail = new ResultDetail();
    resultDetail.oddFlex = oddFlex;
    
    const externalResult = {
      homeValue: 'player3'
    } as ExternalResultDetail;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                PlayerSelectionOutSideComponent
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(PlayerSelectionOutSideComponent);
            component = fixture.componentInstance;
            component.resultDetail = resultDetail;
            component.externalResult = externalResult;
            component.enable = true;
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });


    describe('ngOnInit', () => {
        it('should call createSelection on initialization', () => {
            jest.spyOn(component, 'createSelection' as any);

            component.ngOnInit();

            expect(component['createSelection']).toHaveBeenCalled();
        });
    });

    describe('createSelection', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should create PlayerSelection objects from resultDetail oddFlex', () => {
            expect(component.playerSelections[0]).toBeInstanceOf(PlayerSelection);
            expect(component.playerSelections[0].betChoice).toBe('player3');
            expect(component.playerSelections[0].playerName).toBe('Player Three');
        });

        it('should handle empty oddFlex array', () => {
            component.resultDetail.oddFlex = [];
            component.ngOnInit();

            expect(component.playerSelections).toEqual([]);
        });

        it('should handle null oddFlex', () => {
            component.resultDetail.oddFlex = null;
            component.ngOnInit();

            expect(component.playerSelections).toBeUndefined();
        });
    });
});
