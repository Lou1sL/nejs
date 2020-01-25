

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

        var prgData  = rom.slice(prgIndex,prgIndex + prgSize)
        var chr      = rom.slice(chrIndex,chrIndex + chrSize)
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
        
        var prg = new Uint8Array(0x8000)
        if(rom[4] == 1) { prg.set(prgData); prg.set(prgData,0x4000) }
        if(rom[4] == 2) { prg.set(prgData) }
        return {prg, chr, wram, isHori, useBat, is4Scr, mapperNo }
    }
}

export default Mapper