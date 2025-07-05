import pandas as pd
from typing import List, Dict, Any, Optional

# Define the feature list that the model will expect.
# This helps ensure consistency between training and prediction.
# These are examples; the actual list will depend on what's available and useful.
MODEL_FEATURES = [
    'temp', 'feels_like', 'temp_min', 'temp_max', 'humidity', 'wind_speed',
    'pop', # probability of precipitation
    'day_of_week', 'month', 'week_of_year', 'year', 'day_of_year', 'is_weekend',
    # 'is_holiday', 'is_school_break', # Future additions
    # 'special_event_type_encoded' # Future additions
]

def create_date_features(df: pd.DataFrame, date_column: str = 'date') -> pd.DataFrame:
    """
    Creates comprehensive date-based features from a date column.
    Ensures the date column is in datetime format.
    """
    df_copy = df.copy()
    df_copy[date_column] = pd.to_datetime(df_copy[date_column])

    df_copy['day_of_week'] = df_copy[date_column].dt.dayofweek  # Monday=0, Sunday=6
    df_copy['month'] = df_copy[date_column].dt.month
    df_copy['week_of_year'] = df_copy[date_column].dt.isocalendar().week.astype(int)
    df_copy['year'] = df_copy[date_column].dt.year
    df_copy['day_of_year'] = df_copy[date_column].dt.dayofyear
    df_copy['is_weekend'] = df_copy['day_of_week'].isin([5, 6]).astype(int)  # Saturday=5, Sunday=6

    return df_copy

def prepare_features_for_model(
    input_df: pd.DataFrame,
    target_column: Optional[str] = 'visitor_count',
    is_training: bool = True
) -> pd.DataFrame:
    """
    Processes raw data (historical visitor data or future weather forecasts)
    into a feature set ready for the ML model.

    Args:
        input_df: DataFrame containing raw data.
                  For training, expects historical data with 'date' and weather columns, plus target_column.
                  For prediction, expects future weather forecast data with 'date' and weather columns.
        target_column: Name of the target variable (e.g., 'visitor_count'). Only used if is_training=True.
        is_training: Boolean, True if preparing data for training, False for prediction.

    Returns:
        A DataFrame with features ready for the model, and optionally the target column.
    """
    processed_df = input_df.copy()

    # 1. Create date features
    if 'date' not in processed_df.columns:
        raise ValueError("Input DataFrame must contain a 'date' column.")
    processed_df = create_date_features(processed_df, 'date')

    # 2. Placeholder for holiday/event features (to be implemented later)
    #    These would typically be merged from another source or generated.
    # processed_df['is_holiday'] = 0
    # processed_df['is_school_break'] = 0
    # processed_df['special_event_type_encoded'] = 0

    # 3. Select and order features based on MODEL_FEATURES
    #    Also, handle missing columns by adding them with default values (e.g., 0 or NaN).

    current_features = []

    # Include target column if training
    if is_training and target_column:
        if target_column not in processed_df.columns:
            raise ValueError(f"Target column '{target_column}' not found in input_df for training.")
        current_features.append(target_column)

    # Add all features defined in MODEL_FEATURES
    for feature in MODEL_FEATURES:
        if feature not in processed_df.columns:
            # If a model feature is missing (e.g. 'pop' from historical data if not saved), add it with NaN.
            # The model training/prediction step should handle NaNs (e.g., imputation).
            processed_df[feature] = pd.NA
        current_features.append(feature)

    # Ensure only defined model features (and target if training) are in the final DF
    # and they are in the correct order.
    # We filter to 'current_features' which includes target + MODEL_FEATURES that exist or were added.
    # Then reindex to ensure order and presence of all MODEL_FEATURES (plus target if training).
    final_columns = [col for col in MODEL_FEATURES if col in processed_df.columns]
    if is_training and target_column:
        final_df = processed_df[[target_column] + final_columns]
    else:
        final_df = processed_df[final_columns]

    # Fill any NaNs that might have been introduced for missing features or were already present.
    # A simple strategy is to fill with 0. More complex imputation could be done in ml_trainer.
    final_df = final_df.fillna(0)

    return final_df


# Example usage:
if __name__ == '__main__':
    # Simulate historical data (as fetched from Supabase and potentially merged with observed weather)
    dummy_historical_data = pd.DataFrame({
        'date': pd.to_datetime(['2023-07-01', '2023-07-02', '2023-07-03']),
        'visitor_count': [100, 150, 90],
        'temp': [25.0, 26.5, 24.0],
        'feels_like': [25.0, 26.5, 23.0],
        'temp_min': [22.0, 23.0, 21.0],
        'temp_max': [28.0, 29.0, 27.0],
        'humidity': [60.0, 55.0, 65.0],
        'wind_speed': [5.0, 6.0, 4.5],
        'pop': [0.1, 0.0, 0.2] # Probability of precipitation might be available historically
    })
    print("Original Historical Data:\n", dummy_historical_data)

    training_features_df = prepare_features_for_model(dummy_historical_data.copy(),
                                                      target_column='visitor_count',
                                                      is_training=True)
    print("\nProcessed Training Data with Features:\n", training_features_df)
    print("\nTraining Data Columns:\n", training_features_df.columns.tolist())

    # Simulate future weather forecast data (as fetched from OpenWeather)
    # Note: 'date' here from weather forecast is already a string 'YYYY-MM-DD'
    dummy_weather_forecast_raw = [
        {"date": "2023-07-04", "temp": 28.0, "feels_like": 29.0, "temp_min": 24.0, "temp_max": 30.0,
         "humidity": 60.0, "wind_speed": 5.5, "pop": 0.1, "weather_description": "sunny"},
        {"date": "2023-07-05", "temp": 29.5, "feels_like": 30.0, "temp_min": 25.0, "temp_max": 31.0,
         "humidity": 55.0, "wind_speed": 6.2, "pop": 0.05, "weather_description": "cloudy"}
    ]
    future_weather_df = pd.DataFrame(dummy_weather_forecast_raw)
    print("\nOriginal Future Weather Data:\n", future_weather_df)

    prediction_features_df = prepare_features_for_model(future_weather_df.copy(), is_training=False)
    print("\nProcessed Prediction Input with Features:\n", prediction_features_df)
    print("\nPrediction Data Columns:\n", prediction_features_df.columns.tolist())

    # Test case: what if a column defined in MODEL_FEATURES is missing from input?
    missing_col_weather_df = future_weather_df.drop(columns=['pop'])
    print("\nOriginal Future Weather Data (missing 'pop'):\n", missing_col_weather_df)
    prediction_features_missing_col_df = prepare_features_for_model(missing_col_weather_df.copy(), is_training=False)
    print("\nProcessed Prediction Input (missing 'pop'):\n", prediction_features_missing_col_df)
    assert 'pop' in prediction_features_missing_col_df.columns
    assert prediction_features_missing_col_df['pop'].isna().sum() == 0 # Should be filled with 0
    print("\nAll checks passed for missing column handling.")
