import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { LoadingController, ModalController, NavParams, ToastController, AlertController, PopoverController } from '@ionic/angular';
import { FirebaseService, user } from 'src/app/services/firebase.service';
import { OptionsComponent } from '../../../../components/options/options.component';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.page.html',
  styleUrls: ['./update-user.page.scss'],
})
export class UpdateUserPage implements OnInit {

  userData: user;
  allowOrders = true;
  delivery = false;

  private loading: any;

  constructor(
    private modalController: ModalController, 
    private toastController: ToastController,
    private alertController: AlertController, 
    private popoverController: PopoverController,
    private navParams: NavParams, 
    private loadingController: LoadingController, 
    private firebaseService: FirebaseService, 
    private callNumber: CallNumber,
    private launchNavigator: LaunchNavigator) { 

      this.userData = navParams.get('userData') as user;
      this.allowOrders = this.userData.allowOrders;
      this.delivery = this.userHasRole("delivery");
    }

  ngOnInit() {
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

  isAdmin() {
    return this.firebaseService.userHasRole("admin");
  }

  getRoleText() {
    if(this.firebaseService.userHasRole("admin")) return "Administrador";
    else if(this.firebaseService.userHasRole("delivery")) return "Entrega";
    else return "Usuario";
  }

  getAddressText() {
    return this.userData.address === "" ? "Indefinida" : this.userData.address;
  }

  isRoutingAvailable() {
    return this.userData.address !== "" || this.userData.location !== "";
  }

  async trackOptions(ev: any) {
    const popover = await this.popoverController.create({
      component: OptionsComponent,
      componentProps: {
        options: [
          {text: "Direccion", icon: "map"},
          {text: "Ubicacion", icon: "location"},
        ],
      },
      event: ev,
    });
    await popover.present();

    await popover.onWillDismiss().then(data => {
      console.log(data);
      const option = data.data;
      switch(option) {
        case 0: { this.viewUserLocation("address"); } break;
        case 1: { this.viewUserLocation("location"); } break;
      }
    });
  }

  viewUserLocation(option: string) {
    this.launchNavigator.isAppAvailable( this.launchNavigator.APP.GOOGLE_MAPS).then(isAvailable =>{
      var app;
      if(isAvailable){
          app =  this.launchNavigator.APP.GOOGLE_MAPS;
      }else{
          console.warn("Google Maps not available - falling back to user selection");
          app =  this.launchNavigator.APP.USER_SELECT;
      }

      switch(option) {
        case "address": { 
          if(this.userData.address !== "") {
            this.launchNavigator.navigate(this.userData.address, {
              app: app
            });
          }
          else this.showInfo("No existe una Direccion para mostrar ruta");
        } break;
        case "location": { 
          if(this.userData.location !== "") {
            let cords = this.userData.location;
            this.launchNavigator.navigate(cords.latitude+", "+cords.longitude, {
              app: app
            });
          } 
          else this.showInfo("No existe una Ubicacion para mostrar ruta");
        } break;
      }
    });
  }

  saveUserChanges() {
    this.loadingController.create({
      message: 'Guardando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      this.userData.allowOrders = this.allowOrders;
      this.firebaseService.updateUser(this.userData).then(showInfo => {
        this.loading.dismiss();
        this.showInfo("Los cambios se guardaron correctamente.");
        this.closeView();
      }).catch(() => { this.loading.dismiss(); });
    });
  }

  async callUserConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Llamar " + this.userData.phone,
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Llamar",
          handler: () => {
            this.callNumber.callNumber(this.userData.phone, false)
	          .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
          }
        }
      ]
    });

    await alert.present();
  }

  userHasRole(role: string) {
    let userRole = this.userData.roles.find(r => r === role);
    if(userRole) return true;
    else return false;
  }  

  updateRole(event) {
    if(event.detail.checked) {
      if(!this.userData.roles.find(role => role === "delivery")) this.userData.roles.push("delivery");
    }
    else this.userData.roles = this.userData.roles.filter(role => role !== "delivery");
    console.log(this.userData.roles);
  }
}
