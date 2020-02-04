<template>
<div class="wrapper">
    <div :class="'title' + (autoUpdateRamView?'':' disabled')">CPU_RAM</div>
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
    <button v-on:click="autoUpdateRamView=!autoUpdateRamView" :class="'update-button' + (autoUpdateRamView?'':' disabled')">UPDATE</button>
    <br>
    <input width="50px">
    <input width="100px">
    <button v-on:click="updateRamView">SET</button>
    <button v-on:click="updateRamView">LOCK</button>
</div>
</template>

<script>
export default {
    name: "ram-viewer",
    data() { return { ramViewBuffer:[],autoUpdateRamView:false } },
    created() {  },
    mounted(){ this.updateRamView() /* Fill with 0 */ },
    destroyed(){  },
    methods:{
        updateRamView(){
            var ram = this.nes != null ? this.nes.cpubus.ram : new Uint8Array(0x800)
            for(var r=0;r<0x80;r++){
                this.ramViewBuffer[r] = []
                var row = []
                for(var c=0;c<0x10;c++) row[c] = ram[r*0x10+c].toString(16).toUpperCase().padStart(2,'0')
                this.$set(this.ramViewBuffer, r, row)
            }
        },
        stepCall(){
            if(this.autoUpdateRamView && (this.nes != null)) this.updateRamView()
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
        height: 600px;
        overflow-y: scroll;
    }
    .title{
        text-align:center;
        width:100%;
        padding:3px 0;
        font-size: 15px;
        background-color: rgb(220, 0, 0);
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    .title.disabled{
        background-color: rgb(51, 51, 51);
    }
    table{
        width: 100%;
        background-color: rgb(140, 0, 0);
        table-layout:fixed;
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    table.disabled{
        background-color: rgb(100, 100, 100);
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
    .update-button{
        margin-top: 3px;
        background-color: rgb(255, 0, 0);
        display: inline-block;
        text-align: center;
        color: white;
        padding:5px 10px;
        border: 2px solid white;
        font-family:sans-serif;
        font-size: 10px;
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    .update-button.disabled{
        background-color: rgb(15, 15, 15);
    }
    .update-button:hover{
        box-shadow: 0 0 0px 2px white;
    }
</style>