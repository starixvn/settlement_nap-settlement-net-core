import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from "@angular/core";
import { By } from '@angular/platform-browser';
import { NotReadyMatchComponent } from './not-ready-match.component';

describe('Component: NotReadyMatch', () => {
    let component: NotReadyMatchComponent;
    let fixture: ComponentFixture<NotReadyMatchComponent>;
    let el: DebugElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NotReadyMatchComponent],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(NotReadyMatchComponent);
                component = fixture.componentInstance;
            });
    }));

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
