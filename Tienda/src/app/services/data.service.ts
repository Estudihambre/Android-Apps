import { Injectable } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FirebaseService, order, orderProduct, product } from './firebase.service';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  sliderImages = [
    '../assets/images/1s.jpg',
    '../assets/images/2s.png',
    '../assets/images/3s.png',
    '../assets/images/4s.jpg',
  ]
  //Datos de Aplicacion--------------------------------------------------------------
  appTitle = "Beldy";

  appConfiguration = {
    //Datos de Contacto
    homeData: {
      description: 
        ``,

      schedule: [
        {
          name: "Lunes",
          active: true,
          time: {
            start: { hour: 0, minutes: 0 },
            end: { hour: 24, minutes: 0 },
          },
        },
        {
          name: "Martes",
          active: true,
          time: {
            start: { hour: 0, minutes: 0 },
            end: { hour: 24, minutes: 0 },
          },
        },
        {
          name: "Miercoles",
          active: true,
          time: {
            start: { hour: 0, minutes: 0 },
            end: { hour: 24, minutes: 0 },
          },
        },
        {
          name: "Jueves",
          active: true,
          time: {
            start: { hour: 0, minutes: 0 },
            end: { hour: 24, minutes: 0 },
          },
        },
        {
          name: "Viernes",
          active: true,
          time: {
            start: { hour: 0, minutes: 0 },
            end: { hour: 24, minutes: 0 },
          },
        },
        {
          name: "Sabado",
          active: true,
          time: {
            start: { hour: 0, minutes: 0 },
            end: { hour: 24, minutes: 0 },
          },
        },
        {
          name: "Domingo",
          active: true,
          time: {
            start: { hour: 0, minutes: 0 },
            end: { hour: 24, minutes: 0 },
          },
        },
      ],

      services: [
        "",
      ],
    },

    contactData: {
      phoneNumbers: [
        {
          text: "Phone",
          number: "111 222 3333",
        }
      ],

      socialNetworks: [
        // {
        //   text: "Madelin's Salon",
        //   link: "https://www.facebook.com/Madelins-Salon-108182611103315/",
        //   icon: "logo-facebook",
        // },
        // {
        //   text: "fadeluxebarbershop",
        //   link: "https://www.instagram.com/fadeluxebarbershop/",
        //   icon: "logo-instagram",
        // }
      ],

      address: "Mexico",

      mapSource: "",
    }
  }

  cart = {} as order;
  

  constructor(
    private firebaseService: FirebaseService, 
    private modalController: ModalController,
    private alertController: AlertController,
    private callNumber: CallNumber,
    private toastController: ToastController, 
    private iab : InAppBrowser) {
      this.cart.products = [] as orderProduct[];
  }

  // GENERAL --------------------------------------------------------------------------------
  async showInfo(info: string, seconds: number) {
    const toast = await this.toastController.create({
      message: info,
      duration: seconds*1000,
      color: 'secondary',
    });
    toast.present();
  }

  sliderOptions(loop: boolean, delay: number) {
    let so = {
      loop: loop,
      autoplay: {
        delay: delay*1000,
      },
    }
    return so;
  }

  // getAppData() {
  //   return this.firebaseService.appDataReady ? this.firebaseService.appConfiguration : 
  // }

  // ORDER FUCTIONS -------------------------------------------------------------------------------
  isOrderEmpty(order: order) {
    return order.products.length < 1;
  }

  getOrderProduct(order: order, product: product): orderProduct {
    let res = null;
    order.products.forEach(op => {
      if(op.product.id === product.id) res = op;
    });
    return res;
  }

  updateOrderProduct(order: order, orderProduct: orderProduct) {
    order.products.forEach((op, i) => {
      if(op.product === orderProduct.product) {
        order.products[i] = orderProduct;
      }
    });
    return order;
  }

  addProduct(order: order, product: product) {
    let opOnList = this.getOrderProduct(order, product);
    if(opOnList) {
      opOnList.quantity++;
      this.updateOrderProduct(order, opOnList);
    }
    else {
      let op = {} as orderProduct;
      op.product = product;
      op.quantity = 1;
      order.products.push(op);
    }
    return order;
  }

  deleteOrderProduct(order: order, product: product) {
    order.products.forEach(op => {
      if(op.product === product) {
        order.products = order.products.filter(op => op.product !== product);
      }
    });
    return order;
  }

  addQuantity(order: order, orderProduct: orderProduct) {
    orderProduct.quantity++;
    return this.updateOrderProduct(this.cart, orderProduct);
  }

  subtractQuantity(order: order, orderProduct: orderProduct) {
    orderProduct.quantity--;
    if(orderProduct.quantity <= 0) {
      return this.deleteOrderProduct(order, orderProduct.product);
    }
    else return this.updateOrderProduct(order, orderProduct);
  }

  getUnitsText(product: product) {
    return product.quantity > 1 ? product.units+"s" : product.units;
  }

  getProductPrice(product: product) {
    return product.sale ? product.salePrice : product.price;
  }

  getOrderPrice(order: order) {
    var res = 0;
    order.products.forEach(op => {
      res += this.getProductPrice(op.product) * op.quantity;
    });
    return res.toFixed(2);
  }

  async callConfirm(phoneNumber: string) {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Llamar " + phoneNumber,
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Llamar",
          handler: () => {
            this.callNumber.callNumber(phoneNumber, false)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
          }
        }
      ]
    });

    await alert.present();
  }

  openLink(link: string) {
	  this.iab.create(link);
  }

  // CARRITO --------------------------------------------------------------------------------------
  addProductToCart(product: product) {
    this.cart = this.addProduct(this.cart, product);
  }

  deleteProductFromCart(product: product) {
    this.cart = this.deleteOrderProduct(this.cart, product);
  }

  addQuantityToCart(orderProduct: orderProduct) {
    orderProduct.quantity++;
    this.cart = this.updateOrderProduct(this.cart, orderProduct);
  }

  subtractQuantityFromCart(orderProduct: orderProduct) {
    orderProduct.quantity--;
    if(orderProduct.quantity <= 0) {
      this.cart = this.deleteOrderProduct(this.cart, orderProduct.product);
    }
    else this.cart = this.updateOrderProduct(this.cart, orderProduct);
  }
}
