var socket;
const r1 = 30;
const r2 = r1;
let team = 0;
let players0 = [];
let players1 = [];
let isMoving = false;
const courtW = 600;
const courtH = 800;
const buttonW = 50;
const buttonH = 50;
const unityX = 36;
const unityY = -55;

function setup() {
  createCanvas(courtW+buttonW, courtH);
  socket = io.connect('http://localhost:8080');
  append(players0, new Player(courtW/2,courtH/2,0,0,true));
}

function draw() {
  drawCourt();
  drawPlayser(players0);
  drawPlayser(players1);
}

function drawCourt(){
  background(220);
  //ボタン  
  fill(255,0,0);
  rect(courtW,0,buttonW,buttonH);
  fill(0,0,255);
  rect(courtW,buttonH,buttonW,buttonH);
  //コート
  fill(0,150,0);
  noStroke();
  rect(0,0,600,800);
  stroke(255);
  strokeWeight(2);
  noFill();
  rect(25,25,550,375);
  rect(25,25,550,750);
  ellipse(300,400,140);
  rect(240,25,120,60);
  rect(175,25,250,150);
  arc(300, 175, 100, 50, 0, PI);
  rect(240,715,120,60);
  rect(175,625,250,150);
  arc(300, 625, 100, 50, PI, 0);
}

function mouseClicked(){
  if((600<mouseX)&&(mouseX<700)&&(0<mouseY)&&(mouseY<50)){
    team = 0;
  } else if ((600<mouseX)&&(mouseX<700)&&(50<mouseY)&&(mouseY<100)){
    team = 1;
  } else {
    if (isMoving) { //移動終了
      isMoving = false;
    } else { //新規追加
      if (team == 0){
        id = players0.length + 1;
        append(players0, new Player(mouseX,mouseY,team,id));
      } else {
        id = players1.length + 1;
        append(players1, new Player(mouseX,mouseY,team,id));
      }
    }
  }
}

function drawPlayser(ps){
  if (ps.length > 0){
    for (i=0;i<ps.length;i++){
      if(mouseIsPressed){
        ps[i].move();
      }
      ps[i].draw();
    }
  }
}

class Player{
  constructor(x0,y0,t,i,iv=false){
    this.team = t;
    this.isView = iv;
    this.id = i;
    this.setPos(x0,y0);
    this.sendPos();
  }
  draw(){
    if (this.isView){
      fill(255,255,0);
    } else if (this.team == 0){
      fill(255,0,0);
    } else {
      fill(0,0,255);
    }
    circle(this.mx,this.my,r1);
  }
  move(){
     if((this.mx-r2<mouseX)&&(mouseX<this.mx+r2)&&(this.my-r2<mouseY)&&(mouseY<this.my+r2)){
        isMoving = true;
        this.setPos(mouseX,mouseY);
        this.sendPos();
    }
  }
  setView(is){
    this.isView = is;
  }
  setPos(mx0,my0){
    this.mx = mx0;
    this.my = my0;
    this.x = (unityX/50)*(100*this.mx/courtW-50);
    this.y = (unityY/50)*(100*this.my/courtH-50);
  }
  sendPos(){
    var data = {
      id: this.id,
      team: this.team,
      x: this.x,
      y: this.y
    };
    socket.emit('move',data);
  }
}
  
  
  
  
  