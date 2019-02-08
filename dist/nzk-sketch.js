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
      this.eraser = false;
      this.fill = false;
      this.opacity = 1.0;
      this.size = 15;
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
        return "".concat(this.eraser || this.opacity === 1.0 ? 'opaque' : 'transparent').concat(this.eraser ? 'Eraser' : 'Colour').concat(this.fill ? 'Fill' : 'Stroke');
      }
    }, {
      key: "getStyle",
      value: function getStyle() {
        return {
          opacity: this.opacity,
          colour: this.colour,
          eraser: this.eraser,
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
            this.actions = this.actions.slice(0, this.lastActionIndex + 1);
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

      this.containerEl = props.containerEl; // Size

      this.width = props.containerEl.offsetWidth;
      this.height = props.containerEl.offsetHeight;
      this.scale = window.devicePixelRatio >= 1.5 ? 2 : 1;
      this.widthScaled = this.width * this.scale;
      this.heightScaled = this.height * this.scale;
      this.template = props.template; // Model init

      this.model = new NzkSketchModel(); // Canvas layers

      if (this.template) {
        this.initTemplateCanvas(this.template);
      }

      this.initDrawingCanvas();
      this.initBufferCanvas();
      this.initCacheCanvas(); // Interaction layer

      this.initInteractionLayer(); // Drawing settings

      this.initDrawAnimations();
      this.setDrawingStyle(this.model.getStyle(), this.bufferCanvasCtx);
      this.isDrawing = false;
    } //
    // Public API
    //


    _createClass(NZKSketch, [{
      key: "setBrush",
      value: function setBrush(_ref) {
        var colour = _ref.colour,
            size = _ref.size,
            opacity = _ref.opacity,
            fill = _ref.fill,
            eraser = _ref.eraser;

        if (colour !== undefined) {
          this.model.colour = colour;
        }

        if (size !== undefined) {
          this.model.size = size;
        }

        if (opacity !== undefined) {
          this.model.opacity = opacity;
        }

        if (fill !== undefined) {
          this.model.fill = fill;
        }

        if (eraser !== undefined) {
          this.model.eraser = eraser;
        }
      }
    }, {
      key: "export",
      value: function _export() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        options.crop = options.crop || false;
        options.maxWidth = options.maxWidth || false;
        options.maxHeight = options.maxHeight || false;
        var canvasToExport = null; // If there is a template merge the drawing onto it and export that

        if (this.template) {
          this.templateCanvasCtx.drawImage(this.drawingCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled);
          canvasToExport = this.templateCanvasCtx;
        } else {
          canvasToExport = this.drawingCanvasCtx;
        }

        var box = {
          topLeftX: 0,
          topLeftY: 0,
          width: this.widthScaled,
          height: this.heightScaled
        };

        if (options.crop) {
          box = this.findBoundingBox(canvasToExport);
        }

        var shrinkRatio = 1;
        var widthShrinkRatio = 1;
        var heightShrinkRatio = 1;

        if (options.maxWidth && box.width > options.maxWidth) {
          widthShrinkRatio = box.width / options.maxWidth;
        }

        if (options.maxHeight && box.height > options.maxHeight) {
          heightShrinkRatio = box.height / options.maxHeight;
        }

        shrinkRatio = Math.max(widthShrinkRatio, heightShrinkRatio);
        this.initExportCanvas();
        this.exportCanvas.setAttribute('width', box.width / shrinkRatio);
        this.exportCanvas.setAttribute('height', box.height / shrinkRatio);
        this.exportCanvasCtx.globalCompositeOperation = 'copy';
        this.exportCanvasCtx.drawImage(canvasToExport.canvas, box.topLeftX, box.topLeftY, box.width, box.height, 0, 0, box.width / shrinkRatio, box.height / shrinkRatio);
        var image = this.exportCanvas.toDataURL();
        this.removeExportCanvas();
        return image;
      }
    }, {
      key: "undo",
      value: function undo() {
        if (!this.model.canUndo()) return;
        this.model.lastActionIndex--;
        this.drawingCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled);

        for (var i = 0; i <= this.model.lastActionIndex; i++) {
          this.drawUndoStroke(this.model.actions[i].object);
        }
      }
    }, {
      key: "redo",
      value: function redo() {
        if (!this.model.canRedo()) return;
        this.model.lastActionIndex++;
        var action = this.model.actions[this.model.lastActionIndex];
        this.drawUndoStroke(action.object);
      }
    }, {
      key: "canUndo",
      value: function canUndo() {
        return this.model.canUndo();
      }
    }, {
      key: "canRedo",
      value: function canRedo() {
        return this.model.canRedo();
      }
    }, {
      key: "restart",
      value: function restart() {
        this.model.reset();
        this.drawingCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled);
      } //
      // Internal helpers
      //

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
      key: "initTemplateCanvas",
      value: function initTemplateCanvas(template) {
        this.templateCanvas = document.createElement('canvas');
        this.templateCanvasCtx = this.templateCanvas.getContext('2d');
        this.setCanvasSize(this.templateCanvas);
        this.setLayerStyle(this.templateCanvas);
        this.templateCanvasCtx.drawImage(template, 0, 0, this.widthScaled, this.heightScaled);
        this.templateCanvas.style.zIndex = 0;
        this.containerEl.appendChild(this.templateCanvas);
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
        this.bufferCanvasCtx = this.bufferCanvas.getContext('2d');
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
      key: "initExportCanvas",
      value: function initExportCanvas() {
        this.exportCanvas = document.createElement('canvas');
        this.exportCanvasCtx = this.exportCanvas.getContext('2d');
        this.setCanvasSize(this.exportCanvas);
        this.setLayerStyle(this.exportCanvas);
        this.exportCanvas.style.display = 'none';
        this.containerEl.appendChild(this.exportCanvas);
      }
    }, {
      key: "removeExportCanvas",
      value: function removeExportCanvas() {
        this.exportCanvas.remove();
      }
    }, {
      key: "initInteractionLayer",
      value: function initInteractionLayer() {
        var _this = this;

        this.interactionLayerEl = document.createElement('div');
        this.setLayerStyle(this.interactionLayerEl);
        this.interactionLayerEl.style.zIndex = 3;
        this.onStartMouseDraw = this.onStartMouseDraw.bind(this);
        this.onMoveMouseDraw = this.onMoveMouseDraw.bind(this);
        this.onEndMouseDraw = this.onEndMouseDraw.bind(this);
        this.interactionLayerEl.addEventListener("mousedown", this.onStartMouseDraw);
        this.interactionLayerEl.addEventListener("mousemove", this.onMoveMouseDraw);
        this.interactionLayerEl.addEventListener("mouseup", this.onEndMouseDraw);
        this.interactionLayerEl.addEventListener("mouseleave", this.onEndMouseDraw);
        this.interactionLayerEl.addEventListener("mouseenter", function (ev) {
          if (ev.buttons > 0) {
            _this.onStartMouseDraw(ev);
          }
        }, false);
        this.onStartTouchDraw = this.onStartTouchDraw.bind(this);
        this.onMoveTouchDraw = this.onMoveTouchDraw.bind(this);
        this.onEndTouchDraw = this.onEndTouchDraw.bind(this);
        this.interactionLayerEl.addEventListener("touchstart", this.onStartTouchDraw);
        this.interactionLayerEl.addEventListener("touchmove", this.onMoveTouchDraw);
        this.interactionLayerEl.addEventListener("touchend", this.onEndTouchDraw);
        this.interactionLayerEl.addEventListener("touchcancel", this.onEndTouchDraw);
        this.containerEl.appendChild(this.interactionLayerEl);
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
        var rect = this.interactionLayerEl.getBoundingClientRect();
        return {
          x: (ev.clientX - rect.left) * this.scale,
          y: (ev.clientY - rect.top) * this.scale
        };
      }
    }, {
      key: "getTouchPoint",
      value: function getTouchPoint(ev) {
        var rect = this.interactionLayerEl.getBoundingClientRect();
        return {
          x: (ev.touches[0].clientX - rect.left) * this.scale,
          y: (ev.touches[0].clientY - rect.top) * this.scale
        };
      }
    }, {
      key: "onStartMouseDraw",
      value: function onStartMouseDraw(ev) {
        ev.preventDefault();
        this.startDraw(this.getMousePoint(ev));
      }
    }, {
      key: "onStartTouchDraw",
      value: function onStartTouchDraw(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.startDraw(this.getTouchPoint(ev));
      }
    }, {
      key: "onMoveMouseDraw",
      value: function onMoveMouseDraw(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.continueDraw(this.getMousePoint(ev));
      }
    }, {
      key: "onMoveTouchDraw",
      value: function onMoveTouchDraw(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.continueDraw(this.getTouchPoint(ev));
      }
    }, {
      key: "onEndMouseDraw",
      value: function onEndMouseDraw(ev) {
        this.endDraw();
      }
    }, {
      key: "onEndTouchDraw",
      value: function onEndTouchDraw(ev) {
        this.endDraw();
      }
    }, {
      key: "startDraw",
      value: function startDraw(point) {
        this.isDrawing = true;
        this.model.initStroke(point);

        if (this.model.currentStroke.style.eraser && this.model.currentStroke.style.opacity === 1.0) {
          this.cacheCanvasCtx.globalCompositeOperation = "copy";
          this.cacheCanvasCtx.drawImage(this.drawingCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled);
          this.setDrawingStyle(this.model.currentStroke.style, this.drawingCanvasCtx);
        }

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
      value: function endDraw() {
        if (!this.model.currentStroke) return;
        this.isDrawing = false;
        this.endStrokeAnimation();
        this.bufferCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled);
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
      key: "drawTransparentFillFinal",
      value: function drawTransparentFillFinal(stroke) {
        this.cacheCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled);
        this.cacheCanvasCtx.globalCompositeOperation = "source-over";
        stroke.style.opacity = stroke.style.opacity || 1;
        this.setDrawingStyle(stroke.style, this.cacheCanvasCtx);
        this.trace(stroke, this.cacheCanvasCtx);
        this.cacheCanvasCtx.closePath();
        this.cacheCanvasCtx.fill();
        this.cacheCanvasCtx.stroke();
        this.drawingCanvasCtx.globalCompositeOperation = "source-over";
        this.drawingCanvasCtx.globalAlpha = stroke.style.opacity;
        this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled);
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
        this.bufferCanvasCtx.clearRect(0, 0, this.widthScaled, this.heightScaled);
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
          this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled);
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
          this.drawingCanvasCtx.drawImage(this.cacheCanvasCtx.canvas, 0, 0, this.widthScaled, this.heightScaled);
        }

        this.drawingCanvasCtx.globalCompositeOperation = "destination-out";
        this.trace(stroke, this.drawingCanvasCtx);
        this.drawingCanvasCtx.closePath();
        this.drawingCanvasCtx.fill();
        this.drawingCanvasCtx.stroke();
      }
    }, {
      key: "findBoundingBox",
      value: function findBoundingBox(ctx) {
        var imageData = ctx.getImageData(0, 0, this.widthScaled, this.heightScaled);
        var box = {
          topLeftX: this.widthScaled,
          topLeftY: this.heightScaled,
          bottomRightX: 0,
          bottomRightY: 0
        };

        for (var x = 0; x < this.widthScaled; x++) {
          for (var y = 0; y < this.heightScaled; y++) {
            var pixelPosition = (y * this.widthScaled + x) * 4 + 3;

            if (imageData.data[pixelPosition] > 0) {
              if (x < box.topLeftX) box.topLeftX = x;
              if (y < box.topLeftY) box.topLeftY = y;
              if (x > box.bottomRightX) box.bottomRightX = x;
              if (y > box.bottomRightY) box.bottomRightY = y;
            }
          }
        }

        box.width = box.bottomRightX - box.topLeftX;
        box.height = box.bottomRightY - box.topLeftY;
        return box;
      }
    }]);

    return NZKSketch;
  }();

  return NZKSketch;

})));
