/* Lógica de «Cómo está la vida». Lee window.CELV (data.js) y dibuja todo. */
(function(){
"use strict";
var D=window.CELV;
if(!D){document.body.insertAdjacentHTML("afterbegin","<p style='padding:20px'>No se han podido cargar los datos. Recarga la página.</p>");return;}

/* ---------- utilidades ---------- */
var $=function(id){return document.getElementById(id);};
var css=function(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();};
function fmt(v,d){var s=v.toLocaleString("es-ES",{minimumFractionDigits:d,maximumFractionDigits:d});return s.replace(/^(-?)(\d)(\d{3})(?=,|$)/,"$1$2.$3");}
var eur=function(v,d){return fmt(v,d===undefined?2:d)+" €";};
var pct=function(a,b){return (a/b-1)*100;};
var ico=function(id,cls){return '<svg'+(cls?' class="'+cls+'"':'')+' aria-hidden="true"><use href="#i-'+id+'"/></svg>';};
var h=function(n){return "<b>"+n+"h</b>";};               /* horas: «21h» */
var B=function(t){return "<b>"+t+"</b>";};                 /* cifras en negrita */
var sube=function(t){return '<span class="sube-n">'+t+'</span>';};
var baja=function(t){return '<span class="baja-n">'+t+'</span>';};
/* signo(): rojo si sube y verde si baja; con bueno=true (sueldos, pensiones) al revés */
function signo(p,d,bueno){var t=(p>0?"+":p<0?"−":"")+fmt(Math.abs(p),d===undefined?1:d)+" %";if(bueno)return p>0?baja(t):p<0?sube(t):B(t);return p>0?sube(t):p<0?baja(t):B(t);}
var bien=baja,mal=sube;
/* Remedios no siempre habla con la misma persona: se alterna en cada visita */
var visita=0;try{visita=(parseInt(localStorage.getItem("celv-visitas")||"0",10)||0)+1;localStorage.setItem("celv-visitas",String(visita));}catch(e){visita=Math.floor(Math.random()*4);}
var G=(function(){var a=visita%2===1,n=Math.floor(visita/2)%2===1;return {hija:a?"hijo":"hija",Hija:a?"Hijo":"Hija",nieto:n?"nieta":"nieto",comp:n?"compañeras":"compañeros",suNieto:n?"mi nieta":"mi nieto",suHija:a?"mi hijo":"mi hija"};})();
function tono(s,bueno){return bueno?(s==="sube"?"baja":s==="baja"?"sube":s):s;}
function estado(ch,u){u=u===undefined?0.5:u;return ch>u?"sube":(ch<-u?"baja":"plano");}
function flecha(ch,d,u){var s=estado(ch,u);return '<span class="chg '+s+'">'+(s==="sube"?"▲ ":s==="baja"?"▼ ":"= ")+fmt(Math.abs(ch),d===undefined?1:d)+' %</span>';}
function ultimo(a){return a[a.length-1];}
function cap(t){return t.charAt(0).toUpperCase()+t.slice(1);}
document.getElementById("lemaH1").textContent="Cara, "+G.hija+", cara.";

/* ---------- fechas ---------- */
var hoyISO=(function(){try{return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Madrid"}).format(new Date());}catch(e){return new Date().toISOString().slice(0,10);}})();
var horaMadrid=(function(){try{return parseInt(new Intl.DateTimeFormat("es-ES",{hour:"numeric",hour12:false,timeZone:"Europe/Madrid"}).format(new Date()),10)%24;}catch(e){return new Date().getHours();}})();
function fecha(iso){return new Date(iso+"T12:00:00");}
function largo(iso){return fecha(iso).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"});}
function corto(iso){return fecha(iso).toLocaleDateString("es-ES",{day:"numeric",month:"short"}).replace(".","");}
function diaSem(iso){return fecha(iso).toLocaleDateString("es-ES",{weekday:"short",day:"numeric"}).replace(".","");}
function esHoy(iso){return iso===hoyISO;}
/* «hoy»: dato actualizado hoy. «nuevo dato»: dato de referencia (mensual, trimestral…) publicado en los últimos 7 días.
   Los datos que cambian a diario o cada semana (luz, mayorista, Brent, carburantes) solo llevan «hoy». */
var FRECUENTES=["luz","omie","brent","carburantes"],DIAS_NUEVO=7;
function esNuevo(iso,frec){if(!iso||frec)return false;var d=dias(iso,hoyISO);return d>0&&d<=DIAS_NUEVO;}
function horaGen(){try{return new Date(D.generado).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"});}catch(e){return "";}}
function badge(iso,frec){if(esHoy(iso))return '<span class="hoy" data-tip="Actualizado hoy a las '+horaGen()+'">hoy</span>';if(esNuevo(iso,frec)){var d=dias(iso,hoyISO);return '<span class="nuevo" data-tip="Dato nuevo: publicado '+(d===1?'ayer':'hace '+d+' días')+' ('+corto(iso)+')">nuevo dato</span>';}return "";}
/* «Dato de hace X días» y cuándo llega el siguiente */
function cuandoDato(iso){var d=dias(iso,hoyISO);return d<=0?"Dato de hoy":d===1?"Dato de ayer":d<45?"Dato de hace "+d+" días":"Dato de hace "+Math.round(d/30.4)+" meses";}
function mesNombre(off){var f=fecha(hoyISO);f.setDate(1);f.setMonth(f.getMonth()+off);return f.toLocaleDateString("es-ES",{month:"long"});}
function diaMes(iso){return fecha(iso).toLocaleDateString("es-ES",{day:"numeric",month:"long"});}
function proxButano(){var f=fecha(hoyISO);for(var k=0;k<4;k++){var m=new Date(f.getFullYear(),f.getMonth()+k,1,12);if(m.getMonth()%2!==0)continue;var c=0,dd=new Date(m);while(true){if(dd.getDay()===2){c++;if(c===3)break;}dd.setDate(dd.getDate()+1);}if(dd>=f)return dd;}return null;}
function proximo(blk){var sig=mesNombre(1),este=mesNombre(0);
  var ipcA=(D.agenda||[]).filter(function(a){return /^\d{4}-/.test(a.fecha)&&dias(hoyISO,a.fecha)>=0&&/IPC/.test(a.texto+a.titulo);})[0];
  var m={luz:"Cada tarde, hacia las 20:15, Red Eléctrica publica los precios de mañana.",
    recibo:"A primeros de "+sig+" FACUA publica el recibo de "+este+".",
    carburantes:"Cada semana, con el boletín petrolero de la UE.",gasoleo_c:"Cada semana, con el boletín petrolero de la UE.",
    brent:"Cotiza cada día; aquí se actualiza cada mañana laborable.",
    gas_tur:"El "+(D.gas_tur.proxima?diaMes(D.gas_tur.proxima):"próximo trimestre")+" (revisión trimestral del Gobierno).",
    butano:(function(){var b=proxButano();return b?"El "+b.toLocaleDateString("es-ES",{day:"numeric",month:"long"})+" (revisión cada dos meses, tercer martes).":"Cada dos meses.";})(),
    aceite:"A primeros de "+sig+", con el seguimiento de FACUA.",cesta:"A primeros de "+sig+", con el seguimiento de FACUA.",
    alquiler:"A primeros de "+sig+", con el informe de idealista.",vivienda:"A primeros de "+sig+", con el informe de idealista.",
    euribor:"El 1 de "+sig+" se conoce la media de "+este+".",
    bce:"Próxima reunión del BCE: "+(D.bce.proxima?diaMes(D.bce.proxima):"por anunciar")+".",
    ipc:ipcA?"El "+diaMes(ipcA.fecha)+" (INE).":"A mediados de mes el definitivo y a final de mes el adelantado (INE).",
    smi:"Se revisa una vez al año, normalmente a comienzos de año.",
    pension:"A final de mes, con la nómina de pensiones de la Seguridad Social.",
    paro:"A primeros de "+sig+" el Ministerio de Trabajo publica el paro de "+este+".",
    sello:"Una vez al año, en enero.",
    seguro_coche:"A mediados de mes, con el IPC definitivo del INE.",
    depositos:"A principios de mes el BCE publica los tipos de hace dos meses.",
    salario_medio:"Cada trimestre, con la Encuesta de Coste Laboral del INE (la próxima, a mediados de diciembre)."};
  return "Próximo dato: "+(m[blk]||"pronto.");}
function dias(a,b){return Math.round((fecha(b)-fecha(a))/864e5);}
$("hoyTxt").textContent=largo(hoyISO).replace(/^./,function(c){return c.toUpperCase();});
var gen=new Date(D.generado);
var genTxt=gen.toLocaleDateString("es-ES",{day:"numeric",month:"long",timeZone:"Europe/Madrid"})+" a las "+gen.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"});
$("genTxt").textContent=(esHoy(D.generado.slice(0,10))?"actualizado hoy a las "+horaGen():"actualizado el "+genTxt);$("genPie").textContent=genTxt;
document.querySelectorAll("[data-hoy]").forEach(function(s){var k=s.getAttribute("data-hoy");s.outerHTML=(D[k]&&D[k].actualizado)?badge(D[k].actualizado,FRECUENTES.indexOf(k)>=0):"";});

/* ---------- gráficos ---------- */
var NS="http://www.w3.org/2000/svg";
function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function tipFor(box){var t=document.createElement("div");t.className="tip";box.appendChild(t);return t;}
function showTip(t,box,x,y,html){t.innerHTML=html;var w=box.clientWidth;t.style.left=Math.max(60,Math.min(w-60,x))+"px";t.style.top=y+"px";t.classList.add("on");}
function niceTicks(min,max,n){var span=max-min||1,step=Math.pow(10,Math.floor(Math.log10(span/n)));var err=span/n/step;if(err>=7.5)step*=10;else if(err>=3.5)step*=5;else if(err>=1.5)step*=2;var t=[],v=Math.ceil(min/step)*step;for(;v<=max+1e-9;v+=step)t.push(+v.toFixed(6));return {t:t,step:step};}
function roundTop(x,y0,w,hh,r){if(hh<r)r=Math.max(0,hh);return "M"+x+","+(y0+hh)+"V"+(y0+r)+"Q"+x+","+y0+" "+(x+r)+","+y0+"H"+(x+w-r)+"Q"+(x+w)+","+y0+" "+(x+w)+","+(y0+r)+"V"+(y0+hh)+"Z";}
function barras(box,data,opt){_serUlt=null;
  if(typeof box==="string")box=$(box);box.innerHTML="";
  var W=opt.w||600,H=opt.h||240,m={l:44,r:8,t:14,b:28};
  var vals=data.map(function(d){return d[1];}).filter(function(v){return v!==null;});
  var maxV=Math.max.apply(null,vals)*1.08,minV=Math.min(0,Math.min.apply(null,vals));
  var tk=niceTicks(minV,maxV,4);maxV=Math.max(maxV,ultimo(tk.t));minV=Math.min(minV,tk.t[0]);
  var svg=el("svg",{viewBox:"0 0 "+W+" "+H,role:"img","aria-label":opt.aria},box);
  var y=function(v){return m.t+(H-m.t-m.b)*(1-(v-minV)/(maxV-minV));};
  var g=el("g",{"class":"grid"},svg);
  tk.t.forEach(function(v){el("line",{x1:m.l,x2:W-m.r,y1:y(v),y2:y(v)},g);var tx=el("text",{x:m.l-6,y:y(v)+4,"text-anchor":"end"},svg);tx.textContent=fmt(v,opt.dec===undefined?2:opt.dec);});
  var n=data.length,slot=(W-m.l-m.r)/n,bw=Math.max(4,slot-2),tip=tipFor(box);
  data.forEach(function(d,i){
    var x=m.l+i*slot+1;
    if(d[1]!==null){var top=y(Math.max(d[1],0)),bot=y(Math.min(d[1],0)),hh=Math.max(1,bot-top);el("path",{d:roundTop(x,top,bw,hh,Math.min(4,bw/2)),fill:opt.color?opt.color(d,i):css("--anil")},svg);
      if(opt.outline&&opt.outline(i))el("rect",{x:x-2,y:top-2,width:bw+4,height:hh+2,fill:"none",stroke:css("--tinta"),"stroke-width":2,rx:5},svg);}
    var hit=el("rect",{x:m.l+i*slot,y:m.t,width:slot,height:H-m.t-m.b,fill:"transparent"},svg);
    hit.addEventListener("pointerenter",function(){var r=box.clientWidth/W;showTip(tip,box,(x+bw/2)*r,(d[1]!==null?y(Math.max(d[1],0)):y(0))*r,"<b>"+d[0]+"</b> · "+(d[1]===null?"sin dato":opt.tipFmt(d[1])));});
    hit.addEventListener("pointerleave",function(){tip.classList.remove("on");});
    if(opt.every===undefined||i%opt.every===0||i===n-1){var tx=el("text",{x:x+bw/2,y:H-10,"text-anchor":"middle"},svg);tx.textContent=d[0];}
  });
}
var _serUlt=null;
function lineas(box,data,series,opt){_serUlt=series;
  if(typeof box==="string")box=$(box);box.innerHTML="";
  var W=opt.w||600,H=opt.h||240,m={l:48,r:66,t:14,b:28};
  var all=[];data.forEach(function(d){series.forEach(function(s){if(d[s.k]!==null&&d[s.k]!==undefined)all.push(d[s.k]);});});
  (opt.fondo||[]).forEach(function(f){f.forEach(function(v){if(v!==null)all.push(v);});});
  if(opt.extra)all=all.concat(opt.extra);
  var lo=Math.min.apply(null,all),hi=Math.max.apply(null,all),pad=(hi-lo)*0.12||1;
  var minV=opt.zero?Math.min(0,lo):lo-pad,maxV=hi+pad;var tk=niceTicks(minV,maxV,4);minV=Math.min(minV,tk.t[0]);maxV=Math.max(maxV,ultimo(tk.t));
  var svg=el("svg",{viewBox:"0 0 "+W+" "+H,role:"img","aria-label":opt.aria},box);
  var n=data.length,x=function(i){return m.l+(W-m.l-m.r)*(n===1?0.5:i/(n-1));};
  var y=function(v){return m.t+(H-m.t-m.b)*(1-(v-minV)/(maxV-minV));};
  var g=el("g",{"class":"grid"},svg);
  niceTicks(minV,maxV,4).t.forEach(function(v){el("line",{x1:m.l,x2:W-m.r,y1:y(v),y2:y(v)},g);var tx=el("text",{x:m.l-6,y:y(v)+4,"text-anchor":"end"},svg);tx.textContent=fmt(v,opt.dec===undefined?2:opt.dec);});
  data.forEach(function(d,i){if(opt.every===undefined||i%opt.every===0||i===n-1){var tx=el("text",{x:x(i),y:H-10,"text-anchor":"middle"},svg);tx.textContent=d[0];}});
  if(opt.ref){el("line",{x1:m.l,x2:W-m.r,y1:y(opt.ref.v),y2:y(opt.ref.v),stroke:css("--sube"),"stroke-width":1.5,"stroke-dasharray":"5 4"},svg);var rt=el("text",{x:m.l+4,y:y(opt.ref.v)-6,"class":"lbl"},svg);rt.textContent=opt.ref.label;}
  (opt.fondo||[]).forEach(function(f){var dd="";f.forEach(function(v,i){if(v===null)return;dd+=(dd?"L":"M")+x(i)+","+y(v);});el("path",{d:dd,fill:"none",stroke:css("--raya"),"stroke-width":1.5},svg);});
  series.forEach(function(s){
    var pts=[];data.forEach(function(d,i){var v=d[s.k];if(v===null||v===undefined)return;pts.push([x(i),y(v),v]);});
    if(!pts.length)return;
    var dStr=pts.map(function(p,j){return (j?"L":"M")+p[0]+","+p[1];}).join("");
    if(series.length===1&&!opt.fondo)el("path",{d:dStr+"L"+ultimo(pts)[0]+","+y(Math.max(minV,0))+"L"+pts[0][0]+","+y(Math.max(minV,0))+"Z",fill:s.color,opacity:.12},svg);
    el("path",{d:dStr,fill:"none",stroke:s.color,"stroke-width":s.ancho||2.2,"stroke-linejoin":"round","stroke-linecap":"round"},svg);
    if(n<=30)pts.forEach(function(p){el("circle",{cx:p[0],cy:p[1],r:2.6,fill:s.color},svg);});
    var last=ultimo(pts);el("circle",{cx:last[0],cy:last[1],r:5,fill:s.color,stroke:css("--tapia"),"stroke-width":2},svg);
    var lt=el("text",{x:last[0]+8,y:last[1]+4,"class":"lbl"},svg);lt.textContent=opt.lastFmt(last[2]);
  });
  var tip=tipFor(box),cross=el("line",{y1:m.t,y2:H-m.b,stroke:css("--tinta-2"),"stroke-width":1,opacity:0},svg);
  var hit=el("rect",{x:m.l,y:m.t,width:W-m.l-m.r,height:H-m.t-m.b,fill:"transparent"},svg);
  hit.addEventListener("pointermove",function(ev){var r=svg.getBoundingClientRect(),sx=(ev.clientX-r.left)*W/r.width;var i=Math.round((sx-m.l)/(W-m.l-m.r)*(n-1));i=Math.max(0,Math.min(n-1,i));cross.setAttribute("x1",x(i));cross.setAttribute("x2",x(i));cross.setAttribute("opacity",.6);
    var html="<b>"+data[i][0]+"</b>";series.forEach(function(s){var v=data[i][s.k];html+="<br>"+s.name+": "+(v===null||v===undefined?"sin dato":opt.tipFmt(v));});
    var top=Math.min.apply(null,series.map(function(s){var v=data[i][s.k];return v===null||v===undefined?H:y(v);}));showTip(tip,box,x(i)*r.width/W,top*r.width/W,html);});
  hit.addEventListener("pointerleave",function(){tip.classList.remove("on");cross.setAttribute("opacity",0);});
}
function spark(vals,color){
  var W=220,H=36,p=4,v=vals.filter(function(a){return a!==null&&a!==undefined;});if(v.length<2)return "";
  var lo=Math.min.apply(null,v),hi=Math.max.apply(null,v);if(hi===lo){hi+=1;lo-=1;}
  var pts=[];vals.forEach(function(a,i){if(a===null||a===undefined)return;pts.push([p+(W-2*p)*i/(vals.length-1),p+(H-2*p)*(1-(a-lo)/(hi-lo))]);});
  var d=pts.map(function(q,i){return (i?"L":"M")+q[0].toFixed(1)+","+q[1].toFixed(1);}).join(""),l=ultimo(pts);
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><path d="'+d+"L"+l[0]+","+H+"L"+pts[0][0]+","+H+'Z" fill="'+color+'" opacity=".12"/><path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/><circle cx="'+l[0]+'" cy="'+l[1]+'" r="3.5" fill="'+color+'"/></svg>';
}

/* ---------- datos derivados ---------- */
var L=D.luz,horas=L.horas,media=horas.reduce(function(a,b){return a+b;},0)/24;
var iMin=horas.indexOf(Math.min.apply(null,horas)),iMax=horas.indexOf(Math.max.apply(null,horas));
function tramo(arr,dir){var best=0,bv=dir>0?-1e9:1e9;for(var i=6;i<=21;i++){var s=arr[i]+arr[i+1]+arr[i+2];if(dir>0?s>bv:s<bv){bv=s;best=i;}}return [best,bv/3];}
var barato=tramo(horas,-1),caro=tramo(horas,1);
var luzEsHoy=esHoy(L.fecha);
var C=D.carburantes,fl=ultimo(C.serie),flp=C.serie[C.serie.length-2];
var BR=D.brent.serie,bl=ultimo(BR)[1],bp=BR[BR.length-3][1];
var E=D.euribor.serie,eu1=ultimo(E)[1],eu0=E[0][1],euP=E[E.length-2][1];
var I=D.ipc.serie,ipc1=ultimo(I)[1],ipcP=I[I.length-2][1];
var OM=D.omie.serie,om1=ultimo(OM)[1],omP=OM[OM.length-2][1];
var mesLuz=ultimo(L.meses)[1];
var RC=D.recibo,GT=D.gas_tur;

function cuota(Cap,tipo,anios){var r=tipo/100/12,n=anios*12;return r===0?Cap/n:Cap*r/(1-Math.pow(1+r,-n));}
var c0=cuota(150000,eu0+0.8,20),c1=cuota(150000,eu1+0.8,20),cP=cuota(150000,euP+0.8,20);
function hLuz(recibo,smi){return recibo/(smi*14/12/173.3);}

/* ---------- Remedios en portada: una actividad distinta en cada visita ---------- */
var acts=Remedios.actividades,act=acts[Math.floor(Math.random()*acts.length)];
try{var prev=sessionStorage.getItem("celv-act");if(prev===act)act=acts[(acts.indexOf(act)+1)%acts.length];sessionStorage.setItem("celv-act",act);}catch(e){}
$("remediosHoy").innerHTML=Remedios.figura({edad:81,anio:2026,actividad:act});
$("piePortada").textContent="Remedios, 81 años, "+Remedios.pie(act);
$("remediosApuntes").innerHTML=Remedios.apuntes();

/* ---------- Ventana emergente ---------- */
var velo=$("velo"),vCuerpo=$("vCuerpo"),ultimoFoco=null;
function abrir(html,despues){ultimoFoco=document.activeElement;vCuerpo.innerHTML=html;velo.hidden=false;document.body.style.overflow="hidden";$("vCerrar").focus();if(despues)despues();}
function cerrar(){velo.hidden=true;document.body.style.overflow="";if(ultimoFoco)ultimoFoco.focus();}
$("vCerrar").addEventListener("click",cerrar);
velo.addEventListener("click",function(e){if(e.target===velo)cerrar();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!velo.hidden)cerrar();});

/* ---------- Tarjetas ---------- */
var smiS=D.smi.serie;
var tiles=[
 {id:"luz",blk:"luz",sec:"luz",ico:"luz",t:"Luz PVPC",f:L.fecha,act:L.actualizado,v:fmt(media,3),u:"€/kWh",
  ant:{k:"Ayer",ref:fmt(L.media_ayer,3),p:pct(media,L.media_ayer)},anio:{k:"Nov. 2025",ref:fmt(L.media_hace_un_anio,3),p:pct(media,L.media_hace_un_anio)},
  sp:L.dias.map(function(d){return d[1];}),n:"Media del día, sin impuestos",
  info:"Es el precio medio del kWh en la tarifa regulada (PVPC) para hoy, solo el término de energía y sin impuestos. Lo publica Red Eléctrica cada tarde para el día siguiente. Lo de hace un año compara con la media de noviembre de 2025.",
  graf:function(b){lineas(b,L.meses,[{k:1,color:css("--anil"),name:"PVPC"}],{aria:"Media mensual del PVPC",h:260,every:2,dec:2,zero:true,lastFmt:function(v){return fmt(v,3);},tipFmt:function(v){return fmt(v,3)+" €/kWh";}});},fuente:L.fuente},
 {id:"recibo",blk:"recibo",sec:"luz",ico:"factura",t:"Recibo de la luz (usuario medio)",f:RC.fecha,act:RC.actualizado,v:fmt(RC.valor,2),u:"€/mes",
  ant:{k:"Septiembre",ref:fmt(RC.anterior,2)+" €",p:pct(RC.valor,RC.anterior)},anio:{k:"Oct. 2025",ref:fmt(RC.hace_un_anio,2)+" €",p:pct(RC.valor,RC.hace_un_anio)},
  sp:RC.serie.map(function(d){return d[1];}),n:"PVPC, 4,4 kW y 366 kWh, con impuestos",
  info:"Lo que paga en un mes completo un hogar normal con la tarifa regulada (PVPC): 4,4 kW de potencia y 366 kWh de consumo, con potencia, energía, alquiler del contador e impuestos. Lo calcula FACUA a partir de los precios oficiales cada mes. Es la cifra que de verdad llega a casa.",
  graf:function(b){lineas(b,RC.serie,[{k:1,color:css("--anil"),name:"Recibo"}],{aria:"Recibo de la luz del usuario medio",h:260,dec:0,zero:true,lastFmt:function(v){return eur(v,0);},tipFmt:function(v){return eur(v,2);}});},fuente:RC.fuente,nota:"Los meses de la serie no son todos consecutivos: solo se muestran los publicados con el mismo perfil."},
 {id:"horasluz",blk:"recibo",sec:"luz",ico:"nomina",t:"Horas de trabajo para pagar la luz",f:RC.fecha,act:RC.actualizado,v:fmt(hLuz(RC.valor,D.smi.valor),1),u:"horas",
  ant:{k:"Septiembre",ref:fmt(hLuz(RC.anterior,D.smi.valor),1)+" h",p:pct(hLuz(RC.valor,D.smi.valor),hLuz(RC.anterior,D.smi.valor))},anio:{k:"Oct. 2025",ref:fmt(hLuz(RC.hace_un_anio,D.smi.anterior),1)+" h",p:pct(hLuz(RC.valor,D.smi.valor),hLuz(RC.hace_un_anio,D.smi.anterior))},
  sp:RC.serie.map(function(d,k){return hLuz(d[1],k<2?D.smi.anterior:D.smi.valor);}),n:"Con el salario mínimo bruto",
  info:"Cuántas horas tiene que trabajar alguien que cobra el salario mínimo para pagar el recibo mensual de la luz del usuario medio. El salario mínimo de "+eur(D.smi.valor,0)+" en 14 pagas sale a unos "+eur(D.smi.valor*14/12/173.3,2)+" brutos la hora (40 horas a la semana). Junta lo que sube la luz con lo que sube el sueldo.",
  graf:function(b){lineas(b,RC.serie.map(function(d,k){return [d[0],hLuz(d[1],k<2?D.smi.anterior:D.smi.valor)];}),[{k:1,color:css("--anil"),name:"Horas"}],{aria:"Horas de salario mínimo para pagar la luz",h:240,dec:0,zero:true,lastFmt:function(v){return fmt(v,1)+" h";},tipFmt:function(v){return fmt(v,1)+" horas";}});},fuente:RC.fuente,nota:"Cálculo propio con el recibo de FACUA y el salario mínimo de cada año."},
 {id:"gasolina",blk:"carburantes",sec:"gasolinera",ico:"surtidor",t:"Gasolina 95",f:C.fecha,act:C.actualizado,v:fmt(fl[1],3),u:"€/l",
  ant:{k:"Semana anterior",ref:fmt(flp[1],3),p:pct(fl[1],flp[1])},anio:{k:C.hace_un_anio.etiqueta,ref:fmt(C.hace_un_anio.gasolina,2),p:pct(fl[1],C.hace_un_anio.gasolina)},
  sp:C.serie.map(function(d){return d[1];}),n:"Media nacional de estaciones",
  info:"Precio medio del litro de gasolina 95 en las más de 11.000 gasolineras que informan al Geoportal de Hidrocarburos del Ministerio, con impuestos.",
  graf:function(b){lineas(b,C.serie,[{k:1,color:css("--anil"),name:"Gasolina 95"},{k:2,color:css("--albero"),name:"Diésel"}],{aria:"Gasolina y diésel",h:260,every:2,dec:2,lastFmt:function(v){return fmt(v,2)+" €";},tipFmt:function(v){return fmt(v,3)+" €/l";}});},fuente:C.fuente},
 {id:"diesel",blk:"carburantes",sec:"gasolinera",ico:"diesel",t:"Diésel",f:C.fecha,act:C.actualizado,v:fmt(fl[2],3),u:"€/l",
  ant:{k:"Semana anterior",ref:fmt(flp[2],3),p:pct(fl[2],flp[2])},anio:{k:C.hace_un_anio.etiqueta,ref:fmt(C.hace_un_anio.diesel,2),p:pct(fl[2],C.hace_un_anio.diesel)},
  sp:C.serie.map(function(d){return d[2];}),n:"Media nacional de estaciones",
  info:"Precio medio del litro de gasóleo A (el de los coches diésel) en las gasolineras de toda España, con impuestos. Desde la guerra de Irán cuesta más que la gasolina.",
  graf:function(b){lineas(b,C.serie,[{k:1,color:css("--anil"),name:"Gasolina 95"},{k:2,color:css("--albero"),name:"Diésel"}],{aria:"Gasolina y diésel",h:260,every:2,dec:2,lastFmt:function(v){return fmt(v,2)+" €";},tipFmt:function(v){return fmt(v,3)+" €/l";}});},fuente:C.fuente},
 {id:"brent",blk:"brent",sec:"gasolinera",ico:"barril",t:"Petróleo Brent",f:D.brent.fecha,act:D.brent.actualizado,v:fmt(bl,2),u:"$/barril",
  ant:{k:"Semana anterior",ref:fmt(bp,2),p:pct(bl,bp)},anio:{k:"Nov. 2025",ref:fmt(BR[0][1],1),p:pct(bl,BR[0][1])},
  sp:BR.map(function(d){return d[1];}),n:"Futuro de enero, ICE Londres",
  info:"El Brent es el petróleo de referencia en Europa. Lo que pasa con el barril llega a las gasolineras con unas semanas de retraso, y no siempre en la misma proporción.",
  graf:function(b){lineas(b,BR,[{k:1,color:css("--anil"),name:"Brent"}],{aria:"Brent",h:260,dec:0,lastFmt:function(v){return fmt(v,2)+" $";},tipFmt:function(v){return fmt(v,2)+" $";}});},fuente:D.brent.fuente},
 {id:"seguro",blk:"seguro_coche",sec:"gasolinera",ico:"coche",t:"Seguro del coche",f:D.seguro_coche.fecha,act:D.seguro_coche.actualizado,v:fmt(D.seguro_coche.valor,1),u:"% en un año",
  ant:{k:"Agosto",ref:fmt(D.seguro_coche.anterior,1)+" %",p:D.seguro_coche.valor-D.seguro_coche.anterior,pt:true},anio:{k:"IPC general",ref:fmt(ipc1,1)+" %",p:D.seguro_coche.valor-ipc1,pt:true},
  sp:D.seguro_coche.serie.map(function(d){return d[1];}),n:"Subida del precio medio, IPC del INE",
  info:"Cuánto ha subido en un año el precio medio del seguro de los coches particulares, según el IPC del INE. No es lo que paga cada conductor, sino cómo evoluciona el precio medio. Aquí la comparación «de un año» se hace frente a la inflación general.",
  graf:function(b){var sc=D.seguro_coche;lineas(b,sc.serie.map(function(r,k){return [r[0],r[1],sc.ipc_serie[k][1]];}),[{k:1,color:css("--anil"),name:"Seguro del coche"},{k:2,color:css("--albero"),name:"IPC general"}],{aria:"Seguro del coche frente al IPC",h:240,dec:1,zero:true,lastFmt:function(v){return fmt(v,1)+" %";},tipFmt:function(v){return fmt(v,1)+" %";}});},fuente:D.seguro_coche.fuente},
 {id:"gastur",blk:"gas_tur",sec:"calefaccion",ico:"llama",t:"Gas natural (TUR2)",f:GT.fecha,act:GT.actualizado,v:fmt(GT.variable,2),u:"c€/kWh",
  ant:{k:"Julio",ref:fmt(GT.variable_julio,2),p:pct(GT.variable,GT.variable_julio)},anio:{k:"Oct. 2025",ref:fmt(GT.variable_hace_un_anio,2),p:pct(GT.variable,GT.variable_hace_un_anio)},
  sp:GT.serie.map(function(d){return d[1];}),n:"Tarifa regulada, sin impuestos",
  info:"Precio de cada kWh de gas en la tarifa de último recurso TUR2, la de los hogares con calefacción de gas (de 5.000 a 15.000 kWh al año). El Gobierno lo revisa cada tres meses; el término fijo es de "+eur(GT.fijo)+" al mes. Un hogar que gasta 9.000 kWh al año paga unos "+eur(GT.recibo_mes.octubre)+" al mes, frente a "+eur(GT.recibo_mes.julio)+" en verano.",
  graf:function(b){lineas(b,GT.serie,[{k:1,color:css("--anil"),name:"TUR2"}],{aria:"Gas TUR2",h:240,dec:1,zero:true,lastFmt:function(v){return fmt(v,2);},tipFmt:function(v){return fmt(v,2)+" c€/kWh";}});},fuente:GT.fuente,nota:"Revisiones trimestrales; faltan las de enero y abril de 2026."},
 {id:"butano",blk:"butano",sec:"calefaccion",ico:"butano",t:"Bombona de butano",f:D.butano.fecha,act:D.butano.actualizado,v:fmt(D.butano.valor,2),u:"€",
  ant:{k:"Revisión de julio",ref:"17,83",p:pct(D.butano.valor,17.83)},anio:{k:"Ene. 2026",ref:"15,58",p:pct(D.butano.valor,15.58)},
  sp:D.butano.serie.map(function(d){return d[1];}),n:"12,5 kg · tope de 19,55 €",
  info:"Precio máximo de la bombona de butano de 12,5 kg en la península. Lo revisa el Gobierno cada dos meses y, hasta el 30 de junio de 2027, no puede pasar de 19,55 €.",
  graf:function(b){lineas(b,D.butano.serie,[{k:1,color:css("--albero"),name:"Bombona"}],{aria:"Butano",h:240,dec:0,extra:[D.butano.tope,15],ref:{v:D.butano.tope,label:"Tope 19,55 €"},lastFmt:function(v){return eur(v);},tipFmt:function(v){return eur(v);}});},fuente:D.butano.fuente},
 {id:"gasoleoc",blk:"gasoleo_c",sec:"calefaccion",ico:"radiador",t:"Gasóleo de calefacción",f:D.gasoleo_c.fecha,act:D.gasoleo_c.actualizado,v:fmt(D.gasoleo_c.valor,3),u:"€/l",
  ant:{k:"Media de junio",ref:fmt(D.gasoleo_c.junio,3),p:pct(D.gasoleo_c.valor,D.gasoleo_c.junio)},anio:{k:"Hace un año",ref:null,p:null},
  sp:D.gasoleo_c.serie.map(function(d){return d[1];}),n:"Gasóleo C, media semanal",
  info:"Precio medio del litro de gasóleo C, el de las calderas de las casas, según el Boletín Petrolero de la Comisión Europea. Va a precio libre: cada distribuidor pone el suyo.",
  graf:function(b){lineas(b,D.gasoleo_c.serie,[{k:1,color:css("--anil"),name:"Gasóleo C"}],{aria:"Gasóleo de calefacción",h:240,dec:2,lastFmt:function(v){return fmt(v,3)+" €";},tipFmt:function(v){return fmt(v,3)+" €/l";}});},fuente:D.gasoleo_c.fuente},
 {id:"aceite",blk:"aceite",sec:"cesta",ico:"aceite",t:"Aceite de oliva v. extra",f:D.aceite.fecha,act:D.aceite.actualizado,v:fmt(D.aceite.valor,2),u:"€/l",
  ant:{k:"Mes anterior",ref:null,p:D.aceite.mes},anio:{k:"Oct. 2025",ref:null,p:D.aceite.anio},
  sp:null,n:"Litro de marca blanca más barato",
  info:"Precio del litro de aceite de oliva virgen extra de marca blanca más barato de los grandes supermercados, y variación media según el seguimiento mensual de FACUA.",
  graf:function(b){barras(b,D.cesta.mes.map(function(r){return [r[1].split(" ")[0],r[2]];}),{aria:"Variación mensual de alimentos",h:240,dec:0,color:function(d){return d[1]>0?css("--sube"):css("--baja");},tipFmt:function(v){return fmt(v,1)+" %";}});},fuente:D.aceite.fuente,nota:"El gráfico muestra la variación mensual de todos los alimentos del seguimiento."},
 {id:"alquiler",blk:"alquiler",sec:"vivienda",ico:"llave",t:"Alquiler",f:D.alquiler.fecha,act:D.alquiler.actualizado,v:fmt(D.alquiler.valor,1),u:"€/m²",
  ant:{k:"Junio",ref:"15,3",p:pct(D.alquiler.valor,15.3)},anio:{k:"Oct. 2025",ref:null,p:D.alquiler.interanual},
  sp:D.alquiler.serie.map(function(d){return d[1];}),n:"Precio de oferta, idealista",
  info:"Precio medio que piden los anuncios de alquiler por metro cuadrado y mes. Un piso de 70 m² sale por unos "+eur(D.alquiler.valor*70,0)+" al mes.",
  graf:function(b){lineas(b,D.alquiler.serie,[{k:1,color:css("--anil"),name:"Alquiler"}],{aria:"Alquiler",h:220,dec:1,lastFmt:function(v){return fmt(v,1)+" €";},tipFmt:function(v){return fmt(v,1)+" €/m²";}});},fuente:D.alquiler.fuente},
 {id:"vivienda",blk:"vivienda",sec:"vivienda",ico:"casa",t:"Comprar vivienda",f:D.vivienda.fecha,act:D.vivienda.actualizado,v:fmt(D.vivienda.valor,0),u:"€/m²",
  ant:{k:"Julio",ref:"2.933",p:pct(D.vivienda.valor,2933)},anio:{k:"3.er trim. 2025",ref:null,p:D.vivienda.interanual},
  sp:D.vivienda.serie.map(function(d){return d[1];}),n:"Vivienda usada, idealista",
  info:"Precio medio que piden los anuncios de vivienda usada. Un piso de 80 m² sale por unos "+eur(D.vivienda.valor*80,0)+": "+fmt(D.vivienda.valor*80/(D.smi.valor*14),1)+" años de salario mínimo íntegro.",
  graf:function(b){lineas(b,D.vivienda.serie,[{k:1,color:css("--anil"),name:"Vivienda"}],{aria:"Vivienda",h:240,dec:0,lastFmt:function(v){return fmt(v,0)+" €";},tipFmt:function(v){return fmt(v,0)+" €/m²";}});},fuente:D.vivienda.fuente},
 {id:"euribor",blk:"euribor",sec:"vivienda",ico:"hipoteca",t:"Euríbor 12 meses",f:D.euribor.fecha,act:D.euribor.actualizado,v:fmt(eu1,3),u:"%",
  ant:{k:"Mes anterior",ref:fmt(euP,3),p:pct(eu1,euP)},anio:{k:"Oct. 2025",ref:fmt(eu0,3),p:pct(eu1,eu0)},
  sp:E.map(function(d){return d[1];}),n:"Media mensual",
  info:"Es la referencia con la que el banco revisa las hipotecas variables: se usa la media del mes, no el valor de un día. Con 150.000 € a 20 años y euríbor + 0,8, la cuota ha pasado de "+eur(c0,0)+" a "+eur(c1,0)+" al mes en un año.",
  graf:function(b){lineas(b,E,[{k:1,color:css("--anil"),name:"Euríbor"}],{aria:"Euríbor",h:260,every:2,dec:1,lastFmt:function(v){return fmt(v,3)+" %";},tipFmt:function(v){return fmt(v,3)+" %";}});},fuente:D.euribor.fuente},
 {id:"cuota",blk:"euribor",sec:"vivienda",ico:"hipoteca",t:"Cuota de una hipoteca variable",f:D.euribor.fecha,act:D.euribor.actualizado,v:fmt(c1,0),u:"€/mes",
  ant:{k:"Mes anterior",ref:eur(cP,0),p:pct(c1,cP)},anio:{k:"Oct. 2025",ref:eur(c0,0),p:pct(c1,c0)},
  sp:E.map(function(d){return cuota(150000,d[1]+0.8,20);}),n:"150.000 € a 20 años, euríbor + 0,8",
  info:"Lo que pagaría al mes una hipoteca de 150.000 € pendientes a 20 años con un diferencial de 0,8 puntos si se revisara con el euríbor de ese mes. Al año son "+eur((c1-c0)*12,0)+" más que con el euríbor de hace un año.",
  graf:function(b){lineas(b,E.map(function(d){return [d[0],cuota(150000,d[1]+0.8,20)];}),[{k:1,color:css("--anil"),name:"Cuota"}],{aria:"Cuota hipotecaria",h:240,every:2,dec:0,lastFmt:function(v){return eur(v,0);},tipFmt:function(v){return eur(v,0)+" al mes";}});},fuente:D.euribor.fuente},
 {id:"bce",blk:"bce",sec:"vivienda",ico:"banco",t:"Tipo de interés del BCE",f:D.bce.fecha,act:D.bce.actualizado,v:fmt(D.bce.valor,2),u:"%",
  ant:{k:"Hasta septiembre",ref:fmt(D.bce.anterior,2)+" %",p:D.bce.valor-D.bce.anterior,pt:true},anio:{k:"Oct. 2025",ref:fmt(D.bce.hace_un_anio,2)+" %",p:D.bce.valor-D.bce.hace_un_anio,pt:true},
  sp:D.bce.serie.map(function(d){return d[1];}),n:"Facilidad de depósito",
  info:"Es el tipo que fija el Banco Central Europeo y del que dependen el euríbor, las hipotecas y lo que pagan los depósitos. Lo ha subido dos veces en 2026 para frenar la inflación. Próxima reunión: 17 de diciembre.",
  graf:function(b){lineas(b,D.bce.serie,[{k:1,color:css("--anil"),name:"Tipo BCE"}],{aria:"Tipo del BCE",h:240,dec:2,lastFmt:function(v){return fmt(v,2)+" %";},tipFmt:function(v){return fmt(v,2)+" %";}});},fuente:D.bce.fuente},
 {id:"hipotecas",blk:"depositos",sec:"vivienda",ico:"casa",t:"Interés de las hipotecas nuevas",f:D.depositos.fecha,act:D.depositos.actualizado,v:fmt(D.depositos.hipoteca,2),u:"%",
  ant:{k:"Junio",ref:fmt(D.depositos.hipoteca_anterior,2)+" %",p:D.depositos.hipoteca-D.depositos.hipoteca_anterior,pt:true},anio:{k:"Hace un año",ref:null,p:null},
  sp:null,n:"Indicador del BCE, zona del euro",
  info:"El interés medio de las hipotecas nuevas para comprar vivienda en la zona del euro, según el BCE. Sube detrás del euríbor y de los tipos del BCE.",
  graf:function(b){var dp=D.depositos;barras(b,[["Cuenta corriente",dp.vista],["Depósito 1 año",dp.valor],["Hipoteca nueva",dp.hipoteca],["Crédito consumo",dp.consumo]],{aria:"Lo que te pagan y lo que te cobran",h:240,dec:0,color:function(x,k){return k<2?css("--baja"):css("--sube");},tipFmt:function(v){return fmt(v,2)+" %";}});},fuente:D.depositos.fuente,nota:"En verde, lo que te paga el banco; en rojo, lo que te cobra."},
 {id:"depositos",blk:"depositos",bueno:true,sec:"vivienda",ico:"hucha",t:"Lo que paga un depósito",f:D.depositos.fecha,act:D.depositos.actualizado,v:fmt(D.depositos.valor,2),u:"% al año",
  ant:{k:"Junio",ref:fmt(D.depositos.anterior,2)+" %",p:D.depositos.valor-D.depositos.anterior,pt:true},anio:{k:"IPC general",ref:fmt(ipc1,1)+" %",p:D.depositos.valor-ipc1,pt:true},
  sp:null,n:"Depósito a 1 año, zona del euro",
  info:"El interés medio que pagan los bancos por los depósitos nuevos de los hogares a un año o menos, en la zona del euro (BCE). Aquí una subida es buena para quien ahorra, por eso sale en verde. La comparación «de un año» es frente a la inflación: si el depósito paga menos que lo que suben los precios, el ahorro pierde valor.",
  graf:function(b){var dp=D.depositos;barras(b,[["Cuenta corriente",dp.vista],["Depósito 1 año",dp.valor],["Hipoteca nueva",dp.hipoteca],["Crédito consumo",dp.consumo]],{aria:"Lo que te pagan y lo que te cobran",h:240,dec:0,color:function(x,k){return k<2?css("--baja"):css("--sube");},tipFmt:function(v){return fmt(v,2)+" %";}});},fuente:D.depositos.fuente,nota:"En verde, lo que te paga el banco; en rojo, lo que te cobra."},
 {id:"ipc",blk:"ipc",sec:"ipc",ico:"monedero",t:"Inflación (IPC)",f:D.ipc.fecha,act:D.ipc.actualizado,v:fmt(ipc1,1),u:"%",
  ant:{k:"Mes anterior",ref:fmt(ipcP,1)+" %",p:ipc1-ipcP,pt:true},anio:{k:"Oct. 2025",ref:fmt(D.ipc.hace_un_anio,1)+" %",p:ipc1-D.ipc.hace_un_anio,pt:true},
  sp:I.map(function(d){return d[1];}),n:D.ipc.provisional?"Dato adelantado del INE":"INE",
  info:"El IPC mide cuánto han subido los precios en un año. Un 4,9 % quiere decir que lo que costaba 100 € hace un año cuesta hoy 104,90 €. Aquí se compara en puntos: la diferencia entre la tasa de ahora y la de antes.",
  graf:function(b){lineas(b,I,[{k:1,color:css("--anil"),name:"IPC general"},{k:2,color:css("--albero"),name:"Subyacente"}],{aria:"IPC",h:260,dec:1,zero:true,lastFmt:function(v){return fmt(v,1)+" %";},tipFmt:function(v){return fmt(v,1)+" %";}});},fuente:D.ipc.fuente},
 {id:"smi",blk:"smi",bueno:true,sec:"ipc",ico:"nomina",t:"Salario mínimo",f:D.smi.fecha,act:D.smi.actualizado,v:fmt(D.smi.valor,0),u:"€/mes",
  ant:{k:"2025",ref:fmt(D.smi.anterior,0)+" €",p:pct(D.smi.valor,D.smi.anterior)},anio:{k:"2025",ref:fmt(D.smi.anterior,0)+" €",p:pct(D.smi.valor,D.smi.anterior)},
  sp:smiS.slice(-9).map(function(d){return d[1];}),n:"14 pagas · RD 126/2026",
  info:"Aquí una subida es buena noticia, por eso sale en verde. Lo mínimo que se puede cobrar por una jornada completa, en 14 pagas. En 1976 eran 68,51 € al mes (11.399 pesetas). Ha subido un 3,1 % en 2026, menos que los precios.",
  graf:function(b){lineas(b,smiS,[{k:1,color:css("--anil"),name:"Salario mínimo"}],{aria:"Salario mínimo",h:260,dec:0,zero:true,lastFmt:function(v){return fmt(v,0)+" €";},tipFmt:function(v){return eur(v,2);}});},fuente:D.smi.fuente,nota:"Los años de la serie no son consecutivos antes de 2018."},
 {id:"pension",blk:"pension",bueno:true,sec:"ipc",ico:"pension",t:"Pensión media de jubilación",f:D.pension.fecha,act:D.pension.actualizado,v:fmt(D.pension.valor,1),u:"€/mes",
  ant:{k:"Oct. 2025",ref:fmt(D.pension.hace_un_anio,0)+" €",p:pct(D.pension.valor,D.pension.hace_un_anio)},anio:{k:"Oct. 2025",ref:fmt(D.pension.hace_un_anio,0)+" €",p:pct(D.pension.valor,D.pension.hace_un_anio)},
  sp:null,n:"Seguridad Social, mensual",
  info:"Aquí una subida es buena noticia, por eso sale en verde. La pensión media de jubilación que paga la Seguridad Social. La pensión media de todo el sistema (con viudedad e incapacidad) es de "+eur(D.pension.media_sistema,1)+". Sube porque se revalorizan y porque las nuevas jubilaciones son más altas.",
  graf:function(b){lineas(b,[["oct 25",D.pension.hace_un_anio],["oct 26",D.pension.valor]],[{k:1,color:css("--anil"),name:"Pensión media"}],{aria:"Pensión media",h:220,dec:0,lastFmt:function(v){return eur(v,0);},tipFmt:function(v){return eur(v,1);}});},fuente:D.pension.fuente},
 {id:"salario",blk:"salario_medio",bueno:true,sec:"ipc",ico:"maletin",t:"Salario medio",f:D.salario_medio.fecha,act:D.salario_medio.actualizado,v:fmt(D.salario_medio.valor,0),u:"€/mes",
  ant:{k:"1.er trim. 2025",ref:eur(D.salario_medio.valor/(1+D.salario_medio.interanual/100),0),p:D.salario_medio.interanual},anio:{k:"1.er trim. 2025",ref:eur(D.salario_medio.valor/(1+D.salario_medio.interanual/100),0),p:D.salario_medio.interanual},
  sp:D.salario_medio.ees_serie.map(function(d){return d[1];}),n:"Coste salarial por trabajador, INE",
  info:"Lo que cobra de media un trabajador al mes (bruto, prorrateando pagas extra), según la Encuesta Trimestral de Coste Laboral del INE. La Encuesta de Estructura Salarial, que se publica con dos años de retraso, lo sitúa en "+eur(D.salario_medio.ees_anual,0)+" brutos al año en "+D.salario_medio.ees_anio+" (la mitad de los trabajadores cobra menos de "+eur(D.salario_medio.ees_mediana,0)+").",
  graf:function(b){lineas(b,D.salario_medio.ees_serie,[{k:1,color:css("--anil"),name:"Salario medio anual"}],{aria:"Salario medio anual",h:240,dec:0,lastFmt:function(v){return eur(v,0);},tipFmt:function(v){return eur(v,0)+" al año";}});},fuente:D.salario_medio.fuente,nota:"El gráfico muestra el salario medio anual de la Encuesta de Estructura Salarial (último año publicado: "+D.salario_medio.ees_anio+")."},
 {id:"paro",blk:"paro",sec:"ipc",ico:"maletin",t:"Paro registrado",f:D.paro.fecha,act:D.paro.actualizado,v:fmt(D.paro.valor/1e6,2),u:"millones",
  ant:{k:"Septiembre",ref:fmt(D.paro.anterior/1e6,2)+" M",p:pct(D.paro.valor,D.paro.anterior)},anio:{k:"Oct. 2025",ref:fmt(D.paro.hace_un_anio/1e6,2)+" M",p:pct(D.paro.valor,D.paro.hace_un_anio)},
  sp:D.paro.serie.map(function(d){return d[1];}),n:"Último día del mes, SEPE",
  info:"Personas apuntadas como demandantes de empleo en las oficinas públicas el último día del mes: "+fmt(D.paro.valor,0)+" en octubre. En otoño suele subir porque acaba la temporada de verano. Mientras, la afiliación a la Seguridad Social está en "+D.paro.afiliados_txt+".",
  graf:function(b){lineas(b,D.paro.serie,[{k:1,color:css("--anil"),name:"Parados"}],{aria:"Paro registrado",h:220,dec:0,lastFmt:function(v){return fmt(v/1e6,2)+" M";},tipFmt:function(v){return fmt(v,0)+" personas";}});},fuente:D.paro.fuente,nota:"Solo tres puntos: octubre de 2025, septiembre y octubre de 2026."},
 {id:"sello",blk:"sello",sec:"cuenta",ico:"sello",t:"Sello de una carta",f:D.sello.fecha,act:D.sello.actualizado,v:fmt(D.sello.valor,2),u:"€",
  ant:{k:"2025",ref:fmt(D.sello.anterior,2)+" €",p:pct(D.sello.valor,D.sello.anterior)},anio:{k:"2025",ref:fmt(D.sello.anterior,2)+" €",p:pct(D.sello.valor,D.sello.anterior)},
  sp:D.sello.serie.map(function(d){return d[1];}),n:"Carta nacional hasta 20 g",
  info:"Lo que cuesta enviar una carta ordinaria nacional de hasta 20 gramos. En 2015 costaba 0,42 €: desde entonces ha subido más del doble.",
  graf:function(b){lineas(b,D.sello.serie,[{k:1,color:css("--anil"),name:"Sello"}],{aria:"Sello",h:240,dec:2,lastFmt:function(v){return eur(v);},tipFmt:function(v){return eur(v);}});},fuente:D.sello.fuente}
];
tiles.forEach(function(t){
  if(t.id==="depositos"||t.id==="hipotecas")t.ley=[[css("--baja"),"Lo que te paga el banco"],[css("--sube"),"Lo que te cobra el banco"]];
  if(t.id==="aceite")t.ley=[[css("--sube"),"Alimentos que suben este mes"],[css("--baja"),"Alimentos que bajan"]];
  if(t.id==="butano")t.ley=[[css("--albero"),"Precio de la bombona"],[css("--sube"),"Tope máximo (línea discontinua)"]];
  if(t.id==="luz")t.ley=[[css("--anil"),"Media de cada mes del PVPC"]];
});
var modo="ant";
var globo=$("globo");
function cmpTxt(c,bueno){if(c.p===null||c.p===undefined)return '<span class="chg plano">sin dato</span>';var s=estado(c.p,c.pt?0.05:0.5);return '<span class="chg '+tono(s,bueno)+'">'+(s==="sube"?"▲ ":s==="baja"?"▼ ":"= ")+fmt(Math.abs(c.p),1)+(c.pt?" pt":" %")+'</span>';}
function nivel(c){if(c.p===null||c.p===undefined)return 0;var m=Math.abs(c.p)/(c.pt?0.1:1);return m<0.5?0:m<3?1:m<10?2:3;}
function pctTag(c,bueno){if(c.p===null||c.p===undefined)return '<span class="pct plano">sin dato</span>';var s=estado(c.p,c.pt?0.05:0.5),col=tono(s,bueno);return '<span class="pct n'+nivel(c)+' '+(col==="sube"?"mal":col==="baja"?"bien":"plano")+'">'+(c.p>0?"+":c.p<0?"−":"")+fmt(Math.abs(c.p),1)+(c.pt?" pt":" %")+'</span>';}
function explica(t,c,m){
  if(c.p===null||c.p===undefined)return "No hay un dato fiable de <b>"+(m==="anio"?"hace un año":c.k.toLowerCase())+"</b> para comparar "+t.t.toLowerCase()+".";
  var que=m==="anio"?"con hace un año":"con el dato anterior";
  var dir=c.p>0?"más":"menos";
  if(c.pt)return "Compara "+que+" ("+c.k+": <b>"+c.ref+"</b>). Ahora es <b>"+t.v+" "+t.u+"</b>: "+fmt(Math.abs(c.p),2)+" puntos "+dir+".";
  return "Compara "+t.t.toLowerCase()+" ("+"<b>"+t.v+" "+t.u+"</b>"+") "+que+" ("+c.k+(c.ref?": <b>"+c.ref+"</b>":"")+"). Diferencia: <b>"+(c.p>0?"+":"−")+fmt(Math.abs(c.p),1)+" %</b>.";
}
/* Las tarjetas van agrupadas por temas: cada grupo se pliega y enseña un resumen de una línea */
var GRUPOS=[["luz","luz","La luz",["luz","recibo","horasluz"]],["coche","surtidor","El coche",["gasolina","diesel","brent","seguro"]],["calor","radiador","La calefacción",["gastur","butano","gasoleoc"]],
  ["casa","casa","La casa y el banco",["alquiler","vivienda","euribor","cuota","bce","hipotecas","depositos"]],["sueldos","monedero","Sueldos y precios",["ipc","smi","pension","salario","paro"]],["compra","cesta","La compra y otros",["aceite","sello"]]];
var CORTO={luz:"Luz hoy",recibo:"Recibo",horasluz:"Horas de luz",gasolina:"Gasolina",diesel:"Diésel",brent:"Brent",seguro:"Seguro",gastur:"Gas",butano:"Butano",gasoleoc:"Gasóleo C",alquiler:"Alquiler",vivienda:"Vivienda",euribor:"Euríbor",cuota:"Cuota",bce:"BCE",hipotecas:"Hipotecas",depositos:"Depósitos",ipc:"IPC",smi:"Salario mín.",pension:"Pensión",salario:"Salario medio",paro:"Paro",aceite:"Aceite",sello:"Sello"};
var abiertos={};try{abiertos=JSON.parse(localStorage.getItem("celv-grupos")||"{}");}catch(e){}
if(!Object.keys(abiertos).length)abiertos={luz:true};
function guardarGrupos(){try{localStorage.setItem("celv-grupos",JSON.stringify(abiertos));}catch(e){}}
function marquesinas(raiz){
  (raiz||document).querySelectorAll(".marq").forEach(function(m){
    if(!m.hasAttribute("data-orig"))m.setAttribute("data-orig",m.innerHTML);
    var orig=m.getAttribute("data-orig");
    m.classList.remove("mueve");
    m.innerHTML='<span class="marq-pista"><span class="marq-set">'+orig+'</span></span>';
    var set=m.firstChild.firstChild;
    if(!m.clientWidth)return;
    if(set.scrollWidth>m.clientWidth+2){
      m.firstChild.innerHTML+='<span class="marq-set" aria-hidden="true">'+orig+'</span>';
      m.firstChild.lastChild.querySelectorAll("button").forEach(function(b){b.tabIndex=-1;});
      m.style.setProperty("--dur",Math.max(10,set.scrollWidth/32)+"s");
      m.classList.add("mueve");m.classList.remove("quieta");
    }else m.classList.add("quieta");
  });
}
var _mqT;window.addEventListener("resize",function(){clearTimeout(_mqT);_mqT=setTimeout(function(){marquesinas();},200);});
function pintarTiles(){
  var nS=0,nB=0,nP=0;
  var html1=tiles.map(function(t,i){
    var c=t[modo],st="plano",inten=0;
    if(c.p!==null&&c.p!==undefined){st=tono(estado(c.p,c.pt?0.05:0.5),t.bueno);}
    var fr=FRECUENTES.indexOf(t.blk)>=0;
    if(st==="sube")nS++;else if(st==="baja")nB++;else nP++;
    return '<button type="button" class="tile '+st+' n'+nivel(c)+'" data-i="'+i+'">'+badge(t.act,fr)+
      '<div class="cabt"><div class="bola">'+ico(t.ico)+'</div><div><h3>'+t.t+'</h3><div class="cuando">'+cuandoDato(t.f)+'<span class="info-i" data-tip="'+proximo(t.blk)+'" aria-label="'+proximo(t.blk)+'">i</span></div></div></div>'+
      '<div class="fila-v"><div class="valor'+((t.v+t.u).length>10?" largo":"")+'">'+t.v+'<small>'+t.u+'</small></div>'+pctTag(c,t.bueno)+'</div>'+
      '<div class="cmp"><span class="ref">'+(modo==="anio"?"hace un año":"dato anterior")+' ('+c.k+(c.ref?": <b>"+c.ref+"</b>":"")+')</span></div>'+
      (t.sp?spark(t.sp,css("--anil")):"")+'<div class="nota"><span>'+t.n+'</span><u>Ver más</u></div></button>';
  });
  $("mosaico").innerHTML=GRUPOS.map(function(g){
    var idx=g[3].map(function(id){return tiles.findIndex(function(t){return t.id===id;});}).filter(function(i){return i>=0;});
    var gS=0,gB=0,hayNuevo=false;
    var chips=idx.map(function(i){var t=tiles[i],c=t[modo],col=c.p===null||c.p===undefined?"plano":tono(estado(c.p,c.pt?0.05:0.5),t.bueno);if(col==="sube")gS++;else if(col==="baja")gB++;var fr=FRECUENTES.indexOf(t.blk)>=0;if(esHoy(t.act)||esNuevo(t.act,fr))hayNuevo=true;
      return '<span class="chip-g">'+ico(t.ico)+'<span class="cn">'+CORTO[t.id]+'</span>'+pctTag(c,t.bueno).replace('class="pct','class="pct mini')+'</span>';}).join("");
    var ab=!!abiertos[g[0]];
    return '<section class="grupo'+(ab?' abierto':'')+'" data-g="'+g[0]+'"><button type="button" class="g-cab" aria-expanded="'+ab+'"><span class="g-ico">'+ico(g[1])+'</span><span class="g-tit"><b>'+g[2]+(hayNuevo?' <i class="g-nuevo" title="Hay datos nuevos">●</i>':'')+'</b><small>'+(gS?gS+(gS===1?' empeora':' empeoran'):'')+(gS&&gB?' · ':'')+(gB?gB+(gB===1?' mejora':' mejoran'):'')+(!gS&&!gB?'Sin cambios':'')+'</small></span><span class="g-chips marq">'+chips+'</span><span class="g-flecha" aria-hidden="true"><span class="ft"><span class="fc">Ver fichas</span><span class="fa">Plegar</span></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span></button>'+
      '<div class="g-cuerpo grid"'+(ab?'':' hidden')+'>'+idx.map(function(i){return html1[i];}).join("")+'</div></section>';}).join("");
  $("veredicto").innerHTML=(nS?'<span class="b-mal" style="flex-grow:'+nS+'">▲ '+nS+(nS===1?' empeora':' empeoran')+'</span>':'')+(nP?'<span class="b-igual" style="flex-grow:'+nP+'" title="Sin cambio o sin dato">= '+nP+'</span>':'')+(nB?'<span class="b-bien" style="flex-grow:'+nB+'">▼ '+nB+(nB===1?' mejora':' mejoran')+'</span>':'');
  marquesinas($("mosaico"));
  $("balanceSub").textContent=(modo==="anio"?"frente a hace un año":"frente al dato anterior")+" · "+tiles.length+" indicadores";
}
pintarTiles();
$("mosaico").addEventListener("click",function(e){var b=e.target.closest(".g-cab");if(!b)return;var g=b.parentNode,k=g.getAttribute("data-g"),ab=b.getAttribute("aria-expanded")!=="true";abiertos[k]=ab;guardarGrupos();b.setAttribute("aria-expanded",String(ab));g.classList.toggle("abierto",ab);g.querySelector(".g-cuerpo").hidden=!ab;actualizarTodo();});
function actualizarTodo(){var todos=GRUPOS.every(function(g){return abiertos[g[0]];});$("plegarTodo").textContent=todos?"Plegar todo":"Desplegar todo";}
$("plegarTodo").addEventListener("click",function(){var todos=GRUPOS.every(function(g){return abiertos[g[0]];});GRUPOS.forEach(function(g){abiertos[g[0]]=!todos;});guardarGrupos();pintarTiles();actualizarTodo();});
actualizarTodo();
document.querySelectorAll(".modo button").forEach(function(b){b.addEventListener("click",function(){modo=b.getAttribute("data-modo");document.querySelectorAll(".modo button").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false");});pintarTiles();});});
function verGlobo(tileEl){var t=tiles[+tileEl.getAttribute("data-i")];globo.innerHTML=explica(t,t[modo],modo)+'<br><span style="opacity:.8">'+proximo(t.blk)+'</span>';var r=tileEl.getBoundingClientRect();globo.classList.add("on");var gw=globo.offsetWidth,gh=globo.offsetHeight;var x=Math.max(8,Math.min(window.innerWidth-gw-8,r.left+r.width/2-gw/2));var y=r.top-gh-10;if(y<8)y=r.bottom+10;globo.style.left=x+"px";globo.style.top=y+"px";}
$("mosaico").addEventListener("pointerover",function(e){if(e.target.closest("[data-tip]")){globo.classList.remove("on");return;}var t=e.target.closest(".tile");if(t)verGlobo(t);});
$("mosaico").addEventListener("pointerout",function(e){var t=e.target.closest(".tile");if(t&&!t.contains(e.relatedTarget))globo.classList.remove("on");});
$("mosaico").addEventListener("focusin",function(e){var t=e.target.closest(".tile");if(t)verGlobo(t);});
$("mosaico").addEventListener("focusout",function(){globo.classList.remove("on");});
window.addEventListener("scroll",function(){globo.classList.remove("on");},{passive:true});
$("mosaico").addEventListener("click",function(e){if(e.target.closest(".info-i")){e.preventDefault();e.stopPropagation();var tt=e.target.closest(".tile");if(tt)verGlobo(tt);return;}var el2=e.target.closest(".tile");if(!el2)return;globo.classList.remove("on");abrirTile(tiles[+el2.getAttribute("data-i")]);});

/* ---------- Lo que se dice en el patio: textos de patio.js con el género de la visita ---------- */
var P=window.PATIO||{com:{},comida:{},antes:{},refranes:[],consejos:[],curiosidades:[],efemerides:{},santos:{},recetas:[]};
function rem(t){return String(t).replace(/\{hija\}/g,G.hija).replace(/\{Hija\}/g,G.Hija).replace(/\{suNieto\}/g,G.suNieto).replace(/\{SuNieto\}/g,cap(G.suNieto)).replace(/\{comp\}/g,G.comp);}
function barajar(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var x=a[i];a[i]=a[j];a[j]=x;}return a;}
var mmdd=hoyISO.slice(5);
var santoHoy=P.santos[mmdd]||null;
var efemHoy=P.efemerides[mmdd]||[];
var fiestaHoy=((P.fiestas||{})[mmdd]||[]).concat(((P.fiestas||{})[hoyISO])||[]);
var diaN=Math.floor(fecha(hoyISO)/864e5);
var refranHoy=P.refranes.length?P.refranes[diaN%P.refranes.length]:null;

/* ---------- ¿Qué cocino este mes? ---------- */
document.querySelectorAll(".ru-mes").forEach(function(e){e.textContent=D.rubricas.mes.split(" ")[0];});
/* Una sola cesta: lo que sigue FACUA en el súper y, para lo que FACUA no mira (carne, pescado…), el IPC del INE */
var RU=D.rubricas;
function unir(fac,idx){var ids=fac.map(function(r){return r[0];});return fac.map(function(r){return [r[0],r[1],r[2],"FACUA"];}).concat(RU.items.filter(function(r){return ids.indexOf(r[0])<0;}).map(function(r){return [r[0],r[1],r[idx],"INE"];}));}
var cestaMes=unir(D.cesta.mes,3),cestaAnio=unir(D.cesta.anio,2);
var precioIng={};cestaAnio.forEach(function(r){precioIng[r[0]]={n:r[1],p:r[2],cuando:"en un año"};});cestaMes.forEach(function(r){precioIng[r[0]]={n:r[1],p:r[2],cuando:"este mes"};});
var recetasMes=P.recetas.map(function(r){var sc=0,con=[];r.ing.forEach(function(i){var x=precioIng[i];if(x){sc+=x.p;con.push([i,x]);}});return {r:r,sc:sc/Math.max(1,r.ing.length)+(con.length?0:99),con:con};})
  .filter(function(x){return x.con.some(function(c){return c[1].p<0;});}).sort(function(a,b){return a.sc-b.sc;});
var masBarato=cestaMes.slice().sort(function(a,b){return a[2]-b[2];});
var consejoCocina=recetasMes.length?"Este mes "+masBarato[0][1].toLowerCase()+" "+baja(fmt(masBarato[0][2],1).replace("-","−")+" %")+" y "+masBarato[1][1].toLowerCase()+" "+baja(fmt(masBarato[1][2],1).replace("-","−")+" %")+". Yo haría "+B(recetasMes[0].r.n.toLowerCase())+(recetasMes[1]?" o "+B(recetasMes[1].r.n.toLowerCase()):"")+".":null;

/* ---------- Consejos de Remedios (bocadillo) ---------- */
var consejos=[
  fiestaHoy[0]?rem(fiestaHoy[0].msg):null,
  consejoCocina,
  "La lavadora, de "+h(barato[0])+" a "+h(barato[0]+3)+": es cuando la luz está más barata"+(luzEsHoy?" hoy":"")+", a "+baja(fmt(barato[1]*100,1)+" céntimos")+" el kWh.",
  "De "+h(caro[0])+" a "+h(caro[0]+3)+" la luz se pone a "+sube(fmt(caro[1]*100,0)+" céntimos")+". Ni horno ni plancha a esas horas, "+G.hija+".",
  "La luz está hoy un "+signo(pct(media,L.media_ayer))+" frente a ayer. Y frente a hace un año, "+signo(pct(media,L.media_hace_un_anio),0)+".",
  "El diésel cuesta un "+signo(pct(fl[2],C.hace_un_anio.diesel),0)+" más que hace un año. Si vais al mismo sitio, compartid coche.",
  "La bombona no puede pasar de "+B("19,55 €")+" hasta junio. Ahora está a "+B(eur(D.butano.valor))+": no llenes el trastero.",
  "El gasóleo de la caldera está a "+B(fmt(D.gasoleo_c.valor,2)+" €")+" el litro, un "+signo(pct(D.gasoleo_c.valor,D.gasoleo_c.junio))+" desde junio. Purga los radiadores.",
  "El aceite de oliva ha bajado un "+baja(fmt(Math.abs(D.aceite.mes),1)+" %")+" este mes. Buen momento para la garrafa.",
  "Patatas "+baja("−12,5 %")+" y zanahorias "+baja("−10,6 %")+" este mes. Cocido, que es lo suyo en noviembre.",
  "Si te toca revisar la hipoteca: el euríbor está en el "+B(fmt(eu1,2)+" %")+". Son unos "+sube("+"+eur(c1-c0,0))+" al mes para 150.000 €.",
  "El salario mínimo sube un "+bien(fmt(pct(D.smi.valor,D.smi.anterior),1)+" %")+" y los precios un "+sube(fmt(ipc1,1)+" %")+". Las cuentas no salen.",
  "Mi pensión ha subido un "+bien(fmt(pct(D.pension.valor,D.pension.hace_un_anio),1)+" %")+", pero la vida un "+sube(fmt(ipc1,1)+" %")+". Algo se pierde por el camino.",
  "El recibo de la luz de un hogar normal ya va por "+sube(eur(RC.valor,0))+" al mes. Hace un año eran "+B(eur(RC.hace_un_anio,0))+". Apaga luces, "+G.hija+".",
  "El gas de la calefacción ha subido un "+signo(pct(GT.variable,GT.variable_julio),0)+" desde julio. Un grado menos en el termostato es un 7 % menos de gasto.",
  "Poner la lavadora a las "+h(iMax)+" cuesta "+B(fmt(horas[iMax]/horas[iMin],1)+" veces")+" más que a las "+h(iMin)+". Díselo a "+G.suHija+".",
  "El alquiler va por "+B(fmt(D.alquiler.valor,1)+" €")+" el metro. Un piso de 70 metros, "+sube(eur(D.alquiler.valor*70,0))+" al mes."
];
consejos=consejos.filter(Boolean);
var ci=0,cBox=$("consejoTxt"),cTimer=null;
function verConsejo(k){ci=(k+consejos.length)%consejos.length;cBox.classList.add("fuera");setTimeout(function(){cBox.innerHTML="<div>"+consejos[ci]+"</div>";cBox.classList.remove("fuera");},220);}
function relojConsejos(){clearInterval(cTimer);cTimer=setInterval(function(){verConsejo(ci+1);},9000);}
$("boca").addEventListener("pointerenter",function(){clearInterval(cTimer);});
$("boca").addEventListener("pointerleave",relojConsejos);
verConsejo(fiestaHoy.length?0:Math.floor(Math.random()*consejos.length));relojConsejos();

/* ---------- Radio Patio (ticker) ---------- */
var hist=L.historico||{};
var diasLuz=L.dias.filter(function(d){return d[1]!==null;});
var rankHoy=diasLuz.slice().sort(function(a,b){return b[1]-a[1];}).findIndex(function(d){return d[0]===L.fecha;})+1;
var negativos=Object.keys(hist).filter(function(k){return hist[k].some(function(v){return v<0;});});
var bajadasGas=0;for(var gi=C.serie.length-1;gi>0;gi--){if(C.serie[gi][1]!==null&&C.serie[gi-1][1]!==null&&C.serie[gi][1]<C.serie[gi-1][1])bajadasGas++;else break;}
var subidasEu=0;for(var ei=1;ei<E.length;ei++){if(E[ei][1]>E[ei-1][1])subidasEu++;}
var maxBrent=BR.reduce(function(a,b){return b[1]>a[1]?b:a;});
var proxima=D.agenda.filter(function(a){return /^\d{4}-/.test(a.fecha)&&dias(hoyISO,a.fecha)>=0;})[0];
/* Radio Patio: 100 noticias. 8 de cada 10 son datos de la web; 2 de cada 10, cosas del patio
   (la hora, el santo, refranes, consejos, hemeroteca). Cada una con su comentario de Remedios. */
function dirDe(p,u){return p>u?"s":p<-u?"b":"i";}
function comDe(id,d,n){var c=P.com[id];if(!c)return null;var arr=c[d]||c.i||[];return arr.length?rem(arr[n%arr.length]):null;}
function frenteA(k){var f=FRASE_K[k]||k;return f.indexOf("el ")===0?"frente al "+f.slice(3):"frente a "+f;}
var FRASE_K={"IPC general":"la inflación general","1.er trim. 2025":"el primer trimestre de 2025","Ayer":"ayer","Semana anterior":"la semana anterior","Mes anterior":"el mes anterior","Septiembre":"septiembre","Octubre":"octubre","Julio":"julio","Junio":"junio","Media de junio":"la media de junio","Revisión de julio":"la revisión de julio","Hasta septiembre":"septiembre","2025":"2025","Oct. 2025":"octubre de 2025","Ene. 2026":"enero de 2026","3.er trim. 2025":"el tercer trimestre de 2025","nov. 2025":"noviembre de 2025","Nov. 2025":"noviembre de 2025"};
function cifra(c,bueno){if(c.pt){var t=(c.p>0?"+":c.p<0?"−":"")+fmt(Math.abs(c.p),2)+" puntos";var d=dirDe(c.p,0.05);return d==="i"?B(t):((d==="s")!==!!bueno?sube(t):baja(t));}return signo(c.p,1,bueno);}
var econ=[];
/* Remedios comenta cada dato: lo traduce a algo que se entiende (un depósito, una lavadora, un recibo…) */
function num(t){return parseFloat(String(t.v).replace(/\./g,"").replace(",","."));}
function antesDe(t,c){return num(t)/(1+c.p/100);}
function masMenos(d){return d>0?"más":"menos";}
function cuandoTxt(c){return FRASE_K[c.k]||c.k.toLowerCase();}
var sueldoMes=D.smi.valor*14/12;
var EXPL={
  luz:function(t,c,m){var r=m==="ant"?L.media_ayer:L.media_hace_un_anio,d=(media-r)*8*100;return m==="ant"?"Una casa que gaste 8 kWh al día paga hoy "+B(fmt(Math.abs(d),0)+" céntimos")+" "+masMenos(d)+" de energía que ayer. "+(d>0?"Hoy, la plancha, mañana.":"Hoy se puede planchar."):"Con 250 kWh al mes son "+B(eur(Math.abs((media-r)*250)))+" "+masMenos(media-r)+" al mes que el año pasado, solo de energía.";},
  recibo:function(t,c,m){var r=m==="ant"?RC.anterior:RC.hace_un_anio,d=RC.valor-r;return m==="ant"?"Son "+B(eur(Math.abs(d)))+" "+masMenos(d)+" que en septiembre: "+fmt(Math.abs(d)/1.35,0)+" barras de pan.":"Son "+B(eur(Math.abs(d)))+" "+masMenos(d)+" al mes que hace un año: "+B(eur(Math.abs(d)*12,0))+" al año.";},
  horasluz:function(t,c,m){var h0=antesDe(t,c);return "Antes bastaban "+fmt(h0,1)+" horas; ahora hacen falta "+B(t.v)+". Casi dos jornadas de trabajo solo para la luz.";},
  gasolina:function(t,c,m){var d=(num(t)-antesDe(t,c))*50;return "Un depósito de 50 litros: "+B(eur(num(t)*50,0))+", "+B(eur(Math.abs(d)))+" "+masMenos(d)+" que "+(m==="ant"?"la semana pasada":"hace un año")+".";},
  diesel:function(t,c,m){var d=(num(t)-antesDe(t,c))*50;return Math.abs(c.p)<0.5?"Llenar 50 litros sigue costando "+B(eur(num(t)*50,0))+". Ni una alegría.":"Un depósito de 50 litros: "+B(eur(num(t)*50,0))+", "+B(eur(Math.abs(d)))+" "+masMenos(d)+" que "+(m==="ant"?"la semana pasada":"hace un año")+".";},
  brent:function(t,c,m){var d=num(t)-antesDe(t,c);return m==="ant"?"El barril "+(d<0?"ha bajado":"ha subido")+" "+B(fmt(Math.abs(d),0)+" dólares")+" en una semana. En el surtidor se nota con unas semanas de retraso… si se nota.":"Un "+fmt(Math.abs(c.p),0)+" % más caro que hace un año. Por eso el diésel no baja de "+B(fmt(fl[2],2)+" €")+".";},
  gastur:function(t,c,m){var r=m==="ant"?GT.variable_julio:GT.variable_hace_un_anio,d=(GT.variable-r)*90;return "Para una casa con calefacción de gas (9.000 kWh al año) son unos "+B(eur(Math.abs(d),0))+" "+masMenos(d)+" al año, sin contar impuestos.";},
  butano:function(t,c,m){var d=D.butano.valor-antesDe(t,c);return m==="ant"?"Cada bombona, "+B(eur(Math.abs(d)))+" "+masMenos(d)+" que en julio. Le quedan "+B(eur(D.butano.tope-D.butano.valor))+" para llegar al tope.":"Desde enero, "+B(eur(Math.abs(d)))+" más por bombona: con una al mes, "+B(eur(Math.abs(d)*12,0))+" al año.";},
  gasoleoc:function(t,c,m){var d=(num(t)-antesDe(t,c))*1000;return "Llenar un depósito de 1.000 litros cuesta "+B(eur(num(t)*1000,0))+": "+B(eur(Math.abs(d),0))+" "+masMenos(d)+" que con el precio de junio.";},
  aceite:function(t,c,m){var d=(num(t)-antesDe(t,c))*100;return "La botella de litro, a "+B(eur(num(t)))+": unos "+B(fmt(Math.abs(d),0)+" céntimos")+" "+masMenos(d)+" que "+(m==="ant"?"el mes pasado":"hace un año")+". "+(d<0?"Tostada con aceite.":"Medio chorrito.");},
  alquiler:function(t,c,m){var d=(num(t)-antesDe(t,c))*70;return "Un piso de 70 m²: "+B(eur(num(t)*70,0))+" al mes, "+B(eur(Math.abs(d),0))+" "+masMenos(d)+" que "+(m==="ant"?"en junio":"hace un año")+". Con el salario mínimo se iría el "+B(fmt(num(t)*70/sueldoMes*100,0)+" %")+" del sueldo.";},
  vivienda:function(t,c,m){var d=(num(t)-antesDe(t,c))*80;return Math.abs(c.p)<0.5?"Un piso de 80 m² sigue en "+B(eur(num(t)*80,0))+": "+fmt(num(t)*80/(D.smi.valor*14),1)+" años de salario mínimo.":"Un piso de 80 m²: "+B(eur(num(t)*80,0))+", "+B(eur(Math.abs(d),0))+" "+masMenos(d)+" que hace un año.";},
  euribor:function(t,c,m){return m==="ant"?(Math.abs(c1-cP)<1?"La cuota de una hipoteca de 150.000 € a 20 años no se mueve: "+B(eur(c1,0))+" al mes.":"Una hipoteca de 150.000 € a 20 años pagaría "+B(eur(Math.abs(c1-cP),0))+" "+masMenos(c1-cP)+" al mes."):"Hace un año estaba en el "+fmt(eu0,2)+" %. Para 150.000 € a 20 años son "+B(eur(c1-c0,0))+" más al mes: "+B(eur((c1-c0)*12,0))+" al año.";},
  cuota:function(t,c,m){return m==="ant"?"Si te revisan ahora, pagas casi lo mismo que el mes pasado: "+B(eur(c1,0))+".":"Al año son "+B(eur((c1-c0)*12,0))+" más que con el euríbor de hace un año. Eso es un viaje del Imserso… para dos.";},
  bce:function(t,c,m){var x=cuota(150000,eu1+0.8+0.25,20)-c1;return "Cada cuarto de punto que sube, una hipoteca de 150.000 € acaba pagando unos "+B(eur(x,0))+" más al mes cuando llega al euríbor.";},
  ipc:function(t,c,m){return m==="ant"?"Lo que costaba 100 € hace un año hoy cuesta "+B(eur(100+ipc1))+". Igual que el mes pasado, que ya es mucho.":"Hace un año los precios subían un "+fmt(D.ipc.hace_un_anio,1)+" %; ahora, un "+B(fmt(ipc1,1)+" %")+". Se ha acelerado.";},
  smi:function(t,c,m){var d=D.smi.valor-D.smi.anterior,pc=pct(D.smi.valor,D.smi.anterior);return "Son "+B(eur(d,0))+" más al mes, "+eur(d*14,0)+" al año. Pero si los precios suben un "+fmt(ipc1,1)+" % y el sueldo un "+fmt(pc,1)+" %, "+(pc<ipc1?"se pierde poder de compra.":"se gana un poquito.");},
  pension:function(t,c,m){var d=D.pension.valor-D.pension.hace_un_anio,pc=pct(D.pension.valor,D.pension.hace_un_anio);return "Son "+B(eur(d,0))+" más al mes. Sube un "+fmt(pc,1)+" % y los precios un "+fmt(ipc1,1)+" %: "+(pc<ipc1?"casi empata, pero pierde.":"por una vez, gana la pensión.");},
  paro:function(t,c,m){var r=m==="ant"?D.paro.anterior:D.paro.hace_un_anio,d=D.paro.valor-r;return m==="ant"?"Son "+B(fmt(Math.abs(d),0)+" personas")+" "+masMenos(d)+" que en septiembre. En otoño pasa: se acaba la temporada de verano.":"Hay "+B(fmt(Math.abs(d),0))+" parados "+masMenos(d)+" que hace un año. Eso sí es buena noticia.";},
  seguro:function(t,c,m){return m==="ant"?"El seguro sube un "+B(fmt(D.seguro_coche.valor,1)+" %")+" al año, igual que el mes pasado. Para una póliza de 500 €, unos "+B(eur(500*D.seguro_coche.valor/100,0))+" más.":"Por una vez sube menos que la inflación ("+fmt(ipc1,1)+" %). El de salud, en cambio, un "+B(fmt(D.seguro_coche.salud,1)+" %")+".";},
  depositos:function(t,c,m){var r=D.depositos.valor-ipc1;return m==="ant"?"Por 10.000 € a un año te darían unos "+B(eur(100*D.depositos.valor,0))+" brutos de intereses.":"Con los precios subiendo un "+fmt(ipc1,1)+" %, el ahorro pierde un "+B(fmt(Math.abs(r),1)+" %")+" de valor al año aunque esté en un depósito.";},
  hipotecas:function(t,c,m){var q=cuota(150000,D.depositos.hipoteca,25);return "A ese interés, 150.000 € a 25 años salen por unos "+B(eur(q,0))+" al mes.";},
  salario:function(t,c,m){var d0=D.salario_medio.valor-D.salario_medio.valor/(1+D.salario_medio.interanual/100);return "Son "+B(eur(d0,0))+" más al mes que hace un año. Sube un "+fmt(D.salario_medio.interanual,1)+" % y los precios un "+fmt(ipc1,1)+" %: "+(D.salario_medio.interanual>=ipc1?"empate técnico.":"pierde.");},
  sello:function(t,c,m){var d=(D.sello.valor-D.sello.anterior)*100;return "Cada carta, "+B(fmt(d,0)+" céntimos")+" más que el año pasado. En 2015 costaba 0,42 €: más del doble.";}
};
function expl(t,c,m){var f=EXPL[t.id];return f?f(t,c,m):comDe(t.id,dirDe(c.p,c.pt?0.05:0.5),0);}
tiles.forEach(function(t){
  [["ant",0],["anio",1]].forEach(function(m){var c=t[m[0]];if(c.p===null||c.p===undefined)return;if(m[1]===1&&t.ant.k===t.anio.k)return;
    var d=dirDe(c.p,c.pt?0.05:0.5),txt=t.t+": "+B(t.v+" "+t.u)+", "+(d==="i"?"igual que "+(FRASE_K[c.k]||c.k.toLowerCase()):cifra(c,t.bueno)+" "+frenteA(c.k))+".";
    econ.push({g:t.sec,t:txt,c:expl(t,c,m[0]),pri:(esHoy(t.act)||esNuevo(t.act,FRECUENTES.indexOf(t.blk)>=0))?2:0});});
});
function remate(x){x=rem(x);var k=x.indexOf(": ");return k>0&&k<40?cap(x.slice(k+2)):x;}
cestaMes.forEach(function(r){var c=P.comida[r[0]];if(!c||Math.abs(r[2])<0.3)return;var d=Math.abs(r[2])/10;
  econ.push({g:"cesta",t:r[1]+", "+signo(r[2])+" este mes en el súper.",c:"Por cada 10 € de "+r[1].split(" ")[0].toLowerCase()+", "+(r[2]>0?"pagas ":"te ahorras ")+B(fmt(d,2)+" €")+". "+remate(r[2]>0?c.s:c.b),pri:esNuevo(D.cesta.actualizado)?1:0});});
cestaAnio.forEach(function(r){var c=P.comida[r[0]];if(!c||Math.abs(r[2])<0.3)return;
  econ.push({g:"cesta",t:r[1]+", "+signo(r[2])+" en un año.",c:"Lo que hace un año costaba 10 €, hoy cuesta "+B(eur(10*(1+r[2]/100)))+". "+remate(r[2]>0?c.s:c.b),pri:0});});
D.historico.items.forEach(function(it){var c=P.antes[it.id];if(!c||!it.puntos.length)return;var p=it.puntos[Math.floor(Math.random()*it.puntos.length)];
  var e0=p.pta!==undefined?p.pta/166.386:p.v,antes=p.pta!==undefined?B(fmt(p.pta,0)+" pesetas")+" ("+eur(e0)+")":B(eur(p.v,p.v>=100?0:2));
  econ.push({g:"antes",t:it.nombre+" en "+p.anio+": "+antes+". Hoy: "+B(eur(it.hoy.v,it.hoy.v>=100?0:2))+".",c:"Se ha multiplicado por "+B(fmt(it.hoy.v/e0,1).replace(/,0$/,""))+". "+rem(c),pri:0,chip:"Antes y ahora"});});
var horasNeg=[];Object.keys(hist).forEach(function(k){hist[k].forEach(function(v,hh){if(v<0&&horasNeg.indexOf(hh)<0)horasNeg.push(hh);});});horasNeg.sort(function(a,b){return a-b;});
var dias7=L.dias.slice(-7).filter(function(d){return d[1]!==null;}),rank7=dias7.slice().sort(function(a,b){return b[1]-a[1];}).findIndex(function(d){return d[0]===L.fecha;})+1;
[
  [rankHoy?"Hoy es el "+B(rankHoy+".º")+" día más caro de la luz de las dos últimas semanas.":null,rankHoy<=3?"De los días más caros: lo que se pueda dejar para mañana, para mañana.":rankHoy>=diasLuz.length-2?"De los más baratos: hoy toca poner lavadoras y hornear.":"Ni de los peores ni de los mejores: hay "+(rankHoy-1)+" días más caros que hoy."],
  ["La hora más cara de hoy, las "+h(iMax)+": "+sube(fmt(horas[iMax],3)+" €")+" el kWh.","Una hora de horno a esa hora sale por "+B(fmt(1.2*horas[iMax]*100,0)+" céntimos")+". Cena fría, que también está rica."],
  ["La hora más barata, a las "+h(iMin)+": "+baja(fmt(horas[iMin],3)+" €")+" el kWh.","Una lavadora a esa hora: "+B(fmt(0.9*horas[iMin]*100,0)+" céntimos")+". ¡A poner lavadoras!"],
  ["Hoy la hora cara cuesta "+B(fmt(horas[iMax]/horas[iMin],1)+" veces")+" lo que la barata.","Mismo electrodoméstico, mismo rato, y "+fmt(horas[iMax]/horas[iMin],1)+" veces más caro según el reloj."],
  [negativos.length?"Esta semana hubo "+B(negativos.length+" días")+" con horas a precio negativo.":null,"Fue "+(horasNeg.length?"hacia las "+horasNeg.slice(0,3).map(function(x){return x+"h";}).join(", "):"a mediodía")+", con el sol a pleno rendimiento. ¡Te pagaban por gastar!"],
  ["El mercado mayorista, a "+B(fmt(om1,0)+" €/MWh")+": "+signo(pct(om1,omP))+" frente al último día con dato.","Eso son "+fmt(om1/10,1)+" céntimos el kWh. Es lo que pagan las comercializadoras; a casa llega con peajes, cargos e impuestos."],
  ["Una lavadora en la hora cara cuesta "+sube(fmt(0.9*horas[iMax]*100,0)+" céntimos")+"; en la barata, "+baja(fmt(0.9*horas[iMin]*100,0))+".","Una lavadora diaria en la hora barata ahorra "+B(eur((horas[iMax]-horas[iMin])*0.9*30))+" al mes."],
  ["El recibo de la luz lleva dos meses por encima de "+B("100 €")+", algo que no pasaba desde 2022.","En 2022, con la guerra de Ucrania, el recibo llegó a pasar de 137 €. Ojalá no volvamos a eso."],
  ["El diésel cuesta "+B(fmt((fl[2]-fl[1])*100,0)+" céntimos")+" más que la gasolina por litro.","En un depósito de 50 litros son "+B(eur((fl[2]-fl[1])*50))+" de diferencia. Antes el diésel era lo barato."],
  ["Llenar 50 litros de diésel cuesta "+sube("+"+eur((fl[2]-C.hace_un_anio.diesel)*50,0))+" más que hace un año.","Si llenas cada semana, son "+B(eur((fl[2]-C.hace_un_anio.diesel)*50*52,0))+" más al año."],
  [bajadasGas>1?"La gasolina lleva "+B(bajadasGas+" semanas")+" seguidas bajando.":null,"Poquito a poco: "+B(fmt((C.serie[C.serie.length-1-bajadasGas][1]-fl[1])*100,1)+" céntimos")+" menos por litro en ese tiempo."],
  ["El barril está a "+B(fmt(bl,0)+" $")+"; el máximo del año fue "+B(fmt(maxBrent[1],0)+" $")+" ("+maxBrent[0]+").","Desde el máximo ha caído un "+B(fmt(Math.abs(pct(bl,maxBrent[1])),0)+" %")+". Las gasolineras, en cambio, bajan con cuentagotas."],
  ["A la bombona le quedan "+B(fmt(D.butano.tope-D.butano.valor,2)+" €")+" para llegar al tope.","Si llega al tope, con una bombona al mes serían "+B(eur(D.butano.tope*12,0))+" al año."],
  ["El euríbor ha subido "+B(subidasEu+" de los últimos 12 meses")+".","Ha pasado del "+fmt(eu0,2)+" % al "+B(fmt(eu1,2)+" %")+". Más subidas que la escalera de mi casa."],
  ["Con el euríbor así, una hipoteca de 150.000 € paga "+sube("+"+eur(c1-c0,0))+" al mes más que hace un año.","Al año son "+B(eur((c1-c0)*12,0))+"."],
  ["El BCE vuelve a reunirse el "+B("17 de diciembre")+".","Si sube otro cuarto de punto, una hipoteca de 150.000 € acabaría pagando unos "+B(eur(cuota(150000,eu1+1.05,20)-c1,0))+" más al mes."],
  ["Lo que costaba 100 € hace un año, hoy cuesta "+sube(eur(100+ipc1,2))+".","Dicho al revés: con 100 € compras lo que hace un año con "+B(eur(100/(1+ipc1/100)))+"."],
  ["Alquilar 70 m² sale por "+sube(eur(D.alquiler.valor*70,0))+" al mes.","Con el salario mínimo se iría el "+B(fmt(D.alquiler.valor*70/sueldoMes*100,0)+" %")+" del sueldo. Por eso "+G.suNieto+" comparte piso."],
  ["Un piso de 80 m² cuesta "+B(eur(D.vivienda.valor*80,0))+": "+B(fmt(D.vivienda.valor*80/(D.smi.valor*14),1)+" años")+" de salario mínimo.","Y eso sin comer ni pagar la luz. Ahorrando la mitad del sueldo, el doble: "+fmt(D.vivienda.valor*80/(D.smi.valor*7),0)+" años."],
  ["El kWh de gas regulado, a "+B(fmt(GT.variable,2)+" céntimos")+": "+signo(pct(GT.variable,GT.variable_julio))+" desde julio.","Para una casa con calefacción de gas, unos "+B(eur((GT.variable-GT.variable_julio)*90,0))+" más al año."],
  [consejoCocina,recetasMes[0]?B(recetasMes[0].r.n)+": "+rem(recetasMes[0].r.t):"Comer bien no tiene por qué ser caro."],
  [proxima?"Apunta: "+B(proxima.titulo)+". "+proxima.texto:null,"Ya lo tengo en la libreta de la cocina."]
].forEach(function(x,k){if(x[0])econ.push({g:k<9?"luz":"varios"+k,t:x[0],c:rem(x[1]),pri:0});});
/* Lo más nuevo, primero */
var ultimaHora=tiles.filter(function(t){return esNuevo(t.act,FRECUENTES.indexOf(t.blk)>=0);}).sort(function(a,b){return a.act<b.act?1:-1;});
/* Mezcla: nunca dos seguidas del mismo tema, y las de «última hora» repartidas */
function mezclar(lista){var pool=barajar(lista),out=[];while(pool.length){var last=out.length?out[out.length-1].g:null,k=pool.findIndex(function(x){return x.g!==last;});if(k<0)k=0;out.push(pool.splice(k,1)[0]);}return out;}
econ=mezclar(econ);
ultimaHora.slice(0,4).forEach(function(t,k){var c=t.ant;if(c.p===null)return;econ.splice(Math.min(econ.length,k*9),0,{g:"ultima",t:"Dato nuevo: "+t.t.toLowerCase()+", "+B(t.v+" "+t.u)+" ("+cifra(c,t.bueno)+").",c:expl(t,c,"ant"),chip:"Última hora"});});
/* Cosas del patio */
function horaTxt(){var d=new Date(),hh,mm;try{var f=new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Europe/Madrid"}).format(d).split(":");hh=+f[0];mm=f[1];}catch(e){hh=d.getHours();mm=String(d.getMinutes()).padStart(2,"0");}return [hh,mm];}
function horaItem(){return {chip:"La hora",t:function(){var x=horaTxt();return "Son las "+B(x[0]+":"+x[1])+" en la península. Ahora mismo el kWh está a "+B(fmt(horas[x[0]%24],3)+" €")+".";},
  c:function(){var x=horaTxt()[0];return x<7?"¿Qué haces sin dormir a estas horas? A la cama.":x<10?"Hora del cafelito con magdalena.":x<14?"Hora de ir a la plaza antes de que se acabe lo bueno.":x<16?"A comer, que se enfría.":x<18?"Hora de la siesta o del café con las amigas.":x<21?"Hora de salir al fresco con la silla.":"A cenar ligerito, que luego no se duerme.";}};}
var patio=[];
patio.push(horaItem());patio.push(horaItem());
fiestaHoy.forEach(function(f){var it={chip:"Fiesta",g:"fiesta",t:"Hoy es fiesta "+(f.ambito==="nacional"?"en toda España":"en "+f.donde)+": "+f.nombre+".",c:rem(f.msg)};patio.push(it);patio.push(it);});
if(santoHoy)patio.push({chip:"Santoral",t:"Hoy es "+B(santoHoy)+".",c:"Felicidades a los que celebren su santo. Yo invito a pastas."});
efemHoy.forEach(function(e){patio.push({chip:"Tal día como hoy",t:"En "+e[0]+": "+e[1],c:rem(e[2])});});
var resto=barajar(P.refranes.map(function(r){return {chip:"Refranero",t:"«"+r[0]+"»",c:rem(r[1])};}).concat(P.consejos.map(function(r){return {chip:"Consejo de abuela",t:r[0],c:rem(r[1])};}),P.curiosidades.map(function(r){return {chip:"Hemeroteca",t:r[0],c:rem(r[1])};})));
patio=barajar(patio.concat(resto.slice(0,Math.max(0,20-patio.length))));
var fiestasP=patio.filter(function(x){return x.g==="fiesta";});patio=patio.filter(function(x){return x.g!=="fiesta";});fiestasP.forEach(function(x,k){patio.splice(Math.min(patio.length,k*8),0,x);});
var tk=[],ie=0,ip=0;
for(var n=0;n<100;n++){if(n%5===4&&ip<patio.length)tk.push(patio[ip++]);else if(ie<econ.length)tk.push(econ[ie++]);else if(ip<patio.length)tk.push(patio[ip++]);}
var ti=0,fase=0,tTxt=$("tickerTxt"),tTimer=null,tPausa=false;
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function val(x){return typeof x==="function"?x():x;}
function ponTicker(html){tTxt.innerHTML='<span class="corre">'+html+'</span>';tTxt.title=tTxt.textContent;
  var c=tTxt.firstChild,sobra=c.scrollWidth-tTxt.clientWidth,largo=tTxt.textContent.length,dur=Math.max(6500,Math.min(24000,largo*75));
  if(sobra>4&&!reduce&&c.animate){c.animate([{transform:"translateX(0)"},{transform:"translateX(0)",offset:.18},{transform:"translateX(-"+(sobra+8)+"px)",offset:.82},{transform:"translateX(-"+(sobra+8)+"px)"}],{duration:dur,easing:"linear",fill:"forwards"});}
  return dur;}
function pintaFase(){var it=tk[ti];var html=val(it.t)+' <span class="com-t">'+val(it.c)+'</span>';
  var tipo=it.chip==="Última hora"?"ultima":it.chip==="Antes y ahora"?"antes":it.chip==="Fiesta"?"fiesta":it.chip?"patio":"";
  tTxt.className="sale";setTimeout(function(){if(tipo)$("selloT").setAttribute("data-tipo",tipo);else $("selloT").removeAttribute("data-tipo");$("selloT").title=it.chip||"Datos de la web";var dur=ponTicker(html);tTxt.className="entra";void tTxt.offsetWidth;tTxt.className="";clearTimeout(tTimer);tTimer=setTimeout(siguiente,dur+1200);},300);}
function siguiente(){if(tPausa){tTimer=setTimeout(siguiente,1000);return;}ti=(ti+1)%tk.length;pintaFase();}
function irTicker(k){clearTimeout(tTimer);ti=(k+tk.length)%tk.length;pintaFase();}
$("tickerPrev").addEventListener("click",function(){irTicker(ti-1);});
$("tickerNext").addEventListener("click",function(){irTicker(ti+1);});
document.querySelector(".ticker").addEventListener("pointerenter",function(){tPausa=true;});
document.querySelector(".ticker").addEventListener("pointerleave",function(){tPausa=false;});
pintaFase();

/* ---------- Navegación de secciones ---------- */
var secs=[["luz","luz","Luz"],["gasolinera","surtidor","Gasolinera"],["calefaccion","radiador","Calefacción"],["cesta","cesta","La cesta"],["vivienda","casa","La casa"],["ipc","monedero","Sueldos y pensiones"],["cuenta","libreta","El monedero"],["agenda","calendario","Agenda"]];
$("navSecc").innerHTML=secs.map(function(s){return '<a href="#'+s[0]+'" data-ir="'+s[0]+'">'+ico(s[1])+s[2]+'</a>';}).join("");

/* ---------- Luz ---------- */
var h2=function(n){return String(n).padStart(2,"0");};
$("luzTitulo").innerHTML=(luzEsHoy?"Hoy, ":"Último día publicado: ")+largo(L.fecha)+" "+badge(L.actualizado);
$("dMedia").textContent=fmt(media,3)+" €";
$("dAyer").innerHTML=flecha(pct(media,L.media_ayer));
$("dMin").textContent=iMin+"h · "+fmt(horas[iMin],3);
$("dMax").textContent=iMax+"h · "+fmt(horas[iMax],3);
$("consejoLuz").innerHTML=(luzEsHoy?"Ahora mismo ("+horaMadrid+"h) el kWh está a "+fmt(horas[horaMadrid],3)+" €. ":"")+"<b>Mejor tramo:</b> de "+barato[0]+"h a "+(barato[0]+3)+"h, con una media de "+fmt(barato[1],3)+" €/kWh, un "+fmt(Math.abs(pct(barato[1],media)),0)+" % por debajo de la media del día.";
$("diceLuz").innerHTML="La hora cara cuesta "+B(fmt(horas[iMax]/horas[iMin],1)+" veces")+" la barata. Plancha, horno y lavavajillas a mediodía, y por la noche, la mantita.";
barras("chHoras",horas.map(function(v,k){return [h2(k)+"h",v];}),{aria:"Precio de la luz por hora",h:260,every:3,dec:2,
  color:function(d,k){return (k>=barato[0]&&k<barato[0]+3)?css("--barato"):(k>=caro[0]&&k<caro[0]+3)?css("--sube"):css("--anil");},outline:function(k){return luzEsHoy&&k===horaMadrid;},tipFmt:function(v){return fmt(v,3)+" €/kWh";}});
barras("chDias",L.dias.map(function(d){return [corto(d[0]),d[1]];}),{aria:"Media diaria del PVPC",h:230,every:2,dec:2,color:function(d,k){return k===L.dias.length-1?css("--anil"):css("--anil-2");},tipFmt:function(v){return fmt(v,4)+" €/kWh";}});
lineas("chMeses",L.meses,[{k:1,color:css("--anil"),name:"PVPC"}],{aria:"Media mensual del PVPC",w:400,h:260,every:3,dec:2,zero:true,lastFmt:function(v){return fmt(v,3);},tipFmt:function(v){return fmt(v,3)+" €/kWh";}});

/* Tendedero */
function colorPrecio(t){var hue=130-110*Math.max(0,Math.min(1,t));return "hsl("+hue+" 62% 52%)";}
var franjas=[["Madrugada",0,6,"camisa"],["Mañana",6,12,"pantalon"],["Mediodía",12,16,"vestido"],["Tarde",16,20,"calcetin"],["Noche",20,24,"toalla"]];
var mf=franjas.map(function(f){var s=0;for(var k=f[1];k<f[2];k++)s+=horas[k];return s/(f[2]-f[1]);});
var mfMin=Math.min.apply(null,mf),mfMax=Math.max.apply(null,mf);
/* Cada prenda tiene su borde superior justo en la cuerda (y=12 de 84) y dos pinzas que la muerden */
var PRENDA={
  camisa:{p:function(c){return '<path d="M28 12l-15 7 6 13 7-3v38h28V29l7 3 6-13-15-7c-2 6-7 8-12 8s-10-2-12-8z" fill="'+c+'"/><path d="M42 20v30" stroke="rgba(0,0,0,.15)" stroke-width="2"/><circle cx="42" cy="28" r="1.5" fill="rgba(255,255,255,.7)"/><circle cx="42" cy="36" r="1.5" fill="rgba(255,255,255,.7)"/>';},pz:[29,51]},
  pantalon:{p:function(c){return '<path d="M23 12h38l4 62H48l-6-38-6 38H19z" fill="'+c+'"/><rect x="23" y="12" width="38" height="7" fill="rgba(0,0,0,.18)"/>';},pz:[25,55]},
  vestido:{p:function(c){return '<path d="M31 12h22l2 16 15 46H14l15-46z" fill="'+c+'"/><path d="M29 30h26" stroke="rgba(0,0,0,.18)" stroke-width="4"/>';},pz:[32,48]},
  calcetin:{p:function(c){return '<path d="M20 12h14v30l8 8c5 5 0 13-7 10L20 46z" fill="'+c+'"/><rect x="20" y="12" width="14" height="7" fill="rgba(255,255,255,.45)"/><path d="M50 12h14v30l8 8c5 5 0 13-7 10L50 46z" fill="'+c+'"/><rect x="50" y="12" width="14" height="7" fill="rgba(255,255,255,.45)"/>';},pz:[24,54]},
  toalla:{p:function(c){return '<rect x="14" y="12" width="56" height="62" rx="2" fill="'+c+'"/><path d="M14 62h56M14 67h56" stroke="rgba(255,255,255,.5)" stroke-width="2"/>';},pz:[18,62]}
};
function pinza(x){return '<rect x="'+x+'" y="5" width="6" height="15" rx="2" fill="#C98B45" stroke="#8A5A2B" stroke-width="1"/><rect x="'+(x+1)+'" y="11" width="4" height="2" fill="#8A5A2B"/>';}
$("prendas").innerHTML=franjas.map(function(f,k){var t=(mf[k]-mfMin)/((mfMax-mfMin)||1),P=PRENDA[f[3]];return '<div class="prenda"><svg viewBox="0 0 84 84" aria-hidden="true">'+P.p(colorPrecio(t))+pinza(P.pz[0])+pinza(P.pz[1])+'</svg><b>'+fmt(mf[k],3)+' €</b><span>'+f[0]+' · '+f[1]+'h–'+f[2]+'h</span></div>';}).join("");

/* Recibo de la luz (FACUA) */
$("reciboSub").textContent="Usuario medio de FACUA ("+RC.perfil+"). Euros al mes; faltan los meses sin dato publicado con este perfil.";
lineas("chRecibo",RC.serie,[{k:1,color:css("--anil"),name:"Recibo"}],{aria:"Recibo mensual de la luz del usuario medio",h:230,dec:0,zero:true,lastFmt:function(v){return eur(v,0);},tipFmt:function(v){return eur(v,2);}});
$("reciboTxt").innerHTML="Octubre: "+B(eur(RC.valor))+", "+signo(pct(RC.valor,RC.anterior))+" frente a septiembre y "+signo(pct(RC.valor,RC.hace_un_anio))+" frente a octubre de 2025. "+RC.rebaja_iva.texto+" Para este recibo serían unos "+bien(eur(RC.rebaja_iva.ahorro))+" menos.";

/* ¿Cuánto cuesta hoy…? */
var tareas=[["lavadora","Una lavadora","a 40 °C",0.9],["radiador","Un radiador eléctrico","1 hora a 1.500 W",1.5],["horno","El horno","1 hora",1.2],["plancha","Planchar","1 hora",1.0],["olla","La vitrocerámica","un cocido de 1 hora",1.4]];
$("electro").innerHTML='<div class="fe cab-e"><span></span><span>Tarea</span><span style="text-align:right">a las '+iMin+'h</span><span style="text-align:right">a las '+iMax+'h</span></div>'+tareas.map(function(t){return '<div class="fe">'+ico(t[0])+'<span>'+t[1]+'<small>'+t[2]+' · ≈ '+fmt(t[3],1)+' kWh</small></span><span class="b">'+fmt(t[3]*horas[iMin]*100,1)+' cts</span><span class="c">'+fmt(t[3]*horas[iMax]*100,1)+' cts</span></div>';}).join("")+'<p class="sub" style="margin:8px 0 0">Consumos orientativos. Una lavadora al día en la hora barata en vez de la cara ahorra unos '+B(eur((horas[iMax]-horas[iMin])*0.9*30))+' al mes.</p>';

/* Gas */
$("gasV").textContent=fmt(GT.variable,2)+" cts";
$("gasJ").innerHTML=flecha(pct(GT.variable,GT.variable_julio));
$("gasRecibo").innerHTML="Un hogar con calefacción de gas (9.000 kWh al año) paga ahora unos "+B(eur(GT.recibo_mes.octubre))+" al mes con la TUR, frente a "+B(eur(GT.recibo_mes.julio))+" en verano: "+signo(pct(GT.recibo_mes.octubre,GT.recibo_mes.julio))+". El próximo cambio, el 1 de enero.";

/* Comparativa de días (ventana) */
$("abrirDias").addEventListener("click",function(){
  var ks=Object.keys(hist).sort();var todo=[];ks.forEach(function(k){todo=todo.concat(hist[k]);});
  var vmin=Math.min.apply(null,todo),vmax=Math.max.apply(null,todo);
  var elegido=ks.length>1?ks[ks.length-2]:ks[0];
  function filas(){
    var o='<div class="calor" role="table" aria-label="Precio por hora de cada día"><div></div>';
    for(var k=0;k<24;k++)o+='<div class="hh">'+(k%3===0?k+"h":"")+'</div>';
    ks.forEach(function(d){var arr=hist[d],orden=arr.slice().sort(function(a,b){return b-a;}),tope=orden[2];
      o+='<button type="button" class="dia" data-d="'+d+'" aria-pressed="'+(d===elegido)+'">'+(d===L.fecha?"Hoy":diaSem(d))+'</button>';
      arr.forEach(function(v,k2){var t=(v-vmin)/((vmax-vmin)||1);o+='<div class="c'+(v>=tope?' top':'')+'" style="background:'+colorPrecio(t)+'" title="'+diaSem(d)+', '+k2+'h: '+fmt(v,3)+' €/kWh">'+fmt(v*100,0)+'</div>';});});
    return o+'</div>';
  }
  function resumen(){return '<table class="res" style="margin-top:12px"><thead><tr><th>Día</th><th>Media</th><th>Hora más barata</th><th>Hora más cara</th></tr></thead><tbody>'+ks.map(function(d){var a=hist[d],m2=a.reduce(function(x,y){return x+y;},0)/24,mi=a.indexOf(Math.min.apply(null,a)),ma=a.indexOf(Math.max.apply(null,a));return '<tr><td>'+(d===L.fecha?"<b>Hoy</b>":diaSem(d))+'</td><td>'+fmt(m2,3)+'</td><td><span class="baja-n">'+mi+'h · '+fmt(a[mi],3)+'</span></td><td><span class="sube-n">'+ma+'h · '+fmt(a[ma],3)+'</span></td></tr>';}).join("")+'</tbody></table>';}
  function linea(){var data=[];for(var k=0;k<24;k++)data.push([h2(k)+"h",hist[L.fecha]?hist[L.fecha][k]:null,hist[elegido][k]]);
    lineas($("vLinea"),data,[{k:2,color:css("--anil"),name:diaSem(elegido)},{k:1,color:css("--albero"),name:"Hoy",ancho:3}],{aria:"Comparación hora a hora",h:250,every:3,dec:2,fondo:ks.filter(function(d){return d!==elegido&&d!==L.fecha;}).map(function(d){return hist[d];}),lastFmt:function(v){return fmt(v,3);},tipFmt:function(v){return fmt(v,3)+" €/kWh";}});
    $("vLey").innerHTML='<span><i style="background:var(--albero);height:5px"></i>Hoy</span><span><i style="background:var(--anil)"></i>'+diaSem(elegido)+'</span><span><i style="background:var(--raya)"></i>Resto de días</span>';}
  abrir('<h2 id="vTitulo">'+ico("luz")+'La luz, día a día</h2><p class="exp">Céntimos por kWh en cada hora de los últimos días con datos. Del verde (barato) al naranja (caro); <b style="color:#B3262F">en rojo, las tres horas más caras de cada día</b>. Pulsa un día para compararlo con hoy en el gráfico.</p><div style="overflow-x:auto" id="vCalor">'+filas()+'</div><div class="calor-ley"><span><i style="background:linear-gradient(90deg,'+colorPrecio(0)+','+colorPrecio(.5)+','+colorPrecio(1)+')"></i> de '+fmt(vmin*100,0)+' a '+fmt(vmax*100,0)+' céntimos</span><span><i style="background:#B3262F"></i> 3 horas más caras del día</span></div><h3 style="margin-top:16px">Hora a hora</h3><div class="chart" id="vLinea"></div><div class="leyenda" id="vLey"></div>'+resumen()+'<p class="fuente">Datos de Red Eléctrica (PVPC, península, sin impuestos), vía tarifaluzhora.es, Selectra e Iberdrola. El 7 y el 8 de noviembre no constan en las fuentes consultadas.</p>',function(){
    linea();
    $("vCalor").addEventListener("click",function(e){var b=e.target.closest(".dia");if(!b)return;elegido=b.getAttribute("data-d");$("vCalor").querySelectorAll(".dia").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false");});linea();});
  });
});

/* ---------- Gasolinera ---------- */
lineas("chFuel",C.serie,[{k:1,color:css("--anil"),name:"Gasolina 95"},{k:2,color:css("--albero"),name:"Diésel"}],{aria:"Gasolina 95 y diésel",h:250,every:2,dec:2,lastFmt:function(v){return fmt(v,2)+" €";},tipFmt:function(v){return fmt(v,3)+" €/l";}});
$("depD").textContent=eur(fl[2]*50,0);$("depD0").textContent=eur(C.hace_un_anio.diesel*50,0);
$("depG").textContent=eur(fl[1]*50,0);$("depG0").textContent=eur(C.hace_un_anio.gasolina*50,0);
$("depD0k").textContent=$("depG0k").textContent="Hace un año ("+C.hace_un_anio.etiqueta+")";
$("diceFuel").innerHTML=cap(G.suNieto)+" paga "+sube("+"+eur((fl[2]-C.hace_un_anio.diesel)*50,0))+" más que el año pasado por llenar la furgoneta. El barril bajó esta semana, pero en el surtidor todavía no se nota.";
lineas("chBrent",BR,[{k:1,color:css("--anil"),name:"Brent"}],{aria:"Precio del Brent",w:1000,h:220,dec:0,lastFmt:function(v){return fmt(v,2)+" $";},tipFmt:function(v){return fmt(v,2)+" $/barril";}});

/* ---------- Calefacción ---------- */
lineas("chButano",D.butano.serie,[{k:1,color:css("--albero"),name:"Bombona 12,5 kg"}],{aria:"Precio de la bombona de butano",h:230,dec:0,extra:[D.butano.tope,15],ref:{v:D.butano.tope,label:"Tope "+fmt(D.butano.tope,2)+" €"},lastFmt:function(v){return eur(v);},tipFmt:function(v){return eur(v);}});
$("gcV").textContent=fmt(D.gasoleo_c.valor,3)+" €";$("gcJ").innerHTML=flecha(pct(D.gasoleo_c.valor,D.gasoleo_c.junio));

/* ---------- Cesta ---------- */
function filaC(r,mx){var w=Math.abs(r[2])/mx*50,st=estado(r[2],0.01);var pos=r[2]>=0?"left:50%;width:"+w+"%":"right:50%;width:"+w+"%";
  return '<div class="fila-c">'+ico(r[0])+'<span>'+r[1]+(r[3]==="INE"?' <small class="fte" title="Dato del IPC del INE">INE</small>':'')+'</span><div class="barra" aria-hidden="true"><span style="'+pos+';background:var(--'+(st==="plano"?"tinta-2":st)+')"></span></div>'+flecha(r[2],Math.abs(r[2])<0.1?2:1,0.01)+'</div>';}
/* 8 representativos (los 4 que más suben y los 4 que más bajan) y botón para ver la lista entera */
function filasCesta(id,rows){
  var mx=Math.max.apply(null,rows.map(function(r){return Math.abs(r[2]);})),ord=rows.slice().sort(function(a,b){return b[2]-a[2];});
  var cortos=ord.length>8?ord.slice(0,4).concat(ord.slice(-4)):ord;
  var html='<div class="lista-c">'+cortos.map(function(r){return filaC(r,mx);}).join("")+'</div>';
  if(ord.length>8)html+='<div class="lista-c entera" hidden>'+ord.map(function(r){return filaC(r,mx);}).join("")+'</div><button type="button" class="ver-todo" aria-expanded="false">Ver los '+ord.length+' alimentos ▾</button>';
  $(id).innerHTML=html;
  var b=$(id).querySelector(".ver-todo");if(b)b.addEventListener("click",function(){var abierto=b.getAttribute("aria-expanded")==="true";$(id).querySelector(".lista-c").hidden=!abierto;$(id).querySelector(".entera").hidden=abierto;b.setAttribute("aria-expanded",String(!abierto));b.textContent=abierto?"Ver los "+ord.length+" alimentos ▾":"Ver solo los más destacados ▴";});
}
filasCesta("cMes",cestaMes);filasCesta("cAnio",cestaAnio);
function balda(id,rows){var o=rows.slice().sort(function(a,b){return a[2]-b[2];});var sel=o.slice(0,4).concat(o.slice(-4));
  $(id).innerHTML=sel.map(function(r){var s=estado(r[2],0.01);return '<div class="prod">'+ico(r[0])+'<span>'+r[1]+'</span><span class="etq '+s+'">'+(r[2]>0?"+":"−")+fmt(Math.abs(r[2]),1)+' %</span></div>';}).join("");}
balda("estanteMes",cestaMes);balda("estanteAnio",cestaAnio);

/* ---------- Vivienda ---------- */
lineas("chEuribor",E,[{k:1,color:css("--anil"),name:"Euríbor 12 m"}],{aria:"Euríbor mensual",h:230,every:3,dec:1,lastFmt:function(v){return fmt(v,3)+" %";},tipFmt:function(v){return fmt(v,3)+" %";}});
lineas("chVivienda",D.vivienda.serie,[{k:1,color:css("--anil"),name:"Vivienda usada"}],{aria:"Precio de la vivienda usada",w:1000,h:200,dec:0,lastFmt:function(v){return fmt(v,0)+" €";},tipFmt:function(v){return fmt(v,0)+" €/m²";}});
$("alqV").innerHTML=fmt(D.alquiler.valor,1)+" € "+flecha(D.alquiler.interanual);
$("vivV").innerHTML=fmt(D.vivienda.valor,0)+" € "+flecha(D.vivienda.interanual);
$("cuotaTxt").innerHTML="Con 150.000 € pendientes a 20 años y euríbor + 0,8, la cuota pasa de <b>"+eur(c0,0)+"</b> a <b>"+eur(c1,0)+"</b> al mes: <b>"+eur(c1-c0,0)+" más</b>, unos "+eur((c1-c0)*12,0)+" al año.";
$("diceCasa").innerHTML="Un piso de 70 metros de alquiler sale por "+sube(eur(D.alquiler.valor*70,0))+" al mes. "+cap(G.suNieto)+" comparte piso con tres "+G.comp+".";

/* ---------- IPC, sueldos y pensiones ---------- */
lineas("chIPC",I,[{k:1,color:css("--anil"),name:"IPC general"},{k:2,color:css("--albero"),name:"Subyacente"}],{aria:"IPC general y subyacente",h:250,dec:1,zero:true,lastFmt:function(v){return fmt(v,1)+" %";},tipFmt:function(v){return fmt(v,1)+" %";}});
var carrera=[["monedero","Precios (IPC)",ipc1],["pension","Pensión media",pct(D.pension.valor,D.pension.hace_un_anio)],["nomina","Salario mínimo",pct(D.smi.valor,D.smi.anterior)]];
var cmx=Math.max.apply(null,carrera.map(function(c){return c[2];}));
$("carrera").innerHTML=carrera.map(function(c,k){return '<div class="fila-c" style="grid-template-columns:34px 120px 1fr 64px">'+ico(c[0])+'<span>'+c[1]+'</span><div style="height:14px;background:var(--plano-bg);border-radius:7px;overflow:hidden"><span style="display:block;height:100%;width:'+(c[2]/cmx*100)+'%;background:'+(k===0?"var(--sube)":"var(--anil)")+';border-radius:7px"></span></div><span class="chg '+(k===0?"sube":"baja")+'">+'+fmt(c[2],1)+' %</span></div>';}).join("")+'<p class="sub" style="margin:6px 0 0">Subida en el último año. Si la barra azul es más corta que la roja, se pierde poder de compra.</p>';
$("diceIpc").innerHTML="Mi pensión sube "+bien(fmt(pct(D.pension.valor,D.pension.hace_un_anio),1)+" %")+" y los precios "+sube(fmt(ipc1,1)+" %")+". Así no hay quien llegue a fin de mes.";

/* La carrera desde 2018: índice 2018 = 100 */
var CA=D.carrera,anios=[],ipcIdx=[],penIdx=[],smiIdx=[],ix=100,px=100;
var smiMap={};D.smi.serie.forEach(function(r){smiMap[r[0]]=r[1];});
for(var yy=CA.base;yy<=2026;yy++){
  if(yy>CA.base){var ip=CA.ipc_medio.filter(function(r){return r[0]===yy;})[0];ix*=1+((ip?ip[1]:ipc1)/100);var pr=CA.pension_reval.filter(function(r){return r[0]===yy;})[0];px*=1+((pr?pr[1]:0)/100);}
  anios.push(String(yy));ipcIdx.push(ix);penIdx.push(px);smiIdx.push(smiMap[String(yy)]?smiMap[String(yy)]/smiMap[String(CA.base)]*100:null);}
var SM=D.salario_medio,smMap={};SM.ees_serie.forEach(function(r){smMap[r[0]]=r[1];});
var smedIdx=anios.map(function(a){return smMap[a]?smMap[a]/smMap[String(CA.base)]*100:null;});
var datosCarrera=anios.map(function(a,k){return [a,ipcIdx[k],penIdx[k],smiIdx[k],smedIdx[k]];});
var serCarrera=[{k:1,color:css("--sube"),name:"Precios (IPC)",ancho:3.5},{k:2,color:css("--anil"),name:"Pensión"},{k:3,color:css("--baja"),name:"Salario mínimo"},{k:4,color:css("--albero"),name:"Salario medio"}];
function abrirCarrera(){
  var nI=ipcIdx[ipcIdx.length-1],nP=penIdx[penIdx.length-1],nS=smiIdx[smiIdx.length-1];
  var ultSm=null,ultSmA=null;smedIdx.forEach(function(v,k){if(v!==null){ultSm=v;ultSmA=anios[k];}});var iSm=ipcIdx[anios.indexOf(ultSmA)];
  var pcP=(nP/nI-1)*100,pcS=(nS/nI-1)*100,pcM=(ultSm/iSm-1)*100;
  var penDeberia=D.pension.valor*nI/nP,difPen=penDeberia-D.pension.valor;
  function barraPC(nom,v,ico0){var w=Math.min(100,Math.abs(v)*2.2);return '<div class="pc-fila">'+ico(ico0)+'<span>'+nom+'</span><div class="pc-eje"><i class="'+(v>=0?'pc-mas':'pc-menos')+'" style="width:'+w/2+'%"></i></div><b class="'+(v>=0?'baja-n':'sube-n')+'">'+(v>=0?'+':'−')+fmt(Math.abs(v),1)+' %</b></div>';}
  var filas=anios.slice(1).map(function(a,k){var ip=CA.ipc_medio.filter(function(r){return r[0]===+a;})[0],pr=CA.pension_reval.filter(function(r){return r[0]===+a;})[0];var i0=ip?ip[1]:ipc1,p0=pr?pr[1]:0,s0=smiIdx[k+1]&&smiIdx[k]?(smiIdx[k+1]/smiIdx[k]-1)*100:null,m0=smedIdx[k+1]&&smedIdx[k]?(smedIdx[k+1]/smedIdx[k]-1)*100:null;
    function c(v){return v===null?'<span style="color:var(--tinta-2)">–</span>':'<span class="'+(v>=i0?'baja-n':'sube-n')+'">'+fmt(v,1)+' %</span>';}
    return '<tr><td>'+a+(ip?'':' <small>(oct.)</small>')+'</td><td><b>'+fmt(i0,1)+' %</b></td><td>'+c(p0)+'</td><td>'+c(s0)+'</td><td>'+c(m0)+'</td></tr>';}).join("");
  abrir('<div class="pop"><header class="pop-cab"><div class="pop-ico">'+ico("medalla")+'</div><div><h2 id="vTitulo">¿Quién gana a los precios?</h2><p class="pop-sub">La carrera desde 2018: cuánto han subido los precios, las pensiones y los sueldos.</p></div></header>'+
    '<div class="cifras-c"><div><b class="sube-n">+'+fmt(nI-100,1)+' %</b><span>Precios (IPC)</span></div><div><b class="'+(nP>=nI?'baja-n':'sube-n')+'">+'+fmt(nP-100,1)+' %</b><span>Pensiones</span></div><div><b class="baja-n">+'+fmt(nS-100,1)+' %</b><span>Salario mínimo</span></div><div><b class="'+(ultSm>=iSm?'baja-n':'sube-n')+'">+'+fmt(ultSm-100,1)+' %</b><span>Salario medio (hasta '+ultSmA+')</span></div></div>'+
    '<section class="pop-graf"><h3>La carrera, año a año <small>2018 = 100</small></h3><div class="chart" id="vCarrera"></div><div class="leyenda"><span><i style="background:var(--sube);height:5px"></i>Precios (IPC)</span><span><i style="background:var(--anil)"></i>Pensión</span><span><i style="background:var(--baja)"></i>Salario mínimo</span><span><i style="background:var(--albero)"></i>Salario medio</span></div></section>'+
    '<section class="pop-bolsillo"><h3>¿Quién ha ganado poder de compra?</h3><p class="pop-sub">Lo que ha subido cada uno por encima (verde) o por debajo (rojo) de los precios desde 2018.</p>'+barraPC("Salario mínimo",pcS,"nomina")+barraPC("Salario medio",pcM,"maletin")+barraPC("Pensión",pcP,"pension")+'</section>'+
    '<div class="pop-cards"><div class="pc-card">'+ico("pension")+'<div><b>'+eur(penDeberia,0)+'</b><span>Cobraría hoy la pensión media de jubilación si hubiera subido igual que los precios desde 2018: '+(difPen>0?eur(difPen,0)+' más al mes, '+eur(difPen*14,0)+' al año.':eur(-difPen,0)+' menos al mes.')+'</span></div></div>'+
    '<div class="pc-card">'+ico("nomina")+'<div><b>'+eur(D.smi.valor-736*nI/100,0)+'</b><span>Es lo que gana de más al mes el salario mínimo frente a lo que valdría si solo hubiera seguido a los precios ('+eur(736*nI/100,0)+').</span></div></div>'+
    '<div class="pc-card">'+ico("monedero")+'<div><b>'+eur(100*nI/100,2)+'</b><span>Lo que cuesta hoy lo que en 2018 costaba 100 €.</span></div></div></div>'+
    '<div class="dice" style="margin-top:12px"><svg aria-hidden="true"><use href="#mini"/></svg><div><span class="quien">Dice Remedios</span>Desde 2018 las pensiones han '+(pcP>=0?"ganado":"perdido")+' un '+B(fmt(Math.abs(pcP),1)+" %")+' frente a los precios y el salario mínimo ha ganado un '+B(fmt(pcS,1)+" %")+', porque subió mucho en 2019. Pero este año los precios corren más que todos.</div></div>'+
    '<section><h3 style="margin-top:16px">Año a año</h3><div style="overflow-x:auto"><table class="res"><thead><tr><th>Año</th><th>Precios</th><th>Pensiones</th><th>Salario mínimo</th><th>Salario medio</th></tr></thead><tbody>'+filas+'</tbody></table></div></section>'+
    '<p class="sub" style="margin-top:8px">En verde, lo que subió más que los precios ese año; en rojo, lo que se quedó por detrás. '+CA.nota+' Salario medio: Encuesta de Estructura Salarial del INE, que se publica con dos años de retraso.</p><footer class="pop-pie">Fuente: <a href="'+CA.fuente.url+'">'+CA.fuente.nombre+'</a> · <a href="'+SM.fuente.url+'">'+SM.fuente.nombre+'</a></footer></div>',
    function(){lineas($("vCarrera"),datosCarrera,serCarrera,{aria:"Precios, pensión y salarios desde 2018",h:320,dec:0,lastFmt:function(v){return fmt(v,0);},tipFmt:function(v){return fmt(v,1)+" (2018 = 100)";}});});
}
$("carreraBox").addEventListener("click",abrirCarrera);
$("carreraBox").addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();abrirCarrera();}});


/* ---------- Monedero ---------- */
var mon=[
  ["diesel","litros de diésel",50/fl[2],50/C.hace_un_anio.diesel,0],
  ["surtidor","litros de gasolina",50/fl[1],50/C.hace_un_anio.gasolina,0],
  ["luz","kWh de luz (energía)",50/mesLuz,50/L.media_hace_un_anio,0],
  ["butano","bombonas de butano",50/D.butano.valor,50/15.58,2],
  ["sello","sellos de carta",50/D.sello.valor,50/D.sello.anterior,0]
];
$("monedero").innerHTML=mon.map(function(m){var d=m[2]-m[3],w=m[2]/Math.max(m[2],m[3])*100,w0=m[3]/Math.max(m[2],m[3])*100;
  return '<div class="mon"><div class="fila">'+ico(m[0])+'<div><div class="num">'+fmt(m[2],m[4])+'</div><div class="sub" style="margin:0;font-size:13px;color:var(--tinta-2)">'+m[1]+'</div></div></div>'+
  '<div class="barra2" title="Ahora"><span style="width:'+w+'%;background:var(--anil)"></span></div><div class="barra2" title="Hace un año"><span style="width:'+w0+'%;background:var(--anil-2)"></span></div>'+
  '<div style="font-size:13px">Hace un año: '+fmt(m[3],m[4])+' · <span class="'+(d<0?"sube-n":"baja-n")+'">'+(d<0?"−":"+")+fmt(Math.abs(d),m[4])+'</span></div></div>';}).join("");

/* ---------- Cuenta de la vieja ---------- */
function calc(){
  var num=function(id){var v=parseFloat($(id).value);return isFinite(v)&&v>=0?v:0;};
  var kwh=num("kwh"),lit=num("litros"),tipo=$("comb").value,bo=num("bomb"),Cap=num("capital"),an=Math.max(1,num("plazo")),di=num("dif"),co=num("compra");
  var rows=[["luz","Luz (energía)",kwh*L.media_hace_un_anio,kwh*mesLuz],
    [tipo==="d"?"diesel":"surtidor",tipo==="d"?"Diésel":"Gasolina 95",lit*(tipo==="d"?C.hace_un_anio.diesel:C.hace_un_anio.gasolina),lit*(tipo==="d"?fl[2]:fl[1])],
    ["butano","Butano",bo*15.58,bo*D.butano.valor],["hipoteca","Hipoteca",Cap?cuota(Cap,eu0+di,an):0,Cap?cuota(Cap,eu1+di,an):0],["cesta","Compra",co,co*(1+ipc1/100)]];
  var t0=0,t1=0;
  $("tCuenta").innerHTML=rows.map(function(r){t0+=r[2];t1+=r[3];var d=r[3]-r[2];return "<tr><td>"+ico(r[0])+r[1]+"</td><td>"+eur(r[2])+"</td><td>"+eur(r[3])+"</td><td class='chg "+estado(d,0.005)+"'>"+(d>=0?"+":"−")+eur(Math.abs(d))+"</td></tr>";}).join("");
  var Dd=t1-t0;$("tot0").textContent=eur(t0);$("tot1").textContent=eur(t1);var td=$("totD");td.textContent=(Dd>=0?"+":"−")+eur(Math.abs(Dd));td.className="chg "+estado(Dd,0.005);
  $("gordo").textContent=eur(t1,0);
  $("gordoSub").innerHTML=(Dd>=0?"<b style='color:var(--sube)'>"+eur(Dd,0)+" más</b>":"<b style='color:var(--baja)'>"+eur(-Dd,0)+" menos</b>")+" que hace un año"+(t0?", un "+fmt(Math.abs(pct(t1,t0)),1)+" %":"")+". Al año: "+eur(Math.abs(Dd)*12,0)+".";
}
$("fCuenta").addEventListener("input",calc);$("fCuenta").addEventListener("submit",function(e){e.preventDefault();});calc();

/* ---------- Agenda ---------- */
$("agendaBox").innerHTML=D.agenda.map(function(a){var falta="";if(/^\d{4}-/.test(a.fecha)){var dd=dias(hoyISO,a.fecha);falta=dd===0?"Es hoy":dd===1?"Mañana":dd>1?"Faltan "+dd+" días":"Ya pasó";}
  return '<div class="cita"><div class="hoja">'+a.titulo+'</div><div class="cuerpo">'+a.texto+(falta?'<div class="falta">'+falta+'</div>':"")+'</div></div>';}).join("");

/* ---------- Antes y ahora ---------- */
var HI=D.historico,PTA=166.386;
var ART={pan:"la barra de pan",cafe:"el café en el bar",periodico:"el periódico",leche:"la leche",huevos:"los huevos",arroz:"el arroz",gasolina:"la gasolina",gasoleo:"el gasóleo",metro:"el billete de metro",bono:"el bono de diez viajes",sello:"el sello",cine:"la entrada de cine",menu:"el menú del día",butano:"la bombona de butano",vivienda:"el metro cuadrado de piso"};
var dichos={1976:"Tengo 31 años. El periódico cuesta 10 pesetas y la barra de pan, 7. ¡Y me parece caro!",1986:"El metro y el autobús, a 50 pesetas. El periódico, a 60. Y el salario mínimo no llega a 41.000 al mes.",1990:"El sello de una carta, 15 pesetas. Le escribo a mi hermana todas las semanas.",2001:"Último año de la peseta: el café a 100, el metro a 145 y el menú del día a 700.",2006:"Este verano la gasolina ha pasado del euro. ¡Quién lo iba a decir!",2012:"La bombona, a 16,10 €. Y los pisos, bajando de precio.",2016:"Ya estoy jubilada. El salario mínimo de "+G.suNieto+": 655 euros."};
function cercano(puntos,anio,tol){var best=null,dist=1e9;puntos.forEach(function(p){var dd=Math.abs(p.anio-anio);if(dd<dist||(dd===dist&&p.anio<anio)){dist=dd;best=p;}});return dist<=tol?best:null;}
function enEuros(p){return p.v!==undefined?p.v:p.pta/PTA;}
function precioAntes(p){if(p.pta!==undefined)return (p.txt||fmt(p.pta,0)+" pta")+" <small style='font-size:.75em'>("+eur(p.pta/PTA,2)+")</small>";return p.txt?p.txt+(p.v>=0.5?" <small style='font-size:.75em'>("+eur(p.v,2)+")</small>":""):eur(p.v,2);}
$("remediosAhora").innerHTML=Remedios.figura({edad:81,anio:2026,actividad:"abanico"});
$("aniosSel").innerHTML=HI.anios.map(function(a){return '<button type="button" role="radio" aria-checked="false" data-a="'+a+'">'+a+'</button>';}).join("");
var anioSel=1986;
$("aniosSel").addEventListener("click",function(e){var b=e.target.closest("button");if(b)pintarAntes(+b.getAttribute("data-a"));});
$("aniosSel").addEventListener("keydown",function(e){var i=HI.anios.indexOf(anioSel);if(e.key==="ArrowRight"||e.key==="ArrowDown")i=Math.min(HI.anios.length-1,i+1);else if(e.key==="ArrowLeft"||e.key==="ArrowUp")i=Math.max(0,i-1);else return;e.preventDefault();pintarAntes(HI.anios[i]);$("aniosSel").querySelector('[data-a="'+HI.anios[i]+'"]').focus();});
function pintarAntes(anio){
  anioSel=anio;var edad=anio-HI.nacimiento_remedios;
  $("aniosSel").querySelectorAll("button").forEach(function(b){var on=+b.getAttribute("data-a")===anio;b.setAttribute("aria-checked",on?"true":"false");b.tabIndex=on?0:-1;});
  $("anioAntes").textContent=anio;
  $("remediosJoven").innerHTML=Remedios.figura({edad:edad,anio:anio,actividad:"abanico"});
  $("marcoPie").textContent="Remedios en "+anio+", con "+edad+" años";
  $("antesTxt").textContent=dichos[anio]||"";$("antesPie").textContent="Remedios en "+anio;
  var con=[],sin=[];
  HI.items.forEach(function(it){var p=cercano(it.puntos,anio,4);(p?con:sin).push([it,p]);});
  var mults=con.filter(function(x){return x[0].id!=="smi";}).map(function(x){return [x[0],x[0].hoy.v/enEuros(x[1])];});
  var s0=con.filter(function(x){return x[0].id==="smi";})[0];
  if(mults.length>=2){mults.sort(function(a,b){return b[1]-a[1];});
    $("ahoraTxt").innerHTML="<div>Desde "+anio+", el precio de "+(ART[mults[0][0].id]||mults[0][0].nombre.toLowerCase())+" se ha multiplicado por "+sube(fmt(mults[0][1],1))+(s0?" y el salario mínimo por "+B(fmt(HI.items.filter(function(i){return i.id==="smi";})[0].hoy.v/enEuros(s0[1]),1)):"")+". ¡Qué tiempos, "+G.hija+"!</div>";}
  else $("ahoraTxt").innerHTML="<div>De "+anio+" apenas tengo datos fiables. Elige otro año, "+G.hija+".</div>";
  $("filasAy").innerHTML=con.concat(sin).map(function(x){var it=x[0],p=x[1];
    var ahora='<div class="lado ahora">'+ico(it.icono)+'<div><div class="nom">'+it.nombre+'</div><span class="precio-ahora">'+it.hoy.txt+'</span><div class="fte">'+(it.hoy.anio<2026?"Dato de "+it.hoy.anio+" · ":"")+it.hoy.fuente+'</div></div></div>';
    if(!p)return '<div class="fila-ay"><div class="lado antes"><div><div class="nom">'+it.nombre+'</div><div class="fte">Sin un dato fiable cerca de '+anio+'</div></div>'+ico(it.icono)+'</div><div class="centro"><div class="multi nada">sin<br>dato</div></div>'+ahora+'</div>';
    var x2=it.hoy.v/enEuros(p);
    return '<div class="fila-ay"><div class="lado antes"><div><div class="nom">'+it.nombre+'</div><span class="precio-antes">'+precioAntes(p)+'</span><div class="fte">'+(p.anio!==anio?"Dato de "+p.anio+" · ":"")+p.fuente+'</div></div>'+ico(it.icono)+'</div>'+
      '<div class="centro"><div class="multi'+(x2<1?" menos":"")+'">'+(x2>=1?"×"+fmt(x2,x2<10?1:0):"−"+fmt((1-x2)*100,0)+"%")+'<small>'+(x2>=1?"veces":"más barato")+'</small></div></div>'+ahora+'</div>';
  }).join("");
  /* pictogramas */
  var smiA=Object.keys(HI.smi).map(Number).filter(function(a){return a<2026;});
  var out="",s1=HI.smi["2026"],u=25;
  ["pan","cafe","periodico","leche","gasolina","metro","sello"].forEach(function(id){
    var it=HI.items.filter(function(x){return x.id===id;})[0];if(!it)return;var p=cercano(it.puntos,anio,5);if(!p)return;
    var sp=null,spd=1e9;smiA.forEach(function(a){var dd=Math.abs(a-p.anio);if(dd<spd){spd=dd;sp=a;}});if(spd>3)return;
    var n0=HI.smi[sp]/enEuros(p),n1=s1/it.hoy.v,etq=sp===p.anio?"en "+p.anio:"en "+p.anio+" (salario de "+sp+")";
    var fila=function(n,cl){var k=Math.round(n/u),s="";for(var j=0;j<Math.min(k,70);j++)s+=ico(it.icono);return '<div class="fila-ico '+cl+'">'+s+'<b>'+fmt(n,0)+' '+(cl==="antes"?etq:"hoy")+'</b></div>';};
    out+='<div class="picto"><div class="lab"><b style="color:var(--tinta)">'+it.nombre+'</b><br>con un salario mínimo mensual</div><div class="lado">'+fila(n0,"antes")+fila(n1,"")+'</div></div>';
  });
  $("pictos").innerHTML=out||'<p class="sub">No hay datos suficientes cerca de '+anio+' para esta comparación.</p>';
}
pintarAntes(anioSel);

/* ---------- Recién salido del horno: lo que ha llegado estos días ---------- */
var SECN={luz:"Luz",gasolinera:"Gasolinera",calefaccion:"Calefacción",cesta:"La cesta",vivienda:"La casa",ipc:"Sueldos y pensiones",cuenta:"El monedero",agenda:"Agenda"};
var vistos={},novs=[];
tiles.forEach(function(t){var fr=FRECUENTES.indexOf(t.blk)>=0;if(vistos[t.blk]||!esNuevo(t.act,fr))return;vistos[t.blk]=1;novs.push({t:t,act:t.act});});
if(esNuevo(D.cesta.actualizado,false)||esHoy(D.cesta.actualizado))novs.push({cesta:true,act:D.cesta.actualizado});
novs.sort(function(a,b){return a.act<b.act?1:-1;});
function haceDias(iso){var d=dias(iso,hoyISO);return d===0?"hoy":d===1?"ayer":"hace "+d+" días";}
if(novs.length){
  $("novedades").hidden=false;
  $("novSub").textContent=(novs.length===1?"Un dato nuevo":novs.length+" datos nuevos")+" en los últimos "+DIAS_NUEVO+" días. Pulsa uno para ir a su sección.";
  $("novLista").innerHTML=novs.map(function(n,k){var rot=((k*37)%5-2)*0.5;
    if(n.cesta){var top=cestaMes.slice().sort(function(a,b){return a[2]-b[2];});
      return '<a class="recorte" style="--rot:'+rot+'deg" href="#cesta" data-ir="cesta"><span class="sello-n">'+badge(n.act)+'</span><div class="fila">'+ico("cesta")+'<h3>La cesta de la compra</h3></div><div class="gordo-n">'+top[0][1]+' '+baja(fmt(top[0][2],1).replace("-","−")+" %")+'</div><p>Y '+top[1][1].toLowerCase()+' '+baja(fmt(top[1][2],1).replace("-","−")+" %")+'. Lo que más sube: '+top[top.length-1][1].toLowerCase()+' '+sube("+"+fmt(top[top.length-1][2],1)+" %")+'.</p><p class="cuando-n">Precios de '+corto(D.cesta.fecha)+' · publicado '+haceDias(n.act)+'</p></a>';}
    var t=n.t,c=t.ant,d=dirDe(c.p||0,c.pt?0.05:0.5);
    return '<a class="recorte" style="--rot:'+rot+'deg" href="#'+t.sec+'" data-ir="'+t.sec+'"><span class="sello-n">'+badge(n.act)+'</span><div class="fila">'+ico(t.ico)+'<h3>'+t.t+'</h3></div><div class="gordo-n">'+t.v+' <small style="font-size:14px;font-weight:500">'+t.u+'</small> '+cmpTxt(c,t.bueno)+'</div><p>'+expl(t,c,"ant")+'</p><p class="cuando-n">'+cap(frenteA(c.k))+' · publicado '+haceDias(n.act)+'</p></a>';}).join("");
}
/* La cinta se mueve sola si no cabe; se para al pasar el ratón */
function cinta(){var v=$("novVentana"),pi=$("novLista");if(!v||$("novedades").hidden)return;
  if(!pi.getAttribute("data-orig"))pi.setAttribute("data-orig",pi.innerHTML);
  pi.innerHTML=pi.getAttribute("data-orig");v.classList.remove("corre");
  if(pi.scrollWidth>v.clientWidth+10&&!reduceMov){pi.innerHTML+=pi.innerHTML.replace(/<a /g,'<a aria-hidden="true" tabindex="-1" ');v.classList.add("corre");v.style.setProperty("--dur",Math.round(pi.scrollWidth/2/40)+"s");}}
var reduceMov=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
cinta();var tCinta;window.addEventListener("resize",function(){clearTimeout(tCinta);tCinta=setTimeout(cinta,300);});
var secNuevas={};novs.forEach(function(n){secNuevas[n.cesta?"cesta":n.t.sec]=1;});
document.querySelectorAll("nav.secc a[data-ir]").forEach(function(a){if(secNuevas[a.getAttribute("data-ir")])a.classList.add("con-nuevo");});

/* ---------- El podio del año ---------- */
var cand=[];
tiles.forEach(function(t){var c=t.anio;if(t.bueno||t.id==="paro"||c.p===null||c.p===undefined||c.pt)return;cand.push({ico:t.ico,n:t.t,p:c.p});});
cestaAnio.forEach(function(r){cand.push({ico:r[0],n:r[1],p:r[2]});});
var porNombre={};cand=cand.filter(function(x){if(porNombre[x.n])return false;porNombre[x.n]=1;return true;});
function podio(id,lista){var o=[lista[1],lista[0],lista[2]],cls=["p2","p1","p3"],pos=[2,1,3];
  $(id).innerHTML=o.map(function(x,k){if(!x)return "<div></div>";return '<div class="escalon '+cls[k]+'">'+ico(x.ico)+'<span class="nom">'+x.n+'</span><div class="caja"><span class="pos">'+pos[k]+'</span><span class="pc">'+(x.p>0?"+":"−")+fmt(Math.abs(x.p),1)+' %</span></div></div>';}).join("");}
podio("podioSube",cand.slice().sort(function(a,b){return b.p-a.p;}).slice(0,3));
podio("podioBaja",cand.slice().sort(function(a,b){return a.p-b.p;}).slice(0,3));

/* ---------- ¿Qué cocino este mes? ---------- */
$("diceCocina").innerHTML=consejoCocina||"Este mes no hay grandes rebajas en la cesta. Cocina de aprovechamiento, que nunca falla.";
$("recetas").innerHTML=recetasMes.slice(0,3).map(function(x,k){return '<div class="ficha">'+(k===0?'<span class="medalla">La de este mes</span>':'')+'<h4>'+x.r.n+'</h4><div class="ings">'+x.con.map(function(c){return '<span class="ing">'+ico(c[0])+cap(c[1].n.replace(/^Carne de /,"").split(" ")[0])+' '+signo(c[1].p)+(c[1].cuando==="en un año"?'<small style="color:var(--tinta-2)">&nbsp;en un año</small>':'')+'</span>';}).join("")+'</div><p>'+rem(x.r.t)+'</p></div>';}).join("");

/* ---------- La Gaceta del Patio ---------- */
function verbo(p){var m=Math.abs(p);if(m<0.5)return "se mantiene";if(p>0)return m>10?"se dispara un":m>3?"sube con fuerza, un":"sube un";return m>10?"se desploma un":m>3?"cae un":"baja un";}
function titular(t){var c=t.ant;if(c.pt)return cap(t.t)+(Math.abs(c.p)<0.05?" se mantiene en el "+t.v+" %":(c.p>0?" sube ":" baja ")+fmt(Math.abs(c.p),2).replace(/,?0+$/,"")+" puntos, hasta el "+t.v+" %");var v=verbo(c.p);return cap(t.t)+" "+v+(v==="se mantiene"?"":" "+fmt(Math.abs(c.p),1)+" %");}
function tagG(c,bueno){var col=tono(estado(c.p,c.pt?0.05:0.5),bueno);return '<span class="g-tag '+(col==="sube"?"mal":col==="baja"?"bien":"plano")+'">'+(c.p>0?"+":c.p<0?"−":"")+fmt(Math.abs(c.p),c.pt?2:1)+(c.pt?" pt":" %")+'</span>';}
function porId(id){return tiles.filter(function(t){return t.id===id;})[0];}
/* El tiempo de los precios: sol si baja, tormenta si sube mucho (para el bolsillo) */
function tiempo(p,bueno){var x=bueno?-p:p;return x<=-2?["sol","Despejado"]:x<-0.5?["solnube","Claros"]:x<=0.5?["nube","Nublado"]:x<=5?["lluvia","Chubascos"]:["tormenta","Tormenta"];}
function pintarGaceta(){
  $("gNum").textContent="Año I · Número "+(dias("2026-11-01",hoyISO)+1);
  $("gFecha").textContent=largo(hoyISO).replace(/^./,function(c){return c.toUpperCase();});
  var efe=efemHoy[0],cur=P.curiosidades.length?P.curiosidades[diaN%P.curiosidades.length]:null;
  $("gFranja").innerHTML='<div><b class="k">'+(fiestaHoy.length?"Hoy es fiesta":"Santoral")+'</b>'+(fiestaHoy.length?cap(fiestaHoy[0].nombre)+" en "+fiestaHoy[0].donde+". ":"")+(santoHoy?"Hoy es "+santoHoy+".":"Felicidades a quien celebre hoy su santo.")+'</div><div><b class="k">El refrán del día</b>'+(refranHoy?"«"+refranHoy[0]+"»":"")+'</div><div><b class="k">'+(efe?"Tal día como hoy, "+efe[0]:"De la hemeroteca")+'</b>'+(efe?efe[1]:(cur?cur[0]:""))+'</div>';
  var cands=tiles.filter(function(t){return t.ant.p!==null&&t.ant.p!==undefined&&!t.ant.pt;});
  var orden=cands.slice().sort(function(a,b){return Math.abs(b.ant.p)-Math.abs(a.ant.p);});
  var prin=orden[0],c=prin.ant;
  $("gPrincipal").innerHTML='<div class="antetitulo">'+(SECN[prin.sec]||"")+' · '+(esNuevo(prin.act,FRECUENTES.indexOf(prin.blk)>=0)||esHoy(prin.act)?"Dato nuevo":"El dato del día")+'</div><h2>'+titular(prin)+'</h2><div class="g-grande"><span class="num">'+prin.v+'<small>'+prin.u+'</small></span>'+tagG(c,prin.bueno)+'</div><div class="chart" id="gChart"></div>';
  prin.graf($("gChart"));
  $("gRemedios").innerHTML='<div class="bocata">'+expl(prin,c,"ant")+'</div>'+Remedios.figura({edad:81,anio:2026,actividad:"periodico"});
  var cats=[["luz","Luz","luz"],["diesel","Gasolinera","surtidor"],["gastur","Calefacción","radiador"],["cesta","La compra","cesta"],["alquiler","Alquiler","llave"],["euribor","Hipoteca","hipoteca"],["ipc","Precios","monedero"],["paro","Empleo","maletin"]];
  var mediaCesta=cestaMes.reduce(function(a,r){return a+r[2];},0)/cestaMes.length;
  $("gTiempo").innerHTML=cats.map(function(k){var p,bueno=false,txt;
    if(k[0]==="cesta"){p=mediaCesta;txt=(p>0?"+":"−")+fmt(Math.abs(p),1)+" % de media este mes";}
    else{var t=porId(k[0]);p=t.ant.pt?t.ant.p*10:t.ant.p;txt=cifraTxt(t.ant)+" "+frenteA(t.ant.k);}
    var w=tiempo(p,bueno);return '<div class="g-dia"><svg class="w" aria-hidden="true"><use href="#i-'+w[0]+'"/></svg><div class="q">'+k[1]+'</div><div class="e">'+w[1]+'</div><div class="p">'+txt+'</div></div>';}).join("");
  $("gBreves").innerHTML=orden.slice(1,4).map(function(t){return '<article class="g-breve"><svg class="ic" aria-hidden="true"><use href="#i-'+t.ico+'"/></svg><h3>'+titular(t)+'</h3><div class="num">'+t.v+'<small>'+t.u+'</small></div>'+(t.sp?spark(t.sp,"#3558B8"):"")+'</article>';}).join("");
  var otras=Remedios.actividades.filter(function(a){return a!=="periodico";}),actV=otras[diaN%otras.length];
  var frase=refranHoy?"«"+refranHoy[0]+"» "+rem(refranHoy[1]):(consejoCocina||"");
  $("gVineta").innerHTML='<div class="vineta">'+Remedios.figura({edad:81,anio:2026,actividad:actV})+'<div class="bocata">'+frase+'</div></div>';
  pregunta();
}
function cifraTxt(c){return (c.p>0?"+":c.p<0?"−":"")+fmt(Math.abs(c.p),c.pt?2:1)+(c.pt?" pt":" %");}

/* ---------- ¡Al grano, Remedios! ---------- */
function alGrano(){
  var dia=fecha(hoyISO).toLocaleDateString("es-ES",{weekday:"long"});
  var l=[];
  l.push(["calendario","Hoy es "+dia+(santoHoy?", "+santoHoy:"")+". Vamos al grano, que se enfría el café."]);
  fiestaHoy.forEach(function(f){l.push(["fiesta",B("Hoy es fiesta "+(f.ambito==="nacional"?"en toda España":"en "+f.donde)+".")+" "+rem(f.msg)]);});
  l.push(["lavadora","La mejor hora para poner la lavadora es a las "+h(iMin)+": "+baja(fmt(horas[iMin]*100,1)+" céntimos")+" el kWh. Ni se te ocurra a las "+h(iMax)+" ("+sube(fmt(horas[iMax]*100,1)+" céntimos")+")."]);
  var r7=rank7,n7=dias7.length,frLuz=r7===1?"Es el día más caro de la semana para la luz":r7===n7?"Es el día más barato de la semana para la luz":r7<=Math.ceil(n7/2)?"Es de los días caros de la semana para la luz":"Es de los días baratos de la semana para la luz";
  var pAy=pct(media,L.media_ayer),caroSem=r7<=Math.ceil(n7/2);
  l.push(["luz",frLuz+(((pAy>0)===caroSem)?", "+signo(pAy)+" frente a ayer.":", aunque hoy "+(pAy>0?"sube un "+sube(fmt(pAy,1)+" %"):"baja un "+baja(fmt(-pAy,1)+" %"))+" frente a ayer.")]);
  var br=porId("brent"),pa=br.anio.p;
  l.push(["barril",(pa>25?"El petróleo sigue por las nubes":pa>0?"El petróleo, todavía caro":"El petróleo, más tranquilo")+": "+B(fmt(bl,0)+" $")+" el barril, "+signo(pa,0)+" en un año. El diésel, a "+B(fmt(fl[2],3)+" €")+"."+(fl[2]>1.7?" Nada de coche si puedes ir andando o en autobús.":"")]);
  l.push(["radiador","La calefacción de gas, un "+sube(fmt(pct(GT.variable,GT.variable_julio),0)+" %")+" más cara que en verano. Un grado menos y una rebeca."]);
  if(recetasMes[0])l.push(["olla","En la plaza, "+masBarato[0][1].toLowerCase()+" "+baja(fmt(Math.abs(masBarato[0][2]),1).replace(/^/,"−")+" %")+" y "+masBarato[1][1].toLowerCase()+" "+baja("−"+fmt(Math.abs(masBarato[1][2]),1)+" %")+". Hoy, "+B(recetasMes[0].r.n.toLowerCase())+"."]);
  if(novs.length){var nn=novs[0];l.push(["periodico","Dato nuevo: "+(nn.cesta?"han llegado los precios de la cesta de la compra.":titular(nn.t)+" ("+nn.t.v+" "+nn.t.u+").")]);}
  l.push(["hipoteca","Si tienes hipoteca variable: euríbor al "+B(fmt(eu1,3)+" %")+". Para 150.000 €, "+B(eur(c1-c0,0))+" más al mes que hace un año."]);
  if(proxima)l.push(["libreta","Apunta: "+B(proxima.titulo)+". "+proxima.texto]);
  if(refranHoy)l.push(["medalla","Y ya sabes: «"+refranHoy[0]+"»"]);
  abrir('<div class="grano"><div class="fig">'+Remedios.figura({edad:81,anio:2026,actividad:"abanico"})+'</div><div><h2 id="vTitulo">¡Al grano, Remedios!</h2><p class="sub">Lo más importante de hoy, '+largo(hoyISO)+'.</p><ol>'+l.map(function(x,k){return '<li style="--n:'+k+'">'+ico(x[0])+'<span>'+x[1]+'</span></li>';}).join("")+'</ol></div></div>');
}
document.addEventListener("click",function(e){if(e.target.closest("[data-grano]"))alGrano();});

/* ---------- Remedios en el logo: parpadea y hace cosillas ---------- */
(function(){if(reduceMov)return;function parpadeo(){var ls=document.querySelectorAll("svg.logo");ls.forEach(function(sv){sv.classList.add("parpadea");});setTimeout(function(){ls.forEach(function(sv){sv.classList.remove("parpadea");});},140);}
  function ciclo(){parpadeo();if(Math.random()<0.25)setTimeout(parpadeo,320);setTimeout(ciclo,2600+Math.random()*3800);}setTimeout(ciclo,1200);})();
(function(){if(reduceMov)return;var acc=["a-abanico","a-guino","a-cabeza","a-risa","a-salto","a-abanico"];
  function hacer(){var a=acc[Math.floor(Math.random()*acc.length)];document.querySelectorAll("svg.logo").forEach(function(sv){if(a==="a-salto"&&sv.classList.contains("mini"))return;sv.classList.add(a);setTimeout(function(){sv.classList.remove(a);},1900);});setTimeout(hacer,3500+Math.random()*4500);}
  setTimeout(hacer,2500);})();

/* ---------- Barra fija al hacer scroll ---------- */
(function(){var bf=$("barraFija"),cab=document.querySelector(".ticker");var on=false;
  function mira(){var y=cab.getBoundingClientRect().bottom;var v=y<0;if(v!==on){on=v;bf.classList.toggle("on",v);if(v)bf.removeAttribute("inert");else bf.setAttribute("inert","");}}
  window.addEventListener("scroll",mira,{passive:true});mira();})();

var quizItems=D.historico.items.filter(function(it){return it.puntos.length&&P.antes[it.id];});
function redondo(v,pta){if(pta)return v<20?Math.round(v):v<200?Math.round(v/5)*5:v<2000?Math.round(v/50)*50:Math.round(v/500)*500;return Math.round(v*100)/100;}
function pregunta(){
  var it=quizItems[Math.floor(Math.random()*quizItems.length)],p=it.puntos[Math.floor(Math.random()*it.puntos.length)],pta=p.pta!==undefined,v=pta?p.pta:p.v;
  var ops=[v,redondo(v*0.5,pta),redondo(v*2,pta)];if(ops[1]===ops[0])ops[1]=pta?v+5:v/2;ops=barajar(ops);
  var f=function(x){return pta?fmt(x,0)+" pesetas":eur(x);};
  $("gQuiz").innerHTML='<p style="margin:0;font-size:17px">¿Cuánto costaba <b>'+it.nombre.toLowerCase()+'</b> en <b>'+p.anio+'</b>?</p><div class="quiz-ops">'+ops.map(function(o){return '<button type="button" data-v="'+o+'">'+f(o)+'</button>';}).join("")+'</div><div class="quiz-res" id="quizRes"></div>';
  $("gQuiz").querySelectorAll("button[data-v]").forEach(function(b){b.addEventListener("click",function(){var ok=+b.getAttribute("data-v")===v;
    $("gQuiz").querySelectorAll("button[data-v]").forEach(function(x){x.disabled=true;if(+x.getAttribute("data-v")===v)x.className="ok";else if(x===b)x.className="ko";});
    $("quizRes").innerHTML=(ok?"¡Bien! ":"¡Huy! Eran "+f(v)+". ")+"Hoy cuesta "+eur(it.hoy.v)+". "+rem(P.antes[it.id])+' <button type="button" class="boton-g" id="otraP">Otra pregunta</button>';
    $("otraP").addEventListener("click",pregunta);});});
}
pintarGaceta();

/* ---------- Informe de cada tarjeta: misma estructura para todas ---------- */
function serieDe(t){
  var m={luz:[L.meses,1,3,"€/kWh"],
    recibo:[RC.serie,1,2,"€"],horasluz:[RC.serie.map(function(d,k){return [d[0],hLuz(d[1],k<2?D.smi.anterior:D.smi.valor)];}),1,1,"h"],
    gasolina:[C.serie,1,3,"€/l"],diesel:[C.serie,2,3,"€/l"],brent:[BR,1,2,"$"],seguro:[D.seguro_coche.serie,1,1,"%"],
    gastur:[GT.serie,1,2,"c€/kWh"],butano:[D.butano.serie,1,2,"€"],gasoleoc:[D.gasoleo_c.serie,1,3,"€/l"],
    alquiler:[D.alquiler.serie,1,1,"€/m²"],vivienda:[D.vivienda.serie,1,0,"€/m²"],euribor:[E,1,3,"%"],cuota:[E.map(function(d){return [d[0],cuota(150000,d[1]+0.8,20)];}),1,0,"€"],
    bce:[D.bce.serie,1,2,"%"],ipc:[I,1,1,"%"],smi:[smiS.filter(function(d){return +d[0]>=2016;}),1,0,"€"],salario:[D.salario_medio.ees_serie,1,0,"€/año"],
    paro:[D.paro.serie.map(function(d){return [d[0],d[1]/1e6];}),1,2,"M"],sello:[D.sello.serie,1,2,"€"]};
  return m[t.id]||null;}
function cardsDe(t){var x=[],c;
  switch(t.id){
    case "luz":x=[["lavadora",fmt(0.9*horas[iMin]*100,0)+" cts","Una lavadora a la hora más barata de hoy ("+iMin+"h)"],["luz",fmt(0.9*horas[iMax]*100,0)+" cts","La misma lavadora a la hora más cara ("+iMax+"h)"],["factura",eur(media*250,0),"Energía de 250 kWh al mes al precio de hoy (sin potencia ni impuestos)"],["calendario",(rank7===1?"El más caro":rank7===dias7.length?"El más barato":rank7+".º más caro"),"Hoy, entre los últimos "+dias7.length+" días"]];break;
    case "recibo":x=[["factura",eur(RC.valor*12,0),"Al año, si todos los meses fueran como octubre"],["monedero",eur(RC.valor-RC.hace_un_anio),"Más que en octubre de 2025"],["hucha",eur(RC.rebaja_iva.ahorro),"Lo que restaría la rebaja del IVA a este recibo"],["nomina",fmt(hLuz(RC.valor,D.smi.valor),1)+" h","De salario mínimo para pagarlo"]];break;
    case "horasluz":x=[["nomina",eur(D.smi.valor*14/12/173.3,2),"Salario mínimo por hora, bruto"],["factura",eur(RC.valor),"Recibo del usuario medio"],["reloj",fmt(hLuz(RC.valor,D.smi.valor)/8,1)+" jornadas","De 8 horas para pagar la luz"]];break;
    case "gasolina":case "diesel":var dz=t.id==="diesel",pv=dz?fl[2]:fl[1],p0=dz?C.hace_un_anio.diesel:C.hace_un_anio.gasolina,eu=dz?C.europa.diesel:C.europa.gasolina;
      x=[["surtidor",eur(pv*50,0),"Llenar 50 litros hoy ("+eur(p0*50,0)+" hace un año)"],["coche",eur(pv*0.06*12000,0),"Al año, 12.000 km con un consumo de 6 l/100 km"],["moneda",eur(eu,3),"Media de la UE ("+corto(C.europa.fecha)+"): España, "+fmt(Math.abs(pct(pv,eu)),0)+" % "+(pv<eu?"más barata":"más cara")],[dz?"surtidor":"diesel",fmt(Math.abs(fl[2]-fl[1])*100,0)+" cts","Diferencia entre diésel y gasolina por litro"]];break;
    case "brent":x=[["barril",fmt(maxBrent[1],0)+" $","Máximo del año ("+maxBrent[0]+")"],["barril",fmt(Math.min.apply(null,BR.map(function(d){return d[1];})),0)+" $","Mínimo de la serie"],["diesel",eur(fl[2],3),"Diésel en España esta semana"]];break;
    case "seguro":x=[["coche",fmt(D.seguro_coche.valor,1)+" %","Seguro del coche, en un año"],["pension",fmt(D.seguro_coche.salud,1)+" %","Seguro de salud ("+D.seguro_coche.salud_mes+")"],["monedero",fmt(ipc1,1)+" %","Inflación general"],["hucha",eur(500*D.seguro_coche.valor/100,0),"Más al año en una póliza de 500 €"]];break;
    case "gastur":x=[["llama",fmt(GT.tur1.variable,2)+" c€","TUR1 por kWh (solo agua caliente; fijo "+eur(GT.tur1.fijo)+"/mes)"],["radiador",fmt(GT.variable,2)+" c€","TUR2 por kWh (con calefacción; fijo "+eur(GT.fijo)+"/mes)"],["factura",eur(GT.recibo_mes.octubre),"Al mes, hogar de 9.000 kWh/año ("+eur(GT.recibo_mes.julio)+" en verano)"],["calendario",diaMes(GT.proxima),"Próxima revisión"]];break;
    case "butano":x=[["butano",eur(D.butano.tope),"Tope fijado hasta junio de 2027"],["butano",eur(D.butano.tope-D.butano.valor),"Lo que le queda para el tope"],["calendario",eur(D.butano.valor*5,0),"Cinco bombonas en un invierno"]];break;
    case "gasoleoc":x=[["radiador",eur(D.gasoleo_c.valor*1000,0),"Depósito de 1.000 litros hoy"],["radiador",eur(D.gasoleo_c.junio*1000,0),"El mismo depósito en junio"]];break;
    case "aceite":x=[["aceite",eur(D.aceite.valor),"Litro de marca blanca más barato"],["aceite",eur(D.aceite.valor*5),"Garrafa de 5 litros"]];break;
    case "alquiler":x=[["llave",eur(D.alquiler.valor*70,0),"Piso de 70 m² al mes"],["nomina",fmt(D.alquiler.valor*70/sueldoMes*100,0)+" %","Del salario mínimo"],["maletin",fmt(D.alquiler.valor*70/D.salario_medio.valor*100,0)+" %","Del salario medio"]];break;
    case "vivienda":x=[["casa",eur(D.vivienda.valor*80,0),"Piso de 80 m²"],["nomina",fmt(D.vivienda.valor*80/(D.smi.valor*14),1)+" años","De salario mínimo íntegro"],["maletin",fmt(D.vivienda.valor*80/D.salario_medio.ees_anual,1)+" años","De salario medio íntegro"]];break;
    case "euribor":case "cuota":var hi=D.euribor.historico;x=[["hipoteca",fmt(hi.max,2)+" %","Máximo histórico ("+hi.max_fecha+")"],["hipoteca",fmt(hi.min,2)+" %","Mínimo ("+hi.min_fecha+")"],["casa",eur(cuota(100000,eu1+0.8,20),0),"Cuota de 100.000 € a 20 años"],["casa",eur(cuota(200000,eu1+0.8,25),0),"Cuota de 200.000 € a 25 años"]];break;
    case "bce":x=[["banco",fmt(D.bce.valor,2)+" %","Tipo de depósito del BCE"],["calendario",diaMes(D.bce.proxima),"Próxima reunión"],["hipoteca",fmt(eu1,3)+" %","Euríbor, que suele ir por delante"]];break;
    case "hipotecas":case "depositos":var dp=D.depositos;x=[["hucha",fmt(dp.valor,2)+" %","Depósito a un año"],["moneda",fmt(dp.vista,2)+" %","Cuenta corriente"],["casa",fmt(dp.hipoteca,2)+" %","Hipoteca nueva"],["monedero",fmt(dp.consumo,2)+" %","Crédito al consumo"]];break;
    case "ipc":x=[["monedero",eur(100+ipc1),"Lo que hoy cuesta lo que hace un año eran 100 €"],["cesta",fmt(I[I.length-1][2],1)+" %","Inflación subyacente (sin energía ni frescos)"],["calendario",fmt(D.ipc.hace_un_anio,1)+" %","Hace un año"]];break;
    case "smi":x=[["nomina",eur(D.smi.valor*14,0),"Al año, en 14 pagas"],["reloj",eur(D.smi.valor*14/12/173.3,2),"Por hora (40 horas a la semana)"],["maletin",fmt(D.smi.valor*14/D.salario_medio.ees_anual*100,0)+" %","Del salario medio"]];break;
    case "pension":x=[["pension",eur(D.pension.valor*14,0),"Al año, en 14 pagas"],["pension",eur(D.pension.media_sistema,0),"Media de todas las pensiones"],["calendario","2,7 %","Revalorización de 2026"]];break;
    case "salario":var sm=D.salario_medio;x=[["maletin",eur(sm.ees_anual,0),"Salario medio anual ("+sm.ees_anio+")"],["maletin",eur(sm.ees_mediana,0),"Salario mediano: la mitad cobra menos"],["nomina",eur(D.smi.valor*14,0),"Salario mínimo anual 2026"]];break;
    case "paro":x=[["maletin",fmt(D.paro.valor,0),"Parados registrados"],["nomina",D.paro.afiliados_txt,"Afiliados a la Seguridad Social"]];break;
    case "sello":x=[["sello","0,42 €","En 2015"],["sello",eur(D.sello.valor),"Hoy"]];break;
  }
  return x;}
/* Leyenda de los gráficos de las ventanas: qué es cada color */
function leyendaDe(ley,ser){var it=ley||(ser?ser.map(function(x){return [x.color,x.name];}):[]);return it.map(function(x){return '<span><i style="background:'+x[0]+'"></i>'+x[1]+'</span>';}).join("")+(it.length?'<span class="ley-nota">El punto grande es el último dato</span>':'');}
/* Gráficos a largo plazo, cuando hay datos */
function largoDe(t){
  var CA=D.carrera;
  if(t.id==="ipc")return {sub:"media de cada año",ley:[[css("--sube"),"Inflación media del año"],[css("--albero"),"2026: último dato (octubre)"]],dibuja:function(b){var d=CA.ipc_medio.map(function(r){return [String(r[0]),r[1]];}).concat([["2026",ipc1]]);barras(b,d,{aria:"Inflación media anual",h:220,dec:0,color:function(x,k){return k===d.length-1?css("--albero"):css("--sube");},tipFmt:function(v){return fmt(v,1)+" %";}});}};
  if(t.id==="euribor"||t.id==="cuota")return {sub:"euríbor de cada diciembre",ley:[[css("--anil"),"Euríbor de diciembre"],[css("--albero"),"Último dato"]],dibuja:function(b){var d=D.euribor.diciembres.concat([[String(new Date().getFullYear())+" (" +E[E.length-1][0]+")",eu1]]);barras(b,d,{aria:"Euríbor a largo plazo",h:220,dec:1,color:function(x,k){return k===d.length-1?css("--albero"):css("--anil");},tipFmt:function(v){return fmt(v,3)+" %";}});}};
  if(t.id==="paro")return {sub:"parados cada mes de octubre",ley:[[css("--anil"),"Parados en octubre"]],dibuja:function(b){barras(b,D.paro.octubres.map(function(r){return [r[0],r[1]/1e6];}),{aria:"Paro en octubre",h:220,dec:1,color:function(){return css("--anil");},tipFmt:function(v){return fmt(v,2)+" millones";}});}};
  if(t.id==="pension"||t.id==="smi"||t.id==="salario")return {sub:"2018 = 100, frente a los precios",ley:null,dibuja:function(b){var ser=[{k:1,color:css("--sube"),name:"Precios (IPC)",ancho:3.5},{k:t.id==="pension"?2:t.id==="smi"?3:4,color:css("--anil"),name:t.id==="pension"?"Pensión":t.id==="smi"?"Salario mínimo":"Salario medio"}];lineas(b,datosCarrera,ser,{aria:"Frente a los precios desde 2018",h:240,dec:0,lastFmt:function(v){return fmt(v,0);},tipFmt:function(v){return fmt(v,1);}});}};
  return null;}
function abrirTile(t){
  var fr=FRECUENTES.indexOf(t.blk)>=0,se=serieDe(t),stats="",gauge="";
  if(se){var vals=se[0].map(function(d){return [d[0],d[se[1]]];}).filter(function(d){return d[1]!==null&&d[1]!==undefined;});
    if(vals.length>2){var mx=vals.reduce(function(a,b){return b[1]>a[1]?b:a;}),mn=vals.reduce(function(a,b){return b[1]<a[1]?b:a;}),me=vals.reduce(function(a,b){return a+b[1];},0)/vals.length,cur=vals[vals.length-1][1];
      var pos=(cur-mn[1])/((mx[1]-mn[1])||1)*100;
      stats='<div class="pop-stats"><div><span>Máximo</span><b>'+fmt(mx[1],se[2])+'</b><small>'+mx[0]+'</small></div><div><span>Mínimo</span><b>'+fmt(mn[1],se[2])+'</b><small>'+mn[0]+'</small></div><div><span>Media</span><b>'+fmt(me,se[2])+'</b><small>del periodo</small></div></div>'+
        '<div class="gauge'+(t.bueno?' bueno':'')+'"><div class="g-barra"><i style="left:'+pos.toFixed(1)+'%"></i></div><div class="g-lab"><span>'+fmt(mn[1],se[2])+'</span><b>Ahora: '+fmt(cur,se[2])+' '+se[3]+'</b><span>'+fmt(mx[1],se[2])+'</span></div></div>';}}
  function cmpCard(c,lab){if(c.p===null||c.p===undefined)return '<div class="pc-cmp"><span class="k">'+lab+'</span><b class="sin">sin dato</b></div>';return '<div class="pc-cmp"><span class="k">'+lab+'</span>'+pctTag(c,t.bueno).replace('class="pct','class="pct grande')+'<span class="r">'+c.k+(c.ref?': <b>'+c.ref+'</b>':'')+'</span></div>';}
  var bol=[];[["ant",t.ant],["anio",t.anio]].forEach(function(m){var c=m[1];if(c.p===null||c.p===undefined)return;if(m[0]==="anio"&&t.ant.k===t.anio.k)return;var e=expl(t,c,m[0]);if(e)bol.push(e);});
  var cards=cardsDe(t);
  abrir('<div class="pop"><header class="pop-cab"><div class="pop-ico">'+ico(t.ico)+'</div><div><h2 id="vTitulo">'+t.t+' '+badge(t.act,fr)+'</h2><p class="pop-sub">'+t.n+'</p></div></header>'+
    '<div class="pop-hero"><div class="ph-valor"><span class="big">'+t.v+'</span><small>'+t.u+'</small><div class="ph-fecha">'+cuandoDato(t.f)+' ('+corto(t.f)+') · '+proximo(t.blk)+'</div></div>'+cmpCard(t.ant,"Frente al dato anterior")+cmpCard(t.anio,t.anio.k==="IPC general"?"Frente a la inflación":"Frente a hace un año")+'</div>'+
    '<section class="pop-que"><h3>¿Qué es?</h3><p>'+t.info+'</p></section>'+
    (bol.length?'<section class="pop-bolsillo"><h3><svg class="ico" aria-hidden="true"><use href="#mini"/></svg>En tu bolsillo, dice Remedios</h3><ul>'+bol.map(function(b){return '<li>'+b+'</li>';}).join("")+'</ul></section>':'')+
    '<section class="pop-graf"><h3>Evolución</h3><div class="chart" id="vChart"></div><div class="leyenda" id="vLey"></div>'+(t.nota?'<p class="sub" style="margin:6px 0 0">'+t.nota+'</p>':"")+stats+gauge+'</section>'+
    (cards.length?'<section><h3>Cifras para entenderlo</h3><div class="pop-cards">'+cards.map(function(c){return '<div class="pc-card">'+ico(c[0])+'<div><b>'+c[1]+'</b><span>'+c[2]+'</span></div></div>';}).join("")+'</div></section>':'')+
    (largoDe(t)?'<section class="pop-graf"><h3>A largo plazo <small>'+largoDe(t).sub+'</small></h3><div class="chart" id="vChart2"></div><div class="leyenda" id="vLey2"></div></section>':'')+
    '<footer class="pop-pie">Fuente: <a href="'+t.fuente.url+'">'+t.fuente.nombre+'</a> · <a href="#'+t.sec+'" data-ir="'+t.sec+'" data-cierra="1">Ir a la sección</a></footer></div>',function(){
      t.graf($("vChart"));$("vLey").innerHTML=leyendaDe(t.ley,_serUlt);
      var lg=largoDe(t);if(lg){lg.dibuja($("vChart2"));$("vLey2").innerHTML=leyendaDe(lg.ley,_serUlt);}});
}

/* ---------- Las facturas de la casa (INE): aparece cuando la actualización automática trae los datos ---------- */
(function(){var S=D.servicios;if(!S||!S.items||!S.items.length)return;$("facturasBox").hidden=false;
  $("facturasSub").textContent="Lo que han subido en un año el agua, la basura, el teléfono, el transporte público y los seguros, según el IPC del INE ("+corto(S.fecha)+").";
  var mx=Math.max.apply(null,S.items.map(function(r){return Math.abs(r[2]);}))||1;
  $("facturas").innerHTML=S.items.slice().sort(function(a,b){return b[2]-a[2];}).map(function(r){return filaC([r[0],r[1],r[2]],mx);}).join("")+'<p class="sub" style="margin:8px 0 0">Variación anual de cada precio. La inflación general es del '+fmt(ipc1,1)+' %: lo que está por encima sube más que la media.</p>';})();

/* ---------- Conoce a Remedios ---------- */
$("coFig").innerHTML=Remedios.figura({edad:81,anio:2026,actividad:"abanico"});
$("coVida").innerHTML=[[1976,"Con 31 años, el periódico a 10 pesetas"],[1990,"Escribía cartas con sellos de 15 pesetas"],[2006,"La gasolina pasó del euro"],[2026,"Hoy, con su libreta y su web"]].map(function(x){return '<a href="#antes-y-ahora" data-anio="'+x[0]+'">'+Remedios.figura({edad:81-(2026-x[0]),anio:x[0],actividad:"abanico"})+'<b>'+x[0]+'</b><span>'+x[1]+'</span></a>';}).join("");
$("coVida").addEventListener("click",function(e){var a=e.target.closest("a[data-anio]");if(!a)return;var y=+a.getAttribute("data-anio");if(y<2026){try{pintarAntes(y);}catch(err){}}});
$("coFrases").innerHTML=["Lo barato sale caro, menos las patatas este mes.","La lavadora, a la hora barata. Te lo digo todos los días y todos los días se te olvida.","Un grado menos en el termostato y una rebeca: así se pasa el invierno.","Con veinte duros iba yo al cine y a merendar.","Si el horno está caliente, se hacen dos cosas. Una no.","Apunta, que luego no te acuerdas."].map(function(f){return '<div>«'+rem(f)+'»</div>';}).join("");

/* ---------- Pregúntale a Remedios: chat sin conexión (no llama a ningún servicio; responde con los datos de la web) ---------- */
var chat=$("chat"),chatLog=$("chatLog");
function decir(html,quien){var d=document.createElement("div");d.className=quien==="u"?"msg-u":"msg-r";d.innerHTML=html;chatLog.appendChild(d);chatLog.scrollTop=chatLog.scrollHeight;}
function norm(t){return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[¿?¡!.,;:()"«»]/g," ").replace(/\s+/g," ").trim();}
function numeros(n){var out=[];(n.match(/\d[\d.]*(,\d+)?/g)||[]).forEach(function(x){var v=parseFloat(x.replace(/\./g,"").replace(",","."));if(!isNaN(v))out.push(v);});return out;}
function tiene(n,lista){return lista.some(function(w){return n.indexOf(w)>=0;});}
function azar(a){return a[Math.floor(Math.random()*a.length)];}
var ctx={tema:null};
function ir(sec,txt){return ' <a href="#'+sec+'" data-ir="'+sec+'">'+(txt||"Verlo en la web")+'</a>';}
/* Glosario */
var GLOS=[
  [["pvpc","tarifa regulada de la luz","precio voluntario"],"El PVPC es la tarifa regulada de la luz: el precio cambia cada hora según el mercado. La tienen unos ocho millones de hogares. Si tu contrato dice «mercado libre», no es la tuya."],
  [["euribor"],"El euríbor es el interés al que se prestan dinero los bancos europeos. Tu hipoteca variable se calcula con él más un diferencial. Ahora está en el "+B(fmt(eu1,3)+" %")+"."],
  [["diferencial"],"El diferencial es lo que el banco suma al euríbor en tu hipoteca. Si tienes euríbor + 0,8 y el euríbor está en el "+fmt(eu1,2)+" %, pagas un "+fmt(eu1+0.8,2)+" %."],
  [["subyacente"],"La inflación subyacente es la de siempre pero sin la energía ni los alimentos frescos, que son los que más se mueven. Ahora está en el "+B(fmt(I[I.length-1][2],1)+" %")+"."],
  [["ipca"],"El IPCA es el IPC «armonizado»: el que se calcula igual en toda Europa para poder comparar países."],
  [["ipc","inflacion"],"El IPC mide cuánto suben los precios en un año. Ahora está en el "+sube(fmt(ipc1,1)+" %")+": lo que costaba 100 €, hoy cuesta "+B(eur(100+ipc1))+"."],
  [["tur"],"La TUR es la tarifa regulada del gas. La TUR1 es para casas sin calefacción de gas y la TUR2 para las que la tienen. El Gobierno la revisa cada tres meses."],
  [["omie","mayorista"],"El OMIE es el mercado mayorista: donde las eléctricas compran la luz. Hoy, a "+B(fmt(om1,0)+" €/MWh")+". A casa llega con peajes, cargos e impuestos."],
  [["brent","barril"],"El Brent es el petróleo de referencia en Europa. Lo que hace el barril llega a la gasolinera unas semanas después."],
  [["smi","salario minimo interprofesional"],"El SMI es el salario mínimo: lo menos que se puede cobrar a jornada completa. En 2026, "+B(eur(D.smi.valor,0))+" al mes en 14 pagas."],
  [["tae"],"La TAE es el interés real de un producto contando todos los gastos y cada cuánto se pagan los intereses. Sirve para comparar depósitos o préstamos entre sí."],
  [["bce","banco central"],"El BCE es el Banco Central Europeo. Sube o baja los tipos de interés, y detrás van el euríbor y las hipotecas. Ahora los tiene en el "+B(fmt(D.bce.valor,2)+" %")+"."],
  [["peaje","cargos"],"Los peajes y cargos son la parte del recibo de la luz que paga las redes y otros costes del sistema. Los fija el Gobierno y la CNMC, no el mercado."]
];
/* Temas: palabras clave y respuesta. f(n,nums) devuelve html */
var TEMAS=[
 {id:"lavadora",k:["lavadora","lavavajillas","secadora","poner la","horno","plancha","enchuf","hora barata","hora mas barata","hora cara","que hora"],f:function(n,x){
   var hh=x.filter(function(v){return v>=0&&v<=24;})[0];
   if(hh!==undefined&&tiene(n,["a las","las "])){hh=Math.floor(hh)%24;return "Una lavadora a las "+h(hh)+" te sale por "+B(fmt(0.9*horas[hh]*100,0)+" céntimos")+" (el kWh, a "+fmt(horas[hh],3)+" €). "+(hh===iMin?"¡Es la mejor hora del día!":"Si la pones a las "+h(iMin)+", "+baja(fmt(0.9*horas[iMin]*100,0)+" céntimos")+".");}
   return "La hora más barata de hoy es a las "+h(iMin)+" ("+baja(fmt(horas[iMin]*100,1)+" céntimos")+" el kWh) y la más cara, a las "+h(iMax)+" ("+sube(fmt(horas[iMax]*100,1)+" céntimos")+"). El mejor tramo de tres horas es de "+h(barato[0])+" a "+h(barato[0]+3)+"."+ir("luz","Ver la luz hora a hora");}},
 {id:"luz",k:["luz","electric","kwh","recibo","factura","pvpc","bombilla"],f:function(n,x){
   var kwh=x.filter(function(v){return v>20&&v<5000;})[0];
   if(kwh&&tiene(n,["kwh","consumo","gasto"]))return "Con "+fmt(kwh,0)+" kWh al mes, la energía al precio de hoy sale por unos "+B(eur(kwh*media,0))+" (sin potencia ni impuestos). Hace un año habrían sido "+eur(kwh*L.media_hace_un_anio,0)+".";
   if(tiene(n,["ano","hace un"]))return "La luz está un "+signo(pct(media,L.media_hace_un_anio),0)+" más cara que en noviembre de 2025. Y el recibo de un hogar normal, "+signo(pct(RC.valor,RC.hace_un_anio),0)+": "+eur(RC.valor)+" frente a "+eur(RC.hace_un_anio)+".";
   return "La luz de hoy está de media a "+B(fmt(media,3)+" €")+" el kWh, "+signo(pct(media,L.media_ayer))+" frente a ayer. El recibo de un hogar normal fue de "+B(eur(RC.valor))+" en octubre."+ir("luz");}},
 {id:"gasolina",k:["gasolin","diesel","gasoil","gasoleo a","litro","llenar","deposito del coche","repost","surtidor","coche","furgoneta"],f:function(n,x){
   var lit=x.filter(function(v){return v>=5&&v<=150;})[0],dz=tiene(n,["diesel","gasoil","gasoleo"]),p=dz?fl[2]:fl[1];
   if(lit)return "Llenar "+fmt(lit,0)+" litros de "+(dz?"diésel":"gasolina")+" cuesta hoy "+B(eur(lit*p))+". Hace un año, "+eur(lit*(dz?C.hace_un_anio.diesel:C.hace_un_anio.gasolina))+".";
   if(tiene(n,["hace un ano","ano pasado"]))return "Hace un año la gasolina estaba a "+eur(C.hace_un_anio.gasolina,2)+" y el diésel a "+eur(C.hace_un_anio.diesel,2)+": ahora "+signo(pct(fl[1],C.hace_un_anio.gasolina),0)+" y "+signo(pct(fl[2],C.hace_un_anio.diesel),0)+".";
   if(tiene(n,["europa","francia","portugal","fuera"]))return "En la UE la media es de "+eur(C.europa.diesel,3)+" el diésel y "+eur(C.europa.gasolina,3)+" la gasolina. Aquí estamos más baratos: "+eur(fl[2],3)+" y "+eur(fl[1],3)+".";
   return "La gasolina 95 está a "+B(fmt(fl[1],3)+" €")+" ("+signo(pct(fl[1],flp[1]))+" en una semana) y el diésel a "+B(fmt(fl[2],3)+" €")+" ("+signo(pct(fl[2],flp[2]))+"). Llenar 50 litros de diésel: "+B(eur(fl[2]*50,0))+"."+ir("gasolinera");}},
 {id:"brent",k:["petroleo","brent","barril","crudo"],f:function(){return "El barril de Brent está a "+B(fmt(bl,2)+" $")+", "+signo(pct(bl,bp))+" en una semana. El máximo del año fue de "+fmt(maxBrent[1],0)+" $ ("+maxBrent[0]+").";}},
 {id:"butano",k:["butano","bombona"],f:function(n,x){var b=x.filter(function(v){return v>=1&&v<=20;})[0];return (b?fmt(b,0)+" bombonas son "+B(eur(b*D.butano.valor))+". ":"")+"La bombona de 12,5 kg cuesta "+B(eur(D.butano.valor))+" y no puede pasar de "+B(eur(D.butano.tope))+" hasta junio de 2027. "+proximo("butano");}},
 {id:"gas",k:["gas natural"," gas","calefaccion","caldera","radiador","gasoleo c","gasoleo de calefaccion","frio","invierno"],f:function(){return "El gas regulado (TUR2) está a "+B(fmt(GT.variable,2)+" céntimos")+" el kWh, "+signo(pct(GT.variable,GT.variable_julio))+" desde julio: una casa con calefacción de gas paga unos "+eur(GT.recibo_mes.octubre)+" al mes. El gasóleo de calefacción, a "+B(fmt(D.gasoleo_c.valor,3)+" €")+" el litro. Un grado menos en el termostato ahorra en torno a un 7 %."+ir("calefaccion");}},
 {id:"hipoteca",k:["euribor","hipoteca","cuota","prestamo","banco","bce","tipos de interes"],f:function(n,x){
   var cap=x.filter(function(v){return v>=10000;})[0],an=x.filter(function(v){return v>=5&&v<=40;})[0]||25;
   if(cap){var q=cuota(cap,eu1+0.8,an),q0=cuota(cap,eu0+0.8,an);return "Para "+eur(cap,0)+" a "+fmt(an,0)+" años con euríbor + 0,8: "+B(eur(q,0)+" al mes")+". Con el euríbor de hace un año eran "+eur(q0,0)+": "+sube("+"+eur(q-q0,0))+" al mes, "+eur((q-q0)*12,0)+" al año.";}
   return "El euríbor está en el "+B(fmt(eu1,3)+" %")+" (hace un año, "+fmt(eu0,2)+" %). Una hipoteca de 150.000 € a 20 años paga unos "+B(eur(c1,0))+" al mes, "+sube("+"+eur(c1-c0,0))+" más que hace un año. El BCE tiene los tipos en el "+fmt(D.bce.valor,2)+" % y se reúne el "+diaMes(D.bce.proxima)+". Dime la cantidad y los años y te hago la cuenta."+ir("vivienda");}},
 {id:"ahorro",k:["ahorr","plazo fijo","deposito","me dan por","intereses","hucha","cuenta corriente"],f:function(n,x){var cap=x.filter(function(v){return v>=100;})[0]||10000,g=cap*D.depositos.valor/100,pe=cap*ipc1/100;return "Un depósito a un año paga de media un "+B(fmt(D.depositos.valor,2)+" %")+" (zona del euro). "+eur(cap,0)+" te darían unos "+B(eur(g,0))+" al año, pero con los precios subiendo un "+fmt(ipc1,1)+" % pierden "+eur(pe-g,0)+" de valor. La cuenta corriente paga un "+fmt(D.depositos.vista,2)+" %.";}},
 {id:"alquiler",k:["alquil","piso","vivienda","casa","metros","m2","comprar casa"],f:function(n,x){var m=x.filter(function(v){return v>=20&&v<=400;})[0]||70;
   if(tiene(n,["compr","venta","precio de la vivienda"]))return "Comprar "+fmt(m,0)+" m² de vivienda usada cuesta unos "+B(eur(D.vivienda.valor*m,0))+" ("+fmt(D.vivienda.valor,0)+" € el metro, "+signo(D.vivienda.interanual,1)+" en un año). Son "+fmt(D.vivienda.valor*m/D.salario_medio.ees_anual,1)+" años de salario medio.";
   return "Alquilar "+fmt(m,0)+" m² sale por unos "+B(eur(D.alquiler.valor*m,0))+" al mes ("+fmt(D.alquiler.valor,1)+" € el metro, "+signo(D.alquiler.interanual,1)+" en un año). Con el salario mínimo se iría el "+fmt(D.alquiler.valor*m/sueldoMes*100,0)+" % del sueldo."+ir("vivienda");}},
 {id:"ipc",k:["ipc","inflacion","precios","carestia","todo sube","cuesta la vida","como esta la vida"],f:function(){return "La inflación está en el "+sube(fmt(ipc1,1)+" %")+" y la subyacente en el "+fmt(I[I.length-1][2],1)+" %. Lo que hace un año costaba 100 €, hoy cuesta "+B(eur(100+ipc1))+". Desde 2018, los precios han subido un "+fmt(ipcIdx[ipcIdx.length-1]-100,1)+" %."+ir("ipc");}},
 {id:"pension",k:["pension","jubila","pensionista"],f:function(){return "La pensión media de jubilación es de "+B(eur(D.pension.valor,0))+" al mes, "+signo(pct(D.pension.valor,D.pension.hace_un_anio),1,true)+" en un año; los precios, "+sube(fmt(ipc1,1)+" %")+". Si desde 2018 hubiera subido como los precios, hoy sería de unos "+eur(D.pension.valor*ipcIdx[ipcIdx.length-1]/penIdx[penIdx.length-1],0)+".";}},
 {id:"smi",k:["salario minimo","smi","sueldo minimo"],f:function(){return "El salario mínimo es de "+B(eur(D.smi.valor,0))+" al mes en 14 pagas: "+eur(D.smi.valor*14,0)+" al año, unos "+eur(D.smi.valor*14/12/173.3,2)+" la hora. Ha subido un "+fmt(pct(D.smi.valor,D.smi.anterior),1)+" % en 2026.";}},
 {id:"salario",k:["salario","sueldo","nomina","cobra","gana la gente"],f:function(){return "El salario medio ronda los "+B(eur(D.salario_medio.valor,0))+" brutos al mes ("+signo(D.salario_medio.interanual,1,true)+" en un año). Al año, "+eur(D.salario_medio.ees_anual,0)+"; pero la mitad de la gente cobra menos de "+eur(D.salario_medio.ees_mediana,0)+".";}},
 {id:"paro",k:["paro","parados","empleo","trabajo","desempleo","afiliad"],f:function(){return "Hay "+B(fmt(D.paro.valor,0))+" parados registrados: "+signo(pct(D.paro.valor,D.paro.anterior))+" frente a septiembre y "+signo(pct(D.paro.valor,D.paro.hace_un_anio))+" en un año. La afiliación está en "+D.paro.afiliados_txt+".";}},
 {id:"facturas",k:["agua","basura","telefono","movil","internet","fibra","autobus","metro","tren","transporte publico","abono"],f:function(n){var S=D.servicios;if(!S||!S.items||!S.items.length)return "Eso todavía no lo tengo apuntado, "+G.hija+": me lo traerá el INE en cuanto la web esté en su casa nueva.";var it=S.items.filter(function(r){return n.indexOf(norm(r[1]).split(" ")[0].slice(0,5))>=0||n.indexOf(r[0])>=0;})[0];var l=it?[it]:S.items;return l.map(function(r){return r[1]+": "+signo(r[2])+" en un año";}).join("; ")+". La inflación general, "+fmt(ipc1,1)+" %.";}},
 {id:"seguro",k:["seguro"],f:function(){return "El seguro del coche sube un "+B(fmt(D.seguro_coche.valor,1)+" %")+" en un año y el de salud un "+B(fmt(D.seguro_coche.salud,1)+" %")+". Antes de renovar, compara: cambiar de compañía suele salir más barato.";}},
 {id:"sello",k:["sello","carta","correos"],f:function(){return "Un sello para una carta nacional cuesta "+B(eur(D.sello.valor))+". En 2015 costaba 0,42 €, y en 1990, 15 pesetas.";}},
 {id:"cocina",k:["cocin","receta","comer","comida","cena","almuerzo","que hago de","menu","plato","como se hace"],f:function(n){
   var rc=P.recetas.filter(function(r){return n.indexOf(norm(r.n).split(" ")[0].slice(0,6))>=0&&norm(r.n).split(" ")[0].length>3;})[0];
   if(rc)return B(rc.n)+": lleva "+rc.ing.map(function(i){return (precioIng[i]?precioIng[i].n:i).toLowerCase();}).join(", ")+". "+rem(rc.t);
   if(tiene(n,["como se hace","receta de"]))return "Esa receta no la tengo en la libreta, "+G.hija+". Las mías son "+P.recetas.slice(0,8).map(function(r){return r.n.toLowerCase();}).join(", ")+"… ¡y más!";
   var ing=Object.keys(precioIng).filter(function(i){return n.indexOf(norm(precioIng[i].n).split(" ")[0].slice(0,5))>=0;})[0];
   if(ing){var rs=P.recetas.filter(function(r){return r.ing.indexOf(ing)>=0;});if(rs.length)return "Con "+precioIng[ing].n.toLowerCase()+" ("+signo(precioIng[ing].p)+" "+precioIng[ing].cuando+") yo haría "+rs.slice(0,3).map(function(r){return B(r.n.toLowerCase());}).join(", ")+". "+rem(rs[0].t);}
   return (consejoCocina||"Este mes no hay grandes rebajas.")+(recetasMes[0]?" "+rem(recetasMes[0].r.t):"")+(recetasMes[2]?" Otra idea: "+B(recetasMes[2].r.n.toLowerCase())+".":"")+ir("cesta","Ver las recetas");}},
 {id:"alimento",k:[],f:null},
 {id:"subebaja",k:["que ha subido","que sube","mas caro","lo que mas sube","que ha bajado","que baja","mas barato","lo que mas baja"],f:function(n){var baja0=tiene(n,["baja","barato"]);var l=cand.slice().sort(function(a,b){return baja0?a.p-b.p:b.p-a.p;}).slice(0,4);return "Lo que más ha "+(baja0?"bajado":"subido")+" en un año: "+l.map(function(x){return x.n+" ("+signo(x.p,1)+")";}).join(", ")+".";}},
 {id:"antes",k:["costaba","valia","antes","pesetas","en 19","en 20","hace anos","antiguamente"],f:function(n,x){
   var pt=x.filter(function(v){return v>=1&&v<1000000;}),y=x.filter(function(v){return v>=1970&&v<=2025;})[0];
   if(tiene(n,["pesetas"])&&pt.length&&!y)return fmt(pt[0],0)+" pesetas son "+B(eur(pt[0]/166.386))+".";
   var it=HI.items.filter(function(i){return n.indexOf(norm(i.nombre).split(" ").pop().slice(0,5))>=0||n.indexOf(norm(i.nombre).split(" ")[0].slice(0,5))>=0;})[0];
   if(it){var p=y?cercano(it.puntos,y,6):it.puntos[0];if(p){var e0=p.pta!==undefined?p.pta/166.386:p.v;return it.nombre+" en "+p.anio+": "+(p.pta!==undefined?fmt(p.pta,0)+" pesetas ("+eur(e0)+")":eur(e0))+". Hoy, "+B(eur(it.hoy.v))+": se ha multiplicado por "+fmt(it.hoy.v/e0,1)+". "+rem(P.antes[it.id]||"");}}
   return "Pregúntame por el pan, el café, el periódico, la leche, los huevos, la gasolina, el metro, el cine, el menú del día, la bombona o el salario mínimo de un año, por ejemplo «¿cuánto costaba el pan en 1986?»."+ir("antes-y-ahora","Ver «Antes y ahora»");}},
 {id:"fiesta",k:["fiesta","festivo","puente","santo","que dia es","hoy es","santoral"],f:function(){return (fiestaHoy.length?fiestaHoy.map(function(f){return "Hoy es fiesta "+(f.ambito==="nacional"?"en toda España":"en "+f.donde)+": "+f.nombre+". "+rem(f.msg);}).join(" "):"Hoy no es fiesta en ningún sitio que yo tenga apuntado. ")+(santoHoy?" Es "+santoHoy+".":"")+(efemHoy[0]?" Y tal día como hoy, en "+efemHoy[0][0]+": "+efemHoy[0][1]:"");}},
 {id:"agenda",k:["agenda","cuando","proximo","que viene","novedad","nuevo"],f:function(){var t=novs.length?"Lo último que ha llegado: "+novs.slice(0,3).map(function(x){return x.cesta?"la cesta de la compra":x.t.t.toLowerCase();}).join(", ")+". ":"";return t+(proxima?"En la libreta tengo apuntado: "+B(proxima.titulo)+". "+proxima.texto:"");}},
 {id:"refran",k:["refran","dicho"],f:function(){var r=azar(P.refranes);return "«"+r[0]+"» "+rem(r[1]);}},
 {id:"consejo",k:["consejo","truco","ahorrar","como ahorro","ahorro en casa"],f:function(){var r=azar(P.consejos);return r[0]+" "+rem(r[1]);}},
 {id:"hora",k:["que hora es","la hora","hora es"],f:function(){var x=horaTxt();return "Son las "+B(x[0]+":"+x[1])+". Ahora mismo el kWh está a "+fmt(horas[x[0]%24],3)+" €.";}},
 {id:"quien",k:["quien eres","como te llamas","cuantos anos","tu edad","nieto","tu marido","de donde eres","donde vives","que te gusta","remedios"],f:function(n){
   if(tiene(n,["nieto"]))return "Tengo cuatro nietos, y "+G.suNieto+" comparte piso con tres "+G.comp+" porque el alquiler está imposible.";
   if(tiene(n,["marido"]))return "Mi Paco me dejó hace años. Él era el de los números; desde entonces la libreta la llevo yo.";
   if(tiene(n,["donde"]))return "Nací en 1945 en un pueblo de Castilla y vivo en un tercero sin ascensor. Por eso sé lo que pesa una bombona.";
   if(tiene(n,["gusta"]))return "Me gusta salir al fresco con las vecinas, hacer punto, regar los geranios y leer el periódico. Y que baje la luz, claro.";
   return "Soy Remedios, tengo 81 años y llevo toda la vida apuntando precios en la libreta de la cocina. ¿Qué quieres saber, "+G.hija+"?"+ir("remedios","Conóceme");}},
 {id:"fuentes",k:["fuente","de donde sacas","fiable","actualiz","datos"],f:function(){return "Mis datos salen de Red Eléctrica, el INE, el Ministerio, el Banco de España, el BCE, FACUA e idealista. Se actualizan cada mañana; esta vez, el "+genTxt+". Cada cifra de la web lleva su fuente.";}},
 {id:"saludo",k:["hola","buenas","buenos dias","buenas tardes","buenas noches","que tal","como estas"],f:function(){var x=horaTxt()[0];return azar(["¡Hola, "+G.hija+"! ","¡"+(x<14?"Buenos días":x<21?"Buenas tardes":"Buenas noches")+", "+G.hija+"! "])+azar(["Aquí estoy, abanicándome. ","Pues mira, con la luz "+(pct(media,L.media_ayer)>0?"subiendo":"bajando")+", ya ves. "])+"¿Qué quieres saber?";}},
 {id:"gracias",k:["gracias","muchas gracias","eres un sol","te quiero"],f:function(){return azar(["¡De nada, "+G.hija+"! Y apaga la luz al salir.","Para eso estoy. Y abrígate, que refresca.","¡Ay, qué rica! Vuelve cuando quieras."]);}},
 {id:"adios",k:["adios","hasta luego","me voy","chao","nos vemos"],f:function(){return "¡Hasta luego, "+G.hija+"! Mañana te cuento cómo amanece la luz.";}},
 {id:"tiempo",k:["tiempo","llover","lluvia","calor","temperatura"],f:function(){return "Del tiempo no sé, "+G.hija+": asómate a la ventana. Lo que sí te digo es que con frío la calefacción tira, y el gas está un "+fmt(pct(GT.variable,GT.variable_julio),0)+" % más caro que en verano.";}}
];
/* Busca un alimento de la cesta o del mercado en la pregunta */
function alimentoEn(n){var todos=cestaAnio.concat(cestaMes);for(var i=0;i<todos.length;i++){var pal=norm(todos[i][1]).replace(/^carne de /,"").split(" ");if(pal.some(function(w){return w.length>3&&n.indexOf(w.slice(0,Math.min(6,w.length-1)))>=0;}))return todos[i][0];}return null;}
function respAlimento(id){var a=cestaAnio.filter(function(r){return r[0]===id;})[0],m=cestaMes.filter(function(r){return r[0]===id;})[0],c=P.comida[id]||{},r=a||m;
  var t=r[1]+": "+(m?signo(m[2])+" este mes":"")+(m&&a?" y ":"")+(a?signo(a[2])+" en un año":"")+(r[3]==="INE"?" (IPC del INE)":" (súper, FACUA)")+". "+rem((a||m)[2]>0?c.s||"":c.b||"");
  var rs=P.recetas.filter(function(x){return x.ing.indexOf(id)>=0;});if(rs.length)t+=" Con eso yo haría "+B(rs[0].n.toLowerCase())+".";return t;}
function responder(q){var n=" "+norm(q)+" ",x=numeros(q);
  /* seguimiento de la conversación */
  if(ctx.tema&&/^ (y |entonces |pues )?(hace un ano|el ano pasado|y ayer|y hace un ano|en un ano) $/.test(n)){n+=" hace un ano ";n=ctx.tema+" "+n;}
  if(ctx.tema&&/^ (y )?(el |la )?(diesel|gasolina) $/.test(n))n=" gasolina "+n;
  if(/ que (es|significa|quiere decir) | define /.test(n)){for(var g=0;g<GLOS.length;g++){if(tiene(n,GLOS[g][0]))return GLOS[g][1];}}
  var al=alimentoEn(n);
  var mejor=null,pts=0;
  TEMAS.forEach(function(t){if(!t.f)return;var s=0;t.k.forEach(function(k){if(n.indexOf(k)>=0)s+=k.length>6?2:1;});if(s>pts){pts=s;mejor=t;}});
  if(al&&(!mejor||pts<2||mejor.id==="cocina"&&!tiene(n,["receta","cocin","hago"]))){ctx.tema=null;return respAlimento(al);}
  if(mejor){ctx.tema=mejor.k[0];var r=mejor.f(n,x);
    /* segunda pregunta en la misma frase («la luz y la gasolina») */
    var otro=null,p2=0;TEMAS.forEach(function(t){if(!t.f||t===mejor)return;var s=0;t.k.forEach(function(k){if(n.indexOf(k)>=0)s+=k.length>6?2:1;});if(s>p2){p2=s;otro=t;}});
    if(otro&&p2>=1&&/ y /.test(n)&&["saludo","gracias","quien"].indexOf(otro.id)<0)r+="<br><br>"+otro.f(n,x);
    return r;}
  for(var g2=0;g2<GLOS.length;g2++){if(tiene(n,GLOS[g2][0]))return GLOS[g2][1];}
  if(ctx.tema&&(x.length||/ (y |entonces |pues |si )/.test(n))){var tm=TEMAS.filter(function(t){return t.k[0]===ctx.tema;})[0];if(tm){var n2=n+(tm.id==="lavadora"&&x.length?" a las ":"")+" "+ctx.tema+" ";return tm.f(n2,x);}}
  return azar(["Uy, de eso no sé nada, "+G.hija+".","Eso no lo tengo apuntado en la libreta.","Ay, "+G.hija+", que yo de eso no entiendo."])+" Pregúntame por la luz, la gasolina, el gas, la hipoteca, la compra, un alimento, los sueldos, las pensiones o lo que costaba algo antes. O pídeme un refrán.";}
var SUG=["¿A qué hora pongo la lavadora?","¿Cuánto cuesta llenar 40 litros de diésel?","Hipoteca de 200.000 € a 25 años","¿Cuánto ha subido el pollo?","¿Qué cocino con patatas?","¿Cuánto costaba el pan en 1986?","¿Qué es el euríbor?","Cuéntame un refrán","¿Cuánto cobra un pensionista?","¿Cómo va el paro?","¿Está cara la bombona de butano?","¿Cuánto es 5.000 pesetas?","¿Qué es el IPC?","¿Cuánto me dan por 10.000 € en un depósito?"];
$("chatSug").innerHTML=SUG.map(function(x){return '<button type="button">'+x+'</button>';}).join("");$("chatSug").removeAttribute("data-orig");
function preguntar(q){if(!q.trim())return;decir(q.replace(/</g,"&lt;"),"u");setTimeout(function(){decir(responder(q),"r");},380);}
$("chatSug").addEventListener("click",function(e){var b=e.target.closest("button");if(b)preguntar(b.textContent);});
$("chatForm").addEventListener("submit",function(e){e.preventDefault();var i=$("chatIn");preguntar(i.value);i.value="";});
var chatBtn=document.querySelector(".chat-btn");
function abrirChat(){chat.hidden=false;chatBtn.hidden=true;marquesinas(chat);if(!chatLog.children.length)decir("¡Hola, "+G.hija+"! Soy Remedios. Pregúntame lo que quieras de los precios de hoy, que me lo sé todo de memoria.","r");$("chatIn").focus();}
document.addEventListener("click",function(e){if(e.target.closest("[data-chat]"))abrirChat();});
$("chatX").addEventListener("click",function(){chat.hidden=true;chatBtn.hidden=false;chatBtn.focus();});

/* ---------- Páginas y navegación ---------- */
function ruta(){
  var hs=(location.hash||"").slice(1),pg=hs==="antes-y-ahora"?"antes":hs==="gaceta"?"gaceta":hs==="remedios"?"remedios":"inicio";
  ["inicio","antes","gaceta","remedios"].forEach(function(x){$("pg-"+x).hidden=x!==pg;$("tab-"+x).setAttribute("aria-current",x===pg?"page":"false");});
  document.querySelectorAll(".bf-nav a").forEach(function(x){x.setAttribute("aria-current",x.getAttribute("href")==="#"+(pg==="antes"?"antes-y-ahora":pg)?"page":"false");});
  if(pg==="inicio"&&hs&&hs!=="inicio"){var t=$(hs);if(t)t.scrollIntoView();}
  if(pg!=="inicio"||hs==="inicio")window.scrollTo(0,0);
}
document.addEventListener("click",function(e){var a=e.target.closest("[data-ir]");if(!a)return;var t=$(a.getAttribute("data-ir"));if(t){e.preventDefault();if(a.getAttribute("data-cierra"))cerrar();if($("pg-inicio").hidden){location.hash=a.getAttribute("data-ir");return;}{t.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}}});
window.addEventListener("hashchange",ruta);ruta();
})();
