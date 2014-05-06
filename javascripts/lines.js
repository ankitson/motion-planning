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

  var m = (y2 - y1) / (x2 - x1);
  var c = y1 - (m * x1);

  return new Line(-m,1,c);
}

function lineFromSegment(seg) {
  return lineFromPoints(seg[0],seg[1]);
}

//lines are specified as ax + by = c
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
  //console.log([line1,line2, xc, yc]);
  return new Point(xc,yc);
}

//console.log('LINE INTERSECT TESTS');
//var line1 = new Line(1,0,400);
//var line2 = new Line(1,1,800);
//console.log(lineIntersect(line1,line2));

//intersection between a line and a line segment
/*function lineSegIntersect(line1,seg2) {
  console.log('lineseg intesrecti: ');
  console.log([line1,seg2]);
  var line2 = lineFromPoints(seg2[0],seg2[1]);
  var lintsct = lineIntersect(line1,line2);

  var x1 = 0;
  var x2 = 0;
  var y1 = 0;
  var y2 = 0;
  if (line1.slope() !== null) {
    x1 = 1;
    x2 = 2;
    y1 = line1.evaluate(x1);
    y2 = line1.evaluate(x2);
  } else {
    x1 = 1;
    x2 = 1;
    y1 = 1;
    y2 = 2;
  }
  var x3 = seg2[0].x;
  var x4 = seg2[1].x;
  var y3 = seg2[0].y;
  var y4 = seg2[1].y;

  if (lintsct === null)
    return null;

  console.log()
  var denom = ( (y4 - y3) * (x2 -x1) )- ( (x4 - x3) * (y2 - y1) );

  if (denom === 0) //parallel
    return null;

  var ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3)))/denom;
  var ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3)))/denom;
  console.log('ua = ' + ua + ', ub = ' + ub);

  var xcoord = x1 + ua * (x2 - x1);
  var ycoord = y1 + ua * (y2 - y1);

  if (ub >= 0 && ub <= 1) //intersection point is within segment 2 (not just line 2)
    return new Point(xcoord,ycoord);

  return null;
}*/

function lineSegIntersect(line1,seg2) {
  var line2 = lineFromSegment(seg2);
  var lIntsct = lineIntersect(line1,line2);

  var maxx = Math.max(seg2[0].x,seg2[1].x);
  var minx = Math.min(seg2[0].x,seg2[1].x);
  var maxy = Math.max(seg2[0].y,seg2[1].y);
  var miny = Math.min(seg2[0].x,seg2[1].x);

  if (lIntsct.x >= minx && lIntsct.x <= maxx && lIntsct.y >= miny && lIntsct.y <= maxy)
    return lIntsct;
  else
    return null;
}

/*function lineSegIntersect(line1, seg2) {
  var line2 = lineFromSegment(seg2);
  var m1 = line1.slope();
  var m2 = line2.slope();

  console.log([m1,m2]);
  if (m1 === null) { //line1 is vertical
    if (m2 == null)
      return null;
    else {
      if (line1.c >= Math.max(seg2[0].x,seg2[1].x))
        return new Point(line1.c,line2.evaluate(line1.c));
    }
  }

  var ax = seg2[0].x;
  var ay = seg2[0].y;
  var bx = seg2[1].x;
  var by = seg2[1].y;

  var denom = (by - ay - bx * m1 + ax * m1);
    console.log(denom);

  if (denom === 0) //parallel
    return null;

  var alpha = (ax * m1 - ay) / denom;
  var beta  = (ax*by - ay*bx) / ((ax-bx)*m1 - ay + by);
  var intersectionX = (bx - ax) * alpha + ax;
  console.log((bx-ax)*alpha);
  var intersectionY = (by - ay) * alpha + ay;
  var p = new Point(intersectionX,intersectionY);

  console.log([m1,m2,ax,ay,bx,by,denom,alpha,beta,p]);

  if (alpha >= 0 && alpha <= 1)
    return p;
  else //outside segment
    return null;
}*/




function verticallyBelow(point,segment) {
  return (point.y < Math.min(segment[0].y,segment[1].y));
}

function verticallyAbove(point,segment) {
  return (point.y > Math.max(segment[0].y, segment[1].y));
}

//directs the segment to the left
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

