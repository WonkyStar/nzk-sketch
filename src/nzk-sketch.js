import NZKSketchModel from './nzk-sketch-model'

export default class NZKSketch {
  constructor(props = {}) {
    if(!props.containerEl){
      throw new Error("NZKSketch requires a containerEl property")
    }
    if(!props.width && props.height){
      throw new Error("NZKSketch requires fixed width and height properties")
    }

    this.containerEl = props.containerEl

    this.template = props.template
    this.isDrawing = false
    
    this.scale = window.devicePixelRatio >= 1.5 ? 2 : 1
    this.width = props.width
    this.height = props.height
    this.widthScaled = this.width * this.scale
		this.heightScaled = this.height * this.scale
    
    this.model = new NZKSketchModel()
    this.model.eraser = false
    this.model.opacity = 1

    this.initDrawingCanvas()
    this.initBufferCanvas()
    this.initCacheCanvas()
    this.initTouchLayer()
    this.initDrawAnimations()
    
    this.setDrawingStyle(this.model.getStyle(), this.bufferCanvasCtx)
  }

  setBrushColour(colour = [0,0,0]) {
    this.model.eraser = false
    this.model.colour = colour
  }

  setBrushSize(size = 12) {
    this.model.size = size
  }

  selectEraser() {
    this.model.eraser = true
  }

  setCanvasSize(canvas){
    canvas.width = this.widthScaled
    canvas.height = this.heightScaled
  }

  setLayerStyle(el){
    el.style.width = `${this.width}px`
    el.style.height = `${this.height}px`
    el.style.position = 'absolute'
    el.style.left = '0px'
    el.style.top = '0px'
  }

  initDrawingCanvas() {
    this.drawingCanvas = document.createElement('canvas')
    this.drawingCanvasCtx = this.drawingCanvas.getContext('2d')
    this.setCanvasSize(this.drawingCanvas)
    this.setLayerStyle(this.drawingCanvas)
    this.drawingCanvas.style.zIndex = 1
    this.containerEl.appendChild(this.drawingCanvas)
  }

  initBufferCanvas() {
    this.bufferCanvas = document.createElement('canvas')
    this.bufferCanvasCtx = this.drawingCanvas.getContext('2d')
    this.setCanvasSize(this.bufferCanvas)
    this.setLayerStyle(this.bufferCanvas)
    this.bufferCanvas.style.zIndex = 2
    this.containerEl.appendChild(this.bufferCanvas)
  }

  initCacheCanvas() {
    this.cacheCanvas = document.createElement('canvas')
    this.cacheCanvasCtx = this.cacheCanvas.getContext('2d')
    this.setCanvasSize(this.cacheCanvas)
    this.setLayerStyle(this.cacheCanvas)
    this.cacheCanvas.style.display = 'none'
    this.containerEl.appendChild(this.cacheCanvas)
  }

  initTouchLayer() {
    this.touchLayerEl = document.createElement('div')
    this.setLayerStyle(this.touchLayerEl)
    this.touchLayerEl.style.zIndex = 3

    this.onStartMouseDraw = this.onStartMouseDraw.bind(this)
    this.onMoveMouseDraw = this.onMoveMouseDraw.bind(this)
    this.onEndMouseDraw = this.onEndMouseDraw.bind(this)

    this.touchLayerEl.addEventListener("mousedown", this.onStartMouseDraw, false)
    this.touchLayerEl.addEventListener("mousemove", this.onMoveMouseDraw, false)
    this.touchLayerEl.addEventListener("mouseup", this.onEndMouseDraw, false)
    this.touchLayerEl.addEventListener("mouseleave", this.onEndMouseDraw, false)
    this.touchLayerEl.addEventListener("mouseenter", (ev) => {
      if (ev.buttons > 0) {
        this.onStartMouseDraw(ev)
      }
    }, false)

    this.onStartTouchDraw = this.onStartTouchDraw.bind(this)
    this.onMoveTouchDraw = this.onMoveTouchDraw.bind(this)
    this.onEndTouchDraw = this.onEndTouchDraw.bind(this)

    this.touchLayerEl.addEventListener("touchstart", this.onStartTouchDraw, false)
    this.touchLayerEl.addEventListener("touchmove", this.onMoveTouchDraw, false)
    this.touchLayerEl.addEventListener("touchend", this.onEndTouchDraw, false)

    this.containerEl.appendChild(this.touchLayerEl)
  }

  initDrawAnimations(){
    this.drawUndo = {
			transparentEraserFill: this.drawTransparentFillFinal,
			transparentEraserStroke: this.drawStrokeFinal,
			transparentColourFill: this.drawTransparentFillFinal,
			transparentColourStroke: this.drawStrokeFinal,
			opaqueEraserFill: this.drawEraserUndoingFillFinal,
			opaqueEraserStroke: this.drawEraserUndoingFinal,
			opaqueColourFill: this.drawFillFinal,
      opaqueColourStroke: this.drawStrokeFinal
    }

		this.drawFinished = {
			transparentEraserFill: this.drawTransparentFillFinal,
			transparentEraserStroke: this.drawStrokeFinal,
			transparentColourFill: this.drawTransparentFillFinal,
			transparentColourStroke: this.drawStrokeFinal,
			opaqueEraserFill: this.drawEraserFillFinal,
			opaqueEraserStroke: this.drawEraser,
			opaqueColourFill: this.drawFillFinal,
      opaqueColourStroke: this.drawStrokeFinal
    }

		this.drawAnimation = {
			transparentEraserFill: this.drawFillAndStroke,
			transparentEraserStroke: this.drawFillAndStroke,
			transparentColourFill: this.drawFillAndStroke,
			transparentColourStroke: this.drawFillAndStroke,
			opaqueEraserFill: this.drawEraser,
			opaqueEraserStroke: this.drawEraser,
			opaqueColourFill: this.drawFillAndStroke,
      opaqueColourStroke: this.drawFillAndStroke
    }
  }

  getMousePoint (ev) {
    let rect = this.touchLayerEl.getBoundingClientRect()

    return {
      x: (ev.clientX - rect.left) * this.scale,
      y: (ev.clientY - rect.top) * this.scale
    }
  }

  getTouchPoint (ev) {
    let rect = this.touchLayerEl.getBoundingClientRect()

    return {
      x: (ev.touches[0].clientX - rect.left) * this.scale,
      y: (ev.touches[0].clientY - rect.top) * this.scale
    }
  }

  onStartMouseDraw(ev) {
    ev.preventDefault() // prevents scroll
    this.startDraw(this.getMousePoint(ev))
  }

  onStartTouchDraw(ev) {
    ev.preventDefault() // prevents scroll
    this.startDraw(this.getTouchPoint(ev))
  }

  onMoveMouseDraw(ev) {
    this.continueDraw(this.getMousePoint(ev))
  }

  onMoveTouchDraw(ev) {
    this.continueDraw(this.getTouchPoint(ev))
  }

  onEndMouseDraw(ev) {
    this.endDraw(this.getMousePoint(ev))
  }

  onEndTouchDraw(ev) {
    this.endDraw(this.getTouchPoint(ev))
  }

  startDraw(point) {
    this.isDrawing = true
    this.model.initStroke(point)
    this.setDrawingStyle(this.model.currentStroke.style, this.bufferCanvasCtx)
    this.strokeAnimation()
  }

  continueDraw(point) {
    if(!this.isDrawing) return false
    this.model.continueStroke(point)
  }

  endDraw(point) {
    this.isDrawing = false
    this.endStrokeAnimation() 
    this.bufferCanvasCtx.clearRect(0, 0, this.canvasWidthScaled, this.canvasHeightScaled)
    this.drawFinishedStroke(this.model.currentStroke)
    this.model.saveStroke()
  }

  setDrawingStyle (style, ctx) {
		let colour = `rgba(${style.colour[0]}, ${style.colour[1]}, ${style.colour[2]}, ${style.opacity})`
		ctx.strokeStyle = colour
		ctx.fillStyle = colour
		ctx.lineWidth = style.size
		ctx.lineJoin = "round"
    ctx.lineCap = "round"
  }

	strokeAnimation() {
    this.drawAnimationStroke(this.model.currentStroke)
		this.reqStroke = window.requestAnimationFrame(() => this.strokeAnimation.apply(this))
  }

	drawAnimationStroke(stroke) {
    this.drawAnimation[stroke.style.key].apply(this, [stroke])
  }

	endStrokeAnimation() {
		window.cancelAnimationFrame(this.reqStroke)
    this.reqStroke = 0
  }

  drawUndoStroke(stroke) {
		this.setDrawingStyle(stroke.style, this.drawingCanvasCtx)
    this.drawUndo[stroke.style.key].apply(this, [stroke])
  }

	drawFinishedStroke(stroke) {
    if(!stroke) return
		this.setDrawingStyle(stroke.style, this.drawingCanvasCtx)
    this.drawFinished[stroke.style.key].apply(this, [stroke])
  }

	drawExistingStroke(stroke) {
		this.setDrawingStyle(stroke.style, this.drawingCanvasCtx)
    this.drawFinished[stroke.style.key].apply(this, [stroke, false])
  }
  
  trace(stroke, ctx) {
    let nbPoints = stroke.length()
    
    ctx.beginPath()
    
    if(nbPoints < 3) {
      ctx.moveTo(stroke.points[0].s.x, stroke.points[0].s.y)
      ctx.lineTo(stroke.points[nbPoints-1].s.x + 0.001, stroke.points[nbPoints-1].s.y + 0.001)
    } else {
      ctx.moveTo(stroke.points[0].s.x, stroke.points[0].s.y)
      
      var i, len, move, ref

      ref = stroke.points.slice(1, +(nbPoints - 2) + 1 || 9e9)
      for (i = 0, len = ref.length; i < len; i++) {
        move = ref[i]
        ctx.quadraticCurveTo(move.s.x, move.s.y, move.h.x, move.h.y)
      }
    }
  }

	getDrawingDataUrl(){
    return this.drawingCanvas.toDataURL()
  } 

	drawTransparentFillFinal(stroke) {
		this.cacheCanvasCtx.clearRect(0, 0, this.canvasWidthScaled, this.canvasHeightScaled)
    this.cacheCanvasCtx.globalCompositeOperation = "source-over"
    stroke.style.opacity = stroke.style.opacity || 1
		this.setDrawingStyle(stroke.style, this.cacheCanvasCtx)
		this.trace(stroke, this.cacheCanvasCtx)
		this.cacheCanvasCtx.closePath()
		this.cacheCanvasCtx.fill()
		this.cacheCanvasCtx.stroke()

		this.drawingCanvasCtx.globalCompositeOperation = "source-over"
		this.drawingCanvasCtx.globalAlpha = stroke.style.opacity
		this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.canvasWidthScaled, this.canvasHeightScaled)
    this.drawingCanvasCtx.globalAlpha = 1.0
  }

	drawStrokeFinal(stroke) {
		this.drawingCanvasCtx.globalCompositeOperation = "source-over"
		this.trace(stroke, this.drawingCanvasCtx)
    this.drawingCanvasCtx.stroke()
  }

	drawFillFinal(stroke) {
		this.drawingCanvasCtx.globalCompositeOperation = "source-over"
		this.trace(stroke, this.drawingCanvasCtx)
		this.drawingCanvasCtx.closePath()
		this.drawingCanvasCtx.fill()
    this.drawingCanvasCtx.stroke()
  }

	drawFillAndStroke(stroke) {
		this.bufferCanvasCtx.clearRect(0, 0, this.canvasWidthScaled, this.canvasHeightScaled)
		this.trace(stroke, this.bufferCanvasCtx)
    this.bufferCanvasCtx.stroke()
  }

	drawEraserUndoingFinal(stroke) {
		this.drawingCanvasCtx.globalCompositeOperation = "destination-out"
		this.trace(stroke, this.drawingCanvasCtx)
    this.drawingCanvasCtx.stroke()
  }

	drawEraserUndoingFillFinal(stroke) {
		this.drawingCanvasCtx.globalCompositeOperation = "destination-out"
		this.trace(stroke, this.drawingCanvasCtx)
		this.drawingCanvasCtx.closePath()
		this.drawingCanvasCtx.fill()
    this.drawingCanvasCtx.stroke()
  }

	drawEraser(stroke, copy = true) {
		if(copy){
			this.drawingCanvasCtx.globalCompositeOperation = "copy"
      this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.canvasWidthScaled, this.canvasHeightScaled)
    }

		this.drawingCanvasCtx.globalCompositeOperation = "destination-out"
		this.trace(stroke, this.drawingCanvasCtx)
    this.drawingCanvasCtx.stroke()
  }

	drawEraserFillFinal(stroke, copy = true){
		if(copy) {
			this.drawingCanvasCtx.globalCompositeOperation = "copy"
      this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.canvasWidthScaled, this.canvasHeightScaled)
    }

		this.drawingCanvasCtx.globalCompositeOperation = "destination-out"
		this.trace(stroke, this.drawingCanvasCtx)
		this.drawingCanvasCtx.closePath()
		this.drawingCanvasCtx.fill()
    this.drawingCanvasCtx.stroke()
  }
}

// 	undo: ->
// 		if this.model.canUndo()
// 			this.model.latestActionIndex--

// 			this.drawingCanvasCtx.clearRect(0, 0, this.canvasWidthScaled, this.canvasHeightScaled)

// 			this.importImage()

// 			if this.model.latestActionIndex > -1
// 				q = queue(1)

// 				for action in this.model.actions[0..this.model.latestActionIndex]
// 					do (action) =>
// 						if action.type is 'image'
// 							q.defer (cb) =>
// 								this.drawImage(action.object, cb)
// 						else
// 							q.defer (cb) =>
// 								this.drawUndoStroke(action.object)
// 								cb()

// 			this.trigger('change-drawing')

// 			return true

// 	redo: ->
// 		if this.model.canRedo()
// 			this.model.latestActionIndex++

// 			action = this.model.actions[this.model.latestActionIndex]

// 			if action.type is 'image'
// 				this.drawImage action.object, =>
// 					this.trigger('change-drawing')
// 			else
// 				this.drawUndoStroke(action.object)
// 				this.trigger('change-drawing')

// 	restart: ->
// 		this.model.reset()

// 		this.drawingCanvasCtx.clearRect(0, 0, this.canvasWidthScaled, this.canvasHeightScaled)

// 		this.trigger('change-drawing')

// 		this.importImage()
