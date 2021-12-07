import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from 'src/app/services/data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  constructor(
    private iab : InAppBrowser,
    private ds: DomSanitizer, 
    public dataService: DataService,
    private firebaseService: FirebaseService) {
  }

  phoneNumbers: [
    {
      text: "Phone",
      number: "3107386826",
    },
  ]
  openLink(link) {
	  this.iab.create(link);
  }

  ngOnInit() {
  }

  getData() {
    return this.firebaseService.appConfiguration;
  }

  getMapUrl() {
    return this.ds.bypassSecurityTrustResourceUrl(this.getData()?.mapSource);
  }

}
 