import { playSound } from '@decentraland/SoundController'

// Define song list
const songs: {src: string, name: string}[] = 
[
  {src: "sounds/Telemann.mp3", name: "Telemann"},
  {src: "sounds/Bach.mp3", name: "Bach"},
  {src: "sounds/Brahms.mp3", name: "Brahms"},
  {src: "sounds/Chopin.mp3", name: "Chopin"},
];


////////////////////////
// Custom components

@Component('buttonState')
export class ButtonState {
  pressed: boolean = false
  zUp: number = 0
  zDown: number = 0
  fraction: number = 0
  constructor(zUp: number, zDown: number){
    this.zUp = zUp
    this.zDown = zDown
  }
}

///////////////////////////
// Entity groups

const buttons = engine.getComponentGroup(Transform, ButtonState)

///////////////////////////
// Systems

export class PushButton implements ISystem {
  update(dt: number) {
    for (let button of buttons.entities) {
      let transform = button.get(Transform)
      let state = button.get(ButtonState)
      if (state.pressed == true && state.fraction < 1){
        transform.position.z = Scalar.Lerp(state.zUp, state.zDown, state.fraction)
        state.fraction += 1/8
      } 
      else if (state.pressed == false && state.fraction > 0){
        transform.position.z = Scalar.Lerp(state.zUp, state.zDown, state.fraction)
        state.fraction -= 1/8
      }
    }
  }
}

engine.addSystem(new PushButton)


///////////////////////////
// INITIAL ENTITIES


// Jukebox
const jukebox = new Entity()
jukebox.set(new GLTFShape("models/Jukebox.gltf"))
jukebox.set(new Transform())
jukebox.get(Transform).position.set(5, 0, 9.5)
jukebox.get(Transform).rotation.setEuler(0, 0, 0)
jukebox.get(Transform).scale.setAll(0.6)
engine.addEntity(jukebox)


// Material for buttons
const buttonMaterial = new Material()
buttonMaterial.albedoColor = "#cc0000" 


// Buttons
let buttonArray =  []

for (let i = 0; i < songs.length; i ++){
  let posX = i % 2 == 0 ? -.4 : .1;
  let posY = Math.floor(i / 2) == 0 ? 1.9 : 1.77;

  const buttonWrapper = new Entity()
  buttonWrapper.set(new Transform())
  buttonWrapper.get(Transform).position.set(posX, posY, -0.7)
  buttonWrapper.parent = jukebox
  engine.addEntity(buttonWrapper)

  const buttonLabel = new Entity()
  buttonLabel.set(new Transform())
  buttonLabel.get(Transform).position.set(0.6, 0, -0.1)
  const text = new TextShape(songs[i].name)
  text.fontSize = 35
  text.fontFamily = "serif"
  text.hAlign = "left"  
  text.color = "#800000" 
  buttonLabel.set(text) 
  buttonLabel.parent = buttonWrapper
  engine.addEntity(buttonLabel)

  buttonArray[i] = new Entity()
  buttonArray[i].set(new Transform())
  buttonArray[i].get(Transform).position.set(0, 0, 0)
  buttonArray[i].get(Transform).rotation.setEuler(90, 0, 0)
  buttonArray[i].get(Transform).scale.set(0.05, 0.2, 0.05)
  buttonArray[i].set(buttonMaterial)
  buttonArray[i].parent = buttonWrapper
  buttonArray[i].set(new CylinderShape()) 
  buttonArray[i].set(new ButtonState(0, 0.1))
  buttonArray[i].set(new OnClick( _ => {
    pressButton(i)
  }))

  engine.addEntity(buttonArray[i])

  // const label = new Entity()
  // label.set(new Transform())
  // label.get(Transform).position.set(0.26, 0, -0.1)
  // label.parent = button
  // label.set(new Text())   ??????
  // engine.addEntity(label)
}

///////////////////////////////////////
//OTHER FUNCTIONS

function pressButton(i:number){
  let state = buttonArray[i].get(ButtonState)
    state.pressed = !state.pressed
    if (state.pressed){
      playSong(i)
    }
    for (let j = 0; j < songs.length; j ++){
      if (j !== i){
        buttonArray[j].get(ButtonState).pressed = false
      }
    }
}

function playSong(i: number){
  let songPath = songs[i].src
  log(songPath)
  executeTask(async () => {
    try {
      await playSound(songs[i].src, {
        loop: true,
        volume: 100,
      })
    } catch {
      log('failed to play sound')
    }
  })
}
