import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoPayoutSettingComponent } from './auto-payout-setting.component';

describe('AutoPayoutSettingComponent', () => {
  let component: AutoPayoutSettingComponent;
  let fixture: ComponentFixture<AutoPayoutSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoPayoutSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoPayoutSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
