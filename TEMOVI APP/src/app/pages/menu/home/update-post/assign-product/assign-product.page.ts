import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { FirebaseService, product } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-assign-product',
  templateUrl: './assign-product.page.html',
  styleUrls: ['./assign-product.page.scss'],
})
export class AssignProductPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  viewReady = false;
  products = [] as product[];
  searchbar = "";
  private productsLength = 20;
  allDataLoaded = false;

  constructor (
    private modalController: ModalController,
    private firebaseService: FirebaseService,
  ) { }

  ngOnInit() {
    this.getData();
  }

  closeView() {
	  this.modalController.dismiss();
  }

  scrollToTop() {
    this.content.scrollToTop(400);
  }

  getData() {
    this.firebaseService.getProducts().then(products => {
      this.products = products as product[];
      this.viewReady = true;
    });
  }

  assignProduct(product: product) {
    this.modalController.dismiss(product);
  }

  search(text: string) {
    this.searchbar = text;
    // console.log(text)
  }

  searchProducts() {
    if(this.searchbar === "") return this.products;
    else {
      let products = [] as product[];
      this.products.forEach(product => {
        if(product.name.toLocaleLowerCase().startsWith(this.searchbar.toLocaleLowerCase())) products.push(product);
      });
      return products;
    }
  }

  filteredProducts() {
    let products = [] as product[];
    for(let i = 0; i < this.productsLength; i++) {
      if(this.searchProducts()[i]) {
        products.push(this.searchProducts()[i]);
      }
      else break;
    }
    return products;
  }

  loadData(event) {
    setTimeout(() => {
      //Add products length
      this.productsLength += 20;
      
      //Disable if done
      if(this.productsLength > this.products.length) this.productsLength = this.products.length;
      event.target.complete();

      if(this.filteredProducts().length >= this.products.length) {
        event.target.disabled = true;
        this.allDataLoaded = true;
      }
    }, 500);
  }
}
