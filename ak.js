// @name           plwiza_ak
// @version        004
// @author         olecom
// @description    ak for plwiza.user.js

// v002@2012-04-18, 2012-04-19
// v003@2012-04-20  https://addons.mozilla.org/ru/firefox/addon/scriptish/
//                  ak
// v004@2012-05-13  ids back in xls, demo left here

(function(w, unWin){ try {
/**** Главная страница консульства
 ****/
//'Брест' //Гродно, Минск, или закоментировать, или удалить для выбора города на сайте
Gorod = "\u0411\u0440\u0435\u0441\u0442" //Brest

/**** Регистрация бланка
 ****/

//Вид деятельности Выбор из списка Допускаются только значения из списка.
//vid = 'ПОКУПКИ'
//vid = 'ТУРИЗМ'
//vid = 'ГОСТ'
vid = "\u0413\u041e\u0421\u0422" //Guest

//Срок, когда деятельность даст выбор даты
//Srok = '' //'2012-05-11'
Srok = '' //'2012-05-11'

/**** Форма заполнения. Выдать звонки и лабать вручную или же из Excel
 ****/
Forma = '' //'звонить' -- руками, пусто -- Excel
BPEM9 = 77 // время заполнения одного элемента

                                //к//о//д//и//н//г//
var	site = 'https://secure.e-konsulat.gov.pl/'
	,siteRegBlank = site + 'Uslugi/RejestracjaTerminu.aspx?IDUSLUGI=8&idpl=0'
	,siteGorod = site + 'Informacyjne/Placowka.aspx'
	,siteForm  = site + 'Wiza/FormularzWiza_2.aspx?tryb=REJ'
	,siteFormP = site + 'Wiza/FormularzWiza_2.aspx'

// "siteRegBlank"
	,id_vid = 'ctl00_ContentPlaceHolder1_cbRodzajUslugi'
	,postVid = "__doPostBack('ctl00$ContentPlaceHolder1$cbRodzajUslugi','')"

	,id_Srok = 'ctl00_ContentPlaceHolder1_cbTermin'
	,postSrok = "__doPostBack('ctl00$ContentPlaceHolder1$cbTermin','')"

	,id_Bron = 'ctl00_ContentPlaceHolder1_btnRezerwuj'
	,dela = 'http://dela.by/plwiza/' // alert utility

unWin.checkSel = function(sel, val, postHndlr, desc, prevID) {
	
if (typeof val == 'undefined') {
	_log("Не указан параметр для '" + desc +"', берём первое из списка.")
} else if ('' == val) {
	_log("Не указан параметр для '" + desc +"', берём первое из списка.")
}  // запускаем даже для пустого параметра
unWin.waitLenZero(sel, val, postHndlr, prevID)
}

// "site" first page 

plac = 'ctl00_tresc_cbListaPlacowek'
postPlac = "__doPostBack('ctl00$tresc$cbListaPlacowek','')"
postKraj = "__doPostBack('ctl00$tresc$cbListaKrajow','')"

unWin.checkRegion = function() {
	setTimeout(postKraj, 0)

if (typeof Gorod == 'undefined') {
	menuRegion(plac, q(postPlac))
} else if ('' == Gorod) {
	menuRegion(plac, q(postPlac))
} else { // if string and full
	unWin.waitLenZero(plac, Gorod, postPlac)
}
}

unWin.zeroFy = function(el, val, cb, d) {
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
	var span = cl("span")
		,url = dela + "audiouq4.swf?&autoPlay=true&audioUrl="+escape(dela + 'acbr.mp3')
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

unWin.selOption = function (el, val, cb) {
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
	//if(cb) setTimeout(cb, 0) 
	myse.dispatchEvent(mkChange())
} catch (e) { alert ("Случилась херь: " + e)}
	return false
}

fireTick = function(fun, el, val, cb, d, pid, dt) {
	setTimeout(fun + "('"+el+"','" +val+"','"+q(cb)+"','"+d+"','"+pid+"')", 777 + parseInt(dt ? dt : 0))
}

unWin.waitLenZero = function(el, val, cb, pid) {
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
		unWin.selOption(el, val, cb)
	} else {
		setTimeout("waitLenZero('"+el+"','" +val+"','"+q(cb)+"','"+pid+"')", 777)
	}
} catch (e) { alert ("Случилась херь2: " + e)}
}

setV = function(n, v) {
	document.cookie = n + "=" + encodeURIComponent(v) + "; path=/"
if ('v1' == n) {
	if(!v) {// start
		if (unWin.fa) {
			_log("Продолжаем заполнять через пару сек.")
			setTimeout('pfd()', 2222)
		} else {
			alert('Автозаполнение включено!')
			location.reload()
		}
	} else {			
		setV('BPEM9', '')
	}
}
}
getV = function(n) {
	var m = decodeURIComponent(document.cookie).match(RegExp(n + "=([^;]+)"))
	return m ? m[1].split(/,/) : ''
}
unWin.setV = setV
unWin.getV = getV
/*
 *** вход ****
 */
startFun = function () {

	_cfg()

if (_ctl())
	return

if (w.location.href == site ||
    w.location.href == site + "default.aspx") {
//первая страница, выбор страны, города
	var i = 0, myse=gi("ctl00_tresc_cbListaKrajow")
	for (; i<myse.options.length; i++){
		if (/Беларусь|Belarus/.test(myse.options[i].text)){
			myse.selectedIndex = i
			break
		}
	}
	
	setTimeout('checkRegion()', 0)

} else if (w.location.href == siteRegBlank) {
	var i = 0, myse = gi(id_vid)
	if (myse) {
		myse.focus()
if(myse.selectedIndex <= 0) {
	if(!vid) {
		_log("Вид услуги не указан. Нужно выбрать вручную.")
		scrollTo(111,1111)
		return
	}
	for (; i < myse.options.length; i++) {
		if (RegExp(vid).test(myse.options[i].text)) {
			myse.selectedIndex = i
			myse.dispatchEvent(mkChange())
			break
		}
	}
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
_log("<br/>Нужно вбить содержимое картинки в поле ввода (ЗАГЛАВНЫЕ можно писать как строчные). Я уж тут не могу помочь.")
}
} else if(w.location.href == siteForm ||
		  RegExp(siteFormP).test(w.location.href)) {
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
} else if(w.location.href == siteGorod) {
w.location.href = siteRegBlank
}
}

function menuRegion(p, pcb) {
	var x = cl("div")
	x.setAttribute("style","font-size:22pt; background-color:blue;position:fixed;top:7px;left:7px;z-index:77;")
	x.innerHTML='<b style="color:white">Хочу подать заявку на:</b>' +
	'<b onclick="javascript:selOption(\''+p+'\',\'Брест|Brest\')" style="padding:4px;color: rgb(119, 255, 119);">[ Брест ]</b>' +
	'<b onclick="javascript:selOption(\''+p+'\',\'Гродн|Grodn\')" style="padding:4px;color: rgb(119, 255, 119);">[ Гродно ]</b>' +
	'<b onclick="javascript:selOption(\''+p+'\',\'Минск|Minsk\')" style="padding:4px;color: rgb(119, 255, 119);">[ Минск ]</b>'
	gt('body').appendChild(x)
}

_log = function (msg) {
	var x = gi("llogg")
if (!x) {
	x = cl("div")
	x.setAttribute("style","font-size:12pt; background-color:red;position:fixed;top:33px;left:7px;z-index:77;padding:7px")
	x.setAttribute("id","llogg")
	x.innerHTML='<b style="color:white">'+msg+'</b>'
	gt('body').appendChild(x)
} else {
x.innerHTML+='<b style="color:white">'+msg+'</b>'
}
}

_ctl = function () {
	function inHtml(m) {
		var e ='style="font-weight:bold;color:red"', b = ''
		if (m) { b ='style="font-weight:bold;color:green"'; e = '' }
return '<input value ="Начать" '+b+' onclick="javascript:setV(\'v1\', \'\')" id="idStart" type="button" />'+
	   '<b style="color:white">:) Автозаполнение (:</b>'+
	   '<input value="Остановить" '+e+' onclick="javascript:setV(\'v1\', \'stop\')" id="idStop" type="button" />'
	}
	var x = gi("cctll"), ctl = getV("v1")
if (!x) {
	x = cl("div")
	x.setAttribute("style","font-size:12pt; background-color:orange;position:fixed;top:7px;left:7px;z-index:77;padding:4px")
	x.setAttribute("id","cctll")
	x.innerHTML=inHtml(ctl)
	gt('body').appendChild(x)
} else {
x.innerHTML+=inHtml(ctl)
}
	return ctl
}

unWin.plWizaCfg= function () {
try {
	var x = gi("ccfgg")
		,rows = x.value.split('\n')
		,i = /Настро/.test(rows[0]) ? 0 : -1
	setV('BPEM9', BPEM9)

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
	if(getV('BPEM9')) {
		var v
		Gorod = getV('Gorod')
		vid = getV('vid')
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
	t = cl("textarea")
	t.setAttribute("style","font-size:8pt;background-color:blue")
	t.setAttribute("id","ccfgg")
	t.setAttribute("cols","55")
	t.setAttribute("rows","3")
	x.appendChild(t)
}

unWin.plVFF = function(){ // read XLS data into array for later filling
try {
	var x = gi("plvizaformData")
		,rows = x.value.split('\n')
		,i = 0 // first (zero) line has column headers
		,demo = !true
		,el, elId, v
	unWin.fa = []
	
	if (rows.length < 7)
		demo = true // demo if text is empty
		
	while (++i < darr.length) { // skip first (zero) line with column headers
		if(!demo)  // demo(darr) or XLS data row: [id, ##, name, value]
			v = rows[i].split('\t')
		elId = demo ? darr[i][0] : v[0]
		   v = demo ? darr[i][1] : v[3]

if (elId) {
		if (/^[?]focus/.test(elId)) {
//console.log('radio | check id=: "' + elId + '"')
			elId = elId.replace(/^.* ([^ ]+$)/g,'$1')
			if (elId) {
				el= gi(elId)
if (!el) {
	alert("Не найден ?focus элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
	continue //return
}
				//el.focus()
				unWin.fa.push(elId + " focus")
			}
		} else if (/^[?]check/.test(elId) && v) {
			elId = elId.replace(/^.* ([^ ]+$)/g,'$1')
			if (elId) {
				el= gi(elId)
if (!el) {
	alert("Не найден ?checkbox элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
	continue //return
}
				if(v.trim()) {
					unWin.fa.push(elId + " check")
					//el.setAttribute("checked", "true");
					//el.dispatchEvent(mkChange())
				}
			}
		} else if (/^[?]radio/.test(elId) && v) {
			elId = v.replace(/^.* ([^ ]+$)/g,'$1')
//console.log('radio | check id=: "' + elId + '"')
			if (elId) {
				el= gi(elId)
if (!el) {
	alert("Не найден ?radio элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
	continue //return
}
				//el.checked = true
				//el.setAttribute("checked", "true")
				//el.dispatchEvent(mkChange())
				unWin.fa.push(elId + " radio")
			} else {
				alert("Не найден ID! Что-то в данных Excel не то. Не могу заполнять.\n\ni="+i+"\nv="+v)
				return
			}
		} else if (!/^[?]/.test(elId) && v) {
			el= gi(elId)
if (!el) {
	alert("Не найден элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
	continue //return
}
			if (/_dd/.test(elId)) { //select
				var j = 0
				while (++j < el.options.length) {
					if (RegExp(v).test(el.options[j].text)) {
						//el.selectedIndex = j
						unWin.fa.push(elId + " select " + j)
						break
					}
				}
			} else { //простой текст
				//el.setAttribute("value", v);
				unWin.fa.push([ elId + " txt", v])
			}
			//el.dispatchEvent(mkChange())
		}
} // else break; //до первой пустой строки idшников
	}
	x.parentNode.parentNode.removeChild(x.parentNode)
	_log("<br/>Подгрузили. Запускаем заполнялку, BPEM9 = " + BPEM9)
	unWin.pfd()
} catch (e) { alert ("Случилась херь3: " + e)}
}

unWin.fa = null // array filled with data
unWin.dataJ = 0
unWin.BPEM9 = BPEM9
unWin.pfd = function() { // pop filled data
	var el, s, d = unWin.fa[unWin.dataJ]
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
		unWin.dataJ = null
		unWin.fa = null
		return
	}
	if (BPEM9 > 111)
		el.dispatchEvent(mkChange())
	++unWin.dataJ
	setTimeout('pfd()', BPEM9)
}

var _formData = function () {
	_log("<br/><b style='color:black'>Данные для заполненения. Cкопировать в <b style='color:lightgreen'>Excel</b> <b style='color:white'>CTRL+C</b> вставить <b style='color:blue'>здесь</b> <b style='color:white'>CTRL+V</b>.</b><br/>"+
	'<input value="Внести" onclick="javascript:plVFF()" id="idFill" type="button" /> Пустой текст покажет Demo пример заполнения.'+
	"<br/>")
	var x = gi("llogg"), t
if (!x) {
	alert("Произошла херь!")
	return
}
	t = cl("textarea")
	t.setAttribute("style","font-size:8pt;background-color:orange")
	t.setAttribute("id","plvizaformData")
	t.setAttribute("cols","55")
	t.setAttribute("rows","3")
	x.appendChild(t)
}

function mkClick() {
	var ev = ce("MouseEvents")
	ev.initMouseEvent("click", true, true, w, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
	return ev
}

function mkChange() {
	var ev = ce("HTMLEvents")
	ev.initEvent("change", true, true )
	return ev
}

function gi(i){return document.getElementById(i)}
function gt(n){return document.getElementsByTagName(n)[0]}
function ce(v){return document.createEvent(v)}
function cl(t){return document.createElement(t)}
function q(s) {return s ? String(s).replace(/'/g, "\\'") : ''}

var GM_JQ = cl('script')
	,link = cl('link')
	link.setAttribute("type","image/gif")
	link.setAttribute("rel","icon")
	link.setAttribute("href",dela+"favicon.ico2.gif")
	gt('head').appendChild(link)

//id array + demo
//sed '/END/q;s/^\([^\t]*\)\t[^\t]*\t[^\t]*\t\(.*\)/["\1","\2"],/;s/[[:blank:]]\{1,\}/ /'
var darr = [["id","Значение"],
["ctl00_ContentPlaceHolder1_daneOs_txtNazwisko","FAMILIA"],
["ctl00_ContentPlaceHolder1_daneOs_txtNazwiskoRodowe","IMIA"],
["ctl00_ContentPlaceHolder1_daneOs_txtImiona","OCHESTVO"],
["ctl00_ContentPlaceHolder1_daneOs_txtDataUrodzin","1999-11-22"],
["ctl00_ContentPlaceHolder1_daneOs_txtMiejsceUrodzenia","DEREVNIA 4i-4i"],
["ctl00_ContentPlaceHolder1_daneOs_cbKrajUrodzenia_ddlDaneXMLjezyki","Б. БЕЛАРУССКАЯ ССР"],
["ctl00_ContentPlaceHolder1_daneOs_cbObecneObywatelstwo_ddlDaneXMLjezyki","БЕЛАРУСЬ"],
["ctl00_ContentPlaceHolder1_daneOs_cbPosiadaneObywatelstwo_ddlDaneXMLjezyki","БЕЛАРУСЬ"],
["?radio","Мужчина ctl00_ContentPlaceHolder1_daneOs_rbPlec_0"],
["?radio","Женат/Замужем ctl00_ContentPlaceHolder1_daneOs_rbStanCywilny_1"],
["?check ctl00_ContentPlaceHolder1_opiekunowie_chkNieDotyczy","да"],
["ctl00_ContentPlaceHolder1_txt5NumerDowodu",""],
["?radio","Обычный паспорт       ctl00_ContentPlaceHolder1_rbl13_0"],
["ctl00_ContentPlaceHolder1_txt14NumerPaszportu","AB1234567"],
["ctl00_ContentPlaceHolder1_txt16WydanyDnia","1999-11-22"],
["ctl00_ContentPlaceHolder1_txt17WaznyDo","2019-11-22"],
["ctl00_ContentPlaceHolder1_txt15WydanyPrzez","A HAC PATb"],
["?пункты",""],
["ctl00_ContentPlaceHolder1_ddl45Panstwo_ddlDaneXMLjezyki","БЕЛАРУСЬ"],
["ctl00_ContentPlaceHolder1_txt45StanProwincja","Brest"],
["ctl00_ContentPlaceHolder1_txt45Miejscowosc","Chi-Chi"],
["ctl00_ContentPlaceHolder1_txt45Kod","220022"],
["ctl00_ContentPlaceHolder1_txt45Adres","Bla bla bla"],
["ctl00_ContentPlaceHolder1_txt17Email","bill@microsoft.com"],
["ctl00_ContentPlaceHolder1_txt46TelefonPrefiks0","001(11)"],
["ctl00_ContentPlaceHolder1_txt46TelefonNumer0","23-45-678"],
["?radio","Нет ctl00_ContentPlaceHolder1_rbl18_0"],
["?",""],
["ctl00_ContentPlaceHolder1_txt18aNumer",""],
["ctl00_ContentPlaceHolder1_txt18bDataWaznosci",""],
["?check ctl00_ContentPlaceHolder1_chk18Bezterminowo",""],
["ctl00_ContentPlaceHolder1_ddl19WykonywanyZawod_ddlDaneXMLjezyki","Умственный работник"],
["?radio","Работодатель ctl00_ContentPlaceHolder1_rbl20_0"],
["ctl00_ContentPlaceHolder1_dd20bPanstwo_ddlDaneXMLjezyki","БЕЛАРУСЬ"],
["ctl00_ContentPlaceHolder1_txt20cStanProwincja",""],
["ctl00_ContentPlaceHolder1_txt20dMiejscowosc",""],
["ctl00_ContentPlaceHolder1_txt20eKodPocztowy",""],
["ctl00_ContentPlaceHolder1_txt20fAdres",""],
["ctl00_ContentPlaceHolder1_txt20gPrefix",""],
["ctl00_ContentPlaceHolder1_txt20hTelefon",""],
["ctl00_ContentPlaceHolder1_txt20Nazwa",""],
["ctl00_ContentPlaceHolder1_txt20Email",""],
["ctl00_ContentPlaceHolder1_txt20PrefiksFax",""],
["ctl00_ContentPlaceHolder1_txt20NumerFax",""],
["?",""],
["?check ctl00_ContentPlaceHolder1_rbl29_0","да"],
["?check ctl00_ContentPlaceHolder1_rbl29_1",""],
["?check ctl00_ContentPlaceHolder1_rbl29_2",""],
["?check ctl00_ContentPlaceHolder1_rbl29_3","да"],
["?check ctl00_ContentPlaceHolder1_rbl29_4",""],
["?check ctl00_ContentPlaceHolder1_rbl29_5",""],
["?check ctl00_ContentPlaceHolder1_rbl29_6",""],
["?check ctl00_ContentPlaceHolder1_rbl29_7",""],
["?check ctl00_ContentPlaceHolder1_rbl29_8",""],
["?check ctl00_ContentPlaceHolder1_rbl29_9",""],
["?check ctl00_ContentPlaceHolder1_rbl29_10","да"],
["ctl00_ContentPlaceHolder1_txt29CelPodrozy","badjaga"],
["ctl00_ContentPlaceHolder1_ddl21KrajDocelowy_ddlDaneXMLjezyki","ГЕРМАНИЯ"],
["ctl00_ContentPlaceHolder1_ddl23PierwszyWjazd_ddlDaneXMLjezyki","ПОЛЬША"],
["?radio","Однократного въезда           ctl00_ContentPlaceHolder1_rbl24_0"],
["ctl00_ContentPlaceHolder1_txt25OkresPobytu",""],
["?radio","Нет ctl00_ContentPlaceHolder1_rbl26_0"],
["ctl00_ContentPlaceHolder1_ctrl26_0_txtDataOd",""],
["ctl00_ContentPlaceHolder1_ctrl26_0_txtDataDo",""],
["?radio",""],
["?check ctl00_ContentPlaceHolder1_chkNiedotyczy28","не касается"],
["ctl00_ContentPlaceHolder1_txt27WydanePrzez",""],
["ctl00_ContentPlaceHolder1_txt27WazneOd",""],
["ctl00_ContentPlaceHolder1_txt27WazneDo",""],
["ctl00_ContentPlaceHolder1_txt30DataWjazdu","2012-05-22"],
["ctl00_ContentPlaceHolder1_txt31DataWyjazdu","2012-06-22"],
["?radio","человек ctl00_ContentPlaceHolder1_ctrl31_0_rbl34_0"],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34Nazwa",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34Imie","Vujtech"],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34Nazwisko","Pavlik"],
["ctl00_ContentPlaceHolder1_ctrl31_0_ddl34panstwo_ddlDaneXMLjezyki","ЧЕХИЯ"],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34miejscowosc",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34kod",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34prefikstel",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34tel",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34prefiksfax",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34fax",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34adres",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34NumerDomu",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34NumerLokalu",""],
["ctl00_ContentPlaceHolder1_ctrl31_0_txt34Email",""],
["?radio","Сам заявитель               ctl00_ContentPlaceHolder1_rbl35_0"],
["?check ctl00_ContentPlaceHolder1_lbl35a_okreslony_chkWartosc",""],
["?check ctl00_ContentPlaceHolder1_lbl35a_inny_chkWartosc",""],
["ctl00_ContentPlaceHolder1_txt35KtoPokrywaKoszty",""],
["?",""],
["?check ctl00_ContentPlaceHolder1_rb36Gotowka_chkWartosc","да"],
["?check ctl00_ContentPlaceHolder1_rb36Czeki_chkWartosc","да"],
["?check ctl00_ContentPlaceHolder1_rb36Karty_chkWartosc",""],
["?check ctl00_ContentPlaceHolder1_rb36Zakwaterowanie_chkWartosc","да"],
["?check ctl00_ContentPlaceHolder1_rb36Transport_chkWartosc",""],
["?check ctl00_ContentPlaceHolder1_rb36PokrywaKoszty_chkWartosc",""],
["?check ctl00_ContentPlaceHolder1_rb36Inne_chkWartosc","да"],
["ctl00_ContentPlaceHolder1_txt36Inne","penize"],
["?check ctl00_ContentPlaceHolder1_rb36Ubezpieczenie_chkWartosc","да"],
["ctl00_ContentPlaceHolder1_txt36WazneDo","2012-11-11"],
["?check ctl00_ContentPlaceHolder1_chkNieDotyczy43","не касается"],
["ctl00_ContentPlaceHolder1_txt43Nazwisko",""],
["ctl00_ContentPlaceHolder1_txt43Imie",""],
["ctl00_ContentPlaceHolder1_txt43DataUrodzenia",""],
["ctl00_ContentPlaceHolder1_txt43Paszport",""],
["ctl00_ContentPlaceHolder1_ddl43Obywatelstwo_ddlDaneXMLjezyki",""],
["?radio",""],
["?",""],
["?check ctl00_ContentPlaceHolder1_chk44Oswiadczenie1_chkWartosc","да"],
["?check ctl00_ContentPlaceHolder1_chk44Oswiadczenie2_chkWartosc","да"],
["?check ctl00_ContentPlaceHolder1_chk44Oswiadczenie3_chkWartosc","да"],
["?focus ctl00_ContentPlaceHolder1_cmdZapisz",""]]

startFun()
} catch (e) { if(console) console.log(e) ; throw e }
})(window, unsafeWindow)
//olecom: ak_src.js ends here
