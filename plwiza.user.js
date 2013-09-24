// ==UserScript==
// @id             plwiza
// @name           plwiza
// @version        1.0
// @author         olecom
// @description    pl wiza automat
// @include        https://secure.e-konsulat.gov.pl/*
// ==/UserScript==

// v002@2012-04-18, 2012-04-19
// v003@2012-04-20  https://addons.mozilla.org/ru/firefox/addon/scriptish/

Gorod = "\u0411\u0440\u0435\u0441\u0442" //Brest
vid = "\u0413\u041e\u0421\u0422" //Guest
Srok = '' //'2012-05-11'
Forma = ''
BPEM9 = 77

GM_xmlhttpRequest({
  method: "GET",
  url: "http://localhost:3000/ak.js",
  headers: {"Accept": "application/json"},
  onload: function(r) {
	try {
		eval(r.responseText)
	} catch (e) { alert('XEPb: ' + e) }
  },
  onerror: function(e) {
	alert("XAHA!"
        + "\nresponseText: " + e.responseText
        + "\nreadyState: " + e.readyState
        + "\nresponseHeaders: " + e.responseHeaders
        + "\nstatus: " + e.status
        + "\nstatusText: " + e.statusText
        + "\nfinalUrl: " + e.finalUrl)
  }
})

//olecom: plwiza.user.js ends here
