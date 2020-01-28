//const fs                          = require('fs')
const { createCanvas, loadImage } = require('canvas')

import Screen from './screen'
import Mapper from './mapper'
import { CPUBus, PPUBus, MIRRORING } from './bus'
import CPU from './cpu'
import PPU from './ppu'
import APU from './apu'

import fs from 'fs'


/**
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
    constructor(ctx,rom){
        this.ctx = ctx
        this.init(rom)
    }
    init(rom){
        this.mapper = new Mapper(rom)
        
        this.screen = new Screen(this.ctx)

        this.cpubus = new CPUBus()
        this.ppubus = new PPUBus()
        
        this.cpu = new CPU(this.cpubus)
        this.ppu = new PPU(this.ppubus,this.screen)
        
        this.cpubus.bindPPU(this.ppu)
        this.cpubus.bindPRGROM(this.mapper.prg)
        this.cpubus.bindWRAM(this.mapper.wram)
        
        this.ppubus.bindCPU(this.cpu)
        this.ppubus.setMirroring(this.mapper.isHori ? MIRRORING.HORIZONTAL : MIRRORING.VERTICAL)
        this.ppubus.bindCHRROM(this.mapper.chr)

        this.rst()
    }
    step(){
        //https://wiki.nesdev.com/w/index.php/Cycle_reference_chart
        var cycle = 0
        while(cycle<29780){
            var cpures = this.cpu.STEP()
            this.ppu.STEP()
            this.ppu.STEP()
            this.ppu.STEP()
            cycle += cpures.cycle
        }
        //console.log('s')
        //console.log(cpures)
    }
    rst(){
        this.cpu.RST()
        this.ppu.RST()
    }
}

export default NES


