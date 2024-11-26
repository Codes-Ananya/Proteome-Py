from flask import Flask, request, jsonify, render_template
from db_util import get_connection
from uniprot_handler import fetch_uniprot_data


# Initialize Flask application
app = Flask(__name__)

# Define routes
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/search")
def search():
    return render_template("search.html")

@app.route("/search_suggestions")
def search_suggestions():
    query = request.args.get("query", "").strip()
    if len(query) < 3:
        return jsonify([])

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Entry, `Protein names` FROM proteome_data WHERE Entry LIKE %s LIMIT 15", (f"{query}%",))
    results = cursor.fetchall()
    conn.close()

    return jsonify(results)

@app.route("/search_results", methods=["POST"])
def search_results():
    data = request.json
    query = data["query"]
    threshold = float(data["threshold"])

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch data from protein_data table
    cursor.execute("""
        SELECT Pos, RES, IUPRED2
        FROM protein_data
        WHERE Protein = %s AND IUPRED2 > %s
        LIMIT 10
    """, (query, threshold))
    protein_data = cursor.fetchall()

    # Fetch data for Transmembrane
    cursor.execute("""
        SELECT lower_bound, upper_bound
        FROM proteome_parser
        WHERE protein_name = %s AND parsed_value = 'Amino Acid Position'
    """, (query,))
    transmembrane_data = cursor.fetchall()

    # Fetch data for Binding Site
    cursor.execute("""
        SELECT lower_bound, upper_bound
        FROM proteome_parser
        WHERE protein_name = %s AND parsed_value = 'BINDING Amino Acid Position'
    """, (query,))
    binding_site_data = cursor.fetchall()

    conn.close()

    return jsonify({
        "protein_data": protein_data,
        "transmembrane_data": transmembrane_data,
        "binding_site_data": binding_site_data
    })

@app.route("/fetch_uniprot_entries", methods=["GET"])
def fetch_uniprot_entries():
    protein_id = request.args.get("protein_id")
    if not protein_id:
        return jsonify({"error": "Protein ID is required"}), 400

    result = fetch_uniprot_data(protein_id)
    return jsonify(result)

# Run the application
if __name__ == "__main__":
    app.run(debug=True)
