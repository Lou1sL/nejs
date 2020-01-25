<template>
    <div id="app">
        <input type="file" ref="myFile" @change="selectedFile"><br/>
        <canvas ref="myCanvas" id="canvas" width="256" height="240"></canvas>
    </div>
</template>

<script>

import NES from './nes/nes'

export default {
    name: "nejs",
    data() { return {  } },
    created() {  },
    mounted(){  },
    destroyed(){  },
    methods:{ 
        selectedFile() {
            let file = this.$refs.myFile.files[0]
            let reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload =  evt => { 
                this.nes = new NES(this.$refs.myCanvas.getContext('2d'),new Uint8Array(evt.target.result))
                this.step()
            }
            reader.onerror = evt => { console.error(evt) }
        },
        step(){
            this.nes.step()
            setTimeout(()=>{ this.step() }, 1000/30)
        }
     },
    computed: {  },
    render(){  },
    beforeDestroy () {  }
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
