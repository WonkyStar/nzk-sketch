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

  var NZKSketch =
  /*#__PURE__*/
  function () {
    function NZKSketch() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, NZKSketch);

      if (!props.containerEl) {
        throw new Error("NZKSketch needs to be instantiated with a containerEl");
      }

      this.containerEl = props.containerEl;
      this.template = props.template;
      this.scale = window.devicePixelRatio >= 1.5 ? 2 : 1;
      console.log(this);
      this.initTouchLayer();
    }

    _createClass(NZKSketch, [{
      key: "initTouchLayer",
      value: function initTouchLayer() {
        this.touchLayerEl = document.createElement('div');
        this.touchLayerEl.style.width = '100%';
        this.touchLayerEl.style.height = '100%';
        this.onStartMouseDraw = this.onStartMouseDraw.bind(this);
        this.onMoveMouseDraw = this.onMoveMouseDraw.bind(this);
        this.onEndMouseDraw = this.onEndMouseDraw.bind(this);
        this.touchLayerEl.addEventListener("mousedown", this.onStartMouseDraw, false);
        this.touchLayerEl.addEventListener("mousemove", this.onMoveMouseDraw, false);
        this.touchLayerEl.addEventListener("mouseup", this.onEndMouseDraw, false);
        this.onStartTouchDraw = this.onStartTouchDraw.bind(this);
        this.onMoveTouchDraw = this.onMoveTouchDraw.bind(this);
        this.onEndTouchDraw = this.onEndTouchDraw.bind(this);
        this.touchLayerEl.addEventListener("touchstart", this.onStartTouchDraw, false);
        this.touchLayerEl.addEventListener("touchmove", this.onMoveTouchDraw, false);
        this.touchLayerEl.addEventListener("touchend", this.onEndTouchDraw, false);
        this.containerEl.appendChild(this.touchLayerEl);
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
        console.log("Start draw at:", point);
      }
    }, {
      key: "continueDraw",
      value: function continueDraw(point) {
        console.log("Continue draw at:", point);
      }
    }, {
      key: "endDraw",
      value: function endDraw(point) {
        console.log("End draw at:", point);
      }
    }]);

    return NZKSketch;
  }(); // module.exports = BaseView.extend

  var example = function example() {
    new NZKSketch(document.getElementById('sketch-container'));
  };

  return example;

})));
