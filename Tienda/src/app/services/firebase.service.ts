import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';

export interface order {
  id: string;
  creationDate: Date;
  closedDate: Date;
  number: number;
  state: number;
  products: orderProduct[];
  user: user;
  lastChange: user;
  totalPrice: number;
  delivery: user;
}

export interface orderProduct {
  product: product;
  quantity: number;
}

export interface product {
  id: string,
  creationDate: Date,
  name: string,
  price: number,
  description: string,
  salePrice: number,
  sale: boolean,
  featured: boolean,
  category: string,
  subcategory: string,
  quantity: number,
  units: string,
  subproducts: product[],
  images: string[],
}

export interface user {
  id: string,
  username: string,
  roles: string[],
  phone: string,
  address: string,
  location: any,
  email: string,
  cancel: number,
  orderCount: number,
  allowOrders: boolean,
  notifications: boolean,
  language: number,
  token: string,
}

export interface post {
  id: string,
  creationDate: Date,
  title: string,
  content: string,
  images: string[],
  published: boolean,
  announcement: boolean,
  featuredImage: boolean,
  activateLink: boolean,
  linkType: string,
  linkedObject: any,
}

export enum state {
  pending,
  accepted,
  cancelled,
  closed,
  inProgress,
}

export enum language {
  ES,
  EN
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private user: any;
  private dbName = "TEMOVI";
  private dbRoute = "orders/TEMOVI/app"
  private userReady = false;
  public userAuthState: any;
  public userData: user;
  public appConfiguration: any;
  public categories: any[];
  public appDataReady = false;
  public defaultLanguage = language.ES;

  //User Setup
  private authRef: any;
  private userRef: any;
  private appConfigurationRef: any;
  private categoriesRef: any;

  constructor(
    public fbAuth: AngularFireAuth, 
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    public fcm: FirebaseX,
    private platform: Platform) {
      this.getAppData();
  }

  getDataBaseName() { return this.dbName; }

  //SETUP APP --------------------------------------------------------------------
  userSetup() { //Devuelve true si el usuario existe
    return new Promise((resolve, rejected) => {
      if(this.userReady) {
        var userDataExist = this.userData ? true : false;
        resolve(userDataExist);
      }
      else {
        if(this.authRef) this.authRef.unsubscribe(); //Limpia las referencias de suscripcion

        this.authRef = this.fbAuth.authState.subscribe(user => { //Autenticacion de Usuario (Real Time)
          this.userAuthState = user;

          if(user) { 
            this.getUser(user.uid).then(userData => { 
              this.userData = userData as user;

              //Si existe el usuario devuelve el true
              if(userData) { 
                if(this.userRef) this.userRef.unsubscribe();
                this.userRef = this.getUserRealTime(user.uid).subscribe(userData => { //Usuario (Real Time)
                  this.userData = userData;
                });

                this.activatePostNotifications();
                this.userReady = true;
                resolve(true);
              }
              //Si no existe se limpia la referencia de suscripcion y se crea un usuario nuevo, para despues tomar los datos en real time
              else {
                this.createUser(user.uid, user.email).then(createdUser => {
                  this.userData = createdUser as any;

                  if(this.userRef) this.userRef.unsubscribe();
                  this.userRef = this.getUserRealTime(user.uid).subscribe(userData => { //Usuario (Real Time)
                    this.userData = userData;
                  });

                  this.activatePostNotifications();
                  this.userReady = true;
                  resolve(true);
                });
              }
            });
          }
          //Si no esta logeado
          else {
            this.userReady = true;
            this.userData = null;
            resolve(false);
          }
        });
      }
    });
  }

  getAppData() {
    this.getAppConfiguration().then(appConfiguration => {
      this.appConfiguration = appConfiguration as any;
      this.appDataReady = true;
    });

    if(this.appConfigurationRef) this.appConfigurationRef.unsubscribe();
    this.appConfigurationRef = this.getAppConfigurationRealTime().subscribe(appConfiguration => {
      this.appConfiguration = appConfiguration;
    });

    this.getCategories().then(categories => {
      this.categories = categories as any;
    });

    if(this.categoriesRef) this.categoriesRef.unsubscribe();
    this.categoriesRef = this.getCategoriesRealTime().subscribe(categories => {
      this.categories = categories;
      this.categories.forEach(category => {
        category.subcategories.sort((a, b) => a.text.localeCompare(b.text));
      });
    });
  }

  isUserReady() { return this.userReady; }

  userHasRole(role: string, user?: user) {
    if(user) {
      let userRole = user.roles.find(r => r === role);
      if(userRole) return true;
      else return false;
    }
    else {
      if(this.userReady && this.userData) {
        let userRole = this.userData.roles.find(r => r === role);
        if(userRole) return true;
        else return false;
      }
      else return false;
    }
  }

  activatePostNotifications() {
    if(!this.userHasRole("admin") && !this.userHasRole("delivery")) this.fcm.subscribe(this.dbName+"-sales");
  }

  //AUTENTICACION----------------------------------------------------------
  login (email: string, password: string) {
    return new Promise((resolve, rejected) => {
      this.fbAuth.signInWithEmailAndPassword(email, password).then(res => {
        this.user = res.user;
        this.userReady = false;
        resolve(res);
      }).catch(err => rejected(err));
    }).then(setup => {
      this.userSetup().then(saveToken => {
        console.log(this.user.uid);
        this.saveToken(this.user.uid);
      });
    });
  }

  register(email: string, password: string, username?: string) {
    return new Promise((resolve, reject) => {
      this.fbAuth.createUserWithEmailAndPassword(email, password).then(res => {
        this.user = res.user;
        resolve(res);
      }).catch(err => reject(err));
    }).then(() => {
      this.createUser(this.user.uid, email, username).then(userSetup => {
        this.userReady = false;
        this.userSetup();
      });
    });
  }

  sendPasswordResetEmail(email: string) {
    return this.fbAuth.sendPasswordResetEmail(email);
  }

  logout () {
    if(this.authRef) this.authRef.unsubscribe(); //Limpia las referencias de suscripcion
    if(this.userRef) this.userRef.unsubscribe();

    this.userReady = false;
    this.userAuthState = null;
    this.user = null;
    return this.fbAuth.signOut();
  }

  //GUARDAR TOKENS-------------------------------------------------------
  updateToken(userId: string, token: string) {
    return this.db.collection(this.dbRoute+'/userData/users').doc(userId).update({token: token});
  }

  saveToken(userId: string) {
    if(this.platform.is('android')) {
      return this.fcm.getToken().then(token => {
        return this.updateToken(userId, token);
      });
    }
    else return null;
  }

  //OPCIONES DE APLICACION-----------------------------------------
  updateAppConfiguration(appConfig: any) {
    return this.db.collection(this.dbRoute).doc('appConfiguration').update(appConfig);
  }

  getAppConfiguration() {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute).doc('appConfiguration').ref.get().then(res => {
        resolve(res.data());
      }).catch(err => reject(err));
    });
  }

  getAppConfigurationRealTime() {
    return this.db.collection(this.dbRoute).doc('appConfiguration').snapshotChanges().pipe(map(res => {
      return res.payload.data() as any;
    }));
  }

  //BLOG----------------------------------------------------------
  getPostRealTime(post_id: string) {
    return this.db.collection(this.dbRoute+'/adminPosts/posts').doc(post_id).snapshotChanges().pipe(map(post => {
      const postData = post.payload.data() as any;
      postData.id = post.payload.id;
      postData.creationDate = postData.creationDate.toDate();
      return postData as post;
    }));
  }

  // getPostDataRealTime() {
  //   return this.db.collection(this.dbRoute).doc('adminPosts').snapshotChanges().pipe(map(postData => {
  //     return postData.payload.data() as any;
  //   }));
  // }

  getPosts() {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute+'/adminPosts/posts', ref => ref
      .orderBy('creationDate', 'desc')).ref.get().then(res => {
        const posts = res.docs.map(post => {
          const postData = post.data() as any;
          postData.id = post.id;
          postData.creationDate = postData.creationDate.toDate();
          return postData as post;
        });
        resolve(posts);
      }).catch(err => reject(err));
    });
  }

  getPostsRealTime() {
    return this.db.collection(this.dbRoute+'/adminPosts/posts', ref => ref
    .orderBy('creationDate', 'desc'))
    .snapshotChanges().pipe(map(posts => {
      return posts.map(post => {
        const postData = post.payload.doc.data() as any;
        postData.id = post.payload.doc.id;
        postData.creationDate = postData.creationDate.toDate();
        return postData as post;
      });
    }));
  }

  async createPost(post: post) {
    let p = await this.db.collection(this.dbRoute+'/adminPosts/posts').add(post);
    await this.db.collection(this.dbRoute+'/adminPosts/posts').doc(p.id).update({id: p.id});
    post.id = p.id;
    return post;
  }

  updatePost(post: post) {
    return this.db.collection(this.dbRoute+'/adminPosts/posts').doc(post.id).update(post);
  }

  deletePost(post: post) {
    return this.db.collection(this.dbRoute+'/adminPosts/posts').doc(post.id).delete();
  }

  updatePostImages(post_id: string, images: string[]) {
    return this.db.collection(this.dbRoute+'/adminPosts/posts').doc(post_id).update({images: images});
  }

  //PRODUCTOS----------------------------------------------------------
  getProducts() {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute+'/productsData/products', ref => ref
      .orderBy('name')).ref.get().then(res => {
        const products = res.docs.map(product => {
          const productData = product.data() as any;
          productData.id = product.id;
          productData.creationDate = productData.creationDate.toDate();
          return productData as product;
        });
        resolve(products);
      }).catch(err => reject(err));
    });
  }

  getNewProduct(product_id: string) {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute+'/productsData/products').doc(product_id).ref.get().then(res => {
        resolve(res.data());
      }).catch(err => reject(err));
    });
  }

  getProduct(product_id: string) {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute+'/productsData/products').doc(product_id).ref.get().then(res => {
        const productData = res.data() as any;
        productData.id = res.id;
        productData.creationDate = productData.creationDate.toDate();
        resolve(res.data());
      }).catch(err => reject(err));
    });
  }

  getProductRealTime(product_id: string) {
    return this.db.collection(this.dbRoute+'/productsData/products').doc(product_id).snapshotChanges().pipe(map(product => {
      const productData = product.payload.data() as any;
      productData.id = product.payload.id;
      productData.creationDate = productData.creationDate.toDate();
      return productData as product;
    }));
  }

  getProductsRealTime() {
    return this.db.collection(this.dbRoute+'/productsData/products', ref => ref
    //.orderBy('sale')
    //.orderBy('featured')
    .orderBy('name')).snapshotChanges().pipe(map(products => {
      return products.map(product => {
        const productData = product.payload.doc.data() as any;
        productData.id = product.payload.doc.id;
        productData.creationDate = productData.creationDate.toDate();
        return productData as product;
      });
    }));
  }

  cleanNewProduct() {
    return this.db.collection(this.dbRoute).doc('productsData').update({newProductId: ""});
  }

  async createProduct(product: product) {
    let p: any = await this.db.collection(this.dbRoute+'/productsData/products').add(product);
    await this.db.collection(this.dbRoute+'/productsData/products').doc(p.id).update({id: p.id});
    await this.db.collection(this.dbRoute).doc('productsData').update({newProductId: p.id});
    product.id = p.id;
    return product;
  }

  async duplicateProduct (product: product) {
    let p: any = await this.db.collection(this.dbRoute+'/productsData/products').add(product);
    await this.db.collection(this.dbRoute+'/productsData/products').doc(p.id).update({id: p.id});
    product.id = p.id;
    return product;
  }

  updateProduct(product: product) {
    return this.db.collection(this.dbRoute+'/productsData/products').doc(product.id).update(product);
  }

  deleteProduct(product: product) {
    return this.db.collection(this.dbRoute+'/productsData/products').doc(product.id).delete();
  }

  //DATA DE PRODUCTOS----------------------------------------------------------
  getProductsData() {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute).doc('productsData').ref.get().then(res => {
        resolve(res.data());
      }).catch(err => reject(err));
    });
  }

  getProductsDataRealTime() {
    return this.db.collection(this.dbRoute).doc('productsData').snapshotChanges().pipe(map(postData => {
      return postData.payload.data() as any;
    }));
  }

  // updateUnits(units: string[]) {
  //   return this.db.collection(this.dbRoute).doc('productsData').update({units: units});
  // }


  //CATEGORIAS DE PRODUCTOS----------------------------------------------------------
  getCategories() {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute+'/productsData/categories', ref => ref
      .orderBy('text')).ref.get().then(res => {
        var categories = res.docs.map(category => {
          const categoryData = category.data() as any;
          categoryData.id = category.id;
          return categoryData as any;
        });
        resolve(categories);
      }).catch(err => reject(err));
    });
  }

  getCategoriesRealTime() {
    return this.db.collection(this.dbRoute+'/productsData/categories', ref => ref
      .orderBy('text')).snapshotChanges().pipe(map(categories => {
      return categories.map(category => {
        const categoryData = category.payload.doc.data() as any;
        categoryData.id = category.payload.doc.id;
        return categoryData as any;
      });
    }));
  }

  createCategory(category: any) {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute+'/productsData/categories').add(category).then(c => {
        this.db.collection(this.dbRoute+'/productsData/categories').doc(c.id).update({id: c.id}).then(ctg => {
          const newCategory = category;
          newCategory.id = c.id;
          resolve(newCategory);
        })
      });
    });
  }

  deleteCategory(category_id: string) {
    return this.db.collection(this.dbRoute+'/productsData/categories').doc(category_id).delete();
  }

  updateSubcategories(category_id: string, subcategories: any[]) {
    return this.db.collection(this.dbRoute+'/productsData/categories').doc(category_id).update({subcategories: subcategories});
  }

  //IMAGENES---------------------------------------------------------------
  uploadProductImage(product: product, imageFile: any) {
    return new Promise((resolve, reject) => {
      if(imageFile) {
        //Branch + dbName + Document + Collection + ObjectId + ImageName
        //const randomName = 'orders-' + this.dbName + '-productsData-products-' + product.id+'-' + Math.random().toString().split(".")[1];
        
        const randomName = Math.random().toString().split(".")[1];
        this.getImageDimensions(imageFile).then(imageDimensions_ => {
          const imageDimensions = imageDimensions_ as any;

          console.log(imageDimensions);
          const metaData = {
            customMetadata: { 
              branch: "orders",
              dbName: this.dbName,
              document: "productsData",
              collection: "products",
              objectId: product.id,
              width: imageDimensions.width, 
              height: imageDimensions.height 
            }
          };

          this.storage.upload('orders/'+this.dbName+'/products/'+product.id+'/'+randomName, imageFile, metaData).then(() => {
            resolve(randomName);
          });
        });
      }
      else { resolve(null); }
    });
  }

  uploadPostImage(post: post, imageFile: any) {
    return new Promise((resolve, reject) => {
      if(imageFile) {
        //Branch + dbName + Document + Collection + ObjectId + ImageName
        //const randomName = 'orders-' + this.dbName + '-adminPosts-posts-' + post.id+'-' + Math.random().toString().split(".")[1];
        
        const randomName = Math.random().toString().split(".")[1];
        this.getImageDimensions(imageFile).then(imageDimensions_ => {
          const imageDimensions = imageDimensions_ as any;

          console.log(imageDimensions);
          const metaData = {
            customMetadata: { 
              branch: "orders",
              dbName: this.dbName,
              document: "adminPosts",
              collection: "posts",
              objectId: post.id,
              width: imageDimensions.width, 
              height: imageDimensions.height 
            }
          };

          this.storage.upload('orders/'+this.dbName+'/posts/'+post.id+'/'+randomName, imageFile, metaData).then(() => {
            resolve(randomName);
          });
        });
      }
      else { resolve(null); }
    });
  }

  getImageDimensions(imageFile: any) {
    return new Promise((resolve, reject) => {
      if (imageFile) {
        let img = new Image();
        img.onload = () => {
          //console.log(img.width+"x"+img.height);
          const imageDimensions = {width: img.width.toString(), height: img.height.toString()}
          resolve(imageDimensions);
        };
  
        let reader = new FileReader();
        reader.onload = (event: any) => {
          img.src = event.target.result;
        }
        reader.readAsDataURL(imageFile);
      }
      else resolve(null);
    });
    
  }

  // addProductImages(product: product) {
  //   return this.db.collection(this.dbRoute+'/productsData/products').doc(product.id).update({imageCount: product.imageCount+1});
  // }

  updateProductImages(product_id: string, images: string[]) {
    return this.db.collection(this.dbRoute+'/productsData/products').doc(product_id).update({images: images});
  }

  //USUARIOS----------------------------------------------------------
  getUser(user_id: string) {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute+'/userData/users').doc(user_id).ref.get().then(res => {
        resolve(res.data());
      }).catch(err => reject(err));
    });
  }

  getUserRealTime(user_id: string) {
    return this.db.collection(this.dbRoute+'/userData/users').doc(user_id).snapshotChanges().pipe(map(user => {
      return user.payload.data() as any;
    }));
  }

  getUsersRealTime() {
    return this.db.collection(this.dbRoute+'/userData/users').snapshotChanges().pipe(map(users => {
      return users.map(user => {
        const userData = user.payload.doc.data() as any;
        return userData as user;
      });
    }));
  }

  getDeliveryUsers() {
    return new Promise((resolve, reject) => {
      this.db.collection(this.dbRoute+'/userData/users').ref.get().then(res => {
        let users = res.docs.map(user => {
          return user.data() as user;
        });
        users = users.filter(user => this.userHasRole("delivery", user) && !this.userHasRole("admin", user));
        resolve(users);
      }).catch(err => reject(err));
    });
  }

  updateUser(user: any) {
    return this.db.collection(this.dbRoute+'/userData/users').doc(user.id).update(user);
  }

  //PEDIDOS----------------------------------------------------------
  // getOrders() {
  //   return new Promise((resolve, reject) => {
  //     this.db.collection(this.dbRoute+'/userOrders/orders', ref => ref
  //     .orderBy('creationDate')).ref.get().then(res => {
  //       var orders = res.docs.map(order => {
  //         const orderData = order.data() as any;
  //         orderData.creationDate = orderData.creationDate.toDate();
  //         return orderData as order;
  //       });
  //       resolve(orders);
  //     }).catch(err => reject(err));
  //   });
  // }

  getOrdersRealTime() {
    return this.db.collection(this.dbRoute+'/userOrders/orders', ref => ref
    .orderBy('creationDate')).snapshotChanges().pipe(map(orders => {
      return orders.map(order => {
        const orderData = order.payload.doc.data() as any;
        orderData.id = order.payload.doc.id;
        orderData.creationDate = orderData.creationDate.toDate();
        orderData.closedDate = orderData.closedDate.toDate();
        return orderData as order;
      });
    }));
  }

  // getUserOrders(user_id: string) {
  //   return new Promise((resolve, reject) => {
  //     this.db.collection(this.dbRoute+'/userOrders/orders', ref => ref
  //     .where("user.id", "==", user_id)).ref.get().then(res => {
  //       var orders = res.docs.map(order => {
  //         const orderData = order.data() as any;
  //         orderData.creationDate = orderData.creationDate.toDate();
  //         return orderData as order;
  //       });
  //       resolve(orders);
  //     }).catch(err => reject(err));
  //   });
  // }

  getUserOrdersRealTime(user_id: string) {
    return this.db.collection(this.dbRoute+'/userOrders/orders', ref => ref
    .where("user.id", "==", user_id)).snapshotChanges().pipe(map(orders => {
      return orders.map(order => {
        const orderData = order.payload.doc.data() as any;
        orderData.id = order.payload.doc.id;
        orderData.creationDate = orderData.creationDate.toDate();
        orderData.closedDate = orderData.closedDate.toDate();
        return orderData as order;
      });
    }));
  }

  getDeliveryOrdersRealTime(delivery_id: string) {
    return this.db.collection(this.dbRoute+'/userOrders/orders', ref => ref
    .where("delivery.id", "==", delivery_id)).snapshotChanges().pipe(map(orders => {
      return orders.map(order => {
        const orderData = order.payload.doc.data() as any;
        orderData.id = order.payload.doc.id;
        orderData.creationDate = orderData.creationDate.toDate();
        orderData.closedDate = orderData.closedDate.toDate();
        return orderData as order;
      });
    }));
  }

  updateOrder(order: order) {
    return this.db.collection(this.dbRoute+'/userOrders/orders').doc(order.id).update(order);
  }

  async createOrder(order: order, userData: user) {
    const rCount = userData.orderCount+1;
    return this.db.collection(this.dbRoute+'/userOrders/orders').add(order).then(() => {
      this.db.collection(this.dbRoute+'/userData/users').doc(order.user.id).update({orderCount: rCount});
    });
  }

  deleteOrder(order: order, validOrder: boolean) {
    return this.db.collection(this.dbRoute+'/userOrders/orders').doc(order.id).delete().then(() => {
      if(validOrder) {
        this.getUser(order.user.id).then(tempUser => {
          const tu = tempUser as any;
          const cancel =  tu.cancel + 1;
          if(order.state === state.accepted) {
            return this.db.collection(this.dbRoute + '/userData/users').doc(tu.id).update({ cancel: cancel });
          }
        });
      }
    });
  }

  createUser(user_id: string, email: string, username?: string) {
    var user = {} as user;
    user.id = user_id;
    user.username = username ? username : "Guest";
    user.roles = ["user"];
    user.phone = "";
    user.address = "";
    user.location = "";
    user.email = email;
    user.cancel = 0;
    user.orderCount = 0;
    //user.orderNumber = 0;
    user.allowOrders = true;
    user.language = language.ES;
    user.notifications = false;
    user.token = "";

    //SE NECESITA REVISION AQUI
    return new Promise((resolve, reject) => {
      this.fcm.getToken().then(token => {
        user.token = token;
        return this.db.collection(this.dbRoute+'/userData/users').doc(user.id).set(user).then(() => {
          resolve(user);
        });
      }).catch(err => {
        return this.db.collection(this.dbRoute+'/userData/users').doc(user.id).set(user).then(() => {
          reject(err)
        });
      });
    });
  }
}