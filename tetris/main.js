// {{{1
// TODO:
// [ ] ランダム
// [ ] 操作性の向上
// [ ] T-Spin
// [ ] スコア
// [ ] タイトルなど

var score = 0;
var counting = {};
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
    [1, 1, 0, 0],// S テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],// Z テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 0],// J テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 0, 1, 0],
    [1, 1, 1, 0],// L テトリミノ
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 1, 0],// T テトリミノ
    [0, 0, 0, 0],
  ]
];
var FIELD_W = 300;
var FIELD_H = 600;
var COLS = 10;
var ROWS = 20;
var BLOCK_W = FIELD_W / COLS;
var BLOCK_H = FIELD_H / ROWS;
//}}}1

var canvas = document.getElementById('main');
var ctx = canvas.getContext('2d');

var current_y, current_x, current_mino, blocks;
var i,j;

// 初期化
blocks = initBlocks();
function initBlocks(){
    var blocks = [];
    for(i=0;i<ROWS+1;i++){
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
setInterval(tick, 500);

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

function line() {
    var i,j,f,k;
    for(i=0;i<ROWS;i++){
        f = true;
        for(j=0;f&&j<COLS;j++){
            if(!blocks[i][j]){ f = false; }
        }
        if(f){
            score += 1;
            $('.score').text(score);
            for(k=i;k>0;k--){
                blocks[k] = blocks[k-1];
            }
            blocks[0] = blocks[ROWS];
            i--;
        }
    }
}

function tick() {
    if (canMove()) {
        current_y++;
    } else {
        // 保存
        for(i=0;i<4;i++){
            for(j=0;j<4;j++){
                blocks[current_y+i] = blocks[current_y+i] || [];
                if(current_mino[i][j]){
                    blocks[current_y+i][current_x+j] = current_mino[i][j];
                }
            }
        }

        // ライン除去
        line();


        // 生成
        current_mino = newMino();
        current_x = 3;
        current_y = 0;

        if(!canMove()){
            // alert('END...');
            blocks = initBlocks();
        }
    }
    render();
}

function newMino() {
    var id;
    if(Object.keys(counting).length==MINOS.length){
        counting = {};
    }
    while(1){
       id = Math.floor(Math.random() * MINOS.length);
       if(!counting[id]){
           break;
       }
    }
    counting[id] = true;
    console.debug(counting);

    var t = $('.count li').eq(id).find('span').text();
    $('.count li').eq(id).find('span').text(Number(t)+1);

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
    var mino = r || current_mino;
    var next_x = current_x + dx; // 次に動こうとするx座標
    var next_y = current_y + dy; // 次に動こうとするy座標
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
            if (mino[y][x]) {
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

function rotate1(){
    var x,y,i,j,rtn;
    rtn = [];
    for(i=0;i<4;i++){
        x = 3-i;
        for(j=0;j<4;j++){
            y = j;
            rtn[y] = rtn[y] || [0,0,0,0];
            rtn[y][x] = current_mino[i][j];
        }
    }
    return rtn;
}
function rotate2(){
    var x,y,i,j,rtn;
    rtn = [];
    for(i=0;i<4;i++){
        x = i;
        for(j=0;j<4;j++){
            y = 3-j;
            rtn[y] = rtn[y] || [0,0,0,0];
            rtn[y][x] = current_mino[i][j];
        }
    }
    return rtn;
}

function quickDrop(){
    var i;
    for(i=0;canMove(0,i) && i<ROWS;i++){
    }
    current_y+=i-1;
    tick();
}

document.body.onkeydown = function(e) {
    // console.debug(e.keyCode);
    var x,y,r;
    x = 0;
    y = 0;
    switch(e.keyCode) {
        case 37: canMove(-1,0) && current_x--; break; // left
        case 39: canMove( 1,0) && current_x++; break; // right
        case 40: canMove( 0,1) && current_y++; break; // bottom
        case 88: canMove(0,0,r=rotate1()) && (current_mino = r); break; // x
        case 90: canMove(0,0,r=rotate2()) && (current_mino = r); break; // z
        case 32: quickDrop(); break;
    }
    render();
}
