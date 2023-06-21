// TODO Find anoterh way to do this instead of a global var

var gl = canvas.getContext('webgl');
if (!gl) {
    console.log('WebGL not supported, falling back on experimental-webgl');
    gl = canvas.getContext('experimental-webgl');
}

if (!gl) {
    alert('Your browser does not support WebGL');
}
//

export class VertexBuffer {
    constructor(data , usage){

        this.data = data; 
        this.bufferID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferID);
        if(usage === 1) {gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);}// static draw
        if(usage === 2) {gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW);}// Dynamic draw
    }

    bindBuffer(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferID);
    }
    updateDate(newdata){
        this.data = newdata;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferID);
        if(usage === 1) {gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);}// static draw
        if(usage === 2) {gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW);}// Dynamic draw
    }
    }
