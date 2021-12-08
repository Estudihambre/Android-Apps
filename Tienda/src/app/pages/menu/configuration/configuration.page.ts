import { Component, OnInit } from '@angular/core';
import { LoadingController, PopoverController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ScheduleOptionsComponent } from './schedule-options/schedule-options.component';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.page.html',
  styleUrls: ['./configuration.page.scss'],
})
export class ConfigurationPage implements OnInit {

  viewReady = false;
  appConfiguration: any;

  // Home Data
  description = "";
  schedule = [
    {
      name: "Lunes",
      time: {
        start: {hour: 0, minutes: 0},
        end: {hour: 0, minutes: 0},
      },
      active: true,
    },
    {
      name: "Martes",
      time: {
        start: {hour: 0, minutes: 0},
        end: {hour: 0, minutes: 0},
      },
      active: true,
    },
    {
      name: "Miercoles",
      time: {
        start: {hour: 0, minutes: 0},
        end: {hour: 0, minutes: 0},
      },
      active: true,
    },
    {
      name: "Jueves",
      time: {
        start: {hour: 0, minutes: 0},
        end: {hour: 0, minutes: 0},
      },
      active: true,
    },
    {
      name: "Viernes",
      time: {
        start: {hour: 0, minutes: 0},
        end: {hour: 0, minutes: 0},
      },
      active: true,
    },
    {
      name: "Sabado",
      time: {
        start: {hour: 0, minutes: 0},
        end: {hour: 0, minutes: 0},
      },
      active: true,
    },
    {
      name: "Domingo",
      time: {
        start: {hour: 0, minutes: 0},
        end: {hour: 0, minutes: 0},
      },
      active: true,
    },
  ];

  // Contact Data
  address = "";
  phones = [];

  private loading: any;

  constructor(
    public firebaseService: FirebaseService,
    private dataService: DataService,
    private loadingController: LoadingController,
    private popoverController: PopoverController) { }

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

      //Tomar Configuracion
      this.firebaseService.getAppConfiguration().then(appConfiguration => {
        this.appConfiguration = appConfiguration as any;

        if(this.appConfiguration) {
          this.description = this.appConfiguration.description ? this.appConfiguration.description : "";
          this.schedule = this.appConfiguration.schedule ? this.appConfiguration.schedule : this.schedule;
          this.address = this.appConfiguration.address ? this.appConfiguration.address : "";
          this.phones = this.appConfiguration.phones ? this.appConfiguration.phones : [];
        }

        this.viewReady = true;
        this.loading.dismiss();
      }).catch(() => { this.loading.dismiss(); });
    });
  }

  isAdmin() {
    return this.firebaseService.userHasRole("admin");
  }

  setMinimumOrderPrice(event) {
    this.appConfiguration.minimumOrderPrice = event.detail.value;
  }

  saveChanges() {
    this.loadingController.create({
      message: 'Guardando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      const appConfig = {
        minimumOrderPrice: this.appConfiguration.minimumOrderPrice,
        description: this.description,
        schedule: this.schedule,
        phones: this.phones,
        address: this.address,
        mapSource: this.appConfiguration.mapSource ? this.appConfiguration.mapSource : "",
        socialNetworks: this.appConfiguration.socialNetworks ? this.appConfiguration.socialNetworks : [],
      }

      if(this.isAdmin()) {
        this.firebaseService.updateAppConfiguration(appConfig).then(() => {
          this.loading.dismiss();
          this.dataService.showInfo("Los cambios se guardaron correctamente", 2);
        }).catch(() => { this.loading.dismiss(); });
      }
    });
  }

  //Page Options

  //Home -------------------------------------------------------------------
  getWorkHours(day: any) {
    if(day.active) {
      const hourStart = day.time.start.hour > 12 ? day.time.start.hour - 12 : day.time.start.hour;
      const minutesStart = day.time.start.minutes >= 10 ? day.time.start.minutes : "0" + day.time.start.minutes; 
      const timeStart = day.time.start.hour < 12 ? "AM" : "PM";
      const hourEnd = day.time.end.hour > 12 ? day.time.end.hour - 12 : day.time.end.hour;
      const minutesEnd = day.time.end.minutes >= 10 ? day.time.end.minutes : "0" + day.time.end.minutes; 
      const timeEnd = day.time.end.hour < 12 ? "AM" : "PM";
      return hourStart + ":" + minutesStart + timeStart + " - " + hourEnd + ":" + minutesEnd + timeEnd;
    }
    else return "Cerrado";
  }

  async editDay(ev: any, day: any) {
    const popover = await this.popoverController.create({
      component: ScheduleOptionsComponent,
      componentProps: {
        day: day,
      },
      event: ev,
    });
    await popover.present();

    await popover.onWillDismiss().then(data => {
      console.log(data);
      const day = data.data;
      if(data.data) {
        let dayIndex = this.schedule.findIndex(d => d.name === day.name);
        this.schedule[dayIndex] = day;
      }
    });
  }

  //Contact ----------------------------------------------------------------------
  addPhone() {
    let phone = { text: "", number: "" };
    this.phones.push(phone);
  }

  deletePhone(phone: any) {
    this.phones = this.phones.filter(p => p !== phone);
  }
}
