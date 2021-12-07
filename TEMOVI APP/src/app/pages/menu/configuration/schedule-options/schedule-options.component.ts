import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-schedule-options',
  templateUrl: './schedule-options.component.html',
  styleUrls: ['./schedule-options.component.scss'],
})
export class ScheduleOptionsComponent implements OnInit {

  day: any;

  constructor(private navParams: NavParams, private popoverController: PopoverController) { 
    this.day = this.navParams.get('day');
  }

  ngOnInit() {}

  // rangeChange(event) {
  //   this.day.start = event.detail.value.lower;
  //   this.day.finish = event.detail.value.upper;
  // }

  closeView() {
    this.popoverController.dismiss(this.day);
  }
}
