// ==UserScript==
// @name         [GSX][1.0] - CLIENT_PASTE
// @version      1.0
// @icon         https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://gsx2.apple.com/&size=128
// @author       Sebastian Zborowski - https://github.com/sebastian-zborowski
// @description  Debugowanie wklejania danych klienta do GSX
// @match        https://gsx2.apple.com/*
// @exclude      https://gsx2*dummy*
// @grant        none
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, ODWOŁUJE SIĘ do danych prywatnych kopiując je do SCHOWKA SYSTEMOWEGO, natomiast nie zapisuje/utrwala ich stale. Skrypt nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja: 13.08.2025

(function() {
    'use strict';

    const map = {
        repairNumber: 'rep_cust__po',
        name: 'rep_cust__fn',
        surname: 'rep_cust__ln',
        email: 'rep_cust__em',
        phone: 'rep_cust__ph',
        nip: 'rep_cust__company',
        street: 'rep_cust__addr1',
        postalCode: 'rep_cust__z',
        city: 'rep_cust__ci'
    };

    function createPasteButton() {
        const btn = document.createElement('button');
        btn.textContent = 'WKLEJ Z SERVO';
        btn.style.marginTop = '1em';
        btn.style.padding = '6px 12px';
        btn.style.backgroundColor = '#0078d7';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.title = 'Wklej dane klienta ze schowka JSON';

        btn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                console.log('Pobrano ze schowka:', text);
                if (!text) {
                    alert('Schowek jest pusty lub brak dostępu do schowka.');
                    return;
                }
                let data;
                try {
                    data = JSON.parse(text);
                } catch(e) {
                    alert('Niepoprawny format JSON w schowku.');
                    return;
                }
                for (const [key, id] of Object.entries(map)) {
                    if (data[key] !== undefined) {
                        const el = document.getElementById(id);
                        if (el) {
                            console.log(`Ustawiam pole ${id} (${key}) na wartość:`, data[key]);
                            el.value = data[key];
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                        } else {
                            console.warn(`Nie znaleziono elementu o id ${id} dla klucza ${key}`);
                        }
                    } else {
                        console.log(`Brak danych dla klucza ${key} w JSON`);
                    }
                }
                console.log('Dane klienta zostały wklejone. Sprawdź konsolę (F12) dla szczegółów.');
            } catch (err) {
                console.log('Błąd podczas wklejania danych: ' + err);
                console.error(err);
            }
        });

        return btn;
    }

    function waitForContainerAndAddButton() {
        const intervalId = setInterval(() => {
            const container = document.querySelector('div.el-col.el-col-24.repair-customer__info-1-1');
            if (container) {
                clearInterval(intervalId);
                container.insertAdjacentHTML('beforeend', '<br><br>');
                const btn = createPasteButton();
                container.appendChild(btn);
            }
        }, 500);
    }

    setTimeout(waitForContainerAndAddButton, 3000);

})();