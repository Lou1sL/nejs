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

//Addressing modes, adds X page cycle
function ADDRESSING_IMPL(cpu, x){ return null }
function ADDRESSING_ACCU(cpu, x){ return null }
function ADDRESSING_IMME(cpu, x){ var addr = cpu.getPC();                                                                                      cpu.cc(1); return addr }
function ADDRESSING_RELA(cpu, x){ var addr = cpu.getPC();                                                                                      cpu.cc(1); return addr }
function ADDRESSING_OPAG(cpu, x){ var addr = cpu.busR(cpu.getPC());                                                                            cpu.cc(1); return addr }
function ADDRESSING_OPGX(cpu, x){ var addr = (cpu.busR(cpu.getPC()) + cpu.x) & 0xFF;                                                           cpu.cc(1); return addr }
function ADDRESSING_OPGY(cpu, x){ var addr = (cpu.busR(cpu.getPC()) + cpu.y) & 0xFF;                                                           cpu.cc(1); return addr }
function ADDRESSING_ABSO(cpu, x){ var addr = cpu.busR16(cpu.getPC());                                                                          cpu.cc(2); return addr }
function ADDRESSING_ABSX(cpu, x){ var from = cpu.busR16(cpu.getPC()); var addr = (from + cpu.x) & 0xFFFF; if(x)cpu.XPage(from,addr);           cpu.cc(2); return addr }
function ADDRESSING_ABSY(cpu, x){ var from = cpu.busR16(cpu.getPC()); var addr = (from + cpu.y) & 0xFFFF; if(x)cpu.XPage(from,addr);           cpu.cc(2); return addr }
function ADDRESSING_IDIR(cpu, x){ var addr = cpu.busR16(cpu.busR16(cpu.getPC()));                                                              cpu.cc(2); return addr }
function ADDRESSING_XIDR(cpu, x){ var addr = cpu.busR16((cpu.busR(cpu.getPC()) + cpu.x) & 0xFF);                                               cpu.cc(1); return addr }
function ADDRESSING_IDRY(cpu, x){ var from = cpu.busR16(cpu.busR(cpu.getPC())); var addr = (from + cpu.y) & 0xFFFF; if(x)cpu.XPage(from,addr); cpu.cc(1); return addr }

//Opcode handling
function OPCODE_NOP (cpu, addr) { /** ^_^ */ }

function OPCODE_LDA (cpu, addr) { cpu.acc = cpu.busR(addr); cpu.srNZ(cpu.acc) }
function OPCODE_STA (cpu, addr) { cpu.busW(addr,cpu.acc) }
function OPCODE_LDX (cpu, addr) { cpu.x = cpu.busR(addr); cpu.srNZ(cpu.x) }
function OPCODE_STX (cpu, addr) { cpu.busW(addr,cpu.x) }
function OPCODE_LDY (cpu, addr) { cpu.y = cpu.busR(addr); cpu.srNZ(cpu.y) }
function OPCODE_STY (cpu, addr) { cpu.busW(addr,cpu.y) }

function OPCODE_TAX (cpu, addr) { cpu.x = cpu.acc; cpu.srNZ(cpu.x) }
function OPCODE_TAY (cpu, addr) { cpu.y = cpu.acc; cpu.srNZ(cpu.y) }
function OPCODE_TXA (cpu, addr) { cpu.acc = cpu.x; cpu.srNZ(cpu.acc) }
function OPCODE_TYA (cpu, addr) { cpu.acc = cpu.y; cpu.srNZ(cpu.acc) }
function OPCODE_TXS (cpu, addr) { cpu.sp = cpu.x }
function OPCODE_TSX (cpu, addr) { cpu.x = cpu.sp; cpu.srNZ(cpu.x) }

function OPCODE_ADC (cpu, addr) {
    var data = cpu.busR(addr)
    var res = (cpu.acc + data + ((cpu.sr & C) != 0 ? 1 : 0))
    if((cpu.sr & D) != 0){
        if(((cpu.acc & 0x0F) + (data & 0x0F) + ((cpu.sr & C) != 0 ? 1 : 0)) > 9) res += 6
        cpu.srNZ(res & 0xFF)
        cpu.srV(data,cpu.acc,res)
        if(res > 0x99) res += 0x60
        cpu.srC(res > 0x99)
    } else { //todo:fix
        cpu.srNZC(res & 0xFF,res > 0xFF)
        cpu.srV(data,cpu.acc,res)
    }
    cpu.acc = res & 0xFF
}
function OPCODE_SBC (cpu, addr) {
    var n = 0xFF - cpu.busR(addr)
    var res = (cpu.acc + n + ((cpu.sr & C) != 0 ? 1 : 0))
    cpu.srNZ(res & 0xFF)
    cpu.srV(n,cpu.acc,res)
    if((cpu.sr & D) != 0){ //todo:fix
        if (((cpu.acc & 0x0F) - ((cpu.sr & C) != 0 ? 0 : 1)) < (n & 0x0F)) res -= 6
	    if (res > 0x99) res -= 0x60
    }
    cpu.srC(res > 0xFF)
    cpu.acc = res & 0xFF
}

function OPCODE_BIT (cpu, addr) {
    var data = cpu.busR(addr)
    var res = cpu.acc & data; cpu.srZ(res)
    if((data & N) != 0) { cpu.sr |= N } else { cpu.sr &= (~N) }
    if((data & V) != 0) { cpu.sr |= V } else { cpu.sr &= (~V) }
}
function OPCODE_CMP (cpu, addr) { var res = cpu.acc - cpu.busR(addr); cpu.srNZC(res & 0xFF,res >= 0) }
function OPCODE_CPX (cpu, addr) { var res = cpu.x   - cpu.busR(addr); cpu.srNZC(res & 0xFF,res >= 0) }
function OPCODE_CPY (cpu, addr) { var res = cpu.y   - cpu.busR(addr); cpu.srNZC(res & 0xFF,res >= 0) }

function OPCODE_INX (cpu, addr) { cpu.x = (cpu.x + 1) & 0xFF; cpu.srNZ(cpu.x) }
function OPCODE_INY (cpu, addr) { cpu.y = (cpu.y + 1) & 0xFF; cpu.srNZ(cpu.y) }
function OPCODE_INC (cpu, addr) { var v = (cpu.busR(addr) + 1) & 0xFF; cpu.busW(addr,v); cpu.srNZ(v) }

function OPCODE_DEX (cpu, addr) { cpu.x = (cpu.x - 1) & 0xFF; cpu.srNZ(cpu.x) }
function OPCODE_DEY (cpu, addr) { cpu.y = (cpu.y - 1) & 0xFF; cpu.srNZ(cpu.y) }
function OPCODE_DEC (cpu, addr) { var v = (cpu.busR(addr) - 1) & 0xFF; cpu.busW(addr,v); cpu.srNZ(v) }

function OPCODE_AND (cpu, addr) { cpu.acc &= cpu.busR(addr); cpu.srNZ(cpu.acc) }
function OPCODE_ORA (cpu, addr) { cpu.acc |= cpu.busR(addr); cpu.srNZ(cpu.acc) }
function OPCODE_EOR (cpu, addr) { cpu.acc ^= cpu.busR(addr); cpu.srNZ(cpu.acc) }

function OPCODE_ROL (cpu, addr) {
    if(addr != null){ // ADDRESSING is not ACCU
        var data = cpu.busR(addr)
        var v = ((data << 1) | (((cpu.sr & C) == 0)? 0 : 1)) & 0xFF
        cpu.srNZC(v,data >= 0x80)
        cpu.busW(addr, v)
    }else{ // ADDRESSING is ACCU
        var v = ((cpu.acc << 1) | (((cpu.sr & C) == 0)? 0 : 1)) & 0xFF
        cpu.srNZC(v,cpu.acc >= 0x80)
        cpu.acc = v
    }
}
function OPCODE_ROR (cpu, addr) {
    if(addr != null){
        var data = cpu.busR(addr)
        var v = (data >> 1) | ((((cpu.sr & C) == 0)? 0 : 1) << 7)
        cpu.srNZC(v,(data & 1) != 0)
        cpu.busW(addr,v)
    }else{
        var v = (cpu.acc >> 1) | ((((cpu.sr & C) == 0)? 0 : 1) << 7)
        cpu.srNZC(v,(cpu.acc & 1) != 0)
        cpu.acc = v
    }
}
function OPCODE_ASL (cpu, addr) {
    if(addr != null){
        var data = cpu.busR(addr)
        var v = (data << 1) & 0xFF
        cpu.srNZC(v,data >= 0x80)
        cpu.busW(addr, v)
    }else{
        var v = (cpu.acc << 1) & 0xFF
        cpu.srNZC(v,cpu.acc >= 0x80)
        cpu.acc = v
    }
}
function OPCODE_LSR (cpu, addr) {
    if(addr != null){
        var data = cpu.busR(addr)
        var v = (data >> 1) & 0xFF
        cpu.srNZC(v,(data & 1) != 0)
        cpu.busW(addr,v)
    }else{
        var v = (cpu.acc >> 1) & 0xFF
        cpu.srNZC(v,(cpu.acc & 1) != 0)
        cpu.acc = v
    }
}

function OPCODE_JMP (cpu, addr) { cpu.pc(addr) }
function OPCODE_JSR (cpu, addr) { cpu.push16(cpu.getPC() - 1); cpu.pc(addr) }
function OPCODE_RTS (cpu, addr) { cpu.pc(cpu.pop16() + 1) }
function OPCODE_RTI (cpu, addr) { cpu.sr = cpu.pop() | R; cpu.pc(cpu.pop16()) }

function OPCODE_BCC (cpu, addr) { if((cpu.sr & C) == 0) cpu.branch(addr) }
function OPCODE_BCS (cpu, addr) { if((cpu.sr & C) != 0) cpu.branch(addr) }
function OPCODE_BPL (cpu, addr) { if((cpu.sr & N) == 0) cpu.branch(addr) }
function OPCODE_BMI (cpu, addr) { if((cpu.sr & N) != 0) cpu.branch(addr) }
function OPCODE_BNE (cpu, addr) { if((cpu.sr & Z) == 0) cpu.branch(addr) }
function OPCODE_BEQ (cpu, addr) { if((cpu.sr & Z) != 0) cpu.branch(addr) }
function OPCODE_BVC (cpu, addr) { if((cpu.sr & V) == 0) cpu.branch(addr) }
function OPCODE_BVS (cpu, addr) { if((cpu.sr & V) != 0) cpu.branch(addr) }

function OPCODE_PHA (cpu, addr) { cpu.push(cpu.acc) }
// https://wiki.nesdev.com/w/index.php/Status_flags#The_B_flag
function OPCODE_PHP (cpu, addr) { cpu.push(cpu.sr | B) }
function OPCODE_PLA (cpu, addr) { cpu.acc = cpu.pop(); cpu.srNZ(cpu.acc) }
function OPCODE_PLP (cpu, addr) { cpu.sr = cpu.pop() | R }

function OPCODE_CLC (cpu, addr) { cpu.sr &= ~C }
function OPCODE_SEC (cpu, addr) { cpu.sr |=  C }
function OPCODE_CLI (cpu, addr) { cpu.sr &= ~I }
function OPCODE_SEI (cpu, addr) { cpu.sr |=  I }
function OPCODE_CLV (cpu, addr) { cpu.sr &= ~V }
function OPCODE_CLD (cpu, addr) { cpu.sr &= ~D }
function OPCODE_SED (cpu, addr) { cpu.sr |=  D }

function OPCODE_BRK (cpu, addr) { cpu.cc(1); cpu.BRK() }

//http://nesdev.com/6502.txt
const OPCODE = {
    0x00 : { handler:OPCODE_BRK, addressing:ADDRESSING_IMPL, cycle:7, xpgcyc:false }, 0x01 : { handler:OPCODE_ORA, addressing:ADDRESSING_XIDR, cycle:6, xpgcyc:false },
    0x05 : { handler:OPCODE_ORA, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false }, 0x06 : { handler:OPCODE_ASL, addressing:ADDRESSING_OPAG, cycle:5, xpgcyc:false },
    0x08 : { handler:OPCODE_PHP, addressing:ADDRESSING_IMPL, cycle:3, xpgcyc:false }, 0x09 : { handler:OPCODE_ORA, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false },
    0x0A : { handler:OPCODE_ASL, addressing:ADDRESSING_ACCU, cycle:2, xpgcyc:false }, 0x0D : { handler:OPCODE_ORA, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false },
    0x0E : { handler:OPCODE_ASL, addressing:ADDRESSING_ABSO, cycle:6, xpgcyc:false }, 0x10 : { handler:OPCODE_BPL, addressing:ADDRESSING_RELA, cycle:2, xpgcyc:true  },
    0x11 : { handler:OPCODE_ORA, addressing:ADDRESSING_IDRY, cycle:5, xpgcyc:true  }, 0x15 : { handler:OPCODE_ORA, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false },
    0x16 : { handler:OPCODE_ASL, addressing:ADDRESSING_OPGX, cycle:6, xpgcyc:false }, 0x18 : { handler:OPCODE_CLC, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false },
    0x19 : { handler:OPCODE_ORA, addressing:ADDRESSING_ABSY, cycle:4, xpgcyc:true  }, 0x1D : { handler:OPCODE_ORA, addressing:ADDRESSING_ABSX, cycle:4, xpgcyc:true  },
    0x1E : { handler:OPCODE_ASL, addressing:ADDRESSING_ABSX, cycle:7, xpgcyc:false }, 0x20 : { handler:OPCODE_JSR, addressing:ADDRESSING_ABSO, cycle:6, xpgcyc:false },
    0x21 : { handler:OPCODE_AND, addressing:ADDRESSING_XIDR, cycle:6, xpgcyc:false }, 0x24 : { handler:OPCODE_BIT, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false },
    0x25 : { handler:OPCODE_AND, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false }, 0x26 : { handler:OPCODE_ROL, addressing:ADDRESSING_OPAG, cycle:5, xpgcyc:false },
    0x28 : { handler:OPCODE_PLP, addressing:ADDRESSING_IMPL, cycle:4, xpgcyc:false }, 0x29 : { handler:OPCODE_AND, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false },
    0x2A : { handler:OPCODE_ROL, addressing:ADDRESSING_ACCU, cycle:2, xpgcyc:false }, 0x2C : { handler:OPCODE_BIT, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false },
    0x2D : { handler:OPCODE_AND, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false }, 0x2E : { handler:OPCODE_ROL, addressing:ADDRESSING_ABSO, cycle:6, xpgcyc:false },
    0x30 : { handler:OPCODE_BMI, addressing:ADDRESSING_RELA, cycle:2, xpgcyc:true  }, 0x31 : { handler:OPCODE_AND, addressing:ADDRESSING_IDRY, cycle:5, xpgcyc:true  },
    0x35 : { handler:OPCODE_AND, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false }, 0x36 : { handler:OPCODE_ROL, addressing:ADDRESSING_OPGX, cycle:6, xpgcyc:false },
    0x38 : { handler:OPCODE_SEC, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0x39 : { handler:OPCODE_AND, addressing:ADDRESSING_ABSY, cycle:4, xpgcyc:true  },
    0x3D : { handler:OPCODE_AND, addressing:ADDRESSING_ABSX, cycle:4, xpgcyc:true  }, 0x3E : { handler:OPCODE_ROL, addressing:ADDRESSING_ABSX, cycle:7, xpgcyc:false },
    0x40 : { handler:OPCODE_RTI, addressing:ADDRESSING_IMPL, cycle:6, xpgcyc:false }, 0x41 : { handler:OPCODE_EOR, addressing:ADDRESSING_XIDR, cycle:6, xpgcyc:false },
    0x45 : { handler:OPCODE_EOR, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false }, 0x46 : { handler:OPCODE_LSR, addressing:ADDRESSING_OPAG, cycle:5, xpgcyc:false },
    0x48 : { handler:OPCODE_PHA, addressing:ADDRESSING_IMPL, cycle:3, xpgcyc:false }, 0x49 : { handler:OPCODE_EOR, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false },
    0x4A : { handler:OPCODE_LSR, addressing:ADDRESSING_ACCU, cycle:2, xpgcyc:false }, 0x4C : { handler:OPCODE_JMP, addressing:ADDRESSING_ABSO, cycle:3, xpgcyc:false },
    0x4D : { handler:OPCODE_EOR, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false }, 0x4E : { handler:OPCODE_LSR, addressing:ADDRESSING_ABSO, cycle:6, xpgcyc:false },
    0x50 : { handler:OPCODE_BVC, addressing:ADDRESSING_RELA, cycle:2, xpgcyc:true  }, 0x51 : { handler:OPCODE_EOR, addressing:ADDRESSING_IDRY, cycle:5, xpgcyc:true  },
    0x55 : { handler:OPCODE_EOR, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false }, 0x56 : { handler:OPCODE_LSR, addressing:ADDRESSING_OPGX, cycle:6, xpgcyc:false },
    0x58 : { handler:OPCODE_CLI, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0x59 : { handler:OPCODE_EOR, addressing:ADDRESSING_ABSY, cycle:4, xpgcyc:true  },
    0x5D : { handler:OPCODE_EOR, addressing:ADDRESSING_ABSX, cycle:4, xpgcyc:true  }, 0x5E : { handler:OPCODE_LSR, addressing:ADDRESSING_ABSX, cycle:7, xpgcyc:false },
    0x60 : { handler:OPCODE_RTS, addressing:ADDRESSING_IMPL, cycle:6, xpgcyc:false }, 0x61 : { handler:OPCODE_ADC, addressing:ADDRESSING_XIDR, cycle:6, xpgcyc:false },
    0x65 : { handler:OPCODE_ADC, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false }, 0x66 : { handler:OPCODE_ROR, addressing:ADDRESSING_OPAG, cycle:5, xpgcyc:false },
    0x68 : { handler:OPCODE_PLA, addressing:ADDRESSING_IMPL, cycle:4, xpgcyc:false }, 0x69 : { handler:OPCODE_ADC, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false },
    0x6A : { handler:OPCODE_ROR, addressing:ADDRESSING_ACCU, cycle:2, xpgcyc:false }, 0x6C : { handler:OPCODE_JMP, addressing:ADDRESSING_IDIR, cycle:5, xpgcyc:false },
    0x6D : { handler:OPCODE_ADC, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false }, 0x6E : { handler:OPCODE_ROR, addressing:ADDRESSING_ABSO, cycle:6, xpgcyc:false },
    0x70 : { handler:OPCODE_BVS, addressing:ADDRESSING_RELA, cycle:2, xpgcyc:true  }, 0x71 : { handler:OPCODE_ADC, addressing:ADDRESSING_IDRY, cycle:5, xpgcyc:true  },
    0x75 : { handler:OPCODE_ADC, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false }, 0x76 : { handler:OPCODE_ROR, addressing:ADDRESSING_OPGX, cycle:6, xpgcyc:false },
    0x78 : { handler:OPCODE_SEI, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0x79 : { handler:OPCODE_ADC, addressing:ADDRESSING_ABSY, cycle:4, xpgcyc:true  },
    0x7D : { handler:OPCODE_ADC, addressing:ADDRESSING_ABSX, cycle:4, xpgcyc:true  }, 0x7E : { handler:OPCODE_ROR, addressing:ADDRESSING_ABSX, cycle:7, xpgcyc:false },
    0x81 : { handler:OPCODE_STA, addressing:ADDRESSING_XIDR, cycle:6, xpgcyc:false }, 0x84 : { handler:OPCODE_STY, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false },
    0x85 : { handler:OPCODE_STA, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false }, 0x86 : { handler:OPCODE_STX, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false },
    0x88 : { handler:OPCODE_DEY, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0x8A : { handler:OPCODE_TXA, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false },
    0x8C : { handler:OPCODE_STY, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false }, 0x8D : { handler:OPCODE_STA, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false },
    0x8E : { handler:OPCODE_STX, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false }, 0x90 : { handler:OPCODE_BCC, addressing:ADDRESSING_RELA, cycle:2, xpgcyc:true  },
    0x91 : { handler:OPCODE_STA, addressing:ADDRESSING_IDRY, cycle:6, xpgcyc:false }, 0x94 : { handler:OPCODE_STY, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false },
    0x95 : { handler:OPCODE_STA, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false }, 0x96 : { handler:OPCODE_STX, addressing:ADDRESSING_OPGY, cycle:4, xpgcyc:false },
    0x98 : { handler:OPCODE_TYA, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0x99 : { handler:OPCODE_STA, addressing:ADDRESSING_ABSY, cycle:5, xpgcyc:false },
    0x9A : { handler:OPCODE_TXS, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0x9D : { handler:OPCODE_STA, addressing:ADDRESSING_ABSX, cycle:5, xpgcyc:false },
    0xA0 : { handler:OPCODE_LDY, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false }, 0xA1 : { handler:OPCODE_LDA, addressing:ADDRESSING_XIDR, cycle:6, xpgcyc:false },
    0xA2 : { handler:OPCODE_LDX, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false }, 0xA4 : { handler:OPCODE_LDY, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false },
    0xA5 : { handler:OPCODE_LDA, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false }, 0xA6 : { handler:OPCODE_LDX, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false },
    0xA8 : { handler:OPCODE_TAY, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0xA9 : { handler:OPCODE_LDA, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false },
    0xAA : { handler:OPCODE_TAX, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0xAC : { handler:OPCODE_LDY, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false },
    0xAD : { handler:OPCODE_LDA, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false }, 0xAE : { handler:OPCODE_LDX, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false },
    0xB0 : { handler:OPCODE_BCS, addressing:ADDRESSING_RELA, cycle:2, xpgcyc:true  }, 0xB1 : { handler:OPCODE_LDA, addressing:ADDRESSING_IDRY, cycle:5, xpgcyc:true  },
    0xB4 : { handler:OPCODE_LDY, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false }, 0xB5 : { handler:OPCODE_LDA, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false },
    0xB6 : { handler:OPCODE_LDX, addressing:ADDRESSING_OPGY, cycle:4, xpgcyc:false }, 0xB8 : { handler:OPCODE_CLV, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false },
    0xB9 : { handler:OPCODE_LDA, addressing:ADDRESSING_ABSY, cycle:4, xpgcyc:true  }, 0xBA : { handler:OPCODE_TSX, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false },
    0xBC : { handler:OPCODE_LDY, addressing:ADDRESSING_ABSX, cycle:4, xpgcyc:true  }, 0xBD : { handler:OPCODE_LDA, addressing:ADDRESSING_ABSX, cycle:4, xpgcyc:true  },
    0xBE : { handler:OPCODE_LDX, addressing:ADDRESSING_ABSY, cycle:4, xpgcyc:true  }, 0xC0 : { handler:OPCODE_CPY, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false },
    0xC1 : { handler:OPCODE_CMP, addressing:ADDRESSING_XIDR, cycle:6, xpgcyc:false }, 0xC4 : { handler:OPCODE_CPY, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false },
    0xC5 : { handler:OPCODE_CMP, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false }, 0xC6 : { handler:OPCODE_DEC, addressing:ADDRESSING_OPAG, cycle:5, xpgcyc:false },
    0xC8 : { handler:OPCODE_INY, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0xC9 : { handler:OPCODE_CMP, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false },
    0xCA : { handler:OPCODE_DEX, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0xCC : { handler:OPCODE_CPY, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false },
    0xCD : { handler:OPCODE_CMP, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false }, 0xCE : { handler:OPCODE_DEC, addressing:ADDRESSING_ABSO, cycle:6, xpgcyc:false },
    0xD0 : { handler:OPCODE_BNE, addressing:ADDRESSING_RELA, cycle:2, xpgcyc:true  }, 0xD1 : { handler:OPCODE_CMP, addressing:ADDRESSING_IDRY, cycle:5, xpgcyc:true  },
    0xD5 : { handler:OPCODE_CMP, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false }, 0xD6 : { handler:OPCODE_DEC, addressing:ADDRESSING_OPGX, cycle:6, xpgcyc:false },
    0xD8 : { handler:OPCODE_CLD, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false }, 0xD9 : { handler:OPCODE_CMP, addressing:ADDRESSING_ABSY, cycle:4, xpgcyc:true  },
    0xDD : { handler:OPCODE_CMP, addressing:ADDRESSING_ABSX, cycle:4, xpgcyc:true  }, 0xDE : { handler:OPCODE_DEC, addressing:ADDRESSING_ABSX, cycle:7, xpgcyc:false },
    0xE0 : { handler:OPCODE_CPX, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false }, 0xE1 : { handler:OPCODE_SBC, addressing:ADDRESSING_XIDR, cycle:6, xpgcyc:false },
    0xE4 : { handler:OPCODE_CPX, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false }, 0xE5 : { handler:OPCODE_SBC, addressing:ADDRESSING_OPAG, cycle:3, xpgcyc:false },
    0xE6 : { handler:OPCODE_INC, addressing:ADDRESSING_OPAG, cycle:5, xpgcyc:false }, 0xE8 : { handler:OPCODE_INX, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false },
    0xE9 : { handler:OPCODE_SBC, addressing:ADDRESSING_IMME, cycle:2, xpgcyc:false }, 0xEA : { handler:OPCODE_NOP, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false },
    0xEC : { handler:OPCODE_CPX, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false }, 0xED : { handler:OPCODE_SBC, addressing:ADDRESSING_ABSO, cycle:4, xpgcyc:false },
    0xEE : { handler:OPCODE_INC, addressing:ADDRESSING_ABSO, cycle:6, xpgcyc:false }, 0xF0 : { handler:OPCODE_BEQ, addressing:ADDRESSING_RELA, cycle:2, xpgcyc:true  },
    0xF1 : { handler:OPCODE_SBC, addressing:ADDRESSING_IDRY, cycle:5, xpgcyc:true  }, 0xF5 : { handler:OPCODE_SBC, addressing:ADDRESSING_OPGX, cycle:4, xpgcyc:false },
    0xF6 : { handler:OPCODE_INC, addressing:ADDRESSING_OPGX, cycle:6, xpgcyc:false }, 0xF8 : { handler:OPCODE_SED, addressing:ADDRESSING_IMPL, cycle:2, xpgcyc:false },
    0xF9 : { handler:OPCODE_SBC, addressing:ADDRESSING_ABSY, cycle:4, xpgcyc:true  }, 0xFD : { handler:OPCODE_SBC, addressing:ADDRESSING_ABSX, cycle:4, xpgcyc:true  },
    0xFE : { handler:OPCODE_INC, addressing:ADDRESSING_ABSX, cycle:7, xpgcyc:false },
}

class CPU{
    constructor(){
        this.pcl = 0x00
        this.pch = 0x00
        this.acc = 0x00
        this.x   = 0x00
        this.y   = 0x00
        this.sp  = 0xFF
        this.sr  = ~(N|V|B|D|I|Z|C)

        this.cycleCounter = 0
    }
    //Bus accessing (little-endian)
    bindBUS (bus)       { this.bus = bus                                    }
    busR    (addr)      { return this.bus.r(addr)                           }
    busR16  (addr)      { return this.busR(addr) | (this.busR(addr+1) << 8) }
    busW    (addr,data) { this.bus.w(addr,data)                             }
    busW16  (addr,data) { this.busW(addr,data); this.busW(addr+1,data >> 8) }
    
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
        this.pcl = this.busR(int)
        this.pch = this.busR(int+1)
        //Handle SR
        if(int != RST) this.sr |= I
        else this.sr = ~(N|V|D|Z|C)
    }
    //All interrupts
    RST() { this.interrupt(RST, this.sr & ~B); this.cycleCounter = 8 }
    NMI() { this.interrupt(NMI, this.sr & ~B); this.cycleCounter = 8 }
    IRQ() { this.interrupt(IRQ, this.sr & ~B); this.cycleCounter = 7 }
    BRK() { this.interrupt(IRQ, this.sr |  B); this.cycleCounter = 7 }
    //PC in 16-bit
    getPC() { return this.pcl | (this.pch << 8)                   }
    pc(val) { this.pcl = val & 0xFF; this.pch = (val >> 8) & 0xFF }
    //PC counts
    cc(n)   { this.pc(this.getPC() + n) }

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
    //Cross page 1 cycle penalty
    XPage(o,n) { this.cycleCounter += (((o ^ n) & 0xFF00) != 0) ? 1 : 0 }

    toSigned(val) { return val < 0x80 ? val : val - 0x0100 }

    //Branch, adds X page cycle
    branch(addr)  { 
        var oldpc = this.getPC()
        var newpc = (oldpc + this.toSigned(this.busR(addr))) & 0xFFFF
        this.pc(newpc)
        this.cycleCounter += 1
        this.XPage(oldpc,newpc)
    }

    //Gets opcode data,counts PC,adds basic cycle
    fetchOpcode() {
        var b = this.busR(this.getPC())
        this.cc(1)
        if(OPCODE.hasOwnProperty(b)) { this.cycleCounter=OPCODE[b]['cycle']; return OPCODE[b] }
        else { this.cycleCounter=0; return null }
    }
    
    step(){
        var opcode = this.fetchOpcode()
        if(opcode === null) throw ('Illegal opcode: [' + this.busR(this.getPC()) + '] at ['+this.dbgHexStr16(this.getPC())+']')
        //Some instructions don't suffer from cross page cycle penalties
        var addr = opcode['addressing'](this, opcode['xpgcyc'])
        opcode['handler'](this, addr)
    }

    clock() {
        //console.log(this.getPC().toString(16))
        if(this.cycleCounter <= 0) this.step()
        this.cycleCounter--
    }

    printStatus() {
        process.stdout.cursorTo(0,0)
        var op = OPCODE[this.busR(this.getPC())]
        process.stdout.write(' ║ PC═════╗ A════╗ X════╗ Y════╗ S════╗ N V - B D I Z C ═╗ \n')
        process.stdout.write(
            ' ║ ' + this.dbgHexStr(this.getPC(),4) + ' ║ ' + this.dbgHexStr(this.acc) + 
            ' ║ ' + this.dbgHexStr(this.x)         + ' ║ ' + this.dbgHexStr(this.y) + 
            ' ║ ' + this.dbgHexStr(this.sp)        + ' ║ ' + this.dbgBinStr(this.sr)+ 
            ' ║ ' + '\n')
        process.stdout.write(' ╚════════╩══════╩══════╩══════╩══════╩══════════════════╝ \n')
    }
    dbgHexStr(val,pad=2) { return '0x'+val.toString(16).toUpperCase().padStart(pad, '0') }
    dbgBinStr(val)       { return (val & 0xFF).toString(2).padStart(8, '0').replace(/1/g,'😊 ').replace(/0/g,'😭 ') }
}

export default CPU