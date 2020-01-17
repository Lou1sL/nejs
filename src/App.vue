<template>
    <div id="app">
        <canvas ref="myCanvas" id="canvas" width="800" height="600"></canvas>
    </div>
</template>

<script>

import CPU from './nes/cpu'

export default {
    name: "nejs",
        data() { return {  } },
        created() {  },
        mounted(){
            var canvas = this.$refs.myCanvas
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0,0,canvas.width,canvas.height)
            ctx.fillStyle = "black"
            ctx.font="20px Georgia"
            ctx.fillText('aaa',10,50)
         },
        destroyed(){  },
        methods:{  },
        computed: {  },
        render(){  }
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
