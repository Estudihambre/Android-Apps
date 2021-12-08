import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssignOrderPage } from './assign-order.page';

describe('AssignOrderPage', () => {
  let component: AssignOrderPage;
  let fixture: ComponentFixture<AssignOrderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignOrderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
