// Esempio base, puoi aggiungere tutti gli anni qui
const databaseGare = {
    2025: gare2025,
    // 2024: gare2024,
};

// Funzione per mostrare i menu
function mostraMenuGare() {
    const main = document.querySelector("main");

    // Pulisce il contenuto attuale
    main.innerHTML = "";

    // Selezione anno
    const selectAnno = document.createElement("select");
    selectAnno.innerHTML = `<option disabled selected>Scegli anno</option>`;

    Object.keys(databaseGare).forEach(anno => {
        const opt = document.createElement("option");
        opt.value = anno;
        opt.textContent = anno;
        selectAnno.appendChild(opt);
    });

    // Selezione tracciato (si riempie dopo la scelta dell’anno)
    const selectTracciato = document.createElement("select");
    selectTracciato.innerHTML = `<option disabled selected>Scegli tracciato</option>`;
    selectTracciato.disabled = true;

    // Quando selezioni un anno
    selectAnno.addEventListener("change", () => {
        const anno = selectAnno.value;
        const gare = databaseGare[anno];

        // Pulisce e riempie il secondo select
        selectTracciato.innerHTML = `<option disabled selected>Scegli tracciato</option>`;
        gare.forEach(gara => {
            const opt = document.createElement("option");
            opt.value = gara.gara;
            opt.textContent = gara.gara;
            selectTracciato.appendChild(opt);
        });

        selectTracciato.disabled = false;
    });

    // Append nel DOM
    main.appendChild(selectAnno);
    main.appendChild(document.createElement("br"));
    main.appendChild(selectTracciato);
}
