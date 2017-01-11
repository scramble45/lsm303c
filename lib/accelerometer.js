var i2c = require('i2c');
var utils = require('./util');

var accel_address = 0x1d; //0x1d;
var accel_device = '/dev/i2c-1'

function Accelerometer(options) {
    if (options && options.address) {
        accel_address = options.address;
    }
    if (options && options.device) {
        accel_device = options.device;
    }
    this.accel = new i2c(accel_address, {
        device: accel_device,
        debug: false
    });
    //this.writeAccelZH();
    this.init();
    this.setResolution();
}
/*******************************/

Accelerometer.prototype.writeAccelZH = function(){
    this.accel.writeBytes(0x3F, [0x00], function(err) {
        if(err){
            console.log("Error Writing Z-High Reference Accelerometer : "+err);
        }
        else{
            console.log("Accelerometer Writing Z-High Reference...");
        }
    });
}


/*******************************/
Accelerometer.prototype.init = function(){
    
    //0x20
    this.accel.writeBytes(0x20, [0x17], function(err) { //0x57  //0x37
        if(err){
            console.log("Error enabling Accelerometer : "+err);
        }
        else{
            console.log("Accelerometer Enabled");
        }
    });
    
    //0x21
    this.accel.writeBytes(0x21, [0x00], function(err) { //0x00
        if(err){
            console.log("Error enabling Filtering for Accelerometer : "+err);
        }
        else{
            console.log("Filtering Enabled");
        }
    });
    
    
    //0x23
    /* this.accel.writeBytes(0x23, [0x30], function(err) { //0x57
        if(err){
            console.log("Error enabling Accelerometer : "+err);
        }
        else{
            console.log("Accelerometer Enabled");
        }
    }); */

}
Accelerometer.prototype.setResolution = function(){
    this.accel.writeBytes(0x23, [0x20], function(err) { //0x38 //0x00 corrects the scaling, other code calls out 0x30
        if(err){
            console.log("Error Setting Accelerometer Resolution : "+err);
        }
        else{
            console.log("Accelerometer Resolution Set");
        }
    });
}
Accelerometer.prototype.readX = function(callback){
    this.accel.readBytes(0x29 | 0x80, 6, function(err, res) { // 0x80 2's complement
        callback(err,utils.buffToXYZAccel(res));
    });
}
Accelerometer.prototype.readY = function(callback){
    this.accel.readBytes(0x2B | 0x80, 6, function(err, res) { // 0x80 2's complement
        callback(err,utils.buffToXYZAccel(res));
    });
}
Accelerometer.prototype.readZ = function(callback){
    this.accel.readBytes(0x2D | 0x80, 6, function(err, res) { // 0x80 2's complement
        callback(err,utils.buffToXYZAccel(res));
    });
}

module.exports = Accelerometer;