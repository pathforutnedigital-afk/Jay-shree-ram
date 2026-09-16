# ॥ जय श्री राम मित्र मंडळ ॥ — संकेतस्थळ

परंपरा • संस्कृती • एकता • सेवा

मराठी समुदाय/उत्सव संकेतस्थळ — १४ सार्वजनिक पाने आणि पूर्ण प्रशासक पॅनेल.

---

## १. वेबसाइट कशी चालवावी

कोणत्याही सर्व्हरची गरज नाही. `index.html` ब्राउझरमध्ये उघडा.

स्थानिक सर्व्हर वापरायचा असल्यास:

```bash
cd jai-shri-ram-mandal
python3 -m http.server 8000
# ब्राउझरमध्ये उघडा: http://localhost:8000
```

प्रसिद्ध करण्यासाठी संपूर्ण फोल्डर Netlify, Vercel, GitHub Pages किंवा कोणत्याही
होस्टिंगवर अपलोड करा. बांधणी (build) करण्याची गरज नाही.

---

## २. प्रशासक पॅनेल

`admin.html` उघडा.

| | |
|---|---|
| ईमेल | `admin@mandal.com` |
| पासवर्ड | `mandal@123` |

पासवर्ड **संपर्क सेटिंग्ज** विभागातून लगेच बदला.

प्रशासक पॅनेलमधून खालील सर्व गोष्टी जोडता, बदलता आणि काढून टाकता येतात:

- उत्सव
- कार्यक्रम (आगामी)
- आरतीचे मानकरी (नाव, कुटुंब, तारीख, वर्ष, उत्सव, फोटो)
- फोटो (अल्बमनुसार)
- व्हिडिओ (YouTube व YouTube Shorts)
- स्पर्धा आणि विजेते
- टीम सदस्य
- सामाजिक उपक्रम
- संपर्क फॉर्ममधून आलेले संदेश
- संपर्क माहिती, समाजमाध्यम दुवे, Google Maps, मुखपृष्ठावरील आकडेवारी आणि
  "आमच्याविषयी" मजकूर

केलेले बदल वेबसाइटवर लगेच दिसतात.

---

## ३. फाइल रचना

```
jai-shri-ram-mandal/
├── index.html              मुखपृष्ठ
├── about.html              आमच्याविषयी
├── ganeshotsav.html        गणेशोत्सव
├── navratri.html           नवरात्रोत्सव
├── dahihandi.html          दहीहंडी
├── other-festivals.html    इतर उत्सव
├── mankari.html            आरतीचे मानकरी
├── sports.html             खेळ व स्पर्धा
├── gallery.html            फोटो गॅलरी
├── videos.html             व्हिडिओ गॅलरी
├── social.html             सामाजिक उपक्रम
├── events.html             आगामी कार्यक्रम
├── team.html               आमची टीम
├── contact.html            संपर्क
├── admin.html              प्रशासक पॅनेल
├── sitemap.xml
├── robots.txt
└── assets/
    ├── css/style.css       संपूर्ण डिझाइन
    ├── js/db.js            डेटा लेयर (CRUD + नमुना माहिती)
    ├── js/app.js           हेडर, फूटर, नेव्हिगेशन, लाइटबॉक्स, अ‍ॅनिमेशन
    ├── js/admin.js         प्रशासक पॅनेल
    └── img/logo.png        मंडळाचा लोगो
```

---

## ४. माहिती कुठे साठवली जाते

सध्या सर्व माहिती ब्राउझरच्या `localStorage` मध्ये साठवली जाते. त्यामुळे
संकेतस्थळ कोणत्याही बॅकएंडशिवाय पूर्ण चालते.

> **लक्षात ठेवा:** localStorage प्रत्येक ब्राउझरपुरते मर्यादित असते. एका
> संगणकावरून जोडलेली माहिती दुसऱ्या संगणकावर आपोआप दिसणार नाही. अनेक
> संगणकांवरून व्यवस्थापन करायचे असल्यास पुढील टप्प्यातील Supabase वापरा.

**बॅकअप:** प्रशासक डॅशबोर्डवर "बॅकअप उतरवा" / "बॅकअप भरा" बटणे आहेत. नियमित
बॅकअप घेत राहा.

---

## ५. Supabase वर हलवण्यासाठी

फक्त `assets/js/db.js` मधील पाच फंक्शन्स बदला. **इतर कोणतीही फाइल बदलावी
लागत नाही.**

### टेबल्स

`users`, `festivals`, `events`, `photos`, `videos`, `aarti_mankari`,
`competitions`, `competition_winners`, `team_members`,
`social_initiatives`, `site_settings`

फोटोंसाठी Supabase Storage वापरा (bucket: `mandal-media`).

### बदलायची फंक्शन्स

```js
list:   (table)       => supabase.from(table).select('*')
get:    (table, id)   => supabase.from(table).select('*').eq('id', id).single()
insert: (table, row)  => supabase.from(table).insert(row).select().single()
update: (table,id,p)  => supabase.from(table).update(p).eq('id', id)
remove: (table, id)   => supabase.from(table).delete().eq('id', id)
```

प्रमाणीकरणासाठी `DB.login` मध्ये `supabase.auth.signInWithPassword()` वापरा.

### सुरक्षा

प्रत्येक टेबलवर Row Level Security सुरू करा —
वाचन सर्वांना, लिहिणे फक्त प्रमाणित प्रशासकाला.

---

## ६. प्रसिद्ध करण्यापूर्वी

- [ ] `index.html` आणि इतर पानांतील `https://example.com/` बदलून खरा डोमेन टाका
      (canonical व Open Graph टॅग)
- [ ] `sitemap.xml` आणि `robots.txt` मधील डोमेन बदला
- [ ] प्रशासक पासवर्ड बदला
- [ ] संपर्क सेटिंग्जमध्ये खरा पत्ता, नंबर, ईमेल, WhatsApp, समाजमाध्यम दुवे आणि
      Google Maps embed दुवा भरा
- [ ] नमुना फोटो बदलून मंडळाचे खरे फोटो अपलोड करा
- [ ] नमुना YouTube ID बदलून मंडळाचे खरे व्हिडिओ ID टाका
- [ ] मानकरी, टीम सदस्य आणि स्पर्धांची खरी माहिती भरा

---

## ७. तांत्रिक तपशील

- कोणतीही बांधणी प्रक्रिया नाही, कोणतीही फ्रेमवर्क अवलंबित्वे नाहीत
- फॉन्ट: Mukta (शीर्षके) + Noto Sans Devanagari (मजकूर) — Google Fonts
- चिन्हे: Font Awesome 6 (CDN)
- प्रतिसादात्मक: डेस्कटॉप, लॅपटॉप, टॅबलेट, मोबाइल
- प्रतिमा `loading="lazy"` सह
- `prefers-reduced-motion` पाळले जाते
- कीबोर्ड फोकस दिसतो
- SEO: मराठी मेटाडेटा, Open Graph, structured data, sitemap, robots.txt
- `admin.html` वर `noindex, nofollow`
