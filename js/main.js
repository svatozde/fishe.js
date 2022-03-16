let canvas = null;
let global_ctx=null;
let maxX = null;
let maxY = null;
let top_left = null;
let bot_right = null;
let bot_left = null;
let top_riht = null;


let fish_groups = null;

const FISH_NUMBER = 800;
const FISH_SIZE = 15;


function init() {
  canvas = getCanvas();

  const ctx = canvas.getContext("2d");
  global_ctx = ctx;
  maxX = window.innerWidth;
  maxY = window.innerHeight;


  ctx.canvas.width = maxX;
  ctx.canvas.height = maxY;

  window.requestAnimationFrame(gameLoop);

  top_left = new Vector(0, 0);
  bot_right = new Vector(maxX, maxY);
  bot_left = new Vector(0, maxY);
  top_riht = new Vector(maxX, 0);

  let obstacles = []
  obstacles.push(new Line(top_left, top_riht));
  obstacles.push(new Line(bot_left, bot_right));
  obstacles.push(new Line(top_riht, bot_right));
  obstacles.push(new Line(top_left, bot_left));


  //spiral

  let lastX = maxX * 0.2
  let lastY = maxY * 0.2
  for (let i = 1; i < 6; i++) {
    if (i % 2 === 0) {

    } else if (i % 3 === 0) {

    } else if (i % 4 === 0) {

    } else {

    }

  }


  const thicc = 200
  const hmol = 300
  for (let i = 1; i < 5; i++) {
    let a = new Vector(i * (maxX / 5) + thicc, hmol);
    let b = new Vector(i * (maxX / 5) + thicc, maxY - hmol);
    let d = new Vector(i * (maxX / 5) - thicc, hmol);
    let c = new Vector(i * (maxX / 5) - thicc, maxY - hmol);

    obstacles.push(new Line(a, b));
    obstacles.push(new Line(b, c));
    obstacles.push(new Line(c, d));
    obstacles.push(new Line(d, a));
  }



  fish_groups = []
  //fish_groups.push(new FishTank(ctx, obstacles, "#0000FF", {x: maxX/2, y: maxY/2}));
  //fish_groups.push(new FishTank(ctx, obstacles, "#00FF00",  {x: (maxX/2)+thicc, y: maxY/2}));
  //fish_groups.push(new FishTank(ctx, obstacles, "#FF0000",  {x: (maxX/2)-thicc, y: maxY/2}));
  //fish_groups.push(new FishTank(ctx, obstacles, "#FF00FF",  {x: (maxX/2)+5*thicc, y: maxY/2}));
  fish_groups.push(new FishTank(ctx, obstacles, "#00FFFF",  {x: (maxX/2)-5*thicc, y: maxY/2}));
}


tick = 0

function gameLoop(timeStamp) {
  tick = tick + 1 % 99999999999999
  global_ctx.clearRect(0, 0, maxX, maxY);
  for(const fishtank of fish_groups){
    fishtank.loop(tick);
  }

  // Keep requesting new frames
  window.requestAnimationFrame(gameLoop);
}

function getCanvas() {
  return document.getElementById("tank");
}

class FishTank {
  constructor(ctx, obstacles, color, position) {
    this.ctx = ctx;
    this.fishes = [];
    this.obstacles = obstacles;
    this.color = color;

    for (let i = 0; i < FISH_NUMBER; i++) {
      let pos = null
      if(position){
        pos = new Vector(position.x, position.y)
      }else{
        pos = Vector.randomPosition(maxX, maxY)
      }
      let fish = new Fish(
        pos,
        Vector.randomDirection(),
        this,
      );
      this.fishes.push(fish);
    }
  }

  loop(tick) {
    this.update(tick);
    this.draw();
  }

  update(tick) {
    this.update_friends();

    for (const fish of this.fishes) {
      fish.move(tick);
    }
  }

  update_friends() {
    for (const fish of this.fishes) {
      fish.reset_friends();
    }
    for (let i = 0; i < this.fishes.length - 1; i++) {
      const fish_1 = this.fishes[i];
      for (let j = i + 1; j < this.fishes.length; j++) {
        const fish_2 = this.fishes[j];
        const distance = fish_1.pos.distance(fish_2.pos);
        if (distance < fish_1.friend_distance) {
          fish_1.add_friend(fish_2)
        }
        if (distance < fish_2.friend_distance) {
          fish_2.add_friend(fish_1)
        }
      }
    }
  }


  draw() {
    for (const obstacle of this.obstacles) {
      obstacle.draw(this.ctx);
    }
    for (const fish of this.fishes) {
      fish.draw();
    }
  }
}

class Line {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  center() {
    let minx = Math.min(this.a.x, this.b.x)
    let miny = Math.min(this.a.y, this.b.y)

    let dx = Math.abs(this.a.x - this.b.x)
    let dy = Math.abs(this.a.y - this.b.y)
    return new Vector(minx + dx, miny + dy)
  }

  get_intersection(other) {
    return Line._intersect(
      this.a.x, this.a.y,
      this.b.x, this.b.y,
      other.a.x, other.a.y,
      other.b.x, other.b.y,
    );
  }

  draw(ctx) {
    ctx.lineWidth = 10;
    ctx.globalAlpha  = 1;
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(this.a.x, this.a.y);
    ctx.lineTo(this.b.x, this.b.y);
    ctx.stroke();
  }

  line_angle(other) {
    var dAx = other.a.x - this.a.x;
    var dAy = other.a.y - this.a.y;
    var dBx = other.b.x - this.b.x;
    var dBy = other.b.y - this.b.y;
    var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
    if (angle < 0) {
      angle = angle * -1;
    }
    return angle * (180 / Math.PI);
  }


  nearest(point) {
    return Line.findNearest(point, this.a, this.b);
  }

  static findNearest(p, a, b) {
    var atob = {x: b.x - a.x, y: b.y - a.y};
    var atop = {x: p.x - a.x, y: p.y - a.y};
    var len = atob.x * atob.x + atob.y * atob.y;
    var dot = atop.x * atob.x + atop.y * atob.y;
    var t = Math.min(1, Math.max(0, dot / len));
    return new Vector(a.x + atob.x * t, a.y + atob.y * t);
  }

  static _intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false
    }

    const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    // Lines are parallel
    if (denominator === 0) {
      return null;
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return null;
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1)
    let y = y1 + ua * (y2 - y1)

    return new Vector(x, y)
  }


}

class Fish {
  constructor(init_pos, init_vel, tank) {
    this.pos = init_pos; //Vector
    this.vel = init_vel; //Vector
    this.turn_angle = getRandomInt(-3, 3);
    this.friend_distance = getRandomInt(0, 50);
    this.tank = tank;
    this.friends = [];
    this.randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

    this.collision = null;
    this.nearest = null;
    this.obstackle = null;

    this.speed = getRandomInt(2, 5);
    this.random_tick = getRandomInt(3, 6);
  }

  reset_friends() {
    this.friends = [];
  }

  add_friend(fish) {
    this.friends.push(fish)
  }

  update_friends(friends) {
    this.friends = friends;
  }

  move(tick) {
    if (tick % this.random_tick === 0) {
      this.turn_angle = getRandomInt(-3, 3);
    }
    this.vel = this.vel.rotate(this.turn_angle).normalize();
    this.check_collision();
    if (!this.collision) {
      this.pos = this.pos.add(this.vel);
    } else {

        if (this.pos.distance(this.nearest) > FISH_SIZE + this.speed + 10) {
          const tvel = this.collision.subtract(this.nearest).scale(100);
          this.vel = this.vel.add(tvel).normalize()
        } else {
          //bounce
          let norm = this.obstackle.a.subtract(this.obstackle.b)
          let dot = this.vel.x * norm.x + this.vel.y * norm.y;
          let vnewx = this.vel.x - 2 * dot * norm.x;
          let vnewy = this.vel.y - 2 * dot * norm.y;
          this.vel = new Vector(vnewx, vnewy).normalize();
        }

        if(this.check_collision()){
          return
        }
    }
    this.pos = this.pos.add(this.vel.scale(this.speed));
  }

  check_collision() {
    this.collision = null;
    this.nearest = null;
    this.obstackle = null;
    const col_dist = 20;
    const col_point = this.pos.add(this.vel.scale(col_dist));
    const col_line = new Line(this.pos, col_point);

    let dist = maxX * maxY;
    for (const obs of this.tank.obstacles) {
      let intersection = col_line.get_intersection(obs)
      if (intersection) {
        let c_dist = intersection.distance(this.pos)
        if (c_dist < dist) {
          this.collision = intersection;
          this.nearest = obs.nearest(this.pos);
          this.obstackle = obs;
        }
      }
    }

    if(this.collision){
      return true;
    }
    return false;
  }

  add_vel() {
    this.pos = Vector.add(this.vel, this.pos);
  }

  set update_pos(p) {
    this.pos = Vector.add(this.pos, p);
  }

  set update_vel(v) {
    this.vel = Vector.add(this.vel, v);
  }

  draw(tick) {
    //const length = FISH_SIZE * 2;
    //let tail = this.pos.subtract(this.vel.scale(length));


    const x1 = this.pos.x;
    const y1 = this.pos.y;
    //const x2 = tail.x;
    //const y2 = tail.y;

    const cctx = this.tank.ctx;

    //drawSinline(cctx, pos, tail, tick);
    cctx.globalAlpha  = 0.2;
    cctx.fillStyle = this.tank.color;
    cctx.strokeStyle = "#000000";
    cctx.beginPath();
    cctx.arc(x1, y1, FISH_SIZE, 0, 2 * Math.PI);
    cctx.fill();

    //cctx.strokeStyle = "#000000";
    //cctx.beginPath();
    //cctx.moveTo(x1, y1);
    //cctx.lineTo(x2, y2);
    //cctx.stroke();

    /*
    if (this.collision) {
      cctx.beginPath();
      cctx.moveTo(this.pos.x, this.pos.y);
      cctx.lineTo(this.collision.x, this.collision.y);
      cctx.stroke();
    }

    if (this.nearest) {
      cctx.beginPath();
      cctx.moveTo(this.pos.x, this.pos.y);
      cctx.lineTo(this.nearest.x, this.nearest.y);
      cctx.stroke();
    }
 */
    cctx.lineWidth = 4;
    for (const friend of this.friends) {
      cctx.strokeStyle = this.randomColor;
      cctx.beginPath();
      cctx.moveTo(this.pos.x, this.pos.y);
      cctx.lineTo(friend.pos.x, friend.pos.y);
      cctx.stroke();
    }
    cctx.lineWidth = 1;

  }


}


function drawSinline(ctx, start, end, tick) {
  const dist = start.distance(end);

  let velo = start.subtract(end).normalize().scale(dist).scale(0.1);
  let norm = velo.rotate(90).normalize();

  for (let i = 0; i < 10; i++) {
    p = start.add(velo);
  }

}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min + 1) + min;
}

class Vector {
  constructor(x = 0.0, y = 0.0) {
    this.x = x;
    this.y = y;
  }


  scale(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  round() {
    return new Vector(Math.floor(this.x), Math.floor(this.y));
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  add(b) {
    return new Vector(this.x + b.x, this.y + b.y);
  }

  add_angle(ang, distance) {
    var xx = distance * Math.cos(ang);
    var yy = distance * Math.sin(ang);
    return new Vector(this.x + xx, this.y + yy);
  }

  rotate(angle) {
    let ang = -angle * (Math.PI / 180);
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return new Vector(Math.round(10000 * (this.x * cos - this.y * sin)) / 10000, Math.round(10000 * (this.x * sin + this.y * cos)) / 10000);
  }

  modulo(modX, modY) {
    return new Vector(this.x % modX, this.y % modY);
  }

  abs() {
    return new Vector(Math.abs(this.x), Math.abs(this.y));
  }

  normalize() {
    const mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag)
  }

  subtract(b) {
    return new Vector(this.x - b.x, this.y - b.y);
  }

  distance(b) {
    return Math.sqrt(Math.pow(this.x - b.x, 2) + Math.pow(this.y - b.y, 2));
  }

  vector_angle() {
    const angle = Math.atan2(this.y, this.x);
    const degrees = 180 * angle / Math.PI;
    return (360 + Math.round(degrees)) % 360;
  }

  static randomDirection() {
    return new Vector(getRandomFloat(-1, 1), getRandomFloat(-1, 1)).normalize();
  }

  static randomPosition(maxX, maxY) {
    return new Vector(getRandomInt(0, maxX), getRandomInt(0, maxY));
  }
}



