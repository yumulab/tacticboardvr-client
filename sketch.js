var socket;
const r1 = 30;
const r2 = r1;
let team = 0;
let players0 = [];
let players1 = [];
let isMoving = false;
//const courtW = 600;
//const courtH = 800;
const scale = 12;
const courtW = 68*scale;
const courtH = 105*scale;
const courtM = 40;
const buttonW = 164;
const buttonH = courtH/2;
const goalW = 18.32*scale;
const goalH = 5.5*scale;
const penaW = 40.32*scale;
const penaH = 16.5*scale;
const penaP = 11*scale;
const centerR = 2*9.15*scale;
const penaR = centerR;

const unityX = 36;
const unityY = -55;

const ioServer = 'http://127.0.0.1:8080'; // ブラウザでアクセスするURLと同じにする

// スクロールしないようにする ここから
function disableScroll(event) {
  event.preventDefault();
}
document.addEventListener('touchmove', disableScroll, { passive: false });
// ここまで

function setup() {
  createCanvas(courtW+buttonW, courtH);
  socket = io.connect(ioServer);
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
  fill(0,0,255);
  rect(courtW,0,buttonW,buttonH);
  fill(255,0,0);
  rect(courtW,buttonH,buttonW,buttonH);
  //コート
  fill(0,150,0);
  noStroke();
  rect(0,0,courtW,courtH);
  stroke(255);
  strokeWeight(2);
  noFill();
  rect(courtM,courtM,courtW-2*courtM,courtH/2-courtM); //枠(上半分)
  rect(courtM,courtH/2,courtW-2*courtM,courtH/2-courtM); //枠(下半分)
  ellipse(courtW/2,courtH/2,centerR); //センターサークル
  ellipse(courtW/2,courtH/2,2); //上ペナルティポイント
  rect(courtW/2-goalW/2,courtM,goalW,goalH); //上ゴールエリア
  rect(courtW/2-penaW/2,courtM,penaW,penaH); //上ペナルティエリア
  ellipse(courtW/2,courtM+penaP,2); //上ペナルティポイント
  arc(courtW/2,courtM+penaP,penaR,penaR,PI*0.205,PI*0.795); //上ペナルティアーク
  rect(courtW/2-goalW/2,courtH-goalH-courtM,goalW,goalH); //下ゴールエリア
  rect(courtW/2-penaW/2,courtH-penaH-courtM,penaW,penaH); //下ペナルティエリア
  ellipse(courtW/2,courtH-courtM-penaP,2); //下ペナルティポイント
  arc(courtW/2,courtH-courtM-penaP,penaR,penaR,PI*1.205,PI*1.795); //下ペナルティアーク
}

function touchStarted(){
  if((courtW<mouseX)&&(mouseX<courtW+buttonW)&&(0<mouseY)&&(mouseY<buttonH)){
    team = 1;
  } else if ((courtW<mouseX)&&(mouseX<courtW+buttonW)&&(buttonH<mouseY)&&(mouseY<12*buttonH)){
    team = 0;
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


/*
function mouseClicked(){
  if((courtW<mouseX)&&(mouseX<courtW+buttonW)&&(0<mouseY)&&(mouseY<buttonH)){
    team = 1;
  } else if ((courtW<mouseX)&&(mouseX<courtW+buttonW)&&(buttonH<mouseY)&&(mouseY<12*buttonH)){
    team = 0;
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
*/
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
