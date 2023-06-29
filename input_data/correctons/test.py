import pandas as pd

# Read the Excel file
df = pd.read_excel('12_00_00_to_13_00_00.xlsx')

# Print the column names
print(df.columns)