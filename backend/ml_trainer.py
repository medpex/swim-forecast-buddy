import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

# Assuming services.py and features.py are in the same directory or PYTHONPATH is set
try:
    import services
    import features
except ImportError:
    print("Make sure services.py and features.py are accessible.")
    # Fallback for direct execution if path issues occur in some environments, not ideal for production
    from . import services
    from . import features


TARGET_COLUMN = 'visitor_count'
MODEL_DIR = "backend/models"
MODEL_FILENAME = "visitor_forecast_model.joblib"
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)

def train_model():
    print("Starting model training process...")

    # 1. Load historical data
    print("Loading historical visitor data...")
    try:
        # The historical_data_df should ideally contain:
        # 'date', 'visitor_count', and observed weather features like
        # 'temp', 'humidity', 'wind_speed', 'pop' (if available historically).
        # If weather features are not in 'visitor_data' table, they need to be merged from another source.
        # For this baseline, we assume 'visitor_data' has some weather columns or they will be NaNs handled by features.py
        historical_data_df = services.get_historical_visitor_data(limit=2000) # Fetch more data for robust training
    except Exception as e:
        print(f"Error loading historical data: {e}")
        print("Please ensure Supabase is configured and 'visitor_data' table exists with relevant data.")
        return

    if historical_data_df.empty:
        print("No historical data loaded. Aborting training.")
        return

    print(f"Loaded {len(historical_data_df)} historical records.")
    print("Sample of loaded data:\n", historical_data_df.head())


    # 2. Prepare features for the model
    print("Preparing features for the model...")
    try:
        # features.MODEL_FEATURES lists the feature columns the model will be trained on.
        # The prepare_features_for_model function will create date features,
        # select the MODEL_FEATURES, and handle any missing ones by filling with 0.
        # It will also keep the TARGET_COLUMN.
        prepared_df = features.prepare_features_for_model(
            historical_data_df,
            target_column=TARGET_COLUMN,
            is_training=True
        )
    except Exception as e:
        print(f"Error during feature preparation: {e}")
        return

    if prepared_df.empty or TARGET_COLUMN not in prepared_df.columns:
        print("Feature preparation resulted in empty data or missing target column. Aborting training.")
        return

    # Drop rows where target is NaN, if any (should not happen if data quality is good)
    prepared_df.dropna(subset=[TARGET_COLUMN], inplace=True)

    # Ensure all feature columns are numeric; this should be handled by fillna(0) in features.py
    # but as a safeguard:
    for col in features.MODEL_FEATURES:
        if col not in prepared_df.columns:
            print(f"Warning: Feature column '{col}' defined in MODEL_FEATURES is missing from prepared_df. It will be treated as all zeros.")
            prepared_df[col] = 0 # Ensure column exists if prepare_features_for_model didn't add it (should have)
        elif not pd.api.types.is_numeric_dtype(prepared_df[col]):
            print(f"Warning: Feature column '{col}' is not numeric. Attempting to convert or fill with 0.")
            prepared_df[col] = pd.to_numeric(prepared_df[col], errors='coerce').fillna(0)


    X = prepared_df[features.MODEL_FEATURES]
    y = prepared_df[TARGET_COLUMN]

    if X.empty or len(X) < 10: # Need a reasonable amount of data
        print("Not enough data points after feature preparation. Aborting training.")
        return

    print(f"Features for training (X head):\n{X.head()}")
    print(f"Target for training (y head):\n{y.head()}")
    print(f"Shape of X: {X.shape}, Shape of y: {y.shape}")

    # 3. Split data into training and testing sets
    print("Splitting data into training and testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    if X_train.empty or X_test.empty:
        print("Not enough data after splitting for training and testing. Aborting.")
        return

    # 4. Train the Random Forest Regressor model
    print("Training RandomForestRegressor model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1, max_depth=10, min_samples_split=5, min_samples_leaf=3)
    try:
        model.fit(X_train, y_train)
    except Exception as e:
        print(f"Error during model fitting: {e}")
        print("Check data types and presence of NaN/inf values in features.")
        return
    print("Model training complete.")

    # 5. Evaluate the model
    print("Evaluating model performance...")
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    print(f"Model Evaluation on Test Set:")
    print(f"  Mean Absolute Error (MAE): {mae:.2f}")
    print(f"  R-squared (R2): {r2:.2f}")

    # Feature importances (optional, but good for understanding)
    try:
        importances = model.feature_importances_
        feature_importance_df = pd.DataFrame({'feature': features.MODEL_FEATURES, 'importance': importances})
        feature_importance_df = feature_importance_df.sort_values('importance', ascending=False)
        print("\nTop 10 Feature Importances:")
        print(feature_importance_df.head(10))
    except Exception as e:
        print(f"Could not calculate feature importances: {e}")


    # 6. Save the trained model
    print(f"Saving trained model to {MODEL_PATH}...")
    try:
        if not os.path.exists(MODEL_DIR):
            os.makedirs(MODEL_DIR)
        joblib.dump(model, MODEL_PATH)
        print(f"Model successfully saved to {MODEL_PATH}")
    except Exception as e:
        print(f"Error saving model: {e}")

if __name__ == "__main__":
    # This allows running the training script directly.
    # Ensure .env file is present in the backend directory for Supabase/OpenWeather credentials.
    # Make sure services.py and features.py are in the same directory or accessible via PYTHONPATH.

    # Add backend directory to sys.path if running from root, for example
    # This is a common pattern but can be tricky depending on execution context
    import sys
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.append(current_dir)

    # Attempt to re-import if needed due to path modifications
    try:
        import services
        import features
    except ImportError: # Handle cases where script is run from a different working directory
        from backend import services
        from backend import features


    train_model()
