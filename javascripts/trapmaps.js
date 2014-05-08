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
//SEGMENTS MUST BE ORIENTED LEFT TO RIGHT (SORTED BY X)
function generateTrapMap(segments) {
  var bbox = new Trapezoid( [new Point(0,0), new Point(800,0)],
                            [new Point(1,800), new Point(801,800)],
                             new Point(0,0),
                             new Point(801,800), null);
  bbox.neighbours = [null,null,null,null];

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

    var intersectingTraps = followSegment(trapSeq, trapSearch, segment);

    console.log('intersecting traps: ');
    console.log(intersectingTraps);

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

      var allIntersectionPoints = [];
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

      trap1.setUpperLeft(trap.upperLeft());
      trap1.setLowerLeft(trap.lowerLeft());
      //trap1.setLowerLeft(null);
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
      trap4.setUpperRight(trap.upperRight());
      trap4.setLowerRight(trap.lowerRight());

      if (trap.upperLeft() != null) {
        trap.upperLeft().setUpperRight(trap1);
      }

      if (trap.lowerLeft() != null) {
        trap.lowerLeft().setLowerRight(trap1);
      }

      if (trap.upperRight() != null) {
        trap.upperRight().setUpperLeft(trap4);
      }

      if (trap.lowerRight() != null) {
        trap.lowerRight().setLowerLeft(trap4);
      }


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
      console.log('1 intersecting trap first case');
      console.log(trapSeq);

    } else {  //update for more than 1 intersecting trap

      console.log('more than 1 intersecting trap');
      console.log(intersectingTraps);
      var ext1 = new Line(1,0,p.x);
      var ext2 = new Line(1,0,q.x);
      var exts = [ext1,ext2];

      var allIntersectionPoints = [];

      for (var j=0;j<intersectingTraps.length;j++) {
        var trap = intersectingTraps[j];
        var segIntersections = trap.segIntersectionUnfiltered(segment);

        var horzSegIntersections = _.first(segIntersections, 2);
        var vertSegIntersections = _.rest(segIntersections,2);
        horzSegIntersections = _.filter(horzSegIntersections, function(elem) { return (elem !== null);});
        vertSegIntersections = _.filter(vertSegIntersections, function(elem) { return (elem !== null);});
        horzSegIntersections = _.sortBy(horzSegIntersections, ['x','y']);
        vertSegIntersections = _.sortBy(vertSegIntersections, ['x','y']);
        console.log('horz/vertSegIntersections after sort');
        console.log(horzSegIntersections,vertSegIntersections);

        if (j === 0) { //trap containing p
          console.log('trap containing p');
          var vertExt = new Line(1,0,p.x);
          var vertExtIntersections = trap.lineIntersection(vertExt);
          vertExtIntersections.sort(function(p1,p2) { return p1.y - p2.y});

          //the seg can intersect either a vertical side of trap or an oblique side
          if (vertSegIntersections.length === 1) { //vert side
            console.log('1 vert seg intersected');

            var trapA = new Trapezoid([trap.topEdge[0],vertExtIntersections[0]],
                                    [trap.bottomEdge[0], vertExtIntersections[1]],
                                     trap.leftP, p, [null,null,null,null],null);
            var trapB = new Trapezoid([vertExtIntersections[0], trap.topEdge[1]],
                                      [p, vertSegIntersections[0]],
                                      p, trap.rightP, [null,null,null,null], null);
            var trapC = new Trapezoid([p, vertSegIntersections[0]],
                                      [vertExtIntersections[1], trap.bottomEdge[1]],
                                      p, trap.rightP, [null,null,null,null], null);
            trapSeq.push(trapA);
            trapSeq.push(trapB);
            trapSeq.push(trapC);


            trapA.setUpperRight(trapB);
            trapA.setLowerRight(trapC);
            trapA.setLowerLeft(trap.lowerLeft());
            trapA.setLowerRight(trap.lowerRight());

            trapB.setUpperLeft(trapA);
            trapB.setUpperRight(trap.upperRight());
            trapB.setLowerRight(null);
            trapB.setLowerLeft(null);

            trapC.setUpperLeft(null);
            trapC.setUpperRight(null);
            trapC.setLowerRight(trap.lowerRight());
            trapC.setLowerLeft(trapA);

            trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, makeTree([trapB,trapC, trapA])));
          } else if (horzSegIntersections.length === 1) {
            console.log('1 horz seg intersected');
            var horzSegIntersection = horzSegIntersections[0];
            var extL = new Line(1,0,p.x);
            var extR = new Line(1,0,horzSegIntersections[0].x);
            var extRIntersection = trap.lineIntersection(extR);
            extRIntersection = _.filter(extRIntersection, function(elem) { return (elem.y !== horzSegIntersection.y); })[0];

            var trapA = new Trapezoid([trap.topEdge[0],vertExtIntersections[0]],
                                      [trap.bottomEdge[0], vertExtIntersections[1]],
                                      trap.leftP, p, [null,null,null,null], null);
            trapA.setUpperLeft(trap.upperLeft);
            trapA.setLowerLeft(trap.lowerLeft);

            //trapB is the triangular trap
            //depending on whether seg leaves trap from top horz edge or bottom, trapB will be at top or bottom
            var trapB = null;
            var trapC = null;
            var trapD = null;
            if (horzSegIntersection.y < p.y) { //so triangle is on top
              trapB = new Trapezoid([vertExtIntersections[0],horzSegIntersection],
                                    [p, horzSegIntersection],
                                    p, horzSegIntersection, [null,null,null,null], null);
              trapC = new Trapezoid([p, horzSegIntersection],
                                    [vertExtIntersections[1], extRIntersection],
                                    p, horzSegIntersection, [null,null,null,null]);
              trapD = new Trapezoid([horzSegIntersection, trap.topEdge[1]],
                                    [extRIntersection, trap.bottomEdge[1]],
                                    horzSegIntersection, trap.rightP, [null,null,null,null],null);

              trapA.setUpperRight(trapB);
              trapA.setLowerRight(trapC);

              trapB.setUpperLeft(trapA);
              trapB.setUpperRight(trapC);
              trapB.setLowerLeft(null);
              trapB.setLowerRight(trapC);

              trapC.setLowerRight(trapB);
              trapC.setUpperRight(trapD);
              trapC.setLowerLeft(trapA);
              trapC.setUpperLeft(null);

              //trapD.setLowerLeft()
              //trapC.
            } else {
              trapB = new Trapezoid([p, horzSegIntersection],
                                    [vertExtIntersections[1], horzSegIntersection],
                                    p, horzSegIntersection, [null,null,null,null], null);
              trapC = new Trapezoid([vertExtIntersections[0], extRIntersection],
                                    [p, horzSegIntersection],
                                    p, horzSegIntersection, [null,null,null,null],null);
              trapD = new Trapezoid([extRIntersection, trap.topEdge[1]],
                                    [horzSegIntersection, trap.bottomEdge[1]],
                                    horzSegIntersection, trap.rightP, [null,null,null,null],null);

              trapA.setLowerRight(trapB);
              trapA.setUpperRight(trapC);

              trapB.setLowerLeft(trapA);
              trapB.setUpperRight(trapC); //to make follow work
              trapB.setUpperLeft(null);
              trapB.setLowerRight(trapC);



            }

            trapSeq = trapSeq.concat([trapA,trapB,trapC,trapD]);

            //TODO update tree, set neighbours
          } else {
            console.log('the fury cometh');
          }
        }
        else if (j === intersectingTraps.length - 1) { //trap containing q
          var vertExt = new Line(1,0,q.x);
          var vertExtIntersections = trap.lineIntersection(vertExt);
          vertExtIntersections.sort(function(p1,p2) { return p1.y - p2.y});

          if (vertSegIntersections.length === 1) {
            var trapA = new Trapezoid([trap.topEdge[0],vertExtIntersections[0]],
                                      [vertSegIntersections[0], q],
                                      trap.leftP, q, [null,null,null,null], null);
            var trapB = new Trapezoid([vertSegIntersections[0], q],
                                      [trap.bottomEdge[0], vertExtIntersections[1]],
                                      vertSegIntersections[0], q, [null,null,null,null], null);
            var trapC = new Trapezoid([vertExtIntersections[0], trap.topEdge[1]],
                                      [vertExtIntersections[1], trap.bottomEdge[1]],
                                      q, trap.rightP, [null,null,null,null], null);

            trapSeq = trapSeq.concat([trapA,trapB,trapC]);

            //TODO update tree, set neighbours
          }
          else if (horzSegIntersections.length === 1) {
            var trapA = null;
            var trapB = null;
            var trapC = null;
            var trapD = null;
            var horzSegIntersection = horzSegIntersections[0];

            var extL = new Line(1,0,horzSegIntersection.x);
            var extLIntersection = trap.lineIntersection(extL);
            extLIntersection = _.filter(extLIntersection, function(elem) { return elem.y !== horzSegIntersection.y; })[0];

            if (horzSegIntersection.y < q.y) {
              trapA = new Trapezoid([trap.topEdge[0], horzSegIntersection],
                                        [trap.bottomEdge[0], extLIntersection],
                                        trap.leftP, horzSegIntersection);
              trapB = new Trapezoid([horzSegIntersection, vertExtIntersections[0]],
                                        [horzSegIntersection, q],
                                        horzSegIntersection, q);
              trapC = new Trapezoid([horzSegIntersection, q],
                                        [extLIntersection, vertExtIntersections[1]],
                                        horzSegIntersection, q);


            } else {
              trapA = new Trapezoid([trap.topEdge[0], extLIntersection],
                                        [trap.bottomEdge[0], horzSegIntersection],
                                        trap.leftP, horzSegIntersection, [null,null,null,null], null);
              trapB = new Trapezoid([horzSegIntersection, q],
                                        [horzSegIntersection, vertExtIntersections[1]],
                                        horzSegIntersection, q, [null,null,null,null], null);
              trapC = new Trapezoid([extLIntersection, vertExtIntersections[0]],
                                        [horzSegIntersection, q],
                                        horzSegIntersection, q, [null,null,null,null], null);
            }
            trapD = new Trapezoid([vertExtIntersections[0], trap.topEdge[1]],
                                  [vertExtIntersections[1], trap.bottomEdge[1]],
                                  q, trap.rightP);

            trapSeq = trapSeq.concat([trapA,trapB,trapC,trapD]);
            //TODO update tree, set neighbours
          }
          else
            console.log('the end is NEIGHHHHHHHHHHHHH');
        }
        else { //general case, part of segment lies within trap, but no endpoints lie in trap
          //the segment intersects 2 vertical sides, 1 oblique 1 vert side or 2 oblique sides
          if (vertSegIntersections.length === 2) {
            var trapA = new Trapezoid([trap.topEdge[0],trap.topEdge[1]],
                                      [vertSegIntersections[0], vertSegIntersections[1]],
                                      vertSegIntersections[0], vertSegIntersections[1], [null,null,null,null],null);
            var trapB = new Trapezoid([vertSegIntersections[0], vertSegIntersections[1]],
                                      [trap.bottomEdge[0], trap.bottomEdge[1]],
                                      vertSegIntersections[0], vertSegIntersections[1], [null,null,null,null],null);
            trapSeq = trapSeq.concat([trapA,trapB]);

            //TODO update tree, set neighbours
          }
          else if (vertSegIntersections.length === 1 && horzSegIntersections.length === 1) {
            var vertSegIntersection = vertSegIntersections[0];
            var horzSegIntersection = horzSegIntersections[0];
            var ext = new Line(1,0,horzSegIntersection.x);
            var vertExtIntersection = trap.lineIntersection(ext);
            vertExtIntersections = _.filter(vertExtIntersections, function(elem) { return elem.y !== horzSegIntersection.y; })[0];

            var trapA = null;
            var trapB = null; //triangular trap
            var trapC = null;
            if (horzSegIntersection.x < vertSegIntersection.x && horzSegIntersection.y < vertSegIntersection.y) { //<x <y
              trapA = new Trapezoid([horzSegIntersection, vertSegIntersection],
                                    [vertExtIntersection, trap.bottomEdge[1]],
                                    horzSegIntersection, vertExtIntersection, [null,null,null,null], null);
              trapB = new Trapezoid([horzSegIntersection, trap.topEdge[1]],
                                    [horzSegIntersection,vertSegIntersection],
                                    horzSegIntersection, vertSegIntersection, [null,null,null,null], null);
              trapC = new Trapezoid([trap.topEdge[0], horzSegIntersection],
                                    [trap.bottomEdge[0], vertExtIntersection],
                                    trap.leftP, horzSegIntersection, [null,null,null,null], null);

              //TODO update tree, set neighbours
            }
            else if (horzSegIntersection.x < vertSegIntersection.x && horzSegIntersection.y > vertSegIntersection.y) { //<x >y
              trapA = new Trapezoid([vertExtIntersection, trap.topEdge[1]],
                                    [horzSegIntersection, vertSegIntersection],
                                    horzSegIntersection, vertSegIntersection, [null,null,null,null], null);
              trapB = new Trapezoid([horzSegIntersection, vertSegIntersection],
                                    [horzSegIntersection, trap.bottomEdge[1]],
                                    horzSegIntersection, vertSegIntersection, [null,null,null,null], null);
              trapC = new Trapezoid([trap.topEdge[0], vertExtIntersection]
                                    [trap.bottomEdge[0], horzSegIntersection],
                                    trap.leftP, horzSegIntersection);

              //TODO update tree, set neighbours
            }
              else if (horzSegIntersection.x > vertSegIntersection.x && horzSegIntersection.y < vertSegIntersection.y) { //>x <y
                trapA = new Trapezoid([vertSegIntersection, horzSegIntersection],
                                      [trap.bottomEdge[0], vertExtIntersection],
                                      vertSegIntersection, horzSegIntersection, [null,null,null,null], null);
                trapB = new Trapezoid([trap.topEdge[0], horzSegIntersection],
                                      [vertSegIntersection, horzSegIntersection],
                                      vertSegIntersection, horzSegIntersection, [null,null,null,null], null);
                trapC = new Trapezoid([horzSegIntersection, trap.topEdge[1]],
                                      [vertExtIntersection, trap.bottomEdge[1]],
                                      horzSegIntersection, trap.rightP, [null,null,null,null], null);
              }
                else if (horzSegIntersection.x > vertSegIntersection.x && horzSegIntersection.y > vertSegIntersection.y) { //>x >y
                  trapA = new Trapezoid([trap.topEdge[0], vertExtIntersection],
                                        [vertSegIntersection, horzSegIntersection],
                                        vertSegIntersection, horzSegIntersection, [null,null,null,null], null);
                  trapB = new Trapezoid([vertSegIntersection,horzSegIntersection],
                                        [trap.bottomEdge[0], horzSegIntersection],
                                        vertSegIntersection, horzSegIntersection, [null,null,null,null], null);
                  trapC = new Trapezoid([vertExtIntersection, trap.topEdge[1]],
                                        [horzSegIntersection, trap.bottomEdge[1]],
                                        horzSegIntersection, trap.rightP);

                  //TODO update tree, set neighbours
                }
            trapSeq = trapSeq.concat([trapA,trapB,trapC]);
          }
        }
      }
    }
  }
      /*for (var j=0;j<intersectingTraps.length;j++) {
        console.log(j);
        var intersectionPoints = [];
        var trap = intersectingTraps[j];

        //intersection points
        var segIntersections = trap.segIntersection(segment);
        console.log('seg intersections');
        console.log(segIntersections);
        intersectionPoints = intersectionPoints.concat(segIntersections); //with segments
        for (var k=0;k<segIntersections.length;k++) { //, vertical extensions of segment/trap intersections
          var tsI = segIntersections[k];
          intersectionPoints = intersectionPoints.concat(trap.lineIntersection(new Line(1,0,tsI.x)));

        }
        console.log('vert exts');
        if (locate(trapSearch.root,p).data === trap) { //, vertical extensions of p if it is in trap
          intersectionPoints = intersectionPoints.concat(trap.lineIntersection(ext1));
          console.log('trap/ext1 intersection; ');
          console.log(trap.lineIntersection(ext1));
        }

        if (locate(trapSearch.root,q).data === trap) { //and vertical extensions of q if it is in trap
          console.log([trap.node,q,locate(trap.node,q)]);
          intersectionPoints = intersectionPoints.concat(trap.lineIntersection(ext2));
          console.log('trap/ext2 intersection; ');
          console.log(trap.lineIntersection(ext2));
        }

        intersectionPoints = intersectionPoints.uniqueObjects(["x","y"]);

        console.log('intersection points; ');
        console.log(intersectionPoints);

        //create new traps formed by intersection points
        //each type of intersection generates a pair of intersections that will be joined by a vertical line.
        var newTrapNodes = [];
        intersectionPoints = _.sortBy(intersectionPoints, function(p) { return p.x});
        var leftP = trap.leftP;
        var rightP = null;
        for (var k=0;k<intersectionPoints.length-1;k = k+2) {
          if (j === 0 && k === 0) //first point of first trap
            rightP = p;
          else
            rightP = intersectionPoints[k];

          if (j === intersectingTraps.length-1 && k === intersectionPoints.length - 2) //last point of last trap
            leftP = q;

          console.log('current trap');
          console.log([leftP,rightP,trap]);
          var topEdge = [trap.topEdge[0],lineSegIntersect(new Line(1,0,rightP.x),trap.topEdge)];
          var bottomEdge = [trap.bottomEdge[0],lineSegIntersect(new Line(1,0,rightP.x),trap.bottomEdge)];

          var newTrap = new Trapezoid(topEdge,bottomEdge,leftP,rightP,[null,null,null,null],null);
          var newTrapNode = new Node(newTrap,"leaf",null,null);

          leftP = rightP;
          newTrapNodes.push(newTrapNode);
          console.log('newTrap:');
          console.log([leftP,rightP,topEdge,bottomEdge]);
          trapSeq.push(newTrap);

        }
        //trapSearch = new SearchTree(replaceNode(trapSearch.root,trap.node,makeTree(newTrapNodes)));


        //since we insert intersection points in order, we can loop through with consecutive points as pairs




        allIntersectionPoints = allIntersectionPoints.concat(intersectionPoints);
      }
    }
  }*/

  console.log('returning trap seq: ');
  console.log(trapSeq);
  return [trapSeq,trapSearch, allIntersectionPoints];
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

    if (segSide(trap.rightP,segment) > 0) { //verticallyAbove(trap.rightP, segment)) {
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
