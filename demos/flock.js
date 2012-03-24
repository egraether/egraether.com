/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */

if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}


function l(message) {
  console.log(message);
};

var Point = function(x, y) {
  this.x = (x !== undefined ? x : 0);
  this.y = (y !== undefined ? y : 0);
};

Point.prototype.add = function(point) {
  return new Point(
    this.x + point.x, 
    this.y + point.y
  );
}

Point.prototype.sub = function(point) {
  return new Point(
    this.x - point.x, 
    this.y - point.y
  );
}

Point.prototype.mul = function(value) {
  return new Point(
    this.x * value, 
    this.y * value
  );
}

Point.prototype.div = function(value) {
  return new Point(
    this.x / value, 
    this.y / value
  );
}

Point.prototype.dot = function(point) {
  return (this.x * point.x + this.y * point.y);
}

Point.prototype.normSquared = function() {
  return this.dot(this);
}

Point.prototype.norm = function() {
  return Math.sqrt(this.normSquared());
}

Point.prototype.normalize = function() {
  return (this.normSquared() ? this.div(this.norm()) : this);
}

Point.prototype.rotate = function(angle) {
  return new Point(
    Math.cos(angle) * this.x - Math.sin(angle) * this.y,
    Math.sin(angle) * this.x + Math.cos(angle) * this.y
  );
}


var Node = function(x, y) {
  
  this.position = new Point(x, y);
  this.velocity = new Point();
  
  this.cohesionCenter = new Point();
  this.separationCenter = new Point();
  
};

Node.size = 5;
Node.speed = 1;

Node.cohesionRadiusSquared = 10000;
Node.separationRadiusSquared = 100;
Node.aimRadiusSquared = 1000000;

Node.cohesionFactor = 0.1;
Node.separationFactor = 1;
Node.aimFactor = 0.2;

Node.prototype.updateVelocity = function(cohesionNodes, separationNodes) {
  
  if (cohesionNodes) {
    
    this.cohesionCenter = this.cohesionCenter.div(cohesionNodes);
    this.velocity = this.velocity.add(this.cohesionCenter.sub(this.position).normalize().mul(Node.cohesionFactor));
    
  }
  
  if (separationNodes) {
    
    this.separationCenter = this.separationCenter.div(separationNodes);
    this.velocity = this.velocity.add(this.position.sub(this.separationCenter).normalize().mul(Node.separationFactor));
    
  }
  
  if (this.aim) {
    
    this.velocity = this.velocity.add(this.aim.sub(this.position).normalize().mul(Node.aimFactor));
    delete this.aim;
    
  }
  
  this.velocity = this.velocity.normalize().mul(Node.speed);
  
  this.cohesionCenter = new Point();
  this.separationCenter = new Point();
  
};

Node.prototype.updatePosition = function() {
  
  this.position = this.position.add(this.velocity);
  
  if (this.position.x < 0) {
    
    this.position.x = 0;
    this.velocity.x = -this.velocity.x;
  
  } else if (this.position.x > canvas.width) {
    
    this.position.x = canvas.width;
    this.velocity.x = -this.velocity.x;
    
  }
  
  if (this.position.y < 0) {
    
    this.position.y = 0;
    this.velocity.y = -this.velocity.y;
    
  } else if (this.position.y > canvas.height) {
    
    this.position.y = canvas.height;
    this.velocity.y = -this.velocity.y;
    
  }
  
};


var Flock = function() {
  
  this.nodes = [];
  
};

Flock.prototype.updateNodes = function() {
  
  var nodeDistances = [];
  
  for (var i = 0; i < this.nodes.length; i++) {
    
    nodeDistances[i] = [];
    
    for (var j = 0; j < i; j++) {
      
      nodeDistances[i][j] = nodeDistances[j][i] = this.nodes[i].position.sub(this.nodes[j].position).normSquared();
      
    }
  }
  
  for (var i = 0; i < this.nodes.length; i++) {
    
    var node = this.nodes[i],
        cohesionNodes = 0,
        separationNodes = 0;
    
    for (var j = 0; j < this.nodes.length; j++) {
      
      if (i === j) {
        continue;
      }
      
      if (nodeDistances[i][j] < Node.separationRadiusSquared) {
        
        node.separationCenter = node.separationCenter.add(this.nodes[j].position);
        separationNodes++;
        
      } 
      
      if (nodeDistances[i][j] < Node.cohesionRadiusSquared) {
        
        node.cohesionCenter = node.cohesionCenter.add(this.nodes[j].position);
        cohesionNodes++;
        
      }
      
    }
    
    if (mouse.sub(node.position).normSquared() < Node.aimRadiusSquared) {
      
      node.aim = new Point(mouse.x, mouse.y);
      
    }
    
    node.updateVelocity(cohesionNodes, separationNodes);
    
  }
  
  for (var i = 0; i < this.nodes.length; i++) {
    
    this.nodes[i].updatePosition();
    
  }
  
};

Flock.prototype.drawNodes = function(context) {
  
  context.fillStyle = "#800000";
  
  for (var i = 0; i < this.nodes.length; i++) {
    
    context.save();
    
      context.translate(this.nodes[i].position.x, this.nodes[i].position.y);
  
      context.beginPath();
      context.arc(0, 0, Node.size, 0, Math.PI * 2, true);
  
      context.fill();
    
    context.restore();
    
  }
  
};

Flock.prototype.clearNodes = function(context) {
  
  for (var i = 0; i < this.nodes.length; i++) {
    
    context.clearRect(
      this.nodes[i].position.x - Node.size - 1, 
      this.nodes[i].position.y - Node.size - 1, 
      Node.size * 2 + 2, 
      Node.size * 2 + 2
    );
    
  }
  
};

function animate() {

  requestAnimationFrame(animate, canvas);
  
  flock.clearNodes(context);
  flock.updateNodes();
  flock.drawNodes(context);

}


var canvas, context, flock, mouse = new Point();

document.onmousemove = function(event) {
  
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  
}

document.onclick = function(event) {
  
  flock.nodes.push(new Node(event.clientX, event.clientY));
  
}

window.onload = function() {

  canvas = document.createElement('canvas');

  canvas.width = window.innerWidth - 20;
  canvas.height = window.innerHeight - 20;
  
  document.body.appendChild(canvas);

  context = canvas.getContext('2d');
  context.translate(0.5, 0.5);
  
  flock = new Flock();
  
  for (var i = 0; i < 5; i++) {
              
    flock.nodes.push(new Node(
      Math.random() * canvas.width, 
      Math.random() * canvas.height
    ));
    
  }
  
  //animate();

}