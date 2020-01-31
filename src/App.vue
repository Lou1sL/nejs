<template>
    <div id="app">
        <canvas ref="myCanvas" id="canvas" width="512" height="480"></canvas>
        <br>
        <input type="file" ref="myFile" @change="selectedFile">
        
        <h3> NEJS </h3>
        <h3> 一个简单的纯js编写的FC模拟器，完全运行于浏览器内 (目前只支持Mapper0)，使用EXP2x算法优化分辨率</h3>
        <h3> 键位：W:↑  A:← S:↓  D:→  K:B  L:A  Z:SELECT  X:START  </h3>
    </div>
</template>

<script>

import { BUTTON, NES } from './nes/nes'

export default {
    name: "nejs",
    data() { return { isDestory:false } },
    created() { document.onkeydown = this.onKeyDown; document.onkeyup = this.onKeyUp; this.nes = null },
    mounted(){ 
        var ctx = this.$refs.myCanvas.getContext('2d')
        var image = new Image()
        image.src = './placeholder.png'
        image.addEventListener("load", function(){ ctx.drawImage(image,0,0) }, false)
     },
    destroyed(){  },
    methods:{ 
        selectedFile() {
            let reader = new FileReader()
            reader.readAsArrayBuffer(this.$refs.myFile.files[0])
            reader.onload = evt => {
                this.nes = new NES(this.$refs.myCanvas,new Uint8Array(evt.target.result))
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
            this.nes.step()
            if(!this.isDestory)setTimeout(()=>{ this.step() }, 16)
        }
     },
    computed: {  },
    render(){  },
    beforeDestroy () { this.isDestory = true }
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
