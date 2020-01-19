const fs                          = require('fs')
const { createCanvas, loadImage } = require('canvas')

const Mapper = require('./mapper')
const { CPUBus, PPUBus, MIRRORING } = require('./bus')
const CPU    = require('./cpu')
const PPU    = require('./ppu')
const APU    = require('./apu')


//--CPU Test program------
var rom_test = fs.readFileSync('./6502_functional_test.bin', null)
function CPU_BUS_TEST(){this.r=function(addr){return rom_test[addr]};this.w=function(addr,data){rom_test[addr]=data}}
var cpu_test = new CPU(new CPU_BUS_TEST())
cpu_test.pc(0x0400)
while(true){
    cpu_test.STEP()
    //cpu_test.DEBUG_LOG()
    if(cpu_test.getPC() == 0x32E8) { console.log('CPU test passed.(no decimal)');break }
}
//------------------------

var rom = fs.readFileSync('./DonkeyKong.nes', null)
var mapper = new Mapper(rom)

var cpubus = new CPUBus()
var ppubus = new PPUBus()

var cpu = new CPU(cpubus)
var ppu = new PPU(ppubus)

cpubus.bindPPU(ppu)
cpubus.bindPRGROM(mapper.prg)
cpubus.bindWRAM(mapper.wram)

ppubus.bindCPU(cpu)
ppubus.setMirroring(mapper.isHori ? MIRRORING.HORIZONTAL : MIRRORING.VERTICAL)
ppubus.bindCHRROM(mapper.chr)

cpu.RST()
ppu.RST()
cpu.DEBUG_LOG()
var a = 0
while(++a<20){
    cpu.STEP()
    cpu.DEBUG_LOG()
}

const WIDTH = 256
const HEIGHT = 240

var canvas = createCanvas(WIDTH, HEIGHT)
var ctx = canvas.getContext('2d')








