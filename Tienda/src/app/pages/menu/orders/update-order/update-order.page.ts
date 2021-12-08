import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController, LoadingController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { FirebaseService, order, orderProduct, product, state } from 'src/app/services/firebase.service';
import { AssignOrderPage } from './assign-order/assign-order.page';

@Component({
  selector: 'app-update-order',
  templateUrl: './update-order.page.html',
  styleUrls: ['./update-order.page.scss'],
})
export class UpdateOrderPage implements OnInit {

  order: any;
  loading: any;

  constructor(
    private firebaseService: FirebaseService,
    public data: DataService,
    private modalController : ModalController,
    private alertController: AlertController, 
    private navParams : NavParams,
    private loadingController: LoadingController) {
      this.order = this.navParams.get('order');
    }

  ngOnInit() {
  }

  closeWindow(){
	  this.modalController.dismiss();
  }

  isAdmin() {
    return this.firebaseService.userHasRole("admin");
  }

  isDelivery() {
    return !this.firebaseService.userHasRole("admin") || this.firebaseService.userHasRole("delivery");
  }

  canModifyOrder(order: order) {
    return (order.user.id === this.firebaseService.userData.id && order.state === state.pending) || 
    (this.isAdmin() && (order.state === state.pending || order.state === state.accepted || order.state === state.cancelled));
  }

  canStartDelivery(order: order) {
    return this.isDelivery() && order.state === state.accepted && order.delivery.id === this.firebaseService.userData.id;
  }

  canAssignOrder(order: order) {
    return this.isAdmin() && (order.state === state.pending || order.state === state.cancelled);
  }

  canCancelOrder(order: order) {
    return (order.user.id === this.firebaseService.userData.id && (order.state === state.pending || order.state === state.accepted)) || 
    (this.isAdmin() && (order.state === state.pending || order.state === state.accepted || order.state === state.inProgress));
  }

  canCloseOrder(order: order) {
    return (this.isDelivery() && order.state === state.inProgress && order.delivery.id === this.firebaseService.userData.id) ||
    (this.isAdmin() && order.state === state.inProgress);
  }

  async assignOrder(order: order) {
    const va = await this.modalController.create({
      component: AssignOrderPage,
      componentProps : {
        order: order,
      }
    });
    await va.present();
  }

  updateOrder(order: order) {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      order.lastChange = this.firebaseService.userData;
      order.totalPrice = parseFloat(this.data.getOrderPrice(order));
      this.firebaseService.updateOrder(order).then(() => {
        this.loading.dismiss();
        this.closeWindow();
        this.data.showInfo("Pedido actualizado correctamente.", 1);
      }).catch(() => { this.loading.dismiss(); });
    });
  }

  updateOrderState(order: order, orderState: number) {
    this.loadingController.create({
      message: 'Loading...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      order.state = orderState;
      order.lastChange = this.firebaseService.userData;
      this.firebaseService.updateOrder(order).then(() => {
        this.loading.dismiss();
        this.closeWindow();
        this.data.showInfo("Pedido actualizado correctamente.", 1);
      }).catch(() => { this.loading.dismiss(); });
    });
  } 

  async cancelOrderConfirm(order: order) {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Cancelar Pedido",
      message: "Estas seguro que deseas cancelar este pedido?",
      buttons: [
        {
          text: "Salir",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Cancelar",
          handler: () => {
            order.closedDate = new Date();
            this.updateOrderState(order, state.cancelled);
          }
        }
      ]
    });

    await alert.present();
  }

  async closeOrderConfirm(order: order) {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Completar Pedido",
      message: "Estas seguro que deseas marcar como completado este pedido?",
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Completar",
          handler: () => {
            order.closedDate = new Date();
            this.updateOrderState(order, state.closed);
          }
        }
      ]
    });

    await alert.present();
  }

  async startDeliveryConfirm(order: order) {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Iniciar Entrega",
      message: "Estas seguro que deseas iniciar la entrega de este pedido?",
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Iniciar",
          handler: () => {
            this.updateOrderState(order, state.inProgress);
          }
        }
      ]
    });

    await alert.present();
  }

  // ORDER CONTROL -----------------------------------------------------------------
  addProductToOrder(product: product) {
    this.order = this.data.addProduct(this.order, product);
  }

  deleteProductFromOrder(product: product) {
    this.order = this.data.deleteOrderProduct(this.order, product);
  }

  addQuantityToOrder(orderProduct: orderProduct) {
    orderProduct.quantity++;
    this.order = this.data.updateOrderProduct(this.order, orderProduct);
  }

  subtractQuantityFromOrder(orderProduct: orderProduct) {
    orderProduct.quantity--;
    if(orderProduct.quantity <= 0) {
      this.order = this.data.deleteOrderProduct(this.order, orderProduct.product);
    }
    else this.order = this.data.updateOrderProduct(this.order, orderProduct);
  }

}
