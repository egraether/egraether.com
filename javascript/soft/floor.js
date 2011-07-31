var Floor = {

    height : -4,
    size : 10,
    
    init : function() {
        
        var s = this.size,
            h = this.height,
            vertices = [];
        
        for (var i = 0; i <= 2 * s; i++) {
            
            vertices.push(-s + i, -s, h);
            vertices.push(-s + i, s, h);
            
            vertices.push(-s, -s + i, h);
            vertices.push(s, -s + i, h);
            
        }
        
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        
    },
    
    draw : function() {
        
        gl.uniform3f(shader.colorUniform, 0.7, 0.7, 0.7);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shader.positionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, 8 * this.size + 4);
        
    }
};