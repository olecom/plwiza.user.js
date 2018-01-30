void function _gc(w ,doc ,lost ,alert ,setTimeout ,con){
// helpers
function gi(i){ return doc.getElementById(i) }
function gt(n){ return doc.getElementsByTagName(n)[0] }
function gs(n){ return doc.getElementsByTagName(n) }
function jq(n){ return doc.querySelectorAll(n) }
function ce(v){ return doc.createEvent(v) }
function cl(t){ return doc.createElement(t) }
function q(s) { return s ? String(s).replace(/'/g, "\\'") : '' }
function pad(n){return n < 10 ? '0' + n : n }
function mk_click(){
var ev = ce("MouseEvents")
    ev.initMouseEvent("click", true, true, w, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    return ev
}

function mk_change(){
var ev = ce("HTMLEvents")
    ev.initEvent("change", true, true)
    return ev
}

// for development
try { gt('body').removeChild(gi('_msgblock')) } catch (ex) {}

// ui
var ver = 'v001'
var minmax = false;
var hh = 'auto'
// elements
var _cfg, _data, _llogg
// data
var TIMEOUT, config, data
var cfgTxt
// tools
var pageId, timer, i$1, n$1, a$1
var pageConfigInputls = {
    '1':0,
    '2':0,
    '3':0,
    '4':0,
    '5':0
}

__msg('init')

function readConfig(event){
    if(event){
        cfgTxt = _cfg.value
    }

    config = Object.create(null)
    cfgTxt.split('\n').map(function(v, l){
        v = v.split('	')
        if(0 == l) TIMEOUT = +v[2]
        if(v[1] && '!' == v[1][1]) config[v[1]] = v
    })
    // default timeout in seconds
    if(!TIMEOUT) TIMEOUT = 4;
    // count inputs to be filled from MS Excel
    Object.keys(config).forEach(function(v){
        if(1 <= +v[0] && +v[0] <= 5) pageConfigInputls[v[0]]++
        else console.error('not used config id =', +v[0])
    })
if('dev')console.log('config, pageConfigInputls', config, pageConfigInputls)
}

function __msg(msg){
var x
    
    if(_llogg){
        return msg && (_llogg.innerHTML += '<b style="color:black">' + msg + '</b><br>')
    }

    x = cl("div")
    x.setAttribute("id","_msgblock")
    x.setAttribute("style",
        "font-size:10pt; background-color:orange; position:fixed;"+
        "top:21px;left:7px;z-index:77;padding:2px;height:"+ hh +";overflow: scroll-y;"
    )
    x.innerHTML = ''
        // control
        +'<span id="_minmax" style="cursor:pointer;">[свернуть]</span>'
        // start button
        +'<input id="_idstart" value="Начать" style="font-weight:bold" type="button"/>'
        // description
        +'<b style="color:white">:) Автозаполнение ' + ver + '(:</b>'
        // stop button
        +'<input id="_idstop" value="Остановить" style="font-weight:bold" type="button"/>'
        +'<span id="_devinput" style="cursor:pointer;">[№ полей ввода]</span>'
        +'<div id="_wrap">'
        // input
        +'<textarea id="_data" onfocus="javascript:this.value=' + "''"
+'" id="ccfgg" style="font-size:8pt;background-color:lightgreen;resize:none;" '
+'rows="2" cols="44">Без данных будет показано\nДемо автозаполнения (само тест)</textarea>'
        +'--<textarea id="_cfg" onfocus="javascript:this.value=' + "''"
+'" id="ccfgg" style="font-size:8pt;background-color:lightgreen;resize:none;" '
+'rows="2" cols="22">Конфигурация</textarea>'

        // logger
        +'<div id="_llogg" style="font-size:10pt; background-color:#FFE4E1; max-height: 11em; overflow: scroll;"></div>'
        +'</div>' // wrap

    gt('body').appendChild(x)

    _llogg = gi("_llogg")
    _data = gi('_data')
    _cfg = gi('_cfg')
    
    _cfg.onchange = readConfig
    
    gi('_minmax').onclick = function(){
    var el = gi('_msgblock'), wel = gi('_wrap')
        minmax = minmax
        ? (el.style.height = hh, this.innerText = '[свернуть]',
          wel.style.display = 'block', !true
        )
        : (el.style.height = '22px', this.innerText = '[развернуть]',
          wel.style.display = 'none', true
        )
    }
    gi('_devinput').onclick = function(){
        pageId = window.location.hash.slice(-1) || '1'
        Array.prototype.forEach.bind(gs('input'))(function(el, idx){
            // prefix with page number
            (el.id[0] != '_') && (el.value = pageId + '!' + ++idx)
        })
    }
    gi('_idstart').onclick = __start
    gi('_idstop').onclick = __stop
}

function __start(){
    pageId = window.location.hash.slice(-1) || '1'

    __msg('start')
    if('1' == pageId) return fillPageId()
    if('2' == pageId) return pageExpand(), fillPageId()
    //if('3' == pageId) return pageId1to2() && fillPageId()
    //if('4' == pageId) return pageId1to2() && fillPageId()
    //if('5' == pageId) return pageId1to2() && fillPageId()
}

function __stop(){
    __msg('stop')
    clearTimeout(timer)
    timer = void 0
}

function pageExpand(){
    // expand toggle needed accordion
    jq('a.accordion-toggle').forEach(function(el){
        if(~(''+el.firstElementChild.textContent).indexOf('Юридическое лицо')){
            if(!~el.parentElement.parentElement.parentElement.className.indexOf('panel-open')){
                el.dispatchEvent(mk_click())
            }
        }
    })
}


function fillPageId(){
var el, cfgId, cfg, val
    if(!i$1){// init
        if(!pageConfigInputls[pageId]) return __msg('Нет конфигурации для страницы №' + pageId)
        
        i$1 = gs('input')
        n$1 = 0, a$1 = 1
    }
    el = i$1[n$1]
    while(el && el.id[0] === '_') el = i$1[++n$1] // skip non doc ids
    ++n$1 // next
    cfgId = pageId + '!' + a$1
    cfg = el && config[cfgId]
    if(!cfg) return ++a$1, setTimeout(fillPageId, 0) // no config, goto next
    
    val = '<' == cfg[4][0] && json[cfg[4]] // get only simple values
if('dev')console.log('config ' + cfgId, cfg)
    if(val && ('type="text"' == cfg[3] || 'txt' == cfg[3])){
        if(val.match(/^\d\d\d\d-\d\d-\d\d/)){
            val = val.replace(/^(\d\d\d\d)-(\d\d)-(\d\d)/, '$3.$2.$1')
        } else if(val.match(/^\d\d:\d\d:\d\dZ/)){
            val = val.replace(/^(\d\d):(\d\d).*/, '$1:$2')
        }
        if(~val.indexOf('&quot;')){
            val = val.replace('&quot;', '"')
        }

        el.scrollIntoView()
        el.setAttribute("value", val);
        el.value = val
        el.dispatchEvent(mk_change())
        __msg('вставили значение = ' + val + ', задержка = ' + TIMEOUT + ' (сек.)')
    }
    // next input name
    if(++a$1 <= i$1.length) timer = setTimeout(fillPageId, TIMEOUT*1000) // next input
    else {
        __msg('конец страницы №' + pageId + '<br>Проверьте данные и переходите на сл. страницу!')
        i$1 = null // reset to init
        // goto page 2
        //el = jq('a.btn-primary')[0]
        //el.dispatchEvent(mk_click())
        // next page
        //timer = setTimeout(__start, TIMEOUT*1000)
    }
}

/*
function fillPageId$1(){
var el, cfg, val
    if(!i$1){// init
        i$1 = gs('input')
        n$1 = 0, a$1 = 1
    }
    el = i$1[n$1]
    while(el.id[0] === '_') el = i$1[++n$1] // skip non doc ids
    ++n$1 // next
    cfg = el && config['1!' + a$1]
    val = cfg && '<' == cfg[4][0] && json[cfg[4]] // get only simple values
if('dev')console.log('config 1!' + a$1, cfg)
    if(val && ('type="text"' == cfg[3] || 'txt' == cfg[3])){
        if(val.match(/^\d\d\d\d-\d\d-\d\d/)){
            val = val.replace(/^(\d\d\d\d)-(\d\d)-(\d\d)/, '$3.$2.$1')
        } else if(val.match(/^\d\d:\d\d:\d\dZ/)){
            val = val.replace(/^(\d\d):(\d\d).* /, '$1:$2')
        }
        if(~val.indexOf('&quot;')){
            val = val.replace('&quot;', '"')
        }

        el.setAttribute("value", val);
        el.value = val
        el.dispatchEvent(mk_change())
        __msg('вставили значение = ' + val + ', задержка = ' + TIMEOUT + ' (сек.)')
    }
    // next input name
    if(++a$1 <= len$1) timer = setTimeout(fillPageId$1, TIMEOUT*1000) // next input
    else {
        __msg('конец первой страницы')
        i$1 = null // reset to init
        // goto page 2
        //el = jq('a.btn-primary')[0]
        //el.dispatchEvent(mk_click())
        // next page
        timer = setTimeout(__start, TIMEOUT*1000)
    }
}
*/

cfgTxt = `ПОРТАЛ первая страница	Задержка ввода:	1	секунд(ы)		
Имя на сайте	"HTML
порядковый
номер"	или HTML идентификатор	HTML тип ввода	Имя в иерархии XML	
Дата составления	1!1		type="text"	<ESADout_CU:ExecutionDate>	
Тип ТД	1!2		type="text"	<ESADout_CU:ElectronicDocumentSign>	
Пункт ввоза/вывоза					
Код	1!3		type="text"	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:PPBorderCustoms><cat_ru:Code>	
Наименование 	1!4		type="text"	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:PPBorderCustoms><cat_ru:OfficeName>	
Дата 	1!5		type="text"	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:DateExpectedArrival>	
Время 	1!6		type="text"	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:TimeExpectedArrival>	
Тип декларации (№1)					
(поле 1)	1!7		type="text"	<ESADout_CU:CustomsProcedure>	
(поле 2)	1!8		type="text"		
(поле 3)	1!9		type="text"	<ESADout_CU:TransitDirectionCode>	
Код цели перемещения					
(поле)	1!10		type="text"	<ESADout_CU:MovementCode>	
ПОРТАЛ вторая страница					
Отправитель (№2) Юридическое лицо					
Наименование	2!3		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:ShortName>	
Страна					
Цифровой код	2!4		txt	?countries	ДОБАВИТЬ: справочник
Буквенный код 	2!5		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:CountryCode>	
Наименование	2!6		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:CounryName>	
Почтовый индекс	2!7		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:PostalCode>	
Наименование региона					
Населенный пункт	2!9		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:City>	
Улица и дом	2!10		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:StreetHouse>	
Получатель (№8) Юридическое лицо					
Наименование	2!34		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:ShortName>	
Страна					
Цифровой код	2!35		txt	?countries	
Буквенный код 	2!36		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:CountryCode>	
Наименование	2!37		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:CounryName>	
Почтовый индекс	2!38		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:PostalCode>
Наименование региона				
Населенный пункт	2!40		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:City>
Улица и дом	2!41		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:StreetHouse>
Принципал (№50) Юридическое лицо				
УНП	2!63		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:RBOrganizationFeatures><cat_ru:UNP>
Наименование	2!64		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:ShortName>
Страна				
Цифровой код	2!65		txt	?countries
Буквенный код 	2!66		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:CountryCode>
Наименование	2!67		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:CounryName>
Почтовый индекс	2!68		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:PostalCode>
Наименование региона	2!69		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:Region>
Населенный пункт	2!70		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:City>
Улица и дом	2!71		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:StreetHouse>
Перевозчик (№50) Юридическое лицо				
УНП	2!93		txt	
Наименование	2!94		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:ShortName>
Страна				
Цифровой код	2!95		txt	?countries
Буквенный код 	2!96		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:CountryCode>
Наименование	2!97		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:CounryName>
Почтовый индекс	2!98		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:PostalCode>
Наименование региона	2!99		txt	
Населенный пункт	2!100		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:City>
Улица и дом	2!101		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:StreetHouse>
Информация о водителе				
Страна				
Цифровой код	2!114		txt	?countries
Буквенный код 	2!115		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:RegCountryCode>
Наименование	2!116		txt	?countries
Код документа	2!117		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:IdentityCard><cat_ru:IdentityCardCode>
Номер	2!118		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:IdentityCard><cat_ru:IdentityCardNumber>
Дата выдачи	2!119		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:IdentityCard><cat_ru:IdentityCardDate>
Фамилия	2!120		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:PersonSurname>
Имя	2!121		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:PersonName>
Отчество	2!122		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:PersonMiddleName>
Должность	2!123		txt	<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:PersonPost>
`;

readConfig()

var json = {
    "<cat_ru:DocumentID>": "A311E211C0A864640096523C7F3CBDFF",
    "<ESADout_CU:CustomsProcedure>": "ТТ",
    "<ESADout_CU:TransitDirectionCode>": "ИМ",
    "<ESADout_CU:ElectronicDocumentSign>": "03",
    "<ESADout_CU:LanguageCUESAD>": "RU",
    "<ESADout_CU:RecipientCountryCode>": "BY",
    "<ESADout_CU:MovementCode>": "12",
    "<ESADout_CU:RegNumberDoc>": "19681",
    "<ESADout_CU:ExecutionDate>": "2017-10-05",
    "<ESADout_CU:ESADout_CUGoodsShipment><catESAD_cu:TotalGoodsNumber>": "11",
    "<ESADout_CU:ESADout_CUGoodsShipment><catESAD_cu:TotalPackageNumber>": "15",
    "<ESADout_CU:ESADout_CUGoodsShipment><catESAD_cu:TotalSheetNumber>": "5",
    "<ESADout_CU:ESADout_CUGoodsShipment><catESAD_cu:TotalCustCost>": "530039.12",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:ShortName>": "AARBAKKE AS",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:OrganizationLanguage>": "RU",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:PostalCode>": "4340",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:CountryCode>": "NO",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:CounryName>": "НОРВЕГИЯ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:City>": "BRYNE",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><cat_ru:Address><cat_ru:StreetHouse>": "BREIMYRA 1",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignor><ESADout_CU:DeclarantEqualFlag>": "0",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:ShortName>": "WEATHERFORD LLC",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:OrganizationLanguage>": "RU",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:PostalCode>": "125047",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:CountryCode>": "RU",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:CounryName>": "РОССИЯ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:City>": "MOSCOW",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><cat_ru:Address><cat_ru:StreetHouse>": "4TH LESNOY PEREULOK  D.№4, KV E'T.12;13;14",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><ESADout_CU:ContractorIndicator>": "0",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsignee><ESADout_CU:DeclarantEqualFlag>": "0",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:ShortName>": "ООО &quot;ВЕСТИНТЕРТРАНС&quot;",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:OrganizationLanguage>": "RU",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:RBOrganizationFeatures><cat_ru:UNP>": "800000320",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:PostalCode>": "220089",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:CountryCode>": "BY",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:CounryName>": "БЕЛАРУСЬ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:Region>": "БЕЛАРУСЬ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:City>": "МИНСК",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUDeclarant><cat_ru:Address><cat_ru:StreetHouse>": "ПР-КТ ДЗЕРЖИНСКОГО Д.57, ПОМ.49",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:ShortName>": "ООО &quot;ПЕРВЫЙ ЭЛЕМЕНТ&quot;",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:OrganizationLanguage>": "RU",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:PostalCode>": "127410",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:CountryCode>": "RU",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:CounryName>": "РОССИЯ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:City>": "МОСКВА",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><cat_ru:Address><cat_ru:StreetHouse>": "ПРОЕЗД ПУТЕВОЙ, 15",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:PersonSurname>": "ИВАНЕЙЧИК",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:PersonName>": "КОНСТАНТИН",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:PersonMiddleName>": "ВИКТОРОВИЧ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:PersonPost>": "ВОДИТЕЛЬ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:RegCountryCode>": "BY",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:IdentityCard><cat_ru:IdentityCardCode>": "03",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:IdentityCard><cat_ru:IdentityCardNumber>": "MC2811684",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUCarrier><ESADout_CU:ESADout_CUDriverInformation><cat_ru:IdentityCard><cat_ru:IdentityCardDate>": "2016-03-21",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><catESAD_cu:ContainerIndicator>": "0",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><catESAD_cu:DispatchCountryCode>": "PL",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><catESAD_cu:DispatchCountryName>": "ПОЛЬША",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><catESAD_cu:DestinationCountryCode>": "RU",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><catESAD_cu:DestinationCountryName>": "РОССИЯ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:DateExpectedArrival>": "2017-08-31",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:TimeExpectedArrival>": "16:52:00Z",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUDepartureArrivalTransport><cat_ru:TransportNationalityCode>": "BY",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUDepartureArrivalTransport><ESADout_CU:TransportMeansQuantity>": "2",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUDepartureArrivalTransport><ESADout_CU:TransportMeans><cat_ru:VIN>": "WK0S0002400148963",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUDepartureArrivalTransport><ESADout_CU:TransportMeans><cat_ru:TransportKindCode>": "320",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUDepartureArrivalTransport><ESADout_CU:TransportMeans><cat_ru:TransportMarkCode>": "001",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUDepartureArrivalTransport><ESADout_CU:TransportMeans><cat_ru:TransportIdentifier>": "BY7036 77",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUDepartureArrivalTransport><ESADout_CU:TransportMeans><cat_ru:TransportMeansNationalityCode>": "RU",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUDepartureArrivalTransport><ESADout_CU:TransportMeans><cat_ru:TransportRegNumber>": "77 ХУ 049543",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUBorderTransport><cat_ru:TransportModeCode>": "31",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUReloadingInfo><catESAD_cu:ReloadCountryCode>": "BY",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUReloadingInfo><catESAD_cu:ReloadCountryName>": "БЕЛАРУСЬ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUReloadingInfo><catESAD_cu:ContainerIndicator>": "0",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUReloadingInfo><catESAD_cu:ReloadingTransportMeans><cat_ru:VIN>": "YS2R4X20005372940",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUReloadingInfo><catESAD_cu:ReloadingTransportMeans><cat_ru:TransportIdentifier>": "O804BY777/BY7036 77",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUReloadingInfo><catESAD_cu:ReloadingTransportMeans><cat_ru:TransportMeansNationalityCode>": "RU",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUReloadingInfo><catESAD_cu:ReloadingTransportMeans><cat_ru:TransportRegNumber>": "77 29 № 286820",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUReloadingInfo><catESAD_cu:ReloadingCustomsOffice><cat_ru:Code>": "",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:ESADout_CUReloadingInfo><catESAD_cu:ReloadingCustomsOffice><cat_ru:OfficeName>": "МИНСК",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:PPBorderCustoms><cat_ru:Code>": "16419",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:PPBorderCustoms><cat_ru:OfficeName>": "БЕРЕСТОВИЦА",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:TDDeliveryPlace><ESADout_CU:DeliveryCustomsOffice><cat_ru:Code>": "10013110",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:TDDeliveryPlace><ESADout_CU:DeliveryCustomsOffice><cat_ru:OfficeName>": "Т/П ЛЕНИНГРАДСКИЙ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUConsigment><ESADout_CU:TDDeliveryPlace><ESADout_CU:DeliveryCustomsOffice><cat_ru:CustomsCountryCode>": "643",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUMainContractTerms><catESAD_cu:ContractCurrencyCode>": "USD",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUMainContractTerms><catESAD_cu:CurrencyQuantity>": "1",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUMainContractTerms><catESAD_cu:ContractCurrencyRate>": "1.965",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUMainContractTerms><catESAD_cu:TotalInvoiceAmount>": "269740",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><catESAD_cu:GoodsNumeric>": "11",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><catESAD_cu:GoodsDescription>": "ПЕРЕХОДНИК РАЗЪЕМ 5.500",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><catESAD_cu:GrossWeightQuantity>": "50",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><catESAD_cu:InvoicedCost>": "4118",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><catESAD_cu:CustomsCost>": "8091.87",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><catESAD_cu:GoodsTNVEDCode>": "8535900009",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><catESAD_cu:AdditionalSheetCount>": "5",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><ESADout_CU:MilitaryProducts>": "0",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><ESADout_CU:CurrencyCode>": "USD",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><ESADout_CU:ESADout_CUPresentedDocument><cat_ru:PrDocumentNumber>": "02/1152",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><ESADout_CU:ESADout_CUPresentedDocument><cat_ru:PrDocumentDate>": "2014-01-24",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><ESADout_CU:ESADout_CUPresentedDocument><catESAD_cu:PresentedDocumentModeCode>": "10021",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><ESADout_CU:ESADGoodsPackaging><catESAD_cu:PakageQuantity>": "0",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:ESADout_CUGoods><ESADout_CU:ESADGoodsPackaging><catESAD_cu:PackageCode>": "ZZ",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:TDGuarantee><catESAD_cu:MeasureCode>": "08",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:TDGuarantee><catESAD_cu:DocNumber>": "ТП-0600/0000230",
    "<ESADout_CU:ESADout_CUGoodsShipment><ESADout_CU:TDGuarantee><catESAD_cu:DocDate>": "2016-12-26",
    "<ESADout_CU:FilledPerson><cat_ru:PersonSurname>": "ИВАНЕЙЧИК",
    "<ESADout_CU:FilledPerson><cat_ru:PersonName>": "КОНСТАНТИН",
    "<ESADout_CU:FilledPerson><cat_ru:PersonMiddleName>": "ВИКТОРОВИЧ",
    "<ESADout_CU:FilledPerson><cat_ru:PersonPost>": "ВОДИТЕЛЬ",
    "<ESADout_CU:FilledPerson><catESAD_cu:IdentityCard><cat_ru:IdentityCardCode>": "03",
    "<ESADout_CU:FilledPerson><catESAD_cu:IdentityCard><cat_ru:IdentityCardNumber>": "MC2811684",
    "<ESADout_CU:FilledPerson><catESAD_cu:IdentityCard><cat_ru:IdentityCardDate>": "2016-03-21"
}

var countries = [{"letterCode":"00","name":"НЕИЗВЕСТНА","digitCode":"000"},{"letterCode":"99","name":"РАЗНЫЕ","digitCode":"999"},{"letterCode":"AD","name":"АНДОРРА","digitCode":"020"},{"letterCode":"AE","name":"ОБЪЕДИНЕННЫЕ АРАБСКИЕ ЭМИРАТЫ","digitCode":"784"},{"letterCode":"AF","name":"АФГАНИСТАН","digitCode":"004"},{"letterCode":"AG","name":"АНТИГУА И БАРБУДА","digitCode":"028"},{"letterCode":"AI","name":"АНГИЛЬЯ","digitCode":"660"},{"letterCode":"AL","name":"АЛБАНИЯ","digitCode":"008"},{"letterCode":"AM","name":"АРМЕНИЯ","digitCode":"051"},{"letterCode":"AO","name":"АНГОЛА","digitCode":"024"},{"letterCode":"AQ","name":"АНТАРКТИДА","digitCode":"010"},{"letterCode":"AR","name":"АРГЕНТИНА","digitCode":"032"},{"letterCode":"AS","name":"АМЕРИКАНСКОЕ САМОА","digitCode":"016"},{"letterCode":"AT","name":"АВСТРИЯ","digitCode":"040"},{"letterCode":"AU","name":"АВСТРАЛИЯ","digitCode":"036"},{"letterCode":"AW","name":"АРУБА","digitCode":"533"},{"letterCode":"AX","name":"ЭЛАНДСКИЕ ОСТРОВА","digitCode":"248"},{"letterCode":"AZ","name":"АЗЕРБАЙДЖАН","digitCode":"031"},{"letterCode":"BA","name":"БОСНИЯ И ГЕРЦЕГОВИНА","digitCode":"070"},{"letterCode":"BB","name":"БАРБАДОС","digitCode":"052"},{"letterCode":"BD","name":"БАНГЛАДЕШ","digitCode":"050"},{"letterCode":"BE","name":"БЕЛЬГИЯ","digitCode":"056"},{"letterCode":"BF","name":"БУРКИНА-ФАСО","digitCode":"854"},{"letterCode":"BG","name":"БОЛГАРИЯ","digitCode":"100"},{"letterCode":"BH","name":"БАХРЕЙН","digitCode":"048"},{"letterCode":"BI","name":"БУРУНДИ","digitCode":"108"},{"letterCode":"BJ","name":"БЕНИН","digitCode":"204"},{"letterCode":"BL","name":"СЕН-БАРТЕЛЕМИ","digitCode":"652"},{"letterCode":"BM","name":"БЕРМУДЫ","digitCode":"060"},{"letterCode":"BN","name":"БРУНЕЙ-ДАРУССАЛАМ","digitCode":"096"},{"letterCode":"BO","name":"БОЛИВИЯ, МНОГОНАЦИОНАЛЬНОЕ ГОСУДАРСТВО","digitCode":"068"},{"letterCode":"BQ","name":"БОНЭЙР, СИНТ-ЭСТАТИУС И САБА","digitCode":"535"},{"letterCode":"BR","name":"БРАЗИЛИЯ","digitCode":"076"},{"letterCode":"BS","name":"БАГАМЫ","digitCode":"044"},{"letterCode":"BT","name":"БУТАН","digitCode":"064"},{"letterCode":"BV","name":"ОСТРОВ БУВЕ","digitCode":"074"},{"letterCode":"BW","name":"БОТСВАНА","digitCode":"072"},{"letterCode":"BY","name":"БЕЛАРУСЬ","digitCode":"112"},{"letterCode":"BZ","name":"БЕЛИЗ","digitCode":"084"},{"letterCode":"CA","name":"КАНАДА","digitCode":"124"},{"letterCode":"CC","name":"КОКОСОВЫЕ (КИЛИНГ) ОСТРОВА","digitCode":"166"},{"letterCode":"CD","name":"КОНГО, ДЕМОКРАТИЧЕСКАЯ РЕСПУБЛИКА","digitCode":"180"},{"letterCode":"CF","name":"ЦЕНТРАЛЬНО-АФРИКАНСКАЯ РЕСПУБЛИКА","digitCode":"140"},{"letterCode":"CG","name":"КОНГО","digitCode":"178"},{"letterCode":"CH","name":"ШВЕЙЦАРИЯ","digitCode":"756"},{"letterCode":"CI","name":"КОТ Д'ИВУАР","digitCode":"384"},{"letterCode":"CK","name":"ОСТРОВА КУКА","digitCode":"184"},{"letterCode":"CL","name":"ЧИЛИ","digitCode":"152"},{"letterCode":"CM","name":"КАМЕРУН","digitCode":"120"},{"letterCode":"CN","name":"КИТАЙ","digitCode":"156"},{"letterCode":"CO","name":"КОЛУМБИЯ","digitCode":"170"},{"letterCode":"CR","name":"КОСТА-РИКА","digitCode":"188"},{"letterCode":"CU","name":"КУБА","digitCode":"192"},{"letterCode":"CV","name":"КАБО-ВЕРДЕ","digitCode":"132"},{"letterCode":"CW","name":"КЮРАСАО","digitCode":"531"},{"letterCode":"CX","name":"ОСТРОВ РОЖДЕСТВА","digitCode":"162"},{"letterCode":"CY","name":"КИПР","digitCode":"196"},{"letterCode":"CZ","name":"ЧЕШСКАЯ РЕСПУБЛИКА","digitCode":"203"},{"letterCode":"DE","name":"ГЕРМАНИЯ","digitCode":"276"},{"letterCode":"DJ","name":"ДЖИБУТИ","digitCode":"262"},{"letterCode":"DK","name":"ДАНИЯ","digitCode":"208"},{"letterCode":"DM","name":"ДОМИНИКА","digitCode":"212"},{"letterCode":"DO","name":"ДОМИНИКАНСКАЯ РЕСПУБЛИКА","digitCode":"214"},{"letterCode":"DZ","name":"АЛЖИР","digitCode":"012"},{"letterCode":"EC","name":"ЭКВАДОР","digitCode":"218"},{"letterCode":"EE","name":"ЭСТОНИЯ","digitCode":"233"},{"letterCode":"EG","name":"ЕГИПЕТ","digitCode":"818"},{"letterCode":"EH","name":"ЗАПАДНАЯ САХАРА","digitCode":"732"},{"letterCode":"ER","name":"ЭРИТРЕЯ","digitCode":"232"},{"letterCode":"ES","name":"ИСПАНИЯ","digitCode":"724"},{"letterCode":"ET","name":"ЭФИОПИЯ","digitCode":"231"},{"letterCode":"EU","name":"ЕВРОСОЮЗ","digitCode":"111"},{"letterCode":"FI","name":"ФИНЛЯНДИЯ","digitCode":"246"},{"letterCode":"FJ","name":"ФИДЖИ","digitCode":"242"},{"letterCode":"FK","name":"ФОЛКЛЕНДСКИЕ ОСТРОВА (МАЛЬВИНСКИЕ)","digitCode":"238"},{"letterCode":"FM","name":"МИКРОНЕЗИЯ, ФЕДЕРАТИВНЫЕ ШТАТЫ","digitCode":"583"},{"letterCode":"FO","name":"ФАРЕРСКИЕ ОСТРОВА","digitCode":"234"},{"letterCode":"FR","name":"ФРАНЦИЯ","digitCode":"250"},{"letterCode":"GA","name":"ГАБОН","digitCode":"266"},{"letterCode":"GB","name":"СОЕДИНЕННОЕ КОРОЛЕВСТВО","digitCode":"826"},{"letterCode":"GD","name":"ГРЕНАДА","digitCode":"308"},{"letterCode":"GE","name":"ГРУЗИЯ","digitCode":"268"},{"letterCode":"GF","name":"ФРАНЦУЗСКАЯ ГВИАНА","digitCode":"254"},{"letterCode":"GG","name":"ГЕРНСИ","digitCode":"831"},{"letterCode":"GH","name":"ГАНА","digitCode":"288"},{"letterCode":"GI","name":"ГИБРАЛТАР","digitCode":"292"},{"letterCode":"GL","name":"ГРЕНЛАНДИЯ","digitCode":"304"},{"letterCode":"GM","name":"ГАМБИЯ","digitCode":"270"},{"letterCode":"GN","name":"ГВИНЕЯ","digitCode":"324"},{"letterCode":"GP","name":"ГВАДЕЛУПА","digitCode":"312"},{"letterCode":"GQ","name":"ЭКВАТОРИАЛЬНАЯ ГВИНЕЯ","digitCode":"226"},{"letterCode":"GR","name":"ГРЕЦИЯ","digitCode":"300"},{"letterCode":"GS","name":"ЮЖН.ДЖОРДЖИЯ И ЮЖН.САНДВИЧ.ОСТРОВА","digitCode":"239"},{"letterCode":"GT","name":"ГВАТЕМАЛА","digitCode":"320"},{"letterCode":"GU","name":"ГУАМ","digitCode":"316"},{"letterCode":"GW","name":"ГВИНЕЯ-БИСАУ","digitCode":"624"},{"letterCode":"GY","name":"ГАЙАНА","digitCode":"328"},{"letterCode":"HK","name":"ГОНКОНГ","digitCode":"344"},{"letterCode":"HM","name":"ОСТРОВ ХЕРД И ОСТРОВА МАКДОНАЛЬД","digitCode":"334"},{"letterCode":"HN","name":"ГОНДУРАС","digitCode":"340"},{"letterCode":"HR","name":"ХОРВАТИЯ","digitCode":"191"},{"letterCode":"HT","name":"ГАИТИ","digitCode":"332"},{"letterCode":"HU","name":"ВЕНГРИЯ","digitCode":"348"},{"letterCode":"ID","name":"ИНДОНЕЗИЯ","digitCode":"360"},{"letterCode":"IE","name":"ИРЛАНДИЯ","digitCode":"372"},{"letterCode":"IL","name":"ИЗРАИЛЬ","digitCode":"376"},{"letterCode":"IM","name":"ОСТРОВ МЭН","digitCode":"833"},{"letterCode":"IN","name":"ИНДИЯ","digitCode":"356"},{"letterCode":"IO","name":"БРИТАНСКАЯ ТЕРРИТОРИЯ В ИНДИЙСКОМ ОКЕАНЕ","digitCode":"086"},{"letterCode":"IQ","name":"ИРАК","digitCode":"368"},{"letterCode":"IR","name":"ИРАН, ИСЛАМСКАЯ РЕСПУБЛИКА","digitCode":"364"},{"letterCode":"IS","name":"ИСЛАНДИЯ","digitCode":"352"},{"letterCode":"IT","name":"ИТАЛИЯ","digitCode":"380"},{"letterCode":"JE","name":"ДЖЕРСИ","digitCode":"832"},{"letterCode":"JM","name":"ЯМАЙКА","digitCode":"388"},{"letterCode":"JO","name":"ИОРДАНИЯ","digitCode":"400"},{"letterCode":"JP","name":"ЯПОНИЯ","digitCode":"392"},{"letterCode":"KE","name":"КЕНИЯ","digitCode":"404"},{"letterCode":"KG","name":"КИРГИЗИЯ","digitCode":"417"},{"letterCode":"KH","name":"КАМБОДЖА","digitCode":"116"},{"letterCode":"KI","name":"КИРИБАТИ","digitCode":"296"},{"letterCode":"KM","name":"КОМОРЫ","digitCode":"174"},{"letterCode":"KN","name":"СЕНТ-КИТС И НЕВИС","digitCode":"659"},{"letterCode":"KP","name":"КОРЕЯ, НАРОДНО-ДЕМОКРАТИЧ. РЕСПУБЛИКА","digitCode":"408"},{"letterCode":"KR","name":"КОРЕЯ, РЕСПУБЛИКА","digitCode":"410"},{"letterCode":"KW","name":"КУВЕЙТ","digitCode":"414"},{"letterCode":"KY","name":"ОСТРОВА КАЙМАН","digitCode":"136"},{"letterCode":"KZ","name":"КАЗАХСТАН","digitCode":"398"},{"letterCode":"LA","name":"ЛАОССКАЯ НАРОДНО-ДЕМОКРАТИЧ. РЕСПУБЛИКА","digitCode":"418"},{"letterCode":"LB","name":"ЛИВАН","digitCode":"422"},{"letterCode":"LC","name":"СЕНТ-ЛЮСИЯ","digitCode":"662"},{"letterCode":"LI","name":"ЛИХТЕНШТЕЙН","digitCode":"438"},{"letterCode":"LK","name":"ШРИ-ЛАНКА","digitCode":"144"},{"letterCode":"LR","name":"ЛИБЕРИЯ","digitCode":"430"},{"letterCode":"LS","name":"ЛЕСОТО","digitCode":"426"},{"letterCode":"LT","name":"ЛИТВА","digitCode":"440"},{"letterCode":"LU","name":"ЛЮКСЕМБУРГ","digitCode":"442"},{"letterCode":"LV","name":"ЛАТВИЯ","digitCode":"428"},{"letterCode":"LY","name":"ЛИВИЯ","digitCode":"434"},{"letterCode":"MA","name":"МАРОККО","digitCode":"504"},{"letterCode":"MC","name":"МОНАКО","digitCode":"492"},{"letterCode":"MD","name":"МОЛДОВА, РЕСПУБЛИКА","digitCode":"498"},{"letterCode":"ME","name":"ЧЕРНОГОРИЯ","digitCode":"499"},{"letterCode":"MF","name":"СЕН-МАРТЕН","digitCode":"663"},{"letterCode":"MG","name":"МАДАГАСКАР","digitCode":"450"},{"letterCode":"MH","name":"МАРШАЛЛОВЫ ОСТРОВА","digitCode":"584"},{"letterCode":"MK","name":"РЕСПУБЛИКА МАКЕДОНИЯ","digitCode":"807"},{"letterCode":"ML","name":"МАЛИ","digitCode":"466"},{"letterCode":"MM","name":"МЬЯНМА","digitCode":"104"},{"letterCode":"MN","name":"МОНГОЛИЯ","digitCode":"496"},{"letterCode":"MO","name":"МАКАО","digitCode":"446"},{"letterCode":"MP","name":"СЕВЕРНЫЕ МАРИАНСКИЕ ОСТРОВА","digitCode":"580"},{"letterCode":"MQ","name":"МАРТИНИКА","digitCode":"474"},{"letterCode":"MR","name":"МАВРИТАНИЯ","digitCode":"478"},{"letterCode":"MS","name":"МОНТСЕРРАТ","digitCode":"500"},{"letterCode":"MT","name":"МАЛЬТА","digitCode":"470"},{"letterCode":"MU","name":"МАВРИКИЙ","digitCode":"480"},{"letterCode":"MV","name":"МАЛЬДИВЫ","digitCode":"462"},{"letterCode":"MW","name":"МАЛАВИ","digitCode":"454"},{"letterCode":"MX","name":"МЕКСИКА","digitCode":"484"},{"letterCode":"MY","name":"МАЛАЙЗИЯ","digitCode":"458"},{"letterCode":"MZ","name":"МОЗАМБИК","digitCode":"508"},{"letterCode":"NA","name":"НАМИБИЯ","digitCode":"516"},{"letterCode":"NC","name":"НОВАЯ КАЛЕДОНИЯ","digitCode":"540"},{"letterCode":"NE","name":"НИГЕР","digitCode":"562"},{"letterCode":"NF","name":"ОСТРОВ НОРФОЛК","digitCode":"574"},{"letterCode":"NG","name":"НИГЕРИЯ","digitCode":"566"},{"letterCode":"NI","name":"НИКАРАГУА","digitCode":"558"},{"letterCode":"NL","name":"НИДЕРЛАНДЫ","digitCode":"528"},{"letterCode":"NO","name":"НОРВЕГИЯ","digitCode":"578"},{"letterCode":"NP","name":"НЕПАЛ","digitCode":"524"},{"letterCode":"NR","name":"НАУРУ","digitCode":"520"},{"letterCode":"NU","name":"НИУЭ","digitCode":"570"},{"letterCode":"NZ","name":"НОВАЯ ЗЕЛАНДИЯ","digitCode":"554"},{"letterCode":"OM","name":"ОМАН","digitCode":"512"},{"letterCode":"PA","name":"ПАНАМА","digitCode":"591"},{"letterCode":"PE","name":"ПЕРУ","digitCode":"604"},{"letterCode":"PF","name":"ФРАНЦУЗСКАЯ ПОЛИНЕЗИЯ","digitCode":"258"},{"letterCode":"PG","name":"ПАПУА НОВАЯ ГВИНЕЯ","digitCode":"598"},{"letterCode":"PH","name":"ФИЛИППИНЫ","digitCode":"608"},{"letterCode":"PK","name":"ПАКИСТАН","digitCode":"586"},{"letterCode":"PL","name":"ПОЛЬША","digitCode":"616"},{"letterCode":"PM","name":"СЕНТ-ПЬЕР И МИКЕЛОН","digitCode":"666"},{"letterCode":"PN","name":"ПИТКЭРН","digitCode":"612"},{"letterCode":"PR","name":"ПУЭРТО-РИКО","digitCode":"630"},{"letterCode":"PS","name":"ПАЛЕСТИНА, ГОСУДАРСТВО","digitCode":"275"},{"letterCode":"PT","name":"ПОРТУГАЛИЯ","digitCode":"620"},{"letterCode":"PW","name":"ПАЛАУ","digitCode":"585"},{"letterCode":"PY","name":"ПАРАГВАЙ","digitCode":"600"},{"letterCode":"QA","name":"КАТАР","digitCode":"634"},{"letterCode":"RE","name":"РЕЮНЬОН","digitCode":"638"},{"letterCode":"RO","name":"РУМЫНИЯ","digitCode":"642"},{"letterCode":"RS","name":"СЕРБИЯ","digitCode":"688"},{"letterCode":"RU","name":"РОССИЯ","digitCode":"643"},{"letterCode":"RW","name":"РУАНДА","digitCode":"646"},{"letterCode":"SA","name":"САУДОВСКАЯ АРАВИЯ","digitCode":"682"},{"letterCode":"SB","name":"СОЛОМОНОВЫ ОСТРОВА","digitCode":"090"},{"letterCode":"SC","name":"СЕЙШЕЛЫ","digitCode":"690"},{"letterCode":"SD","name":"СУДАН","digitCode":"736"},{"letterCode":"SE","name":"ШВЕЦИЯ","digitCode":"752"},{"letterCode":"SG","name":"СИНГАПУР","digitCode":"702"},{"letterCode":"SH","name":"СВ. ЕЛЕНА, О. ВОЗНЕСЕНИЯ, ТР.-ДА-КУНЬЯ","digitCode":"654"},{"letterCode":"SI","name":"СЛОВЕНИЯ","digitCode":"705"},{"letterCode":"SJ","name":"ШПИЦБЕРГЕН И ЯН МАЙЕН","digitCode":"744"},{"letterCode":"SK","name":"СЛОВАКИЯ","digitCode":"703"},{"letterCode":"SL","name":"СЬЕРРА-ЛЕОНЕ","digitCode":"694"},{"letterCode":"SM","name":"САН-МАРИНО","digitCode":"674"},{"letterCode":"SN","name":"СЕНЕГАЛ","digitCode":"686"},{"letterCode":"SO","name":"СОМАЛИ","digitCode":"706"},{"letterCode":"SR","name":"СУРИНАМ","digitCode":"740"},{"letterCode":"SS","name":"ЮЖНЫЙ СУДАН","digitCode":"728"},{"letterCode":"ST","name":"САН-ТОМЕ И ПРИНСИПИ","digitCode":"678"},{"letterCode":"SV","name":"ЭЛЬ-САЛЬВАДОР","digitCode":"222"},{"letterCode":"SX","name":"СЕН-МАРТЕН (нидерландская часть)","digitCode":"534"},{"letterCode":"SY","name":"СИРИЙСКАЯ АРАБСКАЯ РЕСПУБЛИКА","digitCode":"760"},{"letterCode":"SZ","name":"СВАЗИЛЕНД","digitCode":"748"},{"letterCode":"TC","name":"ОСТРОВА ТЕРКС И КАЙКОС","digitCode":"796"},{"letterCode":"TD","name":"ЧАД","digitCode":"148"},{"letterCode":"TF","name":"ФРАНЦУЗСКИЕ ЮЖНЫЕ ТЕРРИТОРИИ","digitCode":"260"},{"letterCode":"TG","name":"ТОГО","digitCode":"768"},{"letterCode":"TH","name":"ТАИЛАНД","digitCode":"764"},{"letterCode":"TJ","name":"ТАДЖИКИСТАН","digitCode":"762"},{"letterCode":"TK","name":"ТОКЕЛАУ","digitCode":"772"},{"letterCode":"TL","name":"ТИМОР-ЛЕСТЕ","digitCode":"626"},{"letterCode":"TM","name":"ТУРКМЕНИЯ","digitCode":"795"},{"letterCode":"TN","name":"ТУНИС","digitCode":"788"},{"letterCode":"TO","name":"ТОНГА","digitCode":"776"},{"letterCode":"TR","name":"ТУРЦИЯ","digitCode":"792"},{"letterCode":"TT","name":"ТРИНИДАД И ТОБАГО","digitCode":"780"},{"letterCode":"TV","name":"ТУВАЛУ","digitCode":"798"},{"letterCode":"TW","name":"ТАЙВАНЬ (КИТАЙ)","digitCode":"158"},{"letterCode":"TZ","name":"ТАНЗАНИЯ, ОБЪЕДИНЕННАЯ РЕСПУБЛИКА","digitCode":"834"},{"letterCode":"UA","name":"УКРАИНА","digitCode":"804"},{"letterCode":"UG","name":"УГАНДА","digitCode":"800"},{"letterCode":"UM","name":"МАЛЫЕ ТИХООКЕАН.ОТДАЛЕН.ОСТ-ВА С.Ш.","digitCode":"581"},{"letterCode":"US","name":"СОЕДИНЕННЫЕ ШТАТЫ","digitCode":"840"},{"letterCode":"UY","name":"УРУГВАЙ","digitCode":"858"},{"letterCode":"UZ","name":"УЗБЕКИСТАН","digitCode":"860"},{"letterCode":"VA","name":"ПАПСКИЙ ПРЕСТОЛ(ГОС.-ГОРОД ВАТИКАН)","digitCode":"336"},{"letterCode":"VC","name":"СЕНТ-ВИНСЕНТ И ГРЕНАДИНЫ","digitCode":"670"},{"letterCode":"VE","name":"ВЕНЕСУЭЛА,БОЛИВАРИАНСКАЯ РЕСПУБЛИКА","digitCode":"862"},{"letterCode":"VG","name":"ВИРГИНСКИЕ ОСТРОВА, БРИТАНСКИЕ","digitCode":"092"},{"letterCode":"VI","name":"ВИРГИНСКИЕ ОСТРОВА, США","digitCode":"850"},{"letterCode":"VN","name":"ВЬЕТНАМ","digitCode":"704"},{"letterCode":"VU","name":"ВАНУАТУ","digitCode":"548"},{"letterCode":"WF","name":"УОЛЛИС И ФУТУНА","digitCode":"876"},{"letterCode":"WS","name":"САМОА","digitCode":"882"},{"letterCode":"YE","name":"ЙЕМЕН","digitCode":"887"},{"letterCode":"YT","name":"МАЙОТТА","digitCode":"175"},{"letterCode":"ZA","name":"ЮЖНАЯ АФРИКА","digitCode":"710"},{"letterCode":"ZM","name":"ЗАМБИЯ","digitCode":"894"},{"letterCode":"ZW","name":"ЗИМБАБВЕ","digitCode":"716"}]

}(window ,document ,localStorage ,alert ,setTimeout ,console ? console : function(){})
