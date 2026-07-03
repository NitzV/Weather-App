import os
from flask import Flask, request, jsonify, send_from_directory
import requests

app = Flask(__name__, static_folder='static', static_url_path='')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/weather')
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400
    
    try:
        # 1. Geocode the city name to get lat/lon
        geocode_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        geo_response = requests.get(geocode_url, timeout=10)
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        
        if not geo_data.get('results'):
            return jsonify({'error': f"City '{city}' not found."}), 404
        
        location = geo_data['results'][0]
        lat = location['latitude']
        lon = location['longitude']
        city_name = location['name']
        country = location.get('country', '')
        admin1 = location.get('admin1', '')  # State/Province
        
        # 2. Get the weather data
        weather_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m"
            f"&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
            f"&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max"
            f"&timezone=auto"
        )
        weather_response = requests.get(weather_url, timeout=10)
        weather_response.raise_for_status()
        weather_data = weather_response.json()
        
        # Format a clean payload for the frontend
        payload = {
            'location': {
                'city': city_name,
                'state': admin1,
                'country': country,
                'latitude': lat,
                'longitude': lon
            },
            'current': weather_data.get('current', {}),
            'hourly': weather_data.get('hourly', {}),
            'daily': weather_data.get('daily', {})
        }
        return jsonify(payload)
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f"Failed to fetch weather data: {str(e)}"}), 500
    except Exception as e:
        return jsonify({'error': f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
