import { TestBed, waitForAsync, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { MatchesComponent } from './matches.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { UrlHelper } from '../../helper';
import { Match } from '../models';

describe('Matches Component', () => {
    let component: MatchesComponent;
    let fixture: ComponentFixture<MatchesComponent>;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                MatchesComponent,
            ],
            providers: [],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(MatchesComponent);
                component = fixture.componentInstance;
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('should hide menu when isShowMenu param is false', () => {
        spyOn(UrlHelper, 'getUrlParameter').and.returnValue("false");
        fixture.detectChanges();
        expect(component.scrollName).toEqual("hide-menu");
    });

    it('should show menu when isShowMenu param is true', () => {
        spyOn(UrlHelper, 'getUrlParameter').and.returnValue("true");
        fixture.detectChanges();
        expect(component.scrollName).toEqual("show-menu");
    });

    it('should opposite collapsed value', () => {
        const match = new Match();
        match.collapsed = true;
        component.onCollapsedClick(match);
        expect(match.collapsed).toBe(false);
    });

    it('should className = btn-right-up when isCollapsed is true', () => {
        const expectedClassName = component.getBackgroundIcon(true);
        expect(expectedClassName).toEqual("btn-right-up");
    });

    it('should className = btn-right when isCollapsed is false', () => {
        const expectedClassName = component.getBackgroundIcon(false);
        expect(expectedClassName).toEqual("btn-right");
    });
});