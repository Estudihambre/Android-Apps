import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  userReady = false;
  private userData: any;

  private loading: any;

  constructor(
    public firebaseService: FirebaseService, 
    private router: Router, 
    private loadingController: LoadingController, 
    private toastController: ToastController,
    private gps: Geolocation,
    private launchNavigator: LaunchNavigator) { }

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

      //Datos de Usuario
      this.firebaseService.userSetup().then(userDataExist => {
        this.userReady = userDataExist as any;
        if(userDataExist) {
          this.loading.dismiss();
        }
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

  logout() {
    this.loadingController.create({
      message: 'Cerrando Sesion...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      this.firebaseService.logout().then(redirect => {
        this.loading.dismiss();
        this.router.navigate(['/menu/login']);
      }).catch(() => { this.loading.dismiss(); });
    });
  }

  isAdmin() {
    return this.firebaseService.userHasRole("admin");
  }

  getRoleText() {
    if(this.isAdmin()) return "Administrador";
    else if(this.firebaseService.userHasRole("delivery")) return "Entrega";
    else return "Usuario";
  }

  getCurrentLocation() {
    this.gps.getCurrentPosition().then((pos) => {
      this.firebaseService.userData.location = {latitude: pos.coords.latitude, longitude: pos.coords.longitude};
      this.showInfo("Ubicacion tomada correctamente.");
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  isRoutingAvailable() {
    return this.firebaseService.userData.location !== "" || this.firebaseService.userData.address !== "";
  }

  viewUserLocation() {
    this.launchNavigator.isAppAvailable( this.launchNavigator.APP.GOOGLE_MAPS).then(isAvailable =>{
      var app;
      if(isAvailable){
          app =  this.launchNavigator.APP.GOOGLE_MAPS;
      }else{
          console.warn("Google Maps not available - falling back to user selection");
          app =  this.launchNavigator.APP.USER_SELECT;
      }
      if(this.firebaseService.userData.location !== "") {
        let cords = this.firebaseService.userData.location;
        this.launchNavigator.navigate(cords.latitude+", "+cords.longitude, {
          app: app
        });
      }
      else if(this.firebaseService.userData.address !== "") {
        this.launchNavigator.navigate(this.firebaseService.userData.address, {
          app: app
        });
      }
      else this.showInfo("No existe una Direccion o Ubicacion para mostrar");
    });
  }
  
  saveAccountChanges() {
    this.loadingController.create({
      message: 'Guardando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      this.userData = this.firebaseService.userData;
      this.firebaseService.updateUser(this.userData).then(() => {
        this.loading.dismiss();
        this.showInfo("Los cambios se guardaron correctamente.");
      }).catch(() => { this.loading.dismiss(); });
    });
  }
}
