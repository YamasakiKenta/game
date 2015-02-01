+function(){
    var Game = function(){
        this._state = {};
    }
    Game.prototype = {
        state: function(key,val){
            (!val)?this._state[key]=val:this._state[key]();
        }
    }
    window.Game = window.Game || Game
}();
