
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
const FC_MODE_5_STEP   = 0b10000000
const FC_IRQ_DISABLE   = 0b01000000


const LENGTH_TABLE = [
    0x0A, 0xFE, 0x14, 0x02, 0x28, 0x04, 0x50, 0x06,
    0xA0, 0x08, 0x3C, 0x0A, 0x0E, 0x0C, 0x1A, 0x0E,
    0x0C, 0x10, 0x18, 0x12, 0x30, 0x14, 0x60, 0x16,
    0xC0, 0x18, 0x48, 0x1A, 0x10, 0x1C, 0x20, 0x1E
]

const PULSE_DUTY_TABLE = [
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1, 1, 1, 1],
]

class Pulse {
    constructor(){
        this.reg = new Uint8Array(4)
        this.enabled = false
        this.timerCounter = 0
        this.timerPeriod = 0
        this.timerSequence = 0
        this.envelopeStartFlag = true
        this.envelopeCounter = 0
        this.envelopeDecayLevelCounter = 0
        this.lengthCounter = 0
        this.sweepReloadFlag = false
        this.sweepCycle = 0
        this.sweepCounter = 0
    }
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

    setEnable(val) { 
        this.enabled = val
        if(val === false) this.lengthCounter = 0
    }
    r(i)     { return this.reg[i] }
    w(i,val) {
        switch(i){
            case 0:
                this.reg[0] = val
                break
            case 1: 
                this.reg[1] = val
                this.sweepReloadFlag = true
                break
            case 2: 
                this.reg[2] = val
                this.timerPeriod = this.getTimer()
                break
            case 3:
                this.reg[3] = val
                if(this.enabled) this.lengthCounter = LENGTH_TABLE[this.getLenCIndex()]
                this.timerPeriod = this.getTimer()
                this.timerSequence = 0
                this.envelopeStartFlag = true
                break
        }
    }

    driveTimer() {
        if(this.timerCounter > 0) this.timerCounter--
        else {
            this.timerCounter = this.timerPeriod
            this.timerSequence++
            if(this.timerSequence === 8) this.timerSequence = 0
        }
    }
    driveLength() {
        if(this.getEnvDsbl() === 0 && this.lengthCounter > 0) this.lengthCounter--
    }
    driveEnvelope() {
        if(this.envelopeStartFlag === true) {
            this.envelopeCounter = this.getPeriod()
            this.envelopeDecayLevelCounter = 0xF
            this.envelopeStartFlag = false
            return
        }
        if(this.envelopeCounter > 0) this.envelopeCounter--
        else {
            this.envelopeCounter = this.getPeriod()
            if(this.envelopeDecayLevelCounter > 0)
                this.envelopeDecayLevelCounter--
            else if(this.envelopeDecayLevelCounter === 0 && this.getEnvLoop() === 1)
                this.envelopeDecayLevelCounter = 0xF
        }
    }
    driveSweep() {
        if(this.sweepCounter === 0 && 
            this.getSweepEnable() === 1 &&
            this.getSweepShift() !== 0 &&
            this.timerPeriod >= 8 && this.timerPeriod <= 0x7FF
        ){
            var change = this.timerPeriod >> this.getSweepShift()
            if(this.getSweepNegate() === 1){
                change = -change
                if(this.isChannel1 === true) change--
            }
            this.timerPeriod += change
        }
        if(this.sweepReloadFlag === true || this.sweepCounter === 0) {
            this.sweepReloadFlag = false;
            this.sweepCounter = this.getSweepPeriod()
        } else this.sweepCounter--
    }
    output() {
        if(this.lengthCounter === 0 || 
            this.timerPeriod < 8 || 
            this.timerPeriod > 0x7FF ||
            PULSE_DUTY_TABLE[this.getDuty()][this.timerSequence] === 0
        ) return 0
        else return (this.getEnvDsbl() === 1 ? this.getPeriod() : this.envelopeDecayLevelCounter) & 0xF
    }

}
class Triangle {
    constructor()      { this.reg = new Uint8Array(4) }
    reset      ()      { this.reg = new Uint8Array(4) }
    r          (i)     { return this.reg[i]           }
    w          (i,val) { this.reg[i] = val & 0xFF     }

    getLenCDsbl    () { return (this.reg[0] & TRI_LIC_CTRL) >>> 7 }
    getLinC        () { return (this.reg[0] & TRI_LIC_LOAD) >>> 0 }

    getTimerLow    () { return  this.reg[2] & TRI_TIMER_L         }

    getLenCIndex   () { return (this.reg[3] & TRI_LC_LOAD) >>> 3  }
    getTimerHigh   () { return  this.reg[3] & TRI_TIMER_H         }

    getTimer       () { return (this.getTimerHigh() << 8) | this.getTimerLow() }

    output () { return 0 }
}
class Noise {
    constructor()      { this.reg = new Uint8Array(4) }
    reset      ()      { this.reg = new Uint8Array(4) }
    r          (i)     { return this.reg[i]           }
    w          (i,val) { this.reg[i] = val & 0xFF     }

    getLenCDsbl    () { return (this.reg[0] &    NOI_ENVL) >>> 5 }
    getEnvDsbl     () { return (this.reg[0] &    NOI_CNSV) >>> 4 }
    getEnvPeriod   () { return (this.reg[0] &    NOI_VOLU) >>> 0 }

    getRandom      () { return (this.reg[2] &    NOI_LOOP) >>> 7 }
    getTimeIndex   () { return (this.reg[2] &  NOI_PERIOD) >>> 0 }

    getLenCIndex   () { return (this.reg[3] & NOI_LC_LOAD) >>> 3 }

    output () { return 0 }
}
class DMC {
    constructor()      { this.reg = new Uint8Array(4) }
    reset      ()      { this.reg = new Uint8Array(4) }
    r          (i)     { return this.reg[i]           }
    w          (i,val) { this.reg[i] = val & 0xFF     }

    getIRQEnable   () { return (this.reg[0] &  DMC_IRQ_ENABLE) >>> 7 }
    getLoop        () { return (this.reg[0] &        DMC_LOOP) >>> 6 }
    getTimeIndex   () { return (this.reg[0] &        DMC_FREQ) >>> 0 }

    getDeltaC      () { return (this.reg[1] &          DMC_LC) >>> 0 }

    getSampleAddr  () { return (this.reg[2] & DMC_SAMPLE_ADDR) >>> 0 }

    getSampleLen   () { return (this.reg[3] &  DMC_SAMPLE_LEN) >>> 0 }

    output () { return 0 }
}

class Status {
    constructor(apu) { this.apu = apu }
    r(){
        var val = 0
        val |= (this.apu.dmcIrqActive === true ? 1 : 0) << 7
        val |= (this.apu.frameIrqActive === true && this.apu.framec.getIRQDsbl() === 0 ? 1 : 0) << 6
        //val |= (this.apu.dmc.remainingBytes > 0 ? 1 : 0) << 4
        //val |= (this.apu.noise.lengthCounter > 0 ? 1 : 0) << 3
        //val |= (this.apu.triangle.lengthCounter > 0 ? 1 : 0) << 2
        val |= (this.apu.pulse1.lengthCounter > 0 ? 1 : 0) << 1
        val |= (this.apu.pulse0.lengthCounter > 0 ? 1 : 0) << 0
        this.apu.frameIrqActive = false
        return val
    }
    w(val){
        //this.apu.dmc.setEnable      ((val & 0x10) === 0x10)
        //this.apu.noise.setEnable    ((val & 0x8 ) === 0x8 )
        //this.apu.triangle.setEnable ((val & 0x4 ) === 0x4 )
        this.apu.pulse1.setEnable   ((val & 0x2 ) === 0x2 )
        this.apu.pulse0.setEnable   ((val & 0x1 ) === 0x1 )
        this.apu.frameIrqActive = false
    }
}

class FrameCounter {
    constructor(apu) { this.value = 0x00; this.apu = apu }
    reset      ()    { this.value = 0x00                 }
    r          ()    { return this.value                 }
    w          (val) { this.value = val & 0xFF; if(this.getIRQDsbl() === 1) this.apu.frameIrqActive = false }

    getMode5   ()    { return (this.value & FC_MODE_5_STEP) >>> 7 }
    getIRQDsbl ()    { return (this.value & FC_IRQ_DISABLE) >>> 6 }
}

class Audio {
    constructor(){
        this.bufferLength = 4096
        this.buffer = new Float32Array(this.bufferLength)
        this.bufferIndex = 0
        
        this.ctx = new AudioContext()
        this.sp = this.ctx.createScriptProcessor(this.bufferLength, 0, 1)
        this.sp.onaudioprocess = (e) => { this.onAudioProcess(e) }
        this.sp.connect(this.ctx.destination)
        this.sampleRate = this.ctx.sampleRate
    }
    onAudioProcess(e) {
        var data = e.outputBuffer.getChannelData(0)
        for(var i = 0, il = this.bufferLength; i < il; i++) data[i] = this.buffer[i]
        for(var i = this.bufferIndex, il = this.bufferLength; i < il; i++)
            data[i] = this.bufferIndex === 0 ? 0.0 : this.buffer[this.bufferIndex - 1]
        this.bufferIndex = 0
    }

    getSampleRate() { return this.sampleRate }
    push(data) {
        if(this.bufferIndex >= this.bufferLength) return
        this.buffer[this.bufferIndex++] = data
    }

}
class APU {
    constructor(){
        this.pulse0   = new Pulse()
        this.pulse1   = new Pulse()
        this.triangle = new Triangle()
        this.noise    = new Noise()
        this.dmc      = new DMC()
        this.status   = new Status(this)
        this.framec   = new FrameCounter(this)
        this.audio    = new Audio()

        this.cycle          = 0
        this.step           = 0
        this.samplePeriod   = (1789773 / this.audio.getSampleRate()) | 0
        this.frameIrqActive = false
        this.dmcIrqActive   = false
    }
    bindBUS(bus){ this.bus = bus }
    sample() {
        var pulse0 = this.pulse0.output()
        var pulse1 = this.pulse1.output()
        var triangle = this.triangle.output()
        var noise = this.noise.output()
        var dmc = this.dmc.output()

        var pulseOut = 0
        var tndOut = 0
    
        if(pulse0 !== 0 || pulse1 !== 0) pulseOut = 95.88 / ((8128 / (pulse0 + pulse1)) + 100)
        if(triangle !== 0 || noise !== 0 || dmc !== 0) tndOut = 159.79 / (1 / (triangle / 8227 + noise / 12241 + dmc / 22638) + 100)
    
        this.audio.push(pulseOut + tndOut)
    }


    clock(){
        this.cycle++
        if((this.cycle % this.samplePeriod) === 0) this.sample()
        if((this.cycle % 2) === 0) {
            this.pulse0.driveTimer()
            this.pulse1.driveTimer()
            //this.noise.driveTimer()
            //this.dmc.driveTimer()
        }
        //this.triangle.driveTimer()
        if((this.cycle % 7457) === 0) {
            if(this.framec.getMode5() === 1) {
                if(this.step < 4) {
                    this.pulse0.driveEnvelope()
                    this.pulse1.driveEnvelope()
                    //this.triangle.driveLinear()
                    //this.noise.driveEnvelope()
                }
                if(this.step === 0 || this.step === 2) {
                    this.pulse0.driveLength()
                    this.pulse0.driveSweep()
                    this.pulse1.driveLength()
                    this.pulse1.driveSweep()
                    //this.triangle.driveLength()
                    //this.noise.driveLength()
                }
                this.step = (this.step + 1) % 5
            } else {
                this.pulse0.driveEnvelope()
                this.pulse1.driveEnvelope()
                //this.triangle.driveLinear()
                //this.noise.driveEnvelope()
                if(this.step === 1 || this.step === 3) {
                    this.pulse0.driveLength()
                    this.pulse0.driveSweep()
                    this.pulse1.driveLength()
                    this.pulse1.driveSweep()
                    //this.triangle.driveLength()
                    //this.noise.driveLength()
                }
                if(this.step === 3 && this.framec.getIRQDsbl() === 0) this.frameIrqActive = true
                //if(this.frameIrqActive === true && this.framec.getIRQDsbl() === 0) this.bus.cpu.IRQ()
                this.step = (this.step + 1) % 4
            }
            if(this.dmcIrqActive === true) this.bus.cpu.IRQ()
        }
    }

}

export default APU