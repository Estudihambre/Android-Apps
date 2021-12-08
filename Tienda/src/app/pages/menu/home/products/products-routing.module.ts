import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { productsPage } from './products.page';

const routes: Routes = [
  {
    path: '',
    component: productsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class productsPageRoutingModule {}
