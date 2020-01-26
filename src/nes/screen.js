
const WIDTH = 256
const HEIGHT = 240

class Color {
    constructor(r,g,b){
        this.arr = new Uint8ClampedArray(4)
        this.arr[0] = r; this.arr[1] = g; this.arr[2] = b; this.arr[3] = 0xFF;
    }
}

const PALETTE = [
    //0x00-0x0F
    new Color(124, 124, 124), new Color(  0,   0, 252), new Color(  0,   0, 188), new Color( 68,  40, 188),
    new Color(148,   0, 132), new Color(168,   0,  32), new Color(168,  16,   0), new Color(136,  20,   0),
    new Color( 80,  48,   0), new Color(  0, 120,   0), new Color(  0, 104,   0), new Color(  0,  88,   0),
    new Color(  0,  64,  88), new Color(  0,   0,   0), new Color(  0,   0,   0), new Color(  0,   0,   0),
    //0x10-0x1F
    new Color(188, 188, 188), new Color(  0, 120, 248), new Color(  0,  88, 248), new Color(104,  68, 252),
    new Color(216,   0, 204), new Color(228,   0,  88), new Color(248,  56,   0), new Color(228,  92,  16),
    new Color(172, 124,   0), new Color(  0, 184,   0), new Color(  0, 168,   0), new Color(  0, 168,  68),
    new Color(  0, 136, 136), new Color(  0,   0,   0), new Color(  0,   0,   0), new Color(  0,   0,   0),
    //0x20-0x2F
    new Color(248, 248, 248), new Color( 60, 188, 252), new Color(104, 136, 252), new Color(152, 120, 248),
    new Color(248, 120, 248), new Color(248,  88, 152), new Color(248, 120,  88), new Color(252, 160,  68),
    new Color(248, 184,   0), new Color(184, 248,  24), new Color( 88, 216,  84), new Color( 88, 248, 152), 
    new Color(  0, 232, 216), new Color(120, 120, 120), new Color(  0,   0,   0), new Color(  0,   0,   0),
    //0x30-0x3F
    new Color(252, 252, 252), new Color(164, 228, 252), new Color(184, 184, 248), new Color(216, 184, 248),
    new Color(248, 184, 248), new Color(248, 164, 192), new Color(240, 208, 176), new Color(252, 224, 168),
    new Color(248, 216, 120), new Color(216, 248, 120), new Color(184, 248, 184), new Color(184, 248, 216),
    new Color(  0, 252, 252), new Color(216, 216, 216), new Color(  0,   0,   0), new Color(  0,   0,   0)
]



class Screen{
    constructor(ctx){
        this.scr = new Uint8ClampedArray(WIDTH*HEIGHT*4)
        this.ctx = ctx
    }
    updatePixelPicker(x,y,index){
        this.scr[(y*WIDTH+x)*4 + 0] = PALETTE[index].arr[0]
        this.scr[(y*WIDTH+x)*4 + 1] = PALETTE[index].arr[1]
        this.scr[(y*WIDTH+x)*4 + 2] = PALETTE[index].arr[2]
        this.scr[(y*WIDTH+x)*4 + 3] = PALETTE[index].arr[3]
    }
    updateCanvas(){
        for(var x=0;x<WIDTH;x++){
            for(var y=0;y<HEIGHT;y++){
                var id = this.ctx.createImageData(1,1)
                id.data[0]   = this.scr[(y*WIDTH+x)*4 + 0]
                id.data[1]   = this.scr[(y*WIDTH+x)*4 + 1]
                id.data[2]   = this.scr[(y*WIDTH+x)*4 + 2]
                id.data[3]   = this.scr[(y*WIDTH+x)*4 + 3]
                this.ctx.putImageData(id, x, y)
            }
        }
    }
}

export default Screen