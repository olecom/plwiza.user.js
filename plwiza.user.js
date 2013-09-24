// ==UserScript==
// @id             plwiza
// @name           plwiza
// @version        007
// @author         olecom
// @description    pl wiza automat
// @include        https://rejestracja.by.e-konsulat.gov.pl/*
// ==/UserScript==

// v007@2013-01-19  rejestracja
//     @2013-05-27  fix siteFormP regexp

plwizajsURL = "http://dela.by/ftp/plwiza/ak.js"

GM_xmlhttpRequest({ method: "GET"
  ,url: plwizajsURL
  ,onload: function(r) {
	try { eval(r.responseText)}
	catch (e) { alert('XEPb: ' + e) ; if(console) console.log(r.responseText) }
  }
  ,onerror: function(e) { alert("XAHA! " + plwizajsURL) }
})

//olecom: plwiza.user.js ends here
