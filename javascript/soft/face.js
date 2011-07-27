var Face = function(type) {
    
    this.type = type;
    this.vertices = [];
    
    this.normal = vec3.create();
    this.vector = vec3.create();

};

Face.TYPES = {
    
    FRONT : 0,
    RIGHT : 1,
    TOP : 2,
    BACK : 3,
    LEFT : 4,
    BOTTOM : 5
    
};

Face.prototype = {
    
    calculateNormal : function() {
        
        vec3.subtract(this.vertices[1].position, this.vertices[0].position, this.normal);
        vec3.subtract(this.vertices[3].position, this.vertices[0].position, this.vector);
        
        if (this.type < 3) {
            
            vec3.cross(this.normal, this.vector);
            
        } else {
            
            vec3.cross(this.vector, this.normal);
            
        }
        
        return vec3.normalize(this.normal);
        
    }
    
};

var Cube = function(position) {
    
    this.position = position;
    this.faces = [];
    this.vertices = [];
    
};
