attribute vec4 color;
attribute vec3 position;
uniform mat4 rotation;
uniform mat4 translation;
uniform mat4 perspective;
varying vec4 vcolor;
void main() {
    gl_Position = perspective * translation * rotation * vec4( position[0], position[1], position[2], 1 );

    gl_PointSize = (position[0] + 1.0) * 20.0;
    vcolor = color;
}
