
import NZKSketchStrokeModel from './nzk-sketch-stroke-model'

export default class NzkSketchModel {
  constructor() {
    this.colour = [0, 0, 0]
    this.eraser = false
    this.fill = false
    this.opacity = 1.0
    this.size = 15
    this.scale = window.devicePixelRatio >= 1.5 ? 2 : 1
    this.actions = []
    this.lastActionIndex = -1
    this.currentStroke = null
  }

  sizeScaled() {
    return this.size * this.scale
  }

  generateStyleKey() {
    return `${this.eraser || this.opacity === 1.0 ? 'opaque' : 'transparent'}${this.eraser ? 'Eraser' : 'Colour'}${this.fill ? 'Fill' : 'Stroke'}`
  }

  getStyle() {
    return {
      opacity: this.opacity,
      colour: this.colour,
      eraser: this.eraser,
      size: this.sizeScaled(),
      key: this.generateStyleKey()
    }
  }

  initStroke(newPoint) {
    if(this.canRedo()){
      if(this.lastActionIndex === -1){
        this.actions = []
      } else {
        this.actions = this.actions.slice(0, this.lastActionIndex + 1)
      }
    }

    this.currentStroke = new NZKSketchStrokeModel(this.getStyle(), newPoint)
  }

  continueStroke(newPoint) {
    this.currentStroke.addPoint(newPoint)
  }

	saveStroke() {
    this.actions.push({type: 'stroke', object: this.currentStroke})
    this.currentStroke = null
    this.lastActionIndex++
  }

  canUndo() {
    return this.lastActionIndex > -1
  }

  canRedo() {
    return this.lastActionIndex < this.actions.length - 1
  }

  reset() {
    this.actions = []
    this.lastActionIndex = -1
    return this.currentStroke = null
  }

  serialize(){
    let serialized = {
      colour: this.colour,
      opacity: this.opacity,
      size: this.size,
      scale: this.scale,
      lastActionIndex: this.lastActionIndex
    }

    serialized.actions = []

    this.actions.forEach(action => {
      serialized.actions.push({
        type: action.type,
        object: action.object.serialize()
      })
    })

    if (this.currentStroke) {
      serialized.currentStroke = this.currentStroke.serialize()
    }

    return serialized
  }

  deserialize(serialized = {}) {
    if(serialized.colour !== undefined) {
      this.colour = serialized.colour
    }
    if(serialized.opacity !== undefined) {
      this.opacity = serialized.opacity
    }
    if(serialized.size !== undefined) {
      this.size = serialized.size
    }
    if(serialized.scale !== undefined) {
      this.scale = serialized.scale
    }
    if(serialized.lastActionIndex !== undefined) {
      this.lastActionIndex = serialized.lastActionIndex
    }

    if(serialized.actions){
      this.actions = []

      serialized.actions.forEach(action => {
        if(action.type === 'stroke'){
          let stroke = new NZKSketchStrokeModel()
          stroke.deserialize(action.object)

          this.actions.push({
            type: action.type,
            object: stroke
          })
        }
      })
    }
    if(serialized.currentStroke !== undefined ){
      this.currentStroke = new NZKSketchStrokeModel()
      this.currentStroke.deserialize(serialized.currentStroke)
    }
  }
}