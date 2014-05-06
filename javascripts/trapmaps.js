console.log('line seg intersect tests');
var line1 = new Line(1,2,3);
var seg1 = [new Point(1,1), new Point(100,100)];
//console.log(lineSegIntersect(line1,seg1));

var line2 = new Line(3,2,1);
//console.log(lineSegIntersect(line2,seg1));

var line3 = new Line(6,8,11);
//console.log(lineSegIntersect(line3,seg1));

//generate a trapezoidal map, and a structure supporting point location queries
//input: segments
//output: trap sequence and trap search tree
function generateTrapMap(segments) {
  var bbox = new Trapezoid( [new Point(0,0), new Point(800,0)],
                            [new Point(1,800), new Point(801,800)],
                             new Point(0,0),
                             new Point(801,800), null);
  bbox.neighbours = [null,null,null,null];

  //var bbox = new Trapezoid([new Point(0,0), new Point(1,800), new Point(800,0), new Point(801,800)], null);
  var trapSeq = [bbox];
  var trapSearch = new SearchTree(null);
  var bboxNode = new Node(bbox,'leaf',null,null);
  bbox.node = bboxNode;

  trapSearch.root = bboxNode;

  var segs = segments; //shuffle(segments); TODO put randomization back in

  for (var i=0;i<segs.length;i++) {
    console.log('<------STATUS-------->');
    console.log([i,segs[i],trapSearch,trapSeq]);
    var segment = segs[i];
    var p = segment[0];
    var q = segment[1];

    /*trapSeq.sort(function(trap1,trap2) {
      var p1 = trap1.points[0];
      var p2 = trap2.points[0];

      return (p1.x - p2.x + p2.y - p1.y);
    });*/

    var intersectingTraps = followSegment(trapSeq, trapSearch, segment);

    //console.log('before remove');
    console.log('intsecting traps: ');
    console.log(intersectingTraps);
    //console.log(trapSeq);

    //remove intersecting traps from seq
    for (var j=0;j<trapSeq.length;j++) {
      for (var k=0;k<intersectingTraps.length;k++) {
        if (_.isEqual(intersectingTraps[k], trapSeq[j])) {
          trapSeq.splice(j,1);
        }
      }
    }

    //console.log('after remove');
    //console.log(trapSeq);

    //update tree
    if (intersectingTraps.length === 1) {
      //console.log(intersectingTraps)
      var trap = intersectingTraps[0];
      var toRemove = trap.node;

      var ext1 = new Line(1,0,p.x); //the line x = p.x
      var ext2 = new Line(1,0,q.x);

      //console.log(trap);
      //console.log(trap.topEdge);
      var topLine = lineFromSegment(trap.topEdge);
      var bottomLine = lineFromSegment(trap.bottomEdge);

      var topLeft = lineIntersect(ext1,topLine);
      var bottomLeft = lineIntersect(ext1,bottomLine);
      var bottomRight = lineIntersect(ext2,bottomLine);
      var topRight = lineIntersect(ext2,topLine);

      var trap1 = new Trapezoid([trap.topEdge[0], topLeft],
                                [trap.bottomEdge[0], bottomLeft],
                                 trap.leftP, p,
                                [null,null,null,null], null);
      var trap2 = new Trapezoid([topLeft, topRight],
                                [p, q],
                                 p, q,
                                [null,null,null,null], null);
      var trap3 = new Trapezoid([p,q],
                                [bottomLeft,bottomRight],
                                 p, q,
                                [null,null,null,null], null);
      var trap4 = new Trapezoid([topRight, trap.topEdge[1]],
                                [bottomRight, trap.bottomEdge[1]],
                                 q, trap.rightP,
                                [null,null,null,null], null);

      trap1.setUpperLeft(null);
      trap1.setLowerLeft(null);
      trap1.setUpperRight(trap2);
      trap1.setLowerRight(trap3);

      trap2.setUpperLeft(trap1);
      trap2.setLowerLeft(null);
      trap2.setUpperRight(trap4);
      trap2.setLowerRight(null);

      trap3.setUpperLeft(null);
      trap3.setLowerLeft(trap1);
      trap3.setUpperRight(null);
      //trap3.setLowerRight(trap4); REVIEW THIS MONKEyPATCH to make follow work
      trap3.setLowerRight(trap2);

      trap4.setUpperLeft(trap2);
      trap4.setLowerLeft(trap3);
      trap4.setUpperLeft(null);
      trap4.setUpperRight(null);


      var trap1Node = new Node(trap1,'leaf',null,null);
      var trap2Node = new Node(trap2,'leaf',null,null);
      var trap3Node = new Node(trap3,'leaf',null,null);
      var trap4Node = new Node(trap4,'leaf',null,null);

      trap1.node = trap1Node;
      trap2.node = trap2Node;
      trap3.node = trap3Node;
      trap4.node = trap4Node;

      trapSeq.push(trap1);
      trapSeq.push(trap2);
      trapSeq.push(trap3);
      trapSeq.push(trap4);

      var yNode = new Node(segment, 'y', trap2Node, trap3Node);
      var xNode2 = new Node(q,'x', yNode, trap4Node);
      var xNode1 = new Node(p, 'x', trap1Node, xNode2);
      trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, xNode1));

    } else {  //update for more than 1 intersecting trap

      console.log('more than 1 intersecting trap');
      console.log(intersectingTraps);
      var ext1 = new Line(1,0,p.x);
      var ext2 = new Line(1,0,q.x);
      var exts = [ext1,ext2];

      for (var j=0;j<intersectingTraps.length;j++) {
        var trap = intersectingTraps[j];
        var intersectionPoints = trap.lineIntersection(ext1).concat(trap.lineIntersection(ext2)).
                                                             concat(trap.lineIntersection(ext3));

        console.log('intersection points; ');
        console.log(intersectionPoints);
        //console.log(trap.lineIntersection(ext1));
        console.log(trap);




      }
    }
  }

  return [trapSeq,trapSearch];
}


//assuming trapSeq is sorted with arrow from topleft to downright, down first
//go down, then right
//returns sequence of traps intersecting segment, sorted left to right
function followSegment(trapSeq, trapSearch, segment) {
  p = segment[0];
  q = segment[1];

  trapSequence = new Array();
  var loc = locate(trapSearch.root, p);
  var leftTrap = loc.data;
  leftTrap.node = loc;
  trapSequence.push(leftTrap); //TODO will not work if p is already present (pg 130)

  var i = 0;
  var trap = trapSequence[0];

  while (segSide(q,trap.topEdge) < 0 || q.x > trap.rightP) {

    if (verticallyAbove(trap.rightP, segment)) {
      trap = trap.lowerRight();
      console.log('lower right');
    } else {
      trap = trap.upperRight();
      console.log('upper right');
    }

    trapSequence[++i] = trap;


    /*var j = trapSeq.indexOf(trapI); //TODO implement strict === equality for traps for this to work
    console.log('j: '+j);
    var upperRightNeighbour = trapSeq[j-1];
    var lowerRightNeighbour = trapSeq[j+1];

    console.log("trapI: ");
    console.log(trapI);
    console.log("q: ");
    console.log(q);
    console.log("i: ");
    console.log(i);
    console.log("trap seq:");
    console.log(trapSequence);
    trapI = trapSequence[i];



    //this logic relies on right point of a trapezoid being uniquely defined
    //due to general position assumption (no two distinct endpoints share x coord)
    if (verticallyAbove(trapI.rightPoint(), segment)) {
      trapSequence[i+1] = trapSeq[j+2];//lower right neighbor of trapSequence[i]
    } else {
      trapSequence[i+1] = trapSeq[j+1];//upper right neighbor of trapSequence[i]
    }
    i++;*/
  }

  return trapSequence;
}
