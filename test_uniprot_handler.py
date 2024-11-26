from uniprot_handler import fetch_uniprot_data

def test_fetch_uniprot_data():
    # Example protein ID
    protein_id = "O00194"  # Replace with an actual UniProt ID for testing

    print(f"Fetching data for protein ID: {protein_id}")
    data = fetch_uniprot_data(protein_id)

    if data:
        print("\nPDB Entries:")
        for entry in data["pdb_entries"]:
            print(entry)

        print("\nAlphaFold Entries:")
        for entry in data["alphafold_entries"]:
            print(entry)
    else:
        print("No data retrieved.")

if __name__ == "__main__":
    test_fetch_uniprot_data()
