/* Ilustraciones de Remedios (nacida en 1945). Devuelven SVG como texto.
   Remedios.figura({edad, anio, actividad}) · Remedios.apuntes() */
(function(){
"use strict";
var PIEL="#F2C9A8", TINTA="#1E2433";

function era(anio){
  if(anio<1980) return {id:"70",pelo:"#3B2A20",estilo:"largo",vestido:"#E07A1F",dibujo:"flores",zapato:"#C8323C",pendiente:"aro",gafas:false,labios:"#C8323C",sombra:null,objeto:"radio",hombreras:false};
  if(anio<1995) return {id:"80",pelo:"#4A3226",estilo:"permanente",vestido:"#7B3FA0",dibujo:"rayas",zapato:"#1E2433",pendiente:"aro",gafas:false,labios:"#D2386C",sombra:"#5DA9E9",objeto:"tele",hombreras:true};
  if(anio<2004) return {id:"90",pelo:"#7A3B22",estilo:"melena",vestido:"#2F7A45",dibujo:"perlas",zapato:"#5A3A22",pendiente:"perla",gafas:false,labios:"#B3262F",sombra:null,objeto:"telefono",hombreras:false};
  if(anio<2011) return {id:"00",pelo:"#8E8A86",estilo:"corto",vestido:"#3558B8",dibujo:"botones",zapato:"#3558B8",pendiente:"perla",gafas:true,labios:null,sombra:null,objeto:"movil",hombreras:false};
  if(anio<2021) return {id:"10",pelo:"#C9C9D2",estilo:"corto",vestido:"#8E2F45",dibujo:"botones",zapato:"#5A3A22",pendiente:"bola",gafas:true,labios:null,sombra:null,objeto:"tableta",hombreras:false};
  return {id:"hoy",pelo:"#E6E6EE",estilo:"mono",vestido:"#1E2433",dibujo:"lunares",zapato:"#3558B8",pendiente:"bola",gafas:true,labios:null,sombra:null,objeto:null,hombreras:false};
}

function silla(){
  return '<g fill="#8A5A2B"><rect x="78" y="88" width="10" height="196" rx="4"/><rect x="196" y="88" width="10" height="196" rx="4"/><rect x="84" y="100" width="116" height="9" rx="4"/><rect x="84" y="124" width="116" height="9" rx="4"/><rect x="84" y="148" width="116" height="9" rx="4"/><rect x="74" y="218" width="10" height="66" rx="4"/><rect x="206" y="218" width="10" height="66" rx="4"/></g>'+
    '<rect x="70" y="200" width="150" height="20" rx="6" fill="#D9B26A"/><path d="M74 206h142M74 213h142" stroke="#B88E45" stroke-width="2"/>';
}

function objeto(tipo){
  var mesa='<rect x="8" y="232" width="62" height="7" rx="2" fill="#8A5A2B"/><rect x="14" y="239" width="6" height="46" fill="#8A5A2B"/><rect x="58" y="239" width="6" height="46" fill="#8A5A2B"/>';
  if(tipo==="radio") return mesa+'<rect x="14" y="200" width="50" height="32" rx="6" fill="#C8323C"/><circle cx="29" cy="216" r="9" fill="#F3E3CC"/><g stroke="#8E1E25" stroke-width="1.5"><path d="M23 212h12M23 216h12M23 220h12"/></g><rect x="43" y="208" width="16" height="5" rx="2" fill="#F3E3CC"/><circle cx="51" cy="222" r="4" fill="#F3E3CC"/><path d="M58 200l8-18" stroke="#5F6470" stroke-width="2"/>';
  if(tipo==="tele") return mesa+'<rect x="10" y="190" width="58" height="42" rx="6" fill="#6B4A2B"/><rect x="15" y="195" width="38" height="31" rx="6" fill="#5DA9E9"/><path d="M20 220q8-12 16 0t14-4" stroke="#FFF" stroke-width="2" fill="none" opacity=".7"/><circle cx="60" cy="202" r="3" fill="#F3E3CC"/><circle cx="60" cy="212" r="3" fill="#F3E3CC"/><path d="M30 190l-8-14M40 190l8-14" stroke="#5F6470" stroke-width="2"/>';
  if(tipo==="telefono") return mesa+'<path d="M16 232l6-20h34l6 20z" fill="#EDEFF3" stroke="#AEB4C0"/><rect x="18" y="204" width="42" height="10" rx="5" fill="#EDEFF3" stroke="#AEB4C0"/><circle cx="39" cy="223" r="6" fill="#FFF" stroke="#AEB4C0"/><path d="M60 214q16 10 4 30" stroke="#AEB4C0" stroke-width="1.5" fill="none"/>';
  if(tipo==="movil") return mesa+'<rect x="28" y="200" width="18" height="32" rx="4" fill="#3A3F4B"/><rect x="31" y="204" width="12" height="11" rx="1" fill="#A7D49B"/><g fill="#9AA1B0"><circle cx="34" cy="221" r="1.5"/><circle cx="40" cy="221" r="1.5"/><circle cx="34" cy="226" r="1.5"/><circle cx="40" cy="226" r="1.5"/></g>';
  if(tipo==="tableta") return mesa+'<rect x="12" y="206" width="52" height="26" rx="4" fill="#2E3440"/><rect x="15" y="209" width="46" height="20" rx="2" fill="#9CC3FF"/><circle cx="28" cy="219" r="5" fill="#F2C9A8"/><circle cx="46" cy="219" r="5" fill="#F5C518"/>';
  return "";
}

function cuerpo(e){
  var o='<path d="M98 214c-4-52 18-90 52-90s58 38 52 90z" fill="'+e.vestido+'"/>';
  if(e.hombreras) o+='<path d="M96 138q14-16 30-14l-6 18zM204 138q-14-16-30-14l6 18z" fill="'+e.vestido+'" stroke="#5E2F7A" stroke-width="2"/>';
  if(e.dibujo==="lunares") o+='<g fill="#F3F4F0" opacity=".85"><circle cx="125" cy="160" r="4"/><circle cx="150" cy="148" r="4"/><circle cx="176" cy="162" r="4"/><circle cx="135" cy="188" r="4"/><circle cx="165" cy="186" r="4"/><circle cx="118" cy="206" r="4"/><circle cx="182" cy="204" r="4"/></g>';
  if(e.dibujo==="flores"){var f=function(x,y){return '<g transform="translate('+x+' '+y+')"><circle r="4" cx="0" cy="-5" fill="#FFF3D6"/><circle r="4" cx="5" cy="0" fill="#FFF3D6"/><circle r="4" cx="0" cy="5" fill="#FFF3D6"/><circle r="4" cx="-5" cy="0" fill="#FFF3D6"/><circle r="3" fill="#F5C518"/></g>';};o+=f(124,160)+f(170,152)+f(146,186)+f(180,196)+f(116,202);}
  if(e.dibujo==="rayas") o+='<g stroke="#C9A2E0" stroke-width="5" opacity=".7"><path d="M108 168h84M104 186h92M102 204h96"/></g>';
  if(e.dibujo==="perlas") o+='<path d="M132 130q18 16 36 0" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="0.1 7" stroke-linecap="round" fill="none"/><path d="M150 140v70" stroke="#1F5A33" stroke-width="2"/>';
  if(e.dibujo==="botones") o+='<path d="M150 132v80" stroke="rgba(0,0,0,.25)" stroke-width="2"/><g fill="#F3E3CC"><circle cx="156" cy="150" r="3"/><circle cx="156" cy="170" r="3"/><circle cx="156" cy="190" r="3"/></g>';
  o+='<rect x="120" y="214" width="22" height="58" rx="8" fill="'+PIEL+'"/><rect x="158" y="214" width="22" height="58" rx="8" fill="'+PIEL+'"/>';
  o+='<path d="M112 270h34a6 6 0 0 1 0 12h-34a8 8 0 0 1 0-12zM154 270h34a8 8 0 0 1 0 12h-34a6 6 0 0 1 0-12z" fill="'+e.zapato+'"/>';
  if(e.id==="70") o+='<rect x="114" y="280" width="30" height="5" fill="#8A3A1A"/><rect x="156" y="280" width="30" height="5" fill="#8A3A1A"/>';
  return o;
}

function pelo(e){
  var c=e.pelo,back="",front="";
  if(e.estilo==="mono"){front='<path d="M119 82c2-24 16-34 31-34s29 10 31 34c-6-12-17-17-31-17s-25 5-31 17z" fill="'+c+'"/><circle cx="150" cy="46" r="13" fill="'+c+'"/><path d="M141 44q9-6 18 0" stroke="#C8C8D4" stroke-width="2" fill="none"/>';}
  if(e.estilo==="largo"){back='<path d="M114 84c-6-30 12-46 36-46s42 16 36 46l6 60c-12 8-20 8-26 0l-16-40-16 40c-6 8-14 8-26 0z" fill="'+c+'"/>';front='<path d="M118 84c0-22 14-36 32-36s32 14 32 36c-8-10-20-16-32-16s-24 6-32 16z" fill="'+c+'"/><path d="M121 70q29-26 58 0" stroke="#F5C518" stroke-width="5" fill="none" stroke-linecap="round"/>';}
  if(e.estilo==="permanente"){var r="";[[120,64],[134,50],[150,46],[166,50],[180,64],[114,82],[186,82],[112,100],[188,100],[126,58],[174,58],[142,52],[158,52]].forEach(function(p){r+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="12"/>';});back='<g fill="'+c+'">'+r+'</g>';front='<g fill="'+c+'"><circle cx="130" cy="64" r="9"/><circle cx="146" cy="60" r="9"/><circle cx="162" cy="60" r="9"/><circle cx="174" cy="66" r="8"/></g>';}
  if(e.estilo==="melena"){back='<path d="M114 90c-4-32 14-46 36-46s40 14 36 46v22c-8 4-14 4-18 0V96h-36v16c-4 4-10 4-18 0z" fill="'+c+'"/>';front='<path d="M118 82c2-22 16-34 32-34s30 12 32 34c-12-8-22-14-32-14-12 0-22 6-32 14z" fill="'+c+'"/>';}
  if(e.estilo==="corto"){front='<path d="M117 90c-2-28 12-42 33-42s35 14 33 42c-2-6-4-12-8-16-6-6-16-8-25-8s-19 2-25 8c-4 4-6 10-8 16z" fill="'+c+'"/><path d="M132 56q10-6 22-4M160 54q8 2 12 8" stroke="'+(e.id==="00"?"#C9C9D2":"#E6E6EE")+'" stroke-width="3" fill="none" stroke-linecap="round"/>';}
  return {back:back,front:front};
}

function cara(e,edad){
  var o='<rect x="140" y="104" width="20" height="22" rx="6" fill="'+PIEL+'"/><circle cx="150" cy="86" r="30" fill="'+PIEL+'"/>';
  if(e.sombra) o+='<path d="M132 84q7-6 14 0M154 84q7-6 14 0" stroke="'+e.sombra+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
  if(e.gafas) o+='<circle cx="139" cy="88" r="8" fill="#fff" stroke="'+TINTA+'" stroke-width="2.4"/><circle cx="161" cy="88" r="8" fill="#fff" stroke="'+TINTA+'" stroke-width="2.4"/><path d="M147 88h6" stroke="'+TINTA+'" stroke-width="2.4"/>';
  else o+='<path d="M133 79q6-4 12 0M155 79q6-4 12 0" stroke="#5A4030" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  o+='<circle cx="139" cy="89" r="2.4" fill="'+TINTA+'"/><circle cx="161" cy="89" r="2.4" fill="'+TINTA+'"/>';
  if(edad<55) o+='<path d="M136 86l-3-2M164 86l3-2" stroke="'+TINTA+'" stroke-width="1.5"/>';
  else o+='<path d="M128 94q3 2 5 0M167 94q3 2 5 0" stroke="#D9A88C" stroke-width="1.4" fill="none"/>';
  o+='<path d="M140 102q10 8 20 0" stroke="'+(e.labios||TINTA)+'" stroke-width="'+(e.labios?3.2:2.6)+'" fill="none" stroke-linecap="round"/>';
  o+='<circle cx="130" cy="99" r="5" fill="#E99A8E" opacity=".55"/><circle cx="170" cy="99" r="5" fill="#E99A8E" opacity=".55"/>';
  if(e.pendiente==="aro") o+='<circle cx="120" cy="100" r="6" fill="none" stroke="#D9A21B" stroke-width="2.5"/><circle cx="180" cy="100" r="6" fill="none" stroke="#D9A21B" stroke-width="2.5"/>';
  else if(e.pendiente==="perla") o+='<circle cx="121" cy="96" r="3.4" fill="#FFF" stroke="#D5D9E0"/><circle cx="179" cy="96" r="3.4" fill="#FFF" stroke="#D5D9E0"/>';
  else o+='<circle cx="121" cy="94" r="3" fill="#D9A21B"/><circle cx="179" cy="94" r="3" fill="#D9A21B"/>';
  return o;
}

var MANGA=function(e){return e.vestido;};
function brazoIzqRegazo(e){return '<path d="M108 150c-10 22-6 46 18 54" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="132" cy="204" r="9" fill="'+PIEL+'"/>';}

var ACT={
  dormir:{pie:"echando una cabezadita",dib:function(e){return '<path d="M108 150c-6 22 4 40 30 44" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M192 150c6 22-4 40-30 44" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<path d="M84 200q66-22 132 0l10 58q-76 18-152 0z" fill="#7C9BD6"/><path d="M84 200q66-22 132 0" stroke="#5876B8" stroke-width="3" fill="none"/><g fill="#F3F4F0" opacity=".8"><circle cx="110" cy="226" r="4"/><circle cx="150" cy="218" r="4"/><circle cx="190" cy="226" r="4"/><circle cx="128" cy="246" r="4"/><circle cx="172" cy="246" r="4"/></g>'+
    '<circle cx="142" cy="196" r="9" fill="'+PIEL+'"/><circle cx="158" cy="196" r="9" fill="'+PIEL+'"/>'+
    '<circle cx="139" cy="88" r="6.6" fill="#fff"/><circle cx="161" cy="88" r="6.6" fill="#fff"/><path d="M134 88q5 4 10 0M156 88q5 4 10 0" stroke="'+TINTA+'" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M144 104q6 3 12 0" stroke="'+PIEL+'" stroke-width="6"/><ellipse cx="150" cy="104" rx="3.4" ry="2.6" fill="#8E3A3A"/>'+
    '<g class="r-zzz" font-family="Georgia,serif" font-weight="700" fill="#3558B8"><text x="188" y="64" font-size="16">z</text><text x="202" y="48" font-size="21">z</text><text x="219" y="28" font-size="27">Z</text></g>';}},
  abanico:{pie:"abanicándose en la puerta",dib:function(e){return brazoIzqRegazo(e)+'<path d="M190 148c16 10 22 24 22 34" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/><g class="r-abanico"><path d="M212 182L246 108A80 80 0 0 1 286 150Z" fill="#C8323C"/><path d="M212 182L246 108M212 182L258 112M212 182L268 120M212 182L277 131M212 182L283 141M212 182L286 150" stroke="#8E1E25" stroke-width="2"/><path d="M246 108A80 80 0 0 1 286 150" stroke="#D9A21B" stroke-width="5" fill="none"/><circle cx="256" cy="134" r="5" fill="#F3F4F0"/><circle cx="270" cy="146" r="4" fill="#F3F4F0"/><circle cx="212" cy="182" r="10" fill="'+PIEL+'"/></g>';}},
  punto:{pie:"haciendo punto",dib:function(e){return '<path d="M108 150c-6 22 4 40 30 44" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M192 150c6 22-4 40-30 44" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<path d="M150 204q30 40 92 52" stroke="#C8323C" stroke-width="2" fill="none"/><circle cx="246" cy="268" r="15" fill="#C8323C"/><path d="M234 262q12-6 24 4M236 272q10-4 20 4M240 258q6 10 2 22" stroke="#8E1E25" stroke-width="1.6" fill="none"/>'+
    '<rect x="134" y="196" width="32" height="20" rx="3" fill="#C8323C"/><path d="M136 202h28M136 208h28" stroke="#8E1E25" stroke-width="1.4" stroke-dasharray="3 2"/>'+
    '<g class="r-aguja1"><path d="M118 176l44 30" stroke="#AEB4C0" stroke-width="3" stroke-linecap="round"/><circle cx="118" cy="176" r="3" fill="#F5C518"/></g><g class="r-aguja2"><path d="M182 176l-44 30" stroke="#AEB4C0" stroke-width="3" stroke-linecap="round"/><circle cx="182" cy="176" r="3" fill="#F5C518"/></g>'+
    '<circle cx="138" cy="194" r="9" fill="'+PIEL+'"/><circle cx="162" cy="194" r="9" fill="'+PIEL+'"/>';}},
  radio:{pie:"escuchando la radio",dib:function(e){return '<path d="M108 150c-6 22 4 40 28 42" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M192 150c6 22-4 40-28 42" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<path d="M168 168l26-40" stroke="#AEB4C0" stroke-width="2.4" stroke-linecap="round"/><circle cx="194" cy="128" r="2.6" fill="#AEB4C0"/>'+
    '<rect x="112" y="168" width="76" height="44" rx="8" fill="#B5462E" stroke="#7A2A1A" stroke-width="2"/><circle cx="134" cy="190" r="13" fill="#F3E3C2"/><g fill="#B5462E"><circle cx="129" cy="185" r="1.6"/><circle cx="135" cy="185" r="1.6"/><circle cx="141" cy="190" r="1.6"/><circle cx="129" cy="191" r="1.6"/><circle cx="135" cy="191" r="1.6"/><circle cx="129" cy="197" r="1.6"/><circle cx="135" cy="197" r="1.6"/></g>'+
    '<rect x="154" y="178" width="26" height="12" rx="2" fill="#F3E3C2"/><path d="M160 178v12" stroke="#C8323C" stroke-width="1.6"/><circle cx="160" cy="200" r="4" fill="#F3E3C2"/><circle cx="174" cy="200" r="4" fill="#F3E3C2"/>'+
    '<circle cx="114" cy="196" r="9" fill="'+PIEL+'"/><circle cx="186" cy="196" r="9" fill="'+PIEL+'"/>'+
    '<g class="r-notas" fill="#3558B8"><text x="200" y="150" font-size="22" font-family="Georgia,serif">♪</text><text x="222" y="128" font-size="18" font-family="Georgia,serif">♫</text><text x="206" y="108" font-size="16" font-family="Georgia,serif">♪</text></g>';}},
  telefono:{pie:"hablando por teléfono con su hermana",dib:function(e){return brazoIzqRegazo(e)+'<path d="M190 150c16 4 20-20 4-44" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<g class="r-tel"><path d="M196 70c-10-2-14 6-12 14l4 22c2 8 10 12 16 8" stroke="#1E2433" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="188" cy="102" r="10" fill="'+PIEL+'"/></g>'+
    '<path d="M206 116c6 4 0 10 6 14s0 10 6 14 0 10 6 14 0 10 6 14 4 14 6 26" stroke="#1E2433" stroke-width="2" fill="none"/>'+
    '<rect x="222" y="232" width="58" height="10" rx="2" fill="#8A5A2B"/><path d="M230 242v40M272 242v40" stroke="#8A5A2B" stroke-width="5"/><path d="M228 232l6-22h34l6 22z" fill="#2B2F3A"/><circle cx="251" cy="220" r="8" fill="#F3F4F0"/><circle cx="251" cy="220" r="3" fill="#2B2F3A"/>'+
    '<g class="r-ondas" stroke="#C8323C" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M214 72q8 8 0 16"/><path d="M222 66q12 14 0 28"/></g>';}},
  patatas:{pie:"pelando patatas para la tortilla",dib:function(e){return '<path d="M108 150c-6 20 2 38 24 42" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M192 150c6 20-2 36-22 40" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<path d="M106 206h88l-8 30a10 10 0 0 1-10 8h-52a10 10 0 0 1-10-8z" fill="#E8E2D2" stroke="#AEB4C0" stroke-width="2"/><path d="M106 206h88" stroke="#3558B8" stroke-width="4"/><g fill="#E9D7A0"><ellipse cx="130" cy="204" rx="11" ry="8"/><ellipse cx="152" cy="202" rx="10" ry="7"/><ellipse cx="170" cy="205" rx="10" ry="7"/></g>'+
    '<ellipse cx="140" cy="186" rx="12" ry="9" fill="#C9A15A"/><path d="M134 184a6 4 0 0 1 10 0" fill="#E9D7A0"/><circle cx="132" cy="192" r="9" fill="'+PIEL+'"/>'+
    '<path class="r-piel" d="M150 192q4 14-4 22q10 6 2 16" stroke="#9C7A3C" stroke-width="3" fill="none" stroke-linecap="round"/>'+
    '<g class="r-cuchillo"><path d="M150 186l22-8" stroke="#D5D9E0" stroke-width="4" stroke-linecap="round"/><path d="M172 178l10-4" stroke="#2B2F3A" stroke-width="6" stroke-linecap="round"/><circle cx="172" cy="190" r="9" fill="'+PIEL+'"/></g>';}},
  crucigrama:{pie:"haciendo el crucigrama",dib:function(e){var g="";for(var i=0;i<5;i++)for(var j=0;j<4;j++){var neg=(i*3+j*2)%7===0;g+='<rect x="'+(122+i*9)+'" y="'+(178+j*9)+'" width="9" height="9" fill="'+(neg?"#1E2433":"#fff")+'" stroke="#1E2433" stroke-width=".6"/>';}
    return '<path d="M108 150c-6 20 2 36 22 40" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M192 150c10 16 12 30 4 40" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<g transform="rotate(-5 150 196)"><rect x="112" y="170" width="92" height="52" rx="2" fill="#F7F5EE" stroke="#AEB4C0" stroke-width="1.5"/>'+g+'<text x="128" y="190" font-family="Georgia,serif" font-size="7" font-weight="700" fill="#1E2433">I</text><text x="137" y="190" font-family="Georgia,serif" font-size="7" font-weight="700" fill="#1E2433">P</text><text x="146" y="190" font-family="Georgia,serif" font-size="7" font-weight="700" fill="#1E2433">C</text><path d="M172 180h26M172 186h22M172 192h26M172 198h18M172 204h24M172 210h20" stroke="#AEB4C0" stroke-width="1.6"/></g>'+
    '<circle cx="128" cy="194" r="9" fill="'+PIEL+'"/>'+
    '<g class="r-lapiz"><path d="M170 196l20-28" stroke="#F5C518" stroke-width="5" stroke-linecap="round"/><path d="M170 196l-2 5" stroke="#1E2433" stroke-width="3" stroke-linecap="round"/><circle cx="192" cy="190" r="9" fill="'+PIEL+'"/></g>';}},
  periodico:{pie:"leyendo el periódico",dib:function(e){return '<path d="M108 150c-8 16-12 30-12 44" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M192 150c8 16 12 30 12 44" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<g class="r-lee"><rect x="86" y="132" width="128" height="78" rx="3" fill="#F7F5EE" stroke="#AEB4C0" stroke-width="1.5"/><path d="M150 132v78" stroke="#D5D9E0"/><path d="M94 140h50" stroke="#1E2433" stroke-width="1"/><text x="119" y="149.5" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="9" textLength="46" lengthAdjust="spacingAndGlyphs" fill="#B3262F">¡TODO SUBE!</text><path d="M94 153h50" stroke="#1E2433" stroke-width=".8"/><rect x="96" y="158" width="46" height="22" rx="1" fill="#C9CED8"/><path d="M96 186h46M96 192h46M96 198h40M158 144h46M158 150h46M158 156h46M158 162h40M158 170h46M158 176h46M158 182h46M158 188h30" stroke="#AEB4C0" stroke-width="2"/></g>'+
    '<circle cx="94" cy="196" r="9" fill="'+PIEL+'"/><circle cx="206" cy="196" r="9" fill="'+PIEL+'"/>';}},
  cafe:{pie:"con su cafelito",dib:function(e){return brazoIzqRegazo(e)+'<path d="M190 148c14 8 18 18 14 32" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<g class="r-vapor" stroke="#AEB4C0" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M200 156c-4-6 4-8 0-14"/><path d="M210 156c-4-6 4-8 0-14"/></g>'+
    '<path d="M194 162h22v12a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z" fill="#FFFFFF" stroke="#AEB4C0" stroke-width="1.5"/><path d="M216 166h3a4 4 0 0 1 0 8h-3" stroke="#AEB4C0" stroke-width="2.4" fill="none"/><ellipse cx="205" cy="163" rx="10" ry="2" fill="#7A4A26"/><circle cx="204" cy="184" r="9" fill="'+PIEL+'"/>';}},
  regar:{pie:"regando los geranios",dib:function(e){return brazoIzqRegazo(e)+'<path d="M190 148c16 10 26 22 30 34" stroke="'+MANGA(e)+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<path d="M246 252h32l-4 32h-24z" fill="#C8643C"/><rect x="243" y="248" width="38" height="7" rx="2" fill="#A84E2C"/><path d="M262 248v-18M254 248l-8-14M270 248l8-12" stroke="#3E9B5E" stroke-width="3"/><g fill="#E2554B"><circle cx="262" cy="226" r="6"/><circle cx="245" cy="232" r="5"/><circle cx="279" cy="234" r="5"/></g>'+
    '<g class="r-gotas" fill="#5DA9E9"><circle cx="262" cy="196" r="2.5"/><circle cx="258" cy="208" r="2.5"/><circle cx="266" cy="214" r="2.5"/></g>'+
    '<path d="M216 178h28v20a4 4 0 0 1-4 4h-20a4 4 0 0 1-4-4z" fill="#3E9B5E"/><path d="M244 184l16-10" stroke="#3E9B5E" stroke-width="4" stroke-linecap="round"/><path d="M220 178q10-14 20 0" stroke="#2F7A45" stroke-width="3" fill="none"/><circle cx="222" cy="182" r="9" fill="'+PIEL+'"/>';}}
};

function figura(o){
  var edad=o.edad, anio=o.anio||2026, act=ACT[o.actividad||"abanico"]||ACT.abanico, e=era(anio), p=pelo(e);
  var s='<svg class="abuela" viewBox="0 0 300 300" role="img" aria-label="Remedios con '+edad+' años, '+act.pie+'">';
  s+='<ellipse cx="150" cy="288" rx="128" ry="9" fill="var(--raya)"/>';
  s+=objeto(e.objeto)+silla()+p.back+cuerpo(e)+cara(e,edad)+p.front+act.dib(e);
  return s+'</svg>';
}

function apuntes(){
  var e=era(2026),p=pelo(e);
  return '<svg class="abuela" viewBox="0 0 300 260" role="img" aria-label="Remedios tomando notas en su libreta">'+
    '<rect x="230" y="20" width="56" height="64" rx="4" fill="#FFFFFF" stroke="#C9CED8"/><rect x="230" y="20" width="56" height="16" rx="4" fill="#C8323C"/><text x="258" y="70" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="700" fill="#1E2433">13</text>'+
    '<path d="M98 214c-4-52 18-90 52-90s58 38 52 90z" fill="'+e.vestido+'"/><g fill="#F3F4F0" opacity=".85"><circle cx="125" cy="160" r="4"/><circle cx="150" cy="148" r="4"/><circle cx="176" cy="162" r="4"/></g>'+
    cara(e,81)+p.front+
    '<rect x="40" y="196" width="230" height="14" rx="4" fill="#8A5A2B"/><rect x="56" y="210" width="10" height="46" fill="#8A5A2B"/><rect x="244" y="210" width="10" height="46" fill="#8A5A2B"/>'+
    '<path d="M108 150c-6 20 2 36 22 40" stroke="'+e.vestido+'" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M192 150c10 16 12 30 4 40" stroke="'+e.vestido+'" stroke-width="20" fill="none" stroke-linecap="round"/>'+
    '<g transform="rotate(-6 150 190)"><rect x="112" y="174" width="80" height="24" rx="2" fill="#F5E6B8"/><path d="M120 182h50M120 189h40" stroke="#B9A06A" stroke-width="1.6"/><path d="M152 174v24" stroke="#D9C38A"/></g>'+
    '<circle cx="134" cy="192" r="9" fill="'+PIEL+'"/>'+
    '<g class="r-lapiz"><path d="M176 186l18-30" stroke="#F5C518" stroke-width="5" stroke-linecap="round"/><path d="M176 186l-2 5" stroke="#1E2433" stroke-width="3" stroke-linecap="round"/><circle cx="194" cy="188" r="9" fill="'+PIEL+'"/></g>'+
    '</svg>';
}

window.Remedios={figura:figura,apuntes:apuntes,actividades:Object.keys(ACT).filter(function(k){return k!=="dormir";}),pie:function(a){return (ACT[a]||ACT.abanico).pie;},era:era};
})();
