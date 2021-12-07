import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class productsPage implements OnInit {

  productsIndex: number;
  viewEntered = false;
  images = [
    
  ];

  private loading: any;
  
  constructor(
    private modalController : ModalController, 
    private navParams : NavParams, 
    private loadingController: LoadingController) {
      
    this.productsIndex = this.navParams.get('index');
    this.images = this.navParams.get('images');
	}

  ngOnInit() {
    this.loadingController.create({
      message: 'Loading...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();
    });
  }

  ionViewDidEnter() {
    this.viewEntered = true;
    this.loading.dismiss();
  }

  closeImage(){
	  this.modalController.dismiss();
  }
  
  slideOpts = {
    loop: true,
    zoom: true,
    passiveListeners: false,
  };

}
