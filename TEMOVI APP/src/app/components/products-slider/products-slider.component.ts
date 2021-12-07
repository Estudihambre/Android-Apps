import { Component, Input, OnInit } from '@angular/core';
import { product } from 'src/app/services/firebase.service';
import { ModalController } from '@ionic/angular';
import { ProductPage } from 'src/app/pages/menu/product/product.page';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'products-slider',
  templateUrl: './products-slider.component.html',
  styleUrls: ['./products-slider.component.scss'],
})
export class ProductsSliderComponent implements OnInit {

  @Input() title: string;
  @Input() products: product[];

  pso = {
    loop: false,
  }

  constructor(
    private modalController: ModalController,
    private data: DataService) { }

  // TENKS

  ngOnInit() {}

  // Productos
  getProductRows() {
    let productRows = [];
    var products = [];
    var ac = 0;
    this.products.forEach(product => {
      if(ac < 8) {
        if(products.length < 2) {
          products.push(product);

          if(products.length >= 2) {
            productRows.push(products);
            products = [];
            ac++;
          }
        }
      } 
    });
    if(products.length === 1) {
      productRows.push(products);
    }
    return productRows;
  }

  getProductImage(product: product) {
    return product.images[0] ? product.images[0] : "../assets/images/add.png"; 
  }

  getProductPrice(product: product) {
    return product.sale ? product.salePrice : product.price;
  }

  getProductSalePercentage(product: product) {
    let price = product.price ? product.price : 0.99;
    let salePrice = product.salePrice ? product.salePrice : 0.99;
    if(salePrice > price) salePrice = price;
    return Math.floor((1 - (product.salePrice / product.price)) * 100);
  }

  getUnitsText(product: product) {
    return product.quantity > 1 ? product.units+"s" : product.units;
  }

  async openProduct(product: product) {
    const modal = await this.modalController.create({
      component: ProductPage,
      componentProps : {
        product: product,
      }
    });
    await modal.present();
	}

  addToCart(product: product) { 
    this.data.addProductToCart(product);
    this.data.showInfo("Añadido a Carrito correctamente.", 1);
  }

}
