//easing함수를 황용할 수 있는 클래스입니다.
//https://easings.net/ko에서 원하는 함수를 집어 넣어 사용 가능합니다.
//기본 easeInOutSine 적용.

//version 1.3

class EaseVec2 {
  constructor(aPos, bPos) {
    this.pos = aPos;
    this.aPos = this.pos.copy();
    this.bPos = bPos;
    this.v = 0;
    this.elapsed = 0;
    this.elapsed_f = 0;
    this.prevPos = aPos.copy();
  }

  easeVec2(duration) {
    this.duration = duration;
    this.dt = deltaTime * 0.001;
    this.elapsed += this.dt;
    this.t = this.elapsed / this.duration;

    this.pos.set(
      p5.Vector.lerp(this.aPos, this.bPos, this.easeInOutCubic(this.t))
    );

    this.prevPos.set(this.pos);
    let distance = p5.Vector.dist(this.prevPos, this.pos);
    this.v = distance / this.dt;

    if (this.elapsed >= duration) {
      this.aPos.set(this.bPos);
      this.elapsed = duration;
    }
  }

  update(bPos) {
    this.aPos.set(this.pos);
    this.elapsed = 0;
    this.bPos.set(bPos);
  }

  easeInOutQuart(x) {
    return x < 0.5 ? 6 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 2) / 1.5;
  }

  easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  modifiedEaseOutElastic(x, smoothness = 2.5, stability = 100) {
    const c4 = (2 * Math.PI) / 3;
    const easeInPart = Math.pow(x, stability);

    return x === 0
      ? 0
      : x === 1
      ? 1
      : (Math.pow(2, -10 * easeInPart) *
          Math.sin((easeInPart * 10 - 0.75) * c4) +
          1) *
        Math.pow(x, smoothness);
  }

  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  easeInOutQuint(x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
  }

  display() {
    fill(0);
    for (let x = 0; x < width; x += 3) {
      let y = this.easeInOutSine(map(x, 0, 400, 0, 1)) * 100;
      ellipse(x, 150 + y, 2);
    }
    text(`dt: ${this.dt.toFixed(2)}`, 20, 20);
    text(`elapsed: ${this.elapsed.toFixed(2)}`, 20, 40);
    text(`elapsed_f: ${this.elapsed_f.toFixed(2)}`, 20, 60);
    text(`t: ${this.t.toFixed(2)}`, 20, 80);
    text(`t_f: ${this.t_f.toFixed(2)}`, 20, 100);
  }
}

//단일 값에 대한 easing함수입니다.

class EaseFloat {
  constructor(aValue, bValue) {
    this.currentValue = aValue;
    this.aValue = this.currentValue;
    this.bValue = bValue;
    this.v = 0;
    this.elapsed = 0;
    this.elapsed_f = 0;
  }

  easeFloat(duration, v) {
    this.bValue = v;
    this.duration_f = duration;
    this.dt_f = deltaTime * 0.001;
    this.elapsed_f += this.dt_f;
    this.t_f = this.elapsed_f / this.duration_f;

    if (this.elapsed_f > this.duration_f) {
      this.elapsed_f = this.duration_f;
    }

    this.currentValue =
      this.aValue + (this.bValue - this.aValue) * this.easeOutElastic(this.t_f);
    return this.currentValue;
  }

  update_f(v) {
    this.aValue = this.currentValue;
    this.elapsed_f = 0;
    this.bValue = v;
  }

  easeInOutQuart(x) {
    return x < 0.5 ? 6 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 2) / 1.5;
  }

  easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  display() {
    fill(0);
    for (let x = 0; x < width; x += 3) {
      let y = this.easeInOutSine(map(x, 0, 400, 0, 1)) * 100;
      ellipse(x, 150 + y, 2);
    }
    text(`dt: ${this.dt.toFixed(2)}`, 20, 20);
    text(`elapsed: ${this.elapsed.toFixed(2)}`, 20, 40);
    text(`elapsed_f: ${this.elapsed_f.toFixed(2)}`, 20, 60);
    text(`t: ${this.t.toFixed(2)}`, 20, 80);
    text(`t_f: ${this.t_f.toFixed(2)}`, 20, 100);
  }
}

class EaseFloat2 {
  constructor(aValue, bValue) {
    this.currentValue = aValue;
    this.aValue = this.currentValue;
    this.bValue = bValue;
    this.v = 0;
    this.elapsed = 0;
    this.elapsed_f = 0;
  }

  easeFloat(duration, v) {
    this.bValue = v;
    this.duration_f = duration;
    this.dt_f = deltaTime * 0.001;
    this.elapsed_f += this.dt_f;
    this.t_f = this.elapsed_f / this.duration_f;

    if (this.elapsed_f > this.duration_f) {
      this.elapsed_f = this.duration_f;
    }

    this.currentValue =
      this.aValue + (this.bValue - this.aValue) * this.easeInOutSine(this.t_f);
    return this.currentValue;
  }

  update_f(v) {
    this.aValue = this.currentValue;
    this.elapsed_f = 0;
    this.bValue = v;
  }

  easeInOutQuart(x) {
    return x < 0.5 ? 6 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 2) / 1.5;
  }

  easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  display() {
    fill(0);
    for (let x = 0; x < width; x += 3) {
      let y = this.easeInOutSine(map(x, 0, 400, 0, 1)) * 100;
      ellipse(x, 150 + y, 2);
    }
    text(`dt: ${this.dt.toFixed(2)}`, 20, 20);
    text(`elapsed: ${this.elapsed.toFixed(2)}`, 20, 40);
    text(`elapsed_f: ${this.elapsed_f.toFixed(2)}`, 20, 60);
    text(`t: ${this.t.toFixed(2)}`, 20, 80);
    text(`t_f: ${this.t_f.toFixed(2)}`, 20, 100);
  }
}

class EaseVec2BezierCurve {
  constructor(aPos, bPos) {
    this.pos = aPos; // 곡선의 초기 위치
    this.aPos = this.pos.copy(); // 시작 위치
    this.bPos = bPos; // 목표 위치
    this.curve = new RandomBezierCurve(this.aPos, this.bPos); // 베지어 곡선
    this.t = 0; // 초기 t 값
    this.elapsed = 0;
    this.duration = 1; // 이징의 기본 지속 시간
    this.prevPos = aPos.copy();
    this.v = 0;
  }

  // 베지어 곡선을 따라 이징하는 메서드
  easeVec2BezierCurve(duration) {
    this.duration = duration;
    this.dt = deltaTime * 0.001; // 밀리초를 초로 변환
    this.elapsed += this.dt;
    this.t = this.elapsed / this.duration;
    this.prevPos.set(this.pos);

    // 이징 함수를 적용한 t 값
    let easedT = this.easeInOutCubic(this.t);

    // 이징된 t를 사용하여 베지어 곡선의 위치를 얻음
    this.pos.set(this.curve.getPoint(easedT));

    let distance = p5.Vector.dist(this.prevPos, this.pos);
    this.v = distance / this.dt;

    // 애니메이션 완료 시 t 값을 제한
    if (this.elapsed >= duration) {
      this.elapsed = duration;
      this.t = 1;
    }
  }

  update(bPos) {
    this.aPos.set(this.pos);
    this.curve = new RandomBezierCurve(this.aPos, bPos); // 새로운 곡선 생성
    this.elapsed = 0;
    this.t = 0;
  }

  // 이징 함수들
  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 2;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 5 - 0.75) * c4) + 1;
  }
}

class RandomBezierCurve {
  constructor(start, end) {
    this.start = start;
    this.end = end;

    this.randomOffsetStart = 200;
    this.randomOffsetEnd = 200;
    this.randomLerpStart = 0;
    this.randomLerpEnd = 1.0;

    // Control points creation
    let control1OffsetX = random(
      -this.randomOffsetStart,
      this.randomOffsetStart
    );
    let control1OffsetY = random(
      -this.randomOffsetStart,
      this.randomOffsetStart
    );
    this.control1 = createVector(
      lerp(start.x, end.x, this.randomLerpStart) + control1OffsetX,
      lerp(start.y, end.y, this.randomLerpStart) + control1OffsetY
    );

    let control2OffsetX = random(-this.randomOffsetEnd, this.randomOffsetEnd);
    let control2OffsetY = random(-this.randomOffsetEnd, this.randomOffsetEnd);
    this.control2 = createVector(
      lerp(start.x, end.x, this.randomLerpEnd) + control2OffsetX,
      lerp(start.y, end.y, this.randomLerpEnd) + control2OffsetY
    );
  }

  display(color) {
    noFill();
    stroke(color);
    strokeWeight(1);
    beginShape();
    vertex(this.start.x, this.start.y);
    bezierVertex(
      this.control1.x,
      this.control1.y,
      this.control2.x,
      this.control2.y,
      this.end.x,
      this.end.y
    );
    endShape();

    // Draw control points
    // fill(0);
    // ellipse(this.control1.x, this.control1.y, 5);
    // ellipse(this.control2.x, this.control2.y, 5);
    // line(this.start.x, this.start.y, this.control1.x, this.control1.y);
    // line(this.end.x, this.end.y, this.control2.x, this.control2.y);
  }

  // Return the position on the bezier curve for a given t
  getPoint(t) {
    let x = bezierPoint(
      this.start.x,
      this.control1.x,
      this.control2.x,
      this.end.x,
      t
    );
    let y = bezierPoint(
      this.start.y,
      this.control1.y,
      this.control2.y,
      this.end.y,
      t
    );
    return createVector(x, y);
  }
}
