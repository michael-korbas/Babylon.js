﻿#ifdef GL_ES
precision mediump float;
#endif

// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D rightSampler;
uniform sampler2D leftSampler;

void main(void)
{
    vec4 leftFrag = texture2D(leftSampler, vUV);
    leftFrag = vec4(1.0, leftFrag.g, leftFrag.b, 1.0);

    vec4 rightFrag = texture2D(rightSampler, vUV);
    rightFrag = vec4(rightFrag.r, 1.0, 1.0, 1.0);

    gl_FragColor = vec4(rightFrag.r, leftFrag.g, leftFrag.b, 1.0);
}