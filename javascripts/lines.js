//Line is stored as ax + by = c (not ax + by + c = 0)
//the formulas still work with two lines as the two -1s cancel
function Line(a,b,c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

Line.prototype.slope = function() {
  if (this.b !== 0)
    return -this.a/this.b;
  else
    return null;
}

Line.prototype.evaluate = function(x) {
  if (this.b === 0)
    return 1;
  else
    return (this.c - this. a * x) / this.b;
}

function lineFromPoints(p,q) {
  var x1 = p.x;
  var x2 = q.x;
  var y1 = p.y;
  var y2 = q.y;

	if (x2 === x1)
		return new Line(1,0,x1);

  var m = (y2 - y1) / (x2 - x1);
  var c = y1 - (m * x1);

  return new Line(-m,1,c);
}

function lineFromSegment(seg) {
  return lineFromPoints(seg[0],seg[1]);
}

//lines are specified as ax + by = c
//returns null if parallel
function lineIntersect(line1,line2) {

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

  //console.log('------line intersect-------');
  //console.log([line1,line2, xc, yc, det]);
  return new Point(xc,yc);
}

//console.log('LINE INTERSECT TESTS');
//var line1 = new Line(1,0,400);
//var line2 = new Line(1,1,800);
//console.log(lineIntersect(line1,line2));

function lineSegIntersect(line1,seg2) {
  var line2 = lineFromSegment(seg2);
  var ints = lineIntersect(line1,line2);
  if (ints != null && inRectangle(ints, seg2[0],seg2[1]))
    return ints;
  else
    return null;

  /*var maxx = Math.max(seg2[0].x,seg2[1].x);
  var minx = Math.min(seg2[0].x,seg2[1].x);
  var maxy = Math.max(seg2[0].y,seg2[1].y);
  var miny = Math.min(seg2[0].x,seg2[1].x);

  if (lIntsct.x >= minx && lIntsct.x <= maxx && lIntsct.y >= miny && lIntsct.y <= maxy)
    return lIntsct;
  else
    return null;*/
}

function segSegIntersect(seg1,seg2) {
  var line1 = lineFromSegment(seg1);
  var ints = lineSegIntersect(line1,seg2);
  if (ints != null && inRectangle(ints, seg1[0],seg1[1]))
    return ints;
  else
    return null;
}

function inRectangle(p,p1,p2) {
  var maxx = Math.max(p1.x,p2.x);
  var minx = Math.min(p1.x,p2.x);
  var maxy = Math.max(p1.y,p2.y);
  var miny = Math.min(p1.y,p2.y);

  return (p.x >= minx && p.y >= miny && p.x <= maxx && p.y <= maxy);
}

function verticallyBelow(point,segment) {
  return (point.y < Math.min(segment[0].y,segment[1].y));
}

function verticallyAbove(point,segment) {
  return (point.y > Math.max(segment[0].y, segment[1].y));
}

//directs the segment in left-right direction
//returns <0 on the left of seg, 0 on seg, >0 right
function segSide(point,segment) {
  var x1 = point.x;
  var y1 = point.y;
  var x2 = null;
  var x3 = null;
  var y2 = null;
  var y3 = null;
  if (segment[0].x < segment[1].x) {
    x2 = segment[0].x;
    x3 = segment[1].x;
    y2 = segment[0].y;
    y3 = segment[1].y;
  } else {
    x2 = segment[1].x;
    x3 = segment[0].x;
    y2 = segment[1].y;
    y3 = segment[0].y;
  }

  return (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
}

