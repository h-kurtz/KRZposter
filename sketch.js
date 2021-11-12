//———————————————————————————————————————————————————————————————————————————
// Global variables!
//———————————————————————————————————————————————————————————————————————————

let vanPointX = 620;
let vanPointY = 366;

let roadImg;
let signImg;

// frame rate
let fr = 60;

let maxSpeed = 0.2;
let acceleration = 0.25;

let speed = 0;
let distance = 0;

//———————————————————————————————————————————————————————————————————————————
// 
//———————————————————————————————————————————————————————————————————————————
function preload() {
  roadImg = loadImage("assets/road-1.png");
  signImg = loadImage("assets/sign.png");
  postImg = loadImage("assets/post1.png");
  lineImg = loadImage("assets/line.png");
  truckImg = loadImage("assets/truck.png");
  titleImg = loadImage("assets/title.png");
}

function setup() {
  createCanvas(600, 800);
  frameRate(fr);
  
  //sign = new PerspectiveObject(signImg, 330);
  signGroup = new PerspectiveGroup([signImg], 505, 0.33, 0.9);
  signGroup.start();
  
  lineGroup = new PerspectiveGroup([lineImg], 607, 0.2);
  lineGroup.start();
  
  postGroup = new PerspectiveGroup([postImg], 850, 1.1, 1.1);
  postGroup.start();
}

function draw() {
  background(13, 60, 90);

  image(titleImg, 15, 10);
  
  getInput();
  distance += speed / fr;
  
  signGroup.update();
  
  image(roadImg, vanPointX - roadImg.width, vanPointY);
  
  lineGroup.update();
  
  image(truckImg, 70, 415);
  
  postGroup.update();
}

//———————————————————————————————————————————————————————————————————————————
// Inputs!
//———————————————————————————————————————————————————————————————————————————
function getInput() {
  if (keyIsDown(UP_ARROW)) {
    if (speed < maxSpeed) {
      speed += acceleration / fr;
    }
  } else {
    if (speed > 0) {
      speed -= acceleration / fr;
    } else speed = 0;
  }
}

//———————————————————————————————————————————————————————————————————————————
// Perspective Group!
//———————————————————————————————————————————————————————————————————————————
class PerspectiveGroup {
  constructor (images, endY, interval, speedMult = 1) {
    this.images = images;
    this.endY = endY;
    this.interval = interval;
    this.speedMult = speedMult;
    
    this.lastPlaced = 0;
    
    this.objects = [];
  }
  
  start() {
    let dis = 0;
    while (dis <= 1) {
      let obj = this.createObject();
      obj.progress = dis;
      this.objects.push(obj);
      
      dis += this.interval;
    }
  }
  
  update() {
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].move();
      this.objects[i].display();
    }
    
    if (distance > this.lastPlaced + this.interval) {
      this.lastPlaced = distance;
      this.objects.push(this.createObject())
    }
  }
  
  createObject() {
    return new PerspectiveObject(this.images[Math.floor(Math.random()*this.images.length)], this.endY, this.speedMult, this);
  }
  
  destroyFirst() {
    let obj = this.objects.shift();
  }
}

//———————————————————————————————————————————————————————————————————————————
// Perspective Object!
//———————————————————————————————————————————————————————————————————————————
class PerspectiveObject {
  constructor (image, endY, speedMult = 1, group = null) {
    this.image = image;
    
    this.x = vanPointX;
    this.y = vanPointY;
    
    this.endX = 0;
    this.endY = endY;
    
    this.progress = 0;
    this.expProg = 0;
    
    this.speedMult = speedMult;
    
    this.group = group;
  }
  
  move() {
    this.progress += this.speedMult * speed / fr; 
    this.expProg = Math.pow(this.progress, 3);
    
    this.x = ((this.endX - vanPointX) * this.expProg) + vanPointX;
    this.y = ((this.endY - vanPointY) * this.expProg) + vanPointY - (this.image.height * this.expProg);
    
    if(this.x < -this.image.width * this.expProg) {
      if (this.group != null) {
        //this.group.destroyFirst();
      }
    }
  }
  
  display() {
    image(this.image, this.x, this.y, this.image.width * this.expProg, this.image.height * this.expProg);
  }
}