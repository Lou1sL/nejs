const CART_PRGROM_SIZE = 0x8000
const CART_CHRROM_SIZE = 0x2000
const CART_SRAM_SIZE   = 0x2000
const CART_ExROM_SIZE  = 0x1FE0

//https://wiki.nesdev.com/w/index.php/NROM
class NROM {
    constructor(romData,bus){
        this.isHori = romData.isHoriMirr
        this.prg  = new Uint8Array(CART_PRGROM_SIZE)
        this.chr  = new Uint8Array(CART_CHRROM_SIZE)
        this.sram = new Uint8Array(CART_SRAM_SIZE)
        this.prg.set(romData.prg)
        this.chr.set(romData.chr)
        if(romData.prgSize < CART_PRGROM_SIZE) this.prg.set(romData.prg,romData.prgSize)
    }
    bindBUS    (bus)      { this.bus = bus         }
    isHoriMirr ()         { return this.isHori     }
    scanlineSig()         {                        }

    PRGRead   (addr)      { return this.prg[addr]  }
    PRGWrite  (addr,data) { this.prg[addr] = data  }
    CHRRead   (addr)      { return this.chr[addr]  }
    CHRWrite  (addr,data) { this.chr[addr] = data  }
    SRAMRead  (addr)      { return this.sram[addr] }
    SRAMWrite (addr,data) { this.sram[addr] = data }
    EXROMRead (addr)      { return 0               }
    EXROMWrite(addr,data) {                        }
}

export default NROM