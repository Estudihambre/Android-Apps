import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {

  currentOption = null;

  options = [
    {
      text: "Eliminar",
      icon: "trash"
    },
  ]

  constructor(private navParams: NavParams, private popoverController: PopoverController) { 
    this.options = this.navParams.get('options');
  }

  ngOnInit() {}

  closeView() {
    this.popoverController.dismiss(this.currentOption);
  }

  selectOption(value: number) {
    this.currentOption = value;
    this.closeView();
  }
}
