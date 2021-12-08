import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { product } from 'src/app/services/firebase.service';
import { ProductPage } from '../product/product.page';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {

  constructor(
    public data: DataService,
    private modalController: ModalController) { }

  ngOnInit() {
  } 

  async openProduct(product: product)
	{
    const modal = await this.modalController.create({
      component: ProductPage,
      componentProps : {
        product: product,
      }
    });
    await modal.present();
	}
}
