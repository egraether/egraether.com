var Floor = {

    height : -4,
    size : 10,
    
    init : function() {
        
        var s = this.size,
            h = this.height,
            lineVertices = [],
            lineIndices = [];
        
        for (var i = 0; i <= 2 * s; i++) {
            
            lineVertices.push(-s + i, -s, h);
            lineVertices.push(-s + i, s, h);
            
            lineVertices.push(-s, -s + i, h);
            lineVertices.push(s, -s + i, h);
            
        }
        
        for (var i = 0; i < 8 * s + 4; i++) {
            
            lineIndices.push(i);
            
        }
        
        this.lineBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertices), gl.STATIC_DRAW);
        
        this.lineIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), gl.STATIC_DRAW);
        
    },
    
    draw : function() {
        
        gl.uniform3f(shader.colorUniform, 0.7, 0.7, 0.7);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
        gl.vertexAttribPointer(shader.positionAttribute, 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer);
        gl.drawElements(gl.LINES, 8 * this.size + 4, gl.UNSIGNED_SHORT, 0);
        
    }
};