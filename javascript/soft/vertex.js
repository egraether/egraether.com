var Vertex = function(position) {
    
    this.position = vec3.create(position);
    this.origin = position;
    
    this.velocity = vec3.create();
    this.force = vec3.create();
    
    this.acceleration = vec3.create();
    
    vec3.reset(this.velocity);
    vec3.reset(this.force);
    
    this.number = Vertex.count++;
    
}

Vertex.mass = 1;
Vertex.count = 0;

Vertex.prototype = {
    
    update : function(dt) {
        
        vec3.scale(this.force, 1 / Vertex.mass, this.acceleration);
        
        vec3.set(gravity, this.force);
        
        vec3.add(this.velocity, vec3.scale(this.acceleration, dt));
        
        vec3.add(this.position, vec3.scale(this.acceleration, dt * 0.5));
        vec3.add(this.position, vec3.scale(this.velocity, dt, this.acceleration));
        
        if (this.position[2] < Floor.height) {
            
            this.position[2] = Floor.height;
            
        }
        
    },
    
    reset : function() {
        
        vec3.set(this.origin, this.position);
        
        vec3.reset(this.velocity);
        vec3.reset(this.force);
        
    }
    
};
