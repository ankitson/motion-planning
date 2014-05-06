//shuffle an array
function shuffle(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

//point
function Point(x,y) {
  this.x = x;
  this.y = y;
}

function Trapezoid(topEdge,bottomEdge,leftP,rightP, neighbours, node) {
  this.topEdge = topEdge;
  this.bottomEdge = bottomEdge;
  this.leftP = leftP;
  this.rightP = rightP;
  //if there is only 1 l/r neighbor, then upper and lower l/r both point to it
  this.neighbours = neighbours; //0-upper left, 1-upper right,2-lower left,3-lower-right
  this.node = node;
}

Trapezoid.prototype.upperLeft = function() { return this.neighbours[0]; }
Trapezoid.prototype.upperRight = function() { return this.neighbours[1]; }
Trapezoid.prototype.lowerLeft = function() { return this.neighbours[2]; }
Trapezoid.prototype.lowerRight = function() { return this.neighbours[3]; }

Trapezoid.prototype.setUpperLeft = function(trap) { this.neighbours[0] = trap; }
Trapezoid.prototype.setUpperRight = function(trap) { this.neighbours[1] = trap; }
Trapezoid.prototype.setLowerLeft = function(trap) { this.neighbours[2] = trap; }
Trapezoid.prototype.setLowerRight = function(trap) { this.neighbours[3] = trap; }

Trapezoid.prototype.leftEdge = function() {
  return new Line(1,0,this.leftP.x);
}

Trapezoid.prototype.rightEdge = function() {
  return new Line(1,0,this.rightP.x);
}

Trapezoid.prototype.toPoints = function() {
    var leftLine = new Line(1,0,this.leftP.x);
    var rightLine = new Line(1,0,this.rightP.x);

    var topLeft = lineIntersect(lineFromSegment(this.topEdge), leftLine);
    var topRight = lineIntersect(lineFromSegment(this.topEdge),rightLine);
    var bottomLeft = lineIntersect(lineFromSegment(this.bottomEdge), leftLine);
    var bottomRight = lineIntersect(lineFromSegment(this.bottomEdge), rightLine);

    return [topLeft, topRight, bottomLeft, bottomRight];
  }

Trapezoid.prototype.lineIntersection = function(line1) {
  var p1 = lineSegIntersect(line1,this.topEdge);
  var p2 = lineSegIntersect(line1,this.bottomEdge);
  var p3 = lineIntersect(line1,this.leftEdge());
  var p4 = lineIntersect(line1,this.rightEdge());

  return _.filter([p1,p2,p3,p4], function(elem) { return (elem !== null); } );
}


/*Trapezoid.prototype.toSegments = function() {
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
}*/

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

  if (root === null) {
    return null;
  }

  if (root.type === 'leaf') {
    return root;
  }

  if (root.type === 'x') {
    if (point.x < root.data.x) {
      return locate(root.left, point);
    } else {
      return locate(root.right, point)
    }
  }

  if (root.type === 'y') {
    seg = root.data;
    if (verticallyBelow(point,seg)) {
      return locate(root.left,point);
    } else {
      return locate(root.right,point);
    }
  }

}

function findParent(root, node) {
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

//replace subtree rooted at node1 by subtree at node2
function replaceNode(root,node1,node2) {
  var node1Parent = findParent(root,node1);
  if (node1Parent === null) //node1 is root
    return node2;

  if (node1Parent.left === node1)
    node1Parent.left = node2;
  else if (node1Parent.right === node1)
    node1Parent.right = node2;
  else
    console.log('the end is neigh');

  return root;

}
