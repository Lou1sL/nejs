const PPU = require('./ppu')

class mapper {
    constructor(rom){
        this.prgSize      = rom[4] * 0x4000
        this.chrSize      = rom[5] * 0x2000
        this.prgRamSize   = rom[8] ? rom[8] * 0x2000 : 0x2000

        PPU.setMirroring((rom[6] & 1) ? PPU.VERTICAL : PPU.HORIZONTAL)

        var mapperNum = (rom[7] & 0xF0) | (rom[6] >> 4)

        switch (mapperNum)
        {
            case 0:  mapper = new Mapper0(rom); break;
            case 1:  mapper = new Mapper1(rom); break;
            case 2:  mapper = new Mapper2(rom); break;
            case 3:  mapper = new Mapper3(rom); break;
            case 4:  mapper = new Mapper4(rom); break;
        }

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