//generate a trapezoidal map, and a structure supporting point location queries
//input: array of Kinetic.Line objects in general position
//output:
function generateTrapMap(segments) {
  var bbox = new Trapezoid([new Point(0,0), new Point(1,800), new Point(800,0), new Point(801,800)], null);
  var trapSeq = [bbox];
  var trapSearch = new SearchTree(null);
  var bboxNode = new Node(bbox,'leaf',null,null);
  bbox.node = bboxNode;

  trapSearch.root = bboxNode;

  var segs = segments; //shuffle(segments); TODO put randomization back in

  for (var i=0;i<segs.length;i++) {
    console.log('status-->');
    console.log([segs[i],trapSearch,trapSeq]);
    var segment = segs[i];
    var p = segment[0];
    var q = segment[1];

    trapSeq.sort(function(trap1,trap2) {
      var p1 = trap1.points[0];
      var p2 = trap2.points[0];

      return (p1.x - p2.x + p2.y - p1.y);
    });

    var intersectingTraps = followSegment(trapSeq, trapSearch, segment);

    console.log('before remove');
    console.log('intsecting traps: ');
    console.log(intersectingTraps);
    console.log(trapSeq);

    //remove intersecting traps from seq
    for (var j=0;j<trapSeq.length;j++) {
      for (var k=0;k<intersectingTraps.length;k++) {
        if (_.isEqual(intersectingTraps[k], trapSeq[j])) {
          trapSeq.splice(j,1);
        }
      }
    }

    console.log('after remove');
    console.log(trapSeq);

    //update tree
    if (intersectingTraps.length === 1) {
      var trap = intersectingTraps[0];
      var toRemove = trap.node;

      var ext1 = new Line(1,0,p.x); //the line x = p.x
      var ext2 = new Line(1,0,q.x);

      var trapSegments = trap.toSegments();
      var topEdge = trapSegments[3];
      var bottomEdge = trapSegments[1];

      var topLine = lineFromPoints(topEdge[0],topEdge[1]);
      var bottomLine = lineFromPoints(bottomEdge[0],bottomEdge[1]);

      var topLeft = lineIntersect(ext1,topLine);
      var bottomLeft = lineIntersect(ext1,bottomLine);
      var bottomRight = lineIntersect(ext2,bottomLine);
      var topRight = lineIntersect(ext2,topLine);

      var trap1 = new Trapezoid([trap.points[0], trap.points[1],topLeft,bottomLeft], null);
      var trap2 = new Trapezoid([topLeft,p,q,topRight], null);
      var trap3 = new Trapezoid([p,bottomLeft,bottomRight,q], null);
      var trap4 = new Trapezoid([topRight,bottomRight,trap.points[2],trap.points[3]], null);

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

      if (trap === bbox) {
        trapSearch.root = xNode1;
      }


    } else {  //update for more than 1 intersecting trap
      var ext1 = new Line(1,0,p.x);
      var ext2 = new Line(1,0,q.x);
      var exts = [ext1,ext2];

      for (var j=0;j<intersectingTraps.length;j++) {
        var trap = intersectingTraps[j];
        var trapSegments = trap.toSegments();
        var trapLines = trap.toLines();

        var intersections = [];
        for (var k=0;k<2;k++) {
          intersections[k] = [];
          for (var h=0;h<4;h++) {
            intersections[k].push(lineSegIntersect(exts[k],trapSegments[h]));
          }
        }

        intersections = _.filter(intersections, function(elem) { return elem != null; });
        console.log('intersections');
        console.log(intersections);

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

  console.log('------follow segment------');
  console.log([trapSeq,trapSearch,segment]);
  trapSequence = new Array();
  var lm = locate(trapSearch.root, p);
  console.log(lm);
  var leftTrap = lm.data;
  leftTrap.node = lm;
  console.log(leftTrap);
  trapSequence.push(leftTrap); //TODO will not work if p is already present (pg 130)

  var i = 0;
  trapI = trapSequence[0];

  console.log('trapI:');
  console.log(trapI);

  console.log([trapI.rightPoint(), trapI.topPoint(), q]);
  while (q.x > trapI.rightPoint().x || q.y > trapI.topPoint().y) {
    var j = trapSeq.indexOf(trapI); //TODO implement strict === equality for traps for this to work
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
    i++;
  }

  console.log('--------------------');
  return trapSequence;
}
