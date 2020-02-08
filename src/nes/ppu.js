/**
 * 2C02 PPU for Nintendo Entertainment System(Famicom)
*/


const BIT_1  = 0x0001
const BIT_2  = 0x0003
const BIT_3  = 0x0007
const BIT_4  = 0x000F
const BIT_5  = 0x001F
const BIT_6  = 0x003F
const BIT_7  = 0x007F
const BIT_8  = 0x00FF
const BIT_16 = 0xFFFF

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


//https://wiki.nesdev.com/w/index.php/PPU_OAM
const SPRITE_DATA_SIZE = 4
const SPRITE_DATA_Y    = 0
const SPRITE_DATA_T    = 1
const SPRITE_DATA_A    = 2
const SPRITE_DATA_X    = 3

const SPRITE_TILE_NUMB  = 0b11111110
const SPRITE_TILE_BANK  = 0b00000001
const SPRITE_ATTR_VFLIP = 0b10000000
const SPRITE_ATTR_HFLIP = 0b01000000
const SPRITE_ATTR_PRIOR = 0b00100000
const SPRITE_ATTR_UNIMP = 0b00011100
const SPRITE_ATTR_PALET = 0b00000011

const PRI_OAM_SPRITE_COUNT = 64
const SEC_OAM_SPRITE_COUNT = 8
const PRI_OAM_DATA_SIZE    = PRI_OAM_SPRITE_COUNT * SPRITE_DATA_SIZE
const SEC_OAM_DATA_SIZE    = SEC_OAM_SPRITE_COUNT * SPRITE_DATA_SIZE

//https://wiki.nesdev.com/w/index.php/PPU_scrolling#PPU_internal_registers
const ADDR_BITS = 0b0111111111111111
const ADDR_y    = 0b0111000000000000 // fine Y scroll
const ADDR_NY   = 0b0000100000000000 // nametable Y select
const ADDR_NX   = 0b0000010000000000 // nametable X select
const ADDR_N    = ADDR_NY | ADDR_NX  // nametable both X and Y
const ADDR_Y    = 0b0000001111100000 // coarse Y scroll
const ADDR_X    = 0b0000000000011111 // coarse X scroll


class OAM {
    constructor(count) { this.value = new Uint8Array(count*SPRITE_DATA_SIZE);    this.addr = 0 }
    reset      ()      { for(var i=0; i<this.value.length; i++) this.value[i]=0; this.addr = 0 }
    
    addrInc    ()      { this.addr = (this.addr + 1) & BIT_8             }

    getAddr    ()      { return this.addr                                }
    setAddr    (val)   { this.addr = val & BIT_8                         }
    getEle     (i)     { return this.value[i]                            }
    setEle     (i,val) { this.value[i] = val & BIT_8                     }
    getCurrent ()      { return this.value[this.addr]                    }
    setCurrent (val)   { this.value[this.addr] = val & BIT_8             }
    getArr     ()      { return this.value                               }
    setArr     (val)   { this.value = val                                }
    getSprite  (i)     { return this.value.slice(SPRITE_DATA_SIZE*i,SPRITE_DATA_SIZE*(i+1)) }
    setSprite  (i,val) { 
        for(var a=0;a<SPRITE_DATA_SIZE;a++) this.value[SPRITE_DATA_SIZE*i+a] = val[a]
    }

    //Sprite
    getY       (i)     { return this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_Y] }
    getTile    (i)     { return this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_T] }
    getAttr    (i)     { return this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_A] }
    getX       (i)     { return this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_X] }

    setY       (i,val) { this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_Y] = val & BIT_8 }
    setTile    (i,val) { this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_T] = val & BIT_8 }
    setAttr    (i,val) { this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_A] = val & BIT_8 }
    setX       (i,val) { this.value[SPRITE_DATA_SIZE*i + SPRITE_DATA_X] = val & BIT_8 }

    //Tile
    getNumber  (i)     { return  this.getTile(i) & SPRITE_TILE_NUMB }
    getBank    (i)     { return  this.getTile(i) & SPRITE_TILE_BANK }

    //Attr
    isVFlip    (i)     { return (this.getAttr(i) & SPRITE_ATTR_VFLIP) != 0 }
    isHFlip    (i)     { return (this.getAttr(i) & SPRITE_ATTR_HFLIP) != 0 }
    isPrior    (i)     { return (this.getAttr(i) & SPRITE_ATTR_PRIOR) == 0 }
    getPalet   (i)     { return  this.getAttr(i) & SPRITE_ATTR_PALET       }
}
class Addr {
    constructor()    { this.value = 0               }
    reset      ()    { this.value = 0               }
    get        ()    { return this.value            }
    set        (val) { this.value = val & ADDR_BITS }

    getCoarseX ()    { return (this.value & ADDR_X)  >>>  0 }
    getCoarseY ()    { return (this.value & ADDR_Y)  >>>  5 }
    getNameTb  ()    { return (this.value & ADDR_N)  >>> 10 }
    getNameTbX ()    { return (this.value & ADDR_NX) >>> 10 }
    getNameTbY ()    { return (this.value & ADDR_NY) >>> 11 }
    getFineY   ()    { return (this.value & ADDR_y)  >>> 12 }
    
    setCoarseX (val) { this.value &= ~ADDR_X;  this.value |= ((val & BIT_5) <<  0) }
    setCoarseY (val) { this.value &= ~ADDR_Y;  this.value |= ((val & BIT_5) <<  5) }
    setNameTbX (val) { this.value &= ~ADDR_NX; this.value |= ((val & BIT_1) << 10) }
    setNameTbY (val) { this.value &= ~ADDR_NY; this.value |= ((val & BIT_1) << 11) }
    setFineY   (val) { this.value &= ~ADDR_y;  this.value |= ((val & BIT_3) << 12) }

    incCoarseX ()    { this.setCoarseX(this.getCoarseX() + 1) }
    incCoarseY ()    { this.setCoarseY(this.getCoarseY() + 1) }
    incFineY   ()    { this.setFineY(this.getFineY() + 1)     }
}
class FineX {
    constructor()    { this.value = 0           }
    reset      ()    { this.value = 0           }
    get        ()    { return this.value        }
    set        (val) { this.value = val & BIT_3 }
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
    set        (val) { this.value = val & BIT_8 }

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
    set        (val) { this.value = val & BIT_8 }

    isRenderBg ()    { return (this.value & MASK_b) != 0 }
    isRenderSp ()    { return (this.value & MASK_s) != 0 }

    isRenderBgL()    { return (this.value & MASK_m) != 0 }
    isRenderSpL()    { return (this.value & MASK_M) != 0 }

    isGray     ()    { return (this.value & MASK_g) != 0 }

    setRenderBg()    { this.value |=  MASK_b }
    clrRenderBg()    { this.value &= ~MASK_b } 

    isRendering()    { return this.isRenderBg() || this.isRenderSp() }
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

const SCANLINE_STATE_PRERENDER   = 0
const SCANLINE_STATE_VISIBLE     = 1
const SCANLINE_STATE_POSTRENDER  = 2
const SCANLINE_STATE_VBLANK      = 3
const SCANLINE_STATE_NOP         = 4
//https://wiki.nesdev.com/w/index.php/PPU_rendering#Cycle_0
class RenderIterator {
    constructor()    { this.frame = 0; this.scanline = 0; this.cycle = 0 }
    reset      ()    { this.frame = 0; this.scanline = 0; this.cycle = 0 }
    
    getFrame   ()    { return this.frame    }
    getScanline()    { return this.scanline }
    getCycle   ()    { return this.cycle    }

    isOddFrame ()    { return (this.frame & 1) == 1 }

    getScanlineState()  {
             if(this.scanline <  240) return SCANLINE_STATE_VISIBLE
        else if(this.scanline == 240) return SCANLINE_STATE_POSTRENDER
        else if(this.scanline == 241) return SCANLINE_STATE_VBLANK
        else if(this.scanline == 261) return SCANLINE_STATE_PRERENDER
        else return SCANLINE_STATE_NOP
    }

    //https://wiki.nesdev.com/w/index.php/PPU_frame_timing
    iterate(rendering){
        this.iterateCycle()
        if(rendering && this.isOddFrame() && ((this.scanline == 0) && (this.cycle == 0)))
        { this.scanline = 0; this.cycle = 1 }
    }
    iterateCycle(){
        this.cycle++
        if(this.cycle > 340) this.iterateScanline()
    }
    iterateScanline(){
        this.cycle = 0
        this.scanline++
        if(this.scanline > 261) { this.scanline = 0; this.frame++ }
    }
}

class RenderInfo {
    constructor(){
        //Background
        this.bg_nt = 0
        this.bg_at = 0
        this.bg_l  = 0
        this.bg_h  = 0
        //Background shifter
        this.bg_s_ptn_l = 0
        this.bg_s_ptn_h = 0
        this.bg_s_atr_l = 0
        this.bg_s_atr_h = 0
        //Sprite
        this.spriteCount = 0
        this.sp_s_ptn_l = new Uint8Array(SEC_OAM_SPRITE_COUNT)
        this.sp_s_ptn_h = new Uint8Array(SEC_OAM_SPRITE_COUNT)

        this.spriteZeroHitPossible   = false
	    this.spriteZeroBeingRendered = false
    }

    reset(){
        this.bg_nt = 0
        this.bg_at = 0
        this.bg_l  = 0
        this.bg_h  = 0
        this.bg_s_ptn_l = 0
        this.bg_s_ptn_h = 0
        this.bg_s_atr_l = 0
        this.bg_s_atr_h = 0
    }

    resetSprite(){
        for(var i=0;i<SEC_OAM_SPRITE_COUNT;i++){
            this.sp_s_ptn_l[i] = 0
            this.sp_s_ptn_h[i] = 0
        }
        this.spriteCount = 0
        this.spriteZeroHitPossible = false
    }
}

class PPU {
    //https://wiki.nesdev.com/w/index.php/PPU_rendering
    constructor(bus,screen){
        //Sprite
        this.priOam = new OAM(PRI_OAM_SPRITE_COUNT)   //64 sprites for the frame (64*4(x,y,color,tile))
        this.secOam = new OAM(SEC_OAM_SPRITE_COUNT)   // 8 sprites for the current scanline

        //Background
        //https://wiki.nesdev.com/w/index.php/PPU_scrolling
        this.v    = new Addr()    //15 bits  Current VRAM address
        this.t    = new Addr()    //15 bits  Temporary VRAM address; can also be thought of as the address of the top left onscreen tile.
        this.x    = new FineX()   //3  bits  Fine X scroll
        this.w    = new WLatch()  //1  bit   First or second write toggle

        //IO
        this.ctrl = new Ctrl()    //0x2000
        this.mask = new Mask()    //0x2001
        this.stat = new Stat()    //0x2002
        this.reg_buffer = 0

        this.bus = bus
        this.screen = screen

        this.pixelIter = new RenderIterator()
        this.render = new RenderInfo()
    }
    busR    ()          { return this.bus.r(this.v.get()) }
    busW    (data)      { this.bus.w(this.v.get(),data)   }
    busRAddr(addr)      { return this.bus.r(addr)         }
    busWAddr(addr,data) { this.bus.w(addr,data)           }

    incAddr () { this.v.set(this.v.get() + this.ctrl.getAddrInc()) }

    RST (){
        this.priOam.reset()
        this.secOam.reset()
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
    REG_OAMD_R (){ return this.priOam.getCurrent() }
    //0x2007 PPUDATA
    REG_DATA_R (){
        //Nametable -> delay, palette -> no delay.
        var data
        if((this.v.get() & 0x3FFF) >= 0x3F00){
            data = this.busR()
        }
        else{
            data = this.reg_buffer
            this.reg_buffer = this.busR()
        }
        this.incAddr()
        return data
    }
    //0x2000 PPUCTRL
    REG_CTRL_W (val){
        this.ctrl.set(val)
        this.t.set((this.t.get() & ~(ADDR_NY|ADDR_NX)) | ((val & CTRL_N) << 10))
    }
    //0x2001 PPUMASK
    REG_MASK_W (val){ this.mask.set(val) }
    //0x2003 OAMAADDR
    REG_OAMA_W (val){ this.priOam.setAddr(val) }
    //0x2004 OAMDATA
    REG_OAMD_W (val){
        this.priOam.setCurrent(val)
        this.priOam.addrInc()
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
            this.t.set((this.t.get() & 0x00FF) | ((val & BIT_6) << 8))
        }else{
            this.t.set((this.t.get() & 0xFF00) | (val & BIT_8))
            this.v.set(this.t.get())
        }
        this.w.trigger()
    }
    //0x2007 PPUDATA
    REG_DATA_W (val){
        this.busW(val)
        this.incAddr()
    }

    
    incScrollX(){
        if(!this.mask.isRendering()) return
        if(this.v.getCoarseX() == 0x1F){
            this.v.setCoarseX(0)
            this.v.setNameTbX(~this.v.getNameTbX())
        }else this.v.incCoarseX()
    }
    incScrollY(){
        if(!this.mask.isRendering()) return
        if(this.v.getFineY() < 7) this.v.incFineY()
        else{
            this.v.setFineY(0)
                 if(this.v.getCoarseY() == 29) { this.v.setCoarseY(0); this.v.setNameTbY(~this.v.getNameTbY()) }
            else if(this.v.getCoarseY() == 31) { this.v.setCoarseY(0)                                          }
            else                               { this.v.incCoarseY()                                           }
        }
    }
    transferAddrX(){
        if(!this.mask.isRendering()) return
        this.v.setNameTbX(this.t.getNameTbX())
        this.v.setCoarseX(this.t.getCoarseX())
    }
    transferAddrY(){
        if(!this.mask.isRendering()) return
        this.v.setNameTbY(this.t.getNameTbY())
        this.v.setCoarseY(this.t.getCoarseY())
        this.v.setFineY  (this.t.getFineY()  )
    }
    reloadBgShifter(){
        this.render.bg_s_ptn_l = (this.render.bg_s_ptn_l & 0xFF00) | (this.render.bg_l & 0x00FF)
        this.render.bg_s_ptn_h = (this.render.bg_s_ptn_h & 0xFF00) | (this.render.bg_h & 0x00FF)

        this.render.bg_s_atr_l = (this.render.bg_s_atr_l & 0xFF00) | (((this.render.bg_at & 0b01) > 0) ? 0xFF:0x00)
        this.render.bg_s_atr_h = (this.render.bg_s_atr_h & 0xFF00) | (((this.render.bg_at & 0b10) > 0) ? 0xFF:0x00)
    }
    updateShifter(){
        if(this.mask.isRenderBg()){
            this.render.bg_s_ptn_l = (this.render.bg_s_ptn_l << 1) & BIT_16
            this.render.bg_s_ptn_h = (this.render.bg_s_ptn_h << 1) & BIT_16
            this.render.bg_s_atr_l = (this.render.bg_s_atr_l << 1) & BIT_16
            this.render.bg_s_atr_h = (this.render.bg_s_atr_h << 1) & BIT_16
        }
        if(this.mask.isRenderSp()){
            var cycle = this.pixelIter.getCycle()
            if(cycle>0 && cycle<258){
                for(var i=0;i<this.render.spriteCount;i++){
                    var x = this.secOam.getX(i)
                    if (x > 0)this.secOam.setX(i,x-1)
                    else
                    {
                        this.render.sp_s_ptn_l[i] = (this.render.sp_s_ptn_l[i] << 1) & BIT_8
                        this.render.sp_s_ptn_h[i] = (this.render.sp_s_ptn_h[i] << 1) & BIT_8
                    }
                }
            }
        }
    }

    //https://wiki.nesdev.com/w/images/d/d1/Ntsc_timing.png
    //Background
    fetchNTAddr () { return 0x2000 | (this.v.get() & 0x0FFF) }
    fetchNT (addr) { this.render.bg_nt = this.busRAddr(addr) }
    fetchATAddr () { return 0x23C0 | (this.v.getNameTb() << 10) | ((this.v.getCoarseY() >>> 2) << 3) | (this.v.getCoarseX() >>> 2) }
    fetchAT (addr) { this.render.bg_at = (this.busRAddr(addr) >>> (((this.v.getCoarseY() & 0x02) != 0) ? 4 : 0)) >>> (((this.v.getCoarseX() & 0x02) != 0) ? 2 : 0) }
    fetchBGAddr () { return ((this.ctrl.isBgSel()?1:0) << 12) + (this.render.bg_nt << 4) + this.v.getFineY() }
    fetchBGL(addr) { this.render.bg_l = this.busRAddr(addr) }
    fetchBGH(addr) { this.render.bg_h = this.busRAddr(addr) }
    fetch(step){
        this.updateShifter()
        switch(step){
            case 0 : this.fetchBuffer = this.fetchNTAddr(); this.reloadBgShifter(); break
            case 1 : this.fetchNT(this.fetchBuffer);                                break
            case 2 : this.fetchBuffer = this.fetchATAddr();                         break
            case 3 : this.fetchAT(this.fetchBuffer);                                break
            case 4 : this.fetchBuffer = this.fetchBGAddr();                         break
            case 5 : this.fetchBGL(this.fetchBuffer);                               break
            case 6 : this.fetchBuffer = (this.fetchBuffer + 8) & BIT_16;            break
            case 7 : this.fetchBGH(this.fetchBuffer); this.incScrollX();            break
        }
    }
    visibleScanline(cycle){
        //if((cycle>=  1) && (cycle<=256)) { this.fetch((cycle -   1) % 0x08)             }
        //if((cycle>=321) && (cycle<=336)) { this.fetch((cycle - 321) % 0x08)             }
        // https://wiki.nesdev.com/w/images/d/d1/Ntsc_timing.png
        // https://wiki.nesdev.com/w/index.php/PPU_rendering Visible scanlines Cycles 1-256 Note:
        // -Sprite zero hits act as if the image starts at cycle 2 (which is the same cycle that the shifters shift for the first time),
        // -so the sprite zero flag will be raised at this point at the earliest.
        // -Actual pixel output is delayed further due to internal render pipelining, and the first pixel is output during cycle 4. 
        // -The shifters are reloaded during ticks 9, 17, 25, ..., 257.
        // -At the beginning of each scanline, the data for the first two tiles is already loaded into the shift registers (and ready to be rendered),
        // -so the first tile that gets fetched is Tile 3. 
        if( cycle==  1                 ) { this.fetchBuffer = this.fetchNTAddr()        }
        if((cycle>=  2) && (cycle<=256)) { this.fetch((cycle -   1) % 0x08)             }

        if( cycle==256                 ) { this.incScrollY()                            }
        if( cycle==257                 ) { this.reloadBgShifter(); this.transferAddrX() }

        if( cycle==321                 ) { this.fetchBuffer = this.fetchNTAddr()        }
        if((cycle>=322) && (cycle<=337)) { this.fetch((cycle - 321) % 0x08)             }
        if( cycle==338                 ) { this.fetchNT(this.fetchBuffer)               }
        if( cycle==339                 ) { this.fetchBuffer = this.fetchNTAddr()        }
        if( cycle==340                 ) { this.fetchNT(this.fetchBuffer)               }
    }
    postRenderScanline(cycle){
        //It should do nothing on hardware, anyway I put Canvas update here.
        if(cycle == 0                  ) this.screen.updateCanvas()
    }
    vBlankScanline(cycle){
        if(cycle == 1                  ) { this.stat.setVBlank(); if(this.ctrl.isVBlank()) this.bus.nmi() }
    }
    prerenderScanline(cycle){
        if(cycle == 1                  ) this.stat.clrAll()
        if(cycle >= 280 && cycle <= 304) this.transferAddrY()
        this.visibleScanline(cycle)
    }
    //Sprite
    scanlineRender(){
        var cycle = this.pixelIter.getCycle()
        if(cycle == 340){

            for(var i=0;i<this.render.spriteCount;i++){

                var sp_ptn_data_l = 0
                var sp_ptn_data_h = 0
                var sp_ptn_addr_l = 0
                var sp_ptn_addr_h = 0

                var is8x16 = this.ctrl.is8x16()
                var vf = this.secOam.isVFlip(i)
                
                var diff = (this.pixelIter.getScanline() - this.secOam.getY(i))
                if(is8x16){
                    sp_ptn_addr_l = 
                            (this.secOam.getBank(i) << 12) |
                            ((((this.secOam.getNumber(i)) + (vf?(diff<8?1:0):(diff<8?0:1))) &0xFF) << 4) |
                            ((vf?(7 - diff & BIT_3):(diff & BIT_3)) & BIT_4)
                }else{
                    sp_ptn_addr_l = 
                            ((this.ctrl.isSpSel()?1:0) << 12) |
                            (this.secOam.getTile(i) << 4) |
                            ((vf?(7 - diff):diff) & BIT_4)
                }

                sp_ptn_addr_h = (sp_ptn_addr_l + 8) & BIT_16

                sp_ptn_data_l = this.busRAddr(sp_ptn_addr_l)
                sp_ptn_data_h = this.busRAddr(sp_ptn_addr_h)

                if(this.secOam.isHFlip(i)){
                    sp_ptn_data_l = parseInt((sp_ptn_data_l & BIT_8).toString(2).padStart(8, '0').split("").reverse().join(""),2) & BIT_8
                    sp_ptn_data_h = parseInt((sp_ptn_data_h & BIT_8).toString(2).padStart(8, '0').split("").reverse().join(""),2) & BIT_8
                }

                this.render.sp_s_ptn_l[i] = sp_ptn_data_l
                this.render.sp_s_ptn_h[i] = sp_ptn_data_h
            }
        }
    }
    scanlineVisible(){
        var cycle = this.pixelIter.getCycle()
        if(cycle == 257){
            this.secOam.reset()
            this.render.resetSprite()
            for(var entry = 0; (entry < 64) && (this.render.spriteCount <= SEC_OAM_SPRITE_COUNT); entry++){
                var diff = (this.pixelIter.getScanline() - this.priOam.getY(entry))// & 0xFFFF
                if(diff >= 0 && diff < (this.ctrl.getSpriteH())){
                    if(this.render.spriteCount < SEC_OAM_SPRITE_COUNT){
                        if(entry == 0) this.render.spriteZeroHitPossible = true
                        this.secOam.setSprite(this.render.spriteCount,this.priOam.getSprite(entry))
                        this.render.spriteCount++
                    }
                }
            }
            if(this.render.spriteCount > SEC_OAM_SPRITE_COUNT) this.stat.setOv()
            else this.stat.clrOv()
        }
    }
    

    clock(){
        var scanlineState = this.pixelIter.getScanlineState()
        var cycle = this.pixelIter.getCycle()
        var scanline = this.pixelIter.getScanline()

        switch(scanlineState){
            case SCANLINE_STATE_PRERENDER: this.prerenderScanline(cycle); break
            case SCANLINE_STATE_VISIBLE: this.visibleScanline(cycle); this.scanlineRender(); this.scanlineVisible(); break
            case SCANLINE_STATE_POSTRENDER: this.postRenderScanline(cycle); break
            case SCANLINE_STATE_VBLANK: this.vBlankScanline(cycle); break
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
                if(this.secOam.getX(i)!=0) continue
                
                var pl = (this.render.sp_s_ptn_l[i] & 0x80) != 0 ? 1 : 0
                var ph = (this.render.sp_s_ptn_h[i] & 0x80) != 0 ? 1 : 0
                sp_pixel = (ph << 1) | pl

                sp_palet = (this.secOam.getPalet(i) | 0b0100) & BIT_8
                sp_prior = this.secOam.isPrior(i)

                if(sp_pixel!=0){
                    if(i==0 && this.render.spriteZeroHitPossible)this.render.spriteZeroBeingRendered = true
                    break
                }
            }
        }
        
        //-----
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

        this.screen.updatePixelPicker(cycle-1,scanline,this.busRAddr(0x3F00+(palet<<2)+pixel) & BIT_6)

        this.pixelIter.iterate(this.mask.isRenderBg() || this.mask.isRenderSp())
    }
}

export default PPU