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

    // Size
    this.width = props.containerEl.offsetWidth
    this.height = props.containerEl.offsetHeight
    this.scale = window.devicePixelRatio >= 1.5 ? 2 : 1
    this.widthScaled = this.width * this.scale
    this.heightScaled = this.height * this.scale
    this.orientation = (this.width > this.height) ? 'landscape' : 'portrait'
    this.template = props.template
    
    // Model init
    this.model = new NZKSketchModel()

    // Optional props
    this.setToolType(props.toolType || 'brush')
    this.setToolColour(props.toolColour || [0, 0, 0])
    this.setToolSize(props.toolSize || 15)
    this.setToolOpacity(props.toolOpacity || 1.0 )

    // Canvas layers
    if(this.template) {
      this.initTemplateCanvas(this.template) 
    }
    this.initDrawingCanvas()
    this.initBufferCanvas()
    this.initCacheCanvas()

    // Interaction layer
    this.initInteractionLayer()

    // Drawing settings
    this.initDrawAnimations()
    this.setDrawingStyle(this.model.getStyle(), this.bufferCanvasCtx)

    this.isDrawing = false
  }

  //
  // Public API
  //

  setToolType(type) {
    switch(type) {
      case 'eraser':
        this.model.eraser = true
        this.model.fill = false
        this.model.opacity = 1.0
        break
      case 'fill': 
        this.model.eraser = false
        this.model.fill = true
        break
      default: 
        this.model.eraser = false
        this.model.fill = false
    }
  }

  setToolColour(colour = [0, 0, 0]) {
    if(this.toolType !== 'eraser') {
      this.model.colour = colour
    }
  }

  setToolSize(size = 15) {
    this.model.size = size
  }

  setToolOpacity(opacity = 1.0) {
    if(this.toolType !== 'eraser') {
      this.model.opacity = opacity
    }
  }

  export(options = {}) {
    options.crop = options.crop || false
    options.maxWidth = options.maxWidth || false
    options.maxHeight = options.maxHeight || false
    let canvasToExport = null

    // Check if there is anything to export
    let boxForEmptyCheck = this.findBoundingBox(this.drawingCanvasCtx)

    if(boxForEmptyCheck.width < 5) {
      return null
    }
  
    // If there is a template merge the drawing onto it and export that
    if(this.template) {
      this.templateCanvasCtx.drawImage(this.drawingCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled)
      canvasToExport = this.templateCanvasCtx
    } else {
      canvasToExport = this.drawingCanvasCtx
    }
    
    let box = {
      topLeftX: 0,
      topLeftY: 0,
      width: this.widthScaled,
      height: this.heightScaled
    }

    if(options.crop){
      box = this.findBoundingBox(canvasToExport)
    }

    let shrinkRatio = 1
    let widthShrinkRatio = 1
    let heightShrinkRatio = 1

    if(options.maxWidth && box.width > options.maxWidth){
      widthShrinkRatio = box.width / options.maxWidth
    }

    if(options.maxHeight && box.height > options.maxHeight){
      heightShrinkRatio = box.height / options.maxHeight 
    }

    shrinkRatio = Math.max(widthShrinkRatio, heightShrinkRatio)

    this.initExportCanvas()
    this.exportCanvas.setAttribute('width', box.width / shrinkRatio)
    this.exportCanvas.setAttribute('height', box.height / shrinkRatio)
    this.exportCanvasCtx.globalCompositeOperation = 'copy'
    this.exportCanvasCtx.drawImage(canvasToExport.canvas, box.topLeftX,  box.topLeftY, box.width, box.height, 0, 0, box.width / shrinkRatio, box.height / shrinkRatio)
    let image = this.exportCanvas.toDataURL()
    
    this.removeExportCanvas()

    return image
  }

  undo() {
    if(!this.model.canUndo()) return

    this.model.lastActionIndex--
    this.drawingCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled)

    for(let i = 0; i <= this.model.lastActionIndex; i++) {
      this.drawUndoStroke(this.model.actions[i].object)
    }
  }

	redo() {
    if(!this.model.canRedo()) return 

		this.model.lastActionIndex++

		let action = this.model.actions[this.model.lastActionIndex]

		this.drawUndoStroke(action.object)
  }

  canUndo() {
    return this.model.canUndo()
  }

  canRedo() {
    return this.model.canRedo()
  }
  
  restart() {
    this.model.reset()
    
    this.drawingCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled)
  }

  //
  // Internal helpers
  //

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

  initTemplateCanvas(template) {
    this.templateCanvas = document.createElement('canvas')
    this.templateCanvasCtx = this.templateCanvas.getContext('2d')
    this.setCanvasSize(this.templateCanvas)
    this.setLayerStyle(this.templateCanvas)
    this.templateCanvasCtx.drawImage(template, 0, 0, this.widthScaled, this.heightScaled)
    this.templateCanvas.style.zIndex = 0
    this.containerEl.appendChild(this.templateCanvas)
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
    this.bufferCanvasCtx = this.bufferCanvas.getContext('2d')
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

  initExportCanvas() {
    this.exportCanvas = document.createElement('canvas')
    this.exportCanvasCtx = this.exportCanvas.getContext('2d')
    this.setCanvasSize(this.exportCanvas)
    this.setLayerStyle(this.exportCanvas)
    this.exportCanvas.style.display = 'none'
    this.containerEl.appendChild(this.exportCanvas)
  }

  removeExportCanvas() {
    this.exportCanvas.remove()
  }

  initInteractionLayer() {
    this.interactionLayerEl = document.createElement('div')
    this.setLayerStyle(this.interactionLayerEl)
    this.interactionLayerEl.style.zIndex = 3

    this.onStartMouseDraw = this.onStartMouseDraw.bind(this)
    this.onMoveMouseDraw = this.onMoveMouseDraw.bind(this)
    this.onEndMouseDraw = this.onEndMouseDraw.bind(this)

    this.interactionLayerEl.addEventListener("mousedown", this.onStartMouseDraw)
    this.interactionLayerEl.addEventListener("mousemove", this.onMoveMouseDraw)
    this.interactionLayerEl.addEventListener("mouseup", this.onEndMouseDraw)
    this.interactionLayerEl.addEventListener("mouseleave", this.onEndMouseDraw)
    this.interactionLayerEl.addEventListener("mouseenter", (ev) => {
      if (ev.buttons > 0) {
        this.onStartMouseDraw(ev)
      }
    }, false)

    this.onStartTouchDraw = this.onStartTouchDraw.bind(this)
    this.onMoveTouchDraw = this.onMoveTouchDraw.bind(this)
    this.onEndTouchDraw = this.onEndTouchDraw.bind(this)

    this.interactionLayerEl.addEventListener("touchstart", this.onStartTouchDraw)
    this.interactionLayerEl.addEventListener("touchmove", this.onMoveTouchDraw)
    this.interactionLayerEl.addEventListener("touchend", this.onEndTouchDraw)
    this.interactionLayerEl.addEventListener("touchcancel", this.onEndTouchDraw)

    this.containerEl.appendChild(this.interactionLayerEl)
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
    let rect = this.interactionLayerEl.getBoundingClientRect()

    return {
      x: (ev.clientX - rect.left) * this.scale,
      y: (ev.clientY - rect.top) * this.scale
    }
  }

  getTouchPoint (ev) {
    let rect = this.interactionLayerEl.getBoundingClientRect()

    return {
      x: (ev.touches[0].clientX - rect.left) * this.scale,
      y: (ev.touches[0].clientY - rect.top) * this.scale
    }
  }

  onStartMouseDraw(ev) {
    ev.preventDefault()
    this.startDraw(this.getMousePoint(ev))
  }

  onStartTouchDraw(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    this.startDraw(this.getTouchPoint(ev))
  }

  onMoveMouseDraw(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    this.continueDraw(this.getMousePoint(ev))
  }

  onMoveTouchDraw(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    this.continueDraw(this.getTouchPoint(ev))
  }

  onEndMouseDraw(ev) {
    this.endDraw()
  }

  onEndTouchDraw(ev) {
    this.endDraw()
  }

  startDraw(point) {
    this.isDrawing = true

		this.model.initStroke(point)

		if(this.model.currentStroke.style.eraser && this.model.currentStroke.style.opacity === 1.0) {
      this.cacheCanvasCtx.globalCompositeOperation = "copy"
			this.cacheCanvasCtx.drawImage(this.drawingCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled)
      this.setDrawingStyle(this.model.currentStroke.style, this.drawingCanvasCtx)
    }

    this.setDrawingStyle(this.model.currentStroke.style, this.bufferCanvasCtx)

    this.strokeAnimation() 
  }

  continueDraw(point) {
    if(!this.isDrawing) return false
    this.model.continueStroke(point)
  }

  endDraw() {
    if(!this.model.currentStroke) return
    this.isDrawing = false
    this.endStrokeAnimation() 
    this.bufferCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled)
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

	drawTransparentFillFinal(stroke) {
		this.cacheCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled)
    this.cacheCanvasCtx.globalCompositeOperation = "source-over"
    stroke.style.opacity = stroke.style.opacity || 1
		this.setDrawingStyle(stroke.style, this.cacheCanvasCtx)
		this.trace(stroke, this.cacheCanvasCtx)
		this.cacheCanvasCtx.closePath()
		this.cacheCanvasCtx.fill()
		this.cacheCanvasCtx.stroke()

		this.drawingCanvasCtx.globalCompositeOperation = "source-over"
		this.drawingCanvasCtx.globalAlpha = stroke.style.opacity
		this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled)
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
		this.bufferCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled)
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
      this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled)
    }

		this.drawingCanvasCtx.globalCompositeOperation = "destination-out"
		this.trace(stroke, this.drawingCanvasCtx)
    this.drawingCanvasCtx.stroke()
  }

	drawEraserFillFinal(stroke, copy = true){
		if(copy) {
			this.drawingCanvasCtx.globalCompositeOperation = "copy"
      this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled)
    }

		this.drawingCanvasCtx.globalCompositeOperation = "destination-out"
		this.trace(stroke, this.drawingCanvasCtx)
		this.drawingCanvasCtx.closePath()
		this.drawingCanvasCtx.fill()
    this.drawingCanvasCtx.stroke()
  }

  findBoundingBox(ctx) {
    let imageData = ctx.getImageData(0, 0, this.widthScaled, this.heightScaled)

    let box = {
      topLeftX: this.widthScaled,
      topLeftY: this.heightScaled,
      bottomRightX: 0,
      bottomRightY: 0
    }

    for(let x = 0; x < this.widthScaled; x++){
      for(let y = 0; y < this.heightScaled; y++){
        let pixelPosition = (((y * this.widthScaled) + x) * 4) + 3

        if(imageData.data[pixelPosition] > 0){
          if(x < box.topLeftX) box.topLeftX = x
          if(y < box.topLeftY) box.topLeftY = y
          if(x > box.bottomRightX) box.bottomRightX = x
          if(y > box.bottomRightY) box.bottomRightY = y
        }
      }
    }

    box.width = box.bottomRightX - box.topLeftX
    box.height = box.bottomRightY - box.topLeftY

    return box
  }
}