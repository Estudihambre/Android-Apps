import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssignProductPage } from './assign-product.page';

describe('AssignProductPage', () => {
  let component: AssignProductPage;
  let fixture: ComponentFixture<AssignProductPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignProductPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
