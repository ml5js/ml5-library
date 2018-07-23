// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint max-len: ["error", { "code": 180 }] */

const iou = (box1, box2) => {
  /* Implement the intersection over union (IoU) between box1 and box2
    Arguments:
    box1 -- first box, list object with coordinates (x1, y1, x2, y2)
    box2 -- second box, list object with coordinates (x1, y1, x2, y2)
    */

  // Calculate the (y1, x1, y2, x2) coordinates of the intersection of box1 and box2. Calculate its Area.
  const xi1 = Math.max(box1[0], box2[0]);
  const yi1 = Math.max(box1[1], box2[1]);
  const xi2 = Math.min(box1[2], box2[2]);
  const yi2 = Math.min(box1[3], box2[3]);
  const interarea = (yi2 - yi1) * (xi2 - xi1);

  // Calculate the Union area by using Formula: Union(A,B) = A + B - Inter(A,B)
  const box1area = (box1[2] - box1[0]) * (box1[3] - box1[1]);
  const box2area = (box2[2] - box2[0]) * (box2[3] - box2[1]);
  const unionarea = (box1area + box2area) - interarea;

  // compute the IoU
  return interarea / unionarea;
};

export default iou;
