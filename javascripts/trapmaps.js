console.log('line seg intersect tests');
var line1 = new Line(1,2,3);
var seg1 = [new Point(1,1), new Point(100,100)];
//console.log(lineSegIntersect(line1,seg1));

var line2 = new Line(3,2,1);
//console.log(lineSegIntersect(line2,seg1));

var line3 = new Line(6,8,11);
//console.log(lineSegIntersect(line3,seg1));

function copyTrapArr(array) {
  var arrayCopy = [];
  for (var j=0;j<array.length;j++) {
    var trap = array[j];
    var copy = new Trapezoid(trap.topEdge,trap.bottomEdge,trap.leftP,trap.rightP, trap.neighbours, trap.node);
    arrayCopy.push(copy);
  }
  return arrayCopy;
}
/*function generateTrapMap2(segments) {
  var bbox = new Trapezoid( [new Point(0,0), new Point(800,0)],
                            [new Point(1,800), new Point(801,800)],
                             new Point(0,0),
                             new Point(801,800), [null,null,null,null], null);
  var trapSeq = [bbox];
  var trapSearch = new SearchTree(null);
  var bboxNode = new Node(bbox,'leaf',null,null);
  bbox.node = bboxNode;

  trapSearch.root = bboxNode;

  var trapHistory = []; //[[trapSeq,trapSearch]];
  for (var i=0;i<segments.length;i++) {
    var seg = segments[i];
    var p = seg[0];
    var q = seg[1];
    var intersectingTraps = followSegment(trapSeq, trapSearch, seg);

    //remove intersecting traps from seq
    for (var j=0;j<trapSeq.length;j++) {
      for (var k=0;k<intersectingTraps.length;k++) {
        if (_.isEqual(intersectingTraps[k], trapSeq[j])) {
          trapSeq.splice(j,1);
        }
      }
    }

    trapHistory.push([copyTrapArr(trapSeq), trapSearch, copyTrapArr(intersectingTraps)]);

    if (intersectingTraps.length === 1) {
      var trap = intersectingTraps[0];
      var trapA = new Trapezoid(trap.topEdge, trap.bottomEdge, trap.leftP, p); //1
      var trapB = new Trapezoid(trap.topEdge, trap.bottomEdge, q, trap.rightP); //4
      var trapC = new Trapezoid(trap.topEdge, seg, p, q); //2
      var trapD = new Trapezoid(seg, trap.bottomEdge, p, q); //3

      trapA.setUpperLeft(trap.upperLeft());
      trapA.setUpperRight(trapC);
      trapA.setLowerLeft(trap.lowerLeft());
      trapA.setLowerRight(trapD);

      trapB.setUpperLeft(trapC);
      trapB.setUpperRight(trap.upperRight());
      trapB.setLowerLeft(trapD);
      trapB.setLowerRight(trap.lowerRight());

      trapC.setUpperLeft(trapA);
      trapC.setUpperRight(trapB);
      trapC.setLowerLeft(trapA);
      trapC.setLowerRight(trapB);

      trapD.setUpperLeft(trapA);
      trapD.setUpperRight(trapB);
      trapD.setLowerLeft(trapA);
      trapD.setLowerRight(trapB);

      var trapANode = new Node(trapA,'leaf',null,null);
      var trapBNode = new Node(trapB,'leaf',null,null);
      var trapCNode = new Node(trapC,'leaf',null,null);
      var trapDNode = new Node(trapD,'leaf',null,null);

      trapA.node = trapANode;
      trapB.node = trapBNode;
      trapC.node = trapCNode;
      trapD.node = trapDNode;

      trapSeq.push(trapA);
      trapSeq.push(trapB);
      trapSeq.push(trapC);
      trapSeq.push(trapD);

      var yNode = new Node(seg, 'y', trapCNode, trapDNode);
      var xNode2 = new Node(q,'x', yNode, trapBNode);
      var xNode1 = new Node(p, 'x', trapANode, xNode2);
      trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, xNode1));
    }
    else { //more than 1 intersecting trap
      var newTraps = []
      var prevUpper = null;
      var prevLower = null;

      for (var j=0;j<intersectingTraps.length;j++) {
        var trap = intersectingTraps[j];
        if (j === 0) { //trap containing P
          var trapA = new Trapezoid(trap.topEdge,trap.bottomEdge,trap.leftP,p);
          var trapB = new Trapezoid(trap.topEdge, seg, p, trap.rightP);
          var trapC = new Trapezoid(seg, trap.bottomEdge, p, trap.rightP);

          trapA.setUpperLeft(trap.upperLeft());
          trapA.setUpperRight(trapB);
          trapA.setLowerLeft(trap.lowerLeft());
          trapA.setLowerRight(trapC);

          trapB.setUpperLeft(trapA);
          trapB.setUpperRight(null);
          trapB.setLowerLeft(trapA);
          trapB.setLowerRight(null);

          trapC.setUpperLeft(trapA);
          trapC.setUpperRight(null);
          trapC.setLowerLeft(trapA);
          trapC.setLowerRight(null);

          trapSeq.push(trapA);
          trapSeq.push(trapB);
          trapSeq.push(trapC);

          trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, makeTree([trapB,trapC, trapA])));
        }
        else if (j === intersectingTraps.length - 1) { //trap containing q

          var segTrapIntersect = trap.segIntersectionUnfiltered(seg);
          var intersectsVerticalSide = segTrapIntersect[2] != null || segTrapIntersect[3] != null;
          var intersectsObliqueSide = segTrapIntersect[0] != null || segTrapIntersect[1] != null;

          if (intersectsVerticalSide && intersectsObliqueSide)
            throw "WHAT WHAT IN THE BUTT";

          var trapA = null;
          var trapB = null;
          var trapC = null;
          var trapD = null;
          if (intersectsVerticalSide) {
            trapB = new Trapezoid(trap.topEdge, seg, trap.leftP, q);
            trapC = new Trapezoid(seg, trap.bottomEdge, trap.leftP, q);
            trapD = new Trapezoid(trap.topEdge, trap.bottomEdge, q, trap.rightP);
          } else if (intersectsObliqueSide) {
            trap
          }

          trapB.setUpperLeft(prevUpper);
          trapB.setUpperRight(trapD);
          trapB.setLowerLeft(prevUpper);
          trapB.setLowerRight(trapD);

          trapC.setUpperLeft(prevUpper);
          trapC.setLowerLeft(prevLower);
          trapC.setUpperRight(trapD);
          trapC.setLowerRight(trapD);

          trapD.setNeighbours(trapB, trap.upperRight(), trapC, trap.lowerRight());

          trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, makeTree([trapB,trapC, trapD])));
        }
        else { //general trap

        }
      }
    }
  }
  trapHistory.push([copyTrapArr(trapSeq), trapSearch, copyTrapArr(intersectingTraps)]);

  return [trapSeq,trapSearch,[],trapHistory];
}*/
//generate a trapezoidal map, and a structure supporting point location queries
//input: segments
//output: trap sequence and trap search tree
//SEGMENTS MUST BE ORIENTED LEFT TO RIGHT (SORTED BY X)
function generateTrapMap(segments) {
  var bbox = new Trapezoid( [new Point(0,0), new Point(800,0)],
                            [new Point(1,800), new Point(801,800)],
                             new Point(0,0),
                             new Point(801,800), [null,null,null,null], null);
  var trapSeq = [bbox];
  var trapSearch = new SearchTree(null);
  var bboxNode = new Node(bbox,'leaf',null,null);
  bbox.node = bboxNode;

  trapSearch.root = bboxNode;

  var trapHistory = []; //[[trapSeq,trapSearch]];

  var segs = segments; //shuffle(segments); TODO put randomization back in
    console.log('trapSeq2');
  console.log(trapSeq);

  for (var i=0;i<segs.length;i++) {

    console.log('<------STATUS-------->');
    console.log([i,segs[i],trapSearch,trapSeq]);
    var segment = segs[i];
    var p = segment[0];
    var q = segment[1];

    var intersectingTraps = followSegment2(trapSeq, trapSearch, segment);
    console.log('the intesrecasd');
    console.log(intersectingTraps);
    console.log(trapSearch);

    var trapSeqCopy = [];
    var trapSearchCopy = trapSearch;
    for (var j=0;j<trapSeq.length;j++) {
      var trap = trapSeq[j];
      var copy = new Trapezoid(trap.topEdge,trap.bottomEdge,trap.leftP,trap.rightP, trap.neighbours, trap.node);
      trapSeqCopy.push(copy);
    }
    var intersectingTrapsCopy = [];
    for (var j=0;j<intersectingTraps.length;j++) {
      var trap = intersectingTraps[j];
      var copy = new Trapezoid(trap.topEdge,trap.bottomEdge,trap.leftP,trap.rightP, trap.neighbours, trap.node);
      intersectingTrapsCopy.push(copy);
    }
    trapHistory.push([trapSeqCopy,trapSearchCopy, intersectingTrapsCopy]);

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
      trap3.setUpperRight(trap2);
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

      /*trap1.node = trap1Node;
      trap2.node = trap2Node;
      trap3.node = trap3Node;
      trap4.node = trap4Node;

      trapSeq.push(trap1);
      trapSeq.push(trap2);
      trapSeq.push(trap3);
      trapSeq.push(trap4);

      var segment2 = [new Point(0,0), new Point(1, 1)];

      console.log('the ynode segment');
      console.log(segment);
			console.log([trap2Node,trap3Node]);*/

      var yNode = new Node(segment,'y', trap2Node, trap3Node);
      //yNode.stored = segment;
      console.log('ynode');
      console.log([yNode,trap2Node,trap3Node]);
      var xNode2 = new Node(q,'x', yNode, trap4Node);
      console.log('xnode2');
      console.log(xNode2);
      var xNode1 = new Node(p, 'x', trap1Node, xNode2);
      console.log('xnode1 before replace');
      console.log(xNode1)
      trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, xNode1));
      console.log('1 intersecting trap first case');
      console.log([trapSeq,trapSearch, xNode1, trap1Node]);

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

            var ABCTree = makeTree([trapB,trapC,trapA]);
            console.log("ABC Tree");
            console.log(ABCTree);
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
            trapA.setUpperLeft(trap.upperLeft());
            trapA.setLowerLeft(trap.lowerLeft());

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
              trapB.setUpperRight(null);
              trapB.setLowerLeft(null);
              trapB.setLowerRight(trapC);

              trapC.setLowerRight(trapD);
              trapC.setUpperRight(trapB);
              trapC.setLowerLeft(trapA);
              trapC.setUpperLeft(null);

              trapD.setUpperRight(trap.upperRight());
              trapD.setLowerRight(trap.lowerRight());
              trapD.setUpperLeft(null);
              trapD.setLowerLeft(trapC);
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
              trapB.setUpperRight(trapC);
              trapB.setUpperLeft(null);
              trapB.setLowerRight(trap.lowerRight());

              trapC.setUpperRight(trapD);
              trapC.setLowerRight(trapB);
              trapC.setUpperLeft(trapA);
              trapC.setLowerLeft(null);

              trapD.setUpperLeft(trapC);
              trapD.setUpperRight(trap.upperRight());
              trapD.setLowerLeft(null);
              trapD.setUpperLeft(trapC);
            }
            var node1 = makeTree([trapB,trapC,trapA]);
            var node2 = new Node(trapD,"leaf",null,null);
            var newRoot = null;
            if (trapB.leftP.x > trapB.rightP.x)
              newRoot = new Node(trapB.leftP,'x',node1,node2);
            else
              newRoot = new Node(trapB.rightP,'x',node1,node2)

              console.log('new tree for trap containing p: ');
            console.log(newRoot);
            //var newRoot = new Node(Math.max(trapB.leftP.x, trapB.rightP.x), 'x', node1,node2);
            console.log('trapsearch');
            console.log(trapSearch);
            trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, newRoot));
            console.log('search tree after p case');
            console.log(trapSearch);

            trapSeq = trapSeq.concat([trapA,trapB,trapC,trapD]);
          } else {
            console.log('the fury cometh');
          }
        }
        else if (j === intersectingTraps.length - 1) { //trap containing q
          console.log('trap containing q:');
          console.log(trap);
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

            //trapA.setNeighbours(trap.Upper)

            trapA.setUpperLeft(trap.upperLeft());
            trapA.setUpperRight(trapC);
            trapA.setLowerLeft(null);
            trapA.setLowerRight(trapB);

            trapB.setUpperRight(trapA);
            trapB.setLowerRight(trapC);
            trapB.setLowerLeft(null);
            trapB.setUpperLeft(null);

            trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, makeTree([trapA,trapB,trapC])));
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

            console.log('trapA');
            console.log(trapA);
            trapSeq = trapSeq.concat([trapA, trapB, trapC, trapD]);

            var trapANode = new Node(trapA, "leaf",null,null);
            var trapABCTree = makeTree([trapB,trapC,trapD]);
            var xNode1 = new Node(horzSegIntersection, 'x', trapANode, trapABCTree);
            trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, xNode1));
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

        intersectionPoints = intersectionPoints.(["x","y"]);

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
  var trapSeqCopy = [];
  for (var j=0;j<trapSeq.length;j++) {
      var trap = trapSeq[j];
      var copy = new Trapezoid(trap.topEdge,trap.bottomEdge,trap.leftP,trap.rightP, trap.neighbours, trap.node);
      trapSeqCopy.push(copy);
  }
  var trapSearchCopy = $.extend(true, {}, trapSearch)
  var intersectingTrapsCopy = [];
  for (var j=0;j<intersectingTraps.length;j++) {
      var trap = intersectingTraps[j];
      var copy = new Trapezoid(trap.topEdge,trap.bottomEdge,trap.leftP,trap.rightP, trap.neighbours, trap.node);
      intersectingTrapsCopy.push(copy);
  }
  trapHistory.push([trapSeqCopy,trapSearchCopy, intersectingTrapsCopy]);
  console.log('returning trapmap');
  console.log(trapHistory);
  return [trapSeq,trapSearch, allIntersectionPoints, trapHistory];
}

/*function followSegment2(trapSeq,trapSearch,segment) {
  var p = segment[0];
  var q = segment[1];
  var trapSequence = new Array();
  var loc = locate(trapSearch.root, p);
  var leftTrap = loc.data;
  leftTrap.node = loc;

  trapSequence.push(leftTrap);

  var trap = trapSequence[0];

  //sort trap seq by x then y increasing (top left to bottom right)
  while(segSide(q,trap.topEdge) < 0 || q.x > trap.rightP.x) {


  }

}*/

function followSegment2(trapSeq, trapSearch, segment) {
  var p = segment[0];
  var q = segment[1];
  var seg = new ParametricSegment(p,q);
  var samplePoints = 100; //increase to increase accuracy

  var trapSequence = new Array();
  var leftNode = locate(trapSearch.root, p);
  var leftTrap = leftNode.stored;

  trapSequence[0] = leftTrap;
  var ti = 0;
  var prevTrap = trapSequence[ti];

  console.log('seg:');
  console.log(seg);
  for (var i=1;i<=samplePoints;i++) {
    var t = i/samplePoints;
    var segPoint = seg.evaluate(t);
    //console.log('segPoint')
    var currentTrap = locate(trapSearch.root,seg.evaluate(t)).stored;
    if (!currentTrap.trapEquals(prevTrap)) {
      console.log('follow trap changed : ' + i + ", " + t);
      console.log(segPoint);
      trapSequence[++ti] = currentTrap;
      prevTrap = currentTrap;
    }
  }
  console.log('follow trap2 returning: ');
  console.log(trapSequence);
  return trapSequence;
}


//assuming trapSeq is sorted with arrow from topleft to downright, down first
//go down, then right
//returns sequence of traps intersecting segment, sorted left to right
function followSegment(trapSeq, trapSearch, segment) {
  p = segment[0];
  q = segment[1];


  var trapSequence = new Array();
  var loc = locate(trapSearch.root, p);
  var leftTrap = loc.data;
  leftTrap.node = loc;
  trapSequence[0] = leftTrap; //TODO will not work if p is already present (pg 130)

  console.log('p lies in:')
  console.log(leftTrap);
  console.log(trapSequence);

  var i = 0;
  var trap = trapSequence[0];

  console.log('follow seg');
  console.log([segment,trapSearch,loc, segSide(trap.rightP, segment)]);

  while (segSide(q,trap.topEdge) < 0 || q.x > trap.rightP.x) {

    if (segSide(trap.rightP,segment) > 0) { //verticallyAbove(trap.rightP, segment)) {
      trap = trap.upperRight();
      console.log('upper right');
    } else {
      trap = trap.lowerRight();
      console.log('lower right');
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
