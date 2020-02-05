<template>
    <div id="app">
        <div style="position:absolute; left:50%; top:50px; width:512px; margin-left: -256px;">
            <canvas ref="myCanvas" id="canvas" width="512" height="480"></canvas>
            <br>
            <label for="file-upload" class="big-red-button">LOAD</label>
            <input id="file-upload" type="file" ref="myFile" @change="selectedFile">
            <button v-on:click="reset" style="float:right;" class="big-red-button">RST</button>
            
            
            <h3 class="title"> NEJS </h3>
            <div class="info"> A simple NES emulator written in JavaScript.</div>
            <div class="info"> Running in browser completely.</div>
            <div class="info"> Using EPX algorithm on screen scaling.</div>
            <div class="info"> PS: No audio & only supports Mapper0 currently.</div>
            <a class="info" href="https://github.com/RyuBAI/nejs/">Github link</a>
            <br>
            <br>
            <div class="key-table-wrapper">
                <div class="key-table-title">Key Mapping</div>
                <table class="key-table">
                    <tr class="key-tr">
                        <th class="key-th">UP</th>
                        <th class="key-th">LEFT</th>
                        <th class="key-th">DOWN</th>
                        <th class="key-th">RIGHT</th>
                        <th class="key-th">B</th>
                        <th class="key-th">A</th>
                        <th class="key-th">SELECT</th>
                        <th class="key-th">START</th>
                    </tr>
                    <tr>
                        <td class="key-td">W</td>
                        <td class="key-td">A</td>
                        <td class="key-td">S</td>
                        <td class="key-td">D</td>
                        <td class="key-td">K</td>
                        <td class="key-td">L</td>
                        <td class="key-td">Z</td>
                        <td class="key-td">X</td>
                    </tr>
                </table>
            </div>
            <div class="footer">2020 ryubai.com</div>
        </div>
        <div style="position:absolute; left:50%; top:50px; width:360px; margin-left: -680px;">
            <work-ram-viewer ref="WorkRamViewer"/>
        </div>
        <div style="position:absolute; left:50%; top:50px; width:360px; margin-left: 320px;">
            <v-ram-viewer ref="VRamViewer"/>
        </div>
    </div>
</template>

<script>

import { BUTTON, NES } from './nes/nes'

export default {
    name: "nejs",
    data() { return { mspf:20,timer:null } },
    created() { document.onkeydown = this.onKeyDown; document.onkeyup = this.onKeyUp; this.nes = null },
    mounted(){
        this.nes = new NES(this.$refs.myCanvas)
        this.$refs.WorkRamViewer.nes = this.nes
        this.$refs.VRamViewer.nes = this.nes
        fetch('./SuperMarioBros.nes')
            .then(res => res.blob())
            .then(blob => { this.loadFile(blob) })
    },
    destroyed(){  },
    methods:{ 
        selectedFile() {
            this.loadFile(this.$refs.myFile.files[0])
        },
        onKeyDown(e){
            if(this.nes == null) return
            //console.log(e)
            if(e.key == "l" ) this.nes.btnDown(BUTTON.A      )
            if(e.key == "k" ) this.nes.btnDown(BUTTON.B      )
            if(e.key == "z" ) this.nes.btnDown(BUTTON.SELECT )
            if(e.key == "x" ) this.nes.btnDown(BUTTON.START  )
            if(e.key == "w" ) this.nes.btnDown(BUTTON.UP     )
            if(e.key == "s" ) this.nes.btnDown(BUTTON.DOWN   )
            if(e.key == "a" ) this.nes.btnDown(BUTTON.LEFT   )
            if(e.key == "d" ) this.nes.btnDown(BUTTON.RIGHT  )
        },
        onKeyUp(e){
            if(this.nes == null) return
            //console.log(e)
            if(e.key == "l" ) this.nes.btnUp(BUTTON.A      )
            if(e.key == "k" ) this.nes.btnUp(BUTTON.B      )
            if(e.key == "z" ) this.nes.btnUp(BUTTON.SELECT )
            if(e.key == "x" ) this.nes.btnUp(BUTTON.START  )
            if(e.key == "w" ) this.nes.btnUp(BUTTON.UP     )
            if(e.key == "s" ) this.nes.btnUp(BUTTON.DOWN   )
            if(e.key == "a" ) this.nes.btnUp(BUTTON.LEFT   )
            if(e.key == "d" ) this.nes.btnUp(BUTTON.RIGHT  )
        },
        loadFile(file){
            let reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = evt => {
                if(this.timer!=null)clearTimeout(this.timer)
                this.nes.init(new Uint8Array(evt.target.result))
                this.step()
            }
            reader.onerror = evt => { console.error(evt) }
        },
        step(){
            var previousT = new Date().getTime()
            this.nes.step()
            this.$refs.WorkRamViewer.stepCall()
            this.$refs.VRamViewer.stepCall()
            var diff = new Date().getTime() - previousT
            this.timer = setTimeout(()=>{ this.step() }, this.mspf - diff)
        },
        reset(){
            this.nes.rst()
        },
     },
    computed: {  },
    render(){  },
    beforeDestroy () { if(this.timer!=null)clearTimeout(this.timer) }
}
</script>

<style lang="less">
    html, body {
        height: auto;
        width: 100%;
        overflow-x: hidden;
        background-color: #000;
    }
</style>

<style scoped lang="less">
    input[type="file"] {
        display: none;
    }
    .big-red-button {
        background-color: rgb(255, 0, 0);
        display: inline-block;
        text-align: center;
        color: white;
        padding-top:17px;
        padding-bottom:5px;
        width: 60px;
        border: 2px solid white;
        font-family:sans-serif;
        font-size: 10px;
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    .big-red-button:hover{
        background-color: rgb(146, 0, 0);
        box-shadow: 0 0 0px 2px white;
    }
    .title{
        color: red;
        text-align:center;
        width:100%;
        font-size: 18px;
        margin-top:50px;
        background-color: white;
    }
    .info{
        color: white;
        text-align:left;
        width: 100%;
        font-size: 12px;
    }
    .key-table-wrapper{
        color: white;
        border: 1px dashed rgb(71, 71, 71);
    }
    .key-table-title{
        text-align:center;
        width:100%;
        padding:3px 0;
        font-size: 15px;
        background-color: rgb(220, 0, 0);
    }
    .key-table{
        text-align: center;
        width: 100%;
        font-size: 10px;
        background-color: rgb(140, 0, 0);
    }
    .key-tr{
        text-align: center;
        width: 100%;
        border: 1px solid rgb(97, 97, 97);
    }
    .key-th, .key-td{
        text-align: center;
        width: 70px;
    }

    .footer{
        text-align: center;
        width: 100%;
        color: white;
        font-size: 10px;
        padding-top: 50px;
        padding-bottom: 10px;
    }
</style>
