/**
 * 6502 CPU for Nintendo Entertainment System(Famicom)
 */

const N = 0b10000000
const V = 0b01000000
const R = 0b00100000    //Reserved
const B = 0b00010000
const D = 0b00001000    //In NES decimal mode is unused
const I = 0b00000100
const Z = 0b00000010
const C = 0b00000001

const NMI = 0xFFFA
const RST = 0xFFFC
const IRQ = 0xFFFE

const STACK_SHIFT = 0x0100

//http://6502.org/tutorials/65c02opcodes.html
const OPCODE = {
    0x00 : { mnem:'BRK', addressing:'IMPL', cycle:7 }, 0x01 : { mnem:'ORA', addressing:'XIDR', cycle:6 },
    0x05 : { mnem:'ORA', addressing:'0PAG', cycle:3 }, 0x06 : { mnem:'ASL', addressing:'0PAG', cycle:5 },
    0x08 : { mnem:'PHP', addressing:'IMPL', cycle:3 }, 0x09 : { mnem:'ORA', addressing:'IMME', cycle:2 },
    0x0A : { mnem:'ASL', addressing:'ACCU', cycle:2 }, 0x0D : { mnem:'ORA', addressing:'ABSO', cycle:4 },
    0x0E : { mnem:'ASL', addressing:'ABSO', cycle:6 }, 0x10 : { mnem:'BPL', addressing:'RELA', cycle:2 },
    0x11 : { mnem:'ORA', addressing:'IDRY', cycle:5 }, 0x15 : { mnem:'ORA', addressing:'0PGX', cycle:4 },
    0x16 : { mnem:'ASL', addressing:'0PGX', cycle:6 }, 0x18 : { mnem:'CLC', addressing:'IMPL', cycle:2 },
    0x19 : { mnem:'ORA', addressing:'ABSY', cycle:4 }, 0x1D : { mnem:'ORA', addressing:'ABSX', cycle:4 },
    0x1E : { mnem:'ASL', addressing:'ABSX', cycle:7 }, 0x20 : { mnem:'JSR', addressing:'ABSO', cycle:6 },
    0x21 : { mnem:'AND', addressing:'XIDR', cycle:6 }, 0x24 : { mnem:'BIT', addressing:'0PAG', cycle:3 },
    0x25 : { mnem:'AND', addressing:'0PAG', cycle:3 }, 0x26 : { mnem:'ROL', addressing:'0PAG', cycle:5 },
    0x28 : { mnem:'PLP', addressing:'IMPL', cycle:4 }, 0x29 : { mnem:'AND', addressing:'IMME', cycle:2 },
    0x2A : { mnem:'ROL', addressing:'ACCU', cycle:2 }, 0x2C : { mnem:'BIT', addressing:'ABSO', cycle:4 },
    0x2D : { mnem:'AND', addressing:'ABSO', cycle:4 }, 0x2E : { mnem:'ROL', addressing:'ABSO', cycle:6 },
    0x30 : { mnem:'BMI', addressing:'RELA', cycle:2 }, 0x31 : { mnem:'AND', addressing:'IDRY', cycle:5 },
    0x35 : { mnem:'AND', addressing:'0PGX', cycle:4 }, 0x36 : { mnem:'ROL', addressing:'0PGX', cycle:6 },
    0x38 : { mnem:'SEC', addressing:'IMPL', cycle:2 }, 0x39 : { mnem:'AND', addressing:'ABSY', cycle:4 },
    0x3D : { mnem:'AND', addressing:'ABSX', cycle:4 }, 0x3E : { mnem:'ROL', addressing:'ABSX', cycle:7 },
    0x40 : { mnem:'RTI', addressing:'IMPL', cycle:6 }, 0x41 : { mnem:'EOR', addressing:'XIDR', cycle:6 },
    0x45 : { mnem:'EOR', addressing:'0PAG', cycle:3 }, 0x46 : { mnem:'LSR', addressing:'0PAG', cycle:5 },
    0x48 : { mnem:'PHA', addressing:'IMPL', cycle:3 }, 0x49 : { mnem:'EOR', addressing:'IMME', cycle:2 },
    0x4A : { mnem:'LSR', addressing:'ACCU', cycle:2 }, 0x4C : { mnem:'JMP', addressing:'ABSO', cycle:3 },
    0x4D : { mnem:'EOR', addressing:'ABSO', cycle:4 }, 0x4E : { mnem:'LSR', addressing:'ABSO', cycle:6 },
    0x50 : { mnem:'BVC', addressing:'RELA', cycle:2 }, 0x51 : { mnem:'EOR', addressing:'IDRY', cycle:5 },
    0x55 : { mnem:'EOR', addressing:'0PGX', cycle:4 }, 0x56 : { mnem:'LSR', addressing:'0PGX', cycle:6 },
    0x58 : { mnem:'CLI', addressing:'IMPL', cycle:2 }, 0x59 : { mnem:'EOR', addressing:'ABSY', cycle:4 },
    0x5D : { mnem:'EOR', addressing:'ABSX', cycle:4 }, 0x5E : { mnem:'LSR', addressing:'ABSX', cycle:6 },
    0x60 : { mnem:'RTS', addressing:'IMPL', cycle:6 }, 0x61 : { mnem:'ADC', addressing:'XIDR', cycle:6 },
    0x65 : { mnem:'ADC', addressing:'0PAG', cycle:3 }, 0x66 : { mnem:'ROR', addressing:'0PAG', cycle:5 },
    0x68 : { mnem:'PLA', addressing:'IMPL', cycle:4 }, 0x69 : { mnem:'ADC', addressing:'IMME', cycle:2 },
    0x6A : { mnem:'ROR', addressing:'ACCU', cycle:2 }, 0x6C : { mnem:'JMP', addressing:'IDIR', cycle:5 },
    0x6D : { mnem:'ADC', addressing:'ABSO', cycle:4 }, 0x6E : { mnem:'ROR', addressing:'ABSO', cycle:6 },
    0x70 : { mnem:'BVS', addressing:'RELA', cycle:2 }, 0x71 : { mnem:'ADC', addressing:'IDRY', cycle:5 },
    0x75 : { mnem:'ADC', addressing:'0PGX', cycle:4 }, 0x76 : { mnem:'ROR', addressing:'0PGX', cycle:6 },
    0x78 : { mnem:'SEI', addressing:'IMPL', cycle:2 }, 0x79 : { mnem:'ADC', addressing:'ABSY', cycle:4 },
    0x7D : { mnem:'ADC', addressing:'ABSX', cycle:4 }, 0x7E : { mnem:'ROR', addressing:'ABSX', cycle:7 },
    0x81 : { mnem:'STA', addressing:'XIDR', cycle:6 }, 0x84 : { mnem:'STY', addressing:'0PAG', cycle:3 },
    0x85 : { mnem:'STA', addressing:'0PAG', cycle:3 }, 0x86 : { mnem:'STX', addressing:'0PAG', cycle:3 },
    0x88 : { mnem:'DEY', addressing:'IMPL', cycle:2 }, 0x8A : { mnem:'TXA', addressing:'IMPL', cycle:2 },
    0x8C : { mnem:'STY', addressing:'ABSO', cycle:4 }, 0x8D : { mnem:'STA', addressing:'ABSO', cycle:4 },
    0x8E : { mnem:'STX', addressing:'ABSO', cycle:4 }, 0x90 : { mnem:'BCC', addressing:'RELA', cycle:2 },
    0x91 : { mnem:'STA', addressing:'IDRY', cycle:6 }, 0x94 : { mnem:'STY', addressing:'0PGX', cycle:4 },
    0x95 : { mnem:'STA', addressing:'0PGX', cycle:4 }, 0x96 : { mnem:'STX', addressing:'0PGY', cycle:4 },
    0x98 : { mnem:'TYA', addressing:'IMPL', cycle:2 }, 0x99 : { mnem:'STA', addressing:'ABSY', cycle:5 },
    0x9A : { mnem:'TXS', addressing:'IMPL', cycle:2 }, 0x9D : { mnem:'STA', addressing:'ABSX', cycle:5 },
    0xA0 : { mnem:'LDY', addressing:'IMME', cycle:2 }, 0xA1 : { mnem:'LDA', addressing:'XIDR', cycle:6 },
    0xA2 : { mnem:'LDX', addressing:'IMME', cycle:2 }, 0xA4 : { mnem:'LDY', addressing:'0PAG', cycle:3 },
    0xA5 : { mnem:'LDA', addressing:'0PAG', cycle:3 }, 0xA6 : { mnem:'LDX', addressing:'0PAG', cycle:3 },
    0xA8 : { mnem:'TAY', addressing:'IMPL', cycle:2 }, 0xA9 : { mnem:'LDA', addressing:'IMME', cycle:2 },
    0xAA : { mnem:'TAX', addressing:'IMPL', cycle:2 }, 0xAC : { mnem:'LDY', addressing:'ABSO', cycle:4 },
    0xAD : { mnem:'LDA', addressing:'ABSO', cycle:4 }, 0xAE : { mnem:'LDX', addressing:'ABSO', cycle:4 },
    0xB0 : { mnem:'BCS', addressing:'RELA', cycle:2 }, 0xB1 : { mnem:'LDA', addressing:'IDRY', cycle:5 },
    0xB4 : { mnem:'LDY', addressing:'0PGX', cycle:4 }, 0xB5 : { mnem:'LDA', addressing:'0PGX', cycle:4 },
    0xB6 : { mnem:'LDX', addressing:'0PGY', cycle:4 }, 0xB8 : { mnem:'CLV', addressing:'IMPL', cycle:2 },
    0xB9 : { mnem:'LDA', addressing:'ABSY', cycle:4 }, 0xBA : { mnem:'TSX', addressing:'IMPL', cycle:2 },
    0xBC : { mnem:'LDY', addressing:'ABSX', cycle:4 }, 0xBD : { mnem:'LDA', addressing:'ABSX', cycle:4 },
    0xBE : { mnem:'LDX', addressing:'ABSY', cycle:4 }, 0xC0 : { mnem:'CPY', addressing:'IMME', cycle:2 },
    0xC1 : { mnem:'CMP', addressing:'XIDR', cycle:6 }, 0xC4 : { mnem:'CPY', addressing:'0PAG', cycle:3 },
    0xC5 : { mnem:'CMP', addressing:'0PAG', cycle:3 }, 0xC6 : { mnem:'DEC', addressing:'0PAG', cycle:5 },
    0xC8 : { mnem:'INY', addressing:'IMPL', cycle:2 }, 0xC9 : { mnem:'CMP', addressing:'IMME', cycle:2 },
    0xCA : { mnem:'DEX', addressing:'IMPL', cycle:2 }, 0xCC : { mnem:'CPY', addressing:'ABSO', cycle:4 },
    0xCD : { mnem:'CMP', addressing:'ABSO', cycle:4 }, 0xCE : { mnem:'DEC', addressing:'ABSO', cycle:6 },
    0xD0 : { mnem:'BNE', addressing:'RELA', cycle:2 }, 0xD1 : { mnem:'CMP', addressing:'IDRY', cycle:5 },
    0xD5 : { mnem:'CMP', addressing:'0PGX', cycle:4 }, 0xD6 : { mnem:'DEC', addressing:'0PGX', cycle:6 },
    0xD8 : { mnem:'CLD', addressing:'IMPL', cycle:2 }, 0xD9 : { mnem:'CMP', addressing:'ABSY', cycle:4 },
    0xDD : { mnem:'CMP', addressing:'ABSX', cycle:4 }, 0xDE : { mnem:'DEC', addressing:'ABSX', cycle:7 },
    0xE0 : { mnem:'CPX', addressing:'IMME', cycle:2 }, 0xE1 : { mnem:'SBC', addressing:'XIDR', cycle:6 },
    0xE4 : { mnem:'CPX', addressing:'0PAG', cycle:3 }, 0xE5 : { mnem:'SBC', addressing:'0PAG', cycle:3 },
    0xE6 : { mnem:'INC', addressing:'0PAG', cycle:5 }, 0xE8 : { mnem:'INX', addressing:'IMPL', cycle:2 },
    0xE9 : { mnem:'SBC', addressing:'IMME', cycle:2 }, 0xEA : { mnem:'NOP', addressing:'IMPL', cycle:2 },
    0xEC : { mnem:'CPX', addressing:'ABSO', cycle:4 }, 0xED : { mnem:'SBC', addressing:'ABSO', cycle:4 },
    0xEE : { mnem:'INC', addressing:'ABSO', cycle:6 }, 0xF0 : { mnem:'BEQ', addressing:'RELA', cycle:2 },
    0xF1 : { mnem:'SBC', addressing:'IDRY', cycle:5 }, 0xF5 : { mnem:'SBC', addressing:'0PGX', cycle:4 },
    0xF6 : { mnem:'INC', addressing:'0PGX', cycle:6 }, 0xF8 : { mnem:'SED', addressing:'IMPL', cycle:2 },
    0xF9 : { mnem:'SBC', addressing:'ABSY', cycle:4 }, 0xFD : { mnem:'SBC', addressing:'ABSX', cycle:4 },
    0xFE : { mnem:'INC', addressing:'ABSX', cycle:7 },
}

class CPU{
    constructor(bus){
        this.pcl = 0x00
        this.pch = 0x00
        this.acc = 0x00
        this.x   = 0x00
        this.y   = 0x00
        this.sp  = 0xFF
        this.sr  = ~(N|V|B|D|I|Z|C)
        this.bus = bus
    }
    //https://www.pagetable.com/?p=410
    interrupt(int,sr){
        //Push current PC
        if(int != RST) this.busW(STACK_SHIFT + this.sp, this.pch)
        this.sp = (this.sp - 1) & 0xFF
        if(int != RST) this.busW(STACK_SHIFT + this.sp, this.pcl)
        this.sp = (this.sp - 1) & 0xFF
        //Push SR with B cleared/set
        if(int != RST) this.busW(STACK_SHIFT + this.sp, sr)
        this.sp = (this.sp - 1) & 0xFF
        //Jmp INT
        this.bus.r(int)
        this.pcl = this.busR(int)
        this.pch = this.busR(int+1)
        //Handle SR
        if(int != RST) this.sr |= I
        else this.sr = ~(N|V|D|Z|C)
    }
    //All interrupts
    RST() { this.interrupt(RST, this.sr & ~B) }
    NMI() { this.interrupt(NMI, this.sr & ~B) }
    IRQ() { this.interrupt(IRQ, this.sr & ~B) }
    BRK() { this.interrupt(IRQ, this.sr |  B) }
    //PC in 16-bit
    getPC() { return this.pcl | (this.pch << 8)                   }
    pc(val) { this.pcl = val & 0xFF; this.pch = (val >> 8) & 0xFF }
    //PC counts
    cc(n)   { this.pc(this.getPC() + n) }
    //Bus accessing (little-endian)
    busR(addr)        { return this.bus.r(addr)                           }
    busR16(addr)      { return this.busR(addr) | (this.busR(addr+1) << 8) }
    busW(addr,data)   { this.bus.w(addr,data)                             }
    busW16(addr,data) { this.busW(addr,data); this.busW(addr+1,data >> 8) }
    //Stack manipulation
    push(data)   { this.busW(STACK_SHIFT + this.sp, data); this.sp = (this.sp - 1) & 0xFF  }
    push16(data) { this.push((data >> 8) & 0xFF); this.push(data & 0xFF)                   }
    pop()        { this.sp = (this.sp + 1) & 0xFF; return this.busR(STACK_SHIFT + this.sp) }
    pop16()      { var l = this.pop(); var h = this.pop(); return l | (h << 8)             }
    //Status register
    srN(v)     { this.sr = ((v >= 0x80) ? this.sr | N : this.sr & ~N) }
    srZ(v)     { this.sr = ((v == 0x00) ? this.sr | Z : this.sr & ~Z) }
    srC(c)     { this.sr = (c ? this.sr | C : this.sr & ~C)           }
    srNZ(v)    { this.srN(v); this.srZ(v)                             }
    srNZC(v,c) { this.srNZ(v); this.srC(c)                            }
    //V if the sign of both inputs is different from the sign of the result. (Anding with 0x80 extracts just the sign bit from the result.) 
    srV(oprand,oldacc,result){ this.sr = (((oldacc ^ result) & (oprand ^ result) & 0x80) != 0 ? this.sr | V : this.sr & ~V) }
    //Page bound crossing detection
    isXBound(o,n) { return ((o ^ n) & 0xFF00) != 0 }

    toSigned(val) { return val < 0x80 ? val : val - 0x0100 }
    branch(addr)  { 
        var oldpc = this.getPC()
        var newpc = (oldpc + this.toSigned(this.busR(addr))) & 0xFFFF
        this.pc(newpc)
        return this.isXBound(oldpc,newpc) ? 2 : 1
    }

    /**
     * Addressing Modes:
     * (Actual address of target value)
     * 
     * accumulator        : N/A
     * implied            : N/A
     * immediate          : pc
     * relative           : pc
     * zeropage           : R(pc)
     * absolute           : R16(pc)
     * indirect           : R16(R16(pc)) !
     * zeropage x-indexed : R(pc) + x
     * absolute x-indexed : R16(pc) + x
     * x-indexed indirect : R16((R(pc) + x) & 0xFF) !
     * zeropage y-indexed : R(pc) + y
     * absolute y-indexed : R16(pc) + y
     * indirect y-indexed : R16(R(pc)) + y !
     * 
     * !:R16() 8-bit lo-addr page overflow should occur??
     */
    addrIMME()   { return this.getPC() }
    addrRELA()   { return this.getPC() }
    addrZP()     { return this.busR(this.getPC())          }
    addrZPX()    { return (this.addrZP() + this.x) & 0xFF  }
    addrZPY()    { return (this.addrZP() + this.y) & 0xFF  }
    addrABS()    { return this.busR16(this.getPC())        }
    addrABSX()   { return (this.addrABS() + this.x) & 0xFFFF }
    addrABSY()   { return (this.addrABS() + this.y) & 0xFFFF }
    addrINDIR()  { return this.busR16(this.addrABS())                    }
    addrXINDIR() { return this.busR16(this.addrZPX())                    }
    addrINDIRY() { return (this.busR16(this.addrZP()) + this.y) & 0xFFFF }

    //Get opcode data then count PC
    fetchOpcode() {
        var b = this.busR(this.getPC())
        if(OPCODE.hasOwnProperty(b)) { this.cc(1); return OPCODE[b] }
        else return { mnem:'N/A', addressing:'N/A', cycle:0 }
    }
    fetchAddr(opcode) {
        var addressing = opcode['addressing']
             if(addressing == 'IMPL') { return null }
        else if(addressing == 'ACCU') { return null }
        else if(addressing == 'IMME') { var d = this.addrIMME();   this.cc(1); return d }
        else if(addressing == 'RELA') { var d = this.addrRELA();   this.cc(1); return d }
        else if(addressing == '0PAG') { var d = this.addrZP();     this.cc(1); return d }
        else if(addressing == 'ABSO') { var d = this.addrABS();    this.cc(2); return d }
        else if(addressing == 'IDIR') { var d = this.addrINDIR();  this.cc(2); return d }
        else if(addressing == '0PGX') { var d = this.addrZPX();    this.cc(1); return d }
        else if(addressing == 'ABSX') { var d = this.addrABSX();   this.cc(2); return d }
        else if(addressing == 'XIDR') { var d = this.addrXINDIR(); this.cc(1); return d }
        else if(addressing == '0PGY') { var d = this.addrZPY();    this.cc(1); return d }
        else if(addressing == 'ABSY') { var d = this.addrABSY();   this.cc(2); return d }
        else if(addressing == 'IDRY') { var d = this.addrINDIRY(); this.cc(1); return d }
        else { return null }
    } 

    STEP(){
        var opcode = this.fetchOpcode()
        var addr = this.fetchAddr(opcode)
        var mnem = opcode['mnem']
        var cycle = opcode['cycle']

             if(mnem == 'NOP') { /** ^_^ */ }
        else if(mnem == 'LDA') { this.acc = this.busR(addr); this.srNZ(this.acc) }
        else if(mnem == 'STA') { this.busW(addr,this.acc) }
        else if(mnem == 'LDX') { this.x = this.busR(addr); this.srNZ(this.x) }
        else if(mnem == 'STX') { this.busW(addr,this.x) }
        else if(mnem == 'LDY') { this.y = this.busR(addr); this.srNZ(this.y) }
        else if(mnem == 'STY') { this.busW(addr,this.y) }

        else if(mnem == 'TAX') { this.x = this.acc; this.srNZ(this.x) }
        else if(mnem == 'TAY') { this.y = this.acc; this.srNZ(this.y) }
        else if(mnem == 'TXA') { this.acc = this.x; this.srNZ(this.acc) }
        else if(mnem == 'TYA') { this.acc = this.y; this.srNZ(this.acc) }
        else if(mnem == 'TXS') { this.sp = this.x }
        else if(mnem == 'TSX') { this.x = this.sp; this.srNZ(this.x) }

        else if(mnem == 'ADC') {
            var n = this.busR(addr)
            var res = (this.acc + n + ((this.sr & C) != 0 ? 1 : 0))
            if((this.sr & D) != 0){
                if(((this.acc & 0x0F) + (n & 0x0F) + ((this.sr & C) != 0 ? 1 : 0)) > 9) res += 6
                this.srNZ(res & 0xFF)
                this.srV(n,this.acc,res)
                if(res > 0x99) res += 0x60
                this.srC(res > 0x99)
            } else { //todo:fix
                this.srNZC(res & 0xFF,res > 0xFF)
                this.srV(n,this.acc,res)
            }
            this.acc = res & 0xFF
        }
        else if(mnem == 'SBC') {
            var n = 0xFF - this.busR(addr)
            var res = (this.acc + n + ((this.sr & C) != 0 ? 1 : 0))
            this.srNZ(res & 0xFF)
            this.srV(n,this.acc,res)
            if((this.sr & D) != 0){ //todo:fix
                if (((this.acc & 0x0F) - ((this.sr & C) != 0 ? 0 : 1)) < (n & 0x0F)) res -= 6
		        if (res > 0x99) res -= 0x60
            }
            this.srC(res > 0xFF)
            this.acc = res & 0xFF
        }

        else if(mnem == 'BIT') {
            var v = this.busR(addr)
            var res = this.acc & v; this.srZ(res)
            if((v & N) != 0) { this.sr |= N } else { this.sr &= (~N) }
            if((v & V) != 0) { this.sr |= V } else { this.sr &= (~V) }
        }
        else if(mnem == 'CMP') { var res = this.acc - this.busR(addr); this.srNZC(res & 0xFF,res >= 0) }
        else if(mnem == 'CPX') { var res = this.x   - this.busR(addr); this.srNZC(res & 0xFF,res >= 0) }
        else if(mnem == 'CPY') { var res = this.y   - this.busR(addr); this.srNZC(res & 0xFF,res >= 0) }

        else if(mnem == 'INX') { this.x = (this.x + 1) & 0xFF; this.srNZ(this.x) }
        else if(mnem == 'INY') { this.y = (this.y + 1) & 0xFF; this.srNZ(this.y) }
        else if(mnem == 'INC') { var v = (this.busR(addr) + 1) & 0xFF; this.busW(addr,v); this.srNZ(v) }

        else if(mnem == 'DEX') { this.x = (this.x - 1) & 0xFF; this.srNZ(this.x) }
        else if(mnem == 'DEY') { this.y = (this.y - 1) & 0xFF; this.srNZ(this.y) }
        else if(mnem == 'DEC') { var v = (this.busR(addr) - 1) & 0xFF; this.busW(addr,v); this.srNZ(v) }

        else if(mnem == 'AND') { this.acc &= this.busR(addr); this.srNZ(this.acc) }
        else if(mnem == 'ORA') { this.acc |= this.busR(addr); this.srNZ(this.acc) }
        else if(mnem == 'EOR') { this.acc ^= this.busR(addr); this.srNZ(this.acc) }

        else if(mnem == 'ROL' && (opcode['addressing'] != 'ACCU')) {
            var olv = this.busR(addr)
            var v = ((olv << 1) | (((this.sr & C) == 0)? 0 : 1)) & 0xFF
            this.srNZC(v,olv >= 0x80)
            this.busW(addr, v)
        }
        else if(mnem == 'ROL' && (opcode['addressing'] == 'ACCU')) {
            var v = ((this.acc << 1) | (((this.sr & C) == 0)? 0 : 1)) & 0xFF
            this.srNZC(v,this.acc >= 0x80)
            this.acc = v
        }
        else if(mnem == 'ROR' && (opcode['addressing'] != 'ACCU')) { 
            var olv = this.busR(addr)
            var v = (olv >> 1) | ((((this.sr & C) == 0)? 0 : 1) << 7)
            this.srNZC(v,(olv & 1) != 0)
            this.busW(addr,v)
        }
        else if(mnem == 'ROR' && (opcode['addressing'] == 'ACCU')) { 
            var v = (this.acc >> 1) | ((((this.sr & C) == 0)? 0 : 1) << 7)
            this.srNZC(v,(this.acc & 1) != 0)
            this.acc = v
        }

        else if(mnem == 'ASL' && (opcode['addressing'] != 'ACCU')) { 
            var olv = this.busR(addr)
            var v = (olv << 1) & 0xFF
            this.srNZC(v,olv >= 0x80)
            this.busW(addr, v)
        }
        else if(mnem == 'ASL' && (opcode['addressing'] == 'ACCU')) {
            var v = (this.acc << 1) & 0xFF
            this.srNZC(v,this.acc >= 0x80)
            this.acc = v
        }

        else if(mnem == 'LSR' && (opcode['addressing'] != 'ACCU')) { 
            var olv = this.busR(addr)
            var v = (olv >> 1) & 0xFF
            this.srNZC(v,(olv & 1) != 0)
            this.busW(addr,v)
        }
        else if(mnem == 'LSR' && (opcode['addressing'] == 'ACCU')) { 
            var v = (this.acc >> 1) & 0xFF
            this.srNZC(v,(this.acc & 1) != 0)
            this.acc = v
        }

        else if(mnem == 'JMP') { this.pc(addr) }
        else if(mnem == 'JSR') { this.push16(this.getPC() - 1); this.pc(addr) }
        else if(mnem == 'RTS') { this.pc(this.pop16() + 1) }
        else if(mnem == 'RTI') { this.sr = this.pop() | R; this.pc(this.pop16()) }

        else if(mnem == 'BCC') { if((this.sr & C) == 0) cycle+=this.branch(addr) }
        else if(mnem == 'BCS') { if((this.sr & C) != 0) cycle+=this.branch(addr) }
        else if(mnem == 'BPL') { if((this.sr & N) == 0) cycle+=this.branch(addr) }
        else if(mnem == 'BMI') { if((this.sr & N) != 0) cycle+=this.branch(addr) }
        else if(mnem == 'BNE') { if((this.sr & Z) == 0) cycle+=this.branch(addr) }
        else if(mnem == 'BEQ') { if((this.sr & Z) != 0) cycle+=this.branch(addr) }
        else if(mnem == 'BVC') { if((this.sr & V) == 0) cycle+=this.branch(addr) }
        else if(mnem == 'BVS') { if((this.sr & V) != 0) cycle+=this.branch(addr) }

        else if(mnem == 'PHA') { this.push(this.acc) }
        // https://wiki.nesdev.com/w/index.php/Status_flags#The_B_flag
        else if(mnem == 'PHP') { this.push(this.sr | B) }
        else if(mnem == 'PLA') { this.acc = this.pop(); this.srNZ(this.acc) }
        else if(mnem == 'PLP') { this.sr = this.pop() | R }

        else if(mnem == 'CLC') { this.sr &= ~C }
        else if(mnem == 'SEC') { this.sr |=  C }
        else if(mnem == 'CLI') { this.sr &= ~I }
        else if(mnem == 'SEI') { this.sr |=  I }
        else if(mnem == 'CLV') { this.sr &= ~V }
        else if(mnem == 'CLD') { this.sr &= ~D }
        else if(mnem == 'SED') { this.sr |=  D }

        else if(mnem == 'BRK') { this.cc(1); this.BRK() }

        else { throw ('Illegal opcode: [' + this.busR(this.getPC()) + '] at [0x'+this.dbgHexStr16(this.getPC())+']') }

        return cycle
    }
    
    DEBUG_LOG() {
        process.stdout.cursorTo(0,0)
        var op = OPCODE[this.busR(this.getPC())]
        process.stdout.write(' ║ PC═════╗ A════╗ X════╗ Y════╗ S════╗ N V - B D I Z C ═╗ ╔ OPCODE════╗\n')
        process.stdout.write(
            ' ║ ' + this.dbgHexStr16(this.getPC()) + ' ║ ' + this.dbgHexStr(this.acc) + 
            ' ║ ' + this.dbgHexStr(this.x)         + ' ║ ' + this.dbgHexStr(this.y) + 
            ' ║ ' + this.dbgHexStr(this.sp)        + ' ║ ' + this.dbgBinStr(this.sr)+ 
            ' ║ ' + '║ '+op.mnem+'['+op.addressing+'] ║'+ '\n')
        process.stdout.write(' ╚════════╩══════╩══════╩══════╩══════╩══════════════════╝ ╚═══════════╝\n')
    }
    dbgHexStr16(val){ return '0x'+val.toString(16).toUpperCase().padStart(4, '0')                          } 
    dbgHexStr(val)  { return '0x'+val.toString(16).toUpperCase().padStart(2, '0')                          }
    dbgBinStr(val)  { return (val & 0xFF).toString(2).padStart(8, '0').replace(/1/g,'😊 ').replace(/0/g,'😭 ') }
}

export default CPU