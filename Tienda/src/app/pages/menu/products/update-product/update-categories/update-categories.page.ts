import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavParams, PickerController, ToastController } from '@ionic/angular';
import { PickerOptions } from '@ionic/core';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-update-categories',
  templateUrl: './update-categories.page.html',
  styleUrls: ['./update-categories.page.scss'],
})
export class UpdateCategoriesPage implements OnInit {

  //categories: any[];
  category: string = null;
  subcategory: string = null;
  newCategory = "";
  newSubcategory = "";

  newChanges = false;
  loading: any;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private pickerController: PickerController,
    private firebaseService: FirebaseService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController) { 
    //this.categories = this.navParams.get('categories');
    //console.log(this.categories);
  }

  ngOnInit() {
  }

  closeWindow(){
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

  getCategoryText() {
    if(this.category) return this.category;
    else return "Categoria";
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
            this.subcategory = null;
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
      if(pickerValue.data != undefined) this.category = pickerValue.data.Categoria.value;
    });
  }

  isCategoryActivated() { return this.category !== null; }

  clearCategories() {
    this.category = null;
    this.subcategory = null;
  }

  getCurrentCategory() {
    let currentCategory: any;
    let categoryIndex: number;
    this.firebaseService.categories.forEach((category, i) => {
      if(category.text === this.category) {
        currentCategory = category;
        categoryIndex = i;
      }
    });
    return {object: currentCategory, index: categoryIndex};
  }

  createCategory() {
    if(this.newCategory !== "") {
      this.loadingController.create({
        message: 'Guardando...',
        cssClass: 'cool-loading',
      }).then(overlay => {
        this.loading = overlay;
        this.loading.present();
  
        let category = {text: this.newCategory, subcategories: [], image: ""};
        this.firebaseService.createCategory(category).then(c => {
          //this.categories = [c].concat(this.categories);
          this.category = this.newCategory;
          this.newCategory = "";
          this.loading.dismiss();
          this.showInfo("Creada Correctamente");
        });
      });
    }
  }

  async deleteCategoryConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Eliminar Categoria",
      message: "Estas seguro que deseas eliminar esta categoria? (las subcategorias contenidas dentro seran borradas)",
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Eliminar",
          handler: () => {
            this.deleteCategory();
          }
        }
      ]
    });
    await alert.present();
  }

  deleteCategory() {
    this.loadingController.create({
      message: 'Eliminando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      let deletedCategory = this.getCurrentCategory().object;

      if(deletedCategory) {
        this.firebaseService.deleteCategory(deletedCategory.id).then(c => {
          //this.categories = this.categories.filter(category => category.text !== deletedCategory.text);
          this.category = this.newCategory;
          this.newCategory = "";
          this.loading.dismiss();
          this.showInfo("Eliminada Correctamente");
        });
      }
    });
  }

  createSubcategory() {
    if(this.newSubcategory !== "") {
      this.loadingController.create({
        message: 'Guardando...',
        cssClass: 'cool-loading',
      }).then(overlay => {
        this.loading = overlay;
        this.loading.present();
  
        let categoryIndex = this.getCurrentCategory().index;
  
        let newSubcategories = [{text: this.newSubcategory}].concat(this.firebaseService.categories[categoryIndex].subcategories);
        this.firebaseService.updateSubcategories(this.firebaseService.categories[categoryIndex].id, newSubcategories).then(sc => {
          this.newSubcategory = "";
          this.loading.dismiss();
          this.showInfo("Creada Correctamente");
        });
      });
    }
  }

  async deleteSubcategoryConfirm(index: number) {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Eliminar Subcategoria",
      message: "Estas seguro que deseas eliminar esta subcategoria?",
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Eliminar",
          handler: () => {
            this.deleteSubcategory(index);
          }
        }
      ]
    });
    await alert.present();
  }


  deleteSubcategory(index: number) {
    this.loadingController.create({
      message: 'Eliminando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      let currentCategory = this.getCurrentCategory();
      let removedFrom = currentCategory.object;
      let categoryIndex = currentCategory.index;

      if(removedFrom) {
        let newSubcategories = this.firebaseService.categories[categoryIndex].subcategories
        .filter(subcategory => subcategory.text !== removedFrom.subcategories[index].text);

        this.firebaseService.updateSubcategories(this.firebaseService.categories[categoryIndex].id, newSubcategories).then(sc => {
          this.newSubcategory = "";
          this.loading.dismiss();
          this.showInfo("Eliminada Correctamente");
        });
      }
    });
  }

  categoriesExist() {
    return this.firebaseService.categories.length < 1 ? false : true;
  }
}
