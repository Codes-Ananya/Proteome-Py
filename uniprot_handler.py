import requests

def fetch_uniprot_data(protein_id):
    """
    Fetch PDB and AlphaFold entries from the UniProt API for a given protein ID.
    """
    url = f"https://rest.uniprot.org/uniprotkb/{protein_id}.json"
    try:
        # Fetch data from UniProt API
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
    
        # Parse PDB entries
        pdb_entries = []
        alphafold_entries = []

        if "uniProtKBCrossReferences" in data:
            for entry in data["uniProtKBCrossReferences"]:
                # Handle PDB entries
                if entry.get("database") == "PDB":
                    chains = entry.get("properties", [])
                    chains_str = next((prop["value"] for prop in chains if prop["key"] == "Chains"), "")
                    for chain in chains_str.split(","):
                        chain_details = chain.split("=")
                        pdb_entries.append({
                            "Identifier": entry.get("id"),
                            "Method": next((prop["value"] for prop in chains if prop["key"] == "Method"), ""),
                            "Resolution": next((prop["value"] for prop in chains if prop["key"] == "Resolution"), ""),
                            "Chains": chain_details[0].strip() if len(chain_details) > 0 else None,
                            "L_Bound": int(chain_details[1].split("-")[0]) if len(chain_details) > 1 and "-" in chain_details[1] else None,
                            "U_Bound": int(chain_details[1].split("-")[1]) if len(chain_details) > 1 and "-" in chain_details[1] else None,
                        })

                # Handle AlphaFoldDB entries
                elif entry.get("database") == "AlphaFoldDB":
                    identifier = entry.get("id")
                    u_bound = None
                    # Extract the highest `end.value` where type is "Chain" in `features`
                    if "features" in data:
                        for feature in data["features"]:
                            if feature.get("type") == "Chain":
                                end_value = feature.get("location", {}).get("end", {}).get("value")
                                if end_value:
                                    u_bound = max(u_bound, end_value) if u_bound else end_value
                    
                    alphafold_entries.append({
                        "Identifier": identifier,
                        "L_Bound": 1,  # Hardcoded as per requirement
                        "U_Bound": u_bound,
                    })
                    break  # Stop after the first AlphaFoldDB entry

        return {
            "pdb_entries": pdb_entries,
            "alphafold_entries": alphafold_entries,
        }
    except Exception as e:
        print(f"Error fetching or parsing UniProt data: {e}")
        return {"pdb_entries": [], "alphafold_entries": []}

# Testing
if __name__ == "__main__":
    protein_id = "O75762"  # Replace with any protein ID for testing
    print(f"Fetching data for protein ID: {protein_id}")
    results = fetch_uniprot_data(protein_id)

    print("\nPDB Entries:")
    for entry in results["pdb_entries"]:
        print(entry)

    print("\nAlphaFold Entries:")
    for entry in results["alphafold_entries"]:
        print(entry)
