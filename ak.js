// @name           plwiza_ak
// @version        008
// @author         olecom
// @description    ak for plwiza.user.js

// v002@2012-04-18, 2012-04-19
// v003@2012-04-20  https://addons.mozilla.org/ru/firefox/addon/scriptish/
//                  ak
// v004@2012-05-13  ids back in xls, demo left here
// v005@2012-06-16  stress handling
// v006@2012-11-18  new form ids, removed call for alert player
// v007@2013-01-19  rejestracja
//     @2013-05-27  fix siteFormP regexp
// v008@2013-09-15  minor fixes, intro automation is back
//     @2013-09-26, 27
//                  load into page itself, dev/prod URLS, Chrome support,
//                  complete rewrite, todo: start time

var continue_plwiza ,configure_plwiza ,zerofy
(function(w ,doc ,loca ,lost ,alert ,setTimeout ,con){

// localStorage['plwizadev'] = '1'

/**** Главная страница консульства
 ****/
//'Брест' //Гродно, Минск, или закоментировать
var
Gorod = "\u0411\u0440\u0435\u0441\u0442" //Brest

/**** Регистрация бланка
 ****/

//Вид деятельности Выбор из списка Допускаются только значения из списка.
//,vid = 'ПОКУПКИ'
//,vid = 'ТУРИЗМ'
//,vid = 'ГОСТ'
,Vid = "\u0413\u041e\u0421\u0422" //Guest

//Срок, когда деятельность даст выбор даты
,Srok = '' //'2012-05-11'

/**** Форма заполнения. Выдать звонки и лабать вручную или же из Excel
 ****/
,BPEM9 = 555 // время заполнения одного элемента

,plwizaCFG = { city: Gorod ,type: Vid ,date: Srok ,milliSecItem: BPEM9 ,startTime: '12:01'}

                                //к//о//д//и//н//г//
var site = 'https://rejestracja.by.e-konsulat.gov.pl/'
    ,siteRegBlank = site + 'Uslugi/RejestracjaTerminu.aspx?IDUSLUGI=8&idpl=0'
    ,siteForm  = site + 'Wiza/FormularzWiza.aspx?tryb=REJ'
    ,siteFormP = site + 'Wiza/FormularzWiza.*'

    ,postPlac = "__doPostBack('ctl00$tresc$cbListaPlacowek','')"

// "siteRegBlank"
    ,id_vid = 'ctl00_cp_f_cbRodzajUslugi'
    ,postVid = "__doPostBack('ctl00$cp_f$cbRodzajUslugi','')"

    ,id_Srok = 'ctl00_cp_f_cbTermin'
    ,postSrok = "__doPostBack('ctl00$cp_f$cbTermin','')"

    ,id_Bron = 'ctl00_cp_f_btnRezerwuj'
    ,dela = 'http://dela.by/ftp/plwiza/'

/* helpers */
function gi(i){ return doc.getElementById(i) }
function gt(n){ return doc.getElementsByTagName(n)[0] }
function ce(v){ return doc.createEvent(v) }
function cl(t){ return doc.createElement(t) }
function q(s) { return s ? String(s).replace(/'/g, "\\'") : '' }

function mkClick(){
    var ev = ce("MouseEvents")
    ev.initMouseEvent("click", true, true, w, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    return ev
}

function mkChange(){
    var ev = ce("HTMLEvents")
    ev.initEvent("change", true, true)
    return ev
}
zerofy = zeroFySelectOption
function zeroFySelectOption(el, val, cb, d){
    // there is string argument for element if call was done by setTimeout()
    if(typeof el == 'string') { el = gi(el) }
    el.focus()
    el.selectedIndex = 0
    el.dispatchEvent(mkChange())
    _msg_screen("повторяем попытку для " + d + " : " + Date())
}

function selectOption(el, val){
try {
    if(typeof el == 'string') { el = gi(el) }
    var i = 1
    if(val) for (i = 0; i < el.options.length; i++){
        if (RegExp(val).test(el.options[i].text)){
//con.log(i + ": " + myse.options[i].text)
            break
        }
    }
    if(el.selectedIndex !== i){
        el.focus()
        el.selectedIndex = i
        el.dispatchEvent(mkChange())
        return true
    }
    return undefined
} catch(e) { alert ("Случилась херь в selectOption: " + e) }
}

function fireTick(fun, el, val, cb, d, pid, dt) {
    setTimeout(fun + "('"+el+"','" +val+"','"+q(cb)+"','"+d+"','"+pid+"')", 777 + parseInt(dt ? dt : 0))
}

function continuePlwiza(){
    var el ,msg
    if((el = gi('cfgd'))){
        gi('llogg').childNodes[0].removeChild(el)
        msg = 'Начинаем работу с конфигурацией по умолчанию:<br/>' +
              '<b style="color:lightgreen">' + JSON.stringify(plwizaCFG) + '</b>'
    } else {
        if((msg = lost['plwizacfg'])){
            plwizaCFG = JSON.parse(msg)
            msg = 'Продолжаем работу автозаполнения. Конфигурация(кэш):<br/>' +
                  '<b style="color:lightgreen">' + msg
        } else {
            msg = 'Продолжаем работу автозаполнения. Конфигурация(умолчания):<br/>' +
                  '<b style="color:lightgreen">' + JSON.stringify(plwizaCFG)
        }
    }

    //TODO: if in middle of the form fill, continue this action

    _msg_screen(msg)
    lost['plwizago'] = '1'
    setTimeout(mainPlwiza ,123)
}
continue_plwiza = continuePlwiza
function _msg_screen(msg){
    var x ,el = gi("llogg")
    if (!el) {
        x = cl("div")
        x.setAttribute("style",
            "font-size:10pt; background-color:orange; position:fixed;"+
            "top:21px;left:7px;z-index:77;padding:2px"
        )
        x.innerHTML = '<input value="Начать" style="font-weight:bold" ' +
            (lost['plwizago'] ? 'disabled' : 'enabled') + '="true" ' +
            'onclick="javascript:(function(t){' +
"var el ,stop = document.getElementById('idStop');" +
"stop.removeAttribute('disabled'); stop.setAttribute('enabled', true);" +
"delete t.enabled; t.disabled = true;" +
"continue_plwiza();" +
            '})(this)" id="idStart" type="button"/>' +
            '<b style="color:white">:) Автозаполнение (:</b>' +
            '<input value="Остановить" style="font-weight:bold" ' +
            (lost['plwizago'] ? 'enabled' : 'disabled') + '="true" ' +
            'onclick="javascript:(function(t){' +
"var start = document.getElementById('idStart');" +
"start.removeAttribute('disabled'); start.setAttribute('enabled', true);" +
"delete localStorage.plwizago; delete t.enabled; t.disabled = true;" +
            '})(this)" id="idStop" type="button"/>' +
            '<input value="Сбросить конфигурацию" style="font-weight:bold" ' +
            (lost['plwizacfg'] ? 'enabled' : 'disabled') + '="true" ' +
            'onclick="javascript:' +
"delete localStorage.plwizacfg; delete this.enabled; this.disabled = true;" +
            '" id="idClearCFG" type="button"/>'

        gt('body').appendChild(x)

        el = cl("div")
        el.setAttribute("id","llogg")
        el.setAttribute("style",
            "font-size:10pt; background-color:red;" +
            "z-index:77; padding:7px"
        )
        x.appendChild(el)
    }
    if(msg){
        el.innerHTML += '<b style="color:white">' + msg + '</b><br/>'
    }
    return el
}

function waitLenZero(el, val, cb, pid){
try {
    if(typeof el == 'string') { el = gi(el) }
    scrollTo(111,1111)
    if (/disab|true/.test(el.getAttribute("disabled"))) {
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

            fireTick("zerofy", pid, '', '', "ВИД УСЛУГИ", id_vid, 4444)
        }
        return
    }

    if(el.length > 0) {
        selectOption(el, val)
    } else {
        setTimeout("waitLenZero('"+el.getAttribute('id')+"','" +val+"','"+q(cb)+"','"+pid+"')", 777)
    }
} catch (e) { alert ("Случилась херь waitLenZero: " + e)}
}
configure_plwiza = onclickPlwizaCfg
function onclickPlwizaCfg() {
try {
    var cols ,upd
        ,rows = gi("ccfgg").value.split('\n')
        ,i = /Настро/.test(rows[0]) ? 0 : -1

//    lost['BPEM9'] = BPEM9// default

    while (++i < rows.length) {
        cols = rows[i].split('\t')
        if (/Город/.test(cols[0]) && cols[1]) {
            Gorod = cols[1] ,upd = true
            lost['Gorod'] = Gorod
        } else if (/Вид/.test(cols[0]) && cols[1]) {
            Vid = cols[1] ,upd = true
            lost['vid'] = Vid
        } else if (/Срок/.test(cols[0]) && cols[1]) {
            Srok = cols[1] ,upd = true
            lost['Srok'] = Srok
        } else if (/Время/.test(cols[0]) && cols[1]) {
            BPEM9 = cols[1] ,upd = true
            lost['BPEM9'] = BPEM9
        } else if (/Начало/.test(cols[0]) && cols[1]) {
            plwizaCFG.startTime = cols[1] ,upd = true
        }
    }
    if (!upd) {
        _msg_screen('Пустая конфигурация!')
        return
    }

    plwizaCFG.city = Gorod
    plwizaCFG.type = Vid
    plwizaCFG.milliSecItem = BPEM9
    plwizaCFG.date = Srok

    lost['plwizacfg'] = JSON.stringify(plwizaCFG)
    lost['plwizago'] = '1'
    cols = gi('idClearCFG')
    cols.removeAttribute('disabled') ; cols.setAttribute('enabled', true)

    //TODO: if in middle of the form fill, continue this action

    _msg_screen('Конфигурация записана в кэш:<br/>' +
        '<b style="color:lightgreen">' + JSON.stringify(plwizaCFG)
    )
    setTimeout(mainPlwiza ,123)
    return
} catch (e) { alert("Случилась херь plWizaCfg: " + e) }
}

/*       ====    MAIN RUN    ====        */
         mainPlwiza()
         return

function mainPlwiza(){

    var te
    if((te = gi("ctl00_ddlWersjeJezykowe"))){
        if(selectOption(te ,'Русс')) return // no other actions
    }// select language

    if(!lost['plwizago']){// if stop
        _msg_screen(
"<div id='cfgd'><b style='color:black'>Настройки. По умолчанию:<br/><b style='color:lightgreen'>" +
JSON.stringify(plwizaCFG) + "</b><br/>или скопировать из " +
"<b style='color:lightgreen'>Excel</b> <b style='color:white'>CTRL+C</b> " +
"вставить <b style='color:blue'>здесь</b> <b style='color:white'>CTRL+V</b>.</b><br/>" +
'<input value="Настроить из вставки" onclick="javascript:configure_plwiza()" type="button"/> ' +
'Сбрасываются, если [Остановить].<br/>' +
'<textarea id="ccfgg" style="font-size:8pt;background-color:lightblue" rows="4" cols="44"></textarea><br/>' +
(lost['plwizacfg'] ? "Сохранённая в кэше конфигурация:<br/><b style='color:lightgreen'>" +
 lost['plwizacfg'] : '' ) +
'</div>'
        )
        return
    }// need staring [configuration] or [start] button click

    if((te = gi('ctl00_tresc_cbListaPlacowek'))){
        /* <option value="93">Брест</option>
           <option value="95">Гродно</option>
           <option value="94">Минск</option> */
        te.focus()
        _msg_screen('Автозаполняем Город...')

        selectOption(te ,plwizaCFG.city)
        /*if(plwizaCFG.city){
            waitLenZero(te ,plwizaCFG.city ,postPlac)
        } else {
            //menuRegion(te, q(postPlac))
        }*/
        return // no other actions
    }// select City/Town/Placowek: from cfg, user select or default

    if((te = gi('ctl00_cp_BotDetectCaptchaCodeTextBox'))){
        te.focus()
        _msg_screen("Нужно вбить содержимое картинки в поле ввода. Тут не могу помочь.")
        return
        //old: ctl00_cp_f_KomponentObrazkowy_VerificationID
        //new: ctl00_cp_BotDetectCaptchaCodeTextBox
    }

    /* == Finding of enabled types with dates ==*/

    if((te = gi('ctl00_cp_cbDzien'))){
        waitLenZero(te ,'' ,postPlac)
        return

        //<select name="ctl00$cp$cbDzien" id="ctl00_cp_cbDzien" onchange="cbDzienGodzina_onChange(this);"
        /* old:
         * ,id_Srok = 'ctl00_cp_f_cbTermin'
         * ,postSrok = "__doPostBack('ctl00$cp_f$cbTermin','')"
         * */
    }

    if((te = gi('ctl00_cp_cbRodzajUslugi'))){
        _msg_screen('Выбор услуги: ' + plwizaCFG.type)
        selectOption(te ,plwizaCFG.type)
        return
    }

    if((te = gi('ctl00__10112fb0b408a6d_hlRejestracjaSchengen'))){
        _msg_screen('Переход Шенгенская Виза - Зарегистрируйте бланк')
        //te.dispatchEvent(mkClick())
        return
    }// Шенгенская Виза - Зарегистрируйте бланк

    con.log('plwiza end')
}

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
var el = gi('ctl00_cp_f_KomponentObrazkowy_VerificationID')
if (el) el.focus()
_log("<br/>Нужно вбить содержимое картинки в поле ввода (ЗАГЛАВНЫЕ можно писать как строчные). Я уж тут не могу помочь.")
}
} else if(w.location.href == siteForm ||
          RegExp(siteFormP).test(w.location.href)) {
/*	playAlert()
    if (/звонить/.test(Forma)) {
        var nn = 0
        setTimeout(playAlert, 14000*(nn++)) ; setTimeout(playAlert, 14000*(nn++))
        setTimeout(playAlert, 14000*(nn++)) ; setTimeout(playAlert, 14000*(nn++))
        setTimeout(playAlert, 14000*(nn++)) ; setTimeout(playAlert, 14000*(nn++))
        setTimeout(playAlert, 14000*(nn++)) ; setTimeout(playAlert, 14000*(nn++))
    } else { // create textarea, ask for ctrl+c ctrl + v, press ok
        _formData()
    }*/
    _formData()
} else if(w.location.href == siteGorod) {
w.location.href = siteRegBlank
}
}


plVFF = function(){ // read XLS data into array for later filling
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
//con.log('radio | check id=: "' + elId + '"')
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
                    //unWin.fa.push(elId + " check")
                    el.dispatchEvent(mkClick())

                    //el.setAttribute("checked", "true");
                    //el.dispatchEvent(mkChange())
                }
            }
        } else if (/^[?]radio/.test(elId) && v) {
            elId = v.replace(/^.* ([^ ]+$)/g,'$1')
//con.log('radio | check id=: "' + elId + '"')
            if (elId) {
              el= gi(elId)

if (!el) {
    alert("Не найден ?radio элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
    continue //return
}
                //el.checked = true
                //el.setAttribute("checked", "true")
                //el.dispatchEvent(mkChange())
                //unWin.fa.push(elId + " radio")
                el.dispatchEvent(mkClick())
                //}
            } else {
                alert("Не найден ID! Что-то в данных Excel не то. Не могу заполнять.\n\ni="+i+"\nv="+v)
                return
            }
        } else if (!/^[?]/.test(elId) && v) {
            //add more visa input fields
            if(/PoprzednieWizy_[12]_txtDataOd/.test(elId)){
                with (gi('ctl00_cp_f_btn26Wiecej')){
                    focus()
                    dispatchEvent(mkClick())
                }
            }
            el= gi(elId)
if (!el) {
    alert("Не найден элемент! Что-то где-то поменялось. Не могу заполнять.\n\ni="+i+"\nid="+elId)
    continue //return
}
            if (/_dd/.test(elId) || /s_cb/.test(elId)) { //select
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
    }//while
    x.parentNode.parentNode.removeChild(x.parentNode)
    _log("<br/>Подгрузили. Запускаем заполнялку, BPEM9 = " + BPEM9)
    //unWin.pfd()
    setTimeout('pfd()', BPEM9)
} catch (e) { alert ("Случилась херь3: " + e)}
}

fa = null // array filled with data
dataJ = 0
BPEM9 = BPEM9
pfd = function() { // pop filled data
    var el, s, d = unWin.fa[unWin.dataJ]

con.log('d1 = ' + d)

    if (!d || getV("v1")) return
    if (typeof d != 'string') {
        s = d[0].split(' ')
    } else s = d.split(' ')

con.log(s)
con.log('d2 = ' + d + '\n----\n')

    el= gi(s[0])
    if (!el) return

    el.focus()
    if ('txt' == s[1]) {
        el.setAttribute("value", d[1]);
        el.value = d[1]
        el.dispatchEvent(mkChange())
        //el.dispatchEvent(mkClick())
    } else if('select' == s[1]) {
        el.selectedIndex = parseInt(s[2])
        el.dispatchEvent(mkChange())
    /*} else if('radio' == s[1]) {
        //el.setAttribute("checked", "true");
        el.dispatchEvent(mkClick())
        //el.dispatchEvent(mkChange())
    } else if('check' == s[1]) {
        //el.setAttribute("checked", "true")
        el.dispatchEvent(mkClick())
        //el.dispatchEvent(mkChange())*/
    } else if('focus' == s[1]) {
        unWin.dataJ = null
        unWin.fa = null
        return
    }
    ++unWin.dataJ
    setTimeout('pfd()', BPEM9)
}

var _formData = function(){
    _log("<br/><b style='color:black'>Данные для заполненения. Cкопировать в <b style='color:lightgreen'>Excel</b> <b style='color:white'>CTRL+C</b> вставить <b style='color:blue'>здесь</b> <b style='color:white'>CTRL+V</b>.</b><br/>"+
    '<input value="Внести v008" onclick="javascript:plVFF()" id="idFill" type="button" /> Пустой текст покажет Demo пример заполнения.'+
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

//id array + demo
//sed '/END/q;s/^\([^\t]*\)\t[^\t]*\t[^\t]*\t\(.*\)/["\1","\2"],/;s/[[:blank:]]\{1,\}/ /'
var darr = [["id","Значение"],
["ctl00_cp_f_daneOs_txtNazwisko","FAMILIA"],
["ctl00_cp_f_daneOs_txtNazwiskoRodowe","IMIA"],
["ctl00_cp_f_daneOs_txtImiona","OCHESTVO"],
["ctl00_cp_f_daneOs_txtDataUrodzin","1999-11-22"],
["ctl00_cp_f_daneOs_txtMiejsceUrodzenia","DEREVNIA 4i-4i"],
["ctl00_cp_f_daneOs_cbKrajUrodzenia","Б. БЕЛАРУССКАЯ ССР"],
["ctl00_cp_f_daneOs_cbObecneObywatelstwo","БЕЛАРУСЬ"],
["ctl00_cp_f_daneOs_cbPosiadaneObywatelstwo","БЕЛАРУСЬ"],
["?radio","Мужчина ctl00_cp_f_daneOs_rbPlec_0"],
["?radio","Женат/Замужем ctl00_cp_f_daneOs_rbStanCywilny_1"],
["?check ctl00_cp_f_opiekunowie_chkNieDotyczy","да"],
["ctl00_cp_f_txt5NumerDowodu",""],
["?radio","Обычный паспорт       ctl00_cp_f_rbl13_0"],
["ctl00_cp_f_txt14NumerPaszportu","AB1234567"],
["ctl00_cp_f_txt16WydanyDnia","1999-11-22"],
["ctl00_cp_f_txt17WaznyDo","2019-11-22"],
["ctl00_cp_f_txt15WydanyPrzez","A HAC PATb"],
["?пункты",""],
["ctl00_cp_f_ddl45Panstwo","БЕЛАРУСЬ"],
["ctl00_cp_f_txt45StanProwincja","Brest"],
["ctl00_cp_f_txt45Miejscowosc","Chi-Chi"],
["ctl00_cp_f_txt45Kod","220022"],
["ctl00_cp_f_txt45Adres","Bla bla bla"],
["ctl00_cp_f_txt17Email","bill@microsoft.com"],
["ctl00_cp_f_txt46TelefonPrefiks0","001(11)"],
["ctl00_cp_f_txt46TelefonNumer0","23-45-678"],
["?radio","Нет ctl00_cp_f_rbl18_0"],
["?",""],
["ctl00_cp_f_txt18aNumer",""],
["ctl00_cp_f_txt18bDataWaznosci",""],
["?check ctl00_cp_f_chk18Bezterminowo",""],
["ctl00_cp_f_ddl19WykonywanyZawod","Умственный работник"],
["?radio","Работодатель ctl00_cp_f_rbl20_0"],
["ctl00_cp_f_dd20bPanstwo","БЕЛАРУСЬ"],
["ctl00_cp_f_txt20cStanProwincja",""],
["ctl00_cp_f_txt20dMiejscowosc",""],
["ctl00_cp_f_txt20eKodPocztowy",""],
["ctl00_cp_f_txt20fAdres",""],
["ctl00_cp_f_txt20gPrefix",""],
["ctl00_cp_f_txt20hTelefon",""],
["ctl00_cp_f_txt20Nazwa",""],
["ctl00_cp_f_txt20Email",""],
["ctl00_cp_f_txt20PrefiksFax",""],
["ctl00_cp_f_txt20NumerFax",""],
["?",""],
["?check ctl00_cp_f_rbl29_0","да"],
["?check ctl00_cp_f_rbl29_1",""],
["?check ctl00_cp_f_rbl29_2",""],
["?check ctl00_cp_f_rbl29_3","да"],
["?check ctl00_cp_f_rbl29_4",""],
["?check ctl00_cp_f_rbl29_5",""],
["?check ctl00_cp_f_rbl29_6",""],
["?check ctl00_cp_f_rbl29_7",""],
["?check ctl00_cp_f_rbl29_8",""],
["?check ctl00_cp_f_rbl29_9",""],
["?check ctl00_cp_f_rbl29_10","да"],
["ctl00_cp_f_txt29CelPodrozy","badjaga"],
["ctl00_cp_f_ddl21KrajDocelowy","ГЕРМАНИЯ"],
["ctl00_cp_f_ddl23PierwszyWjazd","ПОЛЬША"],
["?radio","Однократного въезда           ctl00_cp_f_rbl24_0"],
["ctl00_cp_f_txt25OkresPobytu",""],
["?radio","Нет ctl00_cp_f_rbl26_0"],
["PoprzednieWizy_0_txtDataOd",""],
["PoprzednieWizy_0_txtDataDo",""],
["PoprzednieWizy_1_txtDataOd",""],
["PoprzednieWizy_1_txtDataDo",""],
["PoprzednieWizy_2_txtDataOd",""],
["PoprzednieWizy_2_txtDataDo",""],
["?radio",""],
["?check ctl00_cp_f_chkNiedotyczy28","не касается"],
["ctl00_cp_f_txt27WydanePrzez",""],
["ctl00_cp_f_txt27WazneOd",""],
["ctl00_cp_f_txt27WazneDo",""],
["ctl00_cp_f_txt30DataWjazdu","2012-05-22"],
["ctl00_cp_f_txt31DataWyjazdu","2012-06-22"],
["?radio","человек ctl00_cp_f_ctrl31__rbl34_0"],
["ctl00_cp_f_ctrl31__txt34Nazwa",""],
["ctl00_cp_f_ctrl31__txt34Imie","Vujtech"],
["ctl00_cp_f_ctrl31__txt34Nazwisko","Pavlik"],
["ctl00_cp_f_ctrl31__ddl34panstwo","ЧЕХИЯ"],
["ctl00_cp_f_ctrl31__txt34miejscowosc",""],
["ctl00_cp_f_ctrl31__txt34kod",""],
["ctl00_cp_f_ctrl31__txt34prefikstel",""],
["ctl00_cp_f_ctrl31__txt34tel",""],
["ctl00_cp_f_ctrl31__txt34prefiksfax",""],
["ctl00_cp_f_ctrl31__txt34fax",""],
["ctl00_cp_f_ctrl31__txt34adres",""],
["ctl00_cp_f_ctrl31__txt34NumerDomu",""],
["ctl00_cp_f_ctrl31__txt34NumerLokalu",""],
["ctl00_cp_f_ctrl31__txt34Email",""],
["?radio","Сам заявитель               ctl00_cp_f_rbl35_0"],
["?check ctl00_cp_f_lbl35a_okreslony_chkWartosc",""],
["?check ctl00_cp_f_lbl35a_inny_chkWartosc",""],
["ctl00_cp_f_txt35KtoPokrywaKoszty",""],
["?",""],
["?check ctl00_cp_f_rb36Gotowka","да"],
["?check ctl00_cp_f_rb36Czeki","да"],
["?check ctl00_cp_f_rb36Karty",""],
["?check ctl00_cp_f_rb36Zakwaterowanie","да"],
["?check ctl00_cp_f_rb36Transport",""],
["?check ctl00_cp_f_rb36PokrywaKoszty",""],
["?check ctl00_cp_f_rb36Inne","да"],
["ctl00_cp_f_txt36Inne","penize"],
["?check ctl00_cp_f_rb36Ubezpieczenie","да"],
["ctl00_cp_f_txt36WazneDo","2012-11-11"],
["?check ctl00_cp_f_chkNieDotyczy43","не касается"],
["ctl00_cp_f_txt43Nazwisko",""],
["ctl00_cp_f_txt43Imie",""],
["ctl00_cp_f_txt43DataUrodzenia",""],
["ctl00_cp_f_txt43Paszport",""],
["ctl00_cp_f_ddl43Obywatelstwo",""],
["?radio",""],
["?",""],
["?check ctl00_cp_f_chk44Oswiadczenie1","да"],
["?check ctl00_cp_f_chk44Oswiadczenie2","да"],
["?check ctl00_cp_f_chk44Oswiadczenie3","да"],
["?focus ctl00_cp_f_cmdDalej",""]]

})(window ,document ,location ,localStorage ,alert ,setTimeout ,console)
//olecom: ak_src.js ends here
