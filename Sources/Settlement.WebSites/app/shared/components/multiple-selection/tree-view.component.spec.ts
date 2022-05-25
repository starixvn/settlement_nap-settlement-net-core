import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeViewComponent } from './tree-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ItemsSelect } from '../../models';
describe('TreeViewComponent', () => {
  let component: TreeViewComponent;
  let fixture: ComponentFixture<TreeViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeViewComponent ],
      providers: [NgbModal],
      imports: [
        FormsModule,
    ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keyDown - should set shiftKey to true', () => {
      component.keyDown();

      expect(component.shiftKey).toBe(true);
  });

  it('keyUp - should set shiftKey to false', () => {
      component.keyUp();

      expect(component.shiftKey).toBe(false);
  });

  describe('clickEvent', () => {
    it('should set lastItem when it is undefined', () => {
        const item = new ItemsSelect(1, '', '', false, false, false, []);

        component.clickEvent(item);

        expect(component.lastItem).toEqual(item);
    });

    it('should set lastItem when it is not undefined', () => {
        const item = new ItemsSelect(1, '', '', false, false, false, []);
        component.lastItem = new ItemsSelect(1, '', '', false, false, false, []);
        component.items = [item];

        component.clickEvent(item);

        expect(component.lastItem).toEqual(item);
    });
  });
});
