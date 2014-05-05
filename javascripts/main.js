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

function draw(trapLayer, trapSeq, trapSearch, segments, segLayer) {

  for (var i=0;i < segments.length; i++) {
    var segment = segments[i];
    var segmentObj = new Kinetic.Line({
      points: [segment[0].x,segment[0].y,segment[1].x,segment[1].y],
      stroke: 'black'
    });
    segLayer.add(segmentObj);
  }

  var ptObjs = [];
  for (var i=0;i<trapSeq.length;i++) {
    var trap = trapSeq[i];

    var pts = [];
    for (var j=0;j<4;j++) {

      pts.push(trap.points[j]);

      var ptObj = new Kinetic.Circle({
        x: trap.points[j].x,
        y: trap.points[j].y,
        radius: 5,
        fill: 'red',
        stroke: 'black'
      });

      ptObjs.push(ptObj);
    }

    console.log("points:");
    console.log(pts);
    sortCW(pts);
    console.log(pts);

    var ptsFormatted = [];
    for (var j=0;j<pts.length;j++) {
      ptsFormatted.push(pts[j].x);
      ptsFormatted.push(pts[j].y);
    }

    var trapObj = new Kinetic.Line({
      points: ptsFormatted,
      fill: getRandomColor(),
      stroke: 'black',
      closed: true
    });

    console.log(trapObj);
    trapLayer.add(trapObj);
  }
  for (var i=0;i<ptObjs.length;i++) {
    trapLayer.add(ptObjs[i]);
  }


}

$(document).ready(function() {
  console.log('This would be the main JS file.');

  var segment1 = [new Point(300,300), new Point(700,500)];
  var segment2 = [new Point(400,400), new Point(600,50)];
  var segments = [segment1,segment2];

  var trapMap = generateTrapMap(segments);
  var trapSeq = trapMap[0];
  var trapSearch = trapMap[1];
  console.log(trapSeq);

  var stage = new Kinetic.Stage({
    container: 'container',
    width: 800,
    height: 800
  });

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
  draw(trapsLayer, trapSeq, trapSearch, segments, segsLayer);

  stage.add(background);
  stage.add(trapsLayer);
  stage.add(segsLayer);
});
