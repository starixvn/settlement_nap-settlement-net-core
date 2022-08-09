import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { BadmintonService } from './badminton.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../shared/components';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';


describe('BadmintonService', () => {
  let service: BadmintonService = null;
  let httpRequestService: HttpRequestService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      providers: [
        BadmintonService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        IntervalBackgroundPipe,
        NgbModule,
      ],
      imports: [
        HttpClientModule,
        NgbModule
      ],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      });

    service = TestBed.inject(BadmintonService);
    httpRequestService = TestBed.inject(HttpRequestService);
  });

  beforeEach(inject([BadmintonService], (badmintonService: BadmintonService) => {
    service = badmintonService;
  }));

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

});