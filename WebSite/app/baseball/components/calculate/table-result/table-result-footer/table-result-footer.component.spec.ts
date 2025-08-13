import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TableResultFooterComponent } from './table-result-footer.component';
import { CalculateStorage } from '../../../../services/calculate/calculate.storage';
import { CalculateService } from '../../../../services/calculate/calculate.service';
import { ToastrModule } from 'ngx-toastr';

describe('TableResultFooterComponent', () => {
  let component: TableResultFooterComponent;
  let fixture: ComponentFixture<TableResultFooterComponent>;

  beforeEach(async () => {
    const mockCalculateStorage = {
      getResultChecked: () => [],
      getResultDetails: () => [],
      getMatch: () => ({ resultDetails: [] }),
      getPermission: () => ({ canUncalculate: true }),
      isReadyMatch: () => true,
      getFullTime: () => ({ isSpecialBettype: false })
    };

    const mockCalculateService = {
      calculate: () => {},
      uncalculate: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [TableResultFooterComponent, HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        { provide: CalculateStorage, useValue: mockCalculateStorage },
        { provide: CalculateService, useValue: mockCalculateService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableResultFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
