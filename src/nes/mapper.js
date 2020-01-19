
class Mapper {
    constructor(rom){
        //https://wiki.nesdev.com/w/index.php/INES
        this.prgSize    = rom[4] * 0x4000
        this.chrSize    = rom[5] * 0x2000
        this.isHoriMirr = ((rom[6] >> 0) & 1) == 0
        this.batteryPrg = ((rom[6] >> 1) & 1) == 1
        this.hasTrainer = ((rom[6] >> 2) & 1) == 1
        this.fourScreen = ((rom[6] >> 3) & 1) == 1
        this.mapperNum   = (rom[7] & 0xF0) | (rom[6] >> 4)
        this.prgRamSize   = rom[8] ? rom[8] * 0x2000 : 0x2000

        
        console.log(
            'Cartridge Info: \n' + 
            'PRG: ' + this.prgSize + ' Byte(s). \n' + 
            'CHR: ' + this.chrSize + ' Byte(s). \n' + 
            'PRG(ram): ' + this.prgRamSize + ' Byte(s). \n' + 
            'Mirroring: ' + (this.isHoriMirr ? 'Horizontal' : 'Vertical') + '\n' + 
            'MapperNo: ' + this.mapperNum)
    }

    
    readPRG(addr){
        if (addr >= 0x8000) return this.prg[this.prgMap[(addr - 0x8000) / 0x2000] + ((addr - 0x8000) % 0x2000)]
        else return this.prgRam[addr - 0x6000]
    }
    readCHR(addr){
        return this.chr[this.chrMap[addr / 0x400] + (addr % 0x400)]
    }
    mapPRG(slot,bank,pageKBs){
        if (bank < 0)
            bank = (prgSize / (0x400*pageKBs)) + bank
        for (var i = 0; i < (pageKBs/8); i++)
            this.prgMap[(pageKBs/8) * slot + i] = (pageKBs*0x400*bank + 0x2000*i) % this.prgSize
    }
    mapCHR(slot,bank,pageKBs){
        for (var i = 0; i < pageKBs; i++)
            this.chrMap[pageKBs*slot + i] = (pageKBs*0x400*bank + 0x400*i) % this.chrSize
    }
}

module.exports = Mapper