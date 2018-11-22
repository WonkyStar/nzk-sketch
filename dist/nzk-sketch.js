(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.nzkSketch = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var NzkSketchStrokeModel =
  /*#__PURE__*/
  function () {
    function NzkSketchStrokeModel(style, firstPoint) {
      _classCallCheck(this, NzkSketchStrokeModel);

      this.style = style;
      this.points = [];

      if (firstPoint) {
        this.points.push({
          s: firstPoint,
          h: null
        });
      }
    }

    _createClass(NzkSketchStrokeModel, [{
      key: "length",
      value: function length() {
        return this.points.length;
      }
    }, {
      key: "lastPoint",
      value: function lastPoint() {
        return this.points[this.points.length - 1].s;
      }
    }, {
      key: "addPoint",
      value: function addPoint(newPoint) {
        this.points[this.points.length - 1].h = {
          x: (this.points[this.points.length - 1].s.x + newPoint.x) / 2,
          y: (this.points[this.points.length - 1].s.y + newPoint.y) / 2
        };
        return this.points.push({
          s: newPoint,
          h: null
        });
      }
    }, {
      key: "serialize",
      value: function serialize() {
        return {
          points: this.points,
          style: this.style
        };
      }
    }, {
      key: "deserialize",
      value: function deserialize(serialized) {
        this.style = serialized.style;
        this.points = serialized.points || [];
      }
    }]);

    return NzkSketchStrokeModel;
  }();

  var NzkSketchModel =
  /*#__PURE__*/
  function () {
    function NzkSketchModel() {
      _classCallCheck(this, NzkSketchModel);

      this.colour = [0, 0, 0];
      this.opacity = 1.0;
      this.size = 10;
      this.scale = window.devicePixelRatio >= 1.5 ? 2 : 1;
      this.actions = [];
      this.lastActionIndex = -1;
      this.currentStroke = null;
    }

    _createClass(NzkSketchModel, [{
      key: "sizeScaled",
      value: function sizeScaled() {
        return this.size * this.scale;
      }
    }, {
      key: "generateStyleKey",
      value: function generateStyleKey() {
        return "".concat(this.opacity === 1.0 ? 'opaque' : 'transparent').concat(this.eraser ? 'Eraser' : 'Colour').concat(this.fill ? 'Fill' : 'Stroke');
      }
    }, {
      key: "getStyle",
      value: function getStyle() {
        return {
          opacity: this.opacity,
          colour: this.colour,
          size: this.sizeScaled(),
          key: this.generateStyleKey()
        };
      }
    }, {
      key: "initStroke",
      value: function initStroke(newPoint) {
        if (this.canRedo()) {
          if (this.lastActionIndex === -1) {
            this.actions = [];
          } else {
            this.actions = this.actions.slice(0, +this.lastActionIndex + 1 || 9e9);
          }
        }

        this.currentStroke = new NzkSketchStrokeModel(this.getStyle(), newPoint);
      }
    }, {
      key: "continueStroke",
      value: function continueStroke(newPoint) {
        this.currentStroke.addPoint(newPoint);
      }
    }, {
      key: "saveStroke",
      value: function saveStroke() {
        this.actions.push({
          type: 'stroke',
          object: this.currentStroke
        });
        this.currentStroke = null;
        this.lastActionIndex++;
      }
    }, {
      key: "canUndo",
      value: function canUndo() {
        return this.lastActionIndex > -1;
      }
    }, {
      key: "canRedo",
      value: function canRedo() {
        return this.lastActionIndex < this.actions.length - 1;
      }
    }, {
      key: "reset",
      value: function reset() {
        this.actions = [];
        this.lastActionIndex = -1;
        return this.currentStroke = null;
      }
    }, {
      key: "serialize",
      value: function serialize() {
        var serialized = {
          colour: this.colour,
          opacity: this.opacity,
          size: this.size,
          scale: this.scale,
          lastActionIndex: this.lastActionIndex
        };
        serialized.actions = [];
        this.actions.forEach(function (action) {
          if (action.type === 'stroke') {
            serialized.actions.push(action.object.serialize());
          }
        });

        if (this.currentStroke) {
          serialized.currentStroke = this.currentStroke.serialize();
        }

        return serialized;
      }
    }, {
      key: "deserialize",
      value: function deserialize() {
        var _this = this;

        var serialized = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (serialized.colour) {
          this.colour = serialized.colour;
        }

        if (serialized.opacity) {
          this.opacity = serialized.opacity;
        }

        if (serialized.size) {
          this.size = serialized.size;
        }

        if (serialized.scale) {
          this.scale = serialized.scale;
        }

        if (serialized.lastActionIndex) {
          this.lastActionIndex = serialized.lastActionIndex;
        }

        if (serialized.actions) {
          this.actions = [];
          serialized.actions.forEach(function (action) {
            if (action.type === 'stroke') {
              var stroke = new NzkSketchStrokeModel();
              stroke.deserialize(action.object);
              action.stroke = stroke;
            }

            _this.actions.push(action);
          });
        }

        if (serialized.currentStroke) {
          this.currentStroke = new NzkSketchStrokeModel();
          this.currentStroke.deserialize(serialized.currentStroke);
        }
      }
    }]);

    return NzkSketchModel;
  }();

  var NZKSketch =
  /*#__PURE__*/
  function () {
    function NZKSketch() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, NZKSketch);

      if (!props.containerEl) {
        throw new Error("NZKSketch requires a containerEl property");
      }

      if (!props.width && props.height) {
        throw new Error("NZKSketch requires fixed width and height properties");
      }

      this.containerEl = props.containerEl;
      this.template = props.template;
      this.isDrawing = false;
      this.scale = window.devicePixelRatio >= 1.5 ? 2 : 1;
      this.width = props.width;
      this.height = props.height;
      this.widthScaled = this.width * this.scale;
      this.heightScaled = this.height * this.scale;
      this.model = new NzkSketchModel();
      this.model.eraser = false;
      this.model.opacity = 1;
      this.initDrawingCanvas();
      this.initBufferCanvas();
      this.initCacheCanvas();
      this.initTouchLayer();
      this.initDrawAnimations();
      this.setDrawingStyle(this.model.getStyle(), this.bufferCanvasCtx);
    }

    _createClass(NZKSketch, [{
      key: "setBrushColour",
      value: function setBrushColour() {
        var colour = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 0];
        this.model.eraser = false;
        this.model.colour = colour;
      }
    }, {
      key: "setBrushSize",
      value: function setBrushSize() {
        var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 12;
        this.model.size = size;
      }
    }, {
      key: "selectEraser",
      value: function selectEraser() {
        this.model.eraser = true;
      }
    }, {
      key: "setCanvasSize",
      value: function setCanvasSize(canvas) {
        canvas.width = this.widthScaled;
        canvas.height = this.heightScaled;
      }
    }, {
      key: "setLayerStyle",
      value: function setLayerStyle(el) {
        el.style.width = "".concat(this.width, "px");
        el.style.height = "".concat(this.height, "px");
        el.style.position = 'absolute';
        el.style.left = '0px';
        el.style.top = '0px';
      }
    }, {
      key: "initDrawingCanvas",
      value: function initDrawingCanvas() {
        this.drawingCanvas = document.createElement('canvas');
        this.drawingCanvasCtx = this.drawingCanvas.getContext('2d');
        this.setCanvasSize(this.drawingCanvas);
        this.setLayerStyle(this.drawingCanvas);
        this.drawingCanvas.style.zIndex = 1;
        this.containerEl.appendChild(this.drawingCanvas);
      }
    }, {
      key: "initBufferCanvas",
      value: function initBufferCanvas() {
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvasCtx = this.drawingCanvas.getContext('2d');
        this.setCanvasSize(this.bufferCanvas);
        this.setLayerStyle(this.bufferCanvas);
        this.bufferCanvas.style.zIndex = 2;
        this.containerEl.appendChild(this.bufferCanvas);
      }
    }, {
      key: "initCacheCanvas",
      value: function initCacheCanvas() {
        this.cacheCanvas = document.createElement('canvas');
        this.cacheCanvasCtx = this.cacheCanvas.getContext('2d');
        this.setCanvasSize(this.cacheCanvas);
        this.setLayerStyle(this.cacheCanvas);
        this.cacheCanvas.style.display = 'none';
        this.containerEl.appendChild(this.cacheCanvas);
      }
    }, {
      key: "initTouchLayer",
      value: function initTouchLayer() {
        var _this = this;

        this.touchLayerEl = document.createElement('div');
        this.setLayerStyle(this.touchLayerEl);
        this.touchLayerEl.style.zIndex = 3;
        this.onStartMouseDraw = this.onStartMouseDraw.bind(this);
        this.onMoveMouseDraw = this.onMoveMouseDraw.bind(this);
        this.onEndMouseDraw = this.onEndMouseDraw.bind(this);
        this.touchLayerEl.addEventListener("mousedown", this.onStartMouseDraw, false);
        this.touchLayerEl.addEventListener("mousemove", this.onMoveMouseDraw, false);
        this.touchLayerEl.addEventListener("mouseup", this.onEndMouseDraw, false);
        this.touchLayerEl.addEventListener("mouseleave", this.onEndMouseDraw, false);
        this.touchLayerEl.addEventListener("mouseenter", function (ev) {
          if (ev.buttons > 0) {
            _this.onStartMouseDraw(ev);
          }
        }, false);
        this.onStartTouchDraw = this.onStartTouchDraw.bind(this);
        this.onMoveTouchDraw = this.onMoveTouchDraw.bind(this);
        this.onEndTouchDraw = this.onEndTouchDraw.bind(this);
        this.touchLayerEl.addEventListener("touchstart", this.onStartTouchDraw, false);
        this.touchLayerEl.addEventListener("touchmove", this.onMoveTouchDraw, false);
        this.touchLayerEl.addEventListener("touchend", this.onEndTouchDraw, false);
        this.containerEl.appendChild(this.touchLayerEl);
      }
    }, {
      key: "initDrawAnimations",
      value: function initDrawAnimations() {
        this.drawUndo = {
          transparentEraserFill: this.drawTransparentFillFinal,
          transparentEraserStroke: this.drawStrokeFinal,
          transparentColourFill: this.drawTransparentFillFinal,
          transparentColourStroke: this.drawStrokeFinal,
          opaqueEraserFill: this.drawEraserUndoingFillFinal,
          opaqueEraserStroke: this.drawEraserUndoingFinal,
          opaqueColourFill: this.drawFillFinal,
          opaqueColourStroke: this.drawStrokeFinal
        };
        this.drawFinished = {
          transparentEraserFill: this.drawTransparentFillFinal,
          transparentEraserStroke: this.drawStrokeFinal,
          transparentColourFill: this.drawTransparentFillFinal,
          transparentColourStroke: this.drawStrokeFinal,
          opaqueEraserFill: this.drawEraserFillFinal,
          opaqueEraserStroke: this.drawEraser,
          opaqueColourFill: this.drawFillFinal,
          opaqueColourStroke: this.drawStrokeFinal
        };
        this.drawAnimation = {
          transparentEraserFill: this.drawFillAndStroke,
          transparentEraserStroke: this.drawFillAndStroke,
          transparentColourFill: this.drawFillAndStroke,
          transparentColourStroke: this.drawFillAndStroke,
          opaqueEraserFill: this.drawEraser,
          opaqueEraserStroke: this.drawEraser,
          opaqueColourFill: this.drawFillAndStroke,
          opaqueColourStroke: this.drawFillAndStroke
        };
      }
    }, {
      key: "getMousePoint",
      value: function getMousePoint(ev) {
        var rect = this.touchLayerEl.getBoundingClientRect();
        return {
          x: (ev.clientX - rect.left) * this.scale,
          y: (ev.clientY - rect.top) * this.scale
        };
      }
    }, {
      key: "getTouchPoint",
      value: function getTouchPoint(ev) {
        var rect = this.touchLayerEl.getBoundingClientRect();
        return {
          x: (ev.touches[0].clientX - rect.left) * this.scale,
          y: (ev.touches[0].clientY - rect.top) * this.scale
        };
      }
    }, {
      key: "onStartMouseDraw",
      value: function onStartMouseDraw(ev) {
        ev.preventDefault(); // prevents scroll

        this.startDraw(this.getMousePoint(ev));
      }
    }, {
      key: "onStartTouchDraw",
      value: function onStartTouchDraw(ev) {
        ev.preventDefault(); // prevents scroll

        this.startDraw(this.getTouchPoint(ev));
      }
    }, {
      key: "onMoveMouseDraw",
      value: function onMoveMouseDraw(ev) {
        this.continueDraw(this.getMousePoint(ev));
      }
    }, {
      key: "onMoveTouchDraw",
      value: function onMoveTouchDraw(ev) {
        this.continueDraw(this.getTouchPoint(ev));
      }
    }, {
      key: "onEndMouseDraw",
      value: function onEndMouseDraw(ev) {
        this.endDraw(this.getMousePoint(ev));
      }
    }, {
      key: "onEndTouchDraw",
      value: function onEndTouchDraw(ev) {
        this.endDraw(this.getTouchPoint(ev));
      }
    }, {
      key: "startDraw",
      value: function startDraw(point) {
        this.isDrawing = true;
        this.model.initStroke(point);
        this.setDrawingStyle(this.model.currentStroke.style, this.bufferCanvasCtx);
        this.strokeAnimation();
      }
    }, {
      key: "continueDraw",
      value: function continueDraw(point) {
        if (!this.isDrawing) return false;
        this.model.continueStroke(point);
      }
    }, {
      key: "endDraw",
      value: function endDraw(point) {
        this.isDrawing = false;
        this.endStrokeAnimation();
        this.bufferCanvasCtx.clearRect(0, 0, this.canvasWidthScaled, this.canvasHeightScaled);
        this.drawFinishedStroke(this.model.currentStroke);
        this.model.saveStroke();
      }
    }, {
      key: "setDrawingStyle",
      value: function setDrawingStyle(style, ctx) {
        var colour = "rgba(".concat(style.colour[0], ", ").concat(style.colour[1], ", ").concat(style.colour[2], ", ").concat(style.opacity, ")");
        ctx.strokeStyle = colour;
        ctx.fillStyle = colour;
        ctx.lineWidth = style.size;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
      }
    }, {
      key: "strokeAnimation",
      value: function strokeAnimation() {
        var _this2 = this;

        this.drawAnimationStroke(this.model.currentStroke);
        this.reqStroke = window.requestAnimationFrame(function () {
          return _this2.strokeAnimation.apply(_this2);
        });
      }
    }, {
      key: "drawAnimationStroke",
      value: function drawAnimationStroke(stroke) {
        this.drawAnimation[stroke.style.key].apply(this, [stroke]);
      }
    }, {
      key: "endStrokeAnimation",
      value: function endStrokeAnimation() {
        window.cancelAnimationFrame(this.reqStroke);
        this.reqStroke = 0;
      }
    }, {
      key: "drawUndoStroke",
      value: function drawUndoStroke(stroke) {
        this.setDrawingStyle(stroke.style, this.drawingCanvasCtx);
        this.drawUndo[stroke.style.key].apply(this, [stroke]);
      }
    }, {
      key: "drawFinishedStroke",
      value: function drawFinishedStroke(stroke) {
        if (!stroke) return;
        this.setDrawingStyle(stroke.style, this.drawingCanvasCtx);
        this.drawFinished[stroke.style.key].apply(this, [stroke]);
      }
    }, {
      key: "drawExistingStroke",
      value: function drawExistingStroke(stroke) {
        this.setDrawingStyle(stroke.style, this.drawingCanvasCtx);
        this.drawFinished[stroke.style.key].apply(this, [stroke, false]);
      }
    }, {
      key: "trace",
      value: function trace(stroke, ctx) {
        var nbPoints = stroke.length();
        ctx.beginPath();

        if (nbPoints < 3) {
          ctx.moveTo(stroke.points[0].s.x, stroke.points[0].s.y);
          ctx.lineTo(stroke.points[nbPoints - 1].s.x + 0.001, stroke.points[nbPoints - 1].s.y + 0.001);
        } else {
          ctx.moveTo(stroke.points[0].s.x, stroke.points[0].s.y);
          var i, len, move, ref;
          ref = stroke.points.slice(1, +(nbPoints - 2) + 1 || 9e9);

          for (i = 0, len = ref.length; i < len; i++) {
            move = ref[i];
            ctx.quadraticCurveTo(move.s.x, move.s.y, move.h.x, move.h.y);
          }
        }
      }
    }, {
      key: "getDrawingDataUrl",
      value: function getDrawingDataUrl() {
        return this.drawingCanvas.toDataURL();
      }
    }, {
      key: "drawTransparentFillFinal",
      value: function drawTransparentFillFinal(stroke) {
        this.cacheCanvasCtx.clearRect(0, 0, this.canvasWidthScaled, this.canvasHeightScaled);
        this.cacheCanvasCtx.globalCompositeOperation = "source-over";
        stroke.style.opacity = stroke.style.opacity || 1;
        this.setDrawingStyle(stroke.style, this.cacheCanvasCtx);
        this.trace(stroke, this.cacheCanvasCtx);
        this.cacheCanvasCtx.closePath();
        this.cacheCanvasCtx.fill();
        this.cacheCanvasCtx.stroke();
        this.drawingCanvasCtx.globalCompositeOperation = "source-over";
        this.drawingCanvasCtx.globalAlpha = stroke.style.opacity;
        this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.canvasWidthScaled, this.canvasHeightScaled);
        this.drawingCanvasCtx.globalAlpha = 1.0;
      }
    }, {
      key: "drawStrokeFinal",
      value: function drawStrokeFinal(stroke) {
        this.drawingCanvasCtx.globalCompositeOperation = "source-over";
        this.trace(stroke, this.drawingCanvasCtx);
        this.drawingCanvasCtx.stroke();
      }
    }, {
      key: "drawFillFinal",
      value: function drawFillFinal(stroke) {
        this.drawingCanvasCtx.globalCompositeOperation = "source-over";
        this.trace(stroke, this.drawingCanvasCtx);
        this.drawingCanvasCtx.closePath();
        this.drawingCanvasCtx.fill();
        this.drawingCanvasCtx.stroke();
      }
    }, {
      key: "drawFillAndStroke",
      value: function drawFillAndStroke(stroke) {
        this.bufferCanvasCtx.clearRect(0, 0, this.canvasWidthScaled, this.canvasHeightScaled);
        this.trace(stroke, this.bufferCanvasCtx);
        this.bufferCanvasCtx.stroke();
      }
    }, {
      key: "drawEraserUndoingFinal",
      value: function drawEraserUndoingFinal(stroke) {
        this.drawingCanvasCtx.globalCompositeOperation = "destination-out";
        this.trace(stroke, this.drawingCanvasCtx);
        this.drawingCanvasCtx.stroke();
      }
    }, {
      key: "drawEraserUndoingFillFinal",
      value: function drawEraserUndoingFillFinal(stroke) {
        this.drawingCanvasCtx.globalCompositeOperation = "destination-out";
        this.trace(stroke, this.drawingCanvasCtx);
        this.drawingCanvasCtx.closePath();
        this.drawingCanvasCtx.fill();
        this.drawingCanvasCtx.stroke();
      }
    }, {
      key: "drawEraser",
      value: function drawEraser(stroke) {
        var copy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (copy) {
          this.drawingCanvasCtx.globalCompositeOperation = "copy";
          this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.canvasWidthScaled, this.canvasHeightScaled);
        }

        this.drawingCanvasCtx.globalCompositeOperation = "destination-out";
        this.trace(stroke, this.drawingCanvasCtx);
        this.drawingCanvasCtx.stroke();
      }
    }, {
      key: "drawEraserFillFinal",
      value: function drawEraserFillFinal(stroke) {
        var copy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (copy) {
          this.drawingCanvasCtx.globalCompositeOperation = "copy";
          this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.canvasWidthScaled, this.canvasHeightScaled);
        }

        this.drawingCanvasCtx.globalCompositeOperation = "destination-out";
        this.trace(stroke, this.drawingCanvasCtx);
        this.drawingCanvasCtx.closePath();
        this.drawingCanvasCtx.fill();
        this.drawingCanvasCtx.stroke();
      }
    }]);

    return NZKSketch;
  }(); // 	undo: ->

  return NZKSketch;

})));
