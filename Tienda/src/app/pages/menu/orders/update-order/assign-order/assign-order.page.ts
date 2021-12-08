import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavParams, ToastController, } from '@ionic/angular';
import { FirebaseService, user, order, state } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-assign-order',
  templateUrl: './assign-order.page.html',
  styleUrls: ['./assign-order.page.scss'],
})
export class AssignOrderPage implements OnInit {

  private order: order;
  users: any[] = [];
  searchbar = "";

  viewReady = false;
  private loading: any;

  constructor(
    private firebaseService: FirebaseService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private toastController: ToastController,
    private navParams : NavParams,) {
      this.order = this.navParams.get('order');
    }

  ngOnInit() {
    this.getAppData();
  }

  getAppData() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      //Datos de Usuarios
      this.getDeliveryUsers();
    });
  }

  closeView() {
	  this.modalController.dismiss();
  }

  async showInfo(info: string) {
    const toast = await this.toastController.create({
      message: info,
      duration: 2000,
      color: 'secondary',
    });
    toast.present();
  }

  async getDeliveryUsers() {
    this.firebaseService.getDeliveryUsers().then(users => {
      this.users = users as user[];
      this.loading.dismiss();
      this.viewReady = true;
    }).catch(() => { this.loading.dismiss(); });
  }

  search(text: string) {
    this.searchbar = text;
  }

  searchUsers() {
    if(this.searchbar === "") return this.users;
    else {
      var users = [] as user[];
      this.users.forEach(user => {
        if(user.username.toLocaleLowerCase().startsWith(this.searchbar.toLocaleLowerCase()) ||
        user.email.toLocaleLowerCase().startsWith(this.searchbar.toLocaleLowerCase())) users.push(user);
      });
      return users;
    }
  }

  assignOrder(deliveryUser: user) {
    this.loadingController.create({
      message: 'Asignando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      const order = this.order;
      order.state = state.accepted;
      order.delivery = deliveryUser;
      order.lastChange = this.firebaseService.userData;
      
      this.firebaseService.updateOrder(order).then(() => {
        this.loading.dismiss();
        this.showInfo("Pedido asignado correctamente");
        this.closeView();
      }).catch(() => { this.loading.dismiss(); });
    });
  }
}
