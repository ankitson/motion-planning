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

//generate a trapezoidal map, and a structure supporting point location queries
//input: segments
//output: trap sequence and trap search tree
//SEGMENTS MUST BE ORIENTED LEFT TO RIGHT (SORTED BY X)
function generateTrapMap(segments) {
  var bbox = new Trapezoid( [new Point(0,0), new Point(800,0)],
                            [new Point(1,800), new Point(801,800)],
                             new Point(0,0),
                             new Point(800,800), [null,null,null,null], null);
  var trapSeq = [bbox];
  var trapSearch = new SearchTree(null);
  var bboxNode = new Node(bbox,'leaf',null,null);
  bbox.node = bboxNode;

  trapSearch.root = bboxNode;

  var trapHistory = [];

  var segs = _.shuffle(segments); //shuffle(segments); //TODO put randomization back in

  for (var i=0;i<segs.length;i++) {

    console.log('<------STATUS-------->');
    console.log([i,segs[i],trapSearch,trapSeq]);
    var segment = segs[i];
    var p = segment[0];
    var q = segment[1];

    var intersectingTraps = followSegment2(trapSeq, trapSearch, segment);

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
		console.log('after remove');
		console.log(trapSeq);

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

			console.log('before that trapseq');
			//console.log([trapSeq,trap1,trap2,trap3,trap4]);
			console.log(trapSeq[3]);

      var yNode = new Node(segment,'y', trap2Node, trap3Node);
      var xNode2 = new Node(q,'x', yNode, trap4Node);
      var xNode1 = new Node(p, 'x', trap1Node, xNode2);

			trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node,xNode1));
      console.log('1 intersecting trap first case');
      console.log([trapSeq,trapSearch, trap, findParent(trapSearch.root,trap.node), xNode1, trap1Node]);

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
				console.log('seg intersections:');
				console.log(segIntersections);

        var horzSegIntersections = _.first(segIntersections, 2);
        var vertSegIntersections = _.rest(segIntersections,2);
        horzSegIntersections = _.filter(horzSegIntersections, function(elem) { return (elem !== null);});
        vertSegIntersections = _.filter(vertSegIntersections, function(elem) { return (elem !== null);});
        horzSegIntersections = _.sortBy(horzSegIntersections, ['x','y']);
        vertSegIntersections = _.sortBy(vertSegIntersections, ['x','y']);

				console.log('horz seg/vert seg intersects');
				console.log([horzSegIntersections,vertSegIntersections]);

        if (j === 0) { //trap containing p
          var vertExt = new Line(1,0,p.x);
          var vertExtIntersections = trap.lineIntersection(vertExt);
          vertExtIntersections.sort(function(p1,p2) { return p1.y - p2.y});

          //the seg can intersect either a vertical side of trap or an oblique side
          if (vertSegIntersections.length === 1) { //vert side
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
            trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, makeTree([trapB,trapC, trapA])));
          } else if (horzSegIntersections.length === 1) {
            var horzSegIntersection = horzSegIntersections[0];
            var extL = new Line(1,0,p.x);
            var extR = new Line(1,0,horzSegIntersections[0].x);
            var extRIntersection = trap.lineIntersection(extR);
            extRIntersection = _.filter(extRIntersection, function(elem) { return (elem.y !== horzSegIntersection.y); })[0];

            var trapA = new Trapezoid([trap.topEdge[0],vertExtIntersections[0]],
                                      [trap.bottomEdge[0], vertExtIntersections[1]],
                                      trap.leftP, p, [null,null,null,null], null);

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
            }
            var node1 = makeTree([trapB,trapC,trapA]);
            var node2 = new Node(trapD,"leaf",null,null);
						trapD.node = node2;
            var newRoot = null;
            if (trapB.leftP.x > trapB.rightP.x)
              newRoot = new Node(trapB.leftP,'x',node1,node2);
            else
              newRoot = new Node(trapB.rightP,'x',node1,node2)

            trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, newRoot));
						console.log('p intersects 1 horz seg');
						console.log([node1,node2,newRoot, trapSearch]);
            trapSeq = trapSeq.concat([trapA,trapB,trapC,trapD]);
          } else {
            console.log('the fury cometh');
          }
        }
        else if (j === intersectingTraps.length - 1) { //trap containing q
					console.log('trap containing q');
          var vertExt = new Line(1,0,q.x);
          var vertExtIntersections = trap.lineIntersection(vertExt);
          vertExtIntersections.sort(function(p1,p2) { return p1.y - p2.y});

          if (vertSegIntersections.length === 1) {
						console.log('1 vert intersection');
						console.log(vertSegIntersections[0]);
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

            trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, makeTree([trapA,trapB,trapC])));
            //TODO update tree, set neighbours
          }
          else if (horzSegIntersections.length === 1) {
						console.log('1 horz intersection');
            var trapA = null;
            var trapB = null;
            var trapC = null;
            var trapD = null;
            var horzSegIntersection = horzSegIntersections[0];

            var extL = new Line(1,0,horzSegIntersection.x);

            var extLIntersection = trap.lineIntersection(extL);
						console.log('extL intersection:')
						console.log([extLIntersection,horzSegIntersection]);
						console.log('after iflter');
						console.log(_.filter(extLIntersection, function(elem) { return Math.abs(elem.y - horzSegIntersection.y) > 0.001; }));
            extLIntersection = _.filter(extLIntersection, function(elem) { return Math.abs(elem.y - horzSegIntersection.y) > 0.001; })[0];//[0];




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

            console.log('traps for 1 horz inter');
            console.log([trap,trapA,trapB,trapC,trapD]);
            trapSeq = trapSeq.concat([trapA, trapB, trapC, trapD]);
            var trapANode = new Node(trapA, "leaf",null,null);
						trapA.node = trapANode;
            var trapABCTree = makeTree([trapB,trapC,trapD]);
            var xNode1 = new Node(horzSegIntersection, 'x', trapANode, trapABCTree);
            trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, xNode1));
          }
          else {
            console.log('the end is NEIGHHHHHHHHHHHHH');
						console.log([vertSegIntersections,horzSegIntersections]);
					}
        }
        else { //general case, part of segment lies within trap, but no endpoints lie in trap
          //the segment intersects 2 vertical sides, 1 oblique 1 vert side or 2 oblique sides
					console.log("IN GENERAL CASE");
					console.log(trap);
          if (vertSegIntersections.length === 2) {
						console.log('2 vert intersects');
						console.log(vertSegIntersections);
            var trapA = new Trapezoid([trap.topEdge[0],trap.topEdge[1]],
                                      [vertSegIntersections[0], vertSegIntersections[1]],
                                      vertSegIntersections[0], vertSegIntersections[1], [null,null,null,null],null);
            var trapB = new Trapezoid([vertSegIntersections[0], vertSegIntersections[1]],
                                      [trap.bottomEdge[0], trap.bottomEdge[1]],
                                      vertSegIntersections[0], vertSegIntersections[1], [null,null,null,null],null);
            trapSeq = trapSeq.concat([trapA,trapB]);

						console.log('trapA,trapB:');
						console.log([trapA,trapB]);
						var trapANode = new Node(trapA, "leaf", null, null);
						var trapBNode = new Node(trapB, "leaf", null, null);
						trapA.node = trapANode;
						trapB.node = trapBNode;
						var newRoot = new Node(segment, 'y', trapANode, trapBNode);
						trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, newRoot));
            //TODO update tree, set neighbours
          }
          else if (vertSegIntersections.length === 1 && horzSegIntersections.length === 1) {
						console.log('1 vert 1 horz intscn');
            var vertSegIntersection = vertSegIntersections[0];
            var horzSegIntersection = horzSegIntersections[0];
            var ext = new Line(1,0,horzSegIntersection.x);
            var vertExtIntersections = trap.lineIntersection(ext);
						console.log('vert ext interscsctions');
						console.log(vertExtIntersections);
						console.log('horzSegIntersection');
						console.log(vertExtIntersections[0].y - horzSegIntersection.y);
            vertExtIntersections = _.filter(vertExtIntersections, function(elem) { return Math.abs(elem.y - horzSegIntersection.y) > 0.001; });
						console.log('after filter vet ext');
						console.log(vertExtIntersections);
						var vertExtIntersection = vertExtIntersections[0];

            var trapA = null;
            var trapB = null; //triangular trap
            var trapC = null;
            if (horzSegIntersection.x < vertSegIntersection.x && horzSegIntersection.y < vertSegIntersection.y) { //<x <y
							console.log('<x <y case');
							console.log([horzSegIntersection,vertSegIntersection]);
							console.log(trap);
							trapA = new Trapezoid([horzSegIntersection, vertSegIntersection],
																		[vertExtIntersection, trap.bottomEdge[1]],
																		horzSegIntersection, vertSegIntersection, [null,null,null,null], null);
							trapB = new Trapezoid([horzSegIntersection, trap.topEdge[1]],
																		[horzSegIntersection,vertSegIntersection],
																		horzSegIntersection, vertSegIntersection, [null,null,null,null], null);
							trapC = new Trapezoid([trap.topEdge[0], horzSegIntersection],
																		[trap.bottomEdge[0], vertExtIntersection],
																		trap.leftP, horzSegIntersection, [null,null,null,null], null);
            }
            else if (horzSegIntersection.x < vertSegIntersection.x && horzSegIntersection.y > vertSegIntersection.y) { //<x >y
							console.log('<x >y case');
              trapA = new Trapezoid([vertExtIntersection, trap.topEdge[1]],
                                    [horzSegIntersection, vertSegIntersection],
                                    horzSegIntersection, vertSegIntersection, [null,null,null,null], null);
              trapB = new Trapezoid([horzSegIntersection, vertSegIntersection],
                                    [horzSegIntersection, trap.bottomEdge[1]],
                                    horzSegIntersection, vertSegIntersection, [null,null,null,null], null);
              trapC = new Trapezoid([trap.topEdge[0], vertExtIntersection],
                                    [trap.bottomEdge[0], horzSegIntersection],
                                    trap.leftP, horzSegIntersection, [null,null,null,null], null);
              //TODO update tree, set neighbours
            }
						else if (horzSegIntersection.x > vertSegIntersection.x && horzSegIntersection.y < vertSegIntersection.y) { //>x <y
							console.log('>x <y case');
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
							console.log('>x >y case');
							trapA = new Trapezoid([trap.topEdge[0], vertExtIntersection],
																		[vertSegIntersection, horzSegIntersection],
																		vertSegIntersection, horzSegIntersection, [null,null,null,null], null);
							trapB = new Trapezoid([vertSegIntersection,horzSegIntersection],
																		[trap.bottomEdge[0], horzSegIntersection],
																		vertSegIntersection, horzSegIntersection, [null,null,null,null], null);
							trapC = new Trapezoid([vertExtIntersection, trap.topEdge[1]],
																		[horzSegIntersection, trap.bottomEdge[1]],
																		horzSegIntersection, trap.rightP, [null,null,null,null], null);

							//TODO update tree, set neighbours
						}
						console.log('trap A/B?C');
						console.log([trapA,trapB,trapC]);
						var newRoot = makeTree([trapA,trapB,trapC]);
						console.log('the new root/new traps for 1 horz 1 verti');
						console.log([newRoot,trapA,trapB,trapC]);
						trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, newRoot));
            trapSeq = trapSeq.concat([trapA,trapB,trapC]);
          }
					else if (horzSegIntersections.length === 2) {
						var h1 = horzSegIntersections[0];
						var h2 = horzSegIntersections[1];
						if (h1.x > h2.x) {
							var temp = h1;
							h1 = h2;
							h2 = temp;
						}
						var ext1 = new Line(1,0,h1.x);
						var ext2 = new Line(1,0,h2.x);
						var ext1Intersections = trap.lineIntersection(ext1);
						ext1Intersections = _.filter(ext1Intersections, function(elem) { return Math.abs(elem.y - h1.y) > 0.001; });
						var ext1Intersection = ext1Intersections[0];
						var ext2Intersections = trap.lineIntersection(ext2);
						ext2Intersections = _.filter(ext2Intersections, function(elem) { return Math.abs(elem.y - h2.y) > 0.001; });
						var ext2Intersection = ext2Intersections[0];

						var leftTop = (ext1Intersection.y > h1.y) ? h1 : ext1Intersection;
						var leftBot = (ext1Intersection.y > h1.y) ? ext1Intersection : h1;
						var rightTop = (ext2Intersection.y > h2.y) ? h2 : ext2Intersection;
						var rightBot = (ext2Intersection.y > h2.y) ? ext2Intersection : h2;
						var trapA = new Trapezoid([trap.topEdge[0], leftTop],
																		  [trap.bottomEdge[0], leftBot],
																		  trap.leftP, h1, [null,null,null,null], null);
						var trapB = new Trapezoid([leftTop, h2],
																		  [leftBot, h2],
																		  h1, h2, [null,null,null,null], null);
						var trapC = new Trapezoid([h1, rightTop],
																		  [h1, rightBot],
																		  h1, h2, [null,null,null,null], null);
						var trapD = new Trapezoid([rightTop, trap.topEdge[1]],
																		  [rightBot, trap.bottomEdge[1]],
																		  h2, trap.rightP, [null,null,null,null], null);

						var leftH2Node = makeTree([trapB,trapC,trapA]);
						var rightH2Node = new Node(trapD, "leaf", null, null);
						var newRoot = new Node(h2, "x", leftH2Node, rightH2Node);
						trapSearch = new SearchTree(replaceNode(trapSearch.root, trap.node, newRoot));
						trapSeq = trapSeq.concat([trapA,trapB,trapC]);
					}
        }
      }
    }

  }
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
  console.log(trapSeq);
  return [trapSeq,trapSearch, allIntersectionPoints, trapHistory, segs];
}

function followSegment3(trapSeq, trapSearch, segment) {

}
function followSegment2(trapSeq, trapSearch, segment) {
  var p = segment[0];
  var q = segment[1];
  var seg = new ParametricSegment(p,q);
  var samplePoints = 1000; //increase to increase accuracy

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
