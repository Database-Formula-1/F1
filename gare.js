// Esempio base, puoi aggiungere tutti gli anni qui
const databaseGare = {
    2025: gare2025,
    // 2024: gare2024,
};

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

        // Creo un nuovo select tracciati con le nuove opzioni
        const nuovoSelectTracciato = creaCustomSelect(nuoviTracciati, "Scegli Gara", (tracciato) => {
            tracciatoSelezionato = tracciato;
            console.log("Tracciato selezionato:", tracciato);
            // Se vuoi aggiornare altro, fallo qui
        });

        // Sostituisco il vecchio select tracciato con il nuovo
        containerSelect.replaceChild(nuovoSelectTracciato, customSelectTracciato);
        customSelectTracciato = nuovoSelectTracciato;
    }

    // Avvio iniziale con valori di default
    aggiornaTracciati(annoSelezionato);
    mostraTabellaRiassuntiva(annoSelezionato, modalitaSelezionata);
}



// Avvio
mostraMenuGare();
