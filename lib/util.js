function Utils() {

}

Utils.x_offset = 0;
Utils.y_offset = 0;
Utils.z_offset = 0;

var toPolar = function(x, y) { // returns polar coordinates as an object (radians)
  var polarCoords = {};
  polarCoords.r = Math.sqrt(x * x + y * y);
  polarCoords.theta = Math.PI / 2 - Math.atan2(y, x);
  if ( polarCoords.theta < 0 ) {
    polarCoords.theta += 2 * Math.PI;
  }
  polarCoords.theta = 2 * Math.PI - polarCoords.theta;
  polarCoords.theta = (180 / Math.PI * polarCoords.theta);
  return ((polarCoords.theta != 360) ? polarCoords.theta : 0);
}

Utils.setOffset = function(x, y, z) {
  this.x_offset = x;
  this.y_offset = y;
  this.z_offset = z;
  return;
}

Utils.buffToXYZAccel= function(buffer){
    var pos;
    pos = {                           //full scale set to 4g, therefore multiply time .002
        x: this.trueRound( this.twoscomp(((buffer[1] << 8) | buffer[0]) >> 4,12) * 0.002, 2 ), 
        y: this.trueRound( this.twoscomp(((buffer[3] << 8) | buffer[2]) >> 4,12) * 0.002, 2 ),
        z: this.trueRound( this.twoscomp(((buffer[5] << 8) | buffer[4]) >> 4,12) * 0.002, 2 )
    };
    return pos;
}

Utils.buffToTemp = function(buffer){
  var temp;
  temp = {
    temp : (((buffer[0] << 8) | buffer[1]) >> 4)/8 + 18
  };
  return temp;
}

Utils.buffToX = function(buffer){
  var posX;
  posX = {
    x: (this.twoscomp((buffer[0] << 8) | buffer[1],16) - this.x_offset)
  };
  return posX;
}

Utils.buffToZ = function(buffer){
  var posZ;
  posZ = {
    z: (this.twoscomp((buffer[0] << 8) | buffer[1],16) - this.z_offset)
  };
  return posZ;
}

Utils.buffToY = function(buffer){
  var posY;
  posY = {
    y: (this.twoscomp((buffer[0] << 8) | buffer[1],16) - this.y_offset)
  };
  return posY;
}

Utils.buffToHeadMag = function(buffer){
  var pos;
  pos = {
    x: (this.twoscomp((buffer[0] << 8) | buffer[1],16) - this.x_offset),
    z: (this.twoscomp((buffer[2] << 8) | buffer[3],16) - this.z_offset),
    y: (this.twoscomp((buffer[4] << 8) | buffer[5],16) - this.y_offset)
  }
  return toPolar(pos.x, pos.y); 
}
Utils.twoscomp = function(value,no_of_bits) {
  var upper = Math.pow(2,no_of_bits);
  if (value > upper / 2) {
    return value - upper;
  }
  else{
    return value;
  }
}

Utils.trueRound = function(value, digits){
    return parseFloat((Math.round((value*Math.pow(10,digits)).toFixed(digits-1))/Math.pow(10,digits)).toFixed(digits));
}

module.exports = Utils;
