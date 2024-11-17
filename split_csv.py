import csv
import os

def split_csv(file_path, output_dir, max_file_size=1 * 1024 * 1024 * 1024):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    with open(file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        headers = next(reader)  # Save headers

        file_count = 1
        current_file_size = 0
        output_file = None
        writer = None

        for row in reader:
            # Start a new file if there's no file open or the size limit is reached
            if output_file is None or current_file_size >= max_file_size:
                if output_file:
                    output_file.close()

                output_file_path = os.path.join(output_dir, f"authors_part{file_count}.csv")
                output_file = open(output_file_path, 'w', newline='', encoding='utf-8')
                writer = csv.writer(output_file)
                writer.writerow(headers)  # Write headers to the new file

                file_count += 1
                current_file_size = 0

            # Write the row to the current file and update the file size
            writer.writerow(row)
            current_file_size += sum(len(str(cell)) for cell in row) + len(row) + 1  # Estimate row size

        # Close the last file if open
        if output_file:
            output_file.close()

# Usage
split_csv("authors.csv", "split_files")
