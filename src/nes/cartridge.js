
import NROM from './mapper/nrom'
import MMC3 from './mapper/mmc3'


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

class Cartridge {
    constructor(rom){
        var romData = new RomData(rom)
        switch(romData.mapperNo){
            case 0  : this.mapper = new NROM(romData); break
            case 4  : this.mapper = new MMC3(romData); break
            default : throw('MapperNo.'+romData.mapperNo+' not supported yet...')
        }
    }
    bindBUS(bus) { this.mapper.bindBUS(bus) }
    
    isHoriMirr ()          { return this.mapper.isHoriMirr()    }
    scanlineSig()          { this.mapper.scanlineSig()          }
    
    PRGRead    (addr)      { return this.mapper.PRGRead(addr)   }
    PRGWrite   (addr,data) { this.mapper.PRGWrite(addr,data)    }
    CHRRead    (addr)      { return this.mapper.CHRRead(addr)   }
    CHRWrite   (addr,data) { this.mapper.CHRWrite(addr,data)    }
    SRAMRead   (addr)      { return this.mapper.SRAMRead(addr)  }
    SRAMWrite  (addr,data) { this.mapper.SRAMWrite(addr,data)   }
    //ExROM only used in MMC5
    EXROMRead  (addr)      { return this.mapper.EXROMRead(addr) }
    EXROMWrite (addr,data) { this.mapper.EXROMWrite(addr,data)  }

}

export default Cartridge