// ==UserScript==
// @name         [SERVO] - CLIENT_COPY
// @version      1.1
// @author       Sebastian Zborowski
// @description  Kopiowanie DO SCHOWKA danych klienta, celem łatwego WKLEJENIA ich później do GSX
// @match        https://servo.ispot.pl/o*
// @updateURL    https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BSERVO%5D_-_CLIENT_COPY.js
// @downloadURL  https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BSERVO%5D_-_CLIENT_COPY.js
// @grant        none
// @source       https://github.com/sebastian-zborowski
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, ODWOŁUJE SIĘ do danych prywatnych kopiując je do SCHOWKA SYSTEMOWEGO, natomiast nie zapisuje/utrwala ich stale. Skrypt nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja: 08.08.2025

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

            // Adres (street, postalCode, city)
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

            // repairNumber z h3[title]
            const h3 = document.querySelector('h3[title]');
            const titleAttr = h3 ? h3.getAttribute('title') : " ";
            const rawRepairNumber = titleAttr.split('|')[0].trim() || " ";

            // Inicjały z linku z ikoną user
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

            // 🔍 DODATKOWA FUNKCJONALNOŚĆ: Sprawdzanie PZU
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

    // Kontrola wersji alert ---------------------------------------------------------
    (async function() {

        const scriptList = [
            { name: 'CLIENT_COPY', url: 'https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BSERVO%5D_-_CLIENT_COPY.js' },
        ];

        const currentVersions = {
            CLIENT_COPY: '1.1',
        };

        await Promise.all(scriptList.map(async script => {
            try {
                const res = await fetch(script.url);
                const text = await res.text();
                const match = text.match(/@version\s+([0-9.]+)/);
                if (match) {
                    const version = match[1];
                    localStorage.setItem(script.name, JSON.stringify({
                        name: script.name,
                        remote: version
                    }));
                    console.log(`[VERSION CONTROL] ${script.name}: ${version}`);
                } else {
                    console.warn(`[VERSION CONTROL] Nie znaleziono wersji dla: ${script.name}`);
                }
            } catch (err) {
                console.warn(`[VERSION CONTROL] Błąd ładowania ${script.name}:`, err);
            }
        }));

        let popupCount = 0;
        scriptList.forEach(script => {
            const storedStr = localStorage.getItem(script.name);
            if (!storedStr) return;
            try {
                const data = JSON.parse(storedStr);
                const remoteVer = data?.remote;
                const currentVer = currentVersions[script.name] || '0.0';

                if (remoteVer && compareVersions(remoteVer, currentVer) > 0) {
                    showUpdatePopup(script.name, currentVer, remoteVer, popupCount++);
                }
            } catch(e) {
                console.warn(`[UPDATE CHECK] Błąd sprawdzania wersji dla ${script.name}:`, e);
            }
        });

        function compareVersions(v1, v2) {
            const split1 = v1.split('.').map(Number);
            const split2 = v2.split('.').map(Number);
            const length = Math.max(split1.length, split2.length);
            for (let i = 0; i < length; i++) {
                const a = split1[i] || 0;
                const b = split2[i] || 0;
                if (a > b) return 1;
                if (a < b) return -1;
            }
            return 0;
        }

        function showUpdatePopup(scriptName, current, remote, index) {
            const popup = document.createElement('div');
            popup.textContent = `🔔 Aktualizacja dostępna dla ${scriptName}: ${remote} (masz ${current})`;
            Object.assign(popup.style, {
                position: 'fixed',
                bottom: `${20 + index * 100}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#222',
                color: '#fff',
                padding: '24px 36px',
                borderRadius: '16px',
                fontSize: '18px',
                zIndex: 9999 + index,
                boxShadow: '0 0 20px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'opacity 0.3s ease',
                opacity: '1',
                maxWidth: '90%',
                textAlign: 'center',
            });

            popup.addEventListener('click', () => popup.remove());

            document.body.appendChild(popup);

            setTimeout(() => {
                // animacja znikania
                popup.style.opacity = '0';
                setTimeout(() => popup.remove(), 500);
            }, 7500);
        }
    })();
    // ---------------------------------------------------------------------------------

})();
