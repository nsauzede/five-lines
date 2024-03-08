
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2,
}

class Player {
    private x = 1;
    private y = 1;
    getX() { return this.x; }
    getY() { return this.y; }
    setX(x: number) { this.x = x; }
    setY(y: number) { this.y = y; }
}
let player = new Player();
let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 4, 2, 2],
  [2, 4, 2, 6, 1, 4, 2, 2],
  [2, 8, 4, 1, 1,11, 2, 2],
  [2, 4, 1, 1, 1, 9,10, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
let map: Tile[][];

interface Tile {
    isAir(): boolean;
    isLock1(): boolean;
    isLock2(): boolean;
    draw(g: CanvasRenderingContext2D, x: number, y: number): void;
    moveHorizontal(dx: number): void;
    moveVertical(dy: number): void;
    update(x: number, y: number): void;
    getBlockOnTopState(): FallingState;
}
class Air implements Tile {
    isAir() { return true; }
    isLock1() { return false; }
    isLock2() { return false; }
    draw(g: CanvasRenderingContext2D, x: number, y: number) {}
    moveHorizontal(dx: number) {
        moveToTile(player.getX() + dx, player.getY());
    }
    moveVertical(dy: number) {
        moveToTile(player.getX(), player.getY() + dy);
    }
    update(x: number, y: number) {}
    getBlockOnTopState() { return new Falling(); }
}
class Flux implements Tile {
    isAir() { return false; }
    isLock1() { return false; }
    isLock2() { return false; }
    draw(g: CanvasRenderingContext2D, x: number, y: number) {
      g.fillStyle = "#ccffcc";
      g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    moveHorizontal(dx: number) {
        moveToTile(player.getX() + dx, player.getY());
    }
    moveVertical(dy: number) {
        moveToTile(player.getX(), player.getY() + dy);
    }
    update(x: number, y: number) {}
    getBlockOnTopState() { return new Resting(); }
}
class Unbreakable implements Tile {
    isAir() { return false; }
    isLock1() { return false; }
    isLock2() { return false; }
    draw(g: CanvasRenderingContext2D, x: number, y: number) {
        g.fillStyle = "#999999";
      g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    moveHorizontal(dx: number) {}
    moveVertical(dy: number) {}
    update(x: number, y: number) {}
    getBlockOnTopState() { return new Resting(); }
}
class PlayerTile implements Tile {
    isAir() { return false; }
    isLock1() { return false; }
    isLock2() { return false; }
    draw(g: CanvasRenderingContext2D, x: number, y: number) {}
    moveHorizontal(dx: number) {}
    moveVertical(dy: number) {}
    update(x: number, y: number) {}
    getBlockOnTopState() { return new Resting(); }
}
interface FallingState {
    isFalling(): boolean;
    moveHorizontal(tile: Tile, dx: number): void;
    drop(x: number, y: number): void;
}
class Falling implements FallingState {
    isFalling() { return true; }
    moveHorizontal(tile: Tile, dx: number) {}
    drop(x: number, y: number) {
        map[y + 1][x] = map[y][x];
        map[y][x] = new Air();
    }
}
class Resting implements FallingState {
    isFalling() { return false; }
    moveHorizontal(tile: Tile, dx: number) {
      if (map[player.getY()][player.getX() + dx + dx].isAir()
        && !map[player.getY() + 1][player.getX() + dx].isAir()) {
        map[player.getY()][player.getX() + dx + dx] = tile;
        moveToTile(player.getX() + dx, player.getY());
      }
    }
    drop(x: number, y: number) { }
}
class FallStrategy {
    constructor(private falling: FallingState) {}
    update(x: number, y: number) {
      this.falling = map[y + 1][x].getBlockOnTopState();
      this.falling.drop(x, y);
    }
    moveHorizontal(tile: Tile, dx: number) {
        this.falling.moveHorizontal(tile, dx);
    }
}
class Stone implements Tile {
    private fallStrategy: FallStrategy;
    constructor(falling: FallingState) {
        this.fallStrategy = new FallStrategy(falling);
    }
    isAir() { return false; }
    isLock1() { return false; }
    isLock2() { return false; }
    draw(g: CanvasRenderingContext2D, x: number, y: number) {
        g.fillStyle = "#0000cc";
      g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    moveHorizontal(dx: number) {
      this.fallStrategy.moveHorizontal(this, dx);
    }
    moveVertical(dy: number) {}
    update(x: number, y: number) {
        this.fallStrategy.update(x, y);
    }
    getBlockOnTopState() { return new Resting(); }
}
class Box implements Tile {
    private fallStrategy: FallStrategy;
    constructor(falling: FallingState) {
        this.fallStrategy = new FallStrategy(falling);
    }
    isAir() { return false; }
    isLock1() { return false; }
    isLock2() { return false; }
    draw(g: CanvasRenderingContext2D, x: number, y: number) {
        g.fillStyle = "#8b4513";
      g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    moveHorizontal(dx: number) {
      this.fallStrategy.moveHorizontal(this, dx);
    }
    moveVertical(dy: number) {}
    update(x: number, y: number) {
        this.fallStrategy.update(x, y);
    }
    getBlockOnTopState() { return new Resting(); }
}
class KeyConfiguration {
    constructor(private color: string, private _1: boolean, private removeStrategy: RemoveStrategy) { }
    setColor(g: CanvasRenderingContext2D) { g.fillStyle = this.color; }
    is1() { return this._1; }
    removeLock() { remove(this.removeStrategy); }
}
class Key0 implements Tile {
    constructor(private keyConf: KeyConfiguration) { }
    isAir() { return false; }
    isLock1() { return false; }
    isLock2() { return false; }
    draw(g: CanvasRenderingContext2D, x: number, y: number) {
      this.keyConf.setColor(g);
      g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    moveHorizontal(dx: number) {
        this.keyConf.removeLock();
        moveToTile(player.getX() + dx, player.getY());
    }
    moveVertical(dy: number) {
        this.keyConf.removeLock();
        moveToTile(player.getX(), player.getY() + dy);
    }
    update(x: number, y: number) {}
    getBlockOnTopState() { return new Resting(); }
}
class Lock0 implements Tile {
    constructor(private keyConf: KeyConfiguration) { }
    isAir() { return false; }
    isLock1() { return this.keyConf.is1(); }
    isLock2() { return !this.keyConf.is1(); }
    draw(g: CanvasRenderingContext2D, x: number, y: number) {
      this.keyConf.setColor(g);
      g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    moveHorizontal(dx: number) {}
    moveVertical(dy: number) {}
    update(x: number, y: number) {}
    getBlockOnTopState() { return new Resting(); }
}

interface Input {
    handle(): void;
}
class Right implements Input {
    handle() {
        map[player.getY()][player.getX() + 1].moveHorizontal(1);
    }
}
class Left implements Input {
    handle() {
        map[player.getY()][player.getX() - 1].moveHorizontal(-1);
    }
}
class Up implements Input {
    handle() {
        map[player.getY() - 1][player.getX()].moveVertical(-1);
    }
}
class Down implements Input {
    handle() {
        map[player.getY() + 1][player.getX()].moveVertical(1);
    }
}

function assertExhausted(x: any): never {
    throw new Error("Unexpected object: " + x);
}
interface RemoveStrategy {
  check(tile: Tile): boolean;
}
class RemoveLock1 implements RemoveStrategy {
  check(tile: Tile) { return tile.isLock1(); }
}
class RemoveLock2 implements RemoveStrategy {
  check(tile: Tile) { return tile.isLock2(); }
}

function remove(shouldRemove: RemoveStrategy) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (shouldRemove.check(map[y][x])) {
        map[y][x] = new Air();
      }
    }
  }
}

const YELLOW_KEY = new KeyConfiguration("#ffcc00",true,new RemoveLock1());
const BLUE_KEY = new KeyConfiguration("#00ccff",false,new RemoveLock2());
function transformTile(tile: RawTile) {
  switch (tile) {
    case RawTile.AIR: return new Air();
    case RawTile.PLAYER: return new PlayerTile();
    case RawTile.UNBREAKABLE: return new Unbreakable();
    case RawTile.STONE: return new Stone(new Resting());
    case RawTile.BOX: return new Box(new Resting());
    case RawTile.FALLING_BOX: return new Box(new Falling());
    case RawTile.FLUX: return new Flux();
    case RawTile.KEY1: return new Key0(YELLOW_KEY);
    case RawTile.LOCK1: return new Lock0(YELLOW_KEY);
    case RawTile.KEY2: return new Key0(BLUE_KEY);
    case RawTile.LOCK2: return new Lock0(BLUE_KEY);
    default: assertExhausted(tile);
  }
}

function transformMap() {
  map = new Array(rawMap.length);
  for (let y = 0; y < rawMap.length; y++) {
    map[y] = new Array(rawMap[y].length);
      for (let x = 0; x < rawMap[y].length; x++) {
        map[y][x] = transformTile(rawMap[y][x]);
      }
  }
}

let inputs: Input[] = [];

function moveToTile(newx: number, newy: number) {
  map[player.getY()][player.getX()] = new Air();
  map[newy][newx] = new PlayerTile();
  player.setX(newx);
  player.setY(newy);
}

function handleInputs() {
  while (inputs.length > 0) {
    let input = inputs.pop();
    input.handle();
  }
}

function updateMap() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].update(x, y);
    }
  }
}

function update() {
    handleInputs();
    updateMap();
}

function drawMap(g: CanvasRenderingContext2D) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].draw(g, x, y);
    }
  }
}

function drawPlayer(g: CanvasRenderingContext2D) {
  g.fillStyle = "#ff0000";
  g.fillRect(player.getX() * TILE_SIZE, player.getY() * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");
  g.clearRect(0, 0, canvas.width, canvas.height);
  return g;
}

function draw() {
  let g = createGraphics();
  drawMap(g);
  drawPlayer(g);
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  transformMap();
  gameLoop();
}

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", e => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});
