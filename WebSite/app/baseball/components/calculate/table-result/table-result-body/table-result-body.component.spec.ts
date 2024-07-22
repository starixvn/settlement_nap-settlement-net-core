import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableResultBodyComponent } from './table-result-body.component';

describe('TableResultRowComponent', () => {
  let component: TableResultBodyComponent;
  let fixture: ComponentFixture<TableResultBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableResultBodyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableResultBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
