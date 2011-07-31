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
    
    [0.8, 0.4, 0.4],
    [0.4, 0.8, 0.4],
    [0.4, 0.4, 0.8],
    
    [0.8, 0.8, 0.4],
    [0.4, 0.8, 0.8],
    [0.8, 0.4, 0.8]

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
            
        }
        
    },
    
    reset : function() {
        
        vec3.set(this.origin, this.position);
        
        vec3.reset(this.velocity);
        vec3.reset(this.force);
        
    }
    
};
