# nzk-sketch

Night Zookeeper's UI less free-draw canvas library.

## Getting Started

Import the package in your project: 
```
$yarn add WonkyStar/nzk-sketch
``` 

Then instanciate it as follows. All it really needs is a container element with a fixed width and height.

```javascript
import NZKSketch from 'nzk-sketch'

const sketch = new NZKSketch({
  // Required
  containerEl: yourContainerElement
})
```

This will fill the container element with a surface you can draw on. You are responsible for making sure the container element is of fixed width and height and not hidden behing any other element that would prevent recording clicks/touch events.

## API

### setBrush
Set various brush options
- `colour`: Brush colour (RGB array e.g [255, 255, 255])
- `size`: Brush size (Integer, 15 is default)
- `opacity`: Colour opacity (Float between 0 and 1)
- `fill`: Fill in at the end of a stoke (Boolean) 
- `eraser`: Set to eraser mode (Boolean)

```javascript
  sketch.setToolType({ colour: [0, 0, 0], size: 20 }) 
```

### export(options)
This returns a base64 encoded dataUrl of the whole drawing canvas. Options include:
* `crop`: Boolean, default to false. If true, the exported image will be cropped to match the actual size of the drawing.
* `maxWidth`: The max width of the exported image
* `maxHeight`: The max height of the exported image

```javascript
  sketch.export({
    crop: true, // default false
    maxWidth: 250, // default false
    maxHeight: 250 // default false
  }) 
```

### undo & redo

Once you have started drawing, you will be able to undo/redo any given stroke. You can use `canUndo` and `canRedo` to reflect which action can be used in your UI.

```javascript
  sketch.undo()
  sketch.redo() 
  sketch.canUndo()
  sketch.canRedo()
```

### restart 

This completely clears the current drawing. You can't undo this action.

```javascript
  sketch.restart() 
```

## TODO

* Automatically adapt to the container size if it changes after the first page load.
* `addTemplate`: New method to allow for adding one or more template images and specify if each image should be included in the exported drawing.
* Add/Remove stickers
* New brush styles




