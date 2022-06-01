import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResettleCheckerComponent } from './resettle-checker.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
describe('ResettleCheckerComponent', () => {
  let component: ResettleCheckerComponent;
  let fixture: ComponentFixture<ResettleCheckerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResettleCheckerComponent ],
      providers: [NgbModal],
      imports: [
        FormsModule,
    ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResettleCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit on checkbox change', () => {
    spyOn(component.proceedEvent, 'emit');

    component.onCheckboxChange(true);

    expect(component.proceedEvent.emit).toHaveBeenCalledWith(true);
  });
});
