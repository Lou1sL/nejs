import { SCALE_MODE, Screen } from './screen'
import Cartridge from './cartridge'
import BUS from './bus'
import CPU from './cpu'
import PPU from './ppu'
import APU from './apu'
import { BUTTON, Joypad } from './joypad'

class NES {
    constructor(canvas){
        this.bus = new BUS()
        this.bus.connCPU(new CPU())
        this.bus.connPPU(new PPU())
        this.bus.connAPU(new APU())
        this.bus.connPad(new Joypad())
        this.bus.connScreen(new Screen(canvas))
    }
    init(rom){
        this.bus.connCartridge(new Cartridge(rom))
        this.bus.resetAll()
    }
    //https://wiki.nesdev.com/w/index.php/Cycle_reference_chart
    //PPU: 89342 per frame
    //CPU: 29780 per frame
    runOneSec()   { for(var c=0;c<29780;c++) this.bus.clock() }
    reset()       { this.bus.resetAll()                       }
    btnDown (btn) { this.bus.pad.btnDown(btn)                 }
    btnUp   (btn) { this.bus.pad.btnUp(btn)                   }

    setScaleMode(mode) { this.bus.getScr().setScaleMode(mode) }
}

export { SCALE_MODE, BUTTON, NES }


