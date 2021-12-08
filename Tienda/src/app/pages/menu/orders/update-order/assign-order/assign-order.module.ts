import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssignOrderPageRoutingModule } from './assign-order-routing.module';

import { AssignOrderPage } from './assign-order.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssignOrderPageRoutingModule,
    ComponentsModule
  ],
  declarations: [AssignOrderPage]
})
export class AssignOrderPageModule {}
