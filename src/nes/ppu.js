
/**
 * 
 */



const WIDTH  = 256
const HEIGHT = 240



const SPRITE_DATA_SIZE = 4
const SPRITE_DATA_Y    = 0
const SPRITE_DATA_T    = 1
const SPRITE_DATA_A    = 2
const SPRITE_DATA_X    = 3

const SPRITE_SCANLINE_MAX = 8
const OAM_SPRITE_COUNT = 64
const OAM_SIZE = OAM_SPRITE_COUNT * SPRITE_DATA_SIZE

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

class Sprite {
    constructor()    { this.value = new Uint8Array(SPRITE_DATA_SIZE) }
    setArr     (val) { this.value = val                              }
    getArr     ()    { return this.value                             }

    getY       ()    { return this.value[SPRITE_DATA_Y] }
    getTile    ()    { return this.value[SPRITE_DATA_T] }
    getAttr    ()    { return this.value[SPRITE_DATA_A] }
    getX       ()    { return this.value[SPRITE_DATA_X] }

    setY       (val) { this.value[SPRITE_DATA_Y] = val & 0xFF }
    setTile    (val) { this.value[SPRITE_DATA_T] = val & 0xFF }
    setAttr    (val) { this.value[SPRITE_DATA_A] = val & 0xFF }
    setX       (val) { this.value[SPRITE_DATA_X] = val & 0xFF }

    reset      ()    { for(var i=0;i<SPRITE_DATA_SIZE;i++)this.value[i] = 0xFF }
}

class OAM {
    constructor()      { this.value = new Uint8Array(OAM_SIZE); this.addr=0x00 }
    reset      ()      { this.value = new Uint8Array(OAM_SIZE); this.addr=0x00 }
    
    addrInc    ()      { this.addr = (this.addr + 1) & 0xFF              }

    getAddr    ()      { return this.addr                                }
    setAddr    (val)   { this.addr = val & 0xFF                          }
    getEle     (i)     { return this.value[i]                            }
    setEle     (i,val) { this.value[i] = val & 0xFF                      }
    getCurrent ()      { return this.value[this.addr]                    }
    setCurrent (val)   { this.value[this.addr] = val & 0xFF              }
    getArr     ()      { return this.value                               }
    setArr     (val)   { this.value = val                                }
    getSprite  (i)     { 
        return this.value.slice(SPRITE_DATA_SIZE*i,SPRITE_DATA_SIZE*i+SPRITE_DATA_SIZE)
    }
    setSprite  (i,val) { 
        for(var a=0;a<SPRITE_DATA_SIZE;a++) this.value[SPRITE_DATA_SIZE*i+a] = val[a]
    }

    //Sprite
    getY       (i)     { return this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_Y] }
    getTile    (i)     { return this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_T] }
    getAttr    (i)     { return this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_A] }
    getX       (i)     { return this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_X] }

    setY       (i,val) { this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_Y] = val & 0xFF }
    setTile    (i,val) { this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_T] = val & 0xFF }
    setAttr    (i,val) { this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_A] = val & 0xFF }
    setX       (i,val) { this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_X] = val & 0xFF }
}
class Addr {
    constructor()    { this.value = 0               }
    reset      ()    { this.value = 0               }
    get        ()    { return this.value            }
    set        (val) { this.value = val & ADDR_BITS }

    getCoarseX ()    { return (this.value & ADDR_X)  >>>  0 }
    getCoarseY ()    { return (this.value & ADDR_Y)  >>>  5 }
    getNameTbX ()    { return (this.value & ADDR_NX) >>> 10 }
    getNameTbY ()    { return (this.value & ADDR_NY) >>> 11 }
    getFineY   ()    { return (this.value & ADDR_y)  >>> 12 }
    
    setCoarseX (val) { this.value &= ~ADDR_X;  this.value |= ((val & 0b11111) <<  0) }
    setCoarseY (val) { this.value &= ~ADDR_Y;  this.value |= ((val & 0b11111) <<  5) }
    setNameTbX (val) { this.value &= ~ADDR_NX; this.value |= ((val & 0b00001) << 10) }
    setNameTbY (val) { this.value &= ~ADDR_NY; this.value |= ((val & 0b00001) << 11) }
    setFineY   (val) { this.value &= ~ADDR_y;  this.value |= ((val & 0b00111) << 12) }
}
class FineX {
    constructor()    { this.value = 0           }
    reset      ()    { this.value = 0           }
    get        ()    { return this.value        }
    set        (val) { this.value = val & 0b111 }
}
class WLatch {
    constructor()    { this.value = false       }
    reset      ()    { this.value = false       }
    isOff      ()    { return !this.value       }
    trigger    ()    { this.value = !this.value }
}
class Ctrl {
    constructor()    { this.value = 0          }
    reset      ()    { this.value = 0          }
    get        ()    { return this.value       } 
    set        (val) { this.value = val & 0xFF }

    isVBlank   ()    { return (this.value & CTRL_V) != 0 }
    is8x16     ()    { return (this.value & CTRL_H) != 0 }
    isBgSel    ()    { return (this.value & CTRL_B) != 0 }
    isSpSel    ()    { return (this.value & CTRL_S) != 0 }
    isInc32    ()    { return (this.value & CTRL_I) != 0 }

    setVBlank  ()    { this.value |=  CTRL_V }
    set8x16    ()    { this.value |=  CTRL_H }
    setInc32   ()    { this.value |=  CTRL_I }

    clrVBlank  ()    { this.value &= ~CTRL_V }
    clr8x16    ()    { this.value &= ~CTRL_H }
    clrInc32   ()    { this.value &= ~CTRL_I }
    
    getSpriteH ()    { return this.is8x16()  ? 16:8 }
    getAddrInc ()    { return this.isInc32() ? 32:1 }
}
class Mask {
    constructor()    { this.value = 0          }
    reset      ()    { this.value = 0          }
    get        ()    { return this.value       } 
    set        (val) { this.value = val & 0xFF }

    isRenderBg ()    { return (this.value & MASK_b) != 0 }
    isRenderSp ()    { return (this.value & MASK_s) != 0 }

    isRenderBgL()    { return (this.value & MASK_m) != 0 }
    isRenderSpL()    { return (this.value & MASK_M) != 0 }

    isGray     ()    { return (this.value & MASK_g) != 0 }

    setRenderBg()    { this.value |=  MASK_b }
    clrRenderBg()    { this.value &= ~MASK_b } 
}
class Stat {
    constructor()    { this.value = 0                }
    reset      ()    { this.value = 0                }
    get        ()    { return this.value             }
    set        (val) { this.value = val & STAT_BITS  }

    setVBlank  ()    { this.value |=  STAT_V }
    clrVBlank  ()    { this.value &= ~STAT_V }
    setHit     ()    { this.value |=  STAT_S }
    clrHit     ()    { this.value &= ~STAT_S }
    setOv      ()    { this.value |=  STAT_O }
    clrOv      ()    { this.value &= ~STAT_O }
    clrAll     ()    { this.clrVBlank(); this.clrHit(); this.clrOv() }
}

const SCANLINE_STATE = { PRERENDER:0, VISIBLE:1, POSTRENDER:2, VBLANK:3, NOP:-1 }
const    CYCLE_STATE = { IDLE:0, FETCH_TILE:1, SPRITE_EVAL:2, PREFETCH:3, TBFETCH:4  }
//https://wiki.nesdev.com/w/index.php/PPU_rendering#Cycle_0
class RenderIterator {
    constructor()    { this.scanline = 0; this.cycle = 1 }
    reset      ()    { this.scanline = 0; this.cycle = 1 }
    getScanline()    { return this.scanline              }
    getCycle   ()    { return this.cycle                 }

    getState()  {
        var state = { scanline:SCANLINE_STATE.NOP, cycle:CYCLE_STATE.IDLE }
             if(this.scanline <  240) state.scanline = SCANLINE_STATE.VISIBLE
        else if(this.scanline == 240) state.scanline = SCANLINE_STATE.POSTRENDER
        else if(this.scanline == 241) state.scanline = SCANLINE_STATE.VBLANK
        else if(this.scanline == 261) state.scanline = SCANLINE_STATE.PRERENDER

             if(this.cycle ==   0) state.cycle = CYCLE_STATE.IDLE
        else if(this.cycle <= 256) state.cycle = CYCLE_STATE.FETCH_TILE
        else if(this.cycle <= 320) state.cycle = CYCLE_STATE.SPRITE_EVAL
        else if(this.cycle <= 336) state.cycle = CYCLE_STATE.PREFETCH
        else if(this.cycle <= 340) state.cycle = CYCLE_STATE.TBFETCH
        return state
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
        if(this.scanline > 261) this.scanline = 0
    }
}

class RenderInfo {
    constructor(){
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
        //Sprite
        this.spriteScanline = new Array(SPRITE_SCANLINE_MAX)
        for(var i=0;i<SPRITE_SCANLINE_MAX;i++)
            this.spriteScanline[i] = new Sprite()
        this.spriteCount = 0
        this.sp_s_ptn_l = new Uint8Array(SPRITE_SCANLINE_MAX)
        this.sp_s_ptn_h = new Uint8Array(SPRITE_SCANLINE_MAX)

        this.spriteZeroHitPossible   = false
	    this.spriteZeroBeingRendered = false
    }

    reset(){
        this.bg_id = 0
        this.bg_at = 0
        this.bg_l  = 0
        this.bg_h  = 0
        this.bg_s_ptn_l = 0
        this.bg_s_ptn_h = 0
        this.bg_s_atr_l = 0
        this.bg_s_atr_h = 0
    }

    resetSpriteScanline(){
        for(var i=0;i<SPRITE_SCANLINE_MAX;i++){
            this.spriteScanline[i].reset()
            this.sp_s_ptn_l[i] = 0
            this.sp_s_ptn_h[i] = 0
        }
        this.spriteCount = 0
        this.spriteZeroHitPossible = false
    }
}

class PPU {
    constructor(bus,screen){
        //Internal RAM
        this.oam  = new OAM() //For sprite data(64*4(x,y,color,tile))

        //Register
        this.v    = new Addr()    //15 bits  Current VRAM address
        this.t    = new Addr()    //15 bits  Temporary VRAM address (15 bits); can also be thought of as the address of the top left onscreen tile.
        this.x    = new FineX()   //3  bits  Fine X scroll
        this.w    = new WLatch()  //1  bit   First or second write toggle (1 bit)
        this.ctrl = new Ctrl()    //0x2000
        this.mask = new Mask()    //0x2001
        this.stat = new Stat()    //0x2002
        this.reg_buffer = 0x00

        this.bus = bus
        this.screen = screen

        this.pixelIter = new RenderIterator()
        this.render = new RenderInfo()

        this.frame = 0
    }
    busR    ()          { return this.bus.r(this.v.get(),this.mask.isGray()) }
    busW    (data)      { this.bus.w(this.v.get(),data)                      }
    busRAddr(addr)      { return this.bus.r(addr,        this.mask.isGray()) }
    busWAddr(addr,data) { this.bus.w(addr,data)                              }

    incAddr () { this.v.set(this.v.get() + this.ctrl.getAddrInc()) }

    RST (){
        //this.oam.reset()
        this.v.reset()
        this.t.reset()
        this.x.reset()
        this.w.reset()
        this.ctrl.reset()
        this.mask.reset()
        this.stat.reset()
        this.reg_buffer = 0
        this.pixelIter.reset()
        this.render.reset()
        this.frame = 0
    }

    //0x2002 PPUSTATUS
    REG_STAT_R (){
        //3 bits + previous reg access
        var res = ((this.reg_buffer & (~STAT_BITS)) | this.stat.get())
        //clear nmi(vblank)
        this.stat.clrVBlank()
        //reset write latch
        this.w.reset()
        return res
     }
    //0x2004 OAMDATA
    REG_OAMD_R (){ return this.oam.getCurrent() }
    //0x2007 PPUDATA
    REG_DATA_R (){
        //Nametable -> delay, palette -> no delay.
        var res = this.reg_buffer
        this.reg_buffer = this.busR()
        if(this.v.get() >= 0x3F00) res = this.reg_buffer
        //this.incAddr()
        return res
    }
    //0x2000 PPUCTRL
    REG_CTRL_W (val){
        this.ctrl.set(val)
        this.t.set((this.t.get() & ~(ADDR_NY|ADDR_NX)) | ((val & CTRL_N) << 10))
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
        if(this.w.isOff()){
            this.t.setCoarseX(val >>> 3)
            this.x.set(val)
        }else{
            this.t.setFineY(val)
            this.t.setCoarseY(val >>> 3)
        }
        this.w.trigger()
    }
    //0x2006 PPUADDR   (x2)
    REG_ADDR_W (val){
        if(this.w.isOff()){
            this.t.set((this.t.get() & 0x00FF) | ((val & 0x3F) << 8))
        }else{
            this.t.set((this.t.get() & 0xFF00) | (val & 0xFF))
            this.v.set(this.t.get())
        }
        this.w.trigger()
    }
    //0x2007 PPUDATA
    REG_DATA_W (val){
        this.busW(val)
        this.incAddr()
    }
    //0x4019 OAMDMA
    REG_ODMA_W (val,cpubus){ 
        for(var a=0;a<0x100;a++)
            this.oam.setEle((a+this.oam.getAddr()) & 0xFF,cpubus.r((val << 8) + a))
    }


    incScrollX(){
        if((!this.mask.isRenderBg()) && (!this.mask.isRenderSp())) return
        var cx = this.v.getCoarseX()
        if(cx == 0x1F){
            this.v.setCoarseX(0)
            this.v.setNameTbX(~this.v.getNameTbX())
        }else this.v.setCoarseX(cx + 1)
    }
    incScrollY(){
        if((!this.mask.isRenderBg()) && (!this.mask.isRenderSp())) return
        var fy = this.v.getFineY()
            if(fy >= 7){
                this.v.setFineY(0)
                var cy = this.v.getCoarseY()
                if(cy == 29){
                    this.v.setCoarseY(0)
                    this.v.setNameTbY(~this.v.getNameTbY())
                }else if (cy == 31)this.v.setCoarseY(0)
                else this.v.setCoarseY(this.v.getCoarseY()+1)
            }else this.v.setFineY(fy+1)
    }
    transferAddrX(){
        if((!this.mask.isRenderBg()) && (!this.mask.isRenderSp())) return
        this.v.setNameTbX(this.t.getNameTbX())
        this.v.setCoarseX(this.t.getCoarseX())
    }
    transferAddrY(){
        if((!this.mask.isRenderBg()) && (!this.mask.isRenderSp())) return
        this.v.setNameTbY(this.t.getNameTbY())
        this.v.setCoarseY(this.t.getCoarseY())
        this.v.setFineY(this.t.getFineY())
    }
    reloadBgShifter(){
        this.render.bg_s_ptn_l = (this.render.bg_s_ptn_l & 0xFF00) | (this.render.bg_l & 0x00FF)
        this.render.bg_s_ptn_h = (this.render.bg_s_ptn_h & 0xFF00) | (this.render.bg_h & 0x00FF)

        this.render.bg_s_atr_l = (this.render.bg_s_atr_l & 0xFF00) | (((this.render.bg_at & 0b01) > 0) ? 0xFF:0x00)
        this.render.bg_s_atr_h = (this.render.bg_s_atr_h & 0xFF00) | (((this.render.bg_at & 0b10) > 0) ? 0xFF:0x00)
    }
    updateShifter(){
        if(this.mask.isRenderBg()){
            this.render.bg_s_ptn_l = (this.render.bg_s_ptn_l << 1) & 0xFFFF
            this.render.bg_s_ptn_h = (this.render.bg_s_ptn_h << 1) & 0xFFFF
            this.render.bg_s_atr_l = (this.render.bg_s_atr_l << 1) & 0xFFFF
            this.render.bg_s_atr_h = (this.render.bg_s_atr_h << 1) & 0xFFFF
        }
        if(this.mask.isRenderSp()){
            var cycle = this.pixelIter.getCycle()
            if(cycle>0 && cycle<258){
                for(var i=0;i<this.render.spriteCount;i++){
                    var x = this.render.spriteScanline[i].getX()
                    if (x > 0)this.render.spriteScanline[i].setX(x-1)
                    else
                    {
                        this.render.sp_s_ptn_l[i] = (this.render.sp_s_ptn_l[i] << 1) & 0xFF
                        this.render.sp_s_ptn_h[i] = (this.render.sp_s_ptn_h[i] << 1) & 0xFF
                    }
                }
            }
        }
    }

    






    scanlinePre(){
        var cycle = this.pixelIter.getCycle()
        if(cycle == 1){
            this.stat.clrAll()
            this.render.sp_s_ptn_h = new Uint8Array(SPRITE_SCANLINE_MAX)
            this.render.sp_s_ptn_l = new Uint8Array(SPRITE_SCANLINE_MAX)
        }
        if(cycle >= 280 && cycle <= 304) this.transferAddrY()
    }
    scanlineRender(){
        var cycle = this.pixelIter.getCycle()

        //Background
        if ((cycle >= 2 && cycle <= 257) || (cycle >= 321 && cycle <= 337)){
            this.updateShifter()
            switch ((cycle - 1) % 8){
                case 0 :
                    this.reloadBgShifter()
                    this.render.bg_id = this.busRAddr(0x2000 | (this.v.get() & 0x0FFF))
                break
                case 2 :
                    this.render.bg_at = this.busRAddr(0x23C0 | (this.v.getNameTbY() << 11)
                    | (this.v.getNameTbX() << 10)
                    | ((this.v.getCoarseY() >>> 2) << 3)
                    | (this.v.getCoarseX() >>> 2))

                    if((this.v.getCoarseY() & 0x02) != 0) this.render.bg_at = (this.render.bg_at >>> 4) & 0xFF
                    if((this.v.getCoarseX() & 0x02) != 0) this.render.bg_at = (this.render.bg_at >>> 2) & 0xFF
                    this.render.bg_at &= 0x03
                break
                case 4 :
                    this.render.bg_l = this.busRAddr(((this.ctrl.isBgSel()?1:0) << 12) 
					+ (this.render.bg_id << 4) 
                    + this.v.getFineY() + 0)
                break
                case 6 :
                    this.render.bg_h = this.busRAddr(((this.ctrl.isBgSel()?1:0) << 12) 
                    + (this.render.bg_id << 4) 
                    + this.v.getFineY() + 8)
                break
                case 7 :
                    this.incScrollX()
                break
            }
        }
        if(cycle == 256){
            this.incScrollY()
        }
        if(cycle == 257){
            this.reloadBgShifter()
            this.transferAddrX()
        }
        if(cycle == 338 || cycle == 340){
            this.render.bg_id = this.busRAddr(0x2000 | (this.v.get() & 0x0FFF))
        }
        if(cycle == 340){

            for(var i=0;i<this.render.spriteCount;i++){

                var sp_ptn_data_l = 0
                var sp_ptn_data_h = 0
                var sp_ptn_addr_l = 0
                var sp_ptn_addr_h = 0

                var is8x16 = this.ctrl.is8x16()
                var ptn = (this.render.spriteScanline[i].getAttr() & 0x80) != 0
                
                var diff = (this.pixelIter.getScanline() - this.render.spriteScanline[i].getY())
                if(is8x16){
                    sp_ptn_addr_l = 
                            ((this.render.spriteScanline[i].getTile() & 0x01) << 12)|
                            (((this.render.spriteScanline[i].getTile() & 0xFE) + (ptn?(diff<8?1:0):(diff<8?0:1))) << 4)|
                            ((ptn?(7 - diff & 0x07):(diff & 0x07)))
                }else{
                    sp_ptn_addr_l = 
                            ((this.ctrl.isSpSel()?1:0) << 12) |
                            (this.render.spriteScanline[i].getTile() << 4) |
                            ((ptn?(7 - diff):diff))
                }

                sp_ptn_addr_h = (sp_ptn_addr_l + 8) & 0xFFFF

                sp_ptn_data_l = this.busRAddr(sp_ptn_addr_l)
                sp_ptn_data_h = this.busRAddr(sp_ptn_addr_h)

                if((this.render.spriteScanline[i].getAttr() & 0x40) != 0){
                    sp_ptn_data_l = parseInt((sp_ptn_data_l & 0xFF).toString(2).split("").reverse().join(""),2) & 0xFF
                    sp_ptn_data_h = parseInt((sp_ptn_data_h & 0xFF).toString(2).split("").reverse().join(""),2) & 0xFF
                }

                this.render.sp_s_ptn_l[i] = sp_ptn_data_l
                this.render.sp_s_ptn_h[i] = sp_ptn_data_h
            }
        }
    }
    scanlineVisible(){
        var cycle = this.pixelIter.getCycle()
        if(cycle == 257){
            this.render.resetSpriteScanline()
            for(var entry = 0; (entry < 64) && (this.render.spriteCount <= SPRITE_SCANLINE_MAX); entry++){
                var diff = (this.pixelIter.getScanline() - this.oam.getY(entry)) & 0xFFFF
                if(diff > 0 && diff < (this.ctrl.getSpriteH())){
                    if(this.render.spriteCount < SPRITE_SCANLINE_MAX){
                        if(entry == 0) this.render.spriteZeroHitPossible = true
                        this.render.spriteScanline[this.render.spriteCount].setArr(this.oam.getSprite(entry))
                        this.render.spriteCount++
                    }
                }
            }
            if(this.render.spriteCount > SPRITE_SCANLINE_MAX) this.stat.setOv()
            else this.stat.clrOv()
        }
    }
    scanlinePost(){
        /** do nothing */
        if(this.pixelIter.getCycle() == 1){
            this.screen.updateCanvas()
            console.log('F:'+this.frame++)
        }
        
    }
    scanlineNmi(){
        if(this.pixelIter.getCycle() == 1){
            this.stat.setVBlank()
            if(this.ctrl.isVBlank())this.bus.nmi()
        }
    }
    

    STEP(dbg=false){
        var state = this.pixelIter.getState()

        switch(state.scanline){
            case SCANLINE_STATE.PRERENDER: this.scanlinePre(); this.scanlineRender(); break
            case SCANLINE_STATE.VISIBLE: this.scanlineRender(); this.scanlineVisible(); break
            case SCANLINE_STATE.POSTRENDER: this.scanlinePost(); break
            case SCANLINE_STATE.VBLANK: this.scanlineNmi(); break
        }
        
        var bg_pixel = 0
        var bg_palet = 0
        if(this.mask.isRenderBg()){
            var bit_mux = 0x8000 >>> this.x.get()
            var pl = (this.render.bg_s_ptn_l & bit_mux) > 0 ? 1 : 0
            var ph = (this.render.bg_s_ptn_h & bit_mux) > 0 ? 1 : 0
            bg_pixel = (ph << 1) | pl

            var bg_pall = (this.render.bg_s_atr_l & bit_mux) > 0 ? 1 : 0
            var bg_palh = (this.render.bg_s_atr_h & bit_mux) > 0 ? 1 : 0
            bg_palet = (bg_palh << 1) | bg_pall
        }

        var sp_pixel = 0
        var sp_palet = 0
        var sp_prior = false
        if(this.mask.isRenderSp()){
            this.render.spriteZeroBeingRendered = false
            for(var i=0;i<this.render.spriteCount;i++){
                if(this.render.spriteScanline[i].getX()!=0) continue
                
                var pl = (this.render.sp_s_ptn_l[i] & 0x80) > 0 ? 1 : 0
                var ph = (this.render.sp_s_ptn_h[i] & 0x80) > 0 ? 1 : 0
                sp_pixel = (ph << 1) | pl

                sp_palet = ((this.render.spriteScanline[i].getAttr() & 0x03) + 0x04) & 0xFF
                sp_prior = (this.render.spriteScanline[i].getAttr() & 0x20) == 0

                if(sp_pixel!=0){
                    if(i==0 && this.render.spriteZeroHitPossible)this.render.spriteZeroBeingRendered = true
                    break
                }
            }
        }

        //-----
        var cycle = this.pixelIter.getCycle()
        var scanline = this.pixelIter.getScanline()

        var pixel = 0
        var palet = 0

        if(bg_pixel == 0 && sp_pixel == 0){
            pixel = 0;        palet = 0;
        }
        else if(bg_pixel != 0 && sp_pixel == 0){
            pixel = bg_pixel; palet = bg_palet;
        }
        else if(bg_pixel == 0 && sp_pixel != 0){
            pixel = sp_pixel; palet = sp_palet;
        }
        else if(bg_pixel != 0 && sp_pixel != 0){
            pixel = sp_prior ? sp_pixel:bg_pixel
            palet = sp_prior ? sp_palet:bg_palet
            if(this.render.spriteZeroHitPossible && this.render.spriteZeroBeingRendered){
                if(this.mask.isRenderBg() && this.mask.isRenderSp()){
                    if(!(this.mask.isRenderBgL() || this.mask.isRenderSpL())){
                        if(cycle>=9 && cycle<258)this.stat.setHit()
                    }else{
                        if(cycle>=1 && cycle<258)this.stat.setHit()
                    }
                }
            }
        }

        this.screen.updatePixelPicker(cycle-1,scanline,this.busRAddr(0x3F00+(palet<<2)+pixel) & 0x3F)

        this.pixelIter.iterate()


        if(dbg)
            console.log(this.pixelIter.getScanline()+' '+this.pixelIter.getCycle())
    }
}

export default PPU