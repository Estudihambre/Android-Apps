import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { FirebaseService, state } from 'src/app/services/firebase.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { order } from '../../../services/firebase.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {

  private loading: any;
  private appConfig: any;

  constructor(
    public data: DataService, 
    private firebaseService: FirebaseService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController) { }

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
      
      this.firebaseService.getAppConfiguration().then(appConfig => {
        this.appConfig = appConfig;
        this.loading.dismiss();
      }).catch(() => { this.loading.dismiss(); });
    });
  }

  async showInfo(info: string) {
    const toast = await this.toastController.create({
      message: info,
      duration: 2000,
      color: 'secondary',
    });
    toast.present();
  }

  isContactAvailable() {
    return (this.firebaseService.userData.location !== "" || this.firebaseService.userData.address !== "") && this.firebaseService.userData.phone !== "";
  }

  createOrder() {
    this.loadingController.create({
      message: 'Enviando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      if(this.firebaseService.userData.allowOrders) {
        if(this.data.getOrderPrice(this.data.cart) >= this.appConfig.minimumOrderPrice) {
          if(this.isContactAvailable()) {
            const order = {} as order;
            order.id = "";
            order.creationDate = new Date();
            order.closedDate = new Date();
            order.number = this.firebaseService.userData.orderCount+1;
            order.products = this.data.cart.products;
            order.user = this.firebaseService.userData;
            order.lastChange = order.user;
            order.state = state.pending;
            order.totalPrice = parseFloat(this.data.getOrderPrice(this.data.cart));
  
            this.firebaseService.createOrder(order, this.firebaseService.userData).then(() => {
              this.loading.dismiss();
              this.showInfo("Pedido creado correctamente.");
              this.router.navigate(['/menu/orders']);
            }).catch(() => { this.loading.dismiss(); });
          }
          else {
            this.loading.dismiss();
            this.getContactConfirm();
          }
        }
        else {
          this.loading.dismiss();
          this.showInfo("El precio total de un pedido debe ser de al menos " + this.appConfig.minimumOrderPrice + "€.");
        }
      }
      else {
        this.loading.dismiss();
        this.showInfo("Tu cuenta no tiene permiso para crear pedidos.");
      }
    });
  }

  async getContactConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "No Existe un Destino",
      message: "Tu cuenta no tiene los datos suficientes para completar el pedido, asegurate de que exista un numero de telefono y una Direccion o Ubicacion para crear pedidos.",
      buttons: [
        {
          text: "Cancelar",
          cssClass: 'secondary',
        },
        {
          text: "Ir a Cuenta",
          handler: () => {
            this.router.navigate(['/menu/account']);
          }
        }
      ]
    });
    await alert.present();
  }
}
