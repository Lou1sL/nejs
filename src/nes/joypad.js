
const BUTTON = {
    A      : 0b00000001,
    B      : 0b00000010,
    SELECT : 0b00000100,
    START  : 0b00001000,
    UP     : 0b00010000,
    DOWN   : 0b00100000,
    LEFT   : 0b01000000,
    RIGHT  : 0b10000000,
}

//https://wiki.nesdev.com/w/index.php/Standard_controller
class Joypad {
    constructor(){
        this.strobe = false
        this.data0   = 0
        this.data1   = 0
        this.index0  = 0
        this.index1  = 0
    }

    w(val) {
        this.strobe = val
        if(this.strobe!=0){ this.index0 = 0 }
     }
    r0(){
        var s = 0
        if(this.index0 < 8 && (((this.data0 >>> this.index0)&1)!=0)){ s = 1 }
        this.index0++
        if(this.strobe!=0){ this.index0 = 0 }
        return s
    }
    r1(){
        var s = 0
        return s
    }

    p0Press(button){ this.data0 = button; console.log(this.data0.toString(2)) }
    p1Press(button){ this.data1 = button }
}


export { BUTTON, Joypad }