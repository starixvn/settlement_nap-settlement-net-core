import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDeadheatSettingComponent } from './update-deadheat-setting.component';

describe('UpdateDeadheatSettingComponent', () => {
  let component: UpdateDeadheatSettingComponent;
  let fixture: ComponentFixture<UpdateDeadheatSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateDeadheatSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateDeadheatSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
