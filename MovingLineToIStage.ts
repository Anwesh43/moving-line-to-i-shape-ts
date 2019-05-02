const nodes : number = 5
const lines : number = 4
const scGap : number = 0.05
const scDiv : number = 0.51
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const foreColor : string = "#673AB7"
const backColor : string = "#BDBDBD"
const w : number = window.innerWidth
const h : number = window.innerHeight

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static scaleFactor(scale : number) : number {
        return Math.floor(scale / scDiv)
    }

    static mirrorValue(scale : number, a: number, b : number) : number {
        const k : number =  ScaleUtil.scaleFactor(scale)
        return (1 - k) / a + k / b
    }

    static updateValue(scale : number, dir : number, a : number, b : number) {
        return ScaleUtil.mirrorValue(scale, a, b) * dir * scGap
    }
}

class DrawingUtil {
    static drawLineToI(context : CanvasRenderingContext2D, size : number, sf : number, sif : number, scale : number) {
        context.save()
        context.translate(0, -size * sf)
        context.rotate(Math.PI/2 * scale * sif)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(0, size * sf)
        context.stroke()
        context.restore()
    }

    static drawLTINode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const gap : number = w / (nodes + 1)
        const size : number = gap / sizeFactor
        const sc1 : number = ScaleUtil.divideScale(scale, 0, 2)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, 2)
        context.strokeStyle = foreColor
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.lineCap = 'round'
        context.save()
        context.translate(gap * (i + 1), h / 2)
        for (var j = 0; j < (lines / 2); j++) {
            const sf : number = 1 - 2 * j
            const scj : number = ScaleUtil.divideScale(sc2, j, lines)
            for (var k = 0; k < (lines / 2); k++) {
                const sif : number = 1 - 2 * k
                const sck : number = ScaleUtil.divideScale(sc2, j, lines)
                DrawingUtil.drawLineToI(context, size, sf, sif, sck)
            }
        }
        context.restore()
    }
}

class MovingLineToIStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : MovingLineToIStage = new MovingLineToIStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += ScaleUtil.updateValue(this.scale, this.dir, 1, lines)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}
