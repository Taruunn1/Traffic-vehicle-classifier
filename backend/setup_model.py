#!/usr/bin/env python
"""Script to register the trained model in the database"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models_db import ModelsDatabase
import json

def main():
    db = ModelsDatabase()

    # Clear existing models to register all 3
    print("Clearing existing models...")
    db.clear_all_models()

    # Add Model 1: Classification Model (Keras)
    print("\n📌 Registering Model 1: Traffic Vehicle Classifier (Keras)")
    db.add_model(
        name='Traffic Vehicle Classifier - Keras',
        model_path='models/traffic_model.keras',
        encoder_path='models/label_encoder.pkl',
        model_type='classification',
        classes=['ambulance', 'fire_truck', 'police', 'car', 'bus', 'truck', 'bicycle', 'motorcycle']
    )

    # Add Model 2: YOLO Detection Model
    print("📌 Registering Model 2: YOLOv8 Detection Model")
    db.add_model(
        name='YOLOv8 Nano - Detection',
        model_path='yolov8n.pt',
        encoder_path=None,
        model_type='detection',
        classes=['vehicle', 'person', 'car', 'truck', 'bus', 'motorcycle', 'bicycle']
    )

    # Add Model 3: Alternative Classification Model
    print("📌 Registering Model 3: Enhanced Traffic Classifier")
    db.add_model(
        name='Enhanced Traffic Classifier',
        model_path='models/traffic_model.keras',
        encoder_path='models/label_encoder.pkl',
        model_type='classification',
        classes=['ambulance', 'army vehicle', 'auto rickshaw', 'bicycle', 'bus', 'car', 'garbagevan', 
                 'human hauler', 'minibus', 'minivan', 'motorbike', 'pickup', 'policecar', 'rickshaw', 
                 'scooter', 'suv', 'taxi', 'three wheelers -CNG-', 'truck', 'van', 'wheelbarrow']
    )

    # Get all models
    models = db.get_models()
    print('\n✅ All Models Registered in Database:')
    for m in models:
        print(f'  ID: {m[0]}, Name: {m[1]}, Type: {m[4]}, Active: {m[7]}')

    # Set first model as active
    db.set_active_model(1)
    print('\n🚀 Model ID 1 set as active!')

if __name__ == '__main__':
    main()

