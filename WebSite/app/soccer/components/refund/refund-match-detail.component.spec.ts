import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScorePipe } from '../../pipes/score.pipe';
import { PipesModule } from '../../../shared/pipes/pipes.module.native';

import { RefundMatchDetailComponent } from './refund-match-detail.component';
import { MatchDetail } from './model/match.model';
import { GoalIcon } from '../../models';

describe('MatchDetailComponent', () => {
  let component: RefundMatchDetailComponent;
  let fixture: ComponentFixture<RefundMatchDetailComponent>;
  const matchDetail = {} as MatchDetail;
  const goalIcon = {} as GoalIcon;
  matchDetail.goalIcon = goalIcon;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundMatchDetailComponent,
        ScorePipe ],
      providers:[
      ],
      imports: [

      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundMatchDetailComponent);
    component = fixture.componentInstance;
    component.matchDetail = matchDetail;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
