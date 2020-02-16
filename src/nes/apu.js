
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

class Pulse {
    constructor() { this.reg = new Uint8Array(4) }
}
class Triangle {
    constructor() { this.reg = new Uint8Array(4) }
}
class Noise {
    constructor() { this.reg = new Uint8Array(4) }
}
class DMC {
    constructor() { this.reg = new Uint8Array(4) }
}

class APU {
    constructor(){
        this.pulse0   = new Pulse()
        this.pulse1   = new Pulse()
        this.triangle = new Triangle()
        this.noise    = new Noise()
        this.dmc      = new DMC()
        
    }
    bindBUS(bus){ this.bus = bus }

    clock(){
        
    }

}

export default APU