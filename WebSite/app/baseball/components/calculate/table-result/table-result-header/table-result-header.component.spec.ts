import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableResultHeaderComponent } from './table-result-header.component';

describe('TableResultHeaderComponent', () => {
  let component: TableResultHeaderComponent;
  let fixture: ComponentFixture<TableResultHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableResultHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableResultHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
