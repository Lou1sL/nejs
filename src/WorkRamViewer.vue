<template>
<div class="wrapper">
    <div class="title">CPU Memory</div>
    <div class="table-wrapper">
        <table :class="autoUpdateRamView?'':'disabled'">
            <tr>
                <th></th>
                <td v-for="data in [0,1,2,3,4,5,6,7,8,9,0xA,0xB,0xC,0xD,0xE,0xF]" :key="data" >+{{data.toString(16)}}</td>
            </tr>
            <tr v-for="(row, rowKey) in ramViewBuffer" :key="rowKey">
                <th>{{rowKey.toString(16).padStart(3,'0')+'0h'}}</th>
                <td v-for="(col, colKey) in row" :key="colKey" >{{col}}</td>
            </tr>
        </table>
    </div>
    <button v-on:click="autoUpdateRamView=!autoUpdateRamView" :class="'button' + (autoUpdateRamView?'':' disabled')" style="width:100%;margin:3px 0px;">Auto Update</button>

    <div class="input-wrapper">
        <div class="modify-row" v-for="(row, rowKey) in modify" :key="rowKey">
            <input v-model="row.inputAddr" placeholder="addr(hex)" @input="addrValidChk(rowKey)" :class="row.inputAddrValid?'':'invalid'">
            <input v-model="row.inputData" placeholder="data(hex)" @input="dataValidChk(rowKey)" :class="row.inputDataValid?'':'invalid'">
            <button v-on:click="row.inputSet=!row.inputSet" class="button disabled" style="margin:0px 2px;">Set</button>
            <button v-on:click="onLock(rowKey)" :class="'button' + (row.inputLock?'':' disabled')" style="margin:0px 2px;">Lock</button>
            <button v-on:click="modify.splice(rowKey,1)" class="delrow-button" style="float:right;">×</button>
        </div>
        <div style="width:100%;">
            <button v-on:click="modify.push({ inputAddr:'', inputData:'', inputLock:false, inputSet:false, inputAddrValid:false, inputDataValid:false })" class="addrow-button" style="width:270px;">Add</button>
            <button v-on:click="modify=[]" class="addrow-button" style="margin-left:-1px;width:79px;">Delete All</button>
        </div>
        <div style="width:100%;margin-top:5px;">
            <label for="cheat-upload" class="addrow-button" style="padding:5px 10px 6px 10px;margin-left:250px;">Load</label>
            <input id="cheat-upload" type="file" ref="cheatFile" @change="loadFile">
            <button v-on:click="saveFile" class="addrow-button" style="margin-left:-1px;">Save</button>
        </div>
        
    </div>
</div>
</template>

<script>
export default {
    name: "work-ram-viewer",
    data() { 
        return {
            ramViewBuffer:[],
            autoUpdateRamView:true,
            modify:[
                { inputAddr:'00ce', inputData:'70', inputLock:true, inputSet:false, inputAddrValid:true, inputDataValid:true }
            ]
        }
    },
    created() { this.nes = null },
    mounted(){ this.updateRamView() /* Fill with 0 */ },
    destroyed(){  },
    methods:{
        updateRamView(){
            var ram = this.nes != null ? this.nes.cpubus.ram : new Uint8Array(0x800)
            for(var r=0;r<0x80;r++){
                this.ramViewBuffer[r] = []
                var row = []
                for(var c=0;c<0x10;c++) row[c] = ram[r*0x10+c].toString(16).padStart(2,'0')
                this.$set(this.ramViewBuffer, r, row)
            }
        },
        stepCall(){
            if(this.nes == null) return
            if(this.autoUpdateRamView) this.updateRamView()
            for(var row in this.modify){
                if((this.modify[row].inputAddrValid && this.modify[row].inputDataValid) && (this.modify[row].inputSet || this.modify[row].inputLock)){
                    
                    var addr = parseInt("0x" + this.modify[row].inputAddr)
                    var data = parseInt("0x" + this.modify[row].inputData)
                    this.nes.cpubus.ram[addr] = data
                    if(this.modify[row].inputSet) this.modify[row].inputSet = false
                }
            }
        },
        addrValidChk(r){
            var a = parseInt(this.modify[r].inputAddr)
            this.modify[r].inputAddrValid = (a>=0x0000 && a<=0x07FF)
            this.modify[r].inputLock = false
        },
        dataValidChk(r){
            var a = parseInt("0x" + this.modify[r].inputData)
            this.modify[r].inputDataValid = (a>=0x00 && a<=0xFF)
            this.modify[r].inputLock = false
        },
        onLock(r){
            if(this.modify[r].inputLock) this.modify[r].inputLock = false
            else this.modify[r].inputLock = this.modify[r].inputDataValid && this.modify[r].inputAddrValid
        },
        saveFile(){
            const blob = new Blob([JSON.stringify({cheats:this.modify}, null, 2)], {type: 'text/plain'})
            const e = document.createEvent('MouseEvents'), a = document.createElement('a')
            a.download = "cheats.json"
            a.href = window.URL.createObjectURL(blob)
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
            a.dispatchEvent(e)
        },
        loadFile(){
            let reader = new FileReader() 
            reader.readAsText(this.$refs.cheatFile.files[0])
            reader.onload  = evt => { this.modify = JSON.parse(evt.target.result).cheats }
            reader.onerror = evt => { console.error(evt) }
            this.$refs.cheatFile.value = ""
        },
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
        background-color: rgb(100, 100, 100);
    }
    .table-wrapper{
        width: 100%;
        height: 500px;
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
        font-size: 11px;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    td{
        width: 12px;
        font-size: 10px;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    .modify-row{
        margin: -1px 0px;
        border: 1px solid rgb(83, 83, 83);
        padding: 5px 0px;
    }
    .delrow-button{
        cursor: pointer;
        outline: none;
        margin-top:-6px;
        margin-right: -1px;
        width:20px;
        height:20px;
        background-color: rgba(0, 0, 0, 0);
        text-align: center;
        color: white;
        padding:0px;
        padding-left:1px;
        padding-bottom:2px;
        border: 1px solid rgb(83, 83, 83);
        font-family:sans-serif;
        font-size: 10px;
        -webkit-transition-duration: 0.2s;
        transition-duration: 0.2s;
    }
    .delrow-button:hover{
        background-color: rgb(29, 29, 29);
    }
    .addrow-button{
        cursor: pointer;
        outline: none;
        background-color: rgb(44, 44, 44);
        text-align: center;
        color: white;
        padding:5px 10px;
        border: 1px solid rgb(83, 83, 83);
        font-family:sans-serif;
        font-size: 10px;
        font-weight: 100;
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    .addrow-button:hover{
        background-color: rgb(29, 29, 29);
    }
    .button{
        cursor: pointer;
        outline: none;
        background-color: rgb(255, 0, 0);
        display: inline-block;
        text-align: center;
        color: white;
        padding:5px 10px;
        border: 1px solid white;
        font-family:sans-serif;
        font-size: 10px;
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    .button.disabled{
        background-color: rgb(24, 24, 24);
    }
    .button:hover{
        box-shadow: 0 0 0px 1px rgba(255, 255, 255, 0.26);
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
        padding:5px 10px;
        font-size: 10px;
        font-family:sans-serif;
        background-color: rgb(24, 24, 24);
        border: 1px solid white;
    }
    input.invalid{
        background-color:rgb(34, 34, 34);
        color: rgb(95, 95, 95);
    }
    input[type="file"] {
        display: none;
    }
</style>