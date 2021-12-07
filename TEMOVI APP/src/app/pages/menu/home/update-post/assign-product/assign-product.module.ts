import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssignProductPageRoutingModule } from './assign-product-routing.module';

import { AssignProductPage } from './assign-product.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssignProductPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [AssignProductPage]
})
export class AssignProductPageModule {}
