import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { productsPage } from './products.page';

describe('productsPage', () => {
  let component: productsPage;
  let fixture: ComponentFixture<productsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ productsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(productsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
