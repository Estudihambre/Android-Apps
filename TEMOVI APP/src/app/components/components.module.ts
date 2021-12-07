import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CategoryPickerComponent } from './category-picker/category-picker.component';
import { OptionsComponent } from './options/options.component';
import { ProductsSliderComponent } from './products-slider/products-slider.component';
import { SearchbarComponent } from './searchbar/searchbar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [
    SearchbarComponent,
    ProductsSliderComponent,
    OptionsComponent,
    CategoryPickerComponent
  ],
  exports:[
    SearchbarComponent,
    ProductsSliderComponent,
    OptionsComponent,
    CategoryPickerComponent
  ],
})
export class ComponentsModule {}