import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderSelectionComponent } from './provider-selection.component';

describe('ProviderSelectionComponent', () => {
  let component: ProviderSelectionComponent;
  let fixture: ComponentFixture<ProviderSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
