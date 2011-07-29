var Cube = function(position) {
    
    this.position = position;
    this.faces = [];
    this.vertices = [];
    
};

Cube.prototype = {
    
    draw : function() {
        
        pushMatrix();
        
        mat4.translate(mvMatrix, this.position);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
        gl.vertexAttribPointer(shader.positionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
        gl.vertexAttribPointer(shader.normalAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
        gl.drawElements(gl.TRIANGLES, Cube.indexCount, gl.UNSIGNED_SHORT, 0);
        
        popMatrix();
        
    }
    
};

Cube.init = function() {
    
    var vertices = [

        // front
        1, 1, 1,
        1, -1, 1,
        1, -1, -1,
        1, 1, -1,
    
        // back
        -1, 1, 1,
        -1, 1, -1,
        -1, -1, -1,
        -1, -1, 1,
    
        // right
        1, 1, 1,
        1, 1, -1,
        -1, 1, -1,
        -1, 1, 1,
    
        // left
        1, -1, 1,
        -1, -1, 1,
        -1, -1, -1,
        1, -1, -1,
    
        // top
        1, 1, 1,
        -1, 1, 1,
        -1, -1, 1,
        1, -1, 1,
    
        // bottom
        1, 1, -1,
        1, -1, -1,
        -1, -1, -1,
        -1, 1, -1
    
    ];
    
    for (var i = 0; i < vertices.length; i++) {
        
        vertices[i] = (vertices[i] + 1) / 2;
        
    }


    var normals = [

        // front
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
    
        // back
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
    
        // right
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
    
        // left
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
    
        // top
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
    
        // bottom
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1
    
    ];
    
    var indices = [

        // front
        0, 1, 2, 0, 2, 3,
    
        // back
        4, 5, 6, 4, 6, 7,
    
        // right
        8, 9, 10, 8, 10, 11,
    
        // left
        12, 13, 14, 12, 14, 15,
    
        // top
        16, 17, 18, 16, 18, 19,
    
        // bottom
        20, 21, 22, 20, 22, 23

    ];

    this.vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STREAM_DRAW);

    this.indexCount = indices.length;
    
};