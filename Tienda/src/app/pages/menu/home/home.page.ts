import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService, product } from 'src/app/services/firebase.service';
import { ModalController, LoadingController, IonContent } from '@ionic/angular';
import { UpdatePostPage } from './update-post/update-post.page';
import { post} from 'src/app/services/firebase.service';
import { DataService } from 'src/app/services/data.service';
import { ProductPage } from '../product/product.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  allDataLoaded = false;
  selectedTab = "home";
  posts = [] as post[];
  products = [] as product[];
  postsReady = false;
  private postsLength = 10;

  private postsRef: any;
  private loading: any;
  slider = [
    '../assets/images/1s.jpg',
    '../assets/images/2s.png',
    '../assets/images/3s.png',
    '../assets/images/4s.jpg',
  ];
  schedules = [
    {
      day: "Monday",
      hour: "09:00 AM - 06:00 PM",
    },
    {
      day: "Tuesday",
      hour: "09:00 AM - 06:00 PM",
    },
    {
      day: "Wednesday",
      hour: "09:00 AM - 06:00 PM",
    },
    {
      day: "Thursday",
      hour: "09:00 AM - 06:00 PM",
    },
    {
      day: "Friday",
      hour: "09:00 AM - 06:00 PM",
    },
    {
      day: "Saturday",
      hour: "09:00 AM - 06:00 PM",
    },
    {
      day: "Sunday",
      hour: "09:00 AM - 05:00 PM",
    },
  ];

  constructor(
    private firebaseService: FirebaseService, 
    private modalController: ModalController,
    private loadingController: LoadingController,
    private router: Router,
    public data: DataService) {
  }

  ngOnInit() {
    this.getAppData();
  }

  ngOnDestroy() {
    if(this.postsRef) this.postsRef.unsubscribe();
  }

  getAppData() {
    this.firebaseService.getPosts().then(posts => {
      this.posts = posts as any;
    });

    this.firebaseService.getProducts().then(products => {
      this.products = products as any;
    });

    if(this.postsRef) this.postsRef.unsubscribe();
    this.postsRef = this.firebaseService.getPostsRealTime().subscribe(posts => {
      if(posts) this.posts = posts;
      this.postsReady = true;
    });
  } 

  getData() {
    return this.firebaseService.appConfiguration;
  }

  scrollToTop() {
    this.content.scrollToTop(400);
  }

  isAdmin() {
    return this.firebaseService.userHasRole("admin");
  }

  getPosts() {
    return this.isAdmin() ? this.posts : this.posts.filter(post => post.published);
  }

  isPostEmpty(post: post) {
    return post.images.length <= 0 && post.title === "" && post.content === "";
  }

  async viewPost(post: post) {
    if(this.isAdmin()) {
      const va = await this.modalController.create({
        component: UpdatePostPage,
        componentProps : {
          post: post,
          create: false,
        }
      });
      await va.present();
    }
    else this.openPostLink(post);
  }

  async createPost() {
    if(this.isAdmin()) {
      this.loadingController.create({
        message: 'Loading...',
        cssClass: 'cool-loading',
      }).then(overlay => {
        this.loading = overlay;
        this.loading.present();

        let post = {} as post;
        post.id = 'Undefined';
        post.creationDate = new Date();
        post.title = "";
        post.content = "";
        post.images = [];
        post.published = false;
        post.announcement = false;
        post.featuredImage = false;
        post.activateLink = false;
        post.linkType = "";
        post.linkedObject = null;

        this.firebaseService.createPost(post).then(p => {
          this.viewPost(p).then(() => {
            this.loading.dismiss();
          });
        }).catch(() => { this.loading.dismiss(); });
      });
    }
  }

  getAnnouncements() {
    let announcements = [];
    var ac = 0;
    this.posts.forEach(post => {
      if(ac < 8 && post.announcement && post.title !== "" && post.content !== "") {
        announcements.push(post);
        ac++;
      } 
    });
    return announcements;
  }

  getFeaturedImages() {
    let featuredImages = [];
    var ac = 0;
    this.posts.forEach(post => {
      if(ac < 8 && post.featuredImage && post.images.length > 0) {
        featuredImages.push(post);
        ac++;
      } 
    });
    return featuredImages;
  }

  getTopProducts() {
    return this.products.filter(product => product.sale && product.featured);
  }

  getSaleProducts() {
    return this.products.filter(product => product.sale && !product.featured);
  }

  getFeaturedProducts() {
    return this.products.filter(product => !product.sale && product.featured);
  }

  // Horario 
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

  // INFINITE LOADING
  loadData(event) {
    setTimeout(() => {
      //Add products length
      this.postsLength += 10;
      if(this.postsLength > this.posts.length) this.postsLength = this.posts.length;
      event.target.complete();

      //Disable if done
      if (this.getPosts().length >= this.posts.length) {
        event.target.disabled = true;
        this.allDataLoaded = true;
      }
    }, 500);
  }

  updateProductsLength() {
    let lengthDiference = Math.abs(this.posts.length - this.postsLength);
    if(lengthDiference === 1) this.postsLength = this.posts.length;
  }

  // POST LINKS ------------------------------------------------------------------
  openPostLink(post: post) {
    if(post.activateLink) {
      switch(post.linkType) {
        case "product": { 

          this.loadingController.create({
            message: 'Loading...',
            cssClass: 'cool-loading',
          }).then(overlay => {
            this.loading = overlay;
            this.loading.present();

            this.firebaseService.getProduct(post.linkedObject.id).then(p => {
              const product = p as product;
              if(product) {
                this.loading.dismiss();
                this.openProduct(product);
              }
            }).catch(() => { this.loading.dismiss(); });
          });
        } break;

        case "category": { 
          let navigationExtras = {
            queryParams: {
              category: post.linkedObject.category,
              subcategory: post.linkedObject.subcategory,
            }
          }
          this.router.navigate(['/menu/products'], navigationExtras);
        } break;
      }
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
}
