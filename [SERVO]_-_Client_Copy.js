// ==UserScript==
// @name         [SERVO] - Client_Copy
// @version      2025-08-07
// @description  try to take over the world!
// @author       You
// @match        https://servo.ispot.pl/o*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    window.addEventListener('load', () => {
        const address = document.querySelector('address');
        if (!address) {
            console.warn('[Extract Address Info] Brak <address> na stronie.');
            return;
        }

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'KOPIUJ KLIENTA';
        copyBtn.style.cssText = 'display:inline-block;margin-bottom:8px;padding:4px 8px;font-size:12px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;';

        address.insertBefore(document.createElement('br'), address.firstChild);
        address.insertBefore(copyBtn, address.firstChild);

        function extractClientData() {
            const safeText = el => el ? el.textContent.trim() : "";

            const fullNameRaw = safeText(address.querySelector('strong > a'));
            const [name, ...surnameParts] = fullNameRaw.split(' ');
            const surname = surnameParts.join(' ').trim();

            const emailLink = Array.from(address.querySelectorAll('a')).find(a => a.href.includes('@'));
            const email = safeText(emailLink);

            let phone = "";
            const phoneCandidates = Array.from(address.querySelectorAll('a'))
            .map(a => a.textContent.replace(/\D/g, ""))
            .filter(txt => txt.length >= 9);

            if (phoneCandidates.length > 0) {
                const rawPhone = phoneCandidates[0];
                phone = rawPhone.startsWith("48") && rawPhone.length === 11
                    ? rawPhone.slice(2)
                : rawPhone.slice(-9);
            }

            const nipMatch = address.innerText.match(/NIP\s*:?[\s]*([\d\s\-]+)/i);
            const nip = nipMatch ? nipMatch[1].replace(/\D/g, '') : "";

            const addressLines = address.innerText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

            let street = "", postalCode = "", city = "";
            const nipIndex = addressLines.findIndex(line => line.startsWith('NIP'));
            if (nipIndex !== -1) {
                street = addressLines[nipIndex + 1] || "";
                const pcLine = addressLines[nipIndex + 2] || "";
                const match = pcLine.match(/^(\d{2}-\d{3})\s+(.+)/);
                postalCode = match ? match[1] : "";
                city = match ? match[2] : pcLine;
            }

            const h3 = document.querySelector('h3[title]');
            const titleAttr = h3 ? h3.getAttribute('title') : "";
            const rawRepairNumber = titleAttr.split('|')[0].trim() || "";

            const userAnchor = Array.from(document.querySelectorAll('a')).find(a =>
                                                                               a.querySelector('i.icon-user') && /\w+\s+\w+/.test(a.textContent)
                                                                              );
            const fullName = userAnchor ? userAnchor.textContent.trim() : "";
            const initials = fullName
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('');

            const repairNumber = (initials + rawRepairNumber).trim();

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

        // Obsługa kliknięcia przycisku
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
                setTimeout(() => copyBtn.textContent = 'KOPIUJ KLIENTA', 1500);
            });
        });
    });
})();
