# 🏛️ JJ & MM — Grand Romantic 3D Museum

Parij va Yevropaning mumtoz san'at saroylari (L'Orangerie, Ermitaj, Luvr) uslubida yaratilgan virtual 3D romantik muzey. Ikki oshiq uchun maxsus multiplayer tizimi bilan jihozlangan: siz va sevgilingiz birgalikda sayr qilishingiz, bir-biringizni ko'rishingiz, rasmlarni tomosha qilishingiz, yurakcha yuborishingiz va suhbatlashishingiz mumkin.

---

## ✨ Asosiy Imkoniyatlar

1. **🎨 Pinterest Grand Gallery Estetikasi:**
   - Qizil baxmal (burgundy damask) devorlar va oltin hoshiyali panellar;
   - Qorong'i oynali gumbaz shift (tunggi osmon va oy nuri);
   - Qimmatbaho zumrad-qora marmar ustunlar va oltin kapiteliya;
   - Sayqallangan eman daraxti parket pol (lampalar akslanishi bilan);
   - 12 ta hashamatli zarhal barokko ramkalar va iliq sham chiroqlar (sconces).

2. **👫 Real-vaqt Multiplayer (2 Kishilik):**
   - **Kavaler (🤵🏻)** va **Xonim (💃🏻)** 3D obrazlari (avatorlar);
   - Birgalikda sayr qilish (qadam va qo'l harakatlari animatsiyasi);
   - Bosh tepasida nur sochuvchi ism yorliqlari (Name Tag);
   - **❤️ Yurak yuborish:** `H` tugmasi yoki telefonda yurak tugmasi orqali romantik uchuvchi yuraklar portlashi;
   - **Yaqinlik effekti:** Bir-biringizga yaqinlashganda ekranda maxsus "Sizlar birgasizlar ❤️" nuri paydo bo'ladi;
   - **O'yin ichidagi chat:** Bir-biringizga sevgi izhorlari va xabarlar yozish (3D avatarning tepasida ham matn chiqadi).

3. **📱 To'liq Telefon (Smartfon) Moslashuvi:**
   - **Chap tomonda:** Sensorli virtual joystik (harakatlanish uchun);
   - **O'ng tomonda:** Ekranni surish orqali erkin atrofga qarash;
   - **Maxsus sensor tugmalar:** Yurak yuborish ❤️, Rasmni ko'rish 🔍, Chat 💬, Kamera almashtirish 👁️.

4. **🖼️ O'z Rasmlaringizni Oson Joylashtirish:**
   - Har bir ramka yoniga kelib **[E]** (yoki telefonda **"Ko'rish"**) bosilganda asar to'liq ochiladi;
   - **"📷 O'z rasmingizni joylashtirish"** tugmasi orqali telefoningiz yoki kompyuteringizdan xohlagan shaxsiy fotosuratingizni to'g'ridan-to'g'ri ramkaga yuklashingiz mumkin (rasmlar xotirada saqlanib qoladi).

5. **🎵 Romantik Jonli Musiqa (Web Audio API):**
   - Hech qanday tashqi fayllarsiz, brauzerning o'zida chalinadigan sokin romantik pianino kuylari;
   - Pol ustidagi yumshoq qadam tovushlari;
   - Yurak yuborilgandagi sehrli arfa jilosi.

---

## 🚀 Mahalliy Ishga Tushirish (Kompyuterda)

```bash
cd jjmmmuseum
npm install
npm start
```
Brauzerda oching: `http://localhost:3000`

---

## 🌐 Render.com da 24/7 Bepul Sayt Qilish (Deploy)

1. **GitHub-ga yuklash:**
   ```bash
   git add .
   git commit -m "Grand Romantic 3D Museum complete build"
   git push origin main
   ```

2. **Render.com ga ulash:**
   - [render.com](https://render.com) ga kiring va GitHub akkauntingiz orqali kiring.
   - **"New +" -> "Web Service"** tugmasini bosing.
   - GitHub'dagi `zudi-art-site` omboringizni tanlang.
   - Sozlamalar:
     - **Name:** `jjmm-museum`
     - **Root Directory:** `jjmmmuseum`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Plan:** `Free`
   - **"Create Web Service"** tugmasini bosing!

3. **Havolani Sevgilingizga Yuborish:**
   - Saytingiz tayyor bo'lgach (masalan: `https://jjmm-museum.onrender.com`), saytga kiring va yuqoridagi **"Ulashish 🔗"** tugmasini bosing.
   - U avtomatik tarzda sevgilingiz uchun xonim obrazini tanlab beruvchi maxsus taklif havolasini nusxalaydi!

