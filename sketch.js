const r1 = 30;
const r2 = r1;
let team = 'A';
let players = [];
let isMoving = false;

function setup() {
  createCanvas(700, 800);

}

function draw() {
  drawCourt();
  if (players.length > 0){
    for (i=0;i<players.length;i++){
      if(mouseIsPressed){
        players[i].move();
      }
      players[i].draw();
    }
    console.log(i);
  }
}

function drawCourt(){
  background(220);
  //右上  
  fill(255,0,0);
  rect(600,0,100,50);
  fill(0,0,255);
  rect(600,50,100,50);
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
    team = 'A';
  } else if ((600<mouseX)&&(mouseX<700)&&(50<mouseY)&&(mouseY<100)){
    team = 'B';
  } else {
    if (isMoving) {
      isMoving = false;
    } else {
      append(players, new Player(mouseX,mouseY));
    }
  }
}

class Player{
constructor(x0,y0){
    this.x = x0;
    this.y = y0;
    this.team = team;
  }
  draw(){
    if (this.team == 'A'){
      fill(255,0,0);
    } else {
      fill(0,0,255);
    }
    circle(this.x,this.y,r1);
  }
  move(){
     if((this.x-r2<mouseX)&&(mouseX<this.x+r2)&&(this.y-r2<mouseY)&&(mouseY<this.y+r2)){
        this.x = mouseX;
        this.y = mouseY;
        isMoving = true;
    }
  }
}
  
  
  
  
  