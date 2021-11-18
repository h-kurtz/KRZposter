//———————————————————————————————————————————————————————————————————————————
// Global variables!
//———————————————————————————————————————————————————————————————————————————

// vanishing point for perspective objects
let vanPointX = 620;
let vanPointY = 366;

let roadImg, signImg, lineImg, truckImg, titleImg;
let post1Img, post2Img, post3Img;
let ground1Img, ground2Img, ground3Img;
let hill1Img, hill2Img, hill3Img, hill4Img;

let barImg;

// frame rate
let fr = 30;

let maxSpeed = 0.2;
let acceleration = 0.1;

let speed = 0;
let distance = 0;

let reverb;

let shDistance = 5;

//———————————————————————————————————————————————————————————————————————————
// 
//———————————————————————————————————————————————————————————————————————————
function preload() {
  roadImg = loadImage("assets/road.png");
  signImg = loadImage("assets/sign.png");
  lineImg = loadImage("assets/line.png");
  truckImg = loadImage("assets/truck.png");

  barImg = loadImage("assets/bar.png");

  title1Img = loadImage("assets/title1.png");
  title2Img = loadImage("assets/title2.png");

  post1Img = loadImage("assets/post1.png");
  post2Img = loadImage("assets/post2.png");
  post3Img = loadImage("assets/post3.png");

  ground1Img = loadImage("assets/ground1.png");
  ground2Img = loadImage("assets/ground2.png");
  ground3Img = loadImage("assets/ground3.png");

  hill1Img = loadImage("assets/hill1.png");
  hill2Img = loadImage("assets/hill2.png");
  hill3Img = loadImage("assets/hill3.png");
  hill4Img = loadImage("assets/hill4.png");

  soundFormats("mp3");
  engineStartSFX = loadSound("audio/engineStart.mp3");
  engineLoopSFX  = loadSound("audio/engineLoop.mp3");
  engineStopSFX  = loadSound("audio/engineStop.mp3");

  musicPad  = loadSound("audio/musicPad.mp3");
  musicSH   = loadSound("audio/musicSH.mp3");
  musicDrum = loadSound("audio/musicDrums.mp3");
}

function setup() {
  createCanvas(600, 800);
  frameRate(fr);
  
  //sign = new PerspectiveObject(signImg, 330);
  signGroup = new PerspectiveGroup([signImg], 505, 1.5, 0.66);
  signGroup.start();
  
  lineGroup = new PerspectiveGroup([lineImg], 607, 0.2);
  lineGroup.start();
  
  postGroup = new PerspectiveGroup([post1Img, post2Img, post3Img],
    875, 1.1, 1.1);
  postGroup.start();

  groundGroup = new PerspectiveGroup(
    [ground1Img, ground2Img, ground3Img], 
    500, 0.2, 0.4);
  groundGroup.start();

  hillGroup = new PerspectiveGroup(
    [hill1Img, hill2Img, hill3Img, hill4Img],
    510, 0.2, 0.2);
  hillGroup.start();

  bar = new PerspectiveObject(barImg, 440, 0.4);
  bar.progress = -2.2;


  // Audio mixing
  reverb = new p5.Reverb();
  reverb.amp(0.5);
  reverb.process(engineLoopSFX, 1, 2);

  musicPad.loop();
  musicPad.amp(0);
  musicSH.loop();
  musicSH.amp(0);
  musicDrum.loop();
  musicDrum.amp(0);
  musicDrum.pan(1);

  engineStartSFX.amp(0.5);
  engineLoopSFX.amp(0.5);
  engineStopSFX.amp(0.5);
}

function draw() {
  background(0, 51, 51);

  hillGroup.update();

  groundGroup.update();

  var title1Move = constrain(distance - 0.5, 0, 1) - 1;
  image(title1Img, -30, -15 + (200 * title1Move));

  var title2Move = constrain(distance - 0.5, 0, 1) - 1;
  image(title2Img, 146 - (500 * title2Move), 114);
  
  getInput();
  distance += speed / fr;

  bar.move();
  bar.display();
  musicDrum.pan(1 - bar.progress);
  var barAmp = (2 * bar.progress) - 1;
  if (barAmp >= 1) {
    barAmp = constrain(2 - barAmp, 0, 1);
  }
  musicDrum.amp(constrain(barAmp, 0, 1));
  
  signGroup.update();
  
  image(roadImg, vanPointX - roadImg.width, vanPointY);
  
  lineGroup.update();
  
  if (speed > 0) {
    var xOff = 8 * Math.sin(distance * 6.6) * speed/maxSpeed;
    image(truckImg, 66 + xOff, 415 - (Math.floor(random(0, 1.05 )* 2)));
  } 
  else {
    image(truckImg, 66, 415);
  }
  
  postGroup.update();


  musicPad.amp(speed/maxSpeed);
  var shVol = constrain(distance/shDistance - 1, 0, 1)
  musicSH.amp(shVol);
}

//———————————————————————————————————————————————————————————————————————————
// Inputs!
//———————————————————————————————————————————————————————————————————————————
function getInput() {

  if (keyIsDown(UP_ARROW)) {
    if (speed == 0) {
      engineStartSFX.play();
      engineLoopSFX.loop();
      speed += acceleration / fr;
    }
    else if (speed < maxSpeed) {
      if (!engineStartSFX.isPlaying() && !engineLoopSFX.isPlaying()) {
        engineLoopSFX.loop();
      }
      speed += acceleration / fr;
    }
  } else {
    if (speed > 0) {
      if (engineLoopSFX.isPlaying()) {
        engineLoopSFX.pause();
        if(!engineStopSFX.isPlaying()) {
          engineStopSFX.play();
        }
      }
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
    while (dis <= 1.2) {
      let obj = this.createObject();
      obj.progress = dis;
      this.objects.push(obj);
      
      dis += this.interval * this.speedMult;
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
    return new PerspectiveObject(
      this.images[Math.floor(Math.random()*this.images.length)], 
      this.endY, this.speedMult, this);
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
    this.y = ((this.endY - vanPointY) * this.expProg) + vanPointY -
      (this.image.height * this.expProg);
    
    if(this.x < -this.image.width * this.expProg) {
      if (this.group != null) {
        //this.group.destroyFirst();
      }
    }
  }
  
  display() {
    image(this.image, this.x, this.y, this.image.width * this.expProg, 
      this.image.height * this.expProg);
  }
}