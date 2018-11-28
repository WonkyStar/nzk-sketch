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
  containerEl: yourContainerElement,
  // Optional (with defaults) 
  toolType: 'brush'
  toolColour: [0,0,0],
  toolSize: 15,
  toolOpacity: 1.0,
})
```

This will fill the container element with a surface you can draw on. You are responsible for making sure the container element is of fixed width and height and not hidden behing any other element that would prevent recording clicks/touch events.

## API

### setToolType
You can currently choose between 3 types of tools: 
- `brush`: A simple brush
- `fill`: Brush that fills in at the end of a stoke. 
- `eraser`: Does what it says on the tin

```javascript
  sketch.setToolType('fill') 
```

### setToolColour
This sets the colour what will be use by your selected tool. The eraser tool will ignore this setting. It takes a single RGB array argument.

```javascript
  sketch.setBrushColour([255,255,255]) 
```

### setToolSize
Use this to change the tool size. It takes a number from 1 to 100 as an argument.

```javascript
  sketch.setToolSize(20) 
```

### setToolOpacity
Use this to change the tool opacity. It takes a float from 0.1 to 1.0 as argument. The eraser tool will ignore this setting. 

```javascript
  sketch.setToolOpacity(0.5) 
```

### export(options)
This returns a base64 encoded dataUrl of the whole drawing canvas. Options include:
* `crop`: Boolean, default to false. If true, the exported image will be cropped to match the actual size of the drawing.

```javascript
  sketch.export({
    crop: false // default
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

* Add maxWidth and maxHeight options to the export method
* Automatically adapt to the container size if it changes after the first page load.
* `addTemplate`: New method to allow for adding one or more template images and specify if each image should be included in the exported drawing.
* FIX fill tool when opacity is less than 1.0
* Add/Remove stickers
* New brush styles




