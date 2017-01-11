var lsm303 = require('lsm303');

var ls  	= 	new lsm303(),
	accel 	= 	ls.accelerometer(),
	mag 	= 	ls.magnetometer();

var ymod_mag 			= 100,		//	Heavily filtered magnetic raw data
    xmod_mag 			= 100,	
    zmod_mag 			= 100,	
    scaled_magx 		= 0,		//	Scaled magnetic raw data from -3000 to +3000 for creating a unit vector
    scaled_magy 		= 0,	
    scaled_magz 		= 0,	
    temp_val 			= 0,	
    rad_val 			= 0,    	//	Vector angle in radians
    current_deg 		= 0,    	//	Calculating magnetic heading in degrees  (range: -90 to +90)
    min_deg 			= -1,   	//	Lower threshold for heading event
    max_deg 			= 1,    	//	Upper threshold for heading event
    threshold 			= 30, 		//	+/- window for heading event.  Will need to be configurable by the user
    heading_event 		= 0, 		//	Toggle to 1 when event and then set to 0 after
    accel_magnitude 	= 1,    	//	Accelerometer combined value for all 3 accel axis.  Used when determining axis for performing calculations
    min_flip_zone 		= 0,  		//	Becomes 1 when the min_deg value is in an area that needs to be flipped when less than -90 deg 
    max_flip_zone 		= 0,  		//	Become 1 when the max deg value needs to negative when value is greater than 90 deg
    xaccel 				= 0.58,		//	Accelerometer value X
    yaccel 				= 0.58,		//	Accelerometer value Y
    zaccel 				= 0.58;		//	Accelerometer value Z
    down_axis 			= 0;  		//	Indicates which axis is pointing towards ground 1=x, 2=y, 3=z
    
    
var read = setInterval(function() {
    accel.readX(function(err,axes){
        if(err){
            console.log("Error reading Accelerometer Axes : " + err);
        }
        if (axes) {
            //console.log('AccelX:', axes.x);
            xaccel = Math.abs(axes.x);
        }
    });
    accel.readY(function(err,axes){
        if(err){
            console.log("Error reading Accelerometer Axes : " + err);
        }
        if (axes) {
            //console.log('AccelY:', axes.y);
            yaccel = Math.abs(axes.y);
        }
    });
    accel.readZ(function(err,axes){
        if(err){
            console.log("Error reading Accelerometer Axes : " + err);
        }
        if (axes) {
            //console.log('AccelZ:', axes.z);
            zaccel = Math.abs(axes.z);
        } 
    });
    mag.readMX(function(err,axes){
        if(err){
            console.log("Error reading Magnetometer Axes : " + err);
        }
        if (axes) {
            xmod_mag = parseInt((axes.x * 1) + (xmod_mag * 9)) / 10;    //	first order filter
            console.log('MagX:', xmod_mag);
            //console.log('MagX:', axes.x);
        }
    });
    mag.readMY(function(err,axes){
        if(err){
            console.log("Error reading Magnetometer Axes : " + err);
        }
        if (axes) {
            ymod_mag = parseInt((axes.y * 1) + (ymod_mag * 9)) / 10;    //	first order filter
            console.log('MagY:', ymod_mag);
            //console.log('MagY:', axes.y);
        }
    });
    mag.readMZ(function(err,axes){
        if(err){
            console.log("Error reading Magnetometer Axes : " + err);
        }
        if (axes) {
            zmod_mag = parseInt((axes.z * 1) + (zmod_mag * 9)) / 10;    //	first order filter
            console.log('MagZ:', zmod_mag);
            //console.log('MagZ:', axes.z);
            
            
            
            /****Raw Mag Heading Scaling Calculations performed here**********/
            
            //scale these values to range from -3000 to +3000 to create unit vector
            
            scaled_magz = (zmod_mag + 1500) * 2;
            scaled_magy = (ymod_mag + 0) * 1.5;
            scaled_magx = (xmod_mag + 625) * 1.6;
            
            
            
            /*********Perform Accelerometer Magnitude calculations here****************/
            
            accel_magnitude = Math.ceil(Math.sqrt((xaccel * xaccel) + (yaccel * yaccel) + (zaccel * zaccel)) * 100) / 100 ;    // uses slightly filtered values
            //console.log('Accelerometer Magnitude:', Math.ceil(accel_magnitude * 100) / 100);
            
            
            
            /***find mounting orientation as long as accelerometer magnitude doesn't indicate an acceleration to skew the data***/
            //an acceleration could cause the unit to think the mounting is in a different orienation since we compare each axis acceleration to determine the orientation
            
            if(accel_magnitude < 1.12){
                
                /********determines orientation of accelerometer to determine heading vectors to use*****/
                
                if(xaccel > yaccel){
                    if(xaccel > zaccel){	//x is largest accelerometer zalue
                    
                        down_axis = 1;  //x axis
                        
                    }else{

                        down_axis = 3;  //z axis
                        
                    }   
                }else{
                    if(yaccel > zaccel){	//y is largest accelerometer zalue
                    
                        down_axis = 2;  //y axis
    
                    }else{
                        
                        down_axis = 3;  //z axis
                    }
                }
            }
            
            
            //This code is run even if an acceleration happens.  The orientation is known prior to the acceleration and can execute the calucations below
            if(down_axis == 1){
                temp_val = scaled_magy / scaled_magz;   //x axis is pointing down
                //console.log('x is down', down_axis);
            }
            
            if(down_axis == 2){
                temp_val = scaled_magx / scaled_magz;   //y axis is pointing down
                //console.log('y is down', down_axis);
            }
            
            if(down_axis == 3){
                temp_val = scaled_magx / scaled_magy    //z axis is pointing down
                //console.log('z is down', down_axis);
            }
            
            
            
            
            /****Calcuations for determining Heading and Threshold Events*******************/
            
            rad_val = (Math.atan(temp_val));
            current_deg = rad_val / 0.017;      //changed from 0.01745 to get more range out of rad value
            
            
            
            if((min_flip_zone == 0) && (max_flip_zone == 0)){       //this is when the min deg value is greater than -90 and the max deg value is less than 90
                if (current_deg <= min_deg){
                    
                    
                    heading_event = 1;
                    //console.log('This got Min triggered:', heading_event);
                    
                    min_deg = current_deg - threshold;
                    
                    if (min_deg <= -89){
                        
                        min_deg = 90 + (min_deg + 89);
                        min_flip_zone = 1;      //indicates the value flipped
                        max_flip_zone = 0;
                    }else{
                        
                        min_flip_zone = 0;
                        max_flip_zone = 0;
                    }
                    
                    max_deg = current_deg + threshold;
                    

                }else if(current_deg >= max_deg){
                    
                    
                    heading_event = 1;
                    //console.log('This got Max triggered:', heading_event);
                    
                    max_deg = current_deg + threshold;
                    
                    if (max_deg >= 89){
                        
                        max_deg = -90 + (max_deg - 89);
                        max_flip_zone = 1;      //indicates the value flipped
                    }else{  
                        
                        min_flip_zone = 0;
                        max_flip_zone = 0;
                    }
                    
                    min_deg = current_deg - threshold;
                    
                    
                }else{
                    
                    heading_event = 0;

                }                   
                
            }else if(min_flip_zone == 1){       //this is when the min deg value is flipped positive 
                if ((current_deg <= min_deg) && (current_deg > max_deg)){
                    
                    
                    heading_event = 1;
                    //console.log('This got Min triggered:', heading_event);
                    
                    min_deg = current_deg - threshold;

                    max_deg = current_deg + threshold;
                    
                    if(max_deg >= 89){
                        
                        max_deg = -90 + (max_deg - 89);
                        max_flip_zone = 1;
                        min_flip_zone = 0;
                    
                    }else{  //returns back to normal zone
                        
                        min_flip_zone = 0;
                        max_flip_zone = 0;
                    }
                }

                
            }else if(max_flip_zone == 1){   //this is when the max deg value is flipped negative
                
                if((current_deg >= max_deg) && (current_deg < min_deg)){
                    
                    heading_event = 1;
                    //console.log('This got Max triggered:', heading_event);
                
                    min_deg = current_deg - threshold;

                    max_deg = current_deg + threshold;
                
                    if(min_deg <= -89){
                    
                        min_deg = 90 + (min_deg + 89);
                        min_flip_zone = 1;      //indicates the value flipped
                        max_flip_zone = 0;
                
                    }else{  //returns back to normal zone when no polarity flipping is required
                    
                    min_flip_zone = 0;
                    max_flip_zone = 0;
                    }
                }
            }
            
			/* console.log('AccelX:', xaccel);
			console.log('AccelY:', yaccel);
			console.log('AccelZ:', zaccel);
			console.log('AccelMag:', accel_magnitude);
            console.log('Current Angle:', parseInt(current_deg)); */
          
			console.log(xaccel, yaccel, zaccel, accel_magnitude, parseInt(current_deg));
            
            
        }
    });
}, 100); 
