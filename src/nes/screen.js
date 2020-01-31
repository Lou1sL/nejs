
const WIDTH = 256
const HEIGHT = 240

class Color {
    constructor(r, g, b) {
        this.color = ((r & 0xFF) << (8 * 0)) | ((g & 0xFF) << (8 * 1)) | ((b & 0xFF) << (8 * 2)) | ((0xFF & 0xFF) << (8 * 3))
    }
}

//UInt32Array
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

class Screen {
    constructor(canvas) {
        this.canvas  = canvas
        this.ctx     = canvas.getContext('2d')
        this.img     = this.ctx.createImageData(WIDTH, HEIGHT)
        this.imgScr  = this.ctx.createImageData(this.canvas.width, this.canvas.height)
        this.data    = new Uint32Array(this.img.data.buffer)
        this.dataScr = new Uint32Array(this.imgScr.data.buffer)
    }
    updatePixelPicker(x, y, index) {
        this.data[y * WIDTH + x] = PALETTE[index].color
    }

    //EXP 2X
    updateCanvas() {
        const src = this.data
        const dst = this.dataScr

        for (let y = 0; y < HEIGHT; ++y) {

            const y0 = Math.max(y - 1,          0) | 0
            const y2 = Math.min(y + 1, HEIGHT - 1) | 0

            for (let x = 0; x < WIDTH; ++x) {

                const x0 = Math.max(x - 1,         0) | 0
                const x2 = Math.min(x + 1, WIDTH - 1) | 0
                
                const c = src[y  * WIDTH + x ]
                const u = src[y0 * WIDTH + x ]
                const d = src[y2 * WIDTH + x ]
                const l = src[y  * WIDTH + x0]
                const r = src[y  * WIDTH + x2]

                let d1 = (l === u && l !== d && u !== r) ? u : c
                let d2 = (u === r && u !== l && r !== d) ? r : c
                let d3 = (d === l && d !== r && l !== u) ? l : c
                let d4 = (r === d && r !== u && d !== l) ? d : c

                const di = (y * (WIDTH * 2) + x) * 2
                
                dst[di + 0] = d1
                dst[di + 1] = d2
                dst[di + WIDTH * 2 + 0] = d3
                dst[di + WIDTH * 2 + 1] = d4
            }
        }

        this.ctx.putImageData(this.imgScr,0,0)
    }
}

export default Screen