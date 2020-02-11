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

//http://wiki.nesdev.com/w/index.php/MMC3
class Mapper0 {
    constructor(romData){
        this.prg = new Uint8Array(CART_PRGROM_SIZE)
        this.chr = new Uint8Array(CART_CHRROM_SIZE)

        this.prg.set(romData.prg)
        this.chr.set(romData.chr)

        if(romData.prgSize < CART_PRGROM_SIZE) this.prg.set(romData.prg,romData.prgSize)
    }

    PRGRead    (addr)      { return this.prg[addr] }
    PRGWrite   (addr,data) { this.prg[addr] = data }
    CHRRead    (addr)      { return this.chr[addr] }
    CHRWrite   (addr,data) { this.chr[addr] = data }
}


//http://wiki.nesdev.com/w/index.php/MMC3
class MMC3 {
    PRGRead(addr){

    }
    PRGWrite(addr,data){

    }
    CHRRead(addr){

    }
    CHRWrite(addr,data){

    }
}

class Cartridge {
    constructor(rom){
        this.romData = new RomData(rom)
        switch(this.romData.mapperNo){
            case 0  : this.mapper = new Mapper0(this.romData); break
            default : throw('MapperNo.'+mapperNo+' not supported yet...')
        }
    }
    isHoriMirr() { return this.mapper.isHoriMirr }

    //ExROM only used in MMC5
    EXROMRead(addr)       { return this.mapper.EXROMRead(addr) }
    EXROMWrite(addr,data) { this.mapper.EXROMWrite(addr,data)  }
    SRAMRead(addr)        { return this.mapper.SRAMRead(addr)  }
    SRAMWrite(addr,data)  { this.mapper.SRAMWrite(addr,data)   }
    PRGRead(addr)         { return this.mapper.PRGRead(addr)   }
    PRGWrite(addr,data)   { this.mapper.PRGWrite(addr,data)    }
    CHRRead(addr)         { return this.mapper.CHRRead(addr)   }
    CHRWrite(addr,data)   { this.mapper.CHRWrite(addr,data)    }
}

export default Cartridge