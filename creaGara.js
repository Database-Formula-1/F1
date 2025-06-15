const pilotiPredefiniti = [
    { nome: "Lando Norris", scuderia: "McLaren" },
    { nome: "Oscar Piastri", scuderia: "McLaren" },
    { nome: "Max Verstappen", scuderia: "Red Bull" },
    { nome: "Yuki Tsunoda", scuderia: "Red Bull" },
    { nome: "Charles Leclerc", scuderia: "Ferrari" },
    { nome: "Lewis Hamilton", scuderia: "Ferrari" },
    { nome: "George Russell", scuderia: "Mercedes" },
    { nome: "Kimi Antonelli", scuderia: "Mercedes" },
    { nome: "Alexander Albon", scuderia: "Williams" },
    { nome: "Carlos Sainz", scuderia: "Williams" },
    { nome: "Isack Hadjar", scuderia: "Racing Bulls" },
    { nome: "Liam Lawson", scuderia: "Racing Bulls" },
    { nome: "Esteban Ocon", scuderia: "Haas" },
    { nome: "Oliver Bearman", scuderia: "Haas" },
    { nome: "Niko Hulkenberg", scuderia: "Sauber" },
    { nome: "Gabriel Bortoleto", scuderia: "Sauber" },
    { nome: "Fernando Alonso", scuderia: "Aston Martin" },
    { nome: "Lance Stroll", scuderia: "Aston Martin" },
    { nome: "Pierre Gasly", scuderia: "Alpine" },
    { nome: "Franco Colapinto", scuderia: "Alpine" },
    { nome: "Jack Doohan", scuderia: "Alpine" },
];

function creaFormGara() {
    const main = document.getElementById("main-content");
    main.innerHTML = "";

    const form = document.createElement("form");
    form.id = "crea-gara-form";

    const anno = new Date().getFullYear();

    form.innerHTML = `
    <h2>📝 Crea nuova gara</h2>

    <label>Anno:
        <input type="number" name="anno" value="${anno}" />
    </label>

    <label>Nome Gara / Paese:
        <input type="text" name="nomeGara" placeholder="Es. GP Monaco" />
        <label style="margin-left: 1rem;">
            <input type="checkbox" id="is-sprint-checkbox" />
            Gara Sprint
        </label>
    </label>

    <h3>Piloti e risultati:</h3>
    <div id="piloti-container"></div>

    <button type="button" id="genera-json">📦 Genera JSON</button>

    <h3>Output:</h3>
    <pre id="output-json">{ }</pre>
`;


    main.appendChild(form);

    const pilotiContainer = document.getElementById("piloti-container");
    const isSprintCheckbox = document.getElementById("is-sprint-checkbox");

    // Funzione per generare tutti i campi pilota (con o senza sprint)
    function generaCampiPiloti(includeSprint = false) {
        pilotiContainer.innerHTML = ""; // Pulisce il contenitore

        pilotiPredefiniti.forEach((pilota, index) => {
            const pilotaDiv = document.createElement("div");
            pilotaDiv.className = "pilota-box";

            pilotaDiv.innerHTML = `
            <fieldset>
                <legend>Pilota ${index + 1}</legend>

                <label>Nome:
                    <input type="text" value="${pilota.nome}" class="pilota-nome" />
                </label>

                <label>Scuderia:
                    <input type="text" value="${pilota.scuderia}" class="pilota-scuderia" />
                </label>

                <label>Q1:
                    <input type="text" class="q1" placeholder="1:30.123" />
                </label>

                <label>Q2:
                    <input type="text" class="q2" placeholder="1:29.987" />
                </label>

                <label>Q3:
                    <input type="text" class="q3" placeholder="1:29.456" />
                </label>

                <label>Posizione Qualifica:
                    <input type="number" class="pos-qualifica" />
                </label>

                <label>Posizione Finale:
                    <input type="number" class="pos-finale" />
                </label>

                ${includeSprint ? `
                <label>Posizione Sprint:
                    <input type="number" class="pos-sprint" />
                </label>` : ""}

                <label><input type="checkbox" class="giro-veloce" /> Giro Veloce</label>
                <label><input type="checkbox" class="pilota-giorno" /> Pilota del Giorno</label>
                <label><input type="checkbox" class="dnf" /> Non ha finito</label>
            </fieldset>
        `;

            pilotiContainer.appendChild(pilotaDiv);
        });
    }

    // Primo caricamento
    generaCampiPiloti(isSprintCheckbox.checked);

    // Rigenera i campi quando si clicca sul checkbox
    isSprintCheckbox.addEventListener("change", () => {
        generaCampiPiloti(isSprintCheckbox.checked);
    });


    document.getElementById("genera-json").addEventListener("click", () => {
        const datiForm = {
            anno: parseInt(form.anno.value),
            gara: form.nomeGara.value,
            piloti: []
        };

        const fieldsets = form.querySelectorAll("fieldset");

        fieldsets.forEach(fs => {
            const pilota = {
                nome: fs.querySelector(".pilota-nome").value,
                scuderia: fs.querySelector(".pilota-scuderia").value,
                q1: fs.querySelector(".q1").value,
                q2: fs.querySelector(".q2").value,
                q3: fs.querySelector(".q3").value,
                posizioneQualifica: parseInt(fs.querySelector(".pos-qualifica").value),
                posizioneFinale: parseInt(fs.querySelector(".pos-finale").value),
                giroVeloce: fs.querySelector(".giro-veloce").checked,
                pilotaDelGiorno: fs.querySelector(".pilota-giorno").checked,
                dnf: fs.querySelector(".dnf").checked
            };

            const posSprint = fs.querySelector(".pos-sprint");
            if (posSprint && posSprint.value !== "") {
                pilota.sprint = parseInt(posSprint.value);
            }

            datiForm.piloti.push(pilota);
        });


        document.getElementById("output-json").textContent = JSON.stringify(datiForm, null, 2);
    });
}
