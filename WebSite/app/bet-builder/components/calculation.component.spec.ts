import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { NgbModalRef, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CalculationComponent } from '.';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    CalculationFilterService,
    CalculationConstraintService,
    RequestService,
} from '../services';
import {
    DatepickerComponent,
    MultipleSelectComponent,
    ModalDialogComponent,
    TreeViewComponent,
    ModalContentDialogComponent,
} from '../../shared/components';
import { HttpRequestService, BlockUIService, MessageBoxService, ClosePopupService } from '../../shared/services';
import { MultipleSelect, ItemsSelect } from '../../shared/models';
import {
    League,
    GroupSelection,
    Selection,
    MatchDetail,
    SelectionPermission,
    Permission,
} from '../models';
import { ResultStatusPipe, SelectionPipe, TicketStatusPipe } from '../pipes';
import { Language } from '../../shared/language.native';

describe('Bet Builder - Calculation Component', () => {
    let component: CalculationComponent;
    let fixture: ComponentFixture<CalculationComponent>;
    let requestService: RequestService;
    let closePopupService: ClosePopupService;
    let calculationFilterService: CalculationFilterService;
    let calculationConstraintService: CalculationConstraintService;
    let messageBoxService: MessageBoxService;
    let modalService: NgbModal;
    let modalRef: NgbModalRef;
    const leagues: League[] = [];
    const selections: Selection[] = [];
    const autoCompletedStatus = 2;
    const manualCompletedStatus = 5;
    const otherStatus = 6;
    const timeout = 1000;

    const buttonName = "btn-danger";
    const errorMessage = "Error message";
    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
    };

    const unSuccessfulResult = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                CalculationComponent,
                DatepickerComponent,
                MultipleSelectComponent,
                ModalDialogComponent,
                ResultStatusPipe,
                SelectionPipe,
                TicketStatusPipe,
                TreeViewComponent,
                ModalContentDialogComponent,
            ],
            providers: [
                CalculationFilterService,
                MessageBoxService,
                HttpRequestService,
                CalculationConstraintService,
                BlockUIService,
                RequestService,
                ClosePopupService,
                NgbModal,
                MessageBoxService,
            ],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
            ],
        })
            .compileComponents()
            .then(() => {
                const item = new Selection("Selection Name");
                item.checked = true;
                selections.push(item);

                const match = new MatchDetail();
                match.matchId = 1;

                fixture = TestBed.createComponent(CalculationComponent);
                component = fixture.componentInstance;
                component.selections = selections;

                modalService = fixture.debugElement.injector.get(NgbModal);
                calculationFilterService = fixture.debugElement.injector.get(CalculationFilterService);
                calculationConstraintService = fixture.debugElement.injector.get(CalculationConstraintService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                requestService = fixture.debugElement.injector.get(RequestService);
                closePopupService = fixture.debugElement.injector.get(ClosePopupService);

                spyOn(calculationFilterService, 'getSelectionByGroupName').and.returnValue(selections);
                spyOn(calculationFilterService, 'getSelectionByResultStatus').and.returnValue(selections);
                spyOn(calculationConstraintService, 'highlightedResultValue').and.returnValue(selections);

                spyOn(calculationConstraintService, 'disableCalculate').and.returnValue(true);
                spyOn(calculationConstraintService, 'disableUnCalculate').and.returnValue(false);

                modalRef = modalService.open(ModalContentDialogComponent);
            });
    }));

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('group name should remove special character on the end sentence', () => {
        const result = component.correctGroupSelectionName("Group Selection name-");
        expect(result).toBe("Group Selection name");
    });

    it('section name should remove special character on the start sentence ', () => {
        const expectedName = "Selection name";
        const name = component.correctSelectionName("- Selection name");
        expect(name).toBe(expectedName);

        const result = component.correctSelectionName("Selection name");
        expect(result).toBe(expectedName);
    });

    describe('getResultStatus', () => {
        it('should return status is Running when resultStatusId = 1', () => {
            const status = component.getResultStatus(1);
            expect(status).toBe("Running");
        });

        it('should return status is Completed Auto when resultStatusId = 2', () => {
            const status = component.getResultStatus(autoCompletedStatus);
            expect(status).toBe("Completed (Auto)");
        });

        it('should return status is Completed Manual when resultStatusId = 5', () => {
            const status = component.getResultStatus(manualCompletedStatus);
            expect(status).toBe("Completed (Manual)");
        });

        it('should return status is emptied when resultStatusId is not IN (1, 2, 5)', () => {
            const status = component.getResultStatus(otherStatus);
            expect(status).toBe("");
        });
    });

    it('should return True when resultStatusId IN (2, 5)', () => {
        const autoCompleted = component.isCompleted(autoCompletedStatus);
        expect(autoCompleted).toBe(true);

        const manualCompleted = component.isCompleted(manualCompletedStatus);
        expect(manualCompleted).toBe(true);
    });

    it('collapsed value should opposite with define value.', () => {
        const group = new GroupSelection("Group name", selections);
        component.onCollapsedClick(group);

        const expected = group.collapsed;

        expect(expected).toBe(true);
    });

    it('should invoke some function after calling.', () => {
        const groups: GroupSelection[] = [];
        groups.push(new GroupSelection("Group name", selections));

        component.groupSelections = groups;
        component.selectAll(true);

        expect(calculationFilterService.getSelectionByGroupName).toHaveBeenCalled();
        expect(calculationFilterService.getSelectionByResultStatus).toHaveBeenCalled();
        expect(calculationConstraintService.disableCalculate).toHaveBeenCalled();
        expect(calculationConstraintService.disableUnCalculate).toHaveBeenCalled();
    });

    it('selectedAll should checked when all groups are checked.', () => {
        const groups: GroupSelection[] = [];
        const groupOne = new GroupSelection("Group name 1", selections);
        groupOne.checked = true;

        const groupTwo = new GroupSelection("Group name 2", selections);
        groupTwo.checked = true;

        groups.push(groupOne);
        groups.push(groupTwo);

        component.groupSelections = groups;
        component.onChangeGroup(groupOne);

        const expected = component.selectedAll;

        expect(expected).toBe(true);
    });

    it('group should checked when all selections are checked.', () => {
        const selections: Selection[] = [];
        const selection = new Selection("Selection Name");
        selection.checked = true;
        selections.push(selection);

        const groups: GroupSelection[] = [];
        const group = new GroupSelection("Group name 1", selections);
        groups.push(group);

        component.groupSelections = groups;
        component.onChangeSelection(selection, group);

        const expected = group.checked;

        expect(expected).toBe(true);
    });

    describe('calculate', () => {
        describe('Click on Yes button on confirm box.', () => {
            it('should invoke push function on requestService and there are no any error then the popup is closed.', (done) => {
                spyOn(requestService, 'push').and.returnValue(of(successfulResult));
                spyOn(calculationConstraintService, 'isValidResultValue').and.returnValue(true);
                spyOn(closePopupService, 'closePopup');
                spyOn(messageBoxService, 'confirm').and.returnValue(Promise.resolve(true));

                component.calculate();

                setTimeout(() => {
                    const expected = component.errorMessage;
                    expect(expected).toEqual("");
                    done();
                }, timeout);
            });

            it('should invoke push function on requestService and show error on the popup.', (done) => {
                spyOn(requestService, 'push').and.returnValue(of(unSuccessfulResult));
                spyOn(calculationConstraintService, 'isValidResultValue').and.returnValue(true);
                component.calculate();

                const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
                buttonYes.click();

                setTimeout(() => {
                    const expected = component.errorMessage;
                    expect(expected).toEqual(errorMessage);
                    done();
                }, timeout);
            });
        });
    });

    describe('unCalculate', () => {
        describe('Click on Yes button on confirm box.', () => {
            it('should invoke push function on requestService and there are no any error then the popup is closed.', (done) => {
                spyOn(requestService, 'push').and.returnValue(of(successfulResult));
                spyOn(calculationConstraintService, 'isValidResultValue').and.returnValue(true);
                spyOn(closePopupService, 'closePopup');
                spyOn(messageBoxService, 'confirm').and.returnValue(Promise.resolve(true));

                component.unCalculate();

                setTimeout(() => {
                    const expected = component.errorMessage;
                    expect(expected).toEqual("");
                    done();
                }, timeout);
            });

            it('should invoke push function on requestService and show error on the popup.', (done) => {
                spyOn(requestService, 'push').and.returnValue(of(unSuccessfulResult));
                spyOn(calculationConstraintService, 'isValidResultValue').and.returnValue(true);
                component.unCalculate();

                const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
                buttonYes.click();

                setTimeout(() => {
                    const expected = component.errorMessage;
                    expect(expected).toEqual(errorMessage);
                    done();
                }, timeout);
            });
        });

        it('should show UnCalculationConfirmMessageEarly1 message when selections '
        + 'list have not any item with result status running.', () => {
            component.unCalculate();

            const message = component.warningDialogMessage.message;
            const expected = Language.UnCalculationConfirmMessageEarly1;
            expect(expected).toEqual(message);
        });

        it('should show UnCalculationConfirmMessageEarly2 message when selections list have an item with result status running.', () => {
            const item = new Selection("Selection Name 2");
            item.resultStatusId = 1;
            item.checked = true;
            selections.push(item);
            component.unCalculate();

            const message = component.warningDialogMessage.message;
            const expected = Language.UnCalculationConfirmMessageEarly2;
            expect(expected).toEqual(message);
        });
    });

    describe('calculate show warning message', () => {
        it('should invoke alert message when invalid result.', () => {
            spyOn(calculationConstraintService, 'isValidResultValue').and.returnValue(false);
            spyOn(messageBoxService, 'alert').and.callThrough();
            component.calculate();
            expect(messageBoxService.alert).toHaveBeenCalled();
        });
    });

    describe('refresh', () => {
        it('should invoke some functions from services.', () => {
            const items: ItemsSelect[] = [];
            const selectionPermission = new SelectionPermission();
            selectionPermission.permission = new Permission();
            selectionPermission.selectionDetail = selections;

            spyOn(requestService, 'getSelection').and.returnValue(of(selectionPermission));
            spyOn(calculationFilterService, 'groupBySelectionName').and.returnValue(of(selectionPermission.selectionDetail));
            spyOn(calculationFilterService, 'renderSelection').and.returnValue(of(items));

            component.refresh();

            expect(requestService.getSelection).toHaveBeenCalled();
            expect(calculationFilterService.groupBySelectionName).toHaveBeenCalled();
            expect(calculationFilterService.renderSelection).toHaveBeenCalled();
            expect(calculationFilterService.getSelectionByGroupName).toHaveBeenCalled();
            expect(calculationFilterService.getSelectionByResultStatus).toHaveBeenCalled();
            expect(calculationConstraintService.disableCalculate).toHaveBeenCalled();
            expect(calculationConstraintService.disableUnCalculate).toHaveBeenCalled();
        });
    });

    describe('changeSelection', () => {
        it('selectedSelection should empty when value is emptied.', () => {
            component.changeSelection("");
            const selectedSelection = component.selectedSelection;

            expect(selectedSelection.length).toBe(0);
        });

        it('selectedSelection should not empty when have value.', () => {
            const count = 3;
            component.changeSelection("1,2,3");
            const selectedSelection = component.selectedSelection;

            expect(selectedSelection.length).toBeGreaterThanOrEqual(count);
        });
    });

    describe('changeTicketStatus', () => {
        it('selectedTicketStatus should empty when value is emptied.', () => {
            component.changeTicketStatus("");
            const selectedTicketStatus = component.selectedTicketStatus;

            expect(selectedTicketStatus.length).toBe(0);
        });

        it('selectedTicketStatus should not empty when have value.', () => {
            const count = 3;
            component.changeTicketStatus("1,2,3");
            const selectedTicketStatus = component.selectedTicketStatus;

            expect(selectedTicketStatus.length).toBeGreaterThanOrEqual(count);
        });
    });

    describe('changeResultStatus', () => {
        it('selectedSelection should empty when value is emptied.', () => {
            component.changeResultStatus("");
            const selectedResultStatus = component.selectedResultStatus;

            expect(selectedResultStatus.length).toBe(0);
        });

        it('selectedResultStatus should not empty when have value.', () => {
            const count = 3;
            component.changeResultStatus("1,2,3");
            const selectedResultStatus = component.selectedResultStatus;

            expect(selectedResultStatus.length).toBeGreaterThanOrEqual(count);
        });
    });

    describe('ngOnInit', () => {
        it('should invoke some functions and render selection', () => {
            const items: ItemsSelect[] = [];
            const selectionPermission = new SelectionPermission();
            selectionPermission.permission = new Permission();
            selectionPermission.selectionDetail = selections;

            spyOn(requestService, 'getSelection').and.returnValue(of(selectionPermission));
            spyOn(calculationFilterService, 'groupBySelectionName').and.returnValue(of(selectionPermission.selectionDetail));
            spyOn(calculationFilterService, 'renderSelection').and.returnValue(of(items));
            spyOn(calculationFilterService, 'initialResultStatus').and.returnValue(of(new MultipleSelect()));
            spyOn(calculationFilterService, 'initialTicketStatus').and.returnValue(of(new MultipleSelect()));
            spyOn(calculationFilterService, 'initialSelection').and.returnValue(of(new MultipleSelect()));

            component.ngOnInit();

            expect(calculationFilterService.initialResultStatus).toHaveBeenCalled();
            expect(calculationFilterService.initialTicketStatus).toHaveBeenCalled();
            expect(calculationFilterService.initialSelection).toHaveBeenCalled();
            expect(requestService.getSelection).toHaveBeenCalled();
        });
    });
});
