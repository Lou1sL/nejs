


//Ref: http://nesdev.com/NESDoc.pdf Page.34 Appendix B

/** 
 * CPU ADDRESS MAP
 * 
 * RAM       : 2048  Bytes = 0x0800 = 0x0100 0page + 0x0100 stack + 0x0600 ram
 * IO        : 40    Bytes = 0x0028 = 0x0008 ppu io + 0x0020 apu(except ODMA) io
 * External  : 49120 Bytes = 0xBFE0 = 0x1FE0 exrom + 0x2000 wram + 0x8000 prgrom
 * Mirrored  : 14328 Bytes = 0x37F8 = 0x0800*3 ram mirror + 0x0008*1023 io mirror
 * 
 * TOTAL     : 65536 Bytes (16-bit address)
*/

const CPU_ADDR_SIZE     = 0x10000
const CPU_RAM_SIZE      = 0x0800
const CPU_RAM_ADDR_SIZE = 0x2000
const CPU_ExROM_SIZE    = 0x1FE0
const CPU_WRAM_SIZE     = 0x2000
const CPU_PRGROM_SIZE   = 0x8000

const CPU_MEM_0PAGE       = 0x0000  // 0x0100
const CPU_MEM_STACK       = 0x0100  // 0x0100
const CPU_MEM_RAM         = 0x0200  // 0x0600
//0x0800 - 0x1FFF                    : Mirrors of 0x0000 - 0x07FF (x3)
// Registers (on CPU bus,for controlling PPU):
// https://wiki.nesdev.com/w/index.php/PPU_registers
const CPU_MEM_IO_PPU_CTRL = 0x2000  // PPUCTRL     VPHB SINN    W
const CPU_MEM_IO_PPU_MASK = 0x2001  // PPUMASK     BGRs bMmG    W
const CPU_MEM_IO_PPU_STAT = 0x2002  // PPUSTATUS   VSO- ----          R(VSO)
const CPU_MEM_IO_PPU_OAMA = 0x2003  // OAMADDR     aaaa aaaa    W
const CPU_MEM_IO_PPU_OAMD = 0x2004  // OAMDATA     dddd dddd    W     R
const CPU_MEM_IO_PPU_SCRL = 0x2005  // PPUSCROLL   xxxx xxxx    W(x2) 
const CPU_MEM_IO_PPU_ADDR = 0x2006  // PPUADDR     dddd dddd    W(x2)
const CPU_MEM_IO_PPU_DATA = 0x2007  // PPUDATA     aaaa aaaa    W     R
//0x2008 - 0x3FFF                   : Mirrors of 0x2000 - 0x2007 (x1023)
/*
const CPU_MEM_IO_APU_XXXX = 0x4000  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4001  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4002  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4003  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4004  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4005  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4006  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4007  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4008  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4009  // TODO
const CPU_MEM_IO_APU_XXXX = 0x400A  // TODO
const CPU_MEM_IO_APU_XXXX = 0x400B  // TODO
const CPU_MEM_IO_APU_XXXX = 0x400C  // TODO
const CPU_MEM_IO_APU_XXXX = 0x400D  // TODO
const CPU_MEM_IO_APU_XXXX = 0x400E  // TODO
const CPU_MEM_IO_APU_XXXX = 0x400F  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4010  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4011  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4012  // TODO
const CPU_MEM_IO_APU_XXXX = 0x4013  // TODO
*/
const CPU_MEM_IO_PPU_ODMA = 0x4014  // OAMDMA      aaaa aaaa    w
/*
const CPU_MEM_IO_APU_XXXX = 0x4015  // TODO
const CPU_MEM_IO_PAD_XXXX = 0x4016  // TODO
const CPU_MEM_IO_PAD_XXXX = 0x4017  // TODO
const CPU_MEM_IO_UNKNOWN  = 0x4018  // TODO ???
const CPU_MEM_IO_UNKNOWN  = 0x4019  // TODO ???
const CPU_MEM_IO_UNKNOWN  = 0x401A  // TODO ???
const CPU_MEM_IO_UNKNOWN  = 0x401B  // TODO ???
const CPU_MEM_IO_UNKNOWN  = 0x401C  // TODO ???
const CPU_MEM_IO_UNKNOWN  = 0x401D  // TODO ???
const CPU_MEM_IO_UNKNOWN  = 0x401E  // TODO ???
const CPU_MEM_IO_UNKNOWN  = 0x401F  // TODO ???
*/
const CPU_MEM_ExROM       = 0x4020  // 0x1FE0
const CPU_MEM_SRAM        = 0x6000  // 0x2000
const CPU_MEM_PRG_ROM     = 0x8000  // 0x8000


/** 
 * PPU ADDRESS MAP
 * 
 * NES system board itself has only 2 KiB of VRAM (called CIRAM, stored in a separate SRAM chip), enough for two nametables.
 * Hardware on the cartridge controls address bit 10 of CIRAM to map one nametable on top of another. 
 * 
 * VRAM      : 2048  Bytes = 0x0800 = (0x03C0 name table + 0x0040 attr table) * 2
 * External  : 8192  Bytes = 0x2000 = 0x1000 pattern table 0 + 0x1000 pattern table 1 (can expand by cartridge with bank switching)
 * Mirrored  : 55264 Bytes = 0xD7E0 = (0x03C0 name table mirror + 0x0040 attr table mirror) * 2(can un-mirrored by cartridge with additional ram) 
 *                                  + 0x0F00(0x2000 to 0x2EFF → most part of name table section)
 *                                  + 0x0020*7 palette mirror
 *                                  + 0x4000*3 whole other sections
 * Internal  : 32    Bytes = 0x0020 = 0x0010 image(bg) palette + 0x0010 sprite palette
 * 
 * TOTAL     : 65536 Bytes (16-bit address)
 * 
 * PS: There's one more 256 Bytes(0x0100) internal ram, called OAM(Object Attribute Memory), not addressed
*/

const PPU_ADDR_SIZE = 0x10000
const PPU_CHR_SIZE = 0x2000
const PPU_RAM_SIZE = 0x0800
const PPU_PLT_SIZE = 0x0020

const PPU_MEM_PTRN_TABLE0 = 0x0000  // 0x1000
const PPU_MEM_PTRN_TABLE1 = 0x1000  // 0x1000
const PPU_MEM_NAME_TABLE0 = 0x2000  // 0x03C0 = 960 = 30 * 32
const PPU_MEM_ATTR_TABLE0 = 0x23C0  // 0x0040 = 64  = 8  * 8
const PPU_MEM_NAME_TABLE1 = 0x2400  // 0x03C0 = 960 = 30 * 32
const PPU_MEM_ATTR_TABLE1 = 0x27C0  // 0x0040 = 64  = 8  * 8
const PPU_MEM_NAME_TABLE2 = 0x2800  // 0x03C0 = 960 = 30 * 32
const PPU_MEM_ATTR_TABLE2 = 0x2BC0  // 0x0040 = 64  = 8  * 8
const PPU_MEM_NAME_TABLE3 = 0x2C00  // 0x03C0 = 960 = 30 * 32
const PPU_MEM_ATTR_TABLE3 = 0x2FC0  // 0x0040 = 64  = 8  * 8
//0x3000 - 0x3EFF                    : Mirrors of 0x2000 - 0x2EFF (x1)
const PPU_MEM_IMAGE_PALET = 0x3F00  // 0x0010
const PPU_MEM_SPRIT_PALET = 0x3F10  // 0x0010
//0x3F20 - 0x3FFF                    : Mirrors of 0x3F00 - 0x3F1F (x7)
//0x4000 - 0xFFFF                    : Mirrors of 0x0000 - 0x3FFF (x3)










class CPUBus {
    constructor(){
        this.ram    = new Uint8Array(CPU_RAM_SIZE   )
        this.exrom  = new Uint8Array(CPU_ExROM_SIZE )
        this.wram   = new Uint8Array(CPU_WRAM_SIZE  )
        this.prgrom = new Uint8Array(CPU_PRGROM_SIZE)
    }

    bindPPU   (ppu) { this.ppu = ppu    }
    bindPRGROM(rom) { this.prgrom = rom }
    bindWRAM  (ram) { this.wram = ram   }
    bindExROM (rom) { this.exrom = rom  }

    r(addr){
        if((addr >= 0) && (addr<CPU_RAM_ADDR_SIZE)){
            return this.ram[addr%CPU_RAM_SIZE]
        }
        else if((addr >= CPU_RAM_ADDR_SIZE) && (addr < 0x4000)){
            switch((addr-CPU_RAM_ADDR_SIZE) % 0x08 + 0x2000){
                case CPU_MEM_IO_PPU_CTRL: return 0
                case CPU_MEM_IO_PPU_MASK: return 0
                case CPU_MEM_IO_PPU_STAT: return this.ppu.REG_STAT_R()
                case CPU_MEM_IO_PPU_OAMA: return 0
                case CPU_MEM_IO_PPU_OAMD: return this.ppu.REG_OAMD_R()
                case CPU_MEM_IO_PPU_SCRL: return 0
                case CPU_MEM_IO_PPU_ADDR: return 0
                case CPU_MEM_IO_PPU_DATA: return this.ppu.REG_DATA_R()
            }
        }
        //TODO APU
        else if(addr==CPU_MEM_IO_PPU_ODMA){
            return 0
        }
        //TODO APU
        else if((addr>=CPU_MEM_ExROM) && (addr<CPU_MEM_SRAM)){
            return this.exrom[addr-CPU_MEM_ExROM]
        }
        else if((addr>=CPU_MEM_PRG_ROM) && (addr<CPU_ADDR_SIZE)){
            return this.prgrom[addr-CPU_MEM_PRG_ROM]
        }
        return 0
    }
    w(addr,data){
        if((addr >= 0) && (addr<CPU_RAM_ADDR_SIZE)){
            this.ram[addr%CPU_RAM_SIZE] = data
        }
        else if((addr >= CPU_RAM_ADDR_SIZE) && (addr < 0x4000)){
            switch((addr-CPU_RAM_ADDR_SIZE) % 0x08 + 0x2000){
                case CPU_MEM_IO_PPU_CTRL: this.ppu.REG_CTRL_W(data); break
                case CPU_MEM_IO_PPU_MASK: this.ppu.REG_MASK_W(data); break
                case CPU_MEM_IO_PPU_STAT: break
                case CPU_MEM_IO_PPU_OAMA: this.ppu.REG_OAMA_W(data); break
                case CPU_MEM_IO_PPU_OAMD: this.ppu.REG_OAMD_W(data); break
                case CPU_MEM_IO_PPU_SCRL: this.ppu.REG_SCRL_W(data); break
                case CPU_MEM_IO_PPU_ADDR: this.ppu.REG_ADDR_W(data); break
                case CPU_MEM_IO_PPU_DATA: this.ppu.REG_DATA_W(data); break
            }
        }
        //TODO APU
        else if(addr==CPU_MEM_IO_PPU_ODMA){
            this.ppu.REG_ODMA_W(data,this)
        }
        //TODO APU
        else if((addr>=CPU_MEM_ExROM) && (addr<CPU_MEM_SRAM)){
            this.exrom[addr-CPU_MEM_ExROM] = data
        }
        else if((addr>=CPU_MEM_PRG_ROM) && (addr<CPU_ADDR_SIZE)){
            this.prgrom[addr-CPU_MEM_PRG_ROM] = data
        }
    }
}
class PPUBus {
    constructor(){
        this.vram = new Uint8Array(PPU_RAM_SIZE)
        this.chrrom =  new Uint8Array(PPU_CHR_SIZE)
        this.plet = new Uint8Array(PPU_PLT_SIZE)
        this.mirr = MIRRORING.VERTICAL
    }
    bindCPU      (cpu) { this.cpu = cpu       }
    nmi          ()    { this.cpu.NMI()       }
    setMirroring (val) { this.mirr = val      }
    bindCHRROM   (val) { this.chrrom = val    }

    r(addr){
        if(addr >= 0 && addr < PPU_CHR_SIZE) return this.chrrom[addr]
        else if(addr >= PPU_CHR_SIZE && addr < PPU_MEM_IMAGE_PALET){
            switch(this.mirr){
                case MIRRORING.VERTICAL: return this.vram[addr % PPU_RAM_SIZE]
                case MIRRORING.HORIZONTAL: return this.vram[((addr / 2) & (PPU_RAM_SIZE / 2)) + (addr % (PPU_RAM_SIZE / 2))]
            }
        }
        else if(addr >= PPU_MEM_IMAGE_PALET && addr <0x4000){
            if ((addr & 0x13) == 0x10) addr &= ~0x10
            return this.plet[addr & 0x1F]// & (mask.gray ? 0x30 : 0xFF) //TODO: mask gray
        }
        return 0
    }
    w(addr,data){
        if(addr >= 0 && addr < PPU_CHR_SIZE) this.chrrom[addr] = data
        else if(addr >= PPU_CHR_SIZE && addr < PPU_MEM_IMAGE_PALET){
            switch(this.mirr){
                case MIRRORING.VERTICAL: this.vram[addr % PPU_RAM_SIZE] = data; break
                case MIRRORING.HORIZONTAL: this.vram[((addr / 2) & (PPU_RAM_SIZE / 2)) + (addr % (PPU_RAM_SIZE / 2))] = data; break
            }
        }
        else if(addr >= PPU_MEM_IMAGE_PALET && addr <0x4000){
            if ((addr & 0x13) == 0x10) addr &= ~0x10
            this.plet[addr & 0x1F] = data
        }
    }
}

var MIRRORING = { VERTICAL:0, HORIZONTAL:1 }


export { CPUBus, PPUBus, MIRRORING }