
import Phaser from '../lib/phaser.js'

export default class MenuScene extends Phaser.Scene {
  fire = `
  /*
  * Original shader from: https://www.shadertoy.com/view/fscXR8
  */
 
 #ifdef GL_ES
 precision mediump float;
 #endif
 
 // glslsandbox uniforms
 uniform float time;
 uniform vec2 resolution;
 
 // shadertoy emulation
 #define iTime time
 #define iResolution vec3(resolution,1.)
 
 // --------[ Original ShaderToy begins here ]---------- //
 #define R(p,a,r)mix(a*dot(p,a),p,cos(r))+sin(r)*cross(p,a)
 #define H(h)(cos((h)*6.3+vec3(0,23,21))*.5+.5)
 void mainImage(out vec4 O, vec2 C)
 {
     O=vec4(0);
     vec3 p,r=iResolution,
     d=normalize(vec3((C-.5*r.xy)/r.y,1));
     float g=0.,e,s;
     for(float i=0.;i<99.;++i)
     {
         p=g*d;
         p.z-=.2;
         p=R(p,normalize(vec3(1,2,3)),iTime*.3);
         s=3.;
         for(int j=0;j<8;++j)
         {
             p=abs(p),p=p.x<p.y?p.zxy:p.zyx;
             s*=e=2./min(dot(p,p),1.2);
             p=p*e-vec3(12,3,3);
         }
         g+=e=length(p.xz)/s+5e-4;
         // color matrix test
         mat3 m = mat3(
             .9,.5,.2,
             .4,.4,.4,
             .3,.7,.9
             );
         O.rgb+=m*(H(log(s)*.8)+.5)*.016*exp(-.4*i*i*e);  
     }
     O=pow(O,vec4(12));
  }
 // --------[ Original ShaderToy ends here ]---------- //
 
 void main(void)
 {
     mainImage(gl_FragColor, gl_FragCoord.xy);
     gl_FragColor.a = 1.;
 }
  `;
star = `

#ifdef GL_ES
precision mediump float;
#endif

// glslsandbox uniforms
uniform float time;
uniform vec2 resolution;

#define num_layers 6.

mat2 rot(float a) {

    float s=sin(a) , c=cos(a);
    
    return mat2(c, -s, s, c);
}    

float star(vec2 uv, float flare) {

float d = length (uv);
	
	float m = .05 / d;
	
	float rays = max (0. , 1. -abs (uv.x * uv.y * 1000.));
	m +=rays * flare;
	uv *=rot(3.1415/4.);
    rays = max (0. , 1. -abs (uv.x * uv.y * 1000.));
	m +=rays*.3 * flare;
    m *= smoothstep(1.,.2,d);
    return m;
  
}  

float hash (vec2 p) {

    p = fract(p*vec2(123.34,456.567));
    p += dot(p, p+45.32);
    return fract(p.x * p.y);
}

vec3 starlayer (vec2 uv)
{
vec3 col = vec3(0);

    vec2 gv = fract(uv)-.5;
    vec2 id = floor(uv);
    for (int y=-1;y<=1;y++) {
        for (int x=-1;x<=1;x++) {
            vec2 offs = vec2(x,y);
            float n = hash(id+offs); // random value
            float size = fract(n*456.32);

            float star1 = star (gv-offs-vec2(n,fract (n*34.))+.5, smoothstep(.85,1.,size));
            
            vec3 color = vec3(0.4+(sin(uv.y+uv.x*2.0+n*1121.43)*.5),0.5,1.);	//sin(vec3(.2,.5,.9)*fract(n*4232.4)*6.28)*.5+.5;
            //color = color * vec3(1.,1,1.);
            //star1 *= sin(time*2.+n*12.56)*.5+1.;
		color.b *= 0.5+sin(n*17.7)*0.5;
            col+= star1*size*color;
            
        }
    }
   return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
   
   // vec2 uv = (GL_FragCoord -.5 * resolution.xy) / resolution.y;
    vec2 uv = (fragCoord -.5 * resolution.xy) / resolution.y;	
    //if (gv.x > .48 || gv.y > .48) col.r = 1.;
    
    vec3 col = vec3 (0.);
    float t = time*.024+time/100.;
	uv *= rot(t);

    for (float i=0.;i < 1.;i += 1./num_layers)
    {
    float depth = fract(i+t);
    float scale = mix (20., .5, depth);
    float fade = depth*smoothstep (1.,.9,depth);;

    col+= starlayer(uv*scale+i*347.9)*fade;
    }
    
    fragColor = vec4(col,1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}`;

  constructor() {
    super("menu");      
  }
  
  preload(){
    this.load.image("tab-start","assets/tab-start.png");
    const width  = this.scale.width;
    const height = this.scale.height;    
    this.center = {x: width/2, y: height/2};
  }
  create() {
    const bShader = new Phaser.Display.BaseShader('star', this.star);
    const shader = this.add.shader(bShader, this.center.x, this.center.y, 16*60, 8*60);

    this.add.image(this.center.x, this.center.y, "tab-start");
    this.input.on('pointerdown',() => this.scene.start("game") );
  }

}