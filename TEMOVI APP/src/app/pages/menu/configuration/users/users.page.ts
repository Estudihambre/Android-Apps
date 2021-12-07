import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { FirebaseService, user } from 'src/app/services/firebase.service';
import { UpdateUserPage } from '../../orders/update-user/update-user.page';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  users: any[] = [];
  private usersRef: any;
  searchbar = "";

  viewReady = false;
  private loading: any;

  constructor(
    private firebaseService: FirebaseService,
    private loadingController: LoadingController,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.getAppData();
  }

  ngOnDestroy() {
    if(this.usersRef) this.usersRef.unsubscribe();
  }

  getAppData() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      //Datos de Usuarios
      this.getUsers();
    });
  }

  isAdmin() {
    return this.firebaseService.userHasRole("admin");
  }

  async getUsers() {
    if(this.usersRef) this.usersRef.unsubscribe();
    this.usersRef = await this.firebaseService.getUsersRealTime().subscribe(users => {
      this.users = users;
      this.loading.dismiss();
      this.viewReady = true;
    });
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

}
