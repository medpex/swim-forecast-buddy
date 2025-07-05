import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
import sys # For path adjustments in __main__

# Standardized absolute imports
from backend import services
from backend import features # This imports the module
# from backend.features import prepare_features_for_model, MODEL_FEATURES # Alternative: direct import of items
from backend.database import SessionLocal # For creating a local DB session

TARGET_COLUMN = 'visitor_count'
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models") # Use __file__ for robust path
MODEL_FILENAME = "visitor_forecast_model.joblib"
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)

def train_model():
    print("Starting model training process...")

    # Create a new database session for this training operation
    db = SessionLocal()
    print("Database session created for training.")

    try:
        # 1. Load historical data
        print("Loading historical visitor data...")
        historical_data_df = services.get_historical_visitor_data(db=db, limit=2000)

        if historical_data_df.empty:
            print("No historical data loaded. Aborting training.")
            return

        print(f"Loaded {len(historical_data_df)} historical records.")
        print("Sample of loaded data:\n", historical_data_df.head())

        # 2. Prepare features for the model
        print("Preparing features for the model...")
        prepared_df = features.prepare_features_for_model(
            historical_data_df,
            target_column=TARGET_COLUMN,
            is_training=True
        )

        if prepared_df.empty or TARGET_COLUMN not in prepared_df.columns:
            print("Feature preparation resulted in empty data or missing target column. Aborting training.")
            return

        prepared_df.dropna(subset=[TARGET_COLUMN], inplace=True)

        for col in features.MODEL_FEATURES: # Use features.MODEL_FEATURES
            if col not in prepared_df.columns:
                print(f"Warning: Feature column '{col}' defined in MODEL_FEATURES is missing from prepared_df. It will be treated as all zeros.")
                prepared_df[col] = 0
            elif not pd.api.types.is_numeric_dtype(prepared_df[col]):
                print(f"Warning: Feature column '{col}' is not numeric. Attempting to convert or fill with 0.")
                prepared_df[col] = pd.to_numeric(prepared_df[col], errors='coerce').fillna(0)

        X = prepared_df[features.MODEL_FEATURES] # Use features.MODEL_FEATURES
        y = prepared_df[TARGET_COLUMN]

        if X.empty or len(X) < 10:
            print("Not enough data points after feature preparation. Aborting training.")
            return

        print(f"Features for training (X head):\n{X.head()}")
        print(f"Target for training (y head):\n{y.head()}")
        print(f"Shape of X: {X.shape}, Shape of y: {y.shape}")

        # 3. Split data
        print("Splitting data into training and testing sets...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        if X_train.empty or X_test.empty:
            print("Not enough data after splitting for training and testing. Aborting.")
            return

        # 4. Train model
        print("Training RandomForestRegressor model...")
        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1, max_depth=10, min_samples_split=5, min_samples_leaf=3)
        model.fit(X_train, y_train)
        print("Model training complete.")

        # 5. Evaluate model
        print("Evaluating model performance...")
        predictions = model.predict(X_test)
        mae = mean_absolute_error(y_test, predictions)
        r2 = r2_score(y_test, predictions)
        print(f"Model Evaluation on Test Set:")
        print(f"  Mean Absolute Error (MAE): {mae:.2f}")
        print(f"  R-squared (R2): {r2:.2f}")

        try:
            importances = model.feature_importances_
            feature_importance_df = pd.DataFrame({'feature': features.MODEL_FEATURES, 'importance': importances})
            feature_importance_df = feature_importance_df.sort_values('importance', ascending=False)
            print("\nTop 10 Feature Importances:")
            print(feature_importance_df.head(10))
        except Exception as e:
            print(f"Could not calculate feature importances: {e}")

        # 6. Save model
        print(f"Saving trained model to {MODEL_PATH}...")
        if not os.path.exists(MODEL_DIR):
            os.makedirs(MODEL_DIR)
        joblib.dump(model, MODEL_PATH)
        print(f"Model successfully saved to {MODEL_PATH}")

    except Exception as e:
        print(f"An error occurred during the training process: {e}")
        # Optionally re-raise the exception if needed by the caller
        # raise
    finally:
        print("Closing database session for training.")
        db.close()


if __name__ == "__main__":
    # Adjust sys.path for direct execution to find the 'backend' package
    # This assumes ml_trainer.py is in backend/ and the project root is one level up.
    current_script_path = os.path.abspath(__file__)
    backend_dir = os.path.dirname(current_script_path) # Should be /app/backend or similar
    project_root = os.path.dirname(backend_dir) # Should be /app

    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    # Re-import with adjusted path if necessary, though top-level should work now
    from backend import services, features, database
    from backend.database import SessionLocal

    train_model()
