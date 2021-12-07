import { Component, OnInit } from '@angular/core';
import { FirebaseService, product } from 'src/app/services/firebase.service';
import { ModalController, NavParams, PickerController, LoadingController, ToastController, PopoverController } from '@ionic/angular';
import { PickerOptions } from '@ionic/core';
import { UpdateCategoriesPage } from './update-categories/update-categories.page';
import { OptionsComponent } from 'src/app/components/options/options.component';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.page.html',
  styleUrls: ['./update-product.page.scss'],
})
export class UpdateProductPage implements OnInit {

  private loading: any;

  create: boolean;
  product: product;
  productsData: any;
  category: string = "";
  subcategory: string = "";
  unit: string = "";
  units: string[] = [];

  images: string[];
  selectedImages: any[];

  productRealTime: any;
  productRef: any;
  newImages: string[] = [];
  viewReady = false;

  slideOpts = {
    loop: true,
    zoom: true,
    pager: true,
    passiveListeners: false,
    //slidesPerView: 2,
  };

  constructor(
    private modalController : ModalController, 
    private navParams : NavParams,
    private pickerController: PickerController,
    private firebaseService: FirebaseService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private popoverController: PopoverController) {
      this.create = this.navParams.get('create');
      this.product = this.navParams.get('product');
      this.productsData = this.navParams.get('productsData');
      this.units = this.productsData.units;
      this.category = this.product.category;
      this.subcategory = this.product.subcategory;
      this.unit = this.product.units;
    }

  ngOnInit() {
    this.getProduct();
  }

  ngOnDestroy() {
    if(this.productRef) this.productRef.unsubscribe();
  }

  getProduct() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();
        if(this.productRef) this.productRef.unsubscribe();
        this.productRef = this.firebaseService.getProductRealTime(this.product.id).subscribe(p => {
          this.productRealTime = p;
          this.viewReady = true;
          this.loading.dismiss();
          if(this.newImages.length >= 1) this.newImages.pop();
        });
    });
  }

  getTitleText() {
    return this.create ? "CREAR PRODUCTO" : "EDITAR PRODUCTO";
  }

  closeWindow(){
    if(this.productRef) this.productRef.unsubscribe();
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

  // IMAGES ------------------------------------------------------------------------------------------------
  isImageUploaded() {
    if(this.productRealTime) {
      if(!this.productRealTime.images) return false;
      else return this.productRealTime.images.length >= 1 || this.newImages.length >= 1 ? true : false;
    }
    else {
      if(!this.product.images) return false;
      else return this.product.images.length >= 1 ? true : false;
    }
  }

  chooseImages(event) {
    this.selectedImages = event.target.files;
    console.log(this.selectedImages);

    this.uploadProductImages();
  }

  async uploadProductImages() {
    for (var i = 0; i < this.selectedImages.length; i++) {
      this.newImages.push("");
    }

    for (var i = 0; i < this.selectedImages.length; i++) {
      var imageFile = this.selectedImages[i];

      await this.firebaseService.uploadProductImage(this.productRealTime, imageFile).then(imgName =>{
        console.log(imgName);
      });
    }
  }

  async imageOptions(ev: any, image: string) {
    const popover = await this.popoverController.create({
      component: OptionsComponent,
      componentProps: {
        options: [
          { text: "Editar", icon: "brush" },
          { text: "Duplicar", icon: "duplicate" },
          { text: "Eliminar", icon: "trash" }, 
        ],
      },
      event: ev,
    });
    await popover.present();

    await popover.onWillDismiss().then(data => {
      console.log(data);
      const option = data.data;
      switch(option) {
        case 0: { this.moveImageTop(image); } break;
        case 1: { this.moveImageBottom(image); } break;
        case 2: { this.deleteImage(image); } break;
      }
    });
  }

  moveImageTop(image: string) {
    let images = this.productRealTime.images as string[];
    images = images.filter(img => img !== image);
    images = [image].concat(images);

    this.firebaseService.updateProductImages(this.product.id, images);
  }

  moveImageBottom(image: string) {
    let images = this.productRealTime.images as string[];
    images = images.filter(img => img !== image);
    images.push(image);

    this.firebaseService.updateProductImages(this.product.id, images);
  }

  deleteImage(image: string) {
    let images = this.productRealTime.images as string[];
    images = images.filter(img => img !== image);

    this.firebaseService.updateProductImages(this.product.id, images);
  }

  // PICKERS -------------------------------------------------------------------------------
  // TEXT
  getUnitsText() {
    if(this.unit) return this.unit;
    else return "Tipo de Unidad";
  }

  getCategoryText() {
    if(this.category) return this.category;
    else return "Categoria";
  }

  getSubcategoryText() {
    if(this.subcategory) return this.subcategory;
    else return "Subcategoria";
  }

  // PICKER OPTIONS
  getUnits() {
    var units = [];
    this.units.forEach(unit => {
      units.push({
        text: unit,
        value: unit,
      })
    });
    return units;
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

  // PICKER SELECT
  async selectUnit() {
    var options = this.getUnits();
    var po: PickerOptions = {
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.unit = "";
          }
        },
        {
          text: 'Seleccionar',
          //handler: () => { }
        }
      ],
      columns: [
        {
          name: 'Unidad',
          options: options,
        }
      ]
    }

    var picker = await this.pickerController.create(po);
    picker.present();
    picker.onWillDismiss().then(pickerValue => {
      if(pickerValue.data != undefined) this.unit = pickerValue.data.Unidad.value;
    });
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
      if(pickerValue.data != undefined) this.category = pickerValue.data.Categoria.value;
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
      if(pickerValue.data != undefined) this.subcategory = pickerValue.data.Subcategoria.value;
    });
  }

  isCategoryActivated() { return this.category !== ""; }

  clearCategories() {
    this.category = "";
    this.subcategory = "";
  }

  async updateCategories() {
    const modal = await this.modalController.create({
      component: UpdateCategoriesPage,
    });
    await modal.present();
	}

  saveProduct() {
    this.loadingController.create({
      message: 'Guardando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      this.product.category = this.category;
      this.product.subcategory = this.subcategory;
      this.product.units = this.unit;
      this.product.images = this.productRealTime.images;

      this.firebaseService.updateProduct(this.product).then(() => {
        if(this.product.id === this.productsData.newProductId) {
          this.firebaseService.cleanNewProduct().then(() => {
            this.loading.dismiss();
            this.closeWindow();
            this.showInfo("Guardado Correctamente");
          });
        }
        else {
          this.loading.dismiss();
          this.closeWindow();
          this.showInfo("Guardado Correctamente");
        }
      });
    });
  }
}
