
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
        this.reg   = 0
        this.keyBuffer = 0
    }
    //0x4016
    w(val) {
        this.strobe = val != 0
        if(this.strobe){ this.reg = this.keyBuffer }
    }
    //0x4016
    r0(){
        if(this.strobe){ return this.keyBuffer | BUTTON.A }
        var data = this.reg & 1
        this.reg >>>= 1
        return data
    }
    //0x4017
    r1(){ return 0 }

    btnDown (button) { this.keyBuffer |=  button }
    btnUp   (button) { this.keyBuffer &= ~button }
}


export { BUTTON, Joypad }