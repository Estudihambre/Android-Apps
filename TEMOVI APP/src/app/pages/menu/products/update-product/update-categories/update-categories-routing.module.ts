import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdateCategoriesPage } from './update-categories.page';

const routes: Routes = [
  {
    path: '',
    component: UpdateCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdateCategoriesPageRoutingModule {}
