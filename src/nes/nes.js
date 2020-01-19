const fs                          = require('fs')
const { createCanvas, loadImage } = require('canvas')

const Mapper = require('./mapper')
const { CPUBus, PPUBus } = require('./bus')
const CPU    = require('./cpu')
const PPU    = require('./ppu')
const APU    = require('./apu')


//--CPU Test program------
var rom = fs.readFileSync('./6502_functional_test.bin', null)
function CPU_BUS_TEST(){this.r=function(addr){return rom[addr]};this.w=function(addr,data){rom[addr]=data}}
var cpu_test = new CPU(new CPU_BUS_TEST())
cpu_test.pc(0x0400)
while(true){
    cpu_test.STEP()
    //cpu_test.DEBUG_LOG()
    if(cpu_test.getPC() == 0x32E8) { console.log('CPU test passed.(no decimal)');break }
}
//------------------------


var cpubus = new CPUBus()
var ppubus = new PPUBus()

var cpu = new CPU(cpubus)
var ppu = new PPU(ppubus)

cpubus.bindPPU(ppu)
ppubus.bindCPU(cpu)




const WIDTH = 256
const HEIGHT = 240

var canvas = createCanvas(WIDTH, HEIGHT)
var ctx = canvas.getContext('2d')

var rom = fs.readFileSync('./DonkeyKong.nes', null)
var mapper = new Mapper(rom)







