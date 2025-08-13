import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BlockUIService } from '../../shared/services';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockBlockUIService: any;

  beforeEach(async () => {
    mockBlockUIService = {
      blockUIEvent: {
        subscribe: jest.fn()
      }
    };

    await TestBed.configureTestingModule({
      imports:[
        AppComponent,
        HttpClientModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: BlockUIService, useValue: mockBlockUIService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
