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
windows.Game = function(){
    this._state = {};
    this._old = {};
    this._tmpl = {
        constructor: function(){}
        destructor: function(){}
        render: function(){}
    }
    this._now = this._tmpl;
}
windows.Game.prototype = {
    _run(obj, func){
        return (typeof(obj[func])=='function')?obj[func]:function(){};
    }
    _setNow: function(obj){
        this._old = this._now;
        this._now = obj;
        for(key in this._templ){
            this._now = this._now[key] || this._tmpl[key];
        }
    }
    state: function(key, val){
        if(typeof(val) == 'function'){
            this._state[key] = val;
        }
        else {
            this._setNow(this._state[key]);

            this._old.destructor();

            this._now.constructor();

            if(typeof(this._now[func]) == 'function'){
                this._now[func]();
            }
            if(typeof(this._state[key].constructor) == 'function'){
                this._state[key].constructor();
            }
        }
    }
}
