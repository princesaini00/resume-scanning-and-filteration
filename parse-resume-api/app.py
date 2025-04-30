from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load env vars
load_dotenv()

# Import blueprints
from filter_api import filter_api_blueprint
from resume_parser_api import resume_parser_blueprint

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(filter_api_blueprint)
app.register_blueprint(resume_parser_blueprint)

if __name__ == "__main__":
    app.run(debug=True)
