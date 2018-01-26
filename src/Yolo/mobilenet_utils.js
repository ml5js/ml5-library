/* eslint-disable */
export class BoundingBox {
  constructor(x, y, w, h, conf, probs, index) {
    this.maxProb = -1;
    this.maxIndx = -1;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = conf;
    this.probs = probs;
    this.index = index;
  }
  getMaxProb() {
    if (this.maxProb === -1) {
      this.maxProb = this.probs.reduce((a, b) => Math.max(a, b));
    }
    return this.maxProb;
  }
  getLabel() {
    if (this.maxIndx === -1) {
      this.maxIndx = this.probs.indexOf(this.getMaxProb());
    }
    return BoundingBox.LABELS[this.maxIndx];
  }
  getColor() {
    if (this.maxIndx === -1) {
      this.maxIndx = this.probs.indexOf(this.getMaxProb());
    }
    return BoundingBox.COLORS[this.maxIndx];
  }
  iou(box) {
    const intersection = this.intersect(box);
    const union = this.w * this.h + box.w * box.h - intersection;
    return intersection / union;
  }
  intersect(box) {
    const width = this.overlap([this.x - this.w / 2, this.x + this.w / 2], [box.x - box.w / 2, box.x + box.w / 2]);
    const height = this.overlap([this.y - this.h / 2, this.y + this.h / 2], [box.y - box.h / 2, box.y + box.h / 2]);
    return width * height;
  }
  overlap(intervalA, intervalB) {
    const [x1, x2] = intervalA;
    const [x3, x4] = intervalB;
    if (x3 < x1) {
      if (x4 < x1) {
        return 0;
      } else {
        return Math.min(x2, x4) - x1;
      }
    } else {
      if (x2 < x3) {
        return 0;
      } else {
        return Math.min(x2, x4) - x3;
      }
    }
  }
}
BoundingBox.LABELS = ['raccoon'];
BoundingBox.COLORS = ['rgb(43,206,72)'];