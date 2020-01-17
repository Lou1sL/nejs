
/**
 * 
 */



const WIDTH  = 256
const HEIGHT = 240

const SPRITE_WIDTH = 8
const SPRITE_HEIGHT_0 = 8
const SPRITE_HEIGHT_1 = 16


const CTRL_V = 0x80 // NMI Enable(vblank)       0:ehhh..  1:yeah!
const CTRL_P = 0x40 // PPU master/slave         0:rEXT    1:wEXT
const CTRL_H = 0x20 // Sprite height            0:8*8     1:8*16
const CTRL_B = 0x10 // Background tile select   0:0x0000  1:0x1000
const CTRL_S = 0x08 // Sprite tile select       0:0x0000  1:0x1000 (ignored in 8*16 mode)
const CTRL_I = 0x04 // Increment mode           0:inc  1  1:inc 32
const CTRL_N = 0x03 // Nametable select         0:0x2000  1:0x2400 10:0x2800 11:0x2C00

const MASK_B = 0x80 // Color emphasis: blue             0:normal  1:emphasized
const MASK_G = 0x40 // Color emphasis: green            0:normal  1:emphasized
const MASK_R = 0x20 // Color emphasis: red              0:normal  1:emphasized
const MASK_s = 0x10 // Sprite enable                    0:hide    1:show
const MASK_b = 0x08 // Background enable                0:hide    1:show
const MASK_M = 0x04 // Sprite left column enable        0:hide    1:show
const MASK_m = 0x02 // Background left column enable    0:hide    1:show
const MASK_g = 0x01 // Greyscale                        0:color   1:grayscale

const STAT_BITS = 0b11100000

const STAT_V = 0x80 // Vblank
const STAT_S = 0x40 // Sprite 0 hit
const STAT_O = 0x20 // Sprite overflow

const ADDR_BITS = 0b0111111111111111

//https://wiki.nesdev.com/w/index.php/PPU_scrolling#PPU_internal_registers
const ADDR_y  = 0b0111000000000000 // fine Y scroll
const ADDR_NY = 0b0000100000000000 // nametable Y select
const ADDR_NX = 0b0000010000000000 // nametable X select
const ADDR_Y  = 0b0000001111100000 // coarse Y scroll
const ADDR_X  = 0b0000000000011111 // coarse X scroll

const PALETTE = [
    0x7C7C7C, 0x0000FC, 0x0000BC, 0x4428BC, 0x940084, 0xA80020, 0xA81000, 0x881400,
    0x503000, 0x007800, 0x006800, 0x005800, 0x004058, 0x000000, 0x000000, 0x000000,
    0xBCBCBC, 0x0078F8, 0x0058F8, 0x6844FC, 0xD800CC, 0xE40058, 0xF83800, 0xE45C10,
    0xAC7C00, 0x00B800, 0x00A800, 0x00A844, 0x008888, 0x000000, 0x000000, 0x000000,
    0xF8F8F8, 0x3CBCFC, 0x6888FC, 0x9878F8, 0xF878F8, 0xF85898, 0xF87858, 0xFCA044,
    0xF8B800, 0xB8F818, 0x58D854, 0x58F898, 0x00E8D8, 0x787878, 0x000000, 0x000000,
    0xFCFCFC, 0xA4E4FC, 0xB8B8F8, 0xD8B8F8, 0xF8B8F8, 0xF8A4C0, 0xF0D0B0, 0xFCE0A8,
    0xF8D878, 0xD8F878, 0xB8F8B8, 0xB8F8D8, 0x00FCFC, 0xF8D8F8, 0x000000, 0x000000 ]




class Sprite {
    constructor()    { this.value = new Uint8Array(4) }
    setArr     (val) { this.value = val               }
    getArr     ()    { return this.value              }

    getY       ()    { return this.value[0] }
    getTile    ()    { return this.value[1] }
    getAttr    ()    { return this.value[2] }
    getX       ()    { return this.value[3] }

    setY       (val) { this.value[0] = val & 0xFF }
    setTile    (val) { this.value[1] = val & 0xFF }
    setAttr    (val) { this.value[2] = val & 0xFF }
    setX       (val) { this.value[3] = val & 0xFF }
}

class OAM {
    constructor()      { this.value = new Uint8Array(256);this.addr=0x00 }
    reset      ()      { this.value = new Uint8Array(256);this.addr=0x00 }
    
    addrInc    ()      { this.addr++                                     }

    getAddr    ()      { return this.addr                                }
    setAddr    (val)   { this.addr = val & 0xFF                          }
    getEle     (i)     { return this.value[i]                            }
    setEle     (i,val) { this.value[i] = val & 0xFF                      }
    getCurrent ()      { return this.value[this.addr]                    }
    setCurrent (val)   { this.value[this.addr] = val & 0xFF              }
    getArr     ()      { return this.value                               }
    setArr     (val)   { this.value = val                                }
    getSprite  (i)     { return this.value.slice(4*i,4*i+4)              }
    setSprite  (i,val) { for(var a=0;a<4;a++) this.value[4*i+a] = val[a] }

    //Sprite
    getY       (i)     { return this.value[4*i+0] }
    getTile    (i)     { return this.value[4*i+1] }
    getAttr    (i)     { return this.value[4*i+2] }
    getX       (i)     { return this.value[4*i+3] }

    setY       (i,val) { this.value[4*i+0] = val & 0xFF }
    setTile    (i,val) { this.value[4*i+1] = val & 0xFF }
    setAttr    (i,val) { this.value[4*i+2] = val & 0xFF }
    setX       (i,val) { this.value[4*i+3] = val & 0xFF }
}
class Addr {
    constructor()    { this.value = 0               }
    reset      ()    { this.value = 0               }
    get        ()    { return this.value            }
    set        (val) { this.value = val & ADDR_BITS }

    getCoarseX(){ return (this.value & ADDR_X)  >>  0 }
    getCoarseY(){ return (this.value & ADDR_Y)  >>  5 }
    getNameTbX(){ return (this.value & ADDR_NX) >> 10 }
    getNameTbY(){ return (this.value & ADDR_NY) >> 11 }
    getFineY  (){ return (this.value & ADDR_y)  >> 12 }
    
    setCoarseX(val){ this.value &= ~ADDR_X;  this.value |= ((val & 0b11111) <<  0) }
    setCoarseY(val){ this.value &= ~ADDR_Y;  this.value |= ((val & 0b11111) <<  5) }
    setNameTbX(val){ this.value &= ~ADDR_NX; this.value |= ((val & 0b00001) << 10) }
    setNameTbY(val){ this.value &= ~ADDR_NY; this.value |= ((val & 0b00001) << 11) }
    setFineY  (val){ this.value &= ~ADDR_y;  this.value |= ((val & 0b00111) << 12) }
}
class Ctrl {
    constructor()    { this.value = 0          }
    reset      ()    { this.value = 0          }
    get        ()    { return this.value       } 
    set        (val) { this.value = val & 0xFF }

    isVBlank(){ return (this.value & CTRL_V) != 0 }
    is8x16  (){ return (this.value & CTRL_H) != 0 }
    isInc32 (){ return (this.value & CTRL_I) != 0 }

    setVBlank(){ this.value |=  CTRL_V }
    set8x16  (){ this.value |=  CTRL_H }
    setInc32 (){ this.value |=  CTRL_I }

    clrVBlank(){ this.value &= ~CTRL_V }
    clr8x16  (){ this.value &= ~CTRL_H }
    clrInc32 (){ this.value &= ~CTRL_I }
}
class Mask {
    constructor()    { this.value = 0          }
    reset      ()    { this.value = 0          }
    get        ()    { return this.value       } 
    set        (val) { this.value = val & 0xFF }

    isRenderBg    (){ return (this.value & MASK_b) != 0 }
    isRenderSprite(){ return (this.value & MASK_s) != 0 }

    setRenderBg(){ this.value |=  MASK_b }
    clrRenderBg(){ this.value &= ~MASK_b } 
}
class Stat {
    constructor()    { this.value = 0                }
    reset      ()    { this.value = 0                }
    get        ()    { return this.value             }
    set        (val) { this.value = val & STAT_BITS  }

    setVBlank(){ this.value |=  STAT_V }
    clrVBlank(){ this.value &= ~STAT_V }
    setHit   (){ this.value |=  STAT_S }
    clrHit   (){ this.value &= ~STAT_S }
    setOv    (){ this.value |=  STAT_O }
    clrOv    (){ this.value &= ~STAT_O }
    clrAll   (){ this.clrVBlank(); this.clrHit(); this.clrOv() }
}
class RenderIterator {
    constructor()    { this.scanline = 0; this.cycle = 0 }
    reset      ()    { this.scanline = 0; this.cycle = 0 }
    getScanline()    { return this.scanline              }
    getCycle   ()    { return this.cycle                 }

    scanlineState()  {
        if(this.scanline ==  -1)                       return 'PRERENDER'
        if(this.scanline >= 0 && this.scanline <= 239) return 'VISIBLE'
        if(this.scanline == 240)                       return 'POSTRENDER'
        if(this.scanline == 241)                       return 'NMI'
    }

    iterate(){
        this.iterateCycle()
        if(this.cycle == 0 && this.scanline == 0) this.cycle = 1
    }
    iterateCycle(){
        this.cycle++
        if(this.cycle > 340) this.iterateScanline()
    }
    iterateScanline(){
        this.cycle = 0
        this.scanline++
        if(this.scanline > 260) this.scanline = -1
    }
}
class PPU {
    constructor(bus){
        //Internal RAM
        this.oam = new OAM() //For sprite data(64*4(x,y,color,tile))

        //Register
        this.v = new Addr()    //15 bits  Current VRAM address
        this.t = new Addr()    //15 bits  Temporary VRAM address (15 bits); can also be thought of as the address of the top left onscreen tile.
        this.x = 0x00          //3  bits  Fine X scroll
        this.w = 0x00          //1  bit   First or second write toggle (1 bit)
        this.ctrl = new Ctrl() //0x2000
        this.mask = new Mask() //0x2001
        this.stat = new Stat() //0x2002
        this.reg_buffer = 0x00

        this.bus = bus

        this.pixelIter = new RenderIterator()

        //Background
        this.bg_id = 0
        this.bg_at = 0
        this.bg_l  = 0
        this.bg_h  = 0
        //Background shifter
        this.bg_s_ptn_l = 0
        this.bg_s_ptn_h = 0
        this.bg_s_atr_l = 0
        this.bg_s_atr_h = 0
        
        this.spriteScanline = new Array(0)
        for(var i=0;i<8;i++) this.spriteScanline.push(new Sprite())
        this.spriteCount = 0
        this.sp_s_ptl_l = new Uint8Array(8)
        this.sp_s_ptl_h = new Uint8Array(8)

    }
    busR()        { return this.bus.r(this.v.get()) }
    busW(data)    { this.bus.w(this.v.get(),data)   }


    countAddr()   { this.v.set(this.v.get() + (this.ctrl.isInc32() ? 32 : 1)) }

    RESET (){
        //this.oam.reset()
        this.v.reset()
        this.t.reset()
        this.x = 0
        this.w = 0
        this.ctrl.reset()
        this.mask.reset()
        this.stat.reset()
        this.reg_buffer = 0
        this.pixelIter.reset()

        //Background
        this.bg_id = 0
        this.bg_at = 0
        this.bg_l  = 0
        this.bg_h  = 0
        //Background shifter
        this.bg_s_ptn_l = 0
        this.bg_s_ptn_h = 0
        this.bg_s_atr_l = 0
        this.bg_s_atr_h = 0
    }

    //0x2002 PPUSTATUS
    REG_STAT_R (){
        //3 bits + previous reg access
        var res = ((this.reg_buffer & (~STAT_BITS)) | this.stat.get())
        //clear nmi(vblank)
        this.stat.clrVBlank()
        //reset write latch
        this.w = 0
        return res
     }
    //0x2004 OAMDATA
    REG_OAMD_R (){ return this.oam.getCurrent() }
    //0x2007 PPUDATA
    REG_DATA_R (){
        //Nametable -> delay, palette -> no delay.
        var res = this.reg_buffer
        this.reg_buffer = this.busR()
        if((this.v.get() % 0x4000) >= 0x3F00) res = this.reg_buffer
        this.countAddr()
        return res
    }
    //0x2000 PPUCTRL
    REG_CTRL_W (val){
        this.ctrl.set(val)
        this.t.set((this.t.get() & ~ADDR_N) | ((val & CTRL_N) << 10))
    }
    //0x2001 PPUMASK
    REG_MASK_W (val){ this.mask.set(val) }
    //0x2003 OAMAADDR
    REG_OAMA_W (val){ this.oam.setAddr(val) }
    //0x2004 OAMDATA
    REG_OAMD_W (val){
        this.oam.setCurrent(val)
        this.oam.addrInc()
    }
    //0x2005 PPUSCROLL (x2)
    REG_SCRL_W (val){
        if(this.w == 0){
            this.t.setCoarseX(val >> 3)
            this.x = val & 0b111
            this.w = 1
        }else{
            this.t.setFineY(val & 0b111)
            this.t.setCoarseY(val >>  3)
            this.w = 0
        }
    }
    //0x2006 PPUADDR   (x2)
    REG_ADDR_W (val){
        if(this.w == 0){
            this.t.set((this.t.get() & 0b1000000011111111) | ((val & 0b00111111) << 8))
            this.w = 1
        }else{
            this.t.set((this.t.get() & 0xFF00) | (val & 0xFF))
            this.v.set(this.t.get())
            this.w = 0
        }
    }
    //0x2007 PPUDATA
    REG_DATA_W (val){
        this.busW(val)
        this.countAddr()
    }
    //0x4019 OAMDMA
    REG_ODMA_W (val,cpubus){ 
        for(var a=0;a<0x100;a++)
            this.oam.setEle((a+this.oam.getAddr()) & 0xFF,cpubus.r((val << 8) + a))
    }


    incScrollX(){
        if((!this.mask.isRenderBg()) && (!this.mask.isRenderSprite())) return
        var cx = this.v.getCoarseX()
        if(cx == 0x1F){
            this.v.setCoarseX(0)
            this.v.setNameTbX(~this.getNameTbX())
        }else this.v.setCoarseX(cx + 1)
    }
    incScrollY(){
        if((!this.mask.isRenderBg()) && (!this.mask.isRenderSprite())) return
        var fy = this.v.getFineY()
            if(fy == 0b111){
                this.v.setFineY(0)
                var cy = this.v.getCoarseY()
                if(cy == 0x1D){
                    this.v.setCoarseY(0)
                    this.v.setNameTbY(~this.v.getNameTbY())
                }else if (cy == 0x1F)this.v.setCoarseY(0)
                else this.v.setCoarseY(cy+1)
            }else this.v.setFineY(fy+1)
    }
    transferAddrX(){
        if((!this.mask.isRenderBg()) && (!this.mask.isRenderSprite())) return
        this.v.setNameTbX(this.t.getNameTbX())
        this.v.setCoarseX(this.t.getCoarseX())

    }
    transferAddrY(){
        if((!this.mask.isRenderBg()) && (!this.mask.isRenderSprite())) return
        this.v.setNameTbY(this.t.getNameTbY())
        this.v.setCoarseY(this.t.getCoarseY())
        this.v.setFineY(this.t.getFineY())
    }
    reloadBgShifter(){
        this.bg_s_ptn_l = (this.bg_s_ptn_l & 0xFF00) | bg_l
        this.bg_s_ptn_h = (this.bg_s_ptn_h & 0xFF00) | bg_h

        this.bg_s_atr_l = (this.bg_s_atr_l & 0xFF00) | ((bg_at & 0b01) ? 0xFF:0x00)
        this.bg_s_atr_h = (this.bg_s_atr_h & 0xFF00) | ((bg_at & 0b10) ? 0xFF:0x00)
    }
    updateShifter(){
        if(this.mask.isRenderBg()){
            this.bg_s_ptn_l <<= 1
            this.bg_s_ptn_h <<= 1
            this.bg_s_atr_l <<= 1
            this.bg_s_atr_h <<= 1
        }
        if(this.mask.isRenderSprite()){
            var cycle = this.pixelIter.getCycle()
            if(cycle>0 && cycle<258){
                for(var i=0;i<this.spriteCount;i++){
                    var x = this.spriteScanline[i].getX()
                    if (x > 0)this.spriteScanline[i].setX(x-1)
                    else
                    {
                        this.sp_s_ptl_l[i] <<= 1
                        this.sp_s_ptl_h[i] <<= 1
                    }
                }
            }
        }
    }

    

    scanlineNmi(){ }

    STEP(){
        
        var scanline = this.pixelIter.getScanline()
        var cycle = this.pixelIter.getCycle()
        var state = this.pixelIter.scanlineState()

        if(state == 'PRERENDER'){
            if(cycle == 1){
                this.stat.clrAll()
                this.sp_s_ptl_l = new Uint8Array(8)
                this.sp_s_ptl_h = new Uint8Array(8)
            }
        }

        if(state == 'PRERENDER' || state == 'VISIBLE'){
            if ((cycle >= 2 && cycle <= 257) || (cycle >= 321 && cycle <= 337)){
                this.updateShifter()
                switch ((cycle - 1) % 8){
                    case 0 :
                        this.reloadBgShifter()

                    break

                }
            }

        }


        this.pixelIter.iterate()
    }







    
}

module.exports = PPU