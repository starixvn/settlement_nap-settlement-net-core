import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResettleCheckerComponent } from './resettle-checker.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
describe('ResettleCheckerComponent', () => {
  let component: ResettleCheckerComponent;
  let fixture: ComponentFixture<ResettleCheckerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ResettleCheckerComponent,
        NgbModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [NgbModal]
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
    const emitSpy = jest.fn();
    component.proceedEvent.emit = emitSpy;

    component.onCheckboxChange(true);

    expect(emitSpy).toHaveBeenCalledWith(true);
  });
});
