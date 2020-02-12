

//Ref: http://nesdev.com/NESDoc.pdf Page.34 Appendix B

/** 
 * CPU ADDRESS MAP
 * 
 * RAM       : 2048  Bytes = 0x0800 = 0x0100 0page + 0x0100 stack + 0x0600 ram
 * IO        : 40    Bytes = 0x0028 = 0x0008 ppu io + 0x0020 apu(except ODMA) io
 * External  : 49120 Bytes = 0xBFE0 = 0x1FE0 exrom + 0x2000 sram + 0x8000 prgrom
 * Mirrored  : 14328 Bytes = 0x37F8 = 0x0800*3 ram mirror + 0x0008*1023 io mirror
 * 
 * TOTAL     : 65536 Bytes (16-bit address)
*/

const CPU_ADDR_SIZE     = 0x10000
const CPU_RAM_SIZE      = 0x0800
const CPU_RAM_ADDR_SIZE = 0x2000

// WORK-RAM
const CPU_MEM_0PAGE       = 0x0000  // 0x0100
const CPU_MEM_STACK       = 0x0100  // 0x0100
const CPU_MEM_RAM         = 0x0200  // 0x0600
//0x0800 - 0x1FFF                    : Mirrors of 0x0000 - 0x07FF (x3)

// Registers for controlling PPU
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

// Registers for controlling APU
// http://wiki.nesdev.com/w/index.php/APU_registers
const CPU_MEM_IO_APU_PU1A = 0x4000  // 
const CPU_MEM_IO_APU_PU1B = 0x4001  // 
const CPU_MEM_IO_APU_PU1C = 0x4002  // 
const CPU_MEM_IO_APU_PU1D = 0x4003  // 
const CPU_MEM_IO_APU_PU2A = 0x4004  // 
const CPU_MEM_IO_APU_PU2B = 0x4005  // 
const CPU_MEM_IO_APU_PU2C = 0x4006  // 
const CPU_MEM_IO_APU_PU2D = 0x4007  // 
const CPU_MEM_IO_APU_TRIA = 0x4008  // 
const CPU_MEM_IO_APU_TRIB = 0x4009  // 
const CPU_MEM_IO_APU_TRIC = 0x400A  // 
const CPU_MEM_IO_APU_TRID = 0x400B  // 
const CPU_MEM_IO_APU_NOIA = 0x400C  // 
const CPU_MEM_IO_APU_NOIB = 0x400D  // 
const CPU_MEM_IO_APU_NOIC = 0x400E  // 
const CPU_MEM_IO_APU_NOID = 0x400F  // 
const CPU_MEM_IO_APU_DMCA = 0x4010  // 
const CPU_MEM_IO_APU_DMCB = 0x4011  // 
const CPU_MEM_IO_APU_DMCC = 0x4012  // 
const CPU_MEM_IO_APU_DMCD = 0x4013  // 
const CPU_MEM_IO_PPU_ODMA = 0x4014  // OAMDMA      aaaa aaaa    w
const CPU_MEM_IO_APU_CTST = 0x4015  // 
const CPU_MEM_IO_PAD_PAD0 = 0x4016  // JOYPAD NO.0
const CPU_MEM_IO_PAD_PAD1 = 0x4017  // JOYPAD NO.1 R
const CPU_MEM_IO_APU_FRAM = 0x4017  // W

// CPU Test Mode
// http://wiki.nesdev.com/w/index.php/CPU_Test_Mode
const CPU_MEM_IO_TEST0    = 0x4018  // Test Mode, unused.
const CPU_MEM_IO_TEST1    = 0x4019  // Test Mode, unused.
const CPU_MEM_IO_TEST2    = 0x401A  // Test Mode, unused.
const CPU_MEM_IO_TEST3    = 0x401B  // Test Mode, unused.
const CPU_MEM_IO_TEST4    = 0x401C  // Test Mode, unused.
const CPU_MEM_IO_TEST5    = 0x401D  // Test Mode, unused.
const CPU_MEM_IO_TEST6    = 0x401E  // Test Mode, unused.
const CPU_MEM_IO_TEST7    = 0x401F  // Test Mode, unused.

// On cartridge
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


const PPU_RAM_ADDR_MASK = 0b110000000000
const PPU_RAM0_SWITCH   = 0b000000000000
const PPU_RAM1_SWITCH   = 0b010000000000
const PPU_RAM2_SWITCH   = 0b100000000000
const PPU_RAM3_SWITCH   = 0b110000000000


class DMATransfer {
    constructor(bus){
        this.bus = bus
        this.reset()
    }
    reset(){
        this.execute   = false
        this.onDummy   = true
        this.page      = 0x00
        this.addr      = 0x00
        this.data      = 0x00
        this.evenClk   = 0
    }

    trigger(page){
        this.execute = true
        this.page = page & 0xFF
        this.addr = 0x00
    }

    clockCount () { this.evenClk = (~this.evenClk) & 1    }
    isEvenClk  () { return (this.evenClk & 1) == 0        }
    isOngoing  () { return this.execute                   }

    clock(){
        if(this.execute){
            if(this.onDummy){
                if(!this.isEvenClk()) this.onDummy = false
            }else{
                if(this.isEvenClk()){
                    this.data = this.bus.r((this.page << 8) | this.addr)
                }else{
                    this.bus.ppu.priOam.setEle(this.addr,this.data)
                    this.addr++
                    if(this.addr>0xFF){
                        this.addr = 0x00
                        this.execute = false
                        this.onDummy = true
                    }
                }
            }
        }
        this.clockCount()
    }
}



/**
 * NES CPU BUS (16-bit)
 * 
 * CPU.....0.....00 -> WORK-RAM (low 11-bit)
 *      .     .
 *      .     ...01 -> PPU Registers (low 3-bit)
 *      .     .
 *      .     ...10.....0000 0000.....00 -> APU Pulse Wave Registers (3-bit)
 *      .     .      .             .
 *      .     .      .             ...01 -> APU Triangle & Noise Registers (3-bit)
 *      .     .      .             .
 *      .     .      .             ...10 -> APU DMC, APU Frame Counter, PPU DMA, Joypad 
 *      .     .      .             .
 *      .     .      .             ...11 -> CPU Test Mode (3-bit)
 *      .     .      .
 *      .     .      ...XXXX XXXX -> ExROM (13-bit) --> TO CARTRIDGE
 *      .     .
 *      .     ...11 -> SRAM (13-bit) -----------------> TO CARTRIDGE
 *      .
 *      ...1 -> PRG-ROM (15-bit) ---------------------> TO CARTRIDGE
 * 
 * For more details on cartridge port: https://wiki.nesdev.com/w/index.php/Cartridge_connector
 * 
 */

/*
TODO

//First 3 bits control sub bus
const CPU_SUB_BUS_MASK = 0b1110000000000000
const CPU_SUB_BUS_0    = 0b0000000000000000
const CPU_SUB_BUS_1    = 0b0010000000000000
const CPU_SUB_BUS_2    = 0b0100000000000000

const CPU_SUB_BUS_3    = 0b0110000000000000 // To Cartridge SRAM
const CPU_SUB_BUS_4    = 0b1000000000000000 // To Cartridge PRG-ROM

const CPU_RAM_MASK      = 0b0000011111111111
const CPU_PPU_MASK      = 0b0000000000000111


const CPU_APU_MASK      = 0b0000000000000111

var CPU_MEM = (addr) =>{
    var sel = addr & CPU_MEM_SELECT
}
*/

class CPUBUS {
    constructor(){
        this.dma = new DMATransfer(this)
        this.ram = new Uint8Array(CPU_RAM_SIZE)
    }

    bindCPU       (cpu)  { this.cpu  = cpu  }
    bindPPU       (ppu)  { this.ppu  = ppu  }
    bindCartridge (cart) { this.cart = cart }
    bindJoypad    (pad)  { this.pad  = pad  }

    r(addr){
        if((addr >= 0) && (addr<CPU_RAM_ADDR_SIZE)){
            return this.ram[addr%CPU_RAM_SIZE]
        }
        else if((addr >= CPU_RAM_ADDR_SIZE) && (addr < CPU_MEM_IO_APU_PU1A)){
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
        else if((addr >= CPU_MEM_IO_APU_PU1A) && (addr <= CPU_MEM_IO_APU_DMCD)){
            //TODO APU
        }
        else if(addr==CPU_MEM_IO_PPU_ODMA){
            return 0
        }
        else if(addr==CPU_MEM_IO_APU_CTST){
            //TODO APU
        }
        else if(addr==CPU_MEM_IO_PAD_PAD0){
            return this.pad.r0()
        }
        else if(addr==CPU_MEM_IO_PAD_PAD1){
            return this.pad.r1()
        }
        else if((addr>=CPU_MEM_IO_TEST0) && (addr<=CPU_MEM_IO_TEST7)){
            console.log('CPU_BUS_R: test address. @0x'+addr.toString(16))
            return 0
        }
        else if((addr>=CPU_MEM_ExROM) && (addr<CPU_MEM_SRAM)){
            return this.cart.EXROMRead(addr-CPU_MEM_ExROM)
        }
        else if((addr>=CPU_MEM_SRAM) && (addr<CPU_MEM_PRG_ROM)){
            return this.cart.SRAMRead(addr-CPU_MEM_SRAM)
        }
        else if((addr>=CPU_MEM_PRG_ROM) && (addr<CPU_ADDR_SIZE)){
            return this.cart.PRGRead(addr-CPU_MEM_PRG_ROM)
        }else{
            console.error('CPU_BUS_R: invalid address. @0x'+addr.toString(16))
            return 0
        }
    }
    w(addr,data){
        if((addr >= 0) && (addr<CPU_RAM_ADDR_SIZE)){
            this.ram[addr%CPU_RAM_SIZE] = data
        }
        else if((addr >= CPU_RAM_ADDR_SIZE) && (addr < CPU_MEM_IO_APU_PU1A)){
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
        else if((addr >= CPU_MEM_IO_APU_PU1A) && (addr <= CPU_MEM_IO_APU_DMCD)){
            //TODO APU
        }
        else if(addr==CPU_MEM_IO_PPU_ODMA){
            this.dma.trigger(data)
        }
        else if(addr==CPU_MEM_IO_APU_CTST){
            //TODO APU
        }
        else if(addr==CPU_MEM_IO_PAD_PAD0){
            this.pad.w(data)
        }
        else if(addr==CPU_MEM_IO_PAD_PAD1){
            //TODO APU
        }
        else if((addr>=CPU_MEM_IO_TEST0) && (addr<=CPU_MEM_IO_TEST7)){
            console.log('CPU_BUS_W: test address. @0x'+addr.toString(16))
        }
        else if((addr>=CPU_MEM_ExROM) && (addr<CPU_MEM_SRAM)){
            this.cart.EXROMWrite(addr-CPU_MEM_ExROM,data)
        }
        else if((addr>=CPU_MEM_SRAM) && (addr<CPU_MEM_PRG_ROM)){
            this.cart.SRAMWrite(addr-CPU_MEM_SRAM,data)
        }
        else if((addr>=CPU_MEM_PRG_ROM) && (addr<CPU_ADDR_SIZE)){
            this.cart.PRGWrite(addr-CPU_MEM_PRG_ROM,data)
        }else{
            console.error('CPU_BUS_W: invalid address. @0x'+addr.toString(16))
        }
    }
}

class PPUBUS {
    constructor(){
        this.vram0  = new Uint8Array(PPU_RAM_SIZE/2) //Dynamic
        this.vram1  = new Uint8Array(PPU_RAM_SIZE/2) //Dynamic
        this.plet   = new Uint8Array(PPU_PLT_SIZE  ) //Static
    }

    bindPPU      (ppu) { this.ppu    = ppu  }
    bindCPU      (cpu) { this.cpu    = cpu  }
    NMI          ()    { this.cpu.NMI()     }
    bindCartridge(cart){ this.cart   = cart }
    
    r(addr){
        addr &= 0x3FFF
        if(addr >= 0 && addr < PPU_CHR_SIZE) return this.cart.CHRRead(addr)
        else if(addr >= PPU_CHR_SIZE && addr < PPU_MEM_IMAGE_PALET){
            addr &= 0x0FFF
            var ramsel = addr & PPU_RAM_ADDR_MASK
            addr &= 0x03FF
            if(this.cart.isHoriMirr()){
                     if (ramsel == PPU_RAM0_SWITCH) return this.vram0[addr]
                else if (ramsel == PPU_RAM1_SWITCH) return this.vram0[addr]
                else if (ramsel == PPU_RAM2_SWITCH) return this.vram1[addr]
                else if (ramsel == PPU_RAM3_SWITCH) return this.vram1[addr]
            }else{
                     if (ramsel == PPU_RAM0_SWITCH) return this.vram0[addr]
                else if (ramsel == PPU_RAM1_SWITCH) return this.vram1[addr]
                else if (ramsel == PPU_RAM2_SWITCH) return this.vram0[addr]
                else if (ramsel == PPU_RAM3_SWITCH) return this.vram1[addr]
            }
        }
        else if(addr >= PPU_MEM_IMAGE_PALET && addr <0x4000){
            addr &= 0x001F
                 if (addr == 0x10) addr = 0x00
            else if (addr == 0x14) addr = 0x04
            else if (addr == 0x18) addr = 0x08
            else if (addr == 0x1C) addr = 0x0C
            return this.plet[addr] & (this.ppu.mask.isGray() ? 0x30 : 0xFF)
        }else{
            console.error('PPU_BUS_R: invalid address. @0x'+addr.toString(16))
            return 0
        }
    }
    w(addr,data){
        addr &= 0x3FFF
        if(addr >= 0 && addr < PPU_CHR_SIZE) this.cart.CHRWrite(addr, data)
        else if(addr >= PPU_CHR_SIZE && addr < PPU_MEM_IMAGE_PALET){
            addr &= 0x0FFF
            var ramsel = addr & PPU_RAM_ADDR_MASK
            addr &= 0x03FF
            if(this.cart.isHoriMirr()){
                     if (ramsel == PPU_RAM0_SWITCH) this.vram0[addr] = data
                else if (ramsel == PPU_RAM1_SWITCH) this.vram0[addr] = data
                else if (ramsel == PPU_RAM2_SWITCH) this.vram1[addr] = data
                else if (ramsel == PPU_RAM3_SWITCH) this.vram1[addr] = data
            }else{
                     if (ramsel == PPU_RAM0_SWITCH) this.vram0[addr] = data
                else if (ramsel == PPU_RAM1_SWITCH) this.vram1[addr] = data
                else if (ramsel == PPU_RAM2_SWITCH) this.vram0[addr] = data
                else if (ramsel == PPU_RAM3_SWITCH) this.vram1[addr] = data
            }
        }
        else if(addr >= PPU_MEM_IMAGE_PALET && addr <0x4000){
            addr &= 0x001F
                 if (addr == 0x10) addr = 0x00
            else if (addr == 0x14) addr = 0x04
            else if (addr == 0x18) addr = 0x08
            else if (addr == 0x1C) addr = 0x0C
            this.plet[addr] = data
        }else{
            console.error('PPU_BUS_W: invalid address. @0x'+addr.toString(16))
        }
    }
}

class BUS {
    constructor   ()     {
        this.cpubus = new CPUBUS()
        this.ppubus = new PPUBUS()
    }
    connCPU       (cpu)  { this.cpu = cpu; this.cpu.bindBUS(this.cpubus); this.cpubus.bindCPU(this.cpu); this.ppubus.bindCPU(this.cpu)           }
    connPPU       (ppu)  { this.ppu = ppu; this.ppu.bindBUS(this.ppubus); this.cpubus.bindPPU(this.ppu); this.ppubus.bindPPU(this.ppu)           }
    connPad       (pad)  { this.pad = pad; this.cpubus.bindJoypad(this.pad)                                                                      }
    connCartridge (cart) { this.cart = cart; this.cart.bindBUS(this); this.cpubus.bindCartridge(this.cart); this.ppubus.bindCartridge(this.cart) }
    connScreen    (scr)  { this.scr = scr; this.ppu.bindScreen(this.scr)                                                                         }

    getCPU()   { return this.cpu }
    getPPU()   { return this.ppu }
    getPad()   { return this.pad }
    getScr()   { return this.scr }

    resetAll() { this.cpu.RST(); this.cpubus.dma.reset(); this.ppu.RST() }

    clock()    { this.ppu.clock(); this.ppu.clock(); this.ppu.clock(); if(!this.cpubus.dma.isOngoing())this.cpu.clock(); this.cpubus.dma.clock() }
}

export default BUS