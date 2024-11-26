import mysql.connector
from config.local_config import config

def get_connection():
    try:
        conn = mysql.connector.connect(
            host=config["host"],
            port=config["port"],
            user=config["user"],
            password=config["password"],
            database=config["database"]
        )
        return conn
    except Exception as e:
        print("Error connecting to database:", e)
        return None
