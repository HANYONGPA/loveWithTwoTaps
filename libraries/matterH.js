var Engine = Matter.Engine,
  // Render = Matter.Render,
  Runner = Matter.Runner,
  Body = Matter.Body,
  Bodies = Matter.Bodies,
  Mouse = Matter.Mouse,
  Events = Matter.Events,
  Common = Matter.Common,
  Constraint = Matter.Constraint,
  MouseConstraint = Matter.MouseConstraint,
  Composite = Matter.Composite;

var canvas;
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

let engine;
let world;
let mouse;
let constraint;

class Box {
  constructor(x, y, w, h) {
    this.body = Bodies.rectangle(x, y, w, h, {
      friction: 0.002,
      frictionAir: 0.05,
      restitution: 1,
      frictionStatic: 1,
    });
    this.w = w;
    this.h = h;
    Composite.add(world, this.body);
    rectMode(CENTER);
  }

  display() {
    //stroke(0);
    strokeWeight(1.5);

    this.pos = this.body.position;
    this.angle = this.body.angle;

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

class Circle {
  constructor(x, y, r, friction, mass, density) {
    this.isStatic = false;
    this.friction = friction;
    this.mass = mass;
    this.density = density;
    if (!friction) {
      this.friction = 0.1;
    }
    if (!mass) {
      this.mass = 0;
    }
    if (!density) {
      this.density = 0.001;
    }
    this.body = Bodies.circle(x, y, r / 2, {
      stiffness: 1,
      friction: this.friction,
      isStatic: this.isStatic,
      mass: this.mass,
      density: this.density,
      inertia: Infinity,
    });
    this.r = r;
    Composite.add(world, this.body);
  }

  display() {
    this.pos = createVector(this.body.position.x, this.body.position.y);

    push();
    translate(this.pos.x, this.pos.y);
    ellipse(0, 0, this.r);
    pop();
  }
}

class SB_Circle {
  constructor(x, y, r, s) {
    this.c = 0;
    this.cs = [];
    this.rad = r;
    //this.sidesRatio = s;
    this.csRad = 3;
    this.sidesRatio = 360 / ((this.rad * PI) / this.csRad);
    this.bouncy = map(this.rad / 2, 0, 60, 0.07, 0);
    this.pos = createVector(x, y);
    this.c = new Circle(this.pos.x, this.pos.y, 0.1, 100, 1, 1);
    for (let i = 0; i < radians(360); i += radians(this.sidesRatio)) {
      let rad = this.rad;
      let x = cos(i) * rad;
      let y = sin(i) * rad;
      let pos = createVector(this.pos.x, this.pos.y);
      this.cs.push(new Circle(pos.x + x, pos.y + y, 3, 100, 1, 1.2));
    }
    for (let i = 0; i < this.cs.length; i++) {
      cConstraint(this.c.body, this.cs[i].body, 0, 0, this.bouncy);
      if (i > 0) {
        cConstraint(this.cs[i].body, this.cs[i - 1].body, 0, 0, 1.2);
      } else
        cConstraint(
          this.cs[this.cs.length - 1].body,
          this.cs[i].body,
          0,
          0,
          1.2
        );
    }
    for (let i = this.cs.length - 1; i >= 0; i--) {
      if (i > 0) {
        cConstraint(this.cs[i - 1].body, this.cs[i].body, 0, 0, 1.2);
      }
      //else cConstraint(cs[cs.length-1].body, cs[i].body);
    }

    console.log(this.bouncy);
  }

  display() {
    this.c.display();
    beginShape();
    for (let i = 0; i < this.cs.length; i++) {
      vertex(this.cs[i].body.position.x, this.cs[i].body.position.y);
    }
    endShape();
    for (let i = 0; i < this.cs.length; i++) {
      if (i > 0) {
        //this.cs[i].display();
        stroke(255);
        strokeWeight(3);
        line(
          this.cs[i].body.position.x,
          this.cs[i].body.position.y,
          this.cs[i - 1].body.position.x,
          this.cs[i - 1].body.position.y
        );
        noStroke();
      } else {
        stroke(255);
        strokeWeight(3);
        line(
          this.cs[this.cs.length - 1].body.position.x,
          this.cs[this.cs.length - 1].body.position.y,
          this.cs[i].body.position.x,
          this.cs[i].body.position.y
        );
        noStroke();
      }
    }
  }
}

class SB_Text {
  constructor(txt, x, y) {
    this.b = [];
    this.space = 15;
    this.txt = txt;
    this.cg = createGraphics(canvasWidth, canvasHeight);
    this.cg.background(255);
    this.cg.fill(0);
    this.cg.textSize(350);
    this.cg.textStyle(BOLD);
    this.cg.textAlign(CENTER, CENTER);
    this.cg.text(this.txt, canvasWidth / 2, canvasHeight / 2 + 40);
    for (let y = 0; y < canvasHeight; y += this.space) {
      for (let x = 0; x < canvasWidth; x += this.space) {
        let c = this.cg.get(x, y);
        if (c[0] < 255 && c[1] < 255 && c[2] < 255) {
          this.b.push(new Circle(x, y, this.space * 1));
        }
      }
    }
  }

  connecting() {
    for (let i = 0; i < this.b.length; i++) {
      //Body.setStatic(this.b[i].body, true);
      //Body.setAngularVelocity(this.b[i].body, 0);
      for (let i2 = 0; i2 < sbt.b.length; i2++) {
        let distance = dist(
          this.b[i].body.position.x,
          this.b[i].body.position.y,
          sbt.b[i2].body.position.x,
          sbt.b[i2].body.position.y
        );
        if (distance < this.space * 3) {
          //line(this.b[i].body.position.x, this.b[i].body.position.y, sbt.b[i2].body.position.x, sbt.b[i2].body.position.y);
          cConstraint(this.b[i].body, sbt.b[i2].body, 0, 0, 1);
        }
        //console.log(distance);
      }
    }
    //
  }

  display(c) {
    for (let i = 0; i < this.b.length; i++) {
      this.b[i].display();
      push();
      translate(this.b[i].body.position.x, this.b[i].body.position.y);
      rotate(this.b[i].body.angle);
      fill(c);
      rect(0, 0, this.space * 2);
      pop();
    }
  }
}

class Ground {
  constructor() {
    this.body = Bodies.rectangle(
      canvasWidth / 2,
      canvasHeight + canvasHeight / 20,
      canvasWidth,
      canvasHeight / 10,
      { isStatic: true }
    );
    Composite.add(world, this.body);
    rectMode(CENTER);
  }

  display() {
    noStroke();

    this.pos = this.body.position;

    push();
    translate(this.pos.x, this.pos.y);
    rect(0, 0, canvasWidth, canvasHeight / 10);
    pop();
  }
}

class Boundary {
  constructor() {
    rectMode(CENTER);
    this.sizeRatio = 5;
    this.leftWall = Bodies.rectangle(
      -width / (this.sizeRatio * 2),
      height / 2,
      width / this.sizeRatio,
      height,
      { isStatic: true, label: "boundaryLeft" }
    );
    this.rightWall = Bodies.rectangle(
      width + width / (this.sizeRatio * 2),
      height / 2,
      width / this.sizeRatio,
      height,
      { isStatic: true, label: "boundaryRight" }
    );
    this.topWall = Bodies.rectangle(
      width / 2,
      -height / (this.sizeRatio * 2),
      width,
      height / this.sizeRatio,
      { isStatic: true, label: "boundaryTop" }
    );
    this.bottomWall = Bodies.rectangle(
      width / 2,
      height + height / (this.sizeRatio * 2),
      width,
      height / this.sizeRatio,
      { isStatic: true, label: "boundaryBottom" }
    );
    Composite.add(world, [
      this.leftWall,
      this.rightWall,
      this.topWall,
      this.bottomWall,
    ]);
  }

  display() {
    noStroke();

    this.lWpos = this.leftWall.position;
    this.rWpos = this.rightWall.position;
    this.tWpos = this.topWall.position;
    this.bWpos = this.bottomWall.position;
    rect(
      this.lWpos.x,
      this.lWpos.y,
      canvasWidth / this.sizeRatio,
      canvasHeight
    );
    rect(
      this.rWpos.x,
      this.rWpos.y,
      canvasWidth / this.sizeRatio,
      canvasHeight
    );
    rect(
      this.tWpos.x,
      this.tWpos.y,
      canvasWidth,
      canvasHeight / this.sizeRatio
    );
    rect(
      this.bWpos.x,
      this.bWpos.y,
      canvasWidth,
      canvasHeight / this.sizeRatio
    );
  }
}

function matterJs() {
  engine = Engine.create();
  world = engine.world;
  Engine.run(engine);
}

function mConstraint(s) {
  let mouseEl = Mouse.create(canvas.elt);
  mouseEl.pixelRatio = pixelDensity();
  mouse = MouseConstraint.create(engine, {
    mouse: mouseEl,
    constraint: {
      stiffness: 0.000001,
    },
  });

  Composite.add(world, mouse);
}

class mConstraints {
  constructor(s) {
    if (s) this.s = s;
    else this.s = 0.1;
    this.mouseEl = Mouse.create(canvas.elt);
    this.mouseEl.pixelRatio = pixelDensity();
    this.mouse = MouseConstraint.create(engine, {
      mouse: this.mouseEl,
      constraint: {
        stiffness: this.s,
      },
    });

    Composite.add(world, this.mouse);
  }

  display(w, color) {
    if (this.mouse.body) {
      if (w) {
        strokeWeight(w);
      } else strokeWeight(2);
      if (color) {
        stroke(color);
      } else stroke(255, 0, 0);
      let pos = createVector(
        this.mouse.body.position.x,
        this.mouse.body.position.y
      );
      let offset = createVector(
        this.mouse.constraint.pointB.x,
        this.mouse.constraint.pointB.y
      );
      line(pos.x + offset.x, pos.y + offset.y, mouseX, mouseY);
    } else {
      noStroke();
    }
    noStroke();
  }
}

function cConstraint(bA, bB, pA, pB, s, d) {
  constraint = Constraint.create({
    bodyA: bA,
    //pointA: { x: 100, y: 100 },
    bodyB: bB,
    //pointB: { x: 10, y: 10 },
    stiffness: s,
    damping: d,
  });

  Composite.add(world, constraint);
}
//preLoad함수 사용 font변수에 폰트 집어 넣어야 함
class FontPoints {
  constructor(txt, x, y, s) {
    this.txt = txt;
    this.font = 0;
    this.bounds = 0;
    this.fontPoints = [];

    this.bounds = font.textBounds(this.txt, x, y, s);
    this.fontPoints = font.textToPoints(
      this.txt,
      x - this.bounds.w / 2,
      y + this.bounds.h / 2,
      s,
      {
        sampleFactor: 0.1,
        simplifyThreshold: 0,
        getPathData: true,
      }
    );
  }

  display() {
    //rect(bounds.x, bounds.y, bounds.w, bounds.h);
    for (let i = 0; i < this.fontPoints.length; i++) {
      ellipse(this.fontPoints[i].x, this.fontPoints[i].y, 5);
    }
  }
}
