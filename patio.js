/* Contenido fijo de Radio Patio y de La Gaceta del Patio: comentarios de Remedios, refranes,
   consejos, santoral, efemérides y recetas. {hija}, {Hija}, {suNieto}, {SuNieto} y {comp}
   se sustituyen en cada visita (Remedios no siempre habla con la misma persona). */
window.PATIO = {

/* Comentarios de Remedios a cada dato de las tarjetas: s = sube, b = baja, i = igual */
com: {
  paro:{s:["Cuando los jóvenes no encuentran trabajo, la abuela paga el café.","Más gente en la cola del paro. Esto no me gusta nada, {hija}."],b:["Menos parados. ¡Eso sí que es una alegría!","Que baje el paro me alegra más que un reintegro en la lotería."],i:["El paro, quietecito. Ni fu ni fa."]},
  recibo:{s:["Con lo que cuesta la luz, ceno con velas como en el cincuenta y tantos.","Este recibo da más miedo que una noche de difuntos."],b:["Baja el recibo: pongo la radio un ratito más.","Por fin una alegría en el buzón."],i:["El recibo, igual de caro que el mes pasado."]},
  horasluz:{s:["Horas y horas trabajando para encender la bombilla. ¡Qué disparate!","Antes se trabajaba para comer; ahora, para la luz."],b:["Menos horas para pagar la luz. Algo es algo."],i:["Las mismas horas para pagar la luz. Ni para atrás."]},
  luzmes:{s:["Este mes la luz va lanzada. Plancha, la justa.","La luz de noviembre va como un tiro. Mantita y a la cama pronto."],b:["La luz del mes afloja. Aprovecha para el horno."],i:["La luz del mes, como la del anterior."]},
  gasolina:{s:["La gasolina sube y yo sigo yendo andando al mercado.","Con estos precios, el coche se queda en la cochera."],b:["Baja la gasolina: buen momento para ir al pueblo.","Céntimo a céntimo, como la hucha del cerdito."],i:["La gasolina, ni frío ni calor."]},
  diesel:{s:["El diésel, por las nubes. La furgoneta de {suNieto} bebe como un cosaco.","Sube el gasóleo y el que pierde es siempre el mismo: el que tiene que ir a trabajar."],b:["El diésel afloja un poquito. Ya era hora."],i:["El diésel ni sube ni baja: se ha quedado pensando."]},
  gasoleoc:{s:["El gasóleo de la caldera sube. Mantita y zapatillas de felpa.","Con lo que cuesta calentar la casa, vuelvo al brasero."],b:["Baja el gasóleo: a llenar el depósito antes de que cambie."],i:["El gasóleo de calefacción, quieto."]},
  gastur:{s:["El gas sube. Duchas cortas, que esto no es un balneario.","Sube el gas: cocido, pero con la olla exprés."],b:["El gas baja. Hoy, cocido a fuego lento."],i:["El gas, igual. Que no se mueva hasta la primavera."]},
  brent:{s:["El barril sube y en tres semanas lo notaremos en el surtidor."],b:["Baja el petróleo; las gasolineras, como siempre, tardan en enterarse.","El barril cae. A ver si se acuerdan de nosotros."],i:["El barril, tranquilo. Raro, raro."]},
  butano:{s:["La bombona sube. Y luego subirla al cuarto sin ascensor...","El butanero sube la bombona y el precio, todo a la vez."],b:["Baja la bombona. ¡El butanero viene silbando!"],i:["La bombona, igual. Menos mal que tiene tope."]},
  euribor:{s:["El euríbor sube. Menos mal que mi piso está pagado desde el 89.","Si tienes hipoteca variable, agárrate, {hija}."],b:["Baja el euríbor. Respiran los de la hipoteca."],i:["El euríbor, quieto como un gato al sol.","El euríbor ni se ha despeinado este mes."]},
  cuota:{s:["La hipoteca, más cara. Ni vacaciones ni nada."],b:["Cuota más baja: eso, para un capricho."],i:["La cuota, igual. Que siga así mucho tiempo.","Ni un euro más de hipoteca. Por esta vez."]},
  bce:{s:["Suben los tipos en Fráncfort y aquí lo pagamos todos.","Los del banco central, apretando el cinturón… el nuestro."],b:["Bajan los tipos. Los del banco ya no sonríen tanto."],i:["Los tipos, quietos hasta la próxima reunión."]},
  ipc:{s:["Todo sube menos mi paciencia.","La inflación sube y mi monedero adelgaza."],b:["La inflación afloja. En la plaza todavía no lo noto."],i:["La inflación, igual que el mes pasado: alta.","Los precios siguen subiendo al mismo ritmo, que ya es mucho."]},
  smi:{s:["Suben los sueldos. ¡Ya era hora, hombre!","Un poquito más de sueldo. Ojalá llegara para algo."],b:["¿Bajar el sueldo? ¡Eso no lo he visto en mi vida!"],i:["El sueldo, igual. Y los precios, no."]},
  pension:{s:["Me sube la pensión: este domingo, churros.","Sube la pensión. ¡Que lo sepa el panadero!"],b:["¿Bajar la pensión? Ni se os ocurra."],i:["La pensión, igual. Y yo, igual de guapa."]},
  alquiler:{s:["Con lo que cuesta un alquiler, {suNieto} vivirá conmigo hasta los cuarenta.","Los alquileres, por las nubes. Y los pisos, cada vez más pequeños."],b:["Baja el alquiler un pelín. Pelín, ¿eh?"],i:["El alquiler, carísimo pero quieto."]},
  vivienda:{s:["Los pisos, a precio de palacio."],b:["Baja la vivienda un poquito. Para comprar, sigo sin llegar."],i:["Los pisos, carísimos pero quietos.","El precio de los pisos se ha tomado un descanso."]},
  aceite:{s:["El aceite sube. Medio chorrito en la ensalada."],b:["Baja el aceite: ¡tostada con aceite para todos!","El oro líquido ya no es tan oro."],i:["El aceite, igual. Ni una gota más."]},
  sello:{s:["El sello sube. Le mandaré un mensaje a mi hermana… o no.","Con lo que cuesta un sello, las cartas de amor ya no salen a cuenta."],b:["Baja el sello. ¡A escribir cartas!"],i:["El sello, igual."]}
},

/* Comentarios a cada alimento de la cesta */
comida: {
  uvas:{s:"Uvas más caras: en Nochevieja las cuento de una en una.",b:"Uvas baratas: a ensayar para Nochevieja."},
  ajos:{s:"El ajo sube. Y sin ajo no hay quien cocine.",b:"Ajos baratos: sopa de ajo, que reconforta."},
  peras:{s:"Peras caras. Esto es pedir peras al olmo.",b:"Peras baratas: peras al vino de postre."},
  macarrones:{s:"Los macarrones suben. Los nietos no se van a enterar.",b:"Macarrones baratos: domingo de macarrones."},
  huevos:{s:"Suben los huevos. Las gallinas de mi pueblo no lo saben.",b:"Huevos más baratos: ¡tortilla!"},
  arroz:{s:"El arroz sube. Paella, solo en las bodas.",b:"Arroz barato: arroz con leche para merendar."},
  leche:{s:"La leche sube. Y el café con leche sin leche no es nada.",b:"La leche baja: natillas caseras."},
  harina:{s:"La harina sube. Las rosquillas, contadas.",b:"Harina más barata: ¡a hacer rosquillas!"},
  manzana:{s:"Manzanas caras: una al día, pero pequeñita.",b:"Manzanas baratas: asadas con canela."},
  aceite:{s:"El aceite sube. Medio chorrito en la ensalada.",b:"Baja el aceite: ¡tostada con aceite para todos!"},
  zanahoria:{s:"Zanahorias caras. Los conejos, de huelga.",b:"Zanahorias baratas: buenas para la vista y para el bolsillo."},
  patata:{s:"La patata sube. Y sin patatas no hay tortilla, {hija}.",b:"Patatas baratas: tortilla, guiso y puré. ¡Viva la patata!"},
  girasol:{s:"El girasol sube. Para freír, lo justo.",b:"Girasol barato: croquetas."},
  lechuga:{s:"Lechuga cara: la ensalada, con más tomate.",b:"Lechuga barata: ensalada para todos."},
  limon:{s:"Limones caros. Y yo que los pongo en todo.",b:"Limones baratos: limonada casera."},
  cebolla:{s:"La cebolla sube. Ya me hace llorar antes de cortarla.",b:"Cebolla barata: buen sofrito y sopa de cebolla."},
  filete:{s:"La ternera, para los domingos… de cada dos.",b:"Ternera más barata: un filetito con patatas."},
  chuleta:{s:"El cordero, solo en Navidad, y pequeñito.",b:"Cordero más barato: caldereta para todos."},
  jamon:{s:"El cerdo sube. Cocido con menos tocino.",b:"El cerdo aguanta: lomo, costillas y cocido."},
  muslo:{s:"Hasta el pollo sube. Ya no hay refugio.",b:"El pollo, el amigo del bolsillo: al ajillo."},
  pescado:{s:"El pescado, por las nubes. Pescadilla y gracias.",b:"Pescado más barato: merluza en salsa verde."},
  gamba:{s:"El marisco, para mirarlo en el escaparate.",b:"Marisco más barato: unas gambitas al ajillo."},
  queso:{s:"El queso sube. Las tapas, más finitas.",b:"Queso más barato: un bocadillo de queso no falla."},
  pan:{s:"El pan sube. Y el de antes duraba tres días.",b:"El pan baja: migas para cenar."},
  cafe:{s:"El café sube. Uno al día y gracias.",b:"El café baja: el cafelito de la tarde, sin remordimientos."},
  azucar:{s:"El azúcar sube. Menos mal que soy de sacarina.",b:"El azúcar baja: a hacer mermelada."}
},

/* Comentarios a los precios de antes (página «Antes y ahora») */
antes: {
  pan:"Y el pan de antes aguantaba tres días.",cafe:"El café de antes sabía a café.",periodico:"Ahora lo leo en la tableta, con la letra bien grande.",
  leche:"La leche me la traía el lechero en una cántara.",huevos:"Los huevos los cogíamos del corral.",arroz:"Con un kilo de arroz comía media escalera.",
  gasolina:"Y llenaba el seiscientos con lo que llevaba en el bolsillo.",gasoleo:"Entonces el diésel era para los camiones y los taxis.",
  metro:"El metro olía igual, eso sí.",bono:"Con el bono iba a ver a mi hermana todas las semanas.",sello:"Y las cartas llegaban, oye.",
  cine:"Al cine, con tu abuelo, en la última fila.",menu:"El menú traía postre, pan y gaseosa.",butano:"El butanero subía la bombona al hombro.",
  vivienda:"Mi piso costó menos de lo que vale hoy un coche.",smi:"Y con eso se sacaba adelante una casa."
},

/* Refranes, con el apunte de Remedios */
refranes: [
  ["Quien guarda, halla.","Y quien no guarda, le pide a la abuela."],
  ["Más vale pájaro en mano que ciento volando.","Sobre todo si el pájaro es una pensión."],
  ["A quien madruga, Dios le ayuda.","Y la luz de madrugada, encima, es más barata."],
  ["Poco a poco se va lejos.","Como la cola de la carnicería."],
  ["De grano en grano llena la gallina el buche.","Así se llena también la hucha."],
  ["Lo barato sale caro.","Menos las patatas este mes, que salen baratas y buenas."],
  ["Cuentas claras, amistades largas.","Y la cuenta de la vieja, siempre a mano."],
  ["Quien mucho abarca, poco aprieta.","Ni se te ocurra poner la lavadora y el horno a la vez."],
  ["Más vale prevenir que curar.","Y purgar los radiadores antes del frío."],
  ["A buen hambre no hay pan duro.","Y si está duro, torrijas."],
  ["No hay mal que cien años dure.","Ni precio que no acabe bajando… algún día."],
  ["En casa del herrero, cuchillo de palo.","Y en la del electricista, a oscuras por si acaso."],
  ["Agua que no has de beber, déjala correr.","Pero cierra el grifo mientras te lavas los dientes."],
  ["Gato escaldado del agua fría huye.","Como yo de la factura de enero."],
  ["Año de nieves, año de bienes.","Y de calefacción, que no se te olvide."],
  ["El que parte y reparte se queda con la mejor parte.","En mi casa reparto yo, así que tranquilos."],
  ["Hasta el cuarenta de mayo no te quites el sayo.","Ni apagues la caldera, que luego refresca."],
  ["Ojos que no ven, corazón que no siente.","Por eso abro el recibo de la luz con las gafas quitadas."],
  ["Dime con quién andas y te diré quién eres.","Yo ando con mis amigas, al fresco. Así que imagínate."],
  ["Al pan, pan, y al vino, vino.","Y al recibo de la luz, un disgusto."],
  ["Quien tiene un amigo tiene un tesoro.","Y quien tiene un huerto, también."],
  ["A falta de pan, buenas son tortas.","Y con la harina más barata, mejor."]
],

/* Consejos de abuela */
consejos: [
  ["Tapa la olla al cocer: tarda menos y gasta menos.","Lo que se ahorra no se ve, pero se nota."],
  ["Cierra las persianas al anochecer para guardar el calor.","Y si tienes cortinas gordas, mejor."],
  ["Un burlete en la puerta de la calle frena el frío.","Yo uso una toalla enrollada. Funciona igual."],
  ["Congela el pan en rebanadas y sácalo según lo necesites.","Así no tiro ni una miga."],
  ["A la compra, con lista y con la tripa llena.","Si vas con hambre, vuelves con la cesta llena de caprichos."],
  ["Las patatas, lejos de las cebollas: se estropean antes juntas.","Como algunos matrimonios."],
  ["Las manzanas, aparte: hacen madurar al resto de la fruta.","Una manzana madura y todas detrás."],
  ["Si el horno está caliente, aprovecha para hacer dos cosas.","Bizcocho y asado. Dos por el precio de uno."],
  ["Descongela el congelador: la escarcha hace gastar más.","Una vez al año, como la limpieza de primavera."],
  ["La lavadora, llena y a poca temperatura.","Y en la hora barata, que te lo digo todos los días."],
  ["Purga los radiadores al empezar el invierno.","Si hacen glu-glu, es que tienen aire."],
  ["Un grado menos en el termostato ahorra en torno a un 7 % de calefacción.","Y una rebeca no cuesta nada."],
  ["Apaga el piloto rojo de la tele y del aparato de la radio.","Esa lucecita también cuenta en el recibo."],
  ["El agua de cocer las verduras, para una sopa.","Tiene alimento y no cuesta nada."],
  ["Compra la fruta y la verdura de temporada.","Es más barata y sabe a lo que tiene que saber."]
],

/* Curiosidades de la hemeroteca (sin fecha) */
curiosidades: [
  ["Un duro eran 5 pesetas, y veinte duros, 100 pesetas.","Con veinte duros iba yo al cine y a merendar."],
  ["El cambio oficial: 1 € = 166,386 pesetas.","Yo todavía lo paso a pesetas de cabeza. Y me asusto."],
  ["Una «perra gorda» eran 10 céntimos de peseta, y una «perra chica», 5.","Con una perra gorda me compraba un cucurucho de pipas."],
  ["Un «real» eran 25 céntimos de peseta.","Por eso decíamos «no tengo un real»."],
  ["La peseta duró más de 130 años: nació en 1868 y se despidió en 2002.","Más años que yo, y mira que tengo."],
  ["El billete verde de 1.000 pesetas llevaba la cara de Galdós.","Un billete de esos era una fortuna en mi casa."]
],

/* Efemérides: "MM-DD": [[año, texto, comentario]] */
efemerides: {
  "01-01":[[2002,"Los euros llegan a los bolsillos y empieza el adiós a la peseta.","Me pasé meses con la calculadora en el bolso."],[1986,"España entra en la Comunidad Económica Europea.","Y nos hicimos europeos de golpe."]],
  "02-28":[[2002,"La peseta deja de ser moneda de curso legal.","Todavía tengo un duro en el monedero, por si acaso."]],
  "04-20":[[1992,"Abre sus puertas la Exposición Universal de Sevilla.","Fui con tu abuelo en el AVE nuevo."]],
  "04-21":[[1992,"Empieza a funcionar el AVE entre Madrid y Sevilla.","¡Qué rápido! Me mareé un poco."]],
  "06-12":[[1985,"España firma su adhesión a la Comunidad Europea.","Seis meses después ya éramos europeos."]],
  "07-11":[[2010,"España gana el Mundial de fútbol en Sudáfrica.","Salí al balcón con la cacerola."]],
  "07-20":[[1969,"El ser humano pisa la Luna por primera vez.","Lo vimos en la tele del bar, todo el barrio."]],
  "07-25":[[1992,"Se inauguran los Juegos Olímpicos de Barcelona.","Lo de la flecha encendiendo el pebetero, inolvidable."]],
  "10-12":[[1492,"Colón llega a América.","Eso ya no lo vi yo, que conste."]],
  "10-19":[[1868,"Nace la peseta como moneda de España.","Ni mi abuela había nacido."]],
  "11-09":[[1989,"Cae el Muro de Berlín.","Lo vi en el telediario con el corazón encogido."]]
},

/* Santoral (santo principal del día en el calendario español) */
santos: {
  "01-01":"Santa María, Madre de Dios","01-06":"la Epifanía del Señor (los Reyes)","01-17":"San Antón","01-20":"San Sebastián","01-21":"Santa Inés","01-22":"San Vicente","01-24":"San Francisco de Sales","01-25":"la Conversión de San Pablo","01-28":"Santo Tomás de Aquino","01-31":"San Juan Bosco",
  "02-02":"la Candelaria","02-03":"San Blas","02-05":"Santa Águeda","02-10":"Santa Escolástica","02-11":"la Virgen de Lourdes","02-14":"San Valentín","02-22":"la Cátedra de San Pedro",
  "03-08":"San Juan de Dios","03-17":"San Patricio","03-19":"San José","03-25":"la Anunciación",
  "04-02":"San Francisco de Paula","04-23":"San Jorge","04-25":"San Marcos","04-29":"Santa Catalina de Siena",
  "05-01":"San José Obrero","05-03":"San Felipe y Santiago","05-13":"la Virgen de Fátima","05-15":"San Isidro Labrador","05-22":"Santa Rita","05-26":"San Felipe Neri","05-30":"San Fernando","05-31":"la Visitación de la Virgen",
  "06-11":"San Bernabé","06-13":"San Antonio de Padua","06-21":"San Luis Gonzaga","06-24":"San Juan Bautista","06-29":"San Pedro y San Pablo",
  "07-03":"Santo Tomás apóstol","07-07":"San Fermín","07-11":"San Benito","07-16":"la Virgen del Carmen","07-22":"Santa María Magdalena","07-25":"Santiago Apóstol","07-26":"San Joaquín y Santa Ana","07-29":"Santa Marta","07-31":"San Ignacio de Loyola",
  "08-04":"San Juan María Vianney","08-06":"la Transfiguración del Señor","08-08":"Santo Domingo de Guzmán","08-10":"San Lorenzo","08-11":"Santa Clara","08-15":"la Asunción de la Virgen","08-16":"San Roque","08-20":"San Bernardo","08-24":"San Bartolomé","08-27":"Santa Mónica","08-28":"San Agustín",
  "09-08":"la Natividad de la Virgen","09-14":"la Exaltación de la Santa Cruz","09-15":"la Virgen de los Dolores","09-21":"San Mateo","09-27":"San Vicente de Paúl","09-29":"los arcángeles Miguel, Gabriel y Rafael","09-30":"San Jerónimo",
  "10-01":"Santa Teresa del Niño Jesús","10-02":"los Ángeles Custodios","10-04":"San Francisco de Asís","10-07":"la Virgen del Rosario","10-12":"la Virgen del Pilar","10-15":"Santa Teresa de Jesús","10-18":"San Lucas","10-28":"San Simón y San Judas",
  "11-01":"Todos los Santos","11-02":"los Fieles Difuntos","11-03":"San Martín de Porres","11-04":"San Carlos Borromeo","11-09":"la Virgen de la Almudena","11-10":"San León Magno","11-11":"San Martín de Tours","11-13":"San Diego de Alcalá","11-17":"Santa Isabel de Hungría","11-22":"Santa Cecilia","11-25":"Santa Catalina de Alejandría","11-30":"San Andrés",
  "12-03":"San Francisco Javier","12-06":"San Nicolás","12-08":"la Inmaculada Concepción","12-12":"la Virgen de Guadalupe","12-13":"Santa Lucía","12-14":"San Juan de la Cruz","12-25":"la Navidad","12-26":"San Esteban","12-27":"San Juan Evangelista","12-28":"los Santos Inocentes","12-31":"San Silvestre"
},

/* Fiestas: "MM-DD" (todos los años) o "AAAA-MM-DD" (móviles). donde = a quién felicita; ambito: nacional, autonómica o local */
fiestas: {
  "01-01":[{ambito:"nacional",donde:"toda España",nombre:"Año Nuevo",msg:"¡Feliz año nuevo a toda España! Hoy ni se mira el recibo: resaca de uvas y a descansar."}],
  "01-06":[{ambito:"nacional",donde:"toda España",nombre:"los Reyes",msg:"¡Felices Reyes! Que os traigan carbón… del dulce, que el de verdad está carísimo."}],
  "01-20":[{ambito:"local",donde:"San Sebastián",nombre:"la Tamborrada",msg:"¡Zorionak, donostiarras! Hoy, tamborrada veinticuatro horas seguidas. Tapones para los oídos y a desfilar."}],
  "01-22":[{ambito:"local",donde:"la ciudad de Valencia",nombre:"San Vicente Mártir",msg:"Felicidades a los valencianos de la capital por San Vicente Mártir, su patrón."}],
  "02-28":[{ambito:"autonómica",donde:"Andalucía",nombre:"el Día de Andalucía",msg:"¡Felicidades, andaluces! Hoy, pan con aceite en el desayuno y la verdiblanca en el balcón."}],
  "03-01":[{ambito:"autonómica",donde:"las Islas Baleares",nombre:"el Día de las Illes Balears",msg:"¡Molts d'anys a las Baleares en su día! Una ensaimada para celebrarlo, que engorda pero alegra."}],
  "03-19":[{ambito:"autonómica",donde:"la Comunitat Valenciana",nombre:"San José y las Fallas",msg:"Felicidades a los Pepes y a las Pepas, y a los valencianos, que esta noche queman las fallas. ¡Y feliz Día del Padre!"}],
  "04-23":[{ambito:"autonómica",donde:"Aragón y Castilla y León",nombre:"San Jorge y Villalar",msg:"Felicidades a Aragón por San Jorge y a Castilla y León en su día. Y feliz Día del Libro: leer es de lo poco que sigue siendo gratis."}],
  "05-01":[{ambito:"nacional",donde:"toda España",nombre:"el Día del Trabajo",msg:"¡Feliz Día del Trabajo! Que hoy descanse quien pueda, que bien ganado lo tiene."}],
  "05-02":[{ambito:"autonómica",donde:"la Comunidad de Madrid",nombre:"el Dos de Mayo",msg:"¡Felicidades, madrileños, por el Dos de Mayo! Churros con chocolate y paseo por Malasaña, como Dios manda."}],
  "05-15":[{ambito:"local",donde:"la ciudad de Madrid",nombre:"San Isidro",msg:"¡Felicidades a los madrileños por San Isidro! Rosquillas tontas y listas, mantón y a la pradera."}],
  "05-17":[{ambito:"autonómica",donde:"Galicia",nombre:"el Día das Letras Galegas",msg:"Feliz Día das Letras Galegas a toda Galicia. Hoy, un poema de Rosalía y una buena empanada."}],
  "05-30":[{ambito:"autonómica",donde:"Canarias",nombre:"el Día de Canarias",msg:"¡Feliz Día de Canarias! Papas arrugadas con mojo: las papas están baratas, así que doble ración."}],
  "05-31":[{ambito:"autonómica",donde:"Castilla-La Mancha",nombre:"el Día de Castilla-La Mancha",msg:"¡Felicidades, castellano-manchegos! Pisto, queso de la tierra y un vinito, que hoy se puede."}],
  "06-09":[{ambito:"autonómica",donde:"la Región de Murcia y La Rioja",nombre:"su día",msg:"Felicidades a murcianos y riojanos en su día: paparajotes en Murcia y un buen tinto en La Rioja. ¡Qué envidia me dais!"}],
  "06-24":[{ambito:"autonómica",donde:"Cataluña",nombre:"Sant Joan",msg:"Bon Sant Joan! Que la coca y la verbena de anoche no os pesen mucho."}],
  "07-07":[{ambito:"local",donde:"Pamplona",nombre:"San Fermín",msg:"¡Viva San Fermín! A los pamplonicas: pañuelo rojo, mucha alegría y cuidadito con los toros."}],
  "07-25":[{ambito:"autonómica",donde:"Galicia",nombre:"el Día de Galicia y Santiago Apóstol",msg:"¡Feliz Día de Galicia! Pulpo á feira, y que el Apóstol os bendiga a todos."}],
  "08-15":[{ambito:"nacional",donde:"toda España",nombre:"la Virgen de agosto",msg:"Hoy es la Virgen de agosto y medio país está de fiestas en el pueblo. ¡Disfrutad, que en septiembre vuelve la cuesta!"}],
  "09-02":[{ambito:"autonómica",donde:"Ceuta",nombre:"el Día de Ceuta",msg:"¡Felicidades a los ceutíes en su día!"}],
  "09-08":[{ambito:"autonómica",donde:"Asturias y Extremadura",nombre:"la Santina y el Día de Extremadura",msg:"Felicidades a los asturianos por la Santina de Covadonga y a los extremeños en su día. Fabada y migas: ¡qué día de comer!"}],
  "09-11":[{ambito:"autonómica",donde:"Cataluña",nombre:"la Diada",msg:"Bona Diada a tots els catalans! Hoy, pa amb tomàquet para desayunar."}],
  "09-15":[{ambito:"autonómica",donde:"Cantabria",nombre:"la Bien Aparecida",msg:"¡Felicidades, cántabros, por la Bien Aparecida! Unas anchoas y un sobao para celebrarlo."}],
  "09-24":[{ambito:"local",donde:"Barcelona",nombre:"La Mercè",msg:"Feliç Mercè, barcelonins! Castellers, gigantes y correfoc. Yo lo veo por la tele, que ya no estoy para carreras."}],
  "10-09":[{ambito:"autonómica",donde:"la Comunitat Valenciana",nombre:"el 9 d'Octubre",msg:"¡Feliz 9 d'Octubre, valencianos! Hoy toca mocadorà: dulces de mazapán para quien más quieres."}],
  "10-12":[{ambito:"nacional",donde:"toda España",nombre:"la Fiesta Nacional y el Pilar",msg:"¡Feliz Fiesta Nacional! Y felicidades a las Pilares y a los maños, que hoy llevan flores a la Virgen."}],
  "11-01":[{ambito:"nacional",donde:"toda España",nombre:"Todos los Santos",msg:"Día de Todos los Santos: flores para los que no están y huesos de santo para los que sí."}],
  "11-09":[{ambito:"local",donde:"la ciudad de Madrid",nombre:"la Almudena",msg:"¡Felicidades a los madrileños de la capital! Hoy es la Almudena, su patrona: corona de la Almudena con el café y paseíto hasta la catedral."}],
  "12-03":[{ambito:"autonómica",donde:"Navarra",nombre:"San Francisco Javier",msg:"Felicidades a los navarros por San Francisco Javier. Unas pochas y un pacharán… pequeñito."}],
  "12-06":[{ambito:"nacional",donde:"toda España",nombre:"el Día de la Constitución",msg:"¡Feliz Día de la Constitución! Yo la voté en el 78, con mi abrigo nuevo."}],
  "12-08":[{ambito:"nacional",donde:"toda España",nombre:"la Inmaculada",msg:"Hoy es la Inmaculada: puente para muchos y a montar el belén."}],
  "12-25":[{ambito:"nacional",donde:"toda España",nombre:"Navidad",msg:"¡Feliz Navidad a todos! Que no falte nadie en la mesa, aunque falte algo en la nevera."}],
  "2027-03-25":[{ambito:"autonómica",donde:"casi toda España",nombre:"Jueves Santo",msg:"Jueves Santo: torrijas, procesiones y a descansar, que el puente es largo."}],
  "2027-03-26":[{ambito:"nacional",donde:"toda España",nombre:"Viernes Santo",msg:"Viernes Santo: hoy, potaje de vigilia y bacalao, que sale más barato que la carne."}],
  "2027-03-29":[{ambito:"autonómica",donde:"Cataluña, la Comunitat Valenciana, Baleares, Navarra, el País Vasco y La Rioja",nombre:"el Lunes de Pascua",msg:"¡Feliz Lunes de Pascua! A comerse la mona con los nietos."}]
},

/* Recetas para el consejo de cocina: ing = ingredientes que se miran en la cesta */
recetas: [
  {n:"Tortilla de patatas",ing:["patata","huevos","cebolla","aceite"],t:"Con cebolla o sin cebolla, eso ya lo discutís vosotros."},
  {n:"Patatas a la riojana",ing:["patata","ajos","cebolla"],t:"Con un poquito de chorizo y pimentón, de cuchara."},
  {n:"Crema de zanahoria",ing:["zanahoria","patata","cebolla","leche"],t:"Calentita, para las noches de noviembre."},
  {n:"Puré de verduras",ing:["zanahoria","patata","cebolla"],t:"Para cenar ligero y que no cueste nada."},
  {n:"Arroz con leche",ing:["arroz","leche","limon"],t:"Con su corteza de limón y canela por encima."},
  {n:"Manzanas asadas",ing:["manzana"],t:"Al horno, con un poco de azúcar. Postre de toda la vida."},
  {n:"Peras al vino",ing:["peras"],t:"Con vino tinto y canela. Para los domingos."},
  {n:"Sopa de ajo",ing:["ajos","huevos","aceite"],t:"Con pan del día anterior y un huevo escalfado."},
  {n:"Natillas caseras",ing:["leche","huevos"],t:"Con su galleta encima, como las de mi madre."},
  {n:"Torrijas",ing:["leche","huevos","aceite"],t:"Aprovechando el pan duro. ¿Quién dijo que solo en Semana Santa?"},
  {n:"Rosquillas de anís",ing:["harina","huevos","aceite","limon"],t:"Para merendar con los nietos."},
  {n:"Macarrones con tomate",ing:["macarrones","cebolla","ajos"],t:"Con su sofrito y queso rallado. Los niños, felices."},
  {n:"Ensalada de la huerta",ing:["lechuga","cebolla","aceite"],t:"Con un buen chorrito de aceite, si el bolsillo lo permite."},
  {n:"Arroz a la cubana",ing:["arroz","huevos","ajos"],t:"Con huevo frito y tomate. Rápido y barato."},
  {n:"Sopa de cebolla",ing:["cebolla","harina"],t:"Con pan tostado y queso gratinado."},
  {n:"Bizcocho de limón",ing:["harina","huevos","aceite","limon"],t:"Del de toda la vida, con el vasito de yogur como medida."},
  {n:"Pollo al ajillo",ing:["muslo","ajos","aceite"],t:"Con su vasito de vino blanco y pan para mojar."},
  {n:"Arroz con pollo",ing:["arroz","muslo","cebolla","zanahoria"],t:"Un plato que da para toda la familia."},
  {n:"Cocido madrileño",ing:["jamon","patata","zanahoria"],t:"Sopa, garbanzos y la carne: tres vuelcos y a dormir la siesta."},
  {n:"Lomo con patatas",ing:["jamon","patata","ajos"],t:"Lomo a la plancha con patatas panaderas."},
  {n:"Filete con patatas fritas",ing:["filete","patata","aceite"],t:"El capricho del domingo, si el bolsillo lo permite."},
  {n:"Merluza en salsa verde",ing:["pescado","ajos","harina"],t:"Con perejil y unas almejitas si hay fiesta."},
  {n:"Gambas al ajillo",ing:["gamba","ajos","aceite"],t:"En cazuela de barro, y pan para la salsa."},
  {n:"Macarrones gratinados",ing:["macarrones","queso","cebolla"],t:"Con su queso por encima, al horno hasta que se dore."},
  {n:"Migas",ing:["pan","ajos","aceite"],t:"Con el pan del día anterior. Nada se tira en esta casa."},
  {n:"Flan de huevo",ing:["huevos","leche","azucar"],t:"Con caramelo hecho en el cazo, como el de mi madre."},
  {n:"Caldereta de cordero",ing:["chuleta","patata","cebolla"],t:"A fuego lento, para un día de frío."}
]
};
