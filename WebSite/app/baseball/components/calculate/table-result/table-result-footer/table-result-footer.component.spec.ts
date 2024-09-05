import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableResultFooterComponent } from './table-result-footer.component';

describe('TableResultFooterComponent', () => {
  let component: TableResultFooterComponent;
  let fixture: ComponentFixture<TableResultFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableResultFooterComponent]
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
