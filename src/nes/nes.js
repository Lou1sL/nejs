import Screen from './screen'
import Mapper from './mapper'
import { CPUBus, PPUBus, MIRRORING } from './bus'
import CPU from './cpu'
import PPU from './ppu'
import APU from './apu'
import { BUTTON, Joypad } from './joypad'

/**

import fs from 'fs'
//--CPU Test program------
var rom_test = fs.readFileSync('./6502_functional_test.bin', null)
function CPU_BUS_TEST(){this.r=function(addr){return rom_test[addr]};this.w=function(addr,data){rom_test[addr]=data}}
var cpu_test = new CPU(new CPU_BUS_TEST())
cpu_test.pc(0x0400)
while(true){
    cpu_test.STEP()
    //cpu_test.printStatus()
    if(cpu_test.getPC() == 0x32E8) { console.log('CPU test passed.(no decimal)');break }
}
//------------------------
 */

/**
fs.writeFileSync('./cpu.log','')
while(1){
    var cpures = cpu.STEP()
    fs.appendFileSync('./cpu.log',dbgHexStr(cpures.pc,4)+' '+cpures.mnem+' '+dbgHexStr(cpures.addr,4)+' '+dbgHexStr(cpures.data)+'\n')
    ppu.STEP()
    ppu.STEP()
    ppu.STEP()
}
function dbgHexStr(val,pad=2)  { return val!=null?'0x'+val.toString(16).toUpperCase().padStart(pad, '0'):'' }
 */


class NES {
    constructor(canvas){
        this.screen = new Screen(canvas)
        this.cpubus = new CPUBus()
        this.ppubus = new PPUBus()
        this.cpu = new CPU(this.cpubus)
        this.ppu = new PPU(this.ppubus,this.screen)
        this.pad = new Joypad()

        this.cpubus.bindPPU(this.ppu)
        this.cpubus.bindJoypad(this.pad)

        this.ppubus.bindCPU(this.cpu)
    }
    init(rom){
        this.mapper = new Mapper(rom)

        this.cpubus.bindPRGROM(this.mapper.prg)
        this.cpubus.bindWRAM(this.mapper.wram)
        
        this.ppubus.setMirroring(this.mapper.isHori ? MIRRORING.HORIZONTAL : MIRRORING.VERTICAL)
        this.ppubus.bindCHRROM(this.mapper.chr)

        this.rst()
    }
    step(){
        //https://wiki.nesdev.com/w/index.php/Cycle_reference_chart
        //PPU: 89342 per frame
        //CPU: 29780 per frame
        for(var c=0;c<29780;c++){
            this.ppu.clock()
            this.ppu.clock()
            this.ppu.clock()
            if(!this.cpubus.dma.isOngoing())this.cpu.clock()
            this.cpubus.dma.clock()
        }
    }
    rst(){
        this.cpu.RST()
        this.cpubus.dma.reset() //Abort ongoing DMA transfer
        this.ppu.RST()
    }
    btnDown (btn) { this.pad.btnDown(btn) }
    btnUp   (btn) { this.pad.btnUp(btn)   }
}

export { BUTTON, NES }


