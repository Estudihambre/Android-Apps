import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { product } from '../../../services/firebase.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {

  product: product;

  slideOpts = {
    loop: true,
    zoom: true,
    pager: true,
    passiveListeners: false,
  };

  constructor(
    public data: DataService,
    private modalController : ModalController, 
    private navParams : NavParams,) {
      this.product = this.navParams.get('product');
    }

  ngOnInit() {
  }

  addToCart(product: product) { 
    this.data.addProductToCart(product);
    this.data.showInfo("Añadido a Carrito correctamente.", 1);
    this.closeProduct();
  }

  closeProduct(){
	  this.modalController.dismiss();
  }
}
