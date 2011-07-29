var Floor = {

    height : -4,
    size : 10,
    
    init : function() {
        
        var s = this.size,
            h = this.height;
        
        this.cornerBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cornerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
             s,  s, h,
            -s,  s, h,
            -s, -s, h,
             s, -s, h
        ]), gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ]), gl.STATIC_DRAW);
        
        this.cornerIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cornerIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
            0, 1, 2, 0, 2, 3
        ]), gl.STATIC_DRAW);
        
        
        var lineVertices = [],
            lineNormals = [],
            lineIndices = [];
        
        for (var i = 0; i < 2 * s; i++) {
            
            lineVertices.push(-s + i, -s, h);
            lineVertices.push(-s + i, s, h);
            
        }
        
        for (var i = 0; i < 2 * s; i++) {
            
            lineVertices.push(-s, -s + i, h);
            lineVertices.push(s, -s + i, h);
            
        }
        
        for (var i = 0; i < 8 * s; i++) {
            
            lineNormals.push(0, 0, 1);
            lineIndices.push(i);
            
        }
        
        this.lineBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertices), gl.STATIC_DRAW);
        
        this.lineNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineNormals), gl.STATIC_DRAW);
        
        this.lineIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), gl.STATIC_DRAW);
        
    },
    
    draw : function() {
        
        gl.uniform3f(shader.colorUniform, 0.7, 0.7, 0.7);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cornerBuffer);
        gl.vertexAttribPointer(shader.positionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(shader.normalAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cornerIndexBuffer);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        
        
        gl.uniform3f(shader.colorUniform, 1.0, 0.5, 0.5);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
        gl.vertexAttribPointer(shader.positionAttribute, 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineNormalBuffer);
        gl.vertexAttribPointer(shader.normalAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer);
        gl.drawElements(gl.LINES, 8 * this.size, gl.UNSIGNED_SHORT, 0);
        
    },
    
    line: function(a, b) {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([a[0], a[1], a[2], b[0], b[1], b[2]]));
        
        
    }
    
};