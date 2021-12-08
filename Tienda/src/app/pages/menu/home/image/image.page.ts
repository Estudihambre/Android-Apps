import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-image',
  templateUrl: './image.page.html',
  styleUrls: ['./image.page.scss'],
})
export class ImagePage implements OnInit {

  imageIndex: number;
  viewEntered = false;
  images = [];

  private loading: any;
  
  constructor(
    private modalController : ModalController, 
    private navParams : NavParams, 
    private loadingController: LoadingController) {
      
    this.imageIndex = this.navParams.get('index');
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
