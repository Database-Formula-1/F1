// Esempio base, puoi aggiungere tutti gli anni qui
const databaseGare = {
    2025: gare2025,
    // 2024: gare2024,
};

function hexToRgba(rgbString, alpha) {
    // rgbString esempio: "rgb(255,128,0)"
    const nums = rgbString.match(/\d+/g);
    if (!nums || nums.length < 3) return rgbString;
    const [r, g, b] = nums;
    return `rgba(${r},${g},${b},${alpha})`;
}

let selectModalita, selectTracciato; // rese globali per essere usate in altre funzioni

function creaCustomSelect(opzioni, placeholder, onSelectCallback) {
    const container = document.createElement("div");
    container.classList.add("custom-select-container");

    const selected = document.createElement("div");
    selected.classList.add("custom-select-selected");
    selected.textContent = placeholder;
    container.appendChild(selected);

    const items = document.createElement("div");
    items.classList.add("custom-select-items", "custom-select-hide");

    opzioni.forEach(opzione => {
        const option = document.createElement("div");
        option.dataset.value = opzione;
        option.textContent = opzione;
        items.appendChild(option);
    });

    container.appendChild(items);

    selected.addEventListener("click", () => {
        items.classList.toggle("custom-select-hide");
    });

    items.querySelectorAll("div").forEach(item => {
        item.addEventListener("click", () => {
            selected.textContent = item.textContent;
            selected.dataset.value = item.dataset.value;
            items.classList.add("custom-select-hide");
            onSelectCallback(item.dataset.value);
        });
    });

    document.addEventListener("click", (e) => {
        if (!container.contains(e.target)) {
            items.classList.add("custom-select-hide");
        }
    });

    return container;
}


function calcolaPunti(posizione) {
    const puntiF1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    return posizione >= 1 && posizione <= 10 ? puntiF1[posizione - 1] : 0;
}

// Funzione per determinare la classe CSS in base alla posizione e modalità
function getClassePosizione(posizione, modalita) {
    if (modalita === "gara") {
        if (posizione === 1) return "podio-oro";
        if (posizione === 2) return "podio-argento";
        if (posizione === 3) return "podio-bronzo";
        if (typeof posizione === "number" && posizione >= 4 && posizione <= 10) return "punti-f1";
        return "";
    } else if (modalita === "qualifica") {
        if (posizione === 1) return "podio-oro";
        if (posizione === 2) return "podio-argento";
        if (typeof posizione === "number" && posizione >= 1 && posizione <= 10) return "q3";
        if (typeof posizione === "number" && posizione >= 11 && posizione <= 15) return "q2"; // Puoi creare una classe diversa se vuoi
        return "";
    }
    return "";
}

// Funzione principale per mostrare la tabella riassuntiva
function mostraTabellaRiassuntiva(anno, modalita = "gara") {
    const gare = databaseGare[anno];
    const containerTabella = document.getElementById("container-tabella");
    containerTabella.innerHTML = "";

    const pilotiMap = new Map();

    gare.forEach(gara => {
        gara.piloti.forEach(pilota => {
            if (!pilotiMap.has(pilota.nome)) {
                pilotiMap.set(pilota.nome, {
                    scuderia: pilota.scuderia,
                    risultati: {},
                    puntiTotali: 0
                });
            }

            const datiPilota = pilotiMap.get(pilota.nome);

            let posizione;
            if (modalita === "gara") {
                posizione = pilota.dnf ? "DNF" : pilota.posizioneFinale;
                if (!pilota.dnf && typeof pilota.posizioneFinale === "number") {
                    datiPilota.puntiTotali += calcolaPunti(pilota.posizioneFinale);
                }
            } else {
                posizione = pilota.posizioneQualifica;
            }

            datiPilota.risultati[gara.gara] = posizione;
        });
    });

    const tabella = document.createElement("table");
    tabella.classList.add("tabella-classifica");

    // Funzione per creare intestazione
    const creaIntestazione = () => {
        const riga = document.createElement("tr");
        riga.innerHTML = "<th>Pilota</th>";
        gare.forEach(g => {
            riga.innerHTML += `<th>${g.gara.slice(0, 3)}</th>`;
        });
        riga.innerHTML += modalita === "gara"
            ? "<th>Punti Totali</th>"
            : "<th>-</th>";
        return riga;
    };

    // Thead
    const thead = document.createElement("thead");
    thead.appendChild(creaIntestazione());
    tabella.appendChild(thead);

    // Tbody
    const tbody = document.createElement("tbody");
    [...pilotiMap.entries()]
        .sort((a, b) => {
            if (modalita === "gara") {
                return b[1].puntiTotali - a[1].puntiTotali;
            } else {
                const mediaA = Object.values(a[1].risultati)
                    .filter(v => typeof v === "number")
                    .reduce((acc, val) => acc + val, 0) / Object.values(a[1].risultati).filter(v => typeof v === "number").length || 0;
                const mediaB = Object.values(b[1].risultati)
                    .filter(v => typeof v === "number")
                    .reduce((acc, val) => acc + val, 0) / Object.values(b[1].risultati).filter(v => typeof v === "number").length || 0;
                return mediaA - mediaB;
            }
        })
        .forEach(([nomePilota, dati]) => {
            const riga = document.createElement("tr");
            const colori = pilotiColori[nomePilota] || ["transparent", "transparent"];
            const cellaPilota = document.createElement("td");
            cellaPilota.style.boxShadow = `inset -5px -5px 8px ${colori[1]}, inset 5px 5px 8px ${colori[0]}`;
            cellaPilota.textContent = nomePilota;
            riga.appendChild(cellaPilota);


            gare.forEach(g => {
                const pos = dati.risultati[g.gara] || "-";
                const cella = document.createElement("td");

                const classe = getClassePosizione(pos, modalita);
                if (classe) cella.classList.add(classe);

                cella.textContent = pos;
                riga.appendChild(cella);
            });

            riga.innerHTML += modalita === "gara"
                ? `<td><strong>${dati.puntiTotali}</strong></td>`
                : `<td>-</td>`;

            tbody.appendChild(riga);
        });

    tabella.appendChild(tbody);

    // Tfoot identico al thead
    const tfoot = document.createElement("tfoot");
    tfoot.appendChild(creaIntestazione());
    tabella.appendChild(tfoot);

    containerTabella.appendChild(tabella);
}



function mostraMenuGare() {
    const main = document.querySelector("main");
    main.innerHTML = "";

    const containerSelect = document.createElement("div");
    containerSelect.classList.add("container-select");

    const anniDisponibili = Object.keys(databaseGare);
    let annoSelezionato = "2025";
    let modalitaSelezionata = "gara";
    let tracciatoSelezionato = null;

    // Placeholder che sarà sostituito da aggiornamento
    let customSelectTracciato = creaCustomSelect([], "Scegli Gara", (tracciato) => {
        tracciatoSelezionato = tracciato;
        console.log("Tracciato selezionato:", tracciato);
        // Qui puoi aggiornare altro se serve
    });

    // Select Anno
    const customSelectAnno = creaCustomSelect(anniDisponibili, annoSelezionato, (anno) => {
        annoSelezionato = anno;
        aggiornaTracciati(annoSelezionato);
        mostraTabellaRiassuntiva(annoSelezionato, modalitaSelezionata);
    });

    // Select Modalità
    const customSelectModalita = creaCustomSelect(["Gara", "Qualifica"], "Gara", (mod) => {
        modalitaSelezionata = mod.toLowerCase();
        if (annoSelezionato) {
            mostraTabellaRiassuntiva(annoSelezionato, modalitaSelezionata);
        }
    });

    // Append dei select
    containerSelect.appendChild(customSelectAnno);
    containerSelect.appendChild(customSelectModalita);
    containerSelect.appendChild(customSelectTracciato);
    main.appendChild(containerSelect);

    const containerTabella = document.createElement("div");
    containerTabella.id = "container-tabella";
    main.appendChild(containerTabella);

    function aggiornaTracciati(anno) {
        const gare = databaseGare[anno] || [];
        const nuoviTracciati = gare.map(g => g.gara);

        const nuovoSelectTracciato = creaCustomSelect(nuoviTracciati, "Scegli Gara", (tracciato) => {
            tracciatoSelezionato = tracciato;
            const gara = databaseGare[anno].find(g => g.gara === tracciato);
            if (gara) {
                mostraDatiGara(gara);
            }
        });

        // Sostituisco il vecchio select tracciato con il nuovo
        containerSelect.replaceChild(nuovoSelectTracciato, customSelectTracciato);
        customSelectTracciato = nuovoSelectTracciato;
    }

    // Avvio iniziale con valori di default
    aggiornaTracciati(annoSelezionato);
    mostraTabellaRiassuntiva(annoSelezionato, modalitaSelezionata);
}

let statoOrdine = {};  // salva l’ordine corrente per ogni colonna

function ordinaTabella(tabella, colIndex) {
    const tbody = tabella.querySelector("tbody");
    const righe = Array.from(tbody.querySelectorAll("tr"));

    const header = tabella.querySelector("thead") || tabella.querySelector("tr");
    const ths = header.querySelectorAll("th");

    // Toggle ordine: crescente <-> decrescente
    statoOrdine[colIndex] = !statoOrdine[colIndex];
    const ordineCrescente = statoOrdine[colIndex];

    // Rileva se è un tempo
    const isTempo = righe.some(riga => {
        const val = riga.children[colIndex].textContent.trim();
        return /^\d+:\d{2}\.\d{3}$/.test(val);
    });

    // Rileva se è numerico (ma non tempo)
const isNumeric = !isTempo && righe.some(riga => {
    const val = riga.children[colIndex].textContent.trim();
    return /^\d+$/.test(val); // almeno un valore intero
});


    righe.sort((a, b) => {
        let valA = a.children[colIndex].textContent.trim();
        let valB = b.children[colIndex].textContent.trim();

        if (isTempo) {
            const secA = tempoStrToSec(valA);
            const secB = tempoStrToSec(valB);
            if (secA === null) return 1;
            if (secB === null) return -1;
            return ordineCrescente ? secA - secB : secB - secA;
        }

        if (isNumeric) {
            const numA = parseInt(valA, 10);
            const numB = parseInt(valB, 10);

            const isValidA = !isNaN(numA);
            const isValidB = !isNaN(numB);

            if (!isValidA && !isValidB) return 0;
            if (!isValidA) return 1;
            if (!isValidB) return -1;

            return ordineCrescente ? numA - numB : numB - numA;
        }


        // Ordina stringhe (alfabetico)
        return ordineCrescente ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    tbody.innerHTML = "";
    righe.forEach(riga => tbody.appendChild(riga));
}

function colorScale(value, modalita = "verde") {
    if (value < 0) value = 0;
    if (value > 1) value = 1;

    if (value <= 0.5) {
        const ratio = value / 0.5;
        const r = 255;
        const g = Math.round(255 * ratio);
        const b = Math.round(255 * ratio);
        return `rgb(${r},${g},${b})`; // rosso → bianco
    } else {
        const ratio = (value - 0.5) / 0.5;
        const r = Math.round(255 * (1 - ratio));
        const g = Math.round(255 - (127 * ratio)); // bianco → verde/blu
        let b;
        if (modalita === "verde") {
            b = Math.round(255 * (1 - ratio)); // bianco → verde
        } else if (modalita === "blu") {
            b = Math.round(255 * ratio); // bianco → blu
        } else {
            b = Math.round(255 * (1 - ratio)); // default fallback
        }
        return `rgb(${r},${g},${b})`;
    }
}

// Funzione per convertire una stringa tempo "m:ss.xxx" o "mm:ss.xxx" in millisecondi
function tempoInMs(tempoStr) {
    if (typeof tempoStr !== "string") return NaN;
    const parti = tempoStr.split(":");
    if (parti.length !== 2) return NaN;
    const minuti = parseInt(parti[0], 10);
    const secondi = parseFloat(parti[1]);
    if (isNaN(minuti) || isNaN(secondi)) return NaN;
    return minuti * 60000 + Math.round(secondi * 1000);
}

function creaScaler(valori, inverti = false) {
    const min = Math.min(...valori);
    const max = Math.max(...valori);
    return function (val) {
        if (max === min) return 0;
        let norm = (val - min) / (max - min);
        return inverti ? 1 - norm : norm;
    };
}

function mostraDatiGara(gara) {
    const containerTabella = document.getElementById("container-tabella");
    containerTabella.innerHTML = "";

    const container = document.createElement("div");
    container.classList.add("container-tabella");

    const tabella = document.createElement("table");
    tabella.classList.add("tabella-classifica");

    // Crea thead
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const colonne = ["Pilota", "Partenza", "Arrivo", "Q1", "Q2", "Q3"];
    colonne.forEach(testo => {
        const th = document.createElement("th");
        th.textContent = testo;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    tabella.appendChild(thead);

    const keys = ["nome", "posizioneQualifica", "posizioneFinale", "q1", "q2", "q3"];
    const colNumeriche = [1, 2, 3, 4, 5]; // colonne da colorare

    // Creo gli scaler per ogni colonna numerica
    const scalerPerCol = {};
    colNumeriche.forEach(colIndex => {
        const key = keys[colIndex];
        let valoriDaScalare;
        if (["q1", "q2", "q3"].includes(key)) {
            valoriDaScalare = gara.piloti.map(p => tempoInMs(p[key])).filter(v => !isNaN(v));
        } else {
            valoriDaScalare = gara.piloti.map(p => p[key]).filter(v => typeof v === "number" && !isNaN(v));
        }
        scalerPerCol[colIndex] = creaScaler(valoriDaScalare, true); // inverti per verde = migliore (minore)
    });

    // Crea tbody
    const tbody = document.createElement("tbody");
    gara.piloti.forEach(pilota => {
        const row = document.createElement("tr");

        // Cellula Pilota colorata
        const colori = pilotiColori[pilota.nome] || ["transparent", "transparent"];
        const cellaPilota = document.createElement("td");
        cellaPilota.style.boxShadow = `inset -5px -5px 8px ${colori[1]}, inset 5px 5px 8px ${colori[0]}`;
        cellaPilota.textContent = pilota.nome;
        row.appendChild(cellaPilota);

        // Celle con colorazione gradiente
        colNumeriche.forEach(colIndex => {
            const td = document.createElement("td");
            const key = keys[colIndex];
            const val = pilota[key];
            td.textContent = val;

            if (val !== null && val !== undefined && val !== "") {
                let normVal;
                if (["q1", "q2", "q3"].includes(key)) {
                    const valMs = tempoInMs(val);
                    if (!isNaN(valMs)) {
                        normVal = scalerPerCol[colIndex](valMs);
                    }
                } else if (typeof val === "number" && !isNaN(val)) {
                    normVal = scalerPerCol[colIndex](val);
                }

                if (normVal !== undefined) {
                    const coloreChiaro = colorScale(normVal, "verde");
                    td.style.backgroundColor = "transparent";

                    td.style.boxShadow = `
                inset -5px -5px 10px ${hexToRgba(coloreChiaro, 0.7)},
                inset 5px 5px 10px ${hexToRgba(coloreChiaro, 0.3)}
            `;
                }
            }

            row.appendChild(td);
        });


        tbody.appendChild(row);
    });

    tabella.appendChild(tbody);

    // Crea tfoot duplicando header
    const tfoot = document.createElement("tfoot");
    const footerRow = headerRow.cloneNode(true);
    tfoot.appendChild(footerRow);
    tabella.appendChild(tfoot);

    container.appendChild(tabella);
    containerTabella.appendChild(container);

    // Aggiungi ordinamento e ordina subito per "Arrivo"
    aggiungiOrdinamentoTabella(tabella);
    ordinaTabella(tabella, 2, true);
}




// Funzione per aggiungere il click sulle intestazioni e ordinare la tabella
let colonnaOrdinata = null;
let ordineCrescente = true;

function aggiungiOrdinamentoTabella(tabella) {
    const headers = tabella.querySelectorAll("th");
    headers.forEach((th, index) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            if (colonnaOrdinata === index) {
                // Stessa colonna, inverti ordine
                ordineCrescente = !ordineCrescente;
            } else {
                // Nuova colonna, ordine crescente di default
                colonnaOrdinata = index;
                ordineCrescente = true;
            }
            ordinaTabella(tabella, index, ordineCrescente);
        });
    });
}


// Funzione di ordinamento tabella (toggle crescente/decrescente)
function ordinaTabella(tabella, colonnaIndex, crescente = false) {
    const tbody = tabella.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    function valoreOrdinamento(text, colIndex) {
        if (colIndex === 1 || colIndex === 2) {
            const n = parseInt(text);
            return isNaN(n) ? (crescente ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER) : n;
        } else if (colIndex >= 3) {
            const sec = tempoStrToSec(text);
            return sec === null ? (crescente ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER) : sec;
        }
        return text.toLowerCase();
    }

    rows.sort((a, b) => {
        const valA = valoreOrdinamento(a.cells[colonnaIndex].textContent, colonnaIndex);
        const valB = valoreOrdinamento(b.cells[colonnaIndex].textContent, colonnaIndex);

        if (valA < valB) return crescente ? -1 : 1;
        if (valA > valB) return crescente ? 1 : -1;
        return 0;
    });

    tbody.innerHTML = "";

    rows.forEach(r => tbody.appendChild(r));
}



// Avvio
mostraMenuGare();
