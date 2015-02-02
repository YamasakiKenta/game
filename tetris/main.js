// var ctx = document.getElementById('main').getContext('2d');
var ctx = $('#main').get(0).getContext('2d');

var Util = {
    setTimeout: function(self, func, time){
        return setTimeout(function(){
            func.call(self);
        }, time);
    }, setInterval: function(self, func, time){
        return setInterval(function(){
            func.call(self);
        }, time);
    }
}

var title = {
    render: function(){
        ctx.clearRect(0,0,FIELD_W, FIELD_H);
        ctx.font = "18px 'ＭＳ Ｐゴシック'";
        ctx.fillStyle = 'black';
        ctx.fillText("Tetris", 10, 25);
    },
    input: function(){
        game.state(main); 
    }
};
var main = {
    _initBlocks: function(){
        var i,j;
        var blocks = [];
        for(i=0;i<ROWS+1;i++){
            blocks.push([]);
            for(j=0;j<COLS;j++){
                blocks[i].push(0);
            }
        }
        return blocks;
    },
    constructor: function(){
        this.hold = -1;
        this.gost_y = 0;
        this.score = 0;
        this.counting = {};
        this.current_y = 0;
        this.current_x = 0;
        this.current_mino = 0;
        this.blocks = 0;
        this.current_mino_id = 0;
        this.current_rotate = 0;

        // 初期化
        this.blocks = this._initBlocks();
        this.newMino();
    },

    _drawBlock: function(x,y,color){
        if(color){
            ctx.fillStyle = color;
        }
        ctx.fillRect(x,y,BLOCK_W-1, BLOCK_H-1);
    },
    render: function(){

        this.setGost();

        ctx.clearRect(0,0, BLOCK_W*COLS, FIELD_H);

        var x,y,i;
        for(i=0;i<ROWS;i++){
            for(j=0;j<COLS;j++){
                y = BLOCK_H * i;
                x = BLOCK_W * j;
                this._drawBlock(x,y,'#999');

                if(this.blocks[i][j]){
                    this._drawBlock(x,y,COLORS[this.blocks[i][j]-1]);
                }
            }
        }

        for(i=0;i<4;i++){
            for(j=0;j<4;j++){
                if(this.current_mino[i][j]){
                    x  = BLOCK_W * (this.current_x + j);
                    y  = BLOCK_H * (this.current_y + i);
                    gy = BLOCK_H * (this.gost_y + i);

                    this._drawBlock(x,gy,'black');
                    this._drawBlock(x,y,COLORS[this.current_mino[i][j]-1]);

                }
            }
        }

        var tmp = MINOS[this.hold] || [];
        for(i=0;i<4;i++){
            for(j=0;tmp[i]&&j<4;j++){
                if(tmp[i][j]){
                    y = BLOCK_H * (i+1);
                    x = BLOCK_W * (j+1) + BLOCK_W*COLS + BLOCK_W;

                    this._drawBlock(x,y,COLORS[tmp[i][j]-1]);

                }
            }
        }
    },

    _line: function(){
        var i,j,f,k;
        for(i=0;i<ROWS;i++){
            f = true;
            for(j=0;f&&j<COLS;j++){
                if(!this.blocks[i][j]){ f = false; }
            }
            if(f){
                this.score += 1;
                $('.score').text(this.score);
                for(k=i;k>0;k--){
                    this.blocks[k] = this.blocks[k-1];
                }
                this.blocks[0] = this.blocks[ROWS];
                i--;
            }
        }
    },

    _nextTick: function(){
        clearTimeout(this.nextTickEventID)
        this.nextTickEventID = -1;

        // 保存
        for(i=0;i<4;i++){
            for(j=0;j<4;j++){
                this.blocks[this.current_y+i] = this.blocks[this.current_y+i] || [];
                if(this.current_mino[i][j]){
                    this.blocks[this.current_y+i][this.current_x+j] = this.current_mino[i][j];
                }
            }
        }

        // ライン除去
        this._line();


        // 生成
        this.newMino();

        if(!this.canMove()){
            game.state(title);
            this.canMove();
            this.blocks = this._initBlocks();
        }
    },

    tick: function() {
        if (this.canMove()) {
            this.current_y++;
        } else {
            if(this.nextTickEventID<0){
                this.nextTickEventID = Util.setTimeout(this, this._nextTick, 1000);
            }
        }
    },

    newMino: function(id) {
        var id = id || null;
        if(!id){
            if(Object.keys(this.counting).length==MINOS.length){
                this.counting = {};
            }
            while(1){
                id = Math.floor(Math.random() * MINOS.length);
                if(!this.counting[id]){
                    break;
                }
            }
            this.counting[id] = true;
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

        this.current_mino_id = id;
        this.current_rotate = 0;
        this.current_x = 3;
        this.current_y = 0;
        this.current_mino = mino;
    },

    canMove: function(dx,dy,r) {
        var dx = dx || 0;
        var dy = dy===0 ? dy : dy || 1;
        var mino = r || this.current_mino;
        var next_x = this.current_x + dx; // 次に動こうとするx座標
        var next_y = this.current_y + dy; // 次に動こうとするy座標
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

                    if(this.blocks[next_y + y][next_x + x]){
                        return false;
                    }
                }
            }
        }
        return true;
    },

    rotate: function(isR){
        var x,y,i,j,rtn,d;
        rtn = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        if(this.current_mino_id==1){ return this.current_mino; }
        d = (this.current_mino_id==0)?3:2;
        nr = (this.current_rotate+(isR?5:3))%4;

        // 回転
        for(i=0;i<d+1;i++){
            x = (isR?d-i:i);
            for(j=0;j<d+1;j++){
                y = (isR?j:d-j);
                rtn[y][x] = this.current_mino[i][j];
            }
        }

        var l,tbl;
        tbl = (this.current_mino_id==0)?gRotationRuleI:gRotationRuleGeneral;

        tbl_dx = tbl.dx[(isR?0:1)][nr];
        tbl_dy = tbl.dy[(isR?0:1)][nr];
        l=tbl_dx.length;

        // 判定
        var dx,dy;
        for(i=0;i<l;i++){
            dx = tbl_dx[i];
            dy = tbl_dy[i];
            if(this.canMove(dx,dy,rtn)){
                this.current_x += dx;
                this.current_y += dy;
                this.current_mino = rtn;
                this.current_rotate = nr;
                break;
            };
        }
    },

    quickDrop: function(){
        var i;
        for(i=0;this.canMove(0,i) && i<ROWS;i++){
        }
        this.current_y+=i-1;
        this._nextTick();
    },

    setHold: function(){
        // 最初のみ
        if(this.hold<0){
            this.hold = this.current_mino_id;
            this.newMino();
        }
        else {
            tmp = this.current_mino_id;
            this.newMino(this.hold);
            this.hold = tmp;
        }
    },

    input: function(code) {
        var x,y,r;
        x = 0;
        y = 0;
        switch(code) {
            case 16: this.setHold(); break; // space
            case 37: this.canMove(-1,0) && this.current_x--; break; // left
            case 39: this.canMove( 1,0) && this.current_x++; break; // right
            case 40: this.canMove( 0,1) && this.current_y++; break; // bottom
            case 88: this.rotate(true);  break; // x
            case 90: this.rotate(false); break; // z
            case 32: this.quickDrop(); break;
        }
    },

    input: function(code) {
        var x,y,r;
        x = 0;
        y = 0;
        switch(code) {
            case 'hold'   : this.setHold(); break; // space
            case 'left'   : this.canMove(-1,0) && this.current_x--; break; // left
            case 'right'  : this.canMove( 1,0) && this.current_x++; break; // right
            case 'down'   : this.canMove( 0,1) && this.current_y++; break; // bottom
            case 'spin-l' : this.rotate(false); break; // z
            case 'spin-r' : this.rotate(true);  break; // x
            case 'drop'   : this.quickDrop(); break;
        }
    },

    setGost: function(){
        var i;
        for(i=0;this.canMove(0,i) && i<ROWS;i++){
        }
        this.gost_y = this.current_y+i-1;
    },
    destructor: function(){
        clearTimeout(this.nextTickEventID);
    }

};

window.Game = function(){
    this._state = {};
    this._old = {};
    this._def = {
        constructor: function(){},
        destructor: function(){},
        tick: function(){},
        render: function(){},
        input: function(){},
    }
    this._now = this._def;
}
Game.prototype = {
    state: function(val){
        this._old = this._now;
        this._now = val;

        for(k in this._def){
            this._now[k] = this._now[k] || this._def[k];
        }

        // 開始
        this._old.destructor();
        this._now.constructor();

        // タイマー
        Util.setInterval(this, this._tick, 500);

        // キー
        var self = this;
        document.body.onkeydown = function(e){
            self._input.call(self,e);
        };

        return this;
    },
    _input: function(e) {
        var code = '';
        switch(e.keyCode) {
            case 16: code='hold'   ; break ; 
            case 37: code='left'   ; break ; 
            case 39: code='right'  ; break ; 
            case 40: code='down'   ; break ; 
            case 90: code='spin-l' ; break ; 
            case 88: code='spin-r' ; break ; 
            case 32: code='drop'   ; break ; 
        }
        this._now.input(code);
        this._now.render();
    },
    _tick: function(){
        this._now.tick();
        this._now.render();
    },
    key: function(code){
        this._now.input(code);
        this._now.render();
    }
}

var game = new Game();
game.state(main)

