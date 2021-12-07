import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdateProductPage } from './update-product.page';

const routes: Routes = [
  {
    path: '',
    component: UpdateProductPage
  },
  {
    path: 'update-categories',
    loadChildren: () => import('./update-categories/update-categories.module').then( m => m.UpdateCategoriesPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdateProductPageRoutingModule {}
