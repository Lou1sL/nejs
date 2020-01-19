

//https://wiki.nesdev.com/w/index.php/INES
class Mapper {
    constructor(rom){
        
        var prgSize    = rom[4] * 0x4000
        var chrSize    = rom[5] * 0x2000
        var hasTrainer = ((rom[6] >> 2) & 1) == 1
        var isHori     = ((rom[6] >> 0) & 1) == 0
        var useBat     = ((rom[6] >> 1) & 1) == 1
        var is4Scr     = ((rom[6] >> 3) & 1) == 1
        var mapperNo   = (rom[7] & 0xF0) | (rom[6] >> 4)
        var wramSize   = rom[8] ? rom[8] * 0x2000 : 0x2000

        var prgIndex = 16 + (hasTrainer?512:0)
        var chrIndex = prgIndex + prgSize

        var prg      = rom.slice(prgIndex,prgIndex + prgSize)
        var chr      = rom.slice(chrIndex,chrIndex + chrSize)//TODO:double it for 32K
        var wram     = new Uint8Array(wramSize)
        console.log(
            'ROM Info: \n' + 
            'PRG: ' + prgSize + ' Byte(s). \n' + 
            'CHR: ' + chrSize + ' Byte(s). \n' + 
            'WRAM: ' + wramSize + ' Byte(s). \n' + 
            'Mirroring: ' + (isHori ? 'Horizontal' : 'Vertical') + '.\n' + 
            'MapperNo: ' + mapperNo + '.\n' + 
            'Contain Trainer: ' + hasTrainer + '.')

        switch(mapperNo){
            case 0 : break
            default : throw('MapperNo not supported yet...')
        }
        

        return {prg, chr, wram, isHori, useBat, is4Scr, mapperNo }
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



    readPRG(addr){
        if (addr >= 0x8000) return this.prg[this.prgMap[(addr - 0x8000) / 0x2000] + ((addr - 0x8000) % 0x2000)]
        else return this.prgRam[addr - 0x6000]
    }
    readCHR(addr){
        return this.chr[this.chrMap[addr / 0x400] + (addr % 0x400)]
    }
    mapPRG(){
        for (var i = 0; i < 4; i++)
            this.prgMap[i] = (0x2000*i) % this.prgSize
    }
    mapCHR(){
        for (var i = 0; i < 8; i++)
            this.chrMap[i] = (0x400*i) % this.chrSize
    }
}

module.exports = Mapper