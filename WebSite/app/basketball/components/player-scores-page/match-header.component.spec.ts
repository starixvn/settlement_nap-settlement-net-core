// match-header.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchHeaderComponent } from './match-header.component';
import { MatchDetail } from '../../models';

describe('MatchHeaderComponent', () => {
  let component: MatchHeaderComponent;
  let fixture: ComponentFixture<MatchHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display league name', () => {
    const mockMatchDetail = new MatchDetail();
    mockMatchDetail.leagueName = 'NBA';
    component.matchDetail = mockMatchDetail;
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.league').textContent).toContain('NBA');
  });

  it('should display home and away team names', () => {
    const mockMatchDetail = new MatchDetail();
    mockMatchDetail.homeName = 'Lakers';
    mockMatchDetail.awayName = 'Warriors';
    component.matchDetail = mockMatchDetail;
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.match-team span').textContent).toContain('Lakers -vs- Warriors');
  });

  it('should emit refresh event when refresh button is clicked', () => {
    spyOn(component.refresh, 'emit');
    
    const refreshButton = fixture.nativeElement.querySelector('.refresh-icon');
    refreshButton.click();
    
    expect(component.refresh.emit).toHaveBeenCalled();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    spyOn(component, 'onRefresh');
    
    const refreshButton = fixture.nativeElement.querySelector('.refresh-icon');
    refreshButton.click();
    
    expect(component.onRefresh).toHaveBeenCalled();
  });
});