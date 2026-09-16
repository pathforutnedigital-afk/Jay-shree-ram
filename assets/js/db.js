/* ==========================================================================
   db.js  —  डेटा लेयर  (जय श्री राम मित्र मंडळ)
   --------------------------------------------------------------------------
   सर्व माहिती ब्राउझरच्या localStorage मध्ये साठवली जाते, त्यामुळे ही वेबसाइट
   कोणत्याही सर्व्हरशिवाय पूर्णपणे चालते. Admin panel मधून केलेले बदल लगेच
   वेबसाइटवर दिसतात.

   >>> SUPABASE वर हलवायचे असल्यास:
   खाली दिलेल्या DB.list / DB.get / DB.insert / DB.update / DB.remove या पाच
   फंक्शन्समध्ये बदल केला की पुरेसे आहे. बाकी कोणतीही फाइल बदलावी लागत नाही.
   उदाहरण README.md मध्ये दिले आहे.
   ========================================================================== */

(function (global) {
  'use strict';

  var KEY = 'jsrmm_db_v1';
  var SESSION = 'jsrmm_session';

  /* ---------- उपयुक्त फंक्शन्स ---------- */
  var uid = function () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  var MONTHS = ['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर'];
  var DAYS = ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function dayName(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? '' : DAYS[d.getDay()];
  }
  function today() {
    var d = new Date(), m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
  }

  /* प्लेसहोल्डर प्रतिमा — कोणतेही बाह्य लोगो न वापरता SVG मध्ये तयार */
  function ph(text, w, h, seedIdx) {
    w = w || 800; h = h || 600;
    var pal = [['#F57C00','#FFB300'],['#C75B00','#FF9800'],['#FF9800','#FFD54F'],['#8D3B00','#F57C00'],['#F9A825','#FF8F00']];
    var c = pal[(seedIdx || 0) % pal.length];
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient>' +
      '<pattern id="p" width="46" height="46" patternUnits="userSpaceOnUse">' +
      '<circle cx="8" cy="8" r="2.6" fill="rgba(255,255,255,.3)"/></pattern></defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#p)"/>' +
      '<text x="50%" y="52%" text-anchor="middle" fill="rgba(255,255,255,.95)" ' +
      'font-family="Mukta, Noto Sans Devanagari, sans-serif" font-size="' + Math.round(w / 16) + '" font-weight="700">' +
      String(text || '').replace(/[<>&]/g, '') + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------- सुरुवातीचा नमुना डेटा ---------- */
  function seed() {
    var yr = new Date().getFullYear();
    return {
      site_settings: {
        name: '॥ जय श्री राम मित्र मंडळ ॥',
        tagline: 'परंपरा • संस्कृती • एकता • सेवा',
        address: 'जय श्री राम मित्र मंडळ, मंडळ चौक, मुख्य रस्ता, पुणे – ४११ ०००, महाराष्ट्र',
        phone: '+91 98765 43210',
        phone2: '+91 91234 56780',
        email: 'jaishriram.mandal@gmail.com',
        whatsapp: '919876543210',
        instagram: 'https://instagram.com/',
        facebook: 'https://facebook.com/',
        youtube: 'https://youtube.com/',
        maps: 'https://www.google.com/maps?q=Pune,Maharashtra&output=embed',
        stat_festivals: '25+',
        stat_cultural: '120+',
        stat_social: '40+',
        stat_years: '18',
        about1: 'जय श्री राम मित्र मंडळ हे आपल्या परिसरातील धार्मिक, सांस्कृतिक आणि सामाजिक उपक्रमांना प्रोत्साहन देणारे मंडळ आहे.',
        about2: 'गणेशोत्सव, नवरात्रोत्सव, दहीहंडी तसेच विविध पारंपरिक सण आणि कार्यक्रम उत्साहात साजरे करताना एकता, संस्कृती आणि सामाजिक बांधिलकी यांना आम्ही नेहमीच प्राधान्य देतो.',
        about3: 'तरुणांना एकत्र आणणे, पारंपरिक कला व संस्कृती जपणे आणि समाजासाठी सकारात्मक उपक्रम राबवणे हा आमचा प्रयत्न आहे.'
      },

      users: [{ id: 'u1', email: 'admin@mandal.com', password: 'mandal@123', name: 'मंडळ प्रशासक' }],

      festivals: [
        { id: uid(), name: 'गणेशोत्सव', slug: 'ganeshotsav', desc: 'गणरायाच्या आगमनाने उत्सवाला सुरुवात, भक्तीने वातावरणाला नवी ऊर्जा!', image: ph('गणेशोत्सव', 900, 1100, 0), year: yr, page: 'ganeshotsav.html', featured: 1 },
        { id: uid(), name: 'नवरात्रोत्सव', slug: 'navratri', desc: 'नऊ दिवस भक्तीचे, उत्साहाचे आणि शक्तीच्या आराधनेचे!', image: ph('नवरात्रोत्सव', 900, 1100, 1), year: yr, page: 'navratri.html', featured: 1 },
        { id: uid(), name: 'दहीहंडी', slug: 'dahihandi', desc: 'एकजुटीची ताकद, उत्साहाची उंची!', image: ph('दहीहंडी', 900, 1100, 2), year: yr, page: 'dahihandi.html', featured: 1 },
        { id: uid(), name: 'इतर उत्सव', slug: 'other', desc: 'परंपरा, संस्कृती आणि आनंदाने साजरे होणारे विविध उत्सव.', image: ph('इतर उत्सव', 900, 1100, 3), year: yr, page: 'other-festivals.html', featured: 1 },
        { id: uid(), name: 'दिवाळी', slug: 'diwali', desc: 'दिव्यांचा सण — रांगोळी, आकाशकंदील आणि फराळाचा आनंद मंडळाच्या सर्व कुटुंबांसोबत.', image: ph('दिवाळी', 800, 600, 4), year: yr, page: 'other-festivals.html', featured: 0 },
        { id: uid(), name: 'होळी', slug: 'holi', desc: 'होलिका दहन आणि दुसऱ्या दिवशी रंगपंचमीचा उत्साह.', image: ph('होळी', 800, 600, 0), year: yr, page: 'other-festivals.html', featured: 0 },
        { id: uid(), name: 'राम नवमी', slug: 'ramnavami', desc: 'श्रीरामजन्माचा सोहळा, पालखी आणि महाप्रसाद.', image: ph('राम नवमी', 800, 600, 1), year: yr, page: 'other-festivals.html', featured: 0 },
        { id: uid(), name: 'हनुमान जयंती', slug: 'hanuman', desc: 'पहाटेची आरती, सुंदरकांड पठण आणि प्रसादवाटप.', image: ph('हनुमान जयंती', 800, 600, 2), year: yr, page: 'other-festivals.html', featured: 0 },
        { id: uid(), name: 'स्वातंत्र्य दिन', slug: 'independence', desc: 'ध्वजारोहण, देशभक्तिपर गीते आणि लहान मुलांचे कार्यक्रम.', image: ph('स्वातंत्र्य दिन', 800, 600, 3), year: yr, page: 'other-festivals.html', featured: 0 },
        { id: uid(), name: 'प्रजासत्ताक दिन', slug: 'republic', desc: 'ध्वजवंदन, प्रभातफेरी आणि ज्येष्ठ नागरिकांचा सत्कार.', image: ph('प्रजासत्ताक दिन', 800, 600, 4), year: yr, page: 'other-festivals.html', featured: 0 }
      ],

      events: [
        { id: uid(), title: 'श्री गणेश आगमन सोहळा', date: yr + '-09-19', time: 'सकाळी ८:००', venue: 'मंडळ चौक ते मुख्य मंडप', desc: 'ढोल-ताशा पथकाच्या गजरात गणरायाची मिरवणूक. सर्व भाविकांनी मोठ्या संख्येने उपस्थित राहावे.', image: ph('आगमन सोहळा', 800, 600, 0) },
        { id: uid(), title: 'अथर्वशीर्ष सामूहिक पठण', date: yr + '-09-22', time: 'सायंकाळी ६:३०', venue: 'मुख्य मंडप', desc: 'महिला मंडळाच्या नेतृत्वाखाली २१ आवर्तने. सहभागासाठी नावनोंदणी मंडपात सुरू आहे.', image: ph('अथर्वशीर्ष', 800, 600, 1) },
        { id: uid(), title: 'सांस्कृतिक संध्या', date: yr + '-09-24', time: 'रात्री ८:००', venue: 'मंडळ मैदान', desc: 'लहान मुलांचे नृत्य, लावणी, भजन आणि स्थानिक कलाकारांचे सादरीकरण.', image: ph('सांस्कृतिक संध्या', 800, 600, 2) },
        { id: uid(), title: 'रक्तदान शिबिर', date: yr + '-10-05', time: 'सकाळी ९:०० ते दुपारी २:००', venue: 'मंडळ कार्यालय', desc: 'स्थानिक रक्तपेढीच्या सहकार्याने. नोंदणीसाठी मंडळाच्या कार्यकर्त्यांशी संपर्क साधा.', image: ph('रक्तदान शिबिर', 800, 600, 3) }
      ],

      photos: [
        { id: uid(), title: 'गणरायाची प्रतिष्ठापना', album: 'गणेशोत्सव', url: ph('गणेशोत्सव १', 900, 1200, 0), year: yr },
        { id: uid(), title: 'महाआरती', album: 'गणेशोत्सव', url: ph('गणेशोत्सव २', 900, 700, 1), year: yr },
        { id: uid(), title: 'ढोल-ताशा पथक', album: 'गणेशोत्सव', url: ph('गणेशोत्सव ३', 900, 900, 2), year: yr },
        { id: uid(), title: 'विसर्जन मिरवणूक', album: 'गणेशोत्सव', url: ph('विसर्जन', 900, 1100, 3), year: yr },
        { id: uid(), title: 'घटस्थापना', album: 'नवरात्र', url: ph('नवरात्र १', 900, 800, 4), year: yr },
        { id: uid(), title: 'गरबा रास', album: 'नवरात्र', url: ph('नवरात्र २', 900, 1200, 0), year: yr },
        { id: uid(), title: 'भोंडला', album: 'नवरात्र', url: ph('भोंडला', 900, 700, 1), year: yr },
        { id: uid(), title: 'गोविंदा पथक', album: 'दहीहंडी', url: ph('दहीहंडी १', 900, 1100, 2), year: yr },
        { id: uid(), title: 'थर रचताना', album: 'दहीहंडी', url: ph('दहीहंडी २', 900, 900, 3), year: yr },
        { id: uid(), title: 'क्रिकेट अंतिम सामना', album: 'खेळ', url: ph('क्रिकेट', 900, 700, 4), year: yr },
        { id: uid(), title: 'रांगोळी स्पर्धा', album: 'खेळ', url: ph('रांगोळी', 900, 1000, 0), year: yr },
        { id: uid(), title: 'वृक्षारोपण', album: 'सामाजिक उपक्रम', url: ph('वृक्षारोपण', 900, 800, 1), year: yr },
        { id: uid(), title: 'रक्तदान शिबिर', album: 'सामाजिक उपक्रम', url: ph('रक्तदान', 900, 1100, 2), year: yr },
        { id: uid(), title: 'दिवाळी फराळ वाटप', album: 'इतर', url: ph('दिवाळी', 900, 700, 3), year: yr },
        { id: uid(), title: 'ध्वजारोहण', album: 'इतर', url: ph('ध्वजारोहण', 900, 950, 4), year: yr }
      ],

      videos: [
        { id: uid(), title: 'गणेश आगमन सोहळा — संपूर्ण मिरवणूक', yt: 'dQw4w9WgXcQ', cat: 'गणेशोत्सव', desc: 'ढोल-ताशाच्या गजरात गणरायाचे आगमन.' },
        { id: uid(), title: 'महाआरती — सामूहिक सादरीकरण', yt: 'dQw4w9WgXcQ', cat: 'गणेशोत्सव', desc: 'मंडपातील सायंकाळची आरती.' },
        { id: uid(), title: 'गरबा व दांडिया रात्र', yt: 'dQw4w9WgXcQ', cat: 'नवरात्र', desc: 'नवरात्रीतील सहाव्या माळेचा कार्यक्रम.' },
        { id: uid(), title: 'दहीहंडी — नऊ थरांचा विक्रम', yt: 'dQw4w9WgXcQ', cat: 'दहीहंडी', desc: 'गोविंदा पथकाची जिद्द.' },
        { id: uid(), title: 'क्रिकेट स्पर्धा अंतिम सामना', yt: 'dQw4w9WgXcQ', cat: 'स्पर्धा', desc: 'मंडळ चषक अंतिम फेरी.' },
        { id: uid(), title: 'वृक्षारोपण मोहीम', yt: 'dQw4w9WgXcQ', cat: 'सामाजिक उपक्रम', desc: 'परिसरात ५०० रोपांची लागवड.' }
      ],

      aarti_mankari: (function () {
        var base = [
          ['श्री. रमेश दत्तात्रय जोशी', 'जोशी कुटुंब'],
          ['श्री. सुनील बाळकृष्ण पाटील', 'पाटील कुटुंब'],
          ['सौ. मंगल विठ्ठल देशमुख', 'देशमुख कुटुंब'],
          ['श्री. अनिल हरिभाऊ कुलकर्णी', 'कुलकर्णी कुटुंब'],
          ['श्री. प्रकाश नामदेव शिंदे', 'शिंदे कुटुंब'],
          ['सौ. सुनीता अशोक गायकवाड', 'गायकवाड कुटुंब'],
          ['श्री. महेश गोविंद साळुंखे', 'साळुंखे कुटुंब'],
          ['श्री. दिनेश शंकर मोरे', 'मोरे कुटुंब'],
          ['सौ. वैशाली संजय भोसले', 'भोसले कुटुंब'],
          ['श्री. संतोष रघुनाथ जाधव', 'जाधव कुटुंब']
        ];
        var out = [], t = new Date(), i;
        for (i = 0; i < base.length; i++) {
          var d = new Date(t); d.setDate(t.getDate() + (i - 2));
          var m = d.getMonth() + 1, dd = d.getDate();
          out.push({
            id: uid(), name: base[i][0], family: base[i][1],
            date: d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd,
            year: d.getFullYear(), festival: 'गणेशोत्सव', photo: ph(base[i][1].split(' ')[0], 500, 500, i)
          });
        }
        /* मागील वर्षांचे काही मानकरी */
        out.push({ id: uid(), name: 'श्री. विठ्ठल नारायण कदम', family: 'कदम कुटुंब', date: (yr - 1) + '-09-12', year: yr - 1, festival: 'गणेशोत्सव', photo: ph('कदम', 500, 500, 1) });
        out.push({ id: uid(), name: 'सौ. शीतल प्रमोद थोरात', family: 'थोरात कुटुंब', date: (yr - 1) + '-09-14', year: yr - 1, festival: 'गणेशोत्सव', photo: ph('थोरात', 500, 500, 2) });
        out.push({ id: uid(), name: 'श्री. बाळासाहेब तुकाराम काळे', family: 'काळे कुटुंब', date: (yr - 2) + '-09-10', year: yr - 2, festival: 'गणेशोत्सव', photo: ph('काळे', 500, 500, 3) });
        return out;
      })(),

      competitions: [
        { id: uid(), name: 'क्रिकेट स्पर्धा', icon: 'fa-baseball', date: yr + '-09-20', venue: 'मंडळ मैदान', participants: '१६ संघ', desc: 'मंडळ चषक — टेनिस बॉल क्रिकेट स्पर्धा, प्रत्येक सामना ८ षटकांचा.', image: ph('क्रिकेट', 800, 600, 0) },
        { id: uid(), name: 'कबड्डी स्पर्धा', icon: 'fa-hands-bound', date: yr + '-09-21', venue: 'मंडळ मैदान', participants: '१० संघ', desc: 'पारंपरिक मातीवरील कबड्डी. विजेत्यांना चषक व रोख बक्षीस.', image: ph('कबड्डी', 800, 600, 1) },
        { id: uid(), name: 'व्हॉलीबॉल स्पर्धा', icon: 'fa-volleyball', date: yr + '-09-21', venue: 'शाळेचे पटांगण', participants: '८ संघ', desc: 'तरुण मंडळींसाठी सायंकाळची स्पर्धा.', image: ph('व्हॉलीबॉल', 800, 600, 2) },
        { id: uid(), name: 'कॅरम स्पर्धा', icon: 'fa-circle-dot', date: yr + '-09-22', venue: 'मंडळ कार्यालय', participants: '३२ खेळाडू', desc: 'एकेरी व दुहेरी गटात स्पर्धा.', image: ph('कॅरम', 800, 600, 3) },
        { id: uid(), name: 'बुद्धिबळ स्पर्धा', icon: 'fa-chess-knight', date: yr + '-09-22', venue: 'मंडळ कार्यालय', participants: '२४ खेळाडू', desc: 'खुल्या गटात स्विस पद्धतीने पाच फेऱ्या.', image: ph('बुद्धिबळ', 800, 600, 4) },
        { id: uid(), name: 'चित्रकला स्पर्धा', icon: 'fa-palette', date: yr + '-09-23', venue: 'मुख्य मंडप', participants: '६० विद्यार्थी', desc: 'गट १ — इयत्ता १ ते ४, गट २ — इयत्ता ५ ते ८.', image: ph('चित्रकला', 800, 600, 0) },
        { id: uid(), name: 'रांगोळी स्पर्धा', icon: 'fa-hand-sparkles', date: yr + '-09-23', venue: 'मंडप परिसर', participants: '४० स्पर्धक', desc: 'ठिपक्यांची व संस्कार भारती रांगोळी असे दोन गट.', image: ph('रांगोळी', 800, 600, 1) },
        { id: uid(), name: 'वक्तृत्व स्पर्धा', icon: 'fa-microphone', date: yr + '-09-24', venue: 'मुख्य मंडप', participants: '२५ स्पर्धक', desc: 'विषय — "आजच्या काळात उत्सवांचे महत्त्व".', image: ph('वक्तृत्व', 800, 600, 2) },
        { id: uid(), name: 'निबंध स्पर्धा', icon: 'fa-pen-nib', date: yr + '-09-24', venue: 'शाळा सभागृह', participants: '५० विद्यार्थी', desc: 'शालेय विद्यार्थ्यांसाठी मराठी निबंध लेखन.', image: ph('निबंध', 800, 600, 3) },
        { id: uid(), name: 'गायन स्पर्धा', icon: 'fa-music', date: yr + '-09-25', venue: 'मुख्य मंडप', participants: '३० स्पर्धक', desc: 'भक्तिगीत, भावगीत व लोकगीत असे तीन प्रकार.', image: ph('गायन', 800, 600, 4) },
        { id: uid(), name: 'मुलांचे खेळ', icon: 'fa-children', date: yr + '-09-25', venue: 'मंडळ मैदान', participants: '८० मुले', desc: 'लिंबू-चमचा, गोणीतील शर्यत, संगीत खुर्ची आणि इतर मजेदार खेळ.', image: ph('मुलांचे खेळ', 800, 600, 0) }
      ],

      competition_winners: [
        { id: uid(), comp: 'क्रिकेट स्पर्धा', rank: 'प्रथम', name: 'शिवशक्ती क्रीडा मंडळ', year: yr },
        { id: uid(), comp: 'क्रिकेट स्पर्धा', rank: 'द्वितीय', name: 'जय भवानी संघ', year: yr },
        { id: uid(), comp: 'रांगोळी स्पर्धा', rank: 'प्रथम', name: 'कु. श्रावणी देशपांडे', year: yr },
        { id: uid(), comp: 'रांगोळी स्पर्धा', rank: 'द्वितीय', name: 'सौ. अपर्णा कुलकर्णी', year: yr },
        { id: uid(), comp: 'बुद्धिबळ स्पर्धा', rank: 'प्रथम', name: 'चि. आर्यन पाटील', year: yr },
        { id: uid(), comp: 'गायन स्पर्धा', rank: 'प्रथम', name: 'कु. सायली जोशी', year: yr }
      ],

      team_members: [
        { id: uid(), name: 'श्री. रमेश दत्तात्रय जोशी', role: 'अध्यक्ष', bio: 'मंडळाच्या स्थापनेपासून कार्यरत. उत्सव नियोजन आणि सामाजिक उपक्रमांची जबाबदारी.', photo: ph('अध्यक्ष', 600, 600, 0), fb: '', ig: '' },
        { id: uid(), name: 'श्री. सुनील बाळकृष्ण पाटील', role: 'उपाध्यक्ष', bio: 'तरुण कार्यकर्त्यांचे संघटन आणि क्रीडा स्पर्धांचे संयोजन.', photo: ph('उपाध्यक्ष', 600, 600, 1), fb: '', ig: '' },
        { id: uid(), name: 'श्री. अनिल हरिभाऊ कुलकर्णी', role: 'सचिव', bio: 'कार्यक्रमांचे नियोजन, परवानग्या आणि दैनंदिन कामकाज.', photo: ph('सचिव', 600, 600, 2), fb: '', ig: '' },
        { id: uid(), name: 'श्री. प्रकाश नामदेव शिंदे', role: 'खजिनदार', bio: 'मंडळाचा जमाखर्च आणि वर्गणी व्यवस्थापन.', photo: ph('खजिनदार', 600, 600, 3), fb: '', ig: '' },
        { id: uid(), name: 'श्री. महेश गोविंद साळुंखे', role: 'कार्याध्यक्ष', bio: 'मंडप, सजावट आणि मिरवणूक व्यवस्थेचे प्रमुख.', photo: ph('कार्याध्यक्ष', 600, 600, 4), fb: '', ig: '' },
        { id: uid(), name: 'सौ. मंगल विठ्ठल देशमुख', role: 'सदस्य', bio: 'महिला मंडळ आणि हळदी-कुंकू, भोंडला कार्यक्रमांचे संयोजन.', photo: ph('सदस्य', 600, 600, 0), fb: '', ig: '' },
        { id: uid(), name: 'श्री. दिनेश शंकर मोरे', role: 'सदस्य', bio: 'ध्वनी, प्रकाशयोजना आणि तांत्रिक व्यवस्था.', photo: ph('सदस्य', 600, 600, 1), fb: '', ig: '' },
        { id: uid(), name: 'श्री. संतोष रघुनाथ जाधव', role: 'कार्यकर्ते', bio: 'प्रसाद वाटप, स्वच्छता आणि सुरक्षा व्यवस्थेत सहभाग.', photo: ph('कार्यकर्ते', 600, 600, 2), fb: '', ig: '' }
      ],

      social_initiatives: [
        { id: uid(), title: 'रक्तदान शिबिर', icon: 'fa-droplet', desc: 'दरवर्षी गणेशोत्सवात रक्तपेढीच्या सहकार्याने शिबिर. गेल्या वर्षी १४० बाटल्या रक्त संकलित झाले.', image: ph('रक्तदान', 800, 600, 0) },
        { id: uid(), title: 'वृक्षारोपण', icon: 'fa-tree', desc: 'पावसाळ्याच्या सुरुवातीला परिसरात देशी वृक्षांची लागवड व त्यांची वर्षभर देखभाल.', image: ph('वृक्षारोपण', 800, 600, 1) },
        { id: uid(), title: 'स्वच्छता अभियान', icon: 'fa-broom', desc: 'उत्सवानंतर मंडप परिसर व रस्त्यांची स्वच्छता. निर्माल्य संकलनाची स्वतंत्र व्यवस्था.', image: ph('स्वच्छता', 800, 600, 2) },
        { id: uid(), title: 'गरजूंसाठी मदत', icon: 'fa-hands-holding-heart', desc: 'दिवाळीत फराळ, कपडे आणि जीवनावश्यक वस्तूंचे वाटप.', image: ph('मदत', 800, 600, 3) },
        { id: uid(), title: 'शैक्षणिक मदत', icon: 'fa-graduation-cap', desc: 'होतकरू विद्यार्थ्यांना वह्या, पुस्तके व शालेय शुल्कासाठी सहकार्य.', image: ph('शैक्षणिक मदत', 800, 600, 4) },
        { id: uid(), title: 'आरोग्य शिबिर', icon: 'fa-stethoscope', desc: 'मोफत नेत्रतपासणी, मधुमेह व रक्तदाब तपासणी शिबिर.', image: ph('आरोग्य शिबिर', 800, 600, 0) },
        { id: uid(), title: 'सामाजिक जनजागृती', icon: 'fa-bullhorn', desc: 'व्यसनमुक्ती, पर्यावरणपूरक उत्सव आणि मतदार जागृतीविषयक उपक्रम.', image: ph('जनजागृती', 800, 600, 1) },
        { id: uid(), title: 'आपत्कालीन मदत', icon: 'fa-truck-medical', desc: 'पूर, अतिवृष्टी अशा प्रसंगी मदत साहित्य संकलन व वाटप.', image: ph('आपत्कालीन मदत', 800, 600, 2) }
      ],

      messages: []
    };
  }

  /* ---------- स्टोअरेज ---------- */
  var cache = null;

  function read() {
    if (cache) return cache;
    var raw = null;
    try { raw = global.localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) {
      try { cache = JSON.parse(raw); } catch (e) { cache = seed(); }
    } else {
      cache = seed();
      write();
    }
    return cache;
  }

  function write() {
    try { global.localStorage.setItem(KEY, JSON.stringify(cache)); return true; }
    catch (e) { console.warn('माहिती साठवता आली नाही:', e); return false; }
  }

  /* ======================================================================
     सार्वजनिक API — Supabase वापरायचे असल्यास फक्त हीच फंक्शन्स बदला
     ====================================================================== */
  var DB = {
    ph: ph,
    fmtDate: fmtDate,
    dayName: dayName,
    today: today,
    uid: uid,

    /** संपूर्ण टेबल परत करते.  Supabase: supabase.from(table).select('*') */
    list: function (table) {
      var d = read();
      return Array.isArray(d[table]) ? d[table].slice() : [];
    },

    /** एक नोंद.  Supabase: .select('*').eq('id',id).single() */
    get: function (table, id) {
      var rows = DB.list(table), i;
      for (i = 0; i < rows.length; i++) if (rows[i].id === id) return rows[i];
      return null;
    },

    /** नवीन नोंद.  Supabase: .insert(row).select().single() */
    insert: function (table, row) {
      var d = read();
      if (!Array.isArray(d[table])) d[table] = [];
      row.id = row.id || uid();
      d[table].unshift(row);
      write();
      return row;
    },

    /** नोंद बदलणे.  Supabase: .update(patch).eq('id',id) */
    update: function (table, id, patch) {
      var d = read(), i;
      if (!Array.isArray(d[table])) return null;
      for (i = 0; i < d[table].length; i++) {
        if (d[table][i].id === id) {
          var k;
          for (k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) d[table][i][k] = patch[k];
          write();
          return d[table][i];
        }
      }
      return null;
    },

    /** नोंद काढणे.  Supabase: .delete().eq('id',id) */
    remove: function (table, id) {
      var d = read(), i;
      if (!Array.isArray(d[table])) return false;
      for (i = 0; i < d[table].length; i++) {
        if (d[table][i].id === id) { d[table].splice(i, 1); write(); return true; }
      }
      return false;
    },

    /* ---------- साइट सेटिंग्ज ---------- */
    settings: function () { return read().site_settings; },
    saveSettings: function (patch) {
      var d = read(), k;
      for (k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) d.site_settings[k] = patch[k];
      write();
      return d.site_settings;
    },

    /* ---------- प्रमाणीकरण ---------- */
    login: function (email, password) {
      var users = DB.list('users'), i;
      for (i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === String(email).trim().toLowerCase() && users[i].password === password) {
          try { global.sessionStorage.setItem(SESSION, JSON.stringify({ id: users[i].id, name: users[i].name, email: users[i].email, at: Date.now() })); } catch (e) {}
          return true;
        }
      }
      return false;
    },
    session: function () {
      try { return JSON.parse(global.sessionStorage.getItem(SESSION) || 'null'); } catch (e) { return null; }
    },
    logout: function () {
      try { global.sessionStorage.removeItem(SESSION); } catch (e) {}
    },
    changePassword: function (oldPw, newPw) {
      var s = DB.session(); if (!s) return false;
      var d = read(), i;
      for (i = 0; i < d.users.length; i++) {
        if (d.users[i].id === s.id && d.users[i].password === oldPw) { d.users[i].password = newPw; write(); return true; }
      }
      return false;
    },

    /* ---------- मानकरी साहाय्यक ---------- */
    todayMankari: function () {
      var t = today();
      return DB.list('aarti_mankari').filter(function (m) { return m.date === t; });
    },

    /* ---------- नमुना डेटा पुन्हा भरणे ---------- */
    reset: function () { cache = seed(); write(); },

    /* ---------- बॅकअप ---------- */
    exportJSON: function () { return JSON.stringify(read(), null, 2); },
    importJSON: function (txt) {
      var obj = JSON.parse(txt);
      cache = obj; write(); return true;
    }
  };

  global.DB = DB;
})(window);
