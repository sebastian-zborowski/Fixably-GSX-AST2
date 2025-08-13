// ==UserScript==
// @name         [SERVO][1.0] - CLIENT_COPY
// @version      1.0
// @icon         https://servo.ispot.pl/static/images/apple-touch-icon.png
// @author       Sebastian Zborowski - https://github.com/sebastian-zborowski
// @description  Kopiowanie DO SCHOWKA danych klienta, celem łatwego WKLEJENIA ich później do GSX
// @match        https://servo.ispot.pl/o*
// @grant        none
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, ODWOŁUJE SIĘ do danych prywatnych kopiując je do SCHOWKA SYSTEMOWEGO, natomiast nie zapisuje/utrwala ich stale. Skrypt nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja: 13.08.2025

(function () {
    'use strict';

    window.addEventListener('load', () => {
        const address = document.querySelector('address');
        if (!address) {
            console.warn('[Extract Address Info] Brak <address> na stronie.');
            return;
        }

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'KOPIUJ';
        copyBtn.style.cssText = 'display:inline-block;margin-bottom:8px;padding:4px 8px;font-size:12px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;';

        address.insertBefore(document.createElement('br'), address.firstChild);
        address.insertBefore(copyBtn, address.firstChild);

        function extractClientData() {
            const safeText = el => el ? el.textContent.trim() : " ";

            // Imię i nazwisko
            const fullNameRaw = safeText(address.querySelector('strong > a'));
            let name = " ", surname = " ";
            if (fullNameRaw !== " ") {
                const parts = fullNameRaw.split(' ');
                name = parts[0] || " ";
                surname = parts.slice(1).join(' ').trim() || " ";
            }

            // Email
            const emailLink = Array.from(address.querySelectorAll('a')).find(a => a.href.includes('@'));
            const email = safeText(emailLink) || " ";

            // Telefon
            let phone = " ";
            const phoneCandidates = Array.from(address.querySelectorAll('a'))
                .map(a => a.textContent.replace(/\D/g, ""))
                .filter(txt => txt.length >= 9);
            if (phoneCandidates.length > 0) {
                const rawPhone = phoneCandidates[0];
                phone = (rawPhone.startsWith("48") && rawPhone.length === 11)
                    ? rawPhone.slice(2)
                    : rawPhone.slice(-9);
            }

            // NIP
            let nip = " ";
            const nipMatch = address.innerText.match(/NIP\s*:?[\s]*([\d\s\-]+)/i);
            nip = nipMatch ? nipMatch[1].replace(/\D/g, '') : " ";

            // Adres 
            let street = " ", postalCode = " ", city = " ";
            const addressLines = address.innerText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const nipIndex = addressLines.findIndex(line => line.startsWith('NIP'));

            if (nipIndex !== -1) {
                street = addressLines[nipIndex + 1] || " ";
                const pcLine = addressLines[nipIndex + 2] || " ";
                const match = pcLine.match(/^(\d{2}-\d{3})\s+(.+)/);
                postalCode = match ? match[1] : " ";
                city = match ? match[2] : pcLine || " ";
            } else {
                const pcIndex = addressLines.findIndex(line => /^\d{2}-\d{3}/.test(line));
                if (pcIndex !== -1 && pcIndex > 0) {
                    postalCode = addressLines[pcIndex].match(/^(\d{2}-\d{3})/)[1] || " ";
                    city = addressLines[pcIndex].replace(postalCode, '').trim() || " ";
                    street = addressLines[pcIndex - 1] || " ";
                }
            }

            const h3 = document.querySelector('h3[title]');
            const titleAttr = h3 ? h3.getAttribute('title') : " ";
            const rawRepairNumber = titleAttr.split('|')[0].trim() || " ";

            // Inicjały 
            const userAnchor = Array.from(document.querySelectorAll('a')).find(a =>
                a.querySelector('i.icon-user') && /\w+\s+\w+/.test(a.textContent)
            );
            const fullName = userAnchor ? userAnchor.textContent.trim() : " ";
            const initials = fullName !== " "
                ? fullName
                    .split(' ')
                    .map(part => part.charAt(0).toUpperCase())
                    .join('')
                : " ";

            let repairNumber = ((initials !== " " ? initials : "") + (rawRepairNumber !== " " ? rawRepairNumber : "")).trim() || " ";

            const pageText = document.body.innerText || "";
            if (/PZU(\s+SA)?/i.test(pageText)) {
                repairNumber += "_PZU";
            }

            return {
                repairNumber,
                name,
                surname,
                email,
                phone,
                nip,
                street,
                postalCode,
                city
            };
        }

        copyBtn.addEventListener('click', () => {
            const data = extractClientData();
            const json = JSON.stringify(data, null, 2);

            navigator.clipboard.writeText(json)
                .then(() => {
                    console.log('[SERVO] - CLIENT_COPY: Dane klienta skopiowane do schowka:');
                    console.log(data);
                    copyBtn.textContent = 'SKOPIOWANO!';
                    setTimeout(() => copyBtn.textContent = 'KOPIUJ KLIENTA', 1500);
                })
                .catch(err => {
                    console.error('[SERVO] - CLIENT_COPY: Błąd kopiowania:', err);
                    copyBtn.textContent = 'BŁĄD';
                    setTimeout(() => copyBtn.textContent = 'KOPIUJ', 1500);
                });
        });
    });
})();
