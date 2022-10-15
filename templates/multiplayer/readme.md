# การรันบน NodeJS
- ใช้คำสั่ง  npm install   เพื่อติดตั้ง
- ใช้คำสั่ง  npm  start   เพื่อรัน
- ทดสอบ  http://localhost:8081/    
 
# การรันบน Docker

``` 
docker build -t multiplayer .
docker run -p 8081:8081 -d --rm devserver 
```
