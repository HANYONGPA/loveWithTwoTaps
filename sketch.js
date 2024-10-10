let boundary, delaunay;
let heartBodies = [];
const bodyToPolygonBodyMap = new Map(); // body를 polygonBody로 매핑

let lastPressTime = 0;
let doublePressThreshold = 300;

let mainHeart; // 고정된 메인 하트

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeCap(ROUND);
  matterJs(); // matter.js 초기화 (이미 포함된 라이브러리 사용)
  boundary = new Boundary();
  engine.gravity.y = 0.5;

  paper.setup();

  Events.on(engine, "collisionStart", handleCollision);

  // 고정된 메인 하트 생성 (화면 비율에 맞춘 크기로 초기화)
  mainHeart = new Heart(
    width / 2,
    height / 2,
    min(windowWidth, windowHeight) * 0.08
  );
}

function draw() {
  background(255);

  // 고정된 메인 하트를 표시
  mainHeart.display();

  // 모든 HeartBody를 표시
  for (let i = 0; i < heartBodies.length; i++) {
    heartBodies[i].display();
  }

  noCursor();
  if (mouseIsPressed) {
    cursor("grabbing");
  } else {
    cursor("grab");
  }
  // push();
  // fill(0, 40);
  // if (mouseIsPressed) {
  //   fill(0, 100);
  // }
  // noStroke();
  // ellipse(mouseX, mouseY, 30);
  // pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // 화면 크기가 변경될 때 메인 하트의 크기와 위치 업데이트
  mainHeart.updateSizeAndPosition();
}

// function handleCollision(event) {
//   const pairs = event.pairs;
//   pairs.forEach((pair) => {
//     const { bodyA, bodyB } = pair;
//     // boundary에 label이 있으므로 이를 기준으로 판별
//     const isBodyABoundary = bodyA.label && bodyA.label.includes("boundary");
//     const isBodyBBoundary = bodyB.label && bodyB.label.includes("boundary");

//     if (isBodyABoundary || isBodyBBoundary) {
//       const otherBody = isBodyABoundary ? bodyB : bodyA;
//       const polygonBody = bodyToPolygonBodyMap.get(otherBody);

//       if (polygonBody) {
//         // 해당 polygonBody의 heartBody를 가져옴
//         const heartBody = polygonBody.heartBody;
//         // 해당 heartBody의 모든 polygonBodies의 colCheck를 활성화
//         heartBody.polygonBodies.forEach((pb) => {
//           pb.colCheck = true;
//         });
//       }
//     }
//   });
// }
function handleCollision(event) {
  const pairs = event.pairs;
  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;

    const polygonBodyA = bodyToPolygonBodyMap.get(bodyA);
    const polygonBodyB = bodyToPolygonBodyMap.get(bodyB);

    if (polygonBodyA && polygonBodyB) {
      // 두 body 모두 polygonBody인 경우
      if (polygonBodyA.heartBody !== polygonBodyB.heartBody) {
        // 서로 다른 HeartBody에 속할 때
        polygonBodyA.heartBody.polygonBodies.forEach((pb) => {
          pb.colCheck = true;
        });
        polygonBodyB.heartBody.polygonBodies.forEach((pb) => {
          pb.colCheck = true;
        });
      }
    } else if (polygonBodyA && !polygonBodyB) {
      // bodyA는 polygonBody이고, bodyB는 다른 body인 경우
      polygonBodyA.heartBody.polygonBodies.forEach((pb) => {
        pb.colCheck = true;
      });
    } else if (!polygonBodyA && polygonBodyB) {
      // bodyB는 polygonBody이고, bodyA는 다른 body인 경우
      polygonBodyB.heartBody.polygonBodies.forEach((pb) => {
        pb.colCheck = true;
      });
    }
  });
}

function mousePressed() {
  let currentTime = millis();
  if (currentTime - lastPressTime < doublePressThreshold) {
    onDoublePress();
  }
  lastPressTime = currentTime;
}

function onDoublePress() {
  // 메인 하트의 tapped를 true로 설정하여 애니메이션 시작
  mainHeart.tapped = true;
  mainHeart.resetAnimation(); // 애니메이션 재설정

  // 새로운 HeartBody 생성
  let newHeartBody = new HeartBody(mainHeart);
  heartBodies.push(newHeartBody);
}

class HeartBody {
  constructor(heart) {
    this.heart = heart;
    this.polygonBodies = [];
    this.decompArr = [];
    this.paperPath = new paper.Path();
    this.paperPath.closed = true;
    this.polygonBodiesGenerated = false; // 한 번만 실행되도록 플래그 추가

    // this.generatePolygonBodies(); // 생성자에서 바로 폴리곤 바디 생성
  }

  generatePolygonBodies() {
    if (
      !this.polygonBodiesGenerated &&
      this.heart.life >= this.heart.lifeSpan
    ) {
      this.polygonBodiesGenerated = true; // 한 번만 실행되도록 설정
      this.decompArr = []; // 인스턴스별로 초기화
      this.paperPath = new paper.Path();
      this.paperPath.closed = true;

      for (let i = 0; i < this.heart.verts.length; i++) {
        this.decompArr.push(
          createVector(this.heart.verts[i].pos.x, this.heart.verts[i].pos.y)
        );
      }
      for (let p of this.decompArr) {
        this.paperPath.add(new paper.Point(p.x, p.y));
      }
      delaunay = new Delaunator.from(
        this.decompArr,
        (p) => p.x,
        (p) => p.y
      );
      let triangles = delaunay.triangles;
      for (let i = 0; i < triangles.length; i += 3) {
        let a = this.decompArr[triangles[i]];
        let b = this.decompArr[triangles[i + 1]];
        let c = this.decompArr[triangles[i + 2]];
        let vertices = [a, b, c];
        const centerX = (a.x + b.x + c.x) / 3;
        const centerY = (a.y + b.y + c.y) / 3;
        if (this.paperPath.contains(new paper.Point(centerX, centerY))) {
          let polygonBody = new PolygonBody(
            centerX,
            centerY,
            vertices,
            this // heartBody에 대한 참조 전달
          );
          this.polygonBodies.push(polygonBody);
          bodyToPolygonBodyMap.set(polygonBody.body, polygonBody); // 매핑 저장
        }
      }
    }
  }

  display() {
    this.generatePolygonBodies();
    for (let i = 0; i < this.polygonBodies.length; i++) {
      this.polygonBodies[i].display();
    }
    // text(this.heart.life, 10, 10);
  }
}

class PolygonBody {
  constructor(x, y, vertices, heartBody) {
    this.body = Bodies.fromVertices(x, y, vertices, { isStatic: false });
    Composite.add(world, this.body);

    this.colCheck = false;
    this.col = color(255, 47, 64);
    this.deadCol = color(200);
    this.life = 0;
    this.lifeSpan = 240;

    this.easeFloat = new EaseFloat2(0, 1);

    this.heartBody = heartBody; // heartBody에 대한 참조 저장
    this.bodyRemoved = false;
    this.savedVertices = null;

    Matter.Body.applyForce(
      this.body,
      { x: this.body.position.x, y: this.body.position.y },
      { x: random(-0.002, 0.002), y: random(-0.002, 0.002) }
    );
  }

  display() {
    this.life++;
    if (this.colCheck) {
      // this.col = lerpColor(
      //   this.col,
      //   this.deadCol,
      //   this.easeFloat.easeFloat(3, 1)
      // );
    }
    if (this.life >= this.lifeSpan && !this.bodyRemoved) {
      Composite.remove(world, this.body);
      bodyToPolygonBodyMap.delete(this.body); // 매핑에서 제거
      this.savedVertices = this.body.vertices.map((v) => ({ x: v.x, y: v.y }));
      this.bodyRemoved = true;
    }

    push();
    fill(this.col);
    stroke(this.col);
    strokeWeight(0.5);
    beginShape();
    if (this.bodyRemoved && this.savedVertices) {
      for (let i = 0; i < this.savedVertices.length; i++) {
        vertex(this.savedVertices[i].x, this.savedVertices[i].y);
      }
    } else {
      for (let i = 0; i < this.body.vertices.length; i++) {
        vertex(this.body.vertices[i].x, this.body.vertices[i].y);
      }
    }
    endShape(CLOSE);
    pop();
  }
}

class Heart {
  constructor(x, y, size) {
    this.verts = [];
    this.pos = createVector(x, y); // 초기 위치 설정
    this.setHeartSize(size); // 크기 설정
    this.tapped = false;
    this.easeFloat = new EaseFloat(this.size, this.size);

    this.life = 0;
    this.lifeSpan = 60;
    this.animationPlaying = false; // 애니메이션 재생 여부

    this.generateHeart();
  }

  setHeartSize(size) {
    this.ogSize = size / 10; // 기본 크기를 1/10로 설정
    this.size = size / 20; // 애니메이션 초기 크기는 더 작게 설정
  }

  updateSizeAndPosition() {
    // 화면 비율에 따라 크기 및 위치 업데이트
    let newSize = min(windowWidth, windowHeight) * 0.08;
    this.setHeartSize(newSize);
    this.pos.set(windowWidth / 2, windowHeight / 2); // 화면 중앙으로 위치 설정
    this.generateHeart(); // 새로운 크기와 위치에 맞게 하트 모양 재생성
  }

  generateHeart() {
    this.verts = []; // 기존의 vertices 초기화
    for (let a = 0; a <= TWO_PI; a += 0.15) {
      const r = this.ogSize * 1.06;
      const sinA = sin(a);

      const exponent = 2 + 0.5 * (1 + cos(a));

      const sinA_pow = pow(abs(sinA), exponent) * (sinA >= 0 ? 1 : -1);
      const x = r * 16 * sinA_pow;
      const y =
        -r * (13 * cos(a) - 5 * cos(2 * a) - 2 * cos(3 * a) - cos(4 * a));

      this.verts.push(new Vert(x + this.pos.x, y + this.pos.y));
    }
  }

  resetAnimation() {
    this.life = 0;
    this.easeFloat.elapsed_f = 0;
    this.animationPlaying = true;
  }

  display() {
    push();
    beginShape();
    if (this.tapped) {
      this.life++;
      if (this.life >= this.lifeSpan) {
        this.tapped = false;
        this.animationPlaying = false;
        this.size = this.ogSize; // 원래 크기로 복귀
      } else {
        this.size = this.easeFloat.easeFloat(1, this.ogSize);
      }
      // 채워진 하트
      fill(255, 47, 64);
      stroke(255, 47, 64);
      strokeWeight(this.ogSize);
    } else {
      this.size = this.ogSize;
      noFill();
      strokeWeight(this.ogSize * 1.6);
    }

    for (let a = 0; a <= TWO_PI; a += 0.01) {
      const r = this.size;
      const sinA = sin(a);

      const exponent = 2 + 0.5 * (1 + cos(a));

      const sinA_pow = pow(abs(sinA), exponent) * (sinA >= 0 ? 1 : -1);
      const x = r * 16 * sinA_pow;
      const y =
        -r * (13 * cos(a) - 5 * cos(2 * a) - 2 * cos(3 * a) - cos(4 * a));

      vertex(x + this.pos.x, y + this.pos.y);
    }
    endShape(CLOSE);
    pop();
  }
}

class Vert {
  constructor(x, y) {
    this.pos = createVector(x, y);
  }

  display() {
    ellipse(this.pos.x, this.pos.y, 5);
  }
}
