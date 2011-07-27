var Face = function(type) {
    
    this.type = type;
    this.vertices = [];

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
        
        
        
    }
    
};

var Cube = function(position) {
    
    this.position = position;
    this.faces = [];
    this.vertices = [];
    
};
