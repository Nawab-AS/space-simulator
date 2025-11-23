# Space Simulator

A simple space simulator with gravity simulation for celestial objects

## Live Demo
You can try out the live demo [here](https://nawab-as.github.io/space-simulator)!


## Features

- Multiple celestial objects (Stars and Planets)
- Adjustable mass, radius, and object type
- Time scale control for simulation speed
- Collision and merging of objects


## Usage

- Click anywhere on the canvas to place a new celestial object

- Click on a planet/star to select it

- Click anywhere else to deselect a star/planet (if selected)

- Use the sidebar sliders to adjust the mass, radius, and type of the selected object

- Click the simulate button to start/stop the gravity simulation

- Adjust the time scale to speed up or slow down the simulation

- Objects will merge upon collision, with the larger object absorbing the smaller one


## Installation

### Requirements
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Local development server
<br><br>

1. Clone this repository with git:
```bash
git clone https://github.com/Nawab-AS/space-simulator.git
cd ./space-simulator
```

2. Host using any web server

Since this is a static web page, you can host it with any web server, personally, I used python's builtin http server with:
```bash
python -m http.server -p 3000
```
Then visit `http://localhost:3000` in your browser


## Editing the object types

### Adding new object types

In order to add new types simply edit the `objectSizes.js` file to add the following.


```js
const objectTypes = {
    ...

    "<New Type>": {
        radius: {
            min: <min radius>,
            max: <max radius>
        },
        mass: {
            min: <min mass>,
            max: <max mass>
        }
    },

    ...
}
```


### Removing Object Types


1.  Find the type in the `objectSizes.js` file, using the CTRL-F menu with the following search command:
`"<the type you want to remove>"`

2. Delete the whole entry
