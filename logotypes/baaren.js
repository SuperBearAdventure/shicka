scale=1
for(i=0;i<4;++i){
a=document.createElement("canvas")
a.style.backgroundColor="#eee"
a.width=a.height=(256-28*2)*scale
b=a.getContext("2d")
b.scale(scale,scale)
b.translate(-28,-28)
b.lineCap="round"
b.lineJoin="round"
b.beginPath()
b.arc(128,128,96,0,Math.PI*2,true)
b.closePath()
b.fillStyle="#7289da"
b.fill()
b.save()
b.clip()
b.beginPath()
b.moveTo(64,80+(i>=2?i-1:0))
b.lineTo(96,80+(i>=2?i-1:0))
b.lineTo(96+128,80+256+(i>=2?i-1:0))
b.lineTo(52+128,120+256+(i>=2?i-1:0))
b.lineTo(52,120+(i>=2?i-1:0))
b.closePath()
b.moveTo(256-96,80+(i>=2?i-1:0))
b.lineTo(256-100,96+(i>=2?i-1:0))
b.lineTo(256-100+128,96+256+(i>=2?i-1:0))
b.lineTo(256-64+128,80+256+(i>=2?i-1:0))
b.lineTo(256-64,80+(i>=2?i-1:0))
b.closePath()
b.moveTo(88,112+(i>=2?i-1:0))
b.lineTo(256-88,112+(i>=2?i-1:0))
b.lineTo(256-88+128,112+256)
b.lineTo(80+128,184+256)
b.lineTo(80,184)
b.closePath()
b.lineWidth=8
b.fillStyle="#4e5d94"
b.fill()
b.strokeStyle="#4e5d94"
b.stroke()
b.beginPath()
b.moveTo(64,80+(i>=2?i-1:0))
b.lineTo(96,80+(i>=2?i-1:0))
b.lineTo(100,96+(i>=2?i-1:0))
b.lineTo(74,96+(i>=2?i-1:0))
b.lineTo(70,128+(i>=2?i-1:0))
b.lineTo(52,120+(i>=2?i-1:0))
b.closePath()
b.moveTo(256-64,80+(i>=2?i-1:0))
b.lineTo(256-96,80+(i>=2?i-1:0))
b.lineTo(256-100,96+(i>=2?i-1:0))
b.lineTo(256-74,96+(i>=2?i-1:0))
b.lineTo(256-70,128+(i>=2?i-1:0))
b.lineTo(256-52,120+(i>=2?i-1:0))
b.closePath()
b.moveTo(88,112+(i>=2?i-1:0))
b.lineTo(256-88,112+(i>=2?i-1:0))
b.lineTo(256-80,184)
b.lineTo(128,196)
b.lineTo(80,184)
b.closePath()
b.lineWidth=8
b.fillStyle="#ffffff"
b.fill()
b.strokeStyle="#ffffff"
b.stroke()
b.beginPath()
b.ellipse(76,102+(i>=2?i-1:0),6,8,0,0,Math.PI*2)
b.closePath()
b.lineWidth=8
b.fillStyle="#4e5d94"
b.fill()
b.strokeStyle="#4e5d94"
b.stroke()
b.beginPath()
b.ellipse(256-76,102+(i>=2?i-1:0),6,8,0,0,Math.PI*2)
b.closePath()
b.lineWidth=8
b.fillStyle="#4e5d94"
b.fill()
b.strokeStyle="#4e5d94"
b.stroke()
b.beginPath()
b.moveTo(108-(i==3)*3,136+i*3)
b.lineTo(108,148-i)
b.closePath()
b.moveTo(256-108+(i==3)*3,136+i*3)
b.lineTo(256-108,148-i)
b.closePath()
b.moveTo(127,168-(i>=2?i-1:0))
b.lineTo(256-127,168-(i>=2?i-1:0))
b.closePath()
b.moveTo(112,160-(i>=2?i-1:0))
b.lineTo(128,156-(i>=2?i-1:0))
b.lineTo(256-112,160-(i>=2?i-1:0))
b.lineTo(256-112,184-(i>=2?i-1:0))
b.lineTo(128,188-(i>=2?i-1:0))
b.lineTo(112,184-(i>=2?i-1:0))
b.closePath()
b.lineWidth=8
b.strokeStyle="#4e5d94"
b.stroke()
b.restore()
b.beginPath()
b.beginPath()
b.arc(128,128,96,0,Math.PI*2,true)
b.closePath()
b.miterLimit=2
b.lineWidth=4
b.strokeStyle="#23272a"
b.stroke()
document.body.append(a)
}
