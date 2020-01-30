<template>
    <div id="app">
        <input type="file" ref="myFile" @change="selectedFile"><br/>
        <canvas ref="myCanvas" id="canvas" width="512" height="480"></canvas>
    </div>
</template>

<script>

import { BUTTON, NES } from './nes/nes'

export default {
    name: "nejs",
    data() { return { isDestory:false } },
    created() { document.onkeydown = this.onKeyDown; document.onkeyup = this.onKeyUp; this.nes = null },
    mounted(){  },
    destroyed(){  },
    methods:{ 
        selectedFile() {
            let reader = new FileReader()
            reader.readAsArrayBuffer(this.$refs.myFile.files[0])
            reader.onload = evt => {
                this.nes = new NES(this.$refs.myCanvas.getContext('2d'),new Uint8Array(evt.target.result))
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
            if(!this.isDestory)setTimeout(()=>{ this.step() }, 1)
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
