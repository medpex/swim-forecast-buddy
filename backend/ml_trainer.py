import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
import sys

from backend import services, features
from backend.database import SessionLocal

TARGET_COLUMN = 'visitor_count'
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_FILENAME = "visitor_forecast_model.joblib"
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)

def train_model():
    print("Starting model training process...")

    db = SessionLocal()
    print("Database session created for training.")

    try:
        # 1. Load historical data
        print("Loading historical visitor data...")
        historical_data_df = services.get_historical_visitor_data(db=db, limit=2000)

        if historical_data_df.empty:
            print("No historical data loaded. Aborting training.")
            return

        print(f"Loaded {len(historical_data_df)} records.")
        print(historical_data_df.head())

        # 2. Prepare features
        print("Preparing features for model training...")
        prepared_df = features.prepare_features_for_model(
            historical_data_df,
            target_column=TARGET_COLUMN,
            is_training=True
        )

        if prepared_df.empty or TARGET_COLUMN not in prepared_df.columns:
            print("Invalid or empty feature set. Aborting.")
            return

        prepared_df.dropna(subset=[TARGET_COLUMN], inplace=True)

        # Ensure all model features exist and are numeric
        for col in features.MODEL_FEATURES:
            if col not in prepared_df.columns:
                print(f"Warning: Missing feature '{col}'. Filling with zeros.")
                prepared_df[col] = 0
            elif not pd.api.types.is_numeric_dtype(prepared_df[col]):
                print(f"Warning: Non-numeric feature '{col}'. Attempting conversion.")
                prepared_df[col] = pd.to_numeric(prepared_df[col], errors='coerce').fillna(0)

        X = prepared_df[features.MODEL_FEATURES]
        y = prepared_df[TARGET_COLUMN]

        if len(X) < 10:
            print("Insufficient training data. Aborting.")
            return

        # 3. Split
        print("Splitting data...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        if X_train.empty or X_test.empty:
            print("Training/testing split failed. Aborting.")
            return

        # 4. Train model
        print("Training RandomForestRegressor...")
        model = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            n_jobs=-1,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=3
        )
        model.fit(X_train, y_train)
        print("Training complete.")

        # 5. Evaluate
        print("Evaluating model...")
        predictions = model.predict(X_test)
        mae = mean_absolute_error(y_test, predictions)
        r2 = r2_score(y_test, predictions)

        print(f"Evaluation Results:\n  MAE: {mae:.2f}\n  R²: {r2:.2f}")

        try:
            importances = model.feature_importances_
            fi_df = pd.DataFrame({'feature': features.MODEL_FEATURES, 'importance': importances})
            fi_df = fi_df.sort_values('importance', ascending=False)
            print("\nTop Feature Importances:")
            print(fi_df.head(10))
        except Exception as e:
            print(f"Feature importance extraction failed: {e}")

        # 6. Save model
        print(f"Saving model to: {MODEL_PATH}")
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(model, MODEL_PATH)
        print("Model saved successfully.")

    except Exception as e:
        print(f"Exception during training: {e}")
    finally:
        db.close()
        print("Database session closed.")

if __name__ == "__main__":
    # Adjust sys.path if run directly
    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if backend_root not in sys.path:
        sys.path.insert(0, backend_root)

    train_model()