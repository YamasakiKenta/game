var hold = -1;
var gost_y = 0;
var score = 0;
var counting = {};
var canvas = document.getElementById('main');
var ctx = canvas.getContext('2d');
var current_y, current_x, current_mino, blocks, current_mino_id, current_rotate;

// 初期化
blocks = initBlocks();
function initBlocks(){
    var i,j;
    var blocks = [];
    for(i=0;i<ROWS+1;i++){
        blocks.push([]);
        for(j=0;j<COLS;j++){
            blocks[i].push(0);
        }
    }
    return blocks;
}

newMino();
render();

function render(){

    setGost();

    ctx.clearRect(0,0,FIELD_W+300, FIELD_H);

    var x,y,i;
    for(i=0;i<ROWS;i++){
        for(j=0;j<COLS;j++){
            y = BLOCK_H * i;
            x = BLOCK_W * j;
            ctx.fillStyle = '#999';
            ctx.fillRect(x,y,BLOCK_W-1, BLOCK_H-1);

            if(blocks[i][j]){
                // ctx.StrokeStyle = 'black';
                // ctx.strokeRect(x,y,BLOCK_W-1, BLOCK_H-1);

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

                // ctx.StrokeStyle = 'black';
                // ctx.strokeRect(x,y,BLOCK_W-1, BLOCK_H-1);

                gy = BLOCK_H * (gost_y + i);
                ctx.fillStyle = 'black';
                ctx.fillRect(x,gy,BLOCK_W-1, BLOCK_H-1);

                ctx.fillStyle = COLORS[current_mino[i][j]-1];
                ctx.fillRect(x,y,BLOCK_W-1, BLOCK_H-1);

            }
        }
    }

    var tmp = MINOS[hold] || [];
    for(i=0;i<4;i++){
        for(j=0;tmp[i]&&j<4;j++){
            if(tmp[i][j]){
                y = BLOCK_H * i;
                x = BLOCK_W * j + 300 + BLOCK_W;
                // ctx.strokeRect(x,y,BLOCK_W-1, BLOCK_H-1);

                ctx.fillStyle = COLORS[tmp[i][j]-1];
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

function nextTick(){
    clearTimeout(nextTickEventID)
    nextTickEventID = -1;
    
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
    newMino();

    if(!canMove()){
        // alert('END...');
        canMove();
        blocks = initBlocks();
    }
}


var nextTickEventID = -1;
function tick() {
    if (canMove()) {
        current_y++;
    } else {
        if(nextTickEventID<0){
            nextTickEventID = setTimeout(nextTick, 1000);
        }
    }
    render();
}

var intervalID;
function newMino(id) {

    clearInterval(intervalID)

    var id = id || null;
    if(!id){
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
    }

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

    current_mino_id = id;
    current_rotate = 0;
    current_x = 3;
    current_y = 0;
    current_mino = mino;

    intervalID = setInterval(tick, 500);
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

function rotate(isR){
    var x,y,i,j,rtn,d;
    rtn = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    if(current_mino_id==1){ return current_mino; }
    d = (current_mino_id==0)?3:2;
    nr = (current_rotate+(isR?5:3))%4;

    // 回転
    for(i=0;i<d+1;i++){
        x = (isR?d-i:i);
        for(j=0;j<d+1;j++){
            y = (isR?j:d-j);
            rtn[y][x] = current_mino[i][j];
        }
    }

    var l,tbl;
    tbl = (current_mino_id==0)?gRotationRuleI:gRotationRuleGeneral;

    tbl_dx = tbl.dx[(isR?0:1)][nr];
    tbl_dy = tbl.dy[(isR?0:1)][nr];
    l=tbl_dx.length;

    // 判定
    var dx,dy;
    for(i=0;i<l;i++){
        dx = tbl_dx[i];
        dy = tbl_dy[i];
        if(canMove(dx,dy,rtn)){
            current_x += dx;
            current_y += dy;
            current_mino = rtn;
            current_rotate = nr;
            break;
        };
    }
}

function quickDrop(){
    var i;
    for(i=0;canMove(0,i) && i<ROWS;i++){
    }
    current_y+=i-1;
    console.debug('# quick');
    nextTick();
}

function setHold(){
    // 最初のみ
    if(hold<0){
        hold = current_mino_id;
        newMino();
    }
    else {
        tmp = current_mino_id;
        newMino(hold);
        hold = tmp;
    }
}

document.body.onkeydown = function(e) {
    // console.debug(e.keyCode);
    var x,y,r;
    x = 0;
    y = 0;
    switch(e.keyCode) {
        case 16: setHold(); break; // space
        case 37: canMove(-1,0) && current_x--; break; // left
        case 39: canMove( 1,0) && current_x++; break; // right
        case 40: canMove( 0,1) && current_y++; break; // bottom
        case 88: rotate(true);  break; // x
        case 90: rotate(false); break; // z
        case 32: quickDrop(); break;
    }

    render();
}

function setGost(){
    var i;
    for(i=0;canMove(0,i) && i<ROWS;i++){
    }
    gost_y = current_y+i-1;
}

