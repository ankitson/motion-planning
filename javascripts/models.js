//shuffle an array
function shuffle(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

/*Array.prototype.uniqueObjects = function (props) {
    function compare(a, b) {
      var prop;
        if (props) {
            for (var j = 0; j < props.length; j++) {
              prop = props[j];
                if (a[prop] != b[prop]) {
                    return false;
                }
            }
        } else {
            for (prop in a) {
                if (a[prop] != b[prop]) {
                    return false;
                }
            }

        }
        return true;
    }
    return this.filter(function (item, index, list) {
        for (var i = 0; i < index; i++) {
            if (compare(item, list[i])) {
                return false;
            }
        }
        return true;
    });
};*/

//point
function Point(x,y) {
  this.x = x;
  this.y = y;
}

function ParametricSegment(left, right) {
  if (left.x > right.x) {
    var temp = left;
    left = right;
    right = temp;
  }

  this.p = left;
  this.q = right;
}

//evaluate the segment at 0 <= t <= 1
//return vector sum of tp * (1-t) *q
ParametricSegment.prototype.evaluate = function(t) {
  var x = (1-t)*this.p.x + t * this.q.x;
  var y = (1-t)*this.p.y + t * this.q.y;
  return new Point(x,y);
}

function Trapezoid(topEdge,bottomEdge,leftP,rightP, neighbours, node) {
  this.topEdge = topEdge;
  this.bottomEdge = bottomEdge;
  this.leftP = leftP;
  this.rightP = rightP;

  if (neighbours === undefined)
    neighbours = [null,null,null,null];
  if (node === undefined)
    node = null;

  //if there is only 1 l/r neighbor, then upper and lower l/r both point to it
  this.neighbours = neighbours; //0-upper left, 1-upper right,2-lower left,3-lower-right
  this.node = node;


}

Trapezoid.prototype.upperLeft = function() { return this.neighbours[0]; }
Trapezoid.prototype.upperRight = function() { return this.neighbours[1]; }
Trapezoid.prototype.lowerLeft = function() { return this.neighbours[2]; }
Trapezoid.prototype.lowerRight = function() { return this.neighbours[3]; }

Trapezoid.prototype.setUpperLeft = function(trap) {
  this.neighbours[0] = trap;
  if (trap != null && trap.upperRight === null)
    trap.setUpperRight(this);
}
Trapezoid.prototype.setUpperRight = function(trap) {
  this.neighbours[1] = trap;
  if (trap != null && trap.upperLeft === null)
    trap.setUpperLeft(this);
}
Trapezoid.prototype.setLowerLeft = function(trap) {
  this.neighbours[2] = trap;
  if (trap != null && trap.lowerRight === null)
    trap.setLowerRight(this);
}

Trapezoid.prototype.setLowerRight = function(trap) {
  this.neighbours[3] = trap;
  if (trap != null && trap.lowerLeft === null)
    trap.setLowerLeft(this);
}

Trapezoid.prototype.setNeighbours = function(neighbours) {
  this.setUpperLeft(neighbours[0]);
  this.setUpperRight(neighbours[1]);
  this.setLowerLeft(neighbours[2]);
  this.setLowerRight(neighbours[3]);
}

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

		console.log()
    var bottomLeft = lineIntersect(lineFromSegment(this.bottomEdge), leftLine);
    var bottomRight = lineIntersect(lineFromSegment(this.bottomEdge), rightLine);
			//console.log('to points');
			//console.log([topLeft,topRight,bottomLeft,bottomRight]);

    return [topLeft, topRight, bottomLeft, bottomRight];
  }

Trapezoid.prototype.trapEquals = function(trap2) {
  var thisPoints = this.toPoints();
  var otherPoints = trap2.toPoints();

  for (i=0;i<4;i++) {
    var p1 = thisPoints[i];
    var p2 = otherPoints[i];
    if (p1.x !== p2.x || p1.y !== p2.y)
      return false;
  }
  return true;
}

Trapezoid.prototype.lineIntersection = function(line1) {
  console.log('trap.lineintesrection');
		console.log(this);

  var p1 = lineSegIntersect(line1,this.topEdge);
  var p2 = lineSegIntersect(line1,this.bottomEdge);

	console.log([p1,p2]);
	var leftLine = new Line(1,0,this.leftP.x);
	var rightLine = new Line(1,0,this.rightP.x);
	var topLine = lineFromSegment(this.topEdge);
	var botLine = lineFromSegment(this.bottomEdge);

	var leftSeg  = [lineIntersect(leftLine, topLine), lineIntersect(leftLine, botLine)];
	var rightSeg = [lineIntersect(rightLine, topLine),lineIntersect(rightLine, botLine)];
		console.log('leftSeg, rightSeg');
	console.log([leftLine,rightLine,leftSeg,rightSeg, this.bottomEdge]);



	console.log('blah');
  var p3 = lineSegIntersect(line1,leftSeg);
	console.log('p3: ' + p3);
  var p4 = lineSegIntersect(line1,rightSeg);
  console.log([line1,p1,p2,p3,p4]);

  return _.filter([p1,p2,p3,p4], function(elem) { return (elem !== null); } );
}

Trapezoid.prototype.segIntersection = function(seg1) {
  var p1 = segSegIntersect(seg1,this.topEdge);
  var p2 = segSegIntersect(seg1,this.bottomEdge);

		var leftLine = new Line(1,0,this.leftP.x);
	var rightLine = new Line(1,0,this.rightP.x);
	var topLine = lineFromSegment(this.topEdge);
	var botLine = lineFromSegment(this.bottomEdge);

	var leftSeg  = [lineIntersect(leftLine, topLine), lineIntersect(leftLine, botLine)];
	var rightSeg = [lineIntersect(rightLine, topLine),lineIntersect(rightLine, botLine)];

  var p3 = segSegIntersect(leftSeg,seg1);
  var p4 = segSegIntersect(rightSeg,seg1);

  return _.filter([p1,p2,p3,p4], function(elem) { return (elem !== null); } );
}

Trapezoid.prototype.segIntersectionUnfiltered = function(seg1) {
  var p1 = segSegIntersect(seg1,this.topEdge);
  var p2 = segSegIntersect(seg1,this.bottomEdge);

	var leftLine = new Line(1,0,this.leftP.x);
	var rightLine = new Line(1,0,this.rightP.x);
	var topLine = lineFromSegment(this.topEdge);
	var botLine = lineFromSegment(this.bottomEdge);

	var leftSeg  = [lineIntersect(leftLine, topLine), lineIntersect(leftLine, botLine)];
	var rightSeg = [lineIntersect(rightLine, topLine),lineIntersect(rightLine, botLine)];

  var p3 = segSegIntersect(leftSeg,seg1);
  var p4 = segSegIntersect(rightSeg,seg1);

	console.log('segunfil');
	console.log([leftLine,rightLine,topLine,botLine, leftSeg, rightSeg, p1, p2, p3, p4]);
  return [p1,p2,p3,p4];
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

function Node(stored,type,left,right) {
	if (type === 'y') {
  	this.seg1 = stored[0];
  	this.seg2 = stored[1];
	}

  this.stored = stored;
  this.type =  type; //x node (point), y node (segment) or leaf (trap)
  this.left =  left;
  this.right = right;
}

function SearchTree(root) {
  this.root = root;
}

function locate(root, point) {
  //console.log('locating:')
  //console.log([root,point]);
  if (root === null) {
    return null;
  }

  if (root.type === 'leaf') {
    return root;
  }

  if (root.type === 'x') {
    if (point.x < root.stored .x) {
      return locate(root.left, point);
    } else {
      return locate(root.right, point)
    }
  }

  if (root.type === 'y') {
    var seg = root.stored ;
    if (segSide(point,seg) < 0) { // verticallyBelow(point,seg)) {
      return locate(root.left,point);
    } else {
      return locate(root.right,point);
    }
  }

}

function findParent(root, node) {
  if (root === null)
    return null;

	if (root === node)
		return null;

  if (root.left === node || root.right === node) {
    return root;
  }


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

  if (node1Parent.left === node1) {
    node1Parent.left = node2;
  }
  else if (node1Parent.right === node1) {
    node1Parent.right = node2;
  }
  else
    console.log('the end is neigh');

  return root;

}

//not a general purpose function
//for 2 traps, they must share top or bottom edge
//for 3 traps, the first 2 must share left and right side, and share one of them with the third
function makeTree(traps) {
  if (traps.length === 1)
    return new Node(traps[0],"leaf",null,null);
  else if (traps.length === 2) {
    var commonSegment = null;
    var bottomTrap = null;
    var topTrap = null;
    console.log('LENGTH 2.....');
    console.log(traps);
    if (traps[0].bottomEdge[0] === traps[1].topEdge[0] && traps[0].bottomEdge[1] === traps[1].topEdge[1]) {
      console.log('0 bot = 1 top');
      commonSegment = traps[0].bottomEdge
      bottomTrap = traps[1];
      topTrap = traps[0];
    } else if (traps[0].topEdge[0] === traps[1].bottomEdge[0] && traps[0].topEdge[1] === traps[1].bottomEdge[1]) {
      console.log('1 bot = 0 top');
      commonSegment = traps[0].topEdge;
      bottomTrap = traps[0];
      topTrap = traps[1];
    } else {
      return null;
    }
    var topTrapNode = new Node(topTrap, "leaf", null, null);
    var bottomTrapNode = new Node(bottomTrap, "leaf", null, null);
    topTrap.node = topTrapNode;
    bottomTrap.node = bottomTrapNode;
    var segNode = new Node(commonSegment,'y', topTrapNode, bottomTrapNode);
    return segNode;
  }
  else if (traps.length === 3) {
    var node1 = makeTree(_.first(traps,2));

    var node3 = new Node(traps[2], "leaf", null, null);
        console.log('LENGTH 3...')
        console.log([traps,node1,node3]);

		traps[2].node = node3;

    var xDiv = null;
    var xNode = null;
		console.log('maketree for 3 traps:');
		console.log(traps);
    if (!((traps[0].leftP.x === traps[1].leftP.x) && (traps[0].rightP.x === traps[1].rightP.x)))
      return null;

    if (traps[0].leftP.x === traps[2].rightP.x) {
      xDiv = traps[0].leftP;
      xNode = new Node(xDiv,'x',node3,node1);
    }
    else if (traps[0].rightP.x === traps[2].leftP.x) {
      xDiv = traps[0].rightP;
      xNode = new Node(xDiv,'x',node1,node3);
    }
    else
      console.log('3 traps with wrong conditions to make tree');

    return xNode;
  }
}
