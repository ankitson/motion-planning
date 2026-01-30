from __future__ import division

def inRectangle(p,p1,p2):
    xm,xM = min(p1.x,p2.x), max(p1.x,p2.x)
    ym,yM = min(p1.y,p2.y), max(p1.y,p2.y)
    x,y = p.x,p.y

    return (xm < x and x < xM and ym < y and y < yM)


class EqualityMixin(object):
    def __eq__(self, other):
        return (isinstance(other, self.__class__)
            and self.__dict__ == other.__dict__)

    def __ne__(self, other):
        return not self.__eq__(other)

    def __str__(self):
        return self.__class__.__name__ + ": " + str(self.__dict__)

    def __repr__(self):
        return self.__class__.__name__ #return self.__str__()

class Point(EqualityMixin):
    def __init__(self,x,y):
        self.x = x
        self.y = y

    def __repr__(self):
        return "(" + str(self.x) + "," + str(self.y) + ")"

class Segment(EqualityMixin):
    def __init__(self,p,q):
        if p.x > q.x:
            p,q = q,p
        self.p = p
        self.q = q

        if (q.x == p.x):
            self.m = None
        else:
            self.m = (q.y - p.y) / (q.x - p.x)

    def evalauateParametric(self,t):
        x = (1-t) * self.p.x + t * self.q.x
        y = (1-t) * self.p.y + t * self.q.y
        return Point(x,y)

    def evaluateX(self, x):
        if (x < p.x or x > q.x):
            return None
        if (self.m == None):
            raise "Evaluating vertical segment at x"

        return self.m * x + (p.y - self.m * p.x)

    def intersect(seg1,seg2):
        isp = Line.intersect(Line.fromSegment(seg1),Line.fromSegment(seg2))
        if (isp == None):
            return None

        if inRectangle(isp,seg1.p,seg1.q) and inRectangle(isp,seg2.p,seg2.q):
            return isp
        else:
            return None

    def lineIntersect(seg1,line2):
        isp = Line.intersect(Line.fromSegment(seg1),line2)
        if (isp == None):
            return None

        if inRectangle(isp,seg1.p,seg1.q):
            return isp
        else:
            return None

class Line(EqualityMixin):
    def __init__(self,a,b,c):
        self.a = a
        self.b = b
        self.c = c

        if (self.b != 0):
            self.m = -1 * self.a / self.b
        else:
            self.m = None

    def evaluate(self,x):
        if (self.m == None):
            raise "Evaluating vertical line at x"
        return (self.c - self.a * x) / self.b

    def intersect(line1,line2):
        a1 = line1.a
        b1 = line1.b
        c1 = line1.c
        a2 = line2.a
        b2 = line2.b
        c2 = line2.c

        det = a1 * b2 - b1 * a2
        if (det == 0):
            return None

        xc = (b2*c1 - b1*c2)/det
        yc = (a1*c2 - a2*c1)/det

        return Point(xc,yc)

    def fromSegment(seg):
        x1 = seg.p.x
        x2 = seg.q.x
        y1 = seg.p.y
        y2 = seg.q.y

        if (x1 == x2):
            return Line(1,0,x1)
        else:
            m = (y2 - y1) / (x2 - x1)
            c = y1 - m * x1
            return Line(-m,1,c)


class Trapezoid(EqualityMixin):
    def __init__(self,top,bot,leftP,rightP, neighbours=[None,None,None,None], node=None):
        self.top = top
        self.bot = bot
        self.leftP = leftP
        self.rightP = rightP
        self.neighbours = neighbours
        self.node = node

        self.left = Line(1,0,self.leftP.x)
        self.right = Line(1,0,self.rightP.x)

        self.topSeg = Segment(Point(leftP.x, top.evaluate(leftP.x)), Point(rightP.x, top.evaluate(rightP.x)))
        self.botSeg = Segment(Point(leftP.x, bot.evaluate(leftP.x)), Point(rightP.x, bot.evaluate(rightP.x)))
        self.leftSeg = Segment(Point(leftP.x, top.evaluate(leftP.x)), Point(leftP.x, bot.evaluate(leftP.x)))
        self.rightSeg = Segment(Point(rightP.x, top.evaluate(rightP.x)), Point(rightP.x, bot.evaluate(rightP.x)))

    def upperLeft(self):
        return self.neighbours[0]

    def upperRight(self):
        return self.neighbours[1]

    def lowerLeft(self):
        return self.neighbours[2]

    def lowerRight(self):
        return self.neighbours[3]

    def toPoints(self):
        topLeft = Line.intersect(self.top, self.left)
        topRight = Line.intersect(self.top, self.right)
        bottomLeft = Line.intersect(self.bot, self.left)
        bottomRight = Line.intersect(self.bot, self.right)

        return [topLeft,topRight,bottomLeft,bottomRight]

    def lineIntersect(self, line):
        return


if __name__ == '__main__':
    trap = Trapezoid(Line(-0.67,1,-3.33), Line(-1,1,0), Point(1,4), Point(4,6))
    print trap
    print trap.toPoints()

