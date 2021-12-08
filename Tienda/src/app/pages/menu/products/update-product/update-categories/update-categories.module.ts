import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdateCategoriesPageRoutingModule } from './update-categories-routing.module';

import { UpdateCategoriesPage } from './update-categories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdateCategoriesPageRoutingModule
  ],
  declarations: [UpdateCategoriesPage]
})
export class UpdateCategoriesPageModule {}
