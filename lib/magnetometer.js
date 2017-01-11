var i2c = require('i2c');
var utils = require('./util');

var mag_address = 0x1e; //0x1e
var mag_device = '/dev/i2c-1'

function Magnetometer(options) {
    if (options && options.address) {
        mag_address = options.address;
    }
    if (options && options.device) {
        mag_device = options.device;
    }
    this.mag = new i2c(mag_address, {
        device: mag_device,
        debug: false
    });
    //this.reboot(); // probably should turn this off
    this.enableTempSensor();
    this.init();
    
}

Magnetometer.prototype.setOffset = function(x, y, z) {
    utils.setOffset(x, y, z);
    return;
}


Magnetometer.prototype.reboot = function(){
    this.mag.writeBytes(0x21, [0x04], function(err) { // 0x08  //0x60
        if(err){
            console.log("Error Rebooting Magnetometer : "+err);
        }
        else{
            console.log("Rebooting Magnetometer memory...");
        }
    });
}





Magnetometer.prototype.init = function(){
    this.mag.writeBytes(0x22, [0x00], function(err) { //0x02 //0x00 //0x03
        if(err){
            console.log("Error enabling Magnetometer : "+err);
        }
        else{
            console.log("Magnetometer Enabled Set into continuous conversation mode");
        }
    });
    
    // Ox23
    this.mag.writeBytes(0x23, [0x00], function(err) {  //0x0C
        if(err){
            console.log("Error enabling control register four : "+err);
        }
        else{
            console.log("Magnetometer control register four");
        }
    });
    
    // 0x24
    this.mag.writeBytes(0x24, [0x40], function(err) { //0x40
        if(err){
            console.log("Error enabling control register five : "+err);
        }
        else{
            console.log("Magnetometer control register five");
        }
    });
    
    
}


Magnetometer.prototype.enableTempSensor = function(){
    this.mag.writeBytes(0x20, [0x90], function(err) { //0x00    //0xF0  //0X01
        if(err){
            console.log("Error enabling Temperature Sensor : "+err);
        }
        else{
            console.log("Temperature Sensor Enabled; 10hz register update");
        }
    });
}
Magnetometer.prototype.readMX = function(callback){
    this.mag.readBytes(0x29, 8, function(err, res) { // was 0x03
        callback(err,utils.buffToX(res));
    });
}
 
Magnetometer.prototype.readMZ = function(callback){
    this.mag.readBytes(0x2D, 8, function(err, res) { // was 0x03
        callback(err,utils.buffToZ(res));
    });
}

Magnetometer.prototype.readMY = function(callback){
    this.mag.readBytes(0x2B, 8, function(err, res) { // was 0x03
        callback(err,utils.buffToY(res));
    });
} 



Magnetometer.prototype.readHeading = function(callback){
    this.mag.readBytes(0x29, 6, function(err, res) { // was 0x03
        callback(err, utils.buffToHeadMag(res));
    });
}
Magnetometer.prototype.readTemp = function(callback){
    this.mag.readBytes(0x2F, 2, function(err, res) { // was 0x31
        callback(err,utils.buffToTemp(res));
    });
}
module.exports = Magnetometer;