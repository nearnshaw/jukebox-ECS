import { playSound } from '@decentraland/SoundController'

// Define song list
const songs: {src: string, name: string}[] = 
[
  {src: "sounds/Concerto a' 4 Violini No 2 - Telemann.mp3", name: "Telemann"},
  {src: "sounds/Double Violin Concerto 1st Movement - J.S. Bach.mp3", name: "Bach"},
  {src: "sounds/Rhapsody No. 2 in G Minor – Brahms.mp3", name: "Brahms"},
  {src: "sounds/Scherzo No1_ Chopin.mp3", name: "Chopin"},
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

export class PushButton {
  update(dt: number) {
    for (let button of buttons.entities) {
      let transform = button.get(Transform)
      let state = button.get(ButtonState)
      if (state.pressed == true && state.fraction < 1){
        transform.position.z = Scalar.Lerp(state.zUp, state.zDown, state.fraction)
        state.fraction += 1/15
      } 
      else if (state.pressed == false && state.fraction > 0){
        transform.position.z = Scalar.Lerp(state.zUp, state.zDown, state.fraction)
        state.fraction -= 1/15
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
jukebox.get(Transform).rotation.set(0, 0, 0)
jukebox.get(Transform).scale.setAll(0.6)
engine.addEntity(jukebox)

let buttonArray =  []

for (let i = 0; i < songs.length; i ++){
  let posX = i % 2 == 0 ? -.4 : .1;
  let posY = Math.floor(i / 2) == 0 ? 1.9 : 1.77;

  const buttonWrapper = new Entity()
  buttonWrapper.set(new Transform())
  buttonWrapper.get(Transform).position.set(posX, posY, -0.7)
  buttonWrapper.parent = jukebox
  engine.addEntity(buttonWrapper)

  buttonArray[i] = new Entity()
  buttonArray[i].set(new Transform())
  buttonArray[i].get(Transform).position.set(0, 0, 0)
  buttonArray[i].get(Transform).rotation.set(90, 0, 0)
  buttonArray[i].get(Transform).scale.set(0.05, 0.2, 0.05)
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

function playSong(index: number){

  executeTask(async () => {
    try {
      await playSound("a.mp3", {
        loop: false,
        volume: 100,
      })
    } catch {
      log('failed to play sound')
    }
  })
}

function pressButton(i:number){
  let state = buttonArray[i].get(ButtonState)
    state.pressed = !state.pressed
    playSong(i)
    for (let j = 0; j < songs.length; j ++){
      if (j !== i){
        buttonArray[j].get(ButtonState).pressed = false
      }
    }
}

// executeTask(async () => {
//   try {
//     await playSound("a.mp3", {
//       loop: false,
//       volume: 100,
//     })
//   } catch {
//     log('failed to play sound')
//   }
// })