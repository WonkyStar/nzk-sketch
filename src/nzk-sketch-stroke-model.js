export default class NzkSketchStrokeModel {
  constructor(style, firstPoint) {
    this.style = style

    this.points = []

    if (firstPoint) {
      this.points.push({
        s: firstPoint,
        h: null
      })
    }
  }

  length() {
    return this.points.length
  }

  lastPoint() {
    return this.points[this.points.length - 1].s
  }

  addPoint(newPoint) {
    this.points[this.points.length - 1].h = {
      x: (this.points[this.points.length - 1].s.x + newPoint.x) / 2,
      y: (this.points[this.points.length - 1].s.y + newPoint.y) / 2
    }
    return this.points.push({
      s: newPoint,
      h: null
    })
  }

  serialize() {
    return {
      points: this.points,
      style: this.style
    }
  }

  deserialize (serialized) {
    this.style = serialized.style
    this.points = serialized.points || []
  }
}
