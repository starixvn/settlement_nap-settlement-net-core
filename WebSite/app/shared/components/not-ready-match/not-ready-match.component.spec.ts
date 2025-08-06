import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NotReadyMatchComponent } from './not-ready-match.component';
import { By } from '@angular/platform-browser';

describe('Component: NotReadyMatch', () => {
    let component: NotReadyMatchComponent;
    let fixture: ComponentFixture<NotReadyMatchComponent>;
    let el: any;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [NotReadyMatchComponent],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NotReadyMatchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('should display warning message kickoff time', waitForAsync(() => {
        const expectedContent = "Follow by match kick off time, "
            + "this match is not over yet!!! Please check carefully !!!";
        el = fixture.debugElement.query(By.css(".content"));
        expect(el.nativeElement.textContent).toBe(expectedContent);
    }));
});
