import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { PickerController } from '@ionic/angular';
import { PickerOptions } from '@ionic/core';

@Component({
  selector: 'category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.scss'],
})
export class CategoryPickerComponent implements OnInit {
  
  @Input() category: string = "";
  @Input() subcategory: string = "";

  @Output() categoriesChanged = new EventEmitter() as any;

  constructor(
    private firebaseService: FirebaseService,
    private pickerController: PickerController,
  ) { }

  ngOnInit() {}

  getCategoryText() {
    if(this.category) return this.category;
    else return "Categoria";
  }

  getSubcategoryText() {
    if(this.subcategory) return this.subcategory;
    else return "Subcategoria";
  }

  getCategories() {
    var categories = [];
    this.firebaseService.categories.forEach(category => {
      categories.push({
        text: category.text,
        value: category.text,
      })
    });
    return categories;
  }

  getSubcategories() {
    var subcategories = [];
    this.firebaseService.categories.forEach(category => {
      if(category.text === this.category) {
        category.subcategories.forEach(subcategory => {
          subcategories.push({
            text: subcategory.text,
            value: subcategory.text,
          });
        });
      }
    });
    return subcategories;
  }

  async selectCategory() {
    var options = this.getCategories();
    var po: PickerOptions = {
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.clearCategories();
          }
        },
        {
          text: 'Seleccionar',
          handler: () => {
            this.subcategory = "";
          }
        }
      ],
      columns: [
        {
          name: 'Categoria',
          options: options,
        }
      ]
    }

    var picker = await this.pickerController.create(po);
    picker.present();
    picker.onWillDismiss().then(pickerValue => {
      if(pickerValue.data != undefined) {
        this.category = pickerValue.data.Categoria.value;
        this.emit();
      }
    });
  }

  async selectSubcategory() {
    var options = this.getSubcategories();
    var po: PickerOptions = {
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.subcategory = "";
          }
        },
        {
          text: 'Seleccionar',
        }
      ],
      columns: [
        {
          name: 'Subcategoria',
          options: options,
        }
      ]
    }

    var picker = await this.pickerController.create(po);
    picker.present();
    picker.onWillDismiss().then(pickerValue => {
      if(pickerValue.data != undefined) {
        this.subcategory = pickerValue.data.Subcategoria.value;
        this.emit();
      }
    });
  }

  isCategoryActivated() { return this.category !== ""; }

  clearCategories() {
    this.category = "";
    this.subcategory = "";
    this.emit();
  }

  emit() {
    const categories = {category: this.category, subcategory: this.subcategory};
    this.categoriesChanged.emit(categories);
  }
}
