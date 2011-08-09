var Vertex = function(position, color) {
    
    this.color = color;
    
    this.position = vec3.create(position);
    this.origin = position;
    
    this.velocity = vec3.create();
    this.force = vec3.create();
    
    vec3.reset(this.velocity);
    vec3.reset(this.force);
    
}

Vertex.mass = 2;
Vertex.collisionNormal = [0, 0, -1];

Vertex.vector = vec3.create();
Vertex.acceleration = vec3.create();

Vertex.colors = [

    [0.82, 0.29, 0.29], // red
    [0.6, 0.45, 0.25], // brown
    [0.92, 0.58, 0.28], // orange
    [0.83, 0.76, 0.28], // yellow
    [0.3, 0.8, 0.3], // green
    [0.3, 0.8, 0.8], // cyan
    [0.4, 0.4, 0.8], // blue
    [0.55, 0.36, 0.71], // violet
    [0.8, 0.5, 0.8], // magenta
    [0.2, 0.2, 0.2], // black
    [1.0, 1.0, 1.0], // white

];

Vertex.prototype = {
    
    update : function(dt) {
        
        vec3.scale(this.force, 1 / Vertex.mass, Vertex.acceleration);
        
        vec3.set(gravity, this.force);
        
        vec3.add(this.velocity, vec3.scale(Vertex.acceleration, dt));
        
        vec3.add(this.position, vec3.scale(Vertex.acceleration, dt * 0.5));
        vec3.add(this.position, vec3.scale(this.velocity, dt, Vertex.acceleration));
        
        if (this.position[2] < Floor.height) {
            
            this.position[2] = Floor.height;
            
            var velocity = vec3.dot(this.velocity, Vertex.collisionNormal),
                momentum = velocity * Vertex.mass,
                coefOfRestitution = 1;
                
            vec3.scale(Vertex.collisionNormal, (1 + coefOfRestitution) * momentum / Vertex.mass, Vertex.vector);
            vec3.subtract(this.velocity, Vertex.vector);
            
            this.velocity[0] *= 0.8;
            this.velocity[1] *= 0.8;
            
        }
        
    },
    
    reset : function() {
        
        vec3.set(this.origin, this.position);
        
        vec3.reset(this.velocity);
        vec3.reset(this.force);
        
    }
    
};
