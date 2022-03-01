//This is a part of lightgl.js library by evanw(Evan Wallace)

class Vector {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
    negative() {
        return new Vector(-this.x, -this.y, -this.z);
    }
    add(v) {
        if (v instanceof Vector)
            return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
        else
            return new Vector(this.x + v, this.y + v, this.z + v);
    }
    sub(v) {
        if (v instanceof Vector)
            return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
        else
            return new Vector(this.x - v, this.y - v, this.z - v);
    }
    dist(v) { //Как в p5.js, вектор как точка
        return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mult(v) {
        if (v instanceof Vector)
            return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
        else
            return new Vector(this.x * v, this.y * v, this.z * v);
    }
    div(v) {
        if (v instanceof Vector)
            return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
        else
            return new Vector(this.x / v, this.y / v, this.z / v);
    }
    equals(v) {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
        return new Vector(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }
    length() {
        return Math.sqrt(this.dot(this));
    }
    mag() {
        return Math.sqrt(this.dot(this));
    }
    unit() {
        return this.div(this.length());
    }
    normalize() {
        return this.div(this.length());
    }
    min() {
        return Math.min(Math.min(this.x, this.y), this.z);
    }
    max() {
        return Math.max(Math.max(this.x, this.y), this.z);
    }
    toAngles() {
        return {
            theta: Math.atan2(this.z, this.x),
            phi: Math.asin(this.y / this.length())
        };
    }
    angleTo(a) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    }
    toArray(n) {
        return [this.x, this.y, this.z].slice(0, n || 3);
    }
    clone() {
        return new Vector(this.x, this.y, this.z);
    }
    copy() {
        return new Vector(this.x, this.y, this.z);
    }
    init(x, y, z) {
        this.x = x; this.y = y; this.z = z;
        return this;
    }
    static negative(a, b) {
        b.x = -a.x; b.y = -a.y; b.z = -a.z;
        return b;
    }
    static add(a, b, c) {
        if (b instanceof Vector) { c.x = a.x + b.x; c.y = a.y + b.y; c.z = a.z + b.z; }
        else { c.x = a.x + b; c.y = a.y + b; c.z = a.z + b; }
        return c;
    }
    static sub(a, b, c) {
        if (b instanceof Vector) { c.x = a.x - b.x; c.y = a.y - b.y; c.z = a.z - b.z; }
        else { c.x = a.x - b; c.y = a.y - b; c.z = a.z - b; }
        return c;
    }
    static mult(a, b, c) {
        if (b instanceof Vector) { c.x = a.x * b.x; c.y = a.y * b.y; c.z = a.z * b.z; }
        else { c.x = a.x * b; c.y = a.y * b; c.z = a.z * b; }
        return c;
    }
    static div(a, b, c) {
        if (b instanceof Vector) { c.x = a.x / b.x; c.y = a.y / b.y; c.z = a.z / b.z; }
        else { c.x = a.x / b; c.y = a.y / b; c.z = a.z / b; }
        return c;
    }
    static cross(a, b, c) {
        c.x = a.y * b.z - a.z * b.y;
        c.y = a.z * b.x - a.x * b.z;
        c.z = a.x * b.y - a.y * b.x;
        return c;
    }
    static unit(a, b) {
        var length = a.length();
        b.x = a.x / length;
        b.y = a.y / length;
        b.z = a.z / length;
        return b;
    }
    static fromAngles(theta, phi) {
        return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
    }
    static randomDirection() {
        return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
    }
    static min(a, b) {
        return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
    }
    static max(a, b) {
        return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
    }
    static lerp(a, b, fraction) {
        return b.sub(a).mult(fraction).add(a);
    }
    static fromArray(a) {
        return new Vector(a[0], a[1], a[2]);
    }
    static angleBetween(a, b) {
        return a.angleTo(b);
    }
}


Vector.fromAngle2D = function (angle){
    return new Vector(Math.cos(angle), Math.sin(angle));
}

Vector.prototype.toAngle2D = function(){
    return Math.atan2(this.y, this.x);
}
Vector.toAngle2D = function (vec){
    return Math.atan2(vec.y, vec.x);
}

Vector.cap = function (vec, maxMagnitude) {
    if(vec.mag() > maxMagnitude){
        return vec.unit().mult(maxMagnitude);
    }
    return vec.copy();
}

Vector.getPerpendicularRight = function(vec){
    return new Vector(vec.y, -vec.x);
}

Vector.getPerpendicularLeft = function(vec){
    return new Vector(-vec.y, vec.x);
}

Vector.prototype.reverse = function(){
    return new Vector(this.x == 0? 0 : 1/this.x, this.y == 0? 0 : 1/this.y, this.z == 0? 0 : 1/this.z);
}

Vector.reverse = function(vec){
    return new Vector(vec.x == 0? 0 : 1/vec.x, vec.y == 0? 0 : 1/vec.y, vec.z == 0? 0 : 1/vec.z);
}

Vector.prototype.rotate = function(angle){
    const mag = this.mag();
    const newHeading = this.toAngle2D() + angle;
    return Vector.fromAngle2D(newHeading).mult(mag);
}