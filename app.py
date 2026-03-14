from flask import Flask, send_from_directory, request, jsonify
import logging
import os

# Flask app configured to serve files from the current directory
# This lets us serve index.html, style.css, and script.js without changing the folder structure.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    static_folder=BASE_DIR,   # serve static files from project root
    static_url_path=''        # so /style.css maps directly
)

# Basic logger setup
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
logger = logging.getLogger(__name__)


@app.route('/')
def root():
    """Serve the homepage (index.html) from the project root."""
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/submit', methods=['POST'])
def submit():
    """
    Handle custom order submissions.
    - Expects form-data or JSON with: name, phone, occasion, message, budget.
    - For demo purposes, we log the payload and return a JSON response.
    - Integrate with email/DB/WhatsApp API in production.
    """
    payload = {}

    # Accept application/json and form submissions
    if request.is_json:
        payload = request.get_json(silent=True) or {}
    else:
        # get form values safely
        payload = {
            'name': request.form.get('name', ''),
            'phone': request.form.get('phone', ''),
            'occasion': request.form.get('occasion', ''),
            'message': request.form.get('message', ''),
            'budget': request.form.get('budget', '')
        }

    # Basic sanitation/normalization
    payload = {k: (v.strip() if isinstance(v, str) else v) for k, v in payload.items()}

    # Log the order (replace with real processing: email, DB, etc.)
    logger.info('New custom order: %s', payload)

    # Dummy validation
    required = ['name', 'phone', 'occasion', 'budget']
    missing = [f for f in required if not payload.get(f)]
    if missing:
        return jsonify({
            'ok': False,
            'error': f"Missing fields: {', '.join(missing)}"
        }), 400

    return jsonify({
        'ok': True,
        'message': f"Thanks {payload.get('name')}! We'll contact you at {payload.get('phone')} to finalize your {payload.get('occasion')}."
    })


@app.errorhandler(404)
def not_found(_):
    # Fallback to index.html so direct navigation to anchors still works
    index_path = os.path.join(BASE_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(BASE_DIR, 'index.html')
    return jsonify({'error': 'Not found'}), 404


if __name__ == '__main__':
    # Host on all interfaces for local network testing; disable in production
    app.run(host='0.0.0.0', port=5000, debug=True)
