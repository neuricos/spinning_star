/* author: Zetian Chen
 * description: js file for the dark sky star spinning effect
 */

/* create Sketch object */
var sketch = Sketch.create();

/* set the center coordinate of sky */
var ctr = {
      x: sketch.width / 2,
      y: sketch.height / 2
};

/* create an array to store the trail objects */
var trails = [];
var dt = 1;

/* configure the parameters of the graphical user interface */
var panel = {
    total: 0,
    count: 100,
    spacing: 2,
    speed: 20,
    scale: 1,
    jitterRadius: 0,
    clearAlpha: 10,
    toggleTrailitals: true,
    toggleLight: false,      
    clear: function(){
        sketch.clearRect(0, 0, sketch.width, sketch.height),
        trails.length = 0; 
    }
};

var Trail = function(x, y){
    var dx = (x / panel.scale) - (ctr.x / panel.scale);
    var dy = (y / panel.scale) - (ctr.y / panel.scale);
    this.angle = atan2(dy, dx);
    this.lastAngle = this.angle;
    this.radius = sqrt(dx * dx + dy * dy);
    this.size = (this.radius / 300) + 1;
    this.speed = random( 1, 10 ) / 300000 * this.radius + 0.015;

    this.update = function() {
        this.lastAngle = this.angle;
        this.angle += this.speed * (panel.speed / 50) * dt;
        this.x = this.radius * cos(this.angle);
        this.y = this.radius * sin(this.angle);
    };

    this.render = function() {
        if (panel.toggleTrailitals) {
            var radius = (panel.jitterRadius === 0) ?
                             this.radius :
                             this.radius + random( -panel.jitterRadius, panel.jitterRadius );
            radius = (panel.jitterRadius != 0 && radius < 0) ? 0.001 : radius;
            sketch.strokeStyle = '#aaa';
            sketch.lineWidth = this.size;		
            sketch.beginPath();
            if(panel.speed >= 0){
                sketch.arc(0, 0, radius, this.lastAngle, this.angle + 0.001, false);
            } else {
                sketch.arc(0, 0, radius, this.angle, this.lastAngle + 0.001, false);
            };
            sketch.stroke();
            sketch.closePath();
        }
        if (panel.toggleLight) {
            sketch.lineWidth = 0.5;
            sketch.strokeStyle = '#0b3b56';
            sketch.beginPath();
            sketch.moveTo(0, 0);
            sketch.lineTo(this.x, this.y);
            sketch.stroke();
        }
    };
};

var createTrail = function(config) {
    var x = (config && config.x) ? config.x : sketch.mouse.x;
    var y = (config && config.y) ? config.y : sketch.mouse.y;
	trails.push(new Trail(x, y));
};

/* create star trails at the position of mouse */
var turnOnMove = function(){
	sketch.mousemove = createTrail;	
};

/* when the mouse is pressed down, stop creating star trails */
var turnOffMove = function(){
	sketch.mousemove = null;	
};

/* when the mouse is pressed down, create star trails */
sketch.mousedown = function(){
    createTrail();
    turnOnMove();
};

sketch.mouseup = turnOffMove;

sketch.resize = function(){
    ctr.x = sketch.width / 2;
    ctr.y = sketch.height / 2;
    sketch.lineCap = 'round';
};

/* set up the sky */
sketch.setup = function(){  
    while(panel.count --){
        createTrail({
            x: random(sketch.width / 2 - 300, sketch.width / 2 + 300), 
            y: random(sketch.height / 2 - 300, sketch.height / 2 + 300)
        });
    };
};

sketch.clear = function(){
    sketch.globalCompositeOperation = 'destination-out';
    sketch.fillStyle = 'rgba( 0, 0, 0 , ' + ( panel.clearAlpha / 100 ) + ' )';
    sketch.fillRect(0, 0, sketch.width, sketch.height);
    sketch.globalCompositeOperation = 'lighter';
};

sketch.update = function(){
    dt = (sketch.dt < 0.1) ? 0.1 : sketch.dt / 16;
    dt = (dt > 5) ? 5 : dt;
    var i = trails.length;
    panel.total = i;
    while(i --){ 
        trails[i].update();
    }
};

sketch.draw = function(){
    sketch.save();
    sketch.translate(ctr.x, ctr.y);
    sketch.scale(panel.scale, panel.scale);
    var i = trails.length;
    while(i --){
        trails[i].render();	
    }
    sketch.restore();
};

var gui = new dat.GUI({ autoPlace: false })
var f1 = gui.addFolder('Star Tracker');
f1.add(panel, 'total').name('# Of Stars').listen();
var f2 = gui.addFolder('Slider Bar');
f2.add(panel, 'speed', -300, 300).step(1).name('Spinning Speed');
f2.add(panel, 'scale', 0.5, 5).step(0.001).name('Sky Range');
f2.add(panel, 'jitterRadius', 0, 5).step(0.001).name('Ripple Effect');
f2.add(panel, 'clearAlpha', 0, 100).step( 1 ).name('EXP Frequency');
var f3 = gui.addFolder('Toggole Window');
f3.add(panel, 'toggleTrailitals').name('Toggle Trails');
f3.add(panel, 'toggleLight').name('Toggle Light');
var f4 = gui.addFolder('Reset Sky');
f4.add(panel, 'clear').name('Clear');
f1.open();

/* add the gui object to html */
document.getElementById('gui').appendChild(gui.domElement);
document.onselectstart = function(){
    return false;
};
