import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { FirebaseService, order, state } from 'src/app/services/firebase.service';
import { UpdateOrderPage } from './update-order/update-order.page';
import { UpdateUserPage } from './update-user/update-user.page';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  searchbar = "";
  selectedTab: any;
  tabs = [
    {
      text: "Pendientes",
      state: state.pending,
    },
    {
      text: "Aceptados",
      state: state.accepted,
    },
    {
      text: "En Curso",
      state: state.inProgress,
    },
    {
      text: "Completados",
      state: state.closed,
    },
    {
      text: "Cancelados",
      state: state.cancelled,
    },
  ];

  orders: order[] = [];
  private ordersRef: any;

  viewReady = false;
  private loading: any;

  constructor(
    public data: DataService,
    private firebaseService: FirebaseService,
    private loadingController: LoadingController,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    // this.selectedTab = this.tabs[0];
    // this.getAppData();
  }

  ionViewWillEnter() {
    if(this.ordersRef) this.ordersRef.unsubscribe();
    this.selectedTab = this.tabs[0];
    this.getAppData();
  }

  ngOnDestroy() {
    if(this.ordersRef) this.ordersRef.unsubscribe();
  }

  getAppData() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      //Datos de Usuario
      this.firebaseService.userSetup().then(userDataExist => {
        if(userDataExist) {
          if(this.firebaseService.userHasRole("admin")) {
            this.getOrders();
          }
          else if(this.firebaseService.userHasRole("delivery")) this.getDeliveryOrders();
          else this.getUserOrders();
        }
      }).catch(() => { this.loading.dismiss(); });
    });
  } 

  isAdmin() {
    return this.firebaseService.userHasRole("admin");
  }

  isDelivery() {
    return this.firebaseService.userHasRole("admin") || this.firebaseService.userHasRole("delivery");
  }

  nextTab() {
    let tabIndex = this.tabs.findIndex(tab => tab === this.selectedTab);
    tabIndex = tabIndex+1 >= this.tabs.length ? 0 : tabIndex+1;
    this.selectedTab = this.tabs[tabIndex];
    if(this.firebaseService.userHasRole("delivery")) {
      if(this.selectedTab.state === state.pending || this.selectedTab.state === state.cancelled) this.nextTab();
    }
  }

  previousTab() {
    let tabIndex = this.tabs.findIndex(tab => tab === this.selectedTab);
    tabIndex = tabIndex-1 < 0 ? this.tabs.length-1 : tabIndex-1;
    this.selectedTab = this.tabs[tabIndex];
    if(this.firebaseService.userHasRole("delivery")) {
      if(this.selectedTab.state === state.pending || this.selectedTab.state === state.cancelled) this.previousTab();
    }
  }

  search(text: string) {
    this.searchbar = text;
  }

  searchOrders() {
    if(this.searchbar === "") return this.orders;
    else {
      var orders = [] as order[];
      this.orders.forEach(order => {
        if(order.user.username.toLocaleLowerCase().startsWith(this.searchbar.toLocaleLowerCase()) ||
        order.user.email.toLocaleLowerCase().startsWith(this.searchbar.toLocaleLowerCase()) ||
        order.id.toLocaleLowerCase().startsWith(this.searchbar.toLocaleLowerCase()) ||
        order.number.toString() === this.searchbar) orders.push(order);
      });
      return orders;
    }
  }

  async getOrders() {
    if(this.ordersRef) this.ordersRef.unsubscribe();
    this.ordersRef = await this.firebaseService.getOrdersRealTime().subscribe(orders => {
      this.orders = orders;
      if(!this.viewReady) this.deleteOldOrders();
      this.loading.dismiss();
      this.viewReady = true;
    });
  }

  deleteOldOrders() {
    this.orders.forEach(order => {
      let deleteDate = moment(order.closedDate).add(90, 'days').toDate();
      //console.log(deleteDate);
      if(moment(deleteDate).isBefore(moment()) && (order.state === state.closed || order.state === state.cancelled)) {
        this.firebaseService.deleteOrder(order, false);
      }
    });
  }

  getOrdersByState(state: number) {
    return this.searchOrders().filter(order => order.state === state);
  }

  async getDeliveryOrders() {
    if(this.ordersRef) this.ordersRef.unsubscribe();
    this.ordersRef = await this.firebaseService.getDeliveryOrdersRealTime(this.firebaseService.userData.id).subscribe(orders => {
      this.orders = orders;
      this.loading.dismiss();
      this.viewReady = true;
      this.selectedTab = this.tabs.filter(tab => tab.state === state.accepted)[0];
    });
  }

  async getUserOrders() {
    if(this.ordersRef) this.ordersRef.unsubscribe();
    this.ordersRef = await this.firebaseService.getUserOrdersRealTime(this.firebaseService.userData.id).subscribe(orders => {
      this.orders = orders;
      this.loading.dismiss();
      this.viewReady = true;
    });
  }

  getUser(user_id: string) {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      this.firebaseService.getUser(user_id).then(userData => {
        this.modalController.create({
          component: UpdateUserPage,
          componentProps : {
            userData: userData,
          }
        }).then(viewUserModal => {
          const vu = viewUserModal;
          vu.present();
          this.loading.dismiss();
        });
      }).catch(() => { this.loading.dismiss(); });
    });
  }

  async updateOrder(order: order) {
    const va = await this.modalController.create({
      component: UpdateOrderPage,
      componentProps : {
        order: order,
        userData: this.firebaseService.userData,
      }
    });
    await va.present();
  }
}
