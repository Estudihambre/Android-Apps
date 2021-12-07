import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdateOrderPageRoutingModule } from './update-order-routing.module';

import { UpdateOrderPage } from './update-order.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdateOrderPageRoutingModule,
    LazyLoadImageModule
  ],
  declarations: [UpdateOrderPage]
})
export class UpdateOrderPageModule {}
