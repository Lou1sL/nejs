const CART_PRGROM_SIZE = 0x8000
const CART_CHRROM_SIZE = 0x2000
const CART_SRAM_SIZE   = 0x2000
const CART_ExROM_SIZE  = 0x1FE0



//https://wiki.nesdev.com/w/index.php/INES
class RomData {
    constructor(rom){

        var prgSize    = rom[4] * 0x4000
        var chrSize    = rom[5] * 0x2000
        var isHoriMirr = ((rom[6] >> 0) & 1) == 0
        var isSRamPers = ((rom[6] >> 1) & 1) == 1
        var hasTrainer = ((rom[6] >> 2) & 1) == 1
        var is4Scr     = ((rom[6] >> 3) & 1) == 1
        var mapperNo   = (rom[6] >> 4) | (rom[7] & 0xF0)
        var sRamSize   = (rom[8] != 0) ? rom[8] * 0x2000 : 0x2000

        var prgIndex = 16 + (hasTrainer?512:0)
        var chrIndex = prgIndex + prgSize

        var prg  = rom.slice(prgIndex,prgIndex + prgSize)
        var chr  = rom.slice(chrIndex,chrIndex + chrSize)

        console.log(
            'ROM Info: \n' + 
            'PRG: ' + prgSize + ' Byte(s). \n' + 
            'CHR: ' + chrSize + ' Byte(s). \n' + 
            'SRAM: ' + sRamSize + ' Byte(s). \n' + 
            'Mirroring: ' + (isHoriMirr ? 'Horizontal' : 'Vertical') + '.\n' + 
            'MapperNo: ' + mapperNo + '.\n' + 
            'Contain Trainer: ' + hasTrainer + '.')

        return { mapperNo, prgSize, prg, chrSize, chr, isHoriMirr, is4Scr, sRamSize, isSRamPers }
    }
}

//https://wiki.nesdev.com/w/index.php/NROM
class NROM {
    constructor(romData,bus){
        this.romData = romData
        this.bus     = bus

        this.prg  = new Uint8Array(CART_PRGROM_SIZE)
        this.chr  = new Uint8Array(CART_CHRROM_SIZE)
        this.sram = new Uint8Array(CART_SRAM_SIZE)

        this.prg.set(romData.prg)
        this.chr.set(romData.chr)

        if(romData.prgSize < CART_PRGROM_SIZE) this.prg.set(romData.prg,romData.prgSize)
    }

    isHoriMirr()          { return this.romData.isHoriMirr }

    PRGRead   (addr)      { return this.prg[addr]  }
    PRGWrite  (addr,data) { this.prg[addr] = data  }
    CHRRead   (addr)      { return this.chr[addr]  }
    CHRWrite  (addr,data) { this.chr[addr] = data  }
    SRAMRead  (addr)      { return this.sram[addr] }
    SRAMWrite (addr,data) { this.sram[addr] = data }
    EXROMRead (addr)      { return 0               }
    EXROMWrite(addr,data) {                        }
}



const MMC3_PRG_BANK_SEL = 0b0110000000000000
const MMC3_PRG_BANK_0   = 0b0000000000000000 // 0x0000 - 0x1FFF or 0x4000 - 0x5FFF 8 KB switchable PRG ROM bank
const MMC3_PRG_BANK_1   = 0b0010000000000000 // 0x2000 - 0x3FFF                    8 KB switchable PRG ROM bank
const MMC3_PRG_BANK_2   = 0b0100000000000000 // 0x4000 - 0x5FFF or 0x0000 - 0x1FFF 8 KB switchable PRG ROM bank (fixed)
const MMC3_PRG_BANK_3   = 0b0110000000000000 // 0x6000 - 0x7FFF                    8 KB switchable PRG ROM bank (fixed)


//http://wiki.nesdev.com/w/index.php/MMC3
const MMC3_BANKSEL_CHRA12INV = 0b10000000
const MMC3_BANKSEL_PRGSWPMOD = 0b01000000
const MMC3_BANKSEL_UNIMPLIED = 0b00111000
const MMC3_BANKSEL_REGSELECT = 0b00000111
class MMC3 {
    constructor(romData,bus){
        this.romData    = romData
        this.isHoriMirr = this.romData.isHoriMirr
        this.bus        = bus
        this.bankSel    = 0x00
        this.bankDat    = new Uint8Array(8)
        

        this.prg0 = new Uint8Array(CART_PRGROM_SIZE)
        this.prg1 = new Uint8Array(CART_PRGROM_SIZE)
        this.prg2 = new Uint8Array(CART_PRGROM_SIZE) //Fixed
        this.prg3 = new Uint8Array(CART_PRGROM_SIZE) //Fixed

        this.chr0 = new Uint8Array(CART_CHRROM_SIZE)
        this.chr1 = new Uint8Array(CART_CHRROM_SIZE)
        this.chr2 = new Uint8Array(CART_CHRROM_SIZE / 2)
        this.chr3 = new Uint8Array(CART_CHRROM_SIZE / 2)
        this.chr4 = new Uint8Array(CART_CHRROM_SIZE / 2)
        this.chr5 = new Uint8Array(CART_CHRROM_SIZE / 2)

        
        this.sram = new Uint8Array(CART_SRAM_SIZE)
    }

    isHoriMirr()          { return this.isHoriMirr }
    PRGRead(addr){
             if(addr < 0x2000) return this.prg0[addr - 0x0000]
        else if(addr < 0x4000) return this.prg1[addr - 0x2000]
        else if(addr < 0x6000) return this.prg2[addr - 0x4000]
        else if(addr < 0x8000) return this.prg3[addr - 0x6000]
    }
    PRGWrite(addr,data){
        var bank = addr & MMC3_PRG_BANK_SEL
        var even = (addr & 1) == 0

        switch(bank){
            case MMC3_PRG_BANK_0: //Bank select, Bank data
            if(even){
                this.bankSel = data
            }else{
                this.bankDat[this.bankSel & MMC3_BANKSEL_REGSELECT] = data
            }
            break
            case MMC3_PRG_BANK_1: //Mirroring, PRG RAM protect
            if(even){ if(!this.romData.is4Scr) this.isHoriMirr = (data & 1) != 0 }
            else    { }
            break
            case MMC3_PRG_BANK_2: //IRQ latch, IRQ reload
            if(even){
                    
            }else{
                
            }
            break
            case MMC3_PRG_BANK_3: //IRQ disable, IRQ enable
            if(even){
                    
            }else{
                
            }
            break
        }
    }
    CHRRead(addr){
             if(addr < 0x0800) return this.chr0[addr - 0x0000]
        else if(addr < 0x1000) return this.chr1[addr - 0x0800]
        else if(addr < 0x1400) return this.chr2[addr - 0x1000]
        else if(addr < 0x1800) return this.chr3[addr - 0x1400]
        else if(addr < 0x1C00) return this.chr4[addr - 0x1800]
        else if(addr < 0x2000) return this.chr5[addr - 0x1C00]
    }
    CHRWrite(addr,data){
             if(addr < 0x0800) this.chr0[addr - 0x0000] = data
        else if(addr < 0x1000) this.chr1[addr - 0x0800] = data
        else if(addr < 0x1400) this.chr2[addr - 0x1000] = data
        else if(addr < 0x1800) this.chr3[addr - 0x1400] = data
        else if(addr < 0x1C00) this.chr4[addr - 0x1800] = data
        else if(addr < 0x2000) this.chr5[addr - 0x1C00] = data
    }

    SRAMRead  (addr)      { return this.sram[addr] }
    SRAMWrite (addr,data) { this.sram[addr] = data }
    EXROMRead (addr)      { return 0               }
    EXROMWrite(addr,data) {                        }
}

class Cartridge {
    constructor(rom){
        var romData = new RomData(rom)
        switch(romData.mapperNo){
            case 0  : this.mapper = new NROM(romData,this.bus); break
            case 4  : this.mapper = new MMC3(romData,this.bus); break
            default : throw('MapperNo.'+romData.mapperNo+' not supported yet...')
        }
    }
    isHoriMirr() { return this.mapper.isHoriMirr() }
    bindBUS(bus) { this.bus = bus                  }

    PRGRead(addr)         { return this.mapper.PRGRead(addr)   }
    PRGWrite(addr,data)   { this.mapper.PRGWrite(addr,data)    }
    CHRRead(addr)         { return this.mapper.CHRRead(addr)   }
    CHRWrite(addr,data)   { this.mapper.CHRWrite(addr,data)    }
    SRAMRead(addr)        { return this.mapper.SRAMRead(addr)  }
    SRAMWrite(addr,data)  { this.mapper.SRAMWrite(addr,data)   }
    //ExROM only used in MMC5
    EXROMRead(addr)       { return this.mapper.EXROMRead(addr) }
    EXROMWrite(addr,data) { this.mapper.EXROMWrite(addr,data)  }

}

export default Cartridge