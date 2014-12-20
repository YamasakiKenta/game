var COLORS = ["cyan", "yellow", "green", "red", "blue", "orange", "magenta"];
var MINOS = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0], // I テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],// O テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 1, 0, 0], // S テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0], // Z テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 0], // J テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 0, 1, 0],
    [1, 1, 1, 0], // L テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 1, 0], // T テトリミノ
    [0, 0, 0, 0],
  ]
];
var FIELD_W = 300;
var FIELD_H = 600;
var COLS = 10;
var ROWS = 20;
var BLOCK_W = FIELD_W / COLS;
var BLOCK_H = FIELD_H / ROWS;
var canvas = document.getElementById('main');
var ctx = canvas.getContext('2d');

var current_y, current_x, current_mino, blocks;
var i,j;

// 初期化
blocks = initBlocks();
function initBlocks(){
    var blocks = [];
    for(i=0;i<ROWS;i++){
        blocks.push([]);
        for(j=0;j<COLS;j++){
            blocks[i].push(false);
        }
    }
    return blocks;
}

current_y = 0;
current_x = 0;

current_mino = newMino();
render();
setInterval(tick, 100);

function render(){
    ctx.clearRect(0,0,FIELD_W, FIELD_H);
    ctx.StrokeStyle = 'black';

    var x,y,i;
    for(i=0;i<ROWS;i++){
        for(j=0;j<COLS;j++){
            if(blocks[i][j]){
                y = BLOCK_H * i;
                x = BLOCK_W * j;
                ctx.strokeRect(x,y,BLOCK_W-1, BLOCK_H-1);

                ctx.fillStyle = COLORS[blocks[i][j]-1];
                ctx.fillRect(x,y,BLOCK_W-1, BLOCK_H-1);
            }
        }
    }

    for(i=0;i<4;i++){
        for(j=0;j<4;j++){
            if(current_mino[i][j]){
                y = BLOCK_H * (current_y + i);
                x = BLOCK_W * (current_x + j);
                ctx.strokeRect(x,y,BLOCK_W-1, BLOCK_H-1);

                ctx.fillStyle = COLORS[current_mino[i][j]-1];
                ctx.fillRect(x,y,BLOCK_W-1, BLOCK_H-1);
            }
        }
    }
}

function tick() {
    var i,j,k,f;
  if (canMove()) {
    current_y++;
  } else {

    // 保存
    for(i=0;i<4;i++){
        for(j=0;j<4;j++){
            if(current_mino[i][j]){
                blocks[current_y+i][current_x+j] = current_mino[i][j];
            }
        }
    }

    // 消去
    for(i=0;i<ROWS;i++){
        f = true;
        for(j=0;f&&j<COLS;j++){
            f = blocks[i][j];
        }

        for(k=i;f&&k;k--){
            blocks[k] = blocks[k-1];
            i--;
        }
    }

    // 生成
    current_mino = newMino();
    current_x = 3;
    current_y = 0;

    if(!canMove()){
        blocks = initBlocks();
    }
  }
  render();
}

function newMino() {
    var id = Math.floor(Math.random() * MINOS.length);
    var mino = MINOS[id];
    var i,j;
    for(i=0;i<4;i++){
        for(j=0;j<4;j++){
            if(mino[i][j]){
                mino[i][j] = id+1;
            }
        }
    }
    return mino;
}

function canMove(dx,dy,r) {
  var dx = dx || 0;
  var dy = dy===0 ? dy : dy || 1;
  var next_x = current_x + dx; // 次に動こうとするx座標
  var next_y = current_y + dy; // 次に動こうとするy座標
  var r = r||current_mino;
  for (var y = 0; y < 4; y++) {
    for (var x = 0; x < 4; x++) {
      if (r[y][x]) {
        // 下の枠を超えていたら
        if (next_y + y >= ROWS) { 
          return false;
        }
        if(next_x + x < 0) {
            return false;
        }

        if(next_x + x >= COLS) {
            return false;
        }

        if(blocks[next_y + y][next_x + x]){
            return false;
        }
      }
    }
  }
  return true;
}

function getRotate(t){
    var i,j,x,y,r;
    var t = t || false;
    r = [];
    for(i=0;i<4;i++){
        r[i] = r[i] || [];
        for(j=0;j<4;j++){
            y =  t ? 3-j:j;
            x = !t ? 3-i:i;
            r[i][j] = current_mino[y][x];
        }
    }
    return r;
}

document.body.onkeydown = function(e) { 
    var r;
    console.debug(e.keyCode);
    switch(e.keyCode) {
        case 37: if(canMove(-1, 0)) current_x+=-1; break;
        case 39: if(canMove( 1, 0)) current_x+=1; break;
        case 40: if(canMove( 0, 1)) current_y+=1; break;
        case 90: if(canMove(0,0,r=getRotate(true))) current_mino=r; break;
        case 88: if(canMove(0,0,r=getRotate(false))) current_mino=r; break;
    }
    render();
}
