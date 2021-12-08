import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdateOrderPage } from './update-order.page';

const routes: Routes = [
  {
    path: '',
    component: UpdateOrderPage
  },
  {
    path: 'assign-order',
    loadChildren: () => import('./assign-order/assign-order.module').then( m => m.AssignOrderPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdateOrderPageRoutingModule {}
