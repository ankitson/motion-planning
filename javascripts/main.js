function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function sortCW(points) {

  if (points.length === 0)
    return [];

  var highestPoint = points[0];
  for (var i=1;i<points.length;i++) {
    if (points[i].y > highestPoint.y)
      highestPoint = points[i];
    if (points[i].y == highestPoint.y && points[i].x < highestPoint.x)
      highestPoint = points[i];
  }

  points.sort(function(point1,point2) {
    if (point1 === highestPoint)
      return -1;
    if (point2 === highestPoint)
      return 1;

    //x coords cannot be equal by general position assumption
    var m1 = (highestPoint.y - point1.y) / (highestPoint.x - point1.x);
    var m2 = (highestPoint.y - point2.y) / (highestPoint.x - point2.x);

    if (m1 <=0 && m2 > 0) return -1;

    if (m1 > 0 && m2 <= 0) return 1;

    return m1 > m2 ? -1 : 1;
  });

}

function drawPoints(layer, points) {
  for (var i=0;i<points.length;i++) {
    var p = points[i];
    console.log('drawing point: ' + p.x + ',' + p.y);
    var ptObj = new Kinetic.Circle({
      x: p.x,
      y: p.y,
      radius: 2,
      fill: 'blue',
      stroke: 'black'
    });
    layer.add(ptObj);
  }
}


function highlightTrap(trap, layer) {
  var pts = trap.toPoints();
  sortCW(pts);

  var ptsFormatted = [];
  for (var j=0;j<pts.length;j++) {
    ptsFormatted.push(pts[j].x);
    ptsFormatted.push(pts[j].y);
  }

  if (window.highlightedTrapObj !== null)
    window.highlightedTrapObj.destroy();
    window.highlightedTrapObj = new Kinetic.Line({
      points: ptsFormatted,
      fill: 'red',
      stroke: 'black',
      closed: true,
      opacity: 1
    });

  layer.clear();
  layer.add(window.highlightedTrapObj);
  layer.draw();
}

function drawTree(node, layer, origin, depth) {
  var xDist = 100 * (6 - depth)/2;
  var yDist = 50 * (6 - depth)/2;
  if (node === null)
    return layer;

  var leftLayer = drawTree(node.left, layer, new Point(origin.x - xDist, origin.y + yDist), depth+1);
  var leftRightLayer = drawTree(node.right, leftLayer, new Point(origin.x + xDist, origin.y + yDist), depth+1);

  var edge1 = new Kinetic.Line({
    points: [origin.x,origin.y,origin.x - xDist, origin.y + yDist],
    stroke: 'black',
    strokeWidth: 1
  });

  var edge2 = new Kinetic.Line({
    points: [origin.x,origin.y,origin.x + xDist, origin.y + yDist],
    stroke: 'black',
    strokeWidth: 1
  });

  var nodeObj = new Kinetic.Circle({
    x: origin.x,
    y: origin.y,
    radius: 10,
    fill: 'red',
    opacity: 0.5
  });


  var label = '';
  if (node.type === 'leaf') {
    nodeObj.corrTrap = node.stored;
    nodeObj.on('mouseover', function() {
      highlightTrap(nodeObj.corrTrap, layer);
    });

    label = 'leaf';
  }
  if (node.type === 'y') {
    var x1 = Math.round(node.stored[0].x);
    var x2 = Math.round(node.stored[1].x);
    var y1 = Math.round(node.stored[0].y);
    var y2 = Math.round(node.stored[1].y);
    label = "(" + x1 + "," + y1 + ") \n (" + x2 + "," + y2 + ")";
  }
  if (node.type === 'x') {
    label = Math.round(node.stored.x).toString();
  }

  var nodeLabel = new Kinetic.Text({
    x: nodeObj.getX(),
    y: nodeObj.getY(),
    text: label,
    fontSize: 15,
    fontFamily: 'Calibri',
    fill: 'black',
		align: 'center'
  });

  leftRightLayer.add(nodeObj);
  leftRightLayer.add(nodeLabel);

  if (node.left !== null)
    leftRightLayer.add(edge1);
  if (node.right !== null)
    leftRightLayer.add(edge2);

  return leftRightLayer;
}

function drawTree2(node, graph, id) {
	if (node === null)
		return [graph,id];

	var leftTree = drawTree2(node.left,graph, id+1);
	var leftGraph = leftTree[0];
	var leftNodeID = leftTree[1];

	var leftRightTree = drawTree2(node.right, graph, id+1000);
	var lrGraph = leftRightTree[0];
	var lrNodeID = leftRightTree[1];

	var label = '';
  if (node.type === 'leaf') {
    /*nodeObj.corrTrap = node.stored;
    nodeObj.on('mouseover', function() {
      highlightTrap(nodeObj.corrTrap, layer);
    });*/

    label = 'leaf';
  }
  if (node.type === 'y') {
    var x1 = Math.round(node.stored[0].x);
    var x2 = Math.round(node.stored[1].x);
    var y1 = Math.round(node.stored[0].y);
    var y2 = Math.round(node.stored[1].y);
    label = "(" + x1 + "," + y1 + ") \n (" + x2 + "," + y2 + ")";
  }
  if (node.type === 'x') {
    label = Math.round(node.stored.x).toString();
  }

	console.log([node,graph,id,leftNodeID,lrNodeID]);
	graph.addNode(id.toString(), { label: label, fill: "#fff"});
	var color = getRandomColor();
	graph.addEdge(id.toString(), leftNodeID.toString(), { stroke: '#333', fill: color});
	graph.addEdge(id.toString(), lrNodeID.toString(), {stroke: color, fill: color});

	return [graph,id];
}

function draw(trapLayer, trapSeq, trapSearch, segments, segLayer, intersectingTraps) {
  var trapsToObjs = {}
  for (var i=0;i < segments.length; i++) {
    var segment = segments[i];
    var segmentObj = new Kinetic.Line({
      points: [segment[0].x,segment[0].y,segment[1].x,segment[1].y],
      stroke: 'black'
    });
    segLayer.add(segmentObj);
  }

  var ptObjs = [];
  for (var i=0;i<trapSeq.length;i++) { //create traps,point objs. render traps
    var trap = trapSeq[i];
    var trapPoints = trap.toPoints();
    var pts = [];
    for (var j=0;j<4;j++) {

      pts.push(trapPoints[j]);

      var ptObj = new Kinetic.Circle({
        x: trapPoints[j].x,
        y: trapPoints[j].y,
        radius: 2,
        fill: 'red',
        stroke: 'black'
      });

      ptObjs.push(ptObj);
    }

    sortCW(pts);

    var ptsFormatted = [];
    for (var j=0;j<pts.length;j++) {
      ptsFormatted.push(pts[j].x);
      ptsFormatted.push(pts[j].y);
    }

    var trapObj = new Kinetic.Line({
      points: ptsFormatted,
      fill: getRandomColor(),
      stroke: 'black',
      closed: true,
      opacity: 0.5
    });

    if (_.find(intersectingTraps,function (elem) {
      return (elem.topEdge === trap.topEdge &&
              elem.bottomEdge === trap.bottomEdge &&
              elem.leftP === trap.leftP &&
              elem.rightP === trap.rightP);})) {
      trapObj.stroke('red');
      trapObj.strokeWidth(10);
      trapObj.strokeAlpha(1);
    }


    trapLayer.add(trapObj);
    /*trapObj.originalFill = trapObj.getFill();
    trapObj.originalOpacity = trapObj.getOpacity();
    trapObj.on('mouseover touchstart', function() {
      this.fill('red');
      this.opacity(1);
      trapLayer.draw();
    });
    trapObj.on('mouseout touchend', function() {
      this.opacity(this.originalOpacity);
      this.fill(this.originalFill);
      trapLayer.draw();
    });*/
    trapsToObjs[trap] = trapObj;
  }
  for (var i=0;i<ptObjs.length;i++) {
    trapLayer.add(ptObjs[i]);
  }
  return trapsToObjs;
}


$(document).ready(function() {
  console.log('This would be the main JS file.');

  var segment1 = [new Point(300,300), new Point(700,500)];
  var segment2 = [new Point(400,400), new Point(600,50)];
  var segment3 = [new Point(0,0), new Point(380,600)];
  var segment4 = [new Point(1,1), new Point(300,600)];
  var segment5 = [new Point(340,400), new Point(370,270)];
  var segment6 = [new Point(380,390), new Point(407,369)];
  var segments = [];
  segments = segments.concat([segment1]);
  //segments = segments.concat([segment2]);
  //segments = segments.concat([segment3]);
  //segments = segments.concat([segment4]);
  segments = segments.concat([segment5]);
	segments = segments.concat([segment2]);
  //segments = segments.concat([segment6]);

  var square = [[new Point(50,50), new Point(50,450)], [new Point(50,50), new Point(450,50)],
                [new Point(50,450), new Point(450,450)], [new Point(450,50), new Point(450,450)]];

  //segments = square;

  var trapMap = generateTrapMap(segments);
  var trapSeq = trapMap[0];
  var trapSearch = trapMap[1];
  var intersectionPoints = trapMap[2];
  var trapHistory = trapMap[3];

  console.log('generated trap map:');
  console.log(trapMap);

  var stage = new Kinetic.Stage({
    container: 'container',
    width: 2000,
    height: 2000
  });

  var mouseLayer = new Kinetic.Layer();

  var mousePosObject = new Kinetic.Text({
    x: 0,
    y: 0,
    fontFamily: 'Arial',
    fontSize: 12,
    fill: "blue",
    stroke: null,
  })

  mouseLayer.add(mousePosObject);

  var background = new Kinetic.Layer();
  var boundingBox = new Kinetic.Rect({
    x: 0,
    y: 0,
    width: 800,
    height: 800,
    stroke: 'black'
  });
  background.add(boundingBox);

  stage.add(background);
  stage.add(mouseLayer);

  console.log('history');
  console.log(trapHistory);

  $('#historySlider').attr('min', 1);
  $('#historySlider').attr('max', trapHistory.length);
  $('#historySlider').attr('step', 1);
  $('#historySlider').val(trapHistory.length);
  var trapLayer = new Kinetic.Layer();
  var segLayer = new Kinetic.Layer();
  var treeLayer = drawTree(trapSearch.root,new Kinetic.Layer(), new Point(1000,800), 0);
  var trapsToObjs = draw(trapLayer,trapHistory[trapHistory.length-1][0], trapHistory[trapHistory.length-1][1], segments, segLayer);
  stage.add(trapLayer);
  stage.add(segLayer);
  stage.add(treeLayer);

  var index = trapHistory.length - 1;
  $('#historySlider').change(function() {
    index = $(this).val()-1;
    trapLayer.remove();
    segLayer.remove();
    trapLayer = new Kinetic.Layer();
    segLayer = new Kinetic.Layer();

    trapsToObjs = draw(trapLayer,trapHistory[index][0], trapHistory[index][1], _.take(segments,index+1), segLayer, trapHistory[index][2]);
    stage.add(trapLayer);
    stage.add(segLayer);

    treeLayer.remove();
    treeLayer = drawTree(trapHistory[index][1], treeLayer, new Point(1000,200));
    stage.add(treeLayer);
  });


  window.highlightedTrapObj = null;


  $(stage.getContent()).on('mousemove', function (event) {
    var mousePos = stage.getPointerPosition();
    var mouseX = parseInt(mousePos.x);
    var mouseY = parseInt(mousePos.y);
    mousePosObject.x = mouseX;
    mousePosObject.y = mouseY;
    mousePosObject.setText(mouseX+","+mouseY);
    mouseLayer.draw();



    var mousePoint = new Point(mouseX,mouseY);
    var mouseTrap = locate(trapHistory[index][1].root,mousePoint).stored;

    highlightTrap(mouseTrap,trapLayer);

  });

	var treeGraph = drawTree2(trapSearch.root, new Graph(), 1)[0];
	console.log('tree graph');
	console.log(treeGraph);
	//var layouter = new Graph.Layout.Spring(treeGraph);
	//layouter.layout();
	//var renderer = new Graph.Renderer.Raphael('tree', treeGraph, 400,400);
	//renderer.draw();

  console.log('NODE TEST');
  var node1 = new Node(null, "leaf", null, null);
      console.log('node1');
      console.log(node1);
      var yNode = new Node([new Point(0,0), new Point(1,1)], 'y', null, null);
      console.log('trap 1 node');
      console.log(node1);
      var xNode2 = new Node(new Point(2,2),'x', yNode, null);
            console.log('trap 1 node');
      console.log(node1);
      var xNode1 = new Node(new Point(3,3), 'x', node1, xNode2);
      console.log('trap 1 node');
      console.log(node1);
      console.log('xnode1 before replace');
  console.log(xNode1);

  var seg = [new Point(0,0), new Point(1,1)];
  var leafNode = new Node(trapSeq[0], 'leaf', null, null);
  var yNodeTest = new Node(seg, 'y', leafNode, null);
  console.log(yNodeTest);

});



