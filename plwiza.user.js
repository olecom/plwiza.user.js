// ==UserScript==
// @id             plwiza
// @name           plwiza
// @version        003/004
// @author         olecom
// @description    pl wiza automat
// @include        https://secure.e-konsulat.gov.pl/*
// ==/UserScript==

// v002@2012-04-18, 2012-04-19 start
// v003@2012-04-20  uses `scriptish` as host engine

plwizajsURL = "http://dela.by/ftp/plwiza/ak.js"

GM_xmlhttpRequest({ method: "GET"
  ,url: plwizajsURL
  ,onload: function(r) {
	try { eval(r.responseText)	}
	catch (e) { alert('XEPb: ' + e) ; if(console) console.log(r.responseText) }
  }
  ,onerror: function(e) { alert("XAHA! " + plwizajsURL) }
})

//olecom: plwiza.user.js ends here
