<template>
<div class="wrapper">
    <div class="title">Video Memory</div>
    <div class="table-wrapper">
        <table :class="autoUpdateRamView?'':'disabled'">
            <tr>
                <th>SEC0</th>
                <td v-for="data in [0,1,2,3,4,5,6,7,8,9,0xA,0xB,0xC,0xD,0xE,0xF]" :key="data" >+{{data.toString(16)}}</td>
            </tr>
            <tr v-for="(row, rowKey) in vRam0Buffer" :key="rowKey">
                <th>{{rowKey.toString(16).padStart(3,'0')+'0h'}}</th>
                <td v-for="(col, colKey) in row" :key="colKey" >{{col}}</td>
            </tr>
        </table>
    </div>
    <div style="width:100%; height:2px; background-color:rgb(51, 51, 51);" />
    <div class="table-wrapper">
        <table :class="autoUpdateRamView?'':'disabled'">
            <tr>
                <th>SEC1</th>
                <td v-for="data in [0,1,2,3,4,5,6,7,8,9,0xA,0xB,0xC,0xD,0xE,0xF]" :key="data" >+{{data.toString(16)}}</td>
            </tr>
            <tr v-for="(row, rowKey) in vRam1Buffer" :key="rowKey">
                <th>{{rowKey.toString(16).padStart(3,'0')+'0h'}}</th>
                <td v-for="(col, colKey) in row" :key="colKey" >{{col}}</td>
            </tr>
        </table>
    </div>
    <div style="width:100%; height:2px; background-color:rgb(51, 51, 51);" />
    <div class="table-wrapper">
        <table :class="autoUpdateRamView?'':'disabled'">
            <tr>
                <th>OAM</th>
                <td v-for="data in [0,1,2,3,4,5,6,7,8,9,0xA,0xB,0xC,0xD,0xE,0xF]" :key="data" >+{{data.toString(16)}}</td>
            </tr>
            <tr v-for="(row, rowKey) in oamBuffer" :key="rowKey">
                <th>{{rowKey.toString(16).padStart(3,'0')+'0h'}}</th>
                <td v-for="(col, colKey) in row" :key="colKey" >{{col}}</td>
            </tr>
        </table>
    </div>

    <div class="input-wrapper">
        <!--
        <input v-model="inputAddr" placeholder="addr" @input="addrValidChk" :class="inputAddrValid?'':'invalid'">
        <input v-model="inputData" placeholder="data" @input="dataValidChk" :class="inputDataValid?'':'invalid'">
        <button v-on:click="inputSet=!inputSet" class="button disabled" style="margin:0px 2px;">SET</button>
        <button v-on:click="inputLock=!inputLock" :class="'button' + (inputLock?'':' disabled')" style="margin:0px 2px;">LOCK</button>
        -->
        <button v-on:click="autoUpdateRamView=!autoUpdateRamView" :class="'button' + (autoUpdateRamView?'':' disabled')" style="float:right;">UPDATE</button>
    </div>
</div>
</template>

<script>
export default {
    name: "v-ram-viewer",
    data() { 
        return { 
            vRam0Buffer:[],
            vRam1Buffer:[],
            oamBuffer:[],
            autoUpdateRamView:false,
            inputAddr:'',
            inputData:'',
            inputLock:false,
            inputSet:false,
            inputAddrValid:true,
            inputDataValid:true 
        }
    },
    created() { this.nes = null },
    mounted(){ this.updateRamView() /* Fill with 0 */ },
    destroyed(){  },
    methods:{
        updateRamView(){
            var ram0 = this.nes != null ? this.nes.bus.ppubus.vram0     : new Uint8Array(0x400)
            var ram1 = this.nes != null ? this.nes.bus.ppubus.vram1     : new Uint8Array(0x400)

            for(var r=0;r<0x40;r++){
                this.vRam0Buffer[r] = []
                this.vRam1Buffer[r] = []
                var row0 = [], row1 = []
                for(var c=0;c<0x10;c++){
                    row0[c] = ram0[r*0x10+c].toString(16).padStart(2,'0')
                    row1[c] = ram1[r*0x10+c].toString(16).padStart(2,'0')
                }
                this.$set(this.vRam0Buffer, r, row0)
                this.$set(this.vRam1Buffer, r, row1)
            }

            var oam  = this.nes != null ? this.nes.bus.ppu.priOam.getArr() : new Uint8Array(0x100)
            for(var r=0;r<0x10;r++){
                this.oamBuffer[r] = []
                var row = []
                for(var c=0;c<0x10;c++) row[c] = oam[r*0x10+c].toString(16).padStart(2,'0')
                this.$set(this.oamBuffer, r, row)
            }
        },
        stepCall(){
            if(this.nes == null) return
            if(this.autoUpdateRamView) this.updateRamView()
            if((this.inputAddrValid && this.inputDataValid) && (this.inputSet || this.inputLock)){
                //var addr = parseInt("0x" + this.inputAddr)
                //var data = parseInt("0x" + this.inputData)
                //this.nes.cpubus.ram[addr] = data
                //if(this.inputSet)this.inputSet = false
            }
        },
        addrValidChk(){ 
            var a = parseInt("0x" + this.inputAddr)
            this.inputAddrValid = (a>=0x0000 && a<=0x07FF)
        },
        dataValidChk(){ 
            var a = parseInt("0x" + this.inputData)
            this.inputDataValid = (a>=0x00 && a<=0xFF)
        }
     },
    computed: {  },
    render(){  },
    beforeDestroy () {  }
}
</script>

<style scoped lang="less">
    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-track { background: rgb(241, 241, 241); }
    ::-webkit-scrollbar-thumb { background: rgb(136, 136, 136); }
    ::-webkit-scrollbar-thumb:hover { background: rgb(85, 85, 85); box-shadow: inset 0px 0px 0px 1px rgb(241, 241, 241); }
    .wrapper{
        color: white;
        border: 1px dashed rgb(71, 71, 71);
    }
    .table-wrapper{
        width: 100%;
        height: 250px;
        overflow-y: scroll;
    }
    .title{
        text-align:center;
        width:100%;
        padding:3px 0;
        font-size: 15px;
        background-color: rgb(51, 51, 51);
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    table{
        width: 100%;
        background-color: rgb(100, 100, 100);
        table-layout:fixed;
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    table.disabled{
        background-color: rgb(78, 78, 78);
        color :rgb(129, 129, 129);
    }
    th{
        width: 30px;
        font-size: 12px;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    td{
        width: 12px;
        font-size: 12px;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    .button{
        margin: 0px 5px;
        background-color: rgb(255, 0, 0);
        display: inline-block;
        text-align: center;
        color: white;
        padding:5px 10px;
        border: 2px solid white;
        font-family:sans-serif;
        font-size: 12px;
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    .button.disabled{
        background-color: rgb(15, 15, 15);
    }
    .button:hover{
        box-shadow: 0 0 0px 2px white;
        background-color: rgb(128, 0, 0);
    }
    .input-wrapper{
        background-color: rgb(51, 51, 51);
        padding: 10px 5px;
    }
    input{
        width: 60px; 
        color: white; 
        background-color:black;
        margin: 0px 5px;
    }
    input.invalid{
        color: rgb(95, 95, 95);
    }
</style>