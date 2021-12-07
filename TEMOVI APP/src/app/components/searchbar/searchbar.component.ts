import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent implements OnInit {

  @Input() text: string;
  @Output() textChanged = new EventEmitter() as any;

  constructor() { }

  ngOnInit() {}

  emit() {
    this.textChanged.emit(this.text);
    // console.log(this.text)
  }

}
