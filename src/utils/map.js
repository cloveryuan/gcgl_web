/**
 * 动态加载高德地图
 *
 * @param {*} key 高德地图key
 * @param {*} plugins 高德地图插件
 * @param {string} [v='1.4.15'] 高德地图版本
 * @returns
 */
export const loadMap =  (plugins,key='66cb4a9bec24813021d7e593a843fac9', v='2.0')=> {
  const mp = new Promise( (resolve, reject)=> {
    const hasLoaded1 = document.getElementById("amap");
    if(hasLoaded1) { // 只加载一次
      resolve(window.AMap)
      return
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://webapi.amap.com/maps?v=${v}&key=${key}&plugin=${plugins}&callback=initAMap`
    script.id = "amap";
    script.onerror = reject;
    document.head.appendChild(script);
    window.initAMap = () => {
      resolve(window.AMap)
    }
  });
  const mpUI = mp.then(AMap=>{
    return new Promise( (resolve,reject)=> {
      const hasLoaded2 = document.getElementById("amapUI");
      if(hasLoaded2) { // 只加载一次
        resolve({AMap,AMapUI})
        return
      }
      const script2 = document.createElement("script");
      script2.type = "text/javascript";
      script2.src = "//webapi.amap.com/ui/1.1/main.js";
      script2.id = 'amapUI';
      script2.onerror = reject; 
      script2.onload = function(su){
        resolve({AMap,AMapUI})
      };
      document.head.appendChild(script2);
    });
  })
  return mpUI
}
