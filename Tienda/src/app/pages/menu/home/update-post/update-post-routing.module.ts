import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdatePostPage } from './update-post.page';

const routes: Routes = [
  {
    path: '',
    component: UpdatePostPage
  },
  {
    path: 'assign-product',
    loadChildren: () => import('./assign-product/assign-product.module').then( m => m.AssignProductPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdatePostPageRoutingModule {}
