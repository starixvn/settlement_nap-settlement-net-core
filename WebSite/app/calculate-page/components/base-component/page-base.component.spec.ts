import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { Calculation } from 'calculate-page/models';
import { of } from 'rxjs';
import { BlockUIService, ReCheckInService } from "../../../shared/services";
import { PageBaseComponent } from "./page-base.component";

describe('MultiSport - AppComponent', () => {
    let component: PageBaseComponent;
    let fixture: ComponentFixture<PageBaseComponent>;
    let blockUIService: BlockUIService;
    let reCheckInService: ReCheckInService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [
                PageBaseComponent,
            ],
            providers: [
                BlockUIService,
                ReCheckInService,
            ],
            imports:[
                HttpClientModule,
            ]
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(PageBaseComponent);
                component = fixture.componentInstance;
                blockUIService = fixture.debugElement.injector.get(BlockUIService);
                reCheckInService = fixture.debugElement.injector.get(ReCheckInService);
            });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit - should start reCheckin interval', fakeAsync(() => {
        spyOn(blockUIService, 'blockUIEvent').and.returnValue(of(true));
        spyOn(reCheckInService, 'reCheckin');

        component.ngOnInit();
        tick(60000);
        component.ngOnDestroy();

        expect(reCheckInService.reCheckin).toHaveBeenCalled();
    }));
});