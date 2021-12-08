import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdatePostPageRoutingModule } from './update-post-routing.module';

import { UpdatePostPage } from './update-post.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdatePostPageRoutingModule,
    ComponentsModule
  ],
  declarations: [UpdatePostPage]
})
export class UpdatePostPageModule {}
