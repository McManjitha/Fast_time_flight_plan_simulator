import pandas as pd
import re

# Read the input Excel file
input_file = "custom_100_24_latest.xlsx"
df = pd.read_excel(input_file)

# Convert "Departure_Time" column to datetime format
df["Departure_Time"] = pd.to_datetime(df["Departure_Time"], format="%H:%M:%S", errors="coerce")

# Define start and end time ranges
start = ["05:00:00", "06:00:00", "07:00:00", "08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00",
         "16:00:00", "17:00:00", "18:00:00", "19:00:00", "20:00:00", "21:00:00", "22:00:00", "23:00:00", "00:00:00"]

end = ["06:00:00", "07:00:00", "08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00",
       "16:00:00", "17:00:00", "18:00:00", "19:00:00", "20:00:00", "21:00:00", "22:00:00", "23:00:00", "00:00:00", "01:00:00"]

# Iterate through the time ranges
for i in range(len(start)):
    start_time = pd.to_datetime(start[i]).time()
    end_time = pd.to_datetime(end[i]).time()

    # Filter the records based on the "Departure_Time" column
    filtered_df = df[
        (df["Departure_Time"].dt.time >= start_time) &
        (df["Departure_Time"].dt.time <= end_time)
    ]

    # Replace colons with underscores in the file name
    start_time_str = re.sub(":", "_", start[i])
    end_time_str = re.sub(":", "_", end[i])

    # Save the filtered records to a new Excel file
    output_file = f"{start_time_str}_to_{end_time_str}.xlsx"
    filtered_df.to_excel(output_file, index=False, columns=df.columns)

    print(f"The filtered records have been saved to '{output_file}'.")
