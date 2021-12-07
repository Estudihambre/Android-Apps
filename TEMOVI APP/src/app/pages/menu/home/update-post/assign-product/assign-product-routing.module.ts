import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssignProductPage } from './assign-product.page';

const routes: Routes = [
  {
    path: '',
    component: AssignProductPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignProductPageRoutingModule {}
