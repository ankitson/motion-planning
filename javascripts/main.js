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

function draw(trapLayer, trapSeq, trapSearch, segments, segLayer) {
  var trapsToObjs = {};
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
        radius: 5,
        fill: 'red',
        stroke: 'black',
        text: 'bana'
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

    trapLayer.add(trapObj);
    trapObj.originalFill = trapObj.getFill();
    trapObj.originalOpacity = trapObj.getOpacity;
    trapObj.on('mouseover touchstart', function() {
      this.fill('red');
      this.opacity(1);
      trapLayer.draw();
    });
    trapObj.on('mouseout touchend', function() {
      this.opacity(this.originalOpacity);
      this.fill(this.originalFill);
      trapLayer.draw();
    })
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
  var segments = [];
  segments = segments.concat([segment1]);
  segments = segments.concat([segment2]);
  //segments = segments.concat([segment3]);
  //segments = segments.concat([segment4]);

  var square = [[new Point(50,50), new Point(50,450)], [new Point(50,50), new Point(450,50)],
                [new Point(50,450), new Point(450,450)], [new Point(450,50), new Point(450,450)]];

  //segments = square;

  var trapMap = generateTrapMap(segments);
  var trapSeq = trapMap[0];
  var trapSearch = trapMap[1];
  var intersectionPoints = trapMap[2];

  console.log('generated trap map:');
  console.log(trapMap);

  var stage = new Kinetic.Stage({
    container: 'container',
    width: 800,
    height: 800
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

  var trapsLayer = new Kinetic.Layer();
  var segsLayer = new Kinetic.Layer();
  var trapsToObjs = draw(trapsLayer, trapSeq, trapSearch, segments, segsLayer);
  drawPoints(segsLayer, intersectionPoints);

  $(stage.getContent()).on('mousemove', function (event) {
    var mousePos = stage.getPointerPosition();
    var mouseX = parseInt(mousePos.x);
    var mouseY = parseInt(mousePos.y);
    mousePosObject.x = mouseX;
    mousePosObject.y = mouseY;
    mousePosObject.setText(mouseX+","+mouseY);
    mouseLayer.draw();

//     var mousePoint = new Point(mouseX,mouseY);
//     var mouseTrap = locate(trapSearch.root,mousePoint);
//     trapsToObjs[mouseTrap].fill('black');

//     trapsLayer.draw();
  });

  stage.add(background);
  stage.add(trapsLayer);
  stage.add(segsLayer);
  stage.add(mouseLayer);

  console.log(segSide(new Point(5,3), [new Point(1,1), new Point(5,5)]));

});
