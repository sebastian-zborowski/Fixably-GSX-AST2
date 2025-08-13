// ==UserScript==
// @name         [AST2][1.0] - PASTE_LINK
// @version      1.0
// @icon         https://diagnostics.apple.com/static/projects/aide/images/favicon-64x64.ico
// @description  Automatycznie otwiera AST2 z numerem seryjnym zlecenia z Fixably. Rzoszerzenie działa w kooperacji z: FIXABLY_-_INTERFACE_TWEAKS
// @author       Sebastian Zborowski - https://github.com/sebastian-zborowski
// @match        https://diagnostics.apple.com/*
// @grant        none
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, ODWOŁUJE SIĘ do danych prywatnych kopiując je do SCHOWKA SYSTEMOWEGO, natomiast nie zapisuje/utrwala ich stale. Skrypt nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja: 13.08.2025

(function () {
    'use strict';

    const serial = new URLSearchParams(location.search).get('serial');
    if (serial) {
        const tryFill = setInterval(() => {
            const input = document.querySelector('input#serial-input');
            if (input) {
                clearInterval(tryFill);
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                nativeInputValueSetter.call(input, serial);
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, 300);
    }
})();