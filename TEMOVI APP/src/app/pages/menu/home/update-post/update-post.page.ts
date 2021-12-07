import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { OptionsComponent } from 'src/app/components/options/options.component';
import { DataService } from 'src/app/services/data.service';
import { post, FirebaseService, product } from 'src/app/services/firebase.service';
import { AssignProductPage } from './assign-product/assign-product.page';

@Component({
  selector: 'app-update-post',
  templateUrl: './update-post.page.html',
  styleUrls: ['./update-post.page.scss'],
})
export class UpdatePostPage implements OnInit {

  post: post;
  create = false;

  images: string[];
  selectedImages: any[];

  product: product;

  category = "";
  subcategory = "";

  postRealTime: post;
  postRef: any;
  newImages: string[] = [];
  viewReady = false;

  private loading: any;

  constructor( 
    private firebaseService: FirebaseService,
    private data: DataService,
    private modalController: ModalController, 
    private navParams: NavParams,  
    private alertController: AlertController,
    private loadingController: LoadingController,
    private popoverController: PopoverController) { 
      this.post = navParams.get('post');
      this.create = navParams.get('create');
  }

  ngOnInit() {
    this.getPost();
  }

  ngOnDestroy() {
    if(this.postRef) this.postRef.unsubscribe();
  }

  closeView(){
	  this.modalController.dismiss();
  }

  allowPost() {
    return (this.post.title !== "" && this.post.content !== "") || this.postRealTime.images.length > 0;
  }

  getLinkedObject() {
    if(this.post.linkType) {
      if(this.post.linkType === "") {
        this.post.linkType = "product";
        this.post.linkedObject = null;
      }
      else {
        if(this.post.linkedObject) {
          switch(this.post.linkType) {
            case "product": { 
              this.firebaseService.getProduct(this.post.linkedObject.id).then(product => {
                this.product = product as product;
              }).catch(() => { this.post.linkedObject = null; });
            } break;
  
            case "category": { 
              if(this.post.linkedObject.category) this.category = this.post.linkedObject.category; 
              if(this.post.linkedObject.subcategory) this.subcategory = this.post.linkedObject.subcategory; 
            } break;
          }
        }
      }
    }
  }

  updateLinkedObject() {
    switch(this.post.linkType) {
      case "product": { 
        this.post.linkedObject = this.product; 
      } break;

      case "category": { 
        this.post.linkedObject = { 
          category: this.category, 
          subcategory: this.subcategory, 
        } 
      } break; 
    }
    console.log(this.post.linkedObject);
  }

  getPost() {
    this.loadingController.create({
      message: 'Cargando...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();
        this.getLinkedObject();
        if(this.postRef) this.postRef.unsubscribe();
        this.postRef = this.firebaseService.getPostRealTime(this.post.id).subscribe(p => {
          this.postRealTime = p;
          this.viewReady = true;
          this.loading.dismiss();
          if(this.newImages.length >= 1) this.newImages.pop();
        });
    });
  }

  updatePost() {
    this.loadingController.create({
      message: 'Loading...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      if(this.allowPost()) {
        this.post.images = this.postRealTime.images;
        this.post.published = true;
        this.updateLinkedObject();
  
        this.firebaseService.updatePost(this.post).then(() => {
          this.loading.dismiss();
          this.closeView();
          this.data.showInfo("Post Creado Correctamente", 1.5);
        }).catch(() => { this.loading.dismiss(); });
      } else {
        this.data.showInfo("El Post debe tener Imagen o Texto para ser publicado", 1.5);
        this.loading.dismiss();
      }
    });
  }

  async deleteConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'cool-alert',
      header: "Delete Post",
      message: "Are you sure you want to Delete this Post?",
      buttons: [
        {
          text: "Cancel",
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: "Delete",
          handler: () => {
            this.deletePost();
          }
        }
      ]
    });

    await alert.present();
  }

  deletePost() {
    this.loadingController.create({
      message: 'Loading...',
      cssClass: 'cool-loading',
    }).then(overlay => {
      this.loading = overlay;
      this.loading.present();

      if(this.postRef) this.postRef.unsubscribe(); 

      this.firebaseService.deletePost(this.post).then(() => {
        this.loading.dismiss();
        this.closeView();
        this.data.showInfo("El Post ha sido borrado correctamente", 1.5);
      }).catch(() => { this.loading.dismiss(); });
    });
  }

  // IMAGES ------------------------------------------------------------------------------------------------
  isImageUploaded() {
    if(this.postRealTime) {
      if(!this.postRealTime.images) return false;
      else return this.postRealTime.images.length >= 1 || this.newImages.length >= 1 ? true : false;
    }
    else {
      if(!this.post.images) return false;
      else return this.post.images.length >= 1 ? true : false;
    }
  }

  chooseImages(event) {
    this.selectedImages = event.target.files;
    console.log(this.selectedImages);

    this.uploadPostImages();
  }

  async uploadPostImages() {
    for (var i = 0; i < this.selectedImages.length; i++) {
      this.newImages.push("");
    }

    for (var i = 0; i < this.selectedImages.length; i++) {
      var imageFile = this.selectedImages[i];

      await this.firebaseService.uploadPostImage(this.postRealTime, imageFile).then(imgName =>{
        console.log(imgName);
      });
    }
  }

  async imageOptions(ev: any, image: string) {
    const popover = await this.popoverController.create({
      component: OptionsComponent,
      componentProps: {
        options: [{text: "Eliminar", icon: "trash"}],
      },
      event: ev,
    });
    await popover.present();

    await popover.onWillDismiss().then(data => {
      console.log(data);
      const option = data.data;
      switch(option) {
        case 0: { this.deleteImage(image); } break;
      }
    });
  }

  moveImageTop(image: string) {
    let images = this.postRealTime.images as string[];
    images = images.filter(img => img !== image);
    images = [image].concat(images);

    this.firebaseService.updatePostImages(this.post.id, images);
  }

  moveImageBottom(image: string) {
    let images = this.postRealTime.images as string[];
    images = images.filter(img => img !== image);
    images.push(image);

    this.firebaseService.updatePostImages(this.post.id, images);
  }

  deleteImage(image: string) {
    let images = this.postRealTime.images as string[];
    images = images.filter(img => img !== image);

    this.firebaseService.updatePostImages(this.post.id, images);
  }

  //LINKS ---------------------------------------------------------------
  async assignProduct() {
    const modal = await this.modalController.create({
      component: AssignProductPage,
    });
    await modal.present();

    await modal.onWillDismiss().then(data => {
      console.log(data);
      const product = data.data;
      if(product) this.product = product;
      else this.product = null;
    });
  }

  setCategories(categories: any) {
    this.category = categories.category;
    this.subcategory = categories.subcategory;
  }

}
