<template>
    <div id="app">
        <div style="position:absolute; left: 50%; top:50px; width:512px; margin-left: -256px;">
            <canvas ref="myCanvas" id="canvas" width="512" height="480"></canvas>
            <br>
            <label for="file-upload" class="big-red-button">LOAD</label>
            <input id="file-upload" type="file" ref="myFile" @change="selectedFile">
            <button v-on:click="reset" style="float: right;" class="big-red-button">RST</button>
            
            
            <h3 class="title"> NEJS </h3>
            <div class="info"> A simple NES emulator written in JavaScript.</div>
            <div class="info"> Running in browser completely.</div>
            <div class="info"> Using EPX algorithm on screen scaling.</div>
            <div class="info"> PS: No audio & only supports Mapper0 currently.</div>
            <a class="info" href="https://github.com/RyuBAI/nejs/">Github link</a>
            <br>
            <br>
            <div class="table-wrapper">
                <div class="table-title">KEY-MAPPING</div>
                <table>
                    <tr>
                        <th>UP</th>
                        <th>LEFT</th>
                        <th>DOWN</th>
                        <th>RIGHT</th>
                        <th>B</th>
                        <th>A</th>
                        <th>SELECT</th>
                        <th>START</th>
                    </tr>
                    <tr>
                        <td>W</td>
                        <td>A</td>
                        <td>S</td>
                        <td>D</td>
                        <td>K</td>
                        <td>L</td>
                        <td>Z</td>
                        <td>X</td>
                    </tr>
                </table>
            </div>
            <div class="footer">2020 ryubai.com</div>
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
            var diff = new Date().getTime() - previousT
            this.timer = setTimeout(()=>{ this.step() }, this.mspf - diff)
        },
        reset(){
            this.nes.rst()
        }
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
        //box-shadow: 0 0 10px 0 rgb(255, 0, 0);
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
        background-color: rgb(255, 255, 255);
    }
    .info{
        color: white;
        text-align:left;
        width: 100%;
        font-size: 12px;
    }
    .table-wrapper{
        color: white;
        border: 1px dashed white;
    }
    .table-title{
        text-align:center;
        width:100%;
        font-size: 15px;
        background-color: rgb(220, 0, 0);
    }
    table{
        text-align: center;
        width: 100%;
        font-size: 10px;
        background-color: rgb(140, 0, 0);
    }
    tr{
        text-align: center;
        width: 100%;
        border: 1px solid rgb(97, 97, 97);
    }
    th, td{
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
