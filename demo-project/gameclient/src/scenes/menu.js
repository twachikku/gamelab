
import Phaser from '../lib/phaser.js'

export default class MenuScene extends Phaser.Scene {   
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
  
   city = `//Original: https://www.shadertoy.com/view/XlsyWB
   //Fixed by FlyedCode
   precision highp float;
   
   
   uniform float time;
   uniform vec2 resolution;
   vec3  iResolution = vec3(0.);
   float iTime = 0.;
   
   const float streetDistance = 0.6;
   const vec3 streetColor = vec3(4.0, 8.0, 10.0);
   
   const float fogDensity = 0.5;
   const float fogDistance = 4.0;
   const vec3 fogColor = vec3(0.34, 0.37, 0.4);
   
   const float windowSize = 0.1;
   const float windowDivergence = 0.2;
   const vec3 windowColor = vec3(0.1, 0.2, 0.5);
   
   const float beaconProb = 0.0003;
   const float beaconFreq = 0.6;
   const vec3 beaconColor = vec3(1.5, 0.2, 0.0);
   
   
   const float tau = 6.283185;
   
   float hash1(vec2 p2) {
       p2 = fract(p2 * vec2(5.3983, 5.4427));
       p2 += dot(p2.yx, p2.xy + vec2(21.5351, 14.3137));
       return fract(p2.x * p2.y * 95.4337);
   }
   
   float hash1(vec2 p2, float p) {
       vec3 p3 = fract(vec3(5.3983 * p2.x, 5.4427 * p2.y, 6.9371 * p));
       p3 += dot(p3, p3.yzx + 19.19);
       return fract((p3.x + p3.y) * p3.z);
   }
   
   vec2 hash2(vec2 p2) {
       vec3 p3 = fract(vec3(5.3983 * p2.x, 5.4427 * p2.y, 6.9371 * p2.x));
       p3 += dot(p3, p3.yzx + 19.19);
       return fract((p3.xx + p3.yz) * p3.zy);
   }
   
   vec2 hash2(vec2 p2, float p) {
       vec3 p3 = fract(vec3(5.3983 * p2.x, 5.4427 * p2.y, 6.9371 * p));
       p3 += dot(p3, p3.yzx + 19.19);
       return fract((p3.xx + p3.yz) * p3.zy);
   }
   
   vec3 hash3(vec2 p2) {
       vec3 p3 = fract(vec3(p2.xyx) * vec3(5.3983, 5.4427, 6.9371));
       p3 += dot(p3, p3.yxz + 19.19);
       return fract((p3.xxy + p3.yzz) * p3.zyx);
   }
   
   float noise1(vec2 p) {
       vec2 i = floor(p);
       vec2 f = fract(p);
       vec2 u = f * f * (3.0 - 2.0 * f);
       return mix(mix(hash1(i + vec2(0.0, 0.0)), 
                      hash1(i + vec2(1.0, 0.0)), u.x),
                  mix(hash1(i + vec2(0.0, 1.0)), 
                      hash1(i + vec2(1.0, 1.0)), u.x), u.y);
   }
   
   vec4 castRay(vec3 eye, vec3 ray) {
       vec2 block = floor(eye.xy);
       vec3 ri = 1.0 / ray;
       vec3 rs = sign(ray);
       vec3 side = 0.5 + 0.5 * rs;
       vec2 ris = ri.xy * rs.xy;
       vec2 dis = (block - eye.xy + 0.5 + rs.xy * 0.5) * ri.xy;
       
       float beacon = 0.0;
       
       for (int i = 0; i < 100; ++i) {
           vec2 lo0 = vec2(block + 0.01);
           vec2 loX = vec2(0.3, 0.3);
           vec2 hi0 = vec2(block + 0.69);
           vec2 hiX = vec2(0.3, 0.3);
           float height = (0.5 + hash1(block)) * (2.0 + 4.0 * pow(noise1(0.1 * block), 2.5));
           
           float dist = 500.0;
           float face = 0.0;
           for (int j = 0; j < 3; ++j) {
               float top = height * (1.0 - 0.1 * float(j));
               vec3 lo = vec3(lo0 + loX * hash2(block, float(j)), 0.0);
               vec3 hi = vec3(hi0 + hiX * hash2(block, float(j) + 0.5), top);
   
               vec3 wall = mix(hi, lo, side);
               vec3 t = (wall - eye) * ri;
   
               vec3 dim = step(t.zxy, t) * step(t.yzx, t);            
               float maxT = dot(dim, t);
               float maxFace = 1.0 - dim.z;
               
               vec3 p = eye + maxT * ray;
               dim += step(lo, p) * step(p, hi);
               if (dim.x * dim.y * dim.z > 0.5 && maxT < dist) {
                   dist = maxT;
                   face = maxFace;
               }
           }
           
           float prob = beaconProb * pow(height, 3.0);
           vec2 h = hash2(block);
           if (h.x < prob) {
               vec3 center = vec3(block + 0.5, height + 0.2);
               float t = dot(center - eye, ray);
               if (t < dist) {
                   vec3 p = eye + t * ray;
                   float fog = (exp(-p.z / fogDistance) - exp(-eye.z / fogDistance)) / ray.z;
                   fog = exp(fogDensity * fog);
   
                   t = distance(center, p);
                   fog *= smoothstep(1.0, 0.5, cos(tau * (beaconFreq * iTime + h.y)));
                   beacon += fog * pow(clamp(1.0 - 2.0 * t, 0.0, 1.0), 4.0);
               }
           }
           
           if (dist < 400.0) {
               return vec4(dist, beacon, face, 1.0);
           }
   
           float t = eye.z * ri.z;
           vec3 p = eye - t * ray;
           vec2 g = p.xy - block;
           if (g.x > 0.0 && g.x < 1.0 && g.y > 0.0 && g.y < 1.0) {
               return vec4(-t, beacon, 0.0, 1.0);
           }
           
           vec2 dim = step(dis.xy, dis.yx); 
           dis += dim * ris;
           block += dim * rs.xy;
       }
       
       if (ray.z < 0.0) {
           return vec4(-eye.z * ri.z, beacon, 0.0, 1.0);
       }
   
       return vec4(0.0, beacon, 0.0, 0.0);
   }
   
   void mainImage(out vec4 fragColor, in vec2 fragCoord) {
       vec2 m = vec2(0.03 * iTime, 0.8);
       m *= tau * vec2(1.0, 0.25);
       
       vec3 center = vec3(6.0 * iTime, 0.5, 3.0);
       float dist = 20.0;
       vec3 eye = center + vec3(dist * sin(m.x) * sin(m.y), dist * cos(m.x) * sin(m.y), dist * cos(m.y));
       float zoom = 3.0;
       
       vec3 forward = normalize(center - eye);
       vec3 right = normalize(cross(forward, vec3(0.0, 0.0, 1.0)));
       vec3 up = cross(right, forward);
       vec2 xy = 2.0 * fragCoord - iResolution.xy;
       zoom *= iResolution.y;
       vec3 ray = normalize(xy.x * right + xy.y * up + zoom * forward);
       
       vec4 res = castRay(eye, ray);
       vec3 p = eye + res.x * ray;
   
       vec2 block = floor(p.xy);
       vec3 window = floor(p / windowSize);
       float x = hash1(block, window.x);
       float y = hash1(block, window.y);
       float z = hash1(block, window.z);
       vec3 color = windowColor + windowDivergence * (hash3(block) - 0.5);
       color *= smoothstep(0.1, 0.9, fract(2.5 * (x * y * z)));
   
       vec3 streetLevel = streetColor * exp(-p.z / streetDistance);
       color += streetLevel;
       color = clamp(mix(0.25 * streetLevel, color, res.z), 0.0, 1.0);
   
       float fog = (exp(-p.z / fogDistance) - exp(-eye.z / fogDistance)) / ray.z;
       fog = exp(fogDensity * fog);
       color = mix(fogColor, color, fog);
       
       color = mix(fogColor, color, res.w);
       color += res.y * beaconColor;
       color += pow(res.y, 2.0);
   
       fragColor = vec4(color, 1.0);
   }
   
   #undef time
   #undef resolution
   
   void main(void)
   {
     iResolution = vec3(resolution, 0.0);
     iTime = time;
   
     mainImage(gl_FragColor, gl_FragCoord.xy);
   }
   `;
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
    const bShader = new Phaser.Display.BaseShader('star', this.city);
    const shader = this.add.shader(bShader, this.center.x, this.center.y, 16*60, 8*60);

    this.add.image(this.center.x, this.center.y, "tab-start");
    this.input.on('pointerdown',() => this.scene.start("game") );
  }

}