import { Component, OnInit, ViewChild } from '@angular/core';
import { PickerOptions } from '@ionic/core';
import { ModalController, PickerController, LoadingController, PopoverController, AlertController, IonContent } from '@ionic/angular';
import { product } from 'src/app/services/firebase.service';
import { ProductPage } from '../product/product.page';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UpdateProductPage } from './update-product/update-product.page';
import { DataService } from 'src/app/services/data.service';
import { OptionsComponent } from 'src/app/components/options/options.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  viewReady = false;
  allDataLoaded = false;
  private loading: any;
  private productsData: any;
  private productsLength = 16;

  private productsRef: any;
  private productsDataRef: any;

  searchbar = "";
  category = "";
  subcategory = "";

  products: product[];

  constructor(
    private data: DataService,
    private modalController: ModalController, 
    private pickerController: PickerController,
    private firebaseService: FirebaseService,
    private loadingController: LoadingController,
    private popoverController: PopoverController,
    private route: ActivatedRoute,
    private alertController: AlertController) { 
      this.route.queryParams.subscribe(params => {
        console.log(params);
        if(params.category) this.category = params.category;
        if(params.subcategory) this.subcategory = params.subcategory;
      });
    }

  ngOnInit() {
    this.getAppData();
  }

  ngOnDestroy() {
    if(this.productsDataRef) this.productsDataRef.unsubscribe();
    if(this.productsRef) this.productsRef.unsubscribe();
  }

  getAppData() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      //Datos de Usuario
      this.firebaseService.userSetup().then(userDataExist => {
        if(userDataExist) {
          this.getProducts();
        }
      }).catch(() => { this.loading.dismiss(); });
    });
  }

  scrollToTop() {
    this.content.scrollToTop(400);
  }

  isAdmin() {
    return this.firebaseService.userHasRole("admin");
  }

  async getProducts() {
    if(this.productsDataRef) this.productsDataRef.unsubscribe();
    if(this.productsRef) this.productsRef.unsubscribe();

    
    if(this.isAdmin()) {
      this.productsDataRef = await this.firebaseService.getProductsDataRealTime().subscribe(productsData => {
        this.productsData = productsData;
      });

      this.productsRef = await this.firebaseService.getProductsRealTime().subscribe(products => {
        this.products = products;
        this.loading.dismiss();
        this.viewReady = true;
      });
    } 
    else {
      await this.firebaseService.getProductsData().then(productsData => {
        this.productsData = productsData;
      });
      this.firebaseService.getProducts().then(products => {
        this.products = products as product[];
        this.loading.dismiss();
        this.viewReady = true;
      });
    }
  }

  async openProduct(product: product)
	{
    const modal = await this.modalController.create({
      component: ProductPage,
      componentProps : {
        product: product,
      }
    });
    await modal.present();
	}

  addToCart(product: product) { 
    this.data.addProductToCart(product);
    this.data.showInfo("Añadido a Carrito correctamente.", 1);
  }

  arrangedProducts() {
    let saleProducts = this.products.filter(product => product.sale === true);
    let featuredProducts = this.products.filter(product => product.featured === true && product.sale === false);
    let products = this.products.filter(product => product.featured === false && product.sale === false);

    let arrangedProducts = saleProducts.concat(featuredProducts, products);
    return arrangedProducts;
  }

  search(text: string) {
    this.searchbar = text;
  }

  searchProducts() {
    if(this.searchbar === "" && this.category === "" && this.subcategory === "") return this.arrangedProducts();
    else {
      var products = [] as product[];
      this.arrangedProducts().forEach(product => {
        if(product.category === this.category || this.category === "") {
          if(product.subcategory === this.subcategory || this.subcategory === "") {
            if(product.name.toLocaleLowerCase().startsWith(this.searchbar.toLocaleLowerCase())) products.push(product);
          }
        }
      });
      return products;
    }
  }

  filteredProducts() {
    var products = [] as product[];
    for(let i = 0; i < this.productsLength; i++) {
      if(this.searchProducts()[i]) {
        products.push(this.searchProducts()[i]);
      }
      else break;
    }
    return products;
  }

  loadData(event) {
    setTimeout(() => {
      //Add products length
      this.productsLength += 16;
      if(this.productsLength > this.products.length) this.productsLength = this.products.length;
      event.target.complete();

      //Disable if done
      if (this.filteredProducts().length >= this.products.length) {
        event.target.disabled = true;
        this.allDataLoaded = true;
      }
    }, 500);
  }

  updateProductsLength() {
    let lengthDiference = Math.abs(this.products.length - this.productsLength);
    if(lengthDiference === 1) this.productsLength = this.products.length;
  }

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

  getUnitsText(product: product) {
    return product.quantity > 1 ? product.units+"s" : product.units;
  }

  getProductSalePercentage(product: product) {
    let price = product.price ? product.price : 0.99;
    let salePrice = product.salePrice ? product.salePrice : 0.99;
    if(salePrice > price) salePrice = price;
    return Math.floor((1 - (product.salePrice / product.price)) * 100);
  }

  getProductPrice(product: product) {
    return product.sale ? product.salePrice : product.price;
  }

  setCategories(category: string, subcategory?: string) {
    this.category = category === "" ? this.category : category;
    this.subcategory = subcategory === "" ? this.subcategory : subcategory;
  }

  createProduct() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      if(this.productsData.newProductId === "") {
        let product = {} as product;

        product.creationDate = new Date();
        product.name = "Nuevo Producto";
        product.price = 0.99;
        product.description = "";
        product.salePrice = 0.99;
        product.sale = false;
        product.featured = false;
        product.category = "";
        product.subcategory = "";
        product.quantity = 1;
        product.units = "";
        product.subproducts = [];
        product.images = [];

        this.firebaseService.createProduct(product).then(p => {
          //console.log(p.data());
          this.modalController.create({
            component: UpdateProductPage,
            componentProps : {
              create: true,
              product: p,
              productsData: this.productsData,
            }
          }).then(modal => { 
            this.updateProductsLength();
            modal.present().then(() => { this.loading.dismiss(); });
          });
        }).catch(() => { this.loading.dismiss(); });
      }
      else {
        this.firebaseService.getNewProduct(this.productsData.newProductId).then(newProduct => {
          this.modalController.create({
            component: UpdateProductPage,
            componentProps : {
              create: true,
              product: newProduct,
              productsData: this.productsData,
            }
          }).then(modal => { 
            modal.present().then(() => { this.loading.dismiss(); }); 
          });
        }).catch(() => { this.loading.dismiss(); });
      }
    });
	}


  // PRODUCT OPTIONS ------------------------------------------------------------------------------------

  async productOptions(ev: any, product: product) {
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
        case 0: { this.editProduct(product); } break;
        case 1: { this.duplicateProductConfirm(product); } break;
        case 2: { this.deleteProductConfirm(product); } break;
      }
    });
  }

  async editProduct(product: product) {
    const modal = await this.modalController.create({
      component: UpdateProductPage,
      componentProps : {
        create: false,
        product: product,
        productsData: this.productsData,
      }
    });
    await modal.present();
	}

  async duplicateProductConfirm(product: product) {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Duplicar Producto",
      message: "Estas seguro que deseas duplicar este producto? (Sera visible inmediatamente para todos los usuarios)",
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Duplicar",
          handler: () => {
            this.firebaseService.duplicateProduct(product).then(p => {
              this.updateProductsLength();
              this.editProduct(p);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteProductConfirm(product: product) {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Eliminar Producto",
      message: "Estas seguro que deseas eliminar este producto?",
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Eliminar",
          handler: () => {
            this.firebaseService.deleteProduct(product);
            if(product.id === this.productsData.newProductId) this.firebaseService.cleanNewProduct();
          }
        }
      ]
    });
    await alert.present();
  }
}
