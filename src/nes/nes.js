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
    //cpu_test.printStatus()
    if(cpu_test.getPC() == 0x32E8) { console.log('CPU test passed.(no decimal)');break }
}
//------------------------

var rom = fs.readFileSync('./smb.nes', null)
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

function f(){
    cpu.STEP();ppu.STEP();ppu.STEP();ppu.STEP()
    //setTimeout(f, 0)
    f()
}
//f()

fs.writeFileSync('./cpu.log','')
while(1){
    var cpures = cpu.STEP()
    fs.appendFileSync('./cpu.log',dbgHexStr(cpures.pc,4)+' '+cpures.mnem+' '+dbgHexStr(cpures.addr,4)+' '+dbgHexStr(cpures.data)+'\n')
    ppu.STEP()
    ppu.STEP()
    ppu.STEP()
}

const WIDTH = 256
const HEIGHT = 240

var canvas = createCanvas(WIDTH, HEIGHT)
var ctx = canvas.getContext('2d')

function dbgHexStr(val,pad=2)  { return val!=null?'0x'+val.toString(16).toUpperCase().padStart(pad, '0'):'' }






