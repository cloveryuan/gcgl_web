export function calculateCenter(lnglatarr){
  var total = lnglatarr.length;
  var X=0,Y=0,Z=0;
  lnglatarr.forEach((item,index) => {
    var lng = item.lng * Math.PI /180;
    var lat = item.lat * Math.PI /180;
    var x,y,z;
    x = Math.cos(lat) * Math.cos(lng);
    y = Math.cos(lat) * Math.sin(lng);
    z = Math.sin(lat);
    X +=x;
    Y +=y;
    Z +=z;
  });
  X = X/total;
  Y = Y/total;
  Z = Z/total;
  var Lng = Math.atan2(Y,X);
  var Hyp = Math.sqrt(X*X+Y*Y);
  var Lat = Math.atan2(Z,Hyp);
  return new AMap.LngLat(Lng*180/Math.PI,Lat*180/Math.PI);
}

function Rad(d){
  return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
}
//计算距离
export function getDistance(lng1,lat1,lng2,lat2){
   var radLat1 = Rad(lat1);
   var radLat2 = Rad(lat2);
   var a = radLat1 - radLat2;
   var  b = Rad(lng1) - Rad(lng2);
   var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
   Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
   s = s *6378.137 ;// EARTH_RADIUS;
   if(s>=1){
     s = (Math.round(s * 10000) / 10000)+"公里"; //输出为公里
   }else{
      s = (Math.round(s * 10000))+"米";
   }
   //s = Math.round(s * 10000) / 10000; //输出为公里
   //s=s.toFixed(4);
   return s;
}