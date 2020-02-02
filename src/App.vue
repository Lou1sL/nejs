<template>
    <div id="app">
        <canvas ref="myCanvas" id="canvas" width="512" height="480"></canvas>
        <br>
        <input type="file" ref="myFile" @change="selectedFile">
        <button v-on:click="reset">RESET</button>
        
        <h3> NEJS </h3>
        <h3> 一个简单的纯js编写的FC模拟器，完全运行于浏览器内 (目前只支持Mapper0)，使用EPX算法优化分辨率</h3>
        <h3> 键位：W:↑  A:← S:↓  D:→  K:B  L:A  Z:SELECT  X:START  </h3>
    </div>
</template>

<script>

import { BUTTON, NES } from './nes/nes'

export default {
    name: "nejs",
    data() { return { mspf:20,timer:null } },
    created() { document.onkeydown = this.onKeyDown; document.onkeyup = this.onKeyUp; this.nes = null },
    mounted(){ 
        var ctx = this.$refs.myCanvas.getContext('2d')
        var image = new Image()
        image.src = './placeholder.png'
        image.addEventListener("load", function(){ ctx.drawImage(image,0,0) }, false)
        this.nes = new NES(this.$refs.myCanvas)
     },
    destroyed(){  },
    methods:{ 
        selectedFile() {
            let reader = new FileReader()
            reader.readAsArrayBuffer(this.$refs.myFile.files[0])
            reader.onload = evt => {
                if(this.timer!=null)clearTimeout(this.timer)
                this.nes.init(new Uint8Array(evt.target.result))
                this.step()
            }
            reader.onerror = evt => { console.error(evt) }
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
        min-height:100vh;
        width: 100%;
        overflow-x: hidden;
    }

    #app {
        min-height:100vh;
    }
</style>
