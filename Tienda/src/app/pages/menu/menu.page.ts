import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ToastController, Platform, ModalController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  d: any;
  userReady = false;
  exit: any;
  user: any;

  selectedUrl = '/menu/inicio';

  pages = [
    {
      text: "Perfil",
      url: '/menu/account',
      icon: "person",
    },
    {
      text: "Catalogo",
      url: '/menu/products',
      icon: "images",
    },
    // {
    //   text: "Carrito",
    //   url: '/menu/orders',
    //   icon: "cart",
    // },
    {
      text: "Contacto",
      url: '/menu/contact',
      icon: "person",
    },
    {
      text: "Acerca De.",
      url: '/menu/home',
      icon: "alert-circle",
    }
  ];

  constructor(private router: Router, 
    private firebaseService: FirebaseService, 
    private toastController: ToastController, 
    private platform: Platform, 
    private modalController: ModalController,
    private menuController: MenuController) { 
  }

  ionViewDidEnter(){
    /*this.router.events.subscribe((event: RouterEvent) => {
      this.selectedUrl = event.url ? event.url : this.selectedUrl;
    }); */

    this.exit = this.platform.backButton.subscribe(()=>{
      this.modalController.getTop().then(m => {
        if(!m) {
          this.menuController.isOpen().then(a => {
            if(!a) {
              if(this.selectedUrl === '/menu/inicio') navigator['app'].exitApp();
              else {
                this.router.navigate(['/menu/inicio']);
                this.selectedUrl = '/menu/inicio';
              }
            }
          });
        }
      });
    });
  }

  changeSelectedUrl(url: string) {
    this.selectedUrl = url;
  }

  ngOnInit() {
    this.firebaseService.userSetup().then(userDataExist => {
      this.userReady = userDataExist as any;
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

  showSubscriptionButton() {
    if(this.userReady) {
      if(this.firebaseService.userData) {
        if(!this.isAdmin() && !this.firebaseService.userHasRole("delivery")) return !this.firebaseService.userData.notifications;
        else return false;
      } 
      else return false;
    }
    else return false;
  }

  isAdmin() {
    return this.firebaseService.userHasRole("admin");
  }
}
