// ==UserScript==
// @description    e-konsulat.gov.pl
// @include        https://secure.e-konsulat.gov.pl/*
// ==/UserScript==
// v002@2012-04-18, 2012-04-19

site = 'https://secure.e-konsulat.gov.pl/'

Gorod = 'Брест' //Гродно, Минск, или закоментировать, или удалить для выбора города на сайте

/**** Регистрация бланка 
 ****/

//Вид деятельности Выбор из списка Допускаются только значения из списка.
//vid = 'ПОКУПКИ'
//vid = 'ТУРИЗМ'
vid = 'ГОСТ'

//Срок, когда деятельность даст выбор даты
Srok = '' //'2012-05-11'

/**** Форма заполнения. Выдать звонки и лабать вручную или же из Excel
 ****/
Forma = '' //'звонить' -- руками, пусто -- Excel
BPEM9 = 777 // время заполнения одного элемента


                                //к//о//д//и//н//г//

siteRegBlank = 'https://secure.e-konsulat.gov.pl/Uslugi/RejestracjaTerminu.aspx?IDUSLUGI=8&idpl=0'
siteGorod = 'https://secure.e-konsulat.gov.pl/Informacyjne/Placowka.aspx'
siteForm = 'https://secure.e-konsulat.gov.pl/Wiza/FormularzWiza_2.aspx?tryb=REJ'
siteFormP = 'https://secure.e-konsulat.gov.pl/Wiza/FormularzWiza_2.aspx'

// "siteRegBlank"
id_vid = 'ctl00_ContentPlaceHolder1_cbRodzajUslugi'
postVid = "__doPostBack('ctl00$ContentPlaceHolder1$cbRodzajUslugi','')"

id_Srok = 'ctl00_ContentPlaceHolder1_cbTermin'
postSrok = "__doPostBack('ctl00$ContentPlaceHolder1$cbTermin','')"

id_Bron = 'ctl00_ContentPlaceHolder1_btnRezerwuj'

unsafeWindow.checkSel = function(sel, val, postHndlr, desc, prevID) {
	
if (typeof val == 'undefined') {
	_log("Не указан параметр для '" + desc +"', берём первое из списка.")
} else if ('' == val) {
	_log("Не указан параметр для '" + desc +"', берём первое из списка.")
}  // запускаем даже для пустого параметра
unsafeWindow.waitLenZero(sel, val, postHndlr, prevID)

}

// "site" first page 

plac = 'ctl00_tresc_cbListaPlacowek'
postPlac = "__doPostBack('ctl00$tresc$cbListaPlacowek','')"
postKraj = "__doPostBack('ctl00$tresc$cbListaKrajow','')"

unsafeWindow.checkRegion = function() {
	setTimeout(postKraj, 0)

if (typeof Gorod == 'undefined') {
	menuRegion(plac, q(postPlac))
} else if ('' == Gorod) {
	menuRegion(plac, q(postPlac))
} else { // if string and full
	unsafeWindow.waitLenZero(plac, Gorod, postPlac)
}
}

unsafeWindow.zeroFy = function(el, val, cb, d) {
	var pEl = gi(el), 	ev = document.createEvent("HTMLEvents")
	
	if (!pEl || !ev) return

	ev.initEvent("change", true, true )
	pEl.selectedIndex = 0
	pEl.focus()
	_log("повторяем попытку для " + d + " : " + Date())
	pEl.dispatchEvent(ev)
}

playAlert = function () {
_log("подъём!!! ")
	var span = document.createElement("span")
		,url = "http://img404.imageshack.us/img404/7740/audiouq4.swf?audioUrl="+escape('http://www.fehers.com/files/download.php?id=Alarm_Clock_Bell_Runs.mp3') +'&autoPlay=true'
		,width = 320
		,height = 27
	span.innerHTML = "<object type=\"application/x-shockwave-flash\"\n"
					+"data=\""+url+"\" \n"
					+"width=\""+width+"\" height=\""+height+"\">\n"
					+"<param name=\"movie\" \n"
					+"value=\""+url+"\" />\n"
					+"<param name=\"wmode\" \n"
					+"value=\"transparent\" />\n"
					+"</object>\n"
	gi("llogg").appendChild(span);
}

unsafeWindow.selOption = function (el, val, cb) {
	var myse = gi(el)
		,i = 1
	if (!myse) return false
try {
	myse.focus()
	
	if(val) for (i = 0; i<myse.options.length; i++){
		if (RegExp(val).test(myse.options[i].text)){
//console.log(i + ": " + myse.options[i].text)
			break
		}
	}
	myse.selectedIndex = i
	if(cb) setTimeout(cb, 0) 

} catch (e) { alert ("Случилась херь: " + e)}
	return false
}

fireTick = function(fun, el, val, cb, d, pid, dt) {
	setTimeout(fun + "('"+el+"','" +val+"','"+q(cb)+"','"+d+"','"+pid+"')", 777 + parseInt(dt ? dt : 0))
}

unsafeWindow.waitLenZero = function(el, val, cb, pid) {
	var myse = gi(el)
	//alert(el)
	if (!myse) return false
try {
	scrollTo(111,1111)
	if (/disab|true/.test(myse.getAttribute("disabled"))) {
		var pEl = gi(pid)
		
		if (pEl) pEl.focus()
		
		/*
		confirm("Элемент недоступен. Нужны другие параметры или другое время\n"+
				    "Пробовать ещё?\n\n[" +el+ "] pid: " + pid)
		*/
		
		if(true) {
			if (!pEl) {
				_log("Не указан предыдущий элемент заполнения")
				return
			}
			if (!pEl) return
			_log("ждём время " + (7777+777)/1000 + " сек")
			
			fireTick("zeroFy", pid, '', '', "ВИД УСЛУГИ", id_vid, 4444)
		}
		return
	}

	if (myse.length > 0) {
		unsafeWindow.selOption(el, val, cb)
	} else {
		setTimeout("waitLenZero('"+el+"','" +val+"','"+q(cb)+"','"+pid+"')", 777)
	}
} catch (e) { alert ("Случилась херь2: " + e)}
}

setV = function(n, v) {
	document.cookie = n + "=" + encodeURIComponent(v) + "; path=/"
if ('v1' == n) {
	if(!v) {// start
		if (unsafeWindow.fillData) {
			_log("Продолжаем заполнять через пару сек.")
			setTimeout('popFillData()', 2222)
		} else {
			alert('Автозаполнение включено!')
			location.reload()
		}
	} else {			
		setV('Gorod', '')
	}
}
}
getV = function(n) {
	var m = decodeURIComponent(document.cookie).match(RegExp(n + "=([^;]+)"))
	return m ? m[1].split(/,/) : ''
}
unsafeWindow.setV = setV
unsafeWindow.getV = getV
/*
 *** вход ****
 */
startFun = function () {

	_cfg()

if (_ctl())
	return

if (window.location.href == site ||
    window.location.href == site + "default.aspx") {
//первая страница, выбор страны, города
	var i = 0, myse=gi("ctl00_tresc_cbListaKrajow")
	for (; i<myse.options.length; i++){
		if (/Беларусь|Belarus/.test(myse.options[i].text)){
			myse.selectedIndex = i
			break
		}
	}
	
	setTimeout('checkRegion()', 0)

} else if (window.location.href == siteRegBlank) {
	var i = 0, myse = gi(id_vid)
	if (myse) {
if(myse.selectedIndex <= 0) {
	for (; i < myse.options.length; i++) {
		if (RegExp(vid).test(myse.options[i].text)) {
			break
		}
	}
	myse.focus()
	myse.selectedIndex = i
	myse.dispatchEvent(mkChange())
	//setTimeout(postVid, 0)
} else {
	myse = gi(id_Srok)
	if (!myse) return
	
	if(myse.selectedIndex <= 0) {
		myse.focus()
		fireTick("checkSel", id_Srok, Srok, postSrok, "CРОК (после ВИД УСЛУГИ)", id_vid)
	} else {
	_log("Бронь")
		myse = gi(id_Bron)
		if (!myse) return
		myse.focus()
		myse.dispatchEvent(mkClick())
	}
}
} else {
var el = gi('ctl00_ContentPlaceHolder1_KomponentObrazkowy_VerificationID')
if (el) el.focus()
_log("<br/>Нужно вбить содержимое картинки в поле ввода. Я уж тут не могу помочь.")
}
} else if(window.location.href == siteForm ||
		  window.location.href == siteFormP) {
	playAlert()
	if (/звонить/.test(Forma)) {
		var nn = 0
		setTimeout(playAlert, 14000*(nn++)) ; setTimeout(playAlert, 14000*(nn++))
		setTimeout(playAlert, 14000*(nn++)) ; setTimeout(playAlert, 14000*(nn++))
		setTimeout(playAlert, 14000*(nn++)) ; setTimeout(playAlert, 14000*(nn++))
		setTimeout(playAlert, 14000*(nn++)) ; setTimeout(playAlert, 14000*(nn++))
	} else { // create textarea, ask for ctrl+c ctrl + v, press ok
		_formData()
	}
} else if(window.location.href == siteGorod) {
window.location.href = siteRegBlank
}
}

function menuRegion(p, pcb) {
	var s = site + "#", n = 1
	    ,x = document.createElement("div")
	x.setAttribute("style","font-size:22pt; background-color:blue;position:fixed;top:7px;left:7px;z-index:7777;")
	x.innerHTML='<b style="color:white">Хочу подать заявку на:</b>' +
	'<a href="#1" onclick="javascript:waitLenZero(\''+p+'\',\'Брест|Brest\',\''+pcb+'\')" style="padding:4px;color: rgb(119, 255, 119);">[ Брест ]</a>' +
	'<a href="#2" onclick="javascript:waitLenZero(\''+p+'\',\'Гродн|Grodn\',\''+pcb+'\')" style="padding:4px;color: rgb(119, 255, 119);">[ Гродно ]</a>' +
	'<a href="#3" onclick="javascript:waitLenZero(\''+p+'\',\'Минск|Minsk\',\''+pcb+'\')" style="padding:4px;color: rgb(119, 255, 119);">[ Минск ]</a>'
	document.getElementsByTagName('body')[0].appendChild(x);
}

_log = function (msg) {
	var x = gi("llogg")
if (!x) {
	x = document.createElement("div")
	x.setAttribute("style","font-size:12pt; background-color:red;position:fixed;top:33px;left:7px;z-index:7777;padding:7px")
	x.setAttribute("id","llogg")
	x.innerHTML='<b style="color:white">'+msg+'</b>'
	document.getElementsByTagName('body')[0].appendChild(x)
} else {
x.innerHTML+='<b style="color:white">'+msg+'</b>'
}
}

_ctl = function () {
	function inHtml(m) {
		//var e ='enabled="true"', b = 'disabled="false"'
		//if (m) { b ='enabled="true"', e = 'disabled="false"' }
		
		var e ='style="font-weight:bold;color:red"', b = ''
		if (m) { b ='style="font-weight:bold;color:green"'; e = '' }
return '<input value ="Начать" '+b+' onclick="javascript:setV(\'v1\', \'\')" id="idStart" type="button" />'+
	   '<b style="color:white">:) Автозаполнение (:</b>'+
	   '<input value="Остановить" '+e+' onclick="javascript:setV(\'v1\', \'stop\')" id="idStop" type="button" />'
	}
	var x = gi("cctll"), ctl = getV("v1")
if (!x) {
	x = document.createElement("div")
	x.setAttribute("style","font-size:12pt; background-color:orange;position:fixed;top:7px;left:7px;z-index:7777;padding:4px")
	x.setAttribute("id","cctll")
	x.innerHTML=inHtml(ctl)
	document.getElementsByTagName('body')[0].appendChild(x)
} else {
x.innerHTML+=inHtml(ctl)
}
	return ctl
}


unsafeWindow.plWizaCfg= function () {
try {
	var x = gi("ccfgg")
		,rows = x.value.split('\n')
		,i = /Настро/.test(rows[0]) ? 0 : -1
	setV('Gorod', Gorod)

	while (++i < rows.length) {
		var cols = rows[i].split('\t')
		if (/Город/.test(cols[0])) {
			Gorod = cols[1]
			setV('Gorod', Gorod)
		} else if (/Вид/.test(cols[0])) {
			vid = cols[1]
			setV('vid', vid)
		} else if (/Срок/.test(cols[0])) {
			Srok = cols[1]
			setV('Srok', Srok)
		} else if (/Время/.test(cols[0])) {
			BPEM9 = cols[1]
			setV('BPEM9', BPEM9)
		}
	}
	setV('v1', '')
} catch (e) { alert ("Случилась херь4: " + e)}
}

_cfg = function() {
	if(getV('Gorod')) {
		var v
		Gorod = getV('Gorod')
		v = getV('vid')
		if(v) vid = v
		v = getV('Srok')
		if(v) Srok = v
		v = getV('BPEM9')
		if(v) BPEM9 = v
		return
	}
	setV('v1', 'stop')

	var x = gi("ctl00_ddlWersjeJezykowe"), t
	for (t = 0; t<x.options.length; t++){
		if (/Русск/.test(x.options[t].text)){
			if (x.selectedIndex !== t) {
				x.selectedIndex = t
				x.dispatchEvent(mkChange())
				return
			}
			break
		}
	}

	_log("<br/><b style='color:black'>Настройки. По умолчанию или скопировать из <b style='color:lightgreen'>Excel</b> <b style='color:white'>CTRL+C</b> вставить <b style='color:blue'>здесь</b> <b style='color:white'>CTRL+V</b>.</b><br/>"+
	'<input value="Настроить" onclick="javascript:plWizaCfg()" id="idCgf" type="button" /> Сбрасываются, если [Остановить].'+
	"<br/>")
	x = gi("llogg")
if (!x) {
	alert("Произошла херь!")
	return
}
	t = document.createElement("textarea")
	t.setAttribute("style","font-size:8pt;background-color:blue")
	t.setAttribute("id","ccfgg")
	t.setAttribute("cols","55")
	t.setAttribute("rows","3")
	x.appendChild(t)
}

unsafeWindow.plVizaFillForm = function(){
try {
	var x = gi("plvizaformData")
		,rows = x.value.split('\n')
		,i = 0
	unsafeWindow.fillData = []
	while (++i < rows.length) {
		var cols = rows[i].split('\t'), elId = cols[0], el
if (elId) {
		if (/^[?]focus/.test(elId)) {
//console.log('radio | check id=: "' + elId + '"')
			elId = elId.replace(/^.* ([^ ]+$)/g,'$1')
			if (elId) {
				el= gi(elId)
if (!el) {
	alert("Не найден ?focus элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
	return
}
				//el.focus()
				unsafeWindow.fillData.push(elId + " focus")
			}
		} else if (/^[?]check/.test(elId) && cols[3]) {
			elId = elId.replace(/^.* ([^ ]+$)/g,'$1')
			if (elId) {
				el= gi(elId)
if (!el) {
	alert("Не найден ?checkbox элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
	return
}
				if(cols[3].trim()) {
					unsafeWindow.fillData.push(elId + " check")
					//el.setAttribute("checked", "true");
					//el.dispatchEvent(mkChange())
				}
			}
		} else if (/^[?]radio/.test(elId) && cols[3]) {
			elId = cols[3].replace(/^.* ([^ ]+$)/g,'$1')
//console.log('radio | check id=: "' + elId + '"')
			if (elId) {
				el= gi(elId)
if (!el) {
	alert("Не найден ?radio элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
	return
}
				//el.checked = true
				//el.setAttribute("checked", "true")
				//el.dispatchEvent(mkChange())
				unsafeWindow.fillData.push(elId + " radio")
			} else {
				alert("Не найден ID! Что-то в данных Excel не то. Не могу заполнять.\n\ni="+i+"\ncols[3]="+cols[3])
				return
			}
		} else if (!/^[?]/.test(elId) && cols[3]) {
			el= gi(elId)
			if (!el) {
				alert("Не найден элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
				return
			}
			if (/_dd/.test(elId)) { //select
				var j = 0
				while (++j < el.options.length) {
					if (RegExp(cols[3]).test(el.options[j].text)) {
						//el.selectedIndex = j
						
						unsafeWindow.fillData.push(elId + " select " + j)
						
						break
					}
				}
			} else { //простой текст
				//el.setAttribute("value", cols[3]);
				unsafeWindow.fillData.push([ elId + " txt", cols[3]])
			}
			//el.dispatchEvent(mkChange())
		}
} // else break; //до первой пустой строки idшников
	}
	x.parentNode.parentNode.removeChild(x.parentNode)
	_log("<br/>Подгрузили. Запускаем заполнялку, BPEM9 = " + BPEM9)
	unsafeWindow.popFillData()
} catch (e) { alert ("Случилась херь3: " + e)}
}

unsafeWindow.fillData = null
unsafeWindow.dataJ = 0
unsafeWindow.BPEM9 = BPEM9
unsafeWindow.popFillData = function() {
	var el, s, d = unsafeWindow.fillData[unsafeWindow.dataJ]
	if (!d || getV("v1")) return
	if (typeof d != 'string') {
		s = d[0].split(' ')
	} else s = d.split(' ')
	
	el= gi(s[0])
	if (!el) return
	
	el.focus()
	
	if ('txt' == s[1]) {
		el.setAttribute("value", d[1]);
	} else if('select' == s[1]) {
		el.selectedIndex = parseInt(s[2])
	} else if('radio' == s[1]) {
		el.setAttribute("checked", "true");
	} else if('check' == s[1]) {
		el.setAttribute("checked", "true")
	} else if('focus' == s[1]) {
		unsafeWindow.dataJ = null
		unsafeWindow.fillData = null
		return
	}
	el.dispatchEvent(mkChange())
	++unsafeWindow.dataJ
	setTimeout('popFillData()', BPEM9)
}

_formData = function () {
	_log("<br/><b style='color:black'>Данные для заполненения. Cкопировать в <b style='color:lightgreen'>Excel</b> <b style='color:white'>CTRL+C</b> вставить <b style='color:blue'>здесь</b> <b style='color:white'>CTRL+V</b>.</b><br/>"+
	'<input value="Внести" onclick="javascript:plVizaFillForm()" id="idFill" type="button" />'+
	"<br/>")
	var x = gi("llogg"), t
if (!x) {
	alert("Произошла херь!")
	return
}
	t = document.createElement("textarea")
	t.setAttribute("style","font-size:8pt;background-color:blue")
	t.setAttribute("id","plvizaformData")
	t.setAttribute("cols","55")
	t.setAttribute("rows","3")
	x.appendChild(t)
}

var GM_JQ = document.createElement('script');

//урл, где лежит сторонняя библиотека:
GM_JQ.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js';
GM_JQ.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(GM_JQ);

//http://www.uncleflag.com/v/vspfiles/assets/images/jolly%20roger%20animated.gif
//link href="ico.gif" TYPE="image/gif" REL="icon"
// Check if jQuery's loaded
function GM_wait() {
_log("тынц...")
    if(typeof unsafeWindow.jQuery == 'undefined') {
		unsafeWindow.setTimeout(GM_wait, 777)
	}
    else {
		$ = unsafeWindow.jQuery;
        jQuery = unsafeWindow.jQuery;
        letsJQuery(); 
	}
}

function gi(i){return document.getElementById(i)};
function q(s){ return s ? String(s).replace(/'/g, "\\'") : ''}
function mkClick() {
	var ev = document.createEvent("MouseEvents")
	ev.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
	return ev
}

function mkChange() {
	var ev = document.createEvent("HTMLEvents");
	ev.initEvent("change", true, true );
	return ev
}

GM_wait();

function letsJQuery() {
    $(document).ready(startFun)
}
//olecom: pl_wiza.user.js ends here
