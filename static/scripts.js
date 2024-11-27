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

            // Display protein_data table
            const proteinData = data.protein_data;
            if (proteinData.length > 0) {
                const summary = document.createElement("p");
                //summary.innerHTML = `Protein: <strong>${query}</strong> - Fetched ${proteinData.length} records meeting the criteria.`;
                proteinDataContainer.appendChild(summary);

                const proteinTable = document.createElement("table");
                proteinTable.style.borderCollapse = "collapse";
                proteinTable.style.width = "100%";
                proteinTable.innerHTML = `
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ccc; padding: 5px;">POS</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">RES</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">IUPRED2</th>
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
                proteinDataContainer.appendChild(proteinTable);
            } else {
                proteinDataContainer.innerHTML = "<p>No results found for the selected query and threshold.</p>";
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
                            <th style="border: 1px solid #ccc; padding: 5px;">Lower Bound</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">Upper Bound</th>
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
                additionalDataContainer.appendChild(transTable);
            } else {
                additionalDataContainer.innerHTML += "<p>No results found for Transmembrane.</p>";
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
                            <th style="border: 1px solid #ccc; padding: 5px;">Lower Bound</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">Upper Bound</th>
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
                additionalDataContainer.appendChild(bindTable);
            } else {
                additionalDataContainer.innerHTML += "<p>No results found for Binding Site.</p>";
            }

            flexContainer.appendChild(additionalDataContainer);

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
                                    <th style="border: 1px solid #ccc; padding: 5px;">Identifier</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">Method</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">Resolution</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">Chains</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">L_Bound</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">U_Bound</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        `;

                        const pdbTbody = pdbTable.querySelector("tbody");
                        uniprotData.pdb_entries.forEach((entry) => {
                            const tr = document.createElement("tr");
                            tr.innerHTML = `
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.Identifier}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.Method || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.Resolution || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.Chains || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.L_Bound || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.U_Bound || "N/A"}</td>
                            `;
                            pdbTbody.appendChild(tr);
                        });

                        const pdbContainer = document.createElement("div");
                        pdbContainer.innerHTML = "<h3>PDB Entries</h3>";
                        pdbContainer.appendChild(pdbTable);
                        flexContainer.appendChild(pdbContainer);
                    }

                    // AlphaFold Entries Table
                    if (uniprotData.alphafold_entries.length > 0) {
                        const alphaTable = document.createElement("table");
                        alphaTable.style.borderCollapse = "collapse";
                        alphaTable.style.width = "100%";
                        alphaTable.innerHTML = `
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #ccc; padding: 5px;">Identifier</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">Position</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">L_Bound</th>
                                    <th style="border: 1px solid #ccc; padding: 5px;">U_Bound</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        `;

                        const alphaTbody = alphaTable.querySelector("tbody");
                        uniprotData.alphafold_entries.forEach((entry) => {
                            const tr = document.createElement("tr");
                            tr.innerHTML = `
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.Identifier}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.Position || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.L_Bound || "N/A"}</td>
                                <td style="border: 1px solid #ccc; padding: 5px;">${entry.U_Bound || "N/A"}</td>
                            `;
                            alphaTbody.appendChild(tr);
                        });

                        const alphaContainer = document.createElement("div");
                        alphaContainer.innerHTML = "<h3>AlphaFold Entries</h3>";
                        alphaContainer.appendChild(alphaTable);
                        flexContainer.appendChild(alphaContainer);
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
