import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecificBettypeComponent } from './specific-bettype.component';
import { RequestService } from '../../services/request.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../../../shared/services';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

export class MatDialogRefMock {
    close():void{}
}
describe('SpecificBettypeComponent', () => {
    let component: SpecificBettypeComponent;
    let dialogRef: MatDialogRef<SpecificBettypeComponent>;
    let requestService: RequestService;
    let fixture: ComponentFixture<SpecificBettypeComponent>;

    const data = {
        type: "",
        action: "",
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SpecificBettypeComponent],
            providers: [
                RequestService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
                { provide: MatDialogRef, useValue: new MatDialogRefMock() },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
            imports: [
                HttpClientModule,
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SpecificBettypeComponent);
        dialogRef = fixture.debugElement.injector.get(MatDialogRef);
        requestService = fixture.debugElement.injector.get(RequestService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('close - should call close function', () => {
        jest.spyOn(dialogRef, 'close');

        component.close();

        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('ngOnInit - should call api to get bettype', async () => {
        jest.spyOn(requestService, 'getSpecificBetType').mockReturnValue(of(["1", "2"]));

        await component.ngOnInit();

        expect(requestService.getSpecificBetType).toHaveBeenCalled();
        expect(component.betTypeName).toEqual("1, 2");
    });
}); 