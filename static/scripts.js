// Reset functionality
document.getElementById("reset-button").addEventListener("click", function () {
    document.getElementById("search-bar").value = "";
    document.getElementById("results").innerHTML = "";
    document.getElementById("search-results").innerHTML = "";
    document.getElementById("protein-results").innerHTML = "";
    document.getElementById("transmembrane-results").innerHTML = "";
    document.getElementById("binding-site-results").innerHTML = "";
    document.getElementById("pdb-results").innerHTML = "";
    document.getElementById("alphafold-results").innerHTML = "";
});

// Auto-suggest functionality
document.getElementById("search-bar").addEventListener("input", function () {
    const query = this.value.trim();
    if (query.length < 3) {
        document.getElementById("results").innerHTML = "";
        return;
    }

    fetch(`/search_suggestions?query=${query}`)
        .then((response) => response.json())
        .then((data) => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = "";
            if (data.length === 0) {
                resultsDiv.innerHTML = "<p>No entries found</p>";
            } else {
                const ul = document.createElement("ul");
                data.forEach((item) => {
                    const li = document.createElement("li");
                    li.textContent = `${item[0]} - ${item[1]}`;
                    li.addEventListener("click", () => {
                        document.getElementById("search-bar").value = item[0];
                        resultsDiv.innerHTML = "";
                    });
                    ul.appendChild(li);
                });
                resultsDiv.appendChild(ul);
            }
        })
        .catch((error) => console.error("Error fetching suggestions:", error));
});

// Function to add banded rows to tables
function addBandedRows(table) {
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row, index) => {
        row.style.backgroundColor = index % 2 === 0 ? "#81b3c1" : "#ffffff"; // Alternating colors
    });
}

// Fetch and display search results
document.getElementById("search-button").addEventListener("click", function () {
    const query = document.getElementById("search-bar").value.trim();
    const threshold = document.getElementById("threshold").value.trim();
    const organism = document.querySelector('input[name="type"]:checked').value;
    const limitBound = document.getElementById("limit-bound").checked;

    if (!query) {
        alert("Please enter a valid search query.");
        return;
    }

    fetch("/search_results", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: query,
            threshold: threshold,
            organism: organism,
            limit_bound: limitBound,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = "";

            // Create a flex container for tables and visualization
            const flexContainer = document.createElement("div");
            flexContainer.style.display = "flex";
            flexContainer.style.gap = "10px";

            // Protein data container
            const proteinDataContainer = document.createElement("div");
            proteinDataContainer.className = "protein-container";  // for scrolling

            // Display protein_data table
            const proteinData = data.protein_data;
            if (proteinData.length > 0) {
                const summary = document.createElement("p");
                const proteinHeader = document.createElement("h3");
                proteinHeader.textContent = "Protein Data";
                proteinDataContainer.appendChild(proteinHeader);

                //summary.innerHTML = `Protein: <strong>${query}</strong> - Fetched ${proteinData.length} records meeting the criteria.`;
                proteinDataContainer.appendChild(summary);

                const proteinTable = document.createElement("table");
                proteinTable.style.borderCollapse = "collapse";
                proteinTable.style.width = "100%";
                proteinTable.innerHTML = `
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ccc; padding: 3px;">POS</th>
                            <th style="border: 1px solid #ccc; padding: 3px;">RES</th>
                            <th style="border: 1px solid #ccc; padding: 3px;">IUPRED2</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;

                const tbody = proteinTable.querySelector("tbody");
                proteinData.forEach((row) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td style="border: 1px solid #ccc; padding: 5px;">${row.Pos}</td>
                        <td style="border: 1px solid #ccc; padding: 5px;">${row.RES}</td>
                        <td style="border: 1px solid #ccc; padding: 5px;">${row.IUPRED2}</td>
                    `;
                    tbody.appendChild(tr);
                });
                addBandedRows(proteinTable); // Add banded rows
                proteinDataContainer.appendChild(proteinTable);
            } else {
                proteinDataContainer.innerHTML = "<p>No results found</p>";
            }

            flexContainer.appendChild(proteinDataContainer);

            // Additional data container for Transmembrane and Binding Site
            const additionalDataContainer = document.createElement("div");

            // Display transmembrane_data table
            const transmembraneData = data.transmembrane_data;
            const transmembraneHeader = document.createElement("h3");
            transmembraneHeader.textContent = "Transmembrane";
            additionalDataContainer.appendChild(transmembraneHeader);

            if (transmembraneData.length > 0) {
                const transTable = document.createElement("table");
                transTable.style.borderCollapse = "collapse";
                transTable.style.width = "100%";
                transTable.innerHTML = `
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ccc; padding: 5px;">L Bound</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">U Bound</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;

                const transTbody = transTable.querySelector("tbody");
                transmembraneData.forEach((row) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td style="border: 1px solid #ccc; padding: 5px;">${row.lower_bound}</td>
                        <td style="border: 1px solid #ccc; padding: 5px;">${row.upper_bound}</td>
                    `;
                    transTbody.appendChild(tr);
                });
                addBandedRows(transTable);
                additionalDataContainer.appendChild(transTable);
            } else {
                additionalDataContainer.innerHTML += "<p>No Transmembrane Results.</p>";
            }

            // Display binding_site_data table
            const bindingSiteData = data.binding_site_data;
            const bindingHeader = document.createElement("h3");
            bindingHeader.textContent = "Binding Site";
            additionalDataContainer.appendChild(bindingHeader);

            if (bindingSiteData.length > 0) {
                const bindTable = document.createElement("table");
                bindTable.style.borderCollapse = "collapse";
                bindTable.style.width = "100%";
                bindTable.innerHTML = `
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ccc; padding: 5px;">L Bound</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">U Bound</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;

                const bindTbody = bindTable.querySelector("tbody");
                bindingSiteData.forEach((row) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td style="border: 1px solid #ccc; padding: 5px;">${row.lower_bound}</td>
                        <td style="border: 1px solid #ccc; padding: 5px;">${row.upper_bound}</td>
                    `;
                    bindTbody.appendChild(tr);
                });
                addBandedRows(bindTable);
                additionalDataContainer.appendChild(bindTable);
            } else {
                additionalDataContainer.innerHTML += "<p>No Binding Site Results</p>";
            }

            flexContainer.appendChild(additionalDataContainer);

            const pdbAlphaContainer = document.createElement("div");
            pdbAlphaContainer.style.display = "flex";
            pdbAlphaContainer.style.flexDirection = "column"; // Stack tables vertically
            pdbAlphaContainer.style.gap = "10px"; // Optional: Add spacing between tables

            const jMolContainer = document.createElement("div"); //container for JMOL visualization
            jMolContainer.style.display = "flex";
            jMolContainer.style.gap = "10px"; // Optional: Add spacing between tables
            jMolContainer.style.width = "650px";
            jMolContainer.style.height = "400px";
            jMolContainer.style.border = "1px solid #ccc";
            jMolContainer.style.marginLeft = "20px";
            jMolContainer.style.padding = "10px";
            jMolContainer.id = "viewer-container";

            // Embed the 3Dmol viewer URL using an iframe
            const viewerIframe = document.createElement("iframe");
            //viewerIframe.src = "https://3Dmol.org/viewer.html?pdb=1YCR&select=chain:A&style=cartoon;stick:radius~0.1&surface=opacity:0.8;colorscheme:whiteCarbon&select=chain:B&style=cartoon;line&select=resi:19,23,26;chain:B&style=stick&labelres=backgroundOpacity:0.8;fontSize:14";
            viewerIframe.style.width = "100%";
            viewerIframe.style.height = "100%";
            viewerIframe.style.border = "none";
            viewerIframe.title = "3Dmol Viewer";

            // Fetch and display UniProt PDB and AlphaFold entries
            fetch(`/fetch_uniprot_entries?protein_id=${query}`)
                .then((response) => response.json())
                .then((uniprotData) => {
                    // PDB Entries Table
                    if (uniprotData.pdb_entries.length > 0) {
                        const pdbTable = document.createElement("table");
                        pdbTable.style.borderCollapse = "collapse";
                        pdbTable.style.width = "100%";
                        pdbTable.innerHTML = `
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #ccc; padding: 5px;">Id</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">L_B</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">U_B</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">rcsb</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        `;

                        const pdbTbody = pdbTable.querySelector("tbody");
                        uniprotData.pdb_entries.forEach((entry) => {
                            const tr = document.createElement("tr");
                            tr.innerHTML = `
                                <td style="border: 1px solid #ccc; padding: 5px;"><a href="#" class="pdb-link" data-id="${entry.Identifier}">${entry.Identifier}</a></td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.L_Bound || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.U_Bound || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 3px; text-align: center; vertical-align: middle;">
                                    <a href="https://www.rcsb.org/3d-view/${entry.Identifier}" target="_blank">
                                    <img src="/static/images/rcsb.png" alt="RCSB Icon" style="width: 15px; height: 15px;"/>
                                    </a>
                                </td>

                            `;
                            pdbTbody.appendChild(tr);
                        });
                        addBandedRows(pdbTable);
                        const pdbContainer = document.createElement("div");
                        pdbContainer.innerHTML = "<h3>PDB Entries</h3>";
                        pdbContainer.appendChild(pdbTable);
                        pdbAlphaContainer.appendChild(pdbContainer);
                        //flexContainer.appendChild(pdbContainer);
                        // start change for iframe
                        // Attach event listener for dynamic iframe update
                        pdbTable.addEventListener("click", function (event) {
                            const target = event.target;
                            if (target.classList.contains("pdb-link")) {
                                event.preventDefault();
                                const proteinId = target.dataset.id;
                                // Update the iframe dynamically
                                const viewerIframe = document.querySelector("#viewer-container iframe");
                                if (viewerIframe) {
                                    viewerIframe.src = `https://3Dmol.org/viewer.html?pdb=${proteinId}&select=chain:A&style=cartoon:color~spectrum;stick:radius~0.1&select=chain:B&style=cartoon:color~spectrum;stick:radius~0.1`;
                                } else {
                                    console.error("Viewer iframe not found.");
                                }
                            }
                        });
                        // end change for iframe
                    }

                    // AlphaFold Entries Table
                    if (uniprotData.alphafold_entries.length > 0) {
                        const alphaTable = document.createElement("table");
                        alphaTable.style.borderCollapse = "collapse";
                        alphaTable.style.width = "100%";
                        alphaTable.innerHTML = `
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #ccc; padding: 5px;">Id</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">L_B</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">U_B</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">rcsb</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        `;

                        const alphaTbody = alphaTable.querySelector("tbody");
                        uniprotData.alphafold_entries.forEach((entry) => {
                            const tr = document.createElement("tr");
                            tr.innerHTML = `
                                <td style="border: 1px solid #ccc; padding: 5px;"><a href="#" class="alphafold-link" data-id="${entry.Identifier}">${entry.Identifier}</a></td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.L_Bound || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.U_Bound || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 3px; text-align: center; vertical-align: middle;">
                                    <a href="https://www.rcsb.org/3d-view/AF_AF${entry.Identifier}F1" target="_blank">
                                    <img src="/static/images/rcsb.png" alt="RCSB Icon" style="width: 15px; height: 15px;"/>
                                    </a>
                                </td>
                            `;
                            alphaTbody.appendChild(tr);
                        });
                        addBandedRows(alphaTable);
                        const alphaContainer = document.createElement("div");
                        alphaContainer.innerHTML = "<h3>AlphaFold Entries</h3>";
                        alphaContainer.appendChild(alphaTable);
                        pdbAlphaContainer.appendChild(alphaContainer);
                        // start change for iframe
                        // Attach event listener for dynamic iframe update
                        alphaTable.addEventListener("click", function (event) {
                            const target = event.target;
                            if (target.classList.contains("alphafold-link")) {
                                event.preventDefault();
                                const proteinId = target.dataset.id;
                                // Update the iframe dynamically
                                const viewerIframe = document.querySelector("#viewer-container iframe");
                                if (viewerIframe) {
                                    viewerIframe.src = `https://3dmol.org/viewer.html?url=https://alphafold.ebi.ac.uk/files/AF-${proteinId}-F1-model_v4.pdb&style=cartoon:color~spectrum`;
                                } else {
                                    console.error("Viewer iframe not found.");
                                }
                            }
                        });
                        // end change for iframe

                        flexContainer.appendChild(pdbAlphaContainer);

                        // Embed the 3Dmol viewer URL using an iframe
                        const viewerIframe = document.createElement("iframe");
                        //viewerIframe.src = "https://3Dmol.org/viewer.html?pdb=1YCR&select=chain:A&style=cartoon;stick:radius~0.1&surface=opacity:0.8;colorscheme:whiteCarbon&select=chain:B&style=cartoon;line&select=resi:19,23,26;chain:B&style=stick&labelres=backgroundOpacity:0.8;fontSize:14";
                        viewerIframe.style.width = "100%";
                        viewerIframe.style.height = "100%";
                        viewerIframe.style.border = "none";
                        viewerIframe.title = "3Dmol Viewer";

                        // Append the iframe to the container
                        jMolContainer.appendChild(viewerIframe);
                        flexContainer.appendChild(jMolContainer);

                    }
                })
                .catch((error) => {
                    console.error("Error fetching UniProt entries:", error);
                });

            // Append the flex container to results div
            resultsDiv.appendChild(flexContainer);
        })
        .catch((error) => console.error("Error fetching search results:", error));
});
