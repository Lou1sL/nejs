
//Pulse    ----------------------------
//0x4000 & 0x4004
const PUL_DUTY         = 0b11000000
const PUL_ENVL         = 0b00100000
const PUL_CNSV         = 0b00010000
const PUL_VOLU         = 0b00001111
//0x4001 & 0x4005
const PUL_SWEEP_ENABLE = 0b10000000
const PUL_SWEEP_PERIOD = 0b01110000
const PUL_SWEEP_NEGATE = 0b00001000
const PUL_SWEEP_SHIFT  = 0b00000111
//0x4002 & 0x4006
const PUL_TIMER_L      = 0b11111111
//0x4003 & 0x4007
const PUL_LC_LOAD      = 0b11111000
const PUL_TIMER_H      = 0b00000111

//Triangle ----------------------------
//0x4008
const TRI_LIC_CTRL     = 0b10000000
const TRI_LIC_LOAD     = 0b01111111
//0x400A
const TRI_TIMER_L      = 0b11111111
//0x400B
const TRI_LC_LOAD      = 0b11111000
const TRI_TIMER_H      = 0b00000111

//Noise    ----------------------------
//0x400C
const NOI_ENVL         = 0b00100000
const NOI_CNSV         = 0b00010000
const NOI_VOLU         = 0b00001111
//0x400E
const NOI_LOOP         = 0b10000000
const NOI_PERIOD       = 0b00001111
//0x400F
const NOI_LC_LOAD      = 0b11111000

//DMC    -----------------------------
//0x4010
const DMC_IRQ_ENABLE   = 0b10000000
const DMC_LOOP         = 0b01000000
const DMC_FREQ         = 0b00001111
//0x4011
const DMC_LC           = 0b01111111
//0x4012
const DMC_SAMPLE_ADDR  = 0b11111111
//0x4013
const DMC_SAMPLE_LEN   = 0b11111111

//Status   --------------------------
//0x4015 w
const STAT_ENABLE_DMC  = 0b00010000
const STAT_ENABLE_NOI  = 0b00001000
const STAT_ENABLE_TRI  = 0b00000100
const STAT_ENABLE_PUL0 = 0b00000010
const STAT_ENABLE_PUL1 = 0b00000001
//0x4015 r
const STAT_INT_DMC     = 0b10000000
const STAT_INT_FRA     = 0b01000000
const STAT_ACTIVE_DMC  = 0b00010000
const STAT_LENG0_NOI   = 0b00001000
const STAT_LENG0_TRI   = 0b00000100
const STAT_LENG0_PUL0  = 0b00000010
const STAT_LENG0_PUL1  = 0b00000001

//Frame Counter    ------------------

class Channel {
    constructor()      { this.reg = new Uint8Array(4) }
    reset      ()      { this.reg = new Uint8Array(4) }
    get        (i)     { return this.reg[i]           }
    set        (i,val) { this.reg[i] = val & 0xFF     }
}

class Pulse extends Channel {
    getDuty        () { return (this.reg[0] & PUL_DUTY) >>> 6 }
    getEnvLoop     () { return (this.reg[0] & PUL_ENVL) >>> 5 }
    getEnvDsbl     () { return (this.reg[0] & PUL_CNSV) >>> 4 }
    getPeriod      () { return (this.reg[0] & PUL_VOLU) >>> 0 }

    getSweepEnable () { return (this.reg[1] & PUL_SWEEP_ENABLE) >>> 7 }
    getSweepPeriod () { return (this.reg[1] & PUL_SWEEP_PERIOD) >>> 4 }
    getSweepNegate () { return (this.reg[1] & PUL_SWEEP_NEGATE) >>> 3 }
    getSweepShift  () { return (this.reg[1] & PUL_SWEEP_SHIFT ) >>> 0 }

    getTimerLow    () { return  this.reg[2] & PUL_TIMER_L         }

    getLenCIndex   () { return (this.reg[3] & PUL_LC_LOAD) >>> 3  }
    getTimerHigh   () { return  this.reg[3] & PUL_TIMER_H         }

    getTimer       () { return (this.getTimerHigh() << 8) | this.getTimerLow() }
}
class Triangle extends Channel {
    getLenCDsbl    () { return (this.reg[0] & TRI_LIC_CTRL) >>> 7 }
    getLinC        () { return (this.reg[0] & TRI_LIC_LOAD) >>> 0 }

    getTimerLow    () { return  this.reg[2] & TRI_TIMER_L         }

    getLenCIndex   () { return (this.reg[3] & TRI_LC_LOAD) >>> 3  }
    getTimerHigh   () { return  this.reg[3] & TRI_TIMER_H         }

    getTimer       () { return (this.getTimerHigh() << 8) | this.getTimerLow() }
}
class Noise extends Channel {
    getLenCDsbl    () { return (this.reg[0] &    NOI_ENVL) >>> 5 }
    getEnvDsbl     () { return (this.reg[0] &    NOI_CNSV) >>> 4 }
    getEnvPeriod   () { return (this.reg[0] &    NOI_VOLU) >>> 0 }

    getRandom      () { return (this.reg[2] &    NOI_LOOP) >>> 7 }
    getTimeIndex   () { return (this.reg[2] &  NOI_PERIOD) >>> 0 }

    getLenCIndex   () { return (this.reg[3] & NOI_LC_LOAD) >>> 3 }
}
class DMC extends Channel {
    getIRQEnable   () { return (this.reg[0] &  DMC_IRQ_ENABLE) >>> 7 }
    getLoop        () { return (this.reg[0] &        DMC_LOOP) >>> 6 }
    getTimeIndex   () { return (this.reg[0] &        DMC_FREQ) >>> 0 }

    getDeltaC      () { return (this.reg[1] &          DMC_LC) >>> 0 }

    getSampleAddr  () { return (this.reg[2] & DMC_SAMPLE_ADDR) >>> 0 }

    getSampleLen   () { return (this.reg[3] &  DMC_SAMPLE_LEN) >>> 0 }

}

const AUDIO_BUFFER_LEN = 4096
class Audio {
    constructor(){
        this.buffer = new Float32Array(AUDIO_BUFFER_LEN)
        this.ctx    = new AudioContext()
        this.sp     = this.ctx.createScriptProcessor(AUDIO_BUFFER_LEN, 0, 1)

        this.sp.onaudioprocess = (e) => { }
        this.sp.connect(this.ctx.destination)
        
    }

}
class APU {
    constructor(){
        this.pulse0   = new Pulse()
        this.pulse1   = new Pulse()
        this.triangle = new Triangle()
        this.noise    = new Noise()
        this.dmc      = new DMC()
        
        this.audio    = new Audio()
    }
    bindBUS(bus){ this.bus = bus }

    clock(){
        
    }

}

export default APU