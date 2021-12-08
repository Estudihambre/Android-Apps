import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  selectedTab = "login";
  username = "";
  email = "";
  password = "";
  rpassword = "";
  showPassword = false;
  private loading: any;

  constructor(
    private data: DataService,
    private firebaseService: FirebaseService, 
    private router: Router, 
    private loadingController: LoadingController) {
  }

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  setTab(tab: string) {
    this.selectedTab = tab;
  }

  login() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      this.firebaseService.login(this.email, this.password).then (res => {
        this.loading.dismiss();
        this.router.navigate(['/menu/home']);
      }).catch(err => { 
        switch(err.code)
        {
          case 'auth/argument-error': { this.data.showInfo("Debes llenar todos los campos.", 1.5); } break;
          case 'auth/invalid-email': { this.data.showInfo("Email no valido.", 1.5); } break;
          case 'auth/user-not-found': { this.data.showInfo("Este email no esta registrado.", 1.5); } break;
          case 'auth/wrong-password': { this.data.showInfo("Contraseña incorrecta.", 1.5); } break;
        }
        
        this.password = null;
        this.loading.dismiss();
      });
    });
  }

  register() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      var message = "";
      if(this.username === "") {message = "Debes llenar todos los campos."}
      if(this.username.length < 4) {message = "El nombre de usuario debe de tener al menos 4 caracteres."}

      if(message === "") {
        this.firebaseService.register(this.email, this.password, this.username).then (() => {
          this.loading.dismiss();
          this.router.navigate(['/menu/home']);
        }).catch(err => { console.log(err.code) 
          switch(err.code)
          {
            case 'auth/argument-error': { this.data.showInfo("Debes llenar todos los campos.", 1.5); } break;
            case 'auth/invalid-email': { this.data.showInfo("Email no valido.", 1.5); } break;
            case 'auth/weak-password': { this.data.showInfo("La contraseña debe tener al menos 6 caracteres.", 1.5); } break;
            case 'auth/email-already-in-use': { this.data.showInfo("Este email ya esta en uso.", 1.5); } break;
          }

          this.password = "";
          this.rpassword = "";
          this.loading.dismiss();
        });
      }
      else {
        this.data.showInfo(message, 1.5);
        this.password = "";
        this.rpassword = "";
        this.loading.dismiss();
      }
    });
  }

  sendResetPasswordEmail() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      this.firebaseService.sendPasswordResetEmail(this.email).then(() => {
        this.data.showInfo("Se envio un correo para cambiar tu contraseña a esta direccion", 4);
        this.loading.dismiss();
      }).catch(error => {
        console.log(error);
        switch(error.code) {
          case 'auth/argument-error': { this.data.showInfo("Debes llenar todos los campos", 1.5); } break;
          case 'auth/invalid-email': { this.data.showInfo("Email no valido", 1.5); } break;
          case 'auth/user-not-found': { this.data.showInfo("Este email no esta registrado", 1.5); } break;
        }
        this.loading.dismiss();
      });
    });
  }
}

 