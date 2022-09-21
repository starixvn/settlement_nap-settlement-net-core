import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { TicketCountComponent } from './ticket-count.component';
import { TicketCount } from 'shared/models';

describe('Basketball - TicketCountComponent', () => {
  let component: TicketCountComponent;
  let fixture: ComponentFixture<TicketCountComponent>;
  let elementDe: DebugElement;
  let elementHTML: HTMLElement;
  let expectedTicketCounts: TicketCount;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketCountComponent ]
    })
    .compileComponents()
    .then(() => {
        fixture = TestBed.createComponent(TicketCountComponent);
        component = fixture.componentInstance;

        expectedTicketCounts = {
          groupId: null,
          groupName: "Expect",
          betRunningCount: null,
          betSettledCount: null,
          betMarkedCount: null,
        };

        component.ticketCounts = expectedTicketCounts;
        fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`When match have value -> ticketCount have value`, () => {
      expect(component.ticketCounts).toBeTruthy();
  });

  it(`when match have value -> render right value`, () => {
      elementDe = fixture.debugElement.query(By.css('tbody td'));
      elementHTML = elementDe.nativeElement;

      expect(elementHTML.textContent).toBe("Expect");
  });
});
