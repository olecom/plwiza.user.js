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
//     @2013-09-26, 27, 28, 29
//                  load into page itself, dev/prod URLS, Chrome support,
//                  complete rewrite, start time

// functions to be used in page context
var continue_plwiza ,configure_plwiza ,read_xls_data ,fill_plwizaform_items

(function plwiza_closure(w ,doc ,lost ,alert ,setTimeout ,con){
//devel: localStorage['plwizadev'] = '1'

var ver = 'v008'
,Gorod = 'Брест'
,Vid = 'ПОКУПКИ' //'ПОКУПКИ', 'ГОСТ'....
,Srok = ''       //'2012-05-11'
,BPEM9 = 555     // время заполнения одного элемента
,plwizaCFG = {
    city: Gorod ,type: Vid ,date: Srok ,milliSecItem: BPEM9 ,startTime: '12:00:21'
}

                                //к//о//д//и//н//г//
var site = 'https://rejestracja.by.e-konsulat.gov.pl/'
    ,siteRegBlank = site + 'Uslugi/RejestracjaTerminu.aspx?IDUSLUGI=8&idpl=0'
    ,siteForm  = site + 'Wiza/FormularzWiza.aspx?tryb=REJ'
    ,siteFormP = site + 'Wiza/FormularzWiza.*'

    ,postPlac = "__doPostBack('ctl00$tresc$cbListaPlacowek','')"

// "siteRegBlank"
    ,id_vid = 'ctl00_cp_f_cbRodzajUslugi'
    ,dataJ = 0 ,darr ,fa = [] //poiner, demo array and one for deferred filling

/* helpers */
function gi(i){ return doc.getElementById(i) }
function gt(n){ return doc.getElementsByTagName(n)[0] }
function gs(n){ return doc.getElementsByTagName(n) }
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

function selectOption(el, val, last_item){
try {
    if(typeof el == 'string') { el = gi(el) }
    var i
    if(val) for (i = 0; i < el.options.length; i++){
        if (RegExp(val).test(el.options[i].text)){
            break
        }
    } else {
        i = last_item ? el.options.length - 1 : 1
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
            '<b style="color:white">:) Автозаполнение ' + ver + '(:</b>' +
            '<input value="Остановить" style="font-weight:bold" ' +
            (lost['plwizago'] ? 'enabled' : 'disabled') + '="true" ' +
            'onclick="javascript:(function(t){' +
"var start = document.getElementById('idStart');" +
"start.removeAttribute('disabled'); start.setAttribute('enabled', true);" +
"delete localStorage.plwizago; delete t.enabled; t.disabled = true;" +
            '})(this)" id="idStop" type="button"/>' +
            '<input value="Сбросить конфиг" style="font-weight:bold" ' +
            (lost['plwizacfg'] ? 'enabled' : 'disabled') + '="true" ' +
            'onclick="javascript:' +
"delete localStorage.plwizacfg; delete this.enabled; this.disabled = true;" +
            '" id="idClearCFG" type="button"/>'

        gt('body').appendChild(x)

        el = cl("div")
        el.setAttribute("id","llogg")
        el.setAttribute("style",
            "font-size:10pt; background-color:#FFE4E1;" +
            "z-index:77; padding:7px"
        )
        x.appendChild(el)
    }
    if(msg){
        el.innerHTML += '<b style="color:black">' + msg + '</b><br/>'
    }
    return el
}

continue_plwiza = continuePlwiza
function continuePlwiza(){
    var el ,msg

    if((el = gi('cfgd'))){
        gi('llogg').childNodes[0].removeChild(el)
        msg = 'Начинаем работу с конфигурацией по умолчанию:<br/>' +
              '<b style="color:green">' + JSON.stringify(plwizaCFG) + '</b>'
    } else {
        if((msg = lost['plwizacfg'])){
            plwizaCFG = JSON.parse(msg)
            msg = 'Продолжаем работу автозаполнения. Конфигурация(кэш):<br/>' +
                  '<b style="color:green">' + msg
        } else {
            msg = 'Продолжаем работу автозаполнения. Конфигурация(умолчания):<br/>' +
                  '<b style="color:green">' + JSON.stringify(plwizaCFG)
        }
    }

    _msg_screen(msg)
    lost['plwizago'] = '1'
    setTimeout(mainPlwiza ,123)
}

configure_plwiza = onclickPlwizaCfg
function onclickPlwizaCfg() {
try {
    var cols ,upd
        ,rows = gi("ccfgg").value.split('\n')
        ,i = /Настро/.test(rows[0]) ? 0 : -1
    plwizaCFG.startTime = ''
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

    _msg_screen('Конфигурация записана в кэш:<br/>' +
        '<b style="color:green">' + JSON.stringify(plwizaCFG)
    )
    setTimeout(mainPlwiza ,123)
    return
} catch (e) { alert("Случилась херь plWizaCfg: " + e) }
}

/*       ====    MAIN RUN    ====        */
         mainPlwiza()
         return
/*       ====    MAIN END    ====        */

function mainPlwiza(){
    var te ,i

    if((te = gi("ctl00_ddlWersjeJezykowe"))){
        if(selectOption(te ,'Русс')) return // no other actions
    }// select language

    if(!lost['plwizago']){// if stop
        _msg_screen(
"<div id='cfgd'><b style='color:black'>Настройки. По умолчанию:<br/><b style='color:green'>" +
JSON.stringify(plwizaCFG) + "</b><br/>или скопировать из " +

"<b><u><a style='color:blue' href='https://github.com/olecom/plwiza.user.js/raw/master/plwiza_form.xlt'>" +
"Excel'а (файл в этой сслыке)</a></u></b> <b style='color:red'>CTRL+C</b> область настроек<br/>" +
"вставить <b style='color:green'>здесь</b> <b style='color:red'>CTRL+V</b>:</b><br/>" +
'<textarea id="ccfgg" style="font-size:8pt;background-color:lightblue" rows="4" cols="77"></textarea><br/>' +
'<input value="Настроить из вставки" onclick="javascript:configure_plwiza()" type="button"/> ' +
(lost['plwizacfg'] ? "Сохранённая в кэше конфигурация:<br/><b style='color:green'>" +
 lost['plwizacfg'] : '' ) +
'</div>'
        )
        try {
            gi('ctl00_cp_BotDetectCaptchaCodeTextBox').focus()
            setTimeout(
                "document.getElementById('ctl00_cp_BotDetectCaptchaCodeTextBox').focus()"
                ,0
            )//Firefox focus() fix (doesn't work)
        } catch (e) { }
        return
    }// need staring [configuration] or [start] button click
    if((te = lost['plwizacfg'])) plwizaCFG = JSON.parse(te)

    if((te = gi('ctl00_tresc_cbListaPlacowek'))){
        /* <option value="93">Брест</option>
           <option value="95">Гродно</option>
           <option value="94">Минск</option> */
        te.focus()
        _msg_screen('Автозаполняем Город...')
        selectOption(te ,plwizaCFG.city)

        return // no other actions
    }// select City/Town/Placowek: from cfg, user select or default

    if((te = gi('ctl00_cp_BotDetectCaptchaCodeTextBox'))){
        scrollTo(111,1111)
        te.focus()
        te.dispatchEvent(mkClick())//Firefox focus() fix try

        _msg_screen("Нужно вбить содержимое картинки в поле ввода. Тут не могу помочь." +
            '<br/>Конфигурация:<br/><b style="color:green">' +
            JSON.stringify(plwizaCFG) + '</b>'
        )

        return
        //old: ctl00_cp_f_KomponentObrazkowy_VerificationID
        //new: ctl00_cp_BotDetectCaptchaCodeTextBox
    }

    /* == Finding of enabled types with dates ==*/

    if((te = gi('ctl00_cp_cbDzien'))){
        lost['plwizadate'] = te.options[te.options.length - 1].text

        selectOption(te ,0 ,'last_item')

        if((te = gi('ctl00_cp_btnRezerwuj'))){
            _msg_screen('Жму [Зарегистрироваться]')
            te.focus()
            te.dispatchEvent(mkClick())
            return
        }
        return
        //<select name="ctl00$cp$cbDzien" id="ctl00_cp_cbDzien" onchange="cbDzienGodzina_onChange(this);"
        /* old:
         * ,id_Srok = 'ctl00_cp_f_cbTermin'
         * ,postSrok = "__doPostBack('ctl00$cp_f$cbTermin','')"
         * */
    }

    if((te = gi('ctl00_cp_cbRodzajUslugi'))){
        _msg_screen(
            'Выбор услуги: ' + plwizaCFG.type + (plwizaCFG.startTime ?
            ' начало в ' + plwizaCFG.startTime +
            ', сейчас: <b id="startTime" style="color:lightblue"></b>' : '')
        )
        scrollTo(111,1111)

        if(plwizaCFG.startTime){
            // "12:01".slice(3)  -> 01
            // "12:01".slice(0,2)-> 12
            function set_delay(){
                function pad(n){ return n < 10 ? '0' + n : n }
                var d = new Date(), dd = new Date(d)
                d.setHours(parseInt(plwizaCFG.startTime.slice(0, 2)))
                d.setMinutes(parseInt(plwizaCFG.startTime.slice(3, 5)))
                d.setSeconds(parseInt(plwizaCFG.startTime.slice(6, 8)))
                gi('startTime').innerHTML = pad(dd.getHours()) + ':' +
                                            pad(dd.getMinutes()) + ':' +
                                            pad(dd.getSeconds())
                if(d < dd){
                    selectOption(te ,plwizaCFG.type)
                    scrollTo(111,1111)
                } else {
                    setTimeout(set_delay ,1024)
                }
            }
            set_delay()
            return
        }
        selectOption(te ,plwizaCFG.type)
        return
    }// select type

    if((te = gi('ctl00_cp_f_cmdDalej'))){// prepare user to autofill the from
        // setup deferred item fill functions and data
        read_xls_data = plVFF ,fill_plwizaform_items = pfd ,define_darr()
        _msg_screen(
"<b>Заполняем форму. Данные (4 первых столбца) скопировать из<br/><u>" +
"<a style='color:blue' href='https://github.com/olecom/plwiza.user.js/raw/master/plwiza_form.xlt'>" +
"Excel'а (файл в этой сслыке)</a></u> <b style='color:red'>CTRL+C</b> " +
"вставить здесь <b style='color:red'>CTRL+V</b>:</b><br/>" +
'<textarea id="plvizaformData" onfocus="javascript:this.value=' + "''" +
'" id="ccfgg" style="font-size:8pt;background-color:lightgreen;float:left" ' +
'rows="3" cols="66">Пустой текст покажет Demo заполнения.</textarea>' +
'<input value="Внести данные" onclick="javascript:read_xls_data()" ' +
'type="button" style="font-weight:bold"/><br/>' +
'<span style="font-weight:normal">&nbsp;версия&nbsp;ak:&nbsp;' + ver + '</<span>' +
((te = lost['plwizadate']) ? '<br/><br/>Дата визы: ' + te : '')
        )
        return
    } else if(lost.plwizadate) { delete lost.plwizadate }

    i = 0, te = gs('a')// this link seems to be very smart
    for(; i < te.length; i++) if(/RejestracjaSchengen/.test(te[i].id)){
        _msg_screen('Переход Шенгенская Виза - Зарегистрируйте бланк')
        te[i].dispatchEvent(mkClick())
        break
    }
}// mainPlwiza()

function plVFF(){// read XLS data into array for deferred item by item filling
try {
    var x = gi("plvizaformData")
        ,rows = x.value.split('\n')
        ,j ,i = 0 // first (zero) line has column headers
        ,demo = !true
        ,el, elId ,v

    if(rows.length < 7) demo = true // demo if text is empty

    _msg_screen('Заполняем.<br/>Демо режим: ' + (demo ? 'да' : 'нет'))

    while(++i < darr.length){ // skip first (zero) line with column headers
        if(!demo){// demo(darr) or XLS data row: [id, ##, name, value]
            v = rows[i].split('\t')
        }
        elId = demo ? darr[i][0] : v[0]// 1st data column -- form IDs
           v = demo ? darr[i][1] : v[3]// 3d  data column -- data
        if(!elId) continue

        if(/^[?]focus/.test(elId)){
            elId = elId.replace(/^.* ([^ ]+$)/g, '$1')// take pure ID of element
            if(!elId) continue

            el = gi(elId)
            if(!el){
                _msg_screen(
"Не найден ?focus элемент! Что-то где-то поменялось. Не могу заполнять.<br/>i=" +
                    i + "; id=" + elId
                )
                continue
            }
            fa.push(elId + " focus")
        } else if(/^[?]check/.test(elId) && v){
            elId = elId.replace(/^.* ([^ ]+$)/g, '$1')
            if(!elId) continue

            el = gi(elId)
            if(!el){
                _msg_screen(
"Не найден ?checkbox элемент! Что-то где-то поменялось. Не могу заполнять.<br/>i=" +
                    i+"; id=" + elId
                )
                continue
            }
            if(v.trim()) fa.push(elId + " check")
        } else if(/^[?]radio/.test(elId) && v){
            elId = v.replace(/^.* ([^ ]+$)/g, '$1')
            if(!elId) continue
            el = gi(elId)
            if(!el){
                _msg_screen(
"Не найден ?radio элемент! Что-то где-то поменялось. Не могу заполнять.<br/>i=" +
                    i + "; id=" + elId
                )
                continue
            }
            fa.push(elId + " radio")
        } else if(!/^[?]/.test(elId) && v){
            //add more "last visas" input fields
            if(/PoprzednieWizy_/.test(elId)){// was RE: _txtDataOd
                el = gi('ctl00_cp_f_btn26Wiecej')
                el.focus()
                el.dispatchEvent(mkClick())
            }
            el = gi(elId)
            if(!el){
                _msg_screen(
"Не найден элемент! Что-то где-то поменялось. Не могу заполнять.<br/>i=" +
                    i + "; id=" + elId
                )
                continue
            }
            if (/_dd/.test(elId) || /s_cb/.test(elId)){ //select
                j = 0
                while(++j < el.options.length) {
                    if (RegExp(v).test(el.options[j].text)) {
                        fa.push(elId + " select " + j)
                        break
                    }
                }
            } else {// simple text
                fa.push([elId + " txt", v])
            }
        }
    }//while
    _msg_screen(
        "Подгрузили. Запускаем заполнялку, задержка = " +
        plwizaCFG.milliSecItem + ' миллисекунд'
    )
    setTimeout(fill_plwizaform_items, plwizaCFG.milliSecItem)
} catch(e){ alert("Случилась херь read_xls_data: " + e) }
}

function pfd(){// pop filled data into form
    var el, s ,d = fa[dataJ]

con.log('d1 = ' + d)

    if(!d || !lost.plwizago) return

    if (typeof d != 'string') {
        s = d[0].split(' ')
    } else {
        s = d.split(' ')
    }

con.log(s)
con.log('d2 = ' + d)

    el = gi(s[0])
    if(!el) return
    el.focus()
    if('txt' == s[1]){
        el.setAttribute("value", d[1]);
        el.value = d[1]
        el.dispatchEvent(mkChange())
    } else if('select' == s[1]){
        el.selectedIndex = parseInt(s[2])
        el.dispatchEvent(mkChange())
    } else if('radio' == s[1]) {
        el.dispatchEvent(mkClick())
    } else if('check' == s[1]) {
        el.dispatchEvent(mkClick())
    } else if('focus' == s[1]){
        fa.splice((dataJ = 0))// cleanup
        return// last form element
    }
    ++dataJ
    setTimeout(fill_plwizaform_items, plwizaCFG.milliSecItem)
}

function define_darr(){
//id array + demo
//sed '/END/q;s/^\([^\t]*\)\t[^\t]*\t[^\t]*\t\(.*\)/["\1","\2"],/;s/[[:blank:]]\{1,\}/ /'
darr = [["id","Значение"],
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
}
})(window ,document ,localStorage ,alert ,setTimeout ,console ? console : function(){})

//olecom: ak.js ends here
