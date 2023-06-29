import pandas as pd

# Read the Excel file
df = pd.read_excel('08_00_00_to_09_00_00.xlsx')

# Remove spaces from the strings in column 'P'
df['path'] = df['path'].str.replace(' ', '')

# Save the modified DataFrame back to the Excel file
df.to_excel('08_00_00_to_09_00_00.xlsx', index=False)
