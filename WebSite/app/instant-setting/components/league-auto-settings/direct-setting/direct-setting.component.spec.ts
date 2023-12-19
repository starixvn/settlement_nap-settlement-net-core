import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectSettingComponent } from './direct-setting.component';

describe('DirectSettingComponent', () => {
  let component: DirectSettingComponent;
  let fixture: ComponentFixture<DirectSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DirectSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
