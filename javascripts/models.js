//util.js
function shuffle(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

//point
function Point(x,y) {
  this.x = x;
  this.y = y;
}

//points downright _1_|_3_
//                 _2_|_4_
function Trapezoid(points, node) {
  this.points = points;
  this.node = node;
}

Trapezoid.prototype.toSegments = function() {
  var segments = [];
  segments.push([this.points[0], this.points[1]]);
  segments.push([this.points[1], this.points[3]]);
  segments.push([this.points[3], this.points[2]]);
  segments.push([this.points[2], this.points[0]]);
  return segments;
}

Trapezoid.prototype.toLines = function() {
  var segments = this.toSegments();
  return _.map(segments, function(segment) { return lineFromPoints(segment[0],segment[1]);});
}

Trapezoid.prototype.rightPoint = function() {
  var rightMostPoint = this.points[0];
  for(var i=1;i<this.points.length;i++) {
    if (this.points[i].x > rightMostPoint.x)
      rightMostPoint = this.points[i];
  }
  return rightMostPoint;
}

Trapezoid.prototype.topPoint = function() {
  var topMostPoint = this.points[0];
  for(var i=1;i<this.points.length;i++) {
    if (this.points[i].y > topMostPoint.y)
      topMostPoint = this.points[i];
  }
  return topMostPoint;
}

Trapezoid.prototype.trapEquals = function(trap2) {
  for (var i=0;i<4;i++) {
    if (!(this.points[i].x === this.points[i].x && this.points[i].y === trap2.points[i].y))
      return false;
  }
  return true;
}

function Node(data,type,left,right) {
  this.data =  data;
  this.type =  type; //x node (point), y node (segment) or leaf (trap)
  this.left =  left;
  this.right = right;
}

function SearchTree(root) {
  this.root = root;
}

function locate(root, point) {
  console.log("------locate------");
  console.log([root,point]);

  if (root === null) {
    console.log('returning null');
    console.log('--------------------');
    return null;
  }

  if (root.type === 'leaf') {
    console.log('returning root');
    console.log('--------------------');
    return root;
  }

  if (root.type === 'x') {
    console.log('x node: ' + root.data.x);
    if (point.x < root.data.x) {
      return locate(root.left, point);
    } else {
      return locate(root.right, point)
    }
  }

  if (root.type === 'y') {
    console.log('y node');
    console.log(root.data);
    seg = root.data;
    if (verticallyAbove(point,seg)) {
      return locate(root.left,point);
    } else {
      return locate(root.right,point);
    }
  }

  console.log('--------------------');
}

function findParent(root, node) {
  console.log('----------findparent------------');
  console.log([root,node]);
  if (root === null)
    return null;

  if (root.left === node || root.right === node)
    return root;

  var parent = findParent(root.left, node);
  if (parent !== null)
    return parent;
  parent = findParent(root.right,node);

  return parent;
}

function Line(a,b,c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

function lineFromPoints(p,q) {
  var x1 = p.x;
  var x2 = q.x;
  var y1 = p.y;
  var y2 = q.y;

  var m = (y2 - y1) / (x2 - x1);
  var c = y1 - (m * x1);

  return new Line(-m,1,c);
}

//lines are specified as ax + by = c
function lineIntersect(line1,line2) {
  console.log('------line intersect-------');
  console.log([line1,line2]);
  var a1 = line1.a;
  var b1 = line1.b;
  var c1 = line1.c;

  var a2 = line2.a;
  var b2 = line2.b;
  var c2 = line2.c;

  var det = a1*b2 - a2*b1;
  if (det === 0)
    return null;

  var xc = (b2*c1 - b1*c2)/det;
  var yc = (a1*c2 - a2*c1)/det;

  return new Point(xc,yc);
}

//intersection between a line and a line segment
function lineSegIntersect(line1,seg2) {
  var line2 = lineFromPoints(seg[0],seg[1]);
  var lintsct = lineIntersect(line1,line2);

  var x1 = 1;
  var x2 = 2;
  var y1 = 0;
  var y2 = 0;
  if (line1.b != 0) {
    y1 = (line1.c - x1 * line1.a) / (line1.b);
    y2 = (line1.c - x2 * line1.a) / (line1.b);
  } else {
    y1 = 1;
    y2 = 2;
    x2 = x1;
  }
  var x3 = seg2[0].x;
  var x4 = seg2[1].x;
  var y3 = seg2[0].y;
  var y4 = seg2[1].y;

  if (lintsct === null)
    return null;

  var denom = ( (y4 - y3) * (x2 -x1) )- ( (x4 - x3) * (y2 - y1) );

  if (denom === 0) //parallel
    return null;

  var ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3)))/denom;
  var ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3)))/denom;

  var xcoord = x1 + ua * (x2 - x1);
  var ycoord = y1 + ua * (y2 - y1);

  if (ub >= 0 && ub <= 1) //intersection point is within segment 2 (not just line 2)
    return new Point(xcoord,ycoord);

  return null;
}

function verticallyAbove(point,segment) {
  return (point.y > Math.max(segment[0].y,segment[1].y));
}
