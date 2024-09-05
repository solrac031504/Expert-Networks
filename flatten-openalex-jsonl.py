<<<<<<< HEAD
import csv
import glob
import gzip
import json
import os

SNAPSHOT_DIR = 'openalex-snapshot'
CSV_DIR = 'csv-files'

if not os.path.exists(CSV_DIR):
    os.mkdir(CSV_DIR)

FILES_PER_ENTITY = int(os.environ.get('OPENALEX_DEMO_FILES_PER_ENTITY', '0'))

csv_files = {
    'authors': {
        'authors': {
            'name': os.path.join(CSV_DIR, 'authors.csv.gz'),
            'columns': [
            'id', 
            'orcid', 
            'display_name', 
            'display_name_alternatives',
            'works_count', 
            'cited_by_count',
            'last_known_institution',  
            'works_api_url', 'updated_date',
            '2yr_mean_citedness',  
            'h_index',  
            'i10_index',  
            '2yr_works_count',  
            '2yr_cited_by_count',  
            '2yr_i10_index',  
            '2yr_h_index'
            ]
        },
        'ids': {
            'name': os.path.join(CSV_DIR, 'authors_ids.csv.gz'),
            'columns': [
                'author_id', 
                'openalex', 
                'orcid', 
                'scopus', 
                'twitter',
                'wikipedia', 
                'mag'
            ]
        },
        'counts_by_year': {
            'name': os.path.join(CSV_DIR, 'authors_counts_by_year.csv.gz'),
            'columns': [
                'author_id', 
                'year', 
                'works_count', 
                'cited_by_count',
                'oa_works_count'
            ]
        },
        'author_topics': {
            'name': os.path.join(CSV_DIR, 'author_topics.csv.gz'),
            'columns': [
                'author_id', 
                'topic_id'
            ]
        }
    },
    'topics': {
        'topics': { 
            'name': os.path.join(CSV_DIR, 'topics.csv.gz'),
            'columns': ['id', 'display_name', 'subfield_id',
                        'subfield_display_name', 'field_id',
                        'field_display_name',
                        'domain_id', 'domain_display_name', 'description',
                        'keywords', 'works_api_url', 'wikipedia_id',
                        'works_count', 'cited_by_count', 'updated_date', 'siblings']
        }
    }
}


def flatten_authors():
    file_spec = csv_files['authors']

    with gzip.open(file_spec['authors']['name'], 'wt',
                   encoding='utf-8') as authors_csv, \
            gzip.open(file_spec['ids']['name'], 'wt',
                      encoding='utf-8') as ids_csv, \
            gzip.open(file_spec['counts_by_year']['name'], 'wt',
                      encoding='utf-8') as counts_by_year_csv, \
            gzip.open(file_spec['author_topics']['name'], 'wt',
                      encoding='utf-8') as topics_csv:

        # Writers for the CSV files
        authors_writer = csv.DictWriter(
            authors_csv, fieldnames=file_spec['authors']['columns'],
            extrasaction='ignore'
        )
        authors_writer.writeheader()

        ids_writer = csv.DictWriter(ids_csv,
                                    fieldnames=file_spec['ids']['columns'])
        ids_writer.writeheader()

        counts_by_year_writer = csv.DictWriter(counts_by_year_csv, fieldnames=
        file_spec['counts_by_year']['columns'])
        counts_by_year_writer.writeheader()

        topics_writer = csv.DictWriter(
            topics_csv, fieldnames=file_spec['author_topics']['columns']
        )
        topics_writer.writeheader()

        files_done = 0
        for jsonl_file_name in glob.glob(
                os.path.join(SNAPSHOT_DIR, 'data', 'authors', '*', '*.gz')):
            print(jsonl_file_name)
            with gzip.open(jsonl_file_name, 'r') as authors_jsonl:
                for author_json in authors_jsonl:
                    if not author_json.strip():
                        continue

                    author = json.loads(author_json)

                    if not (author_id := author.get('id')):
                        continue

                    # authors
                    # flatten display_name_alternatives
                    author['display_name_alternatives'] = json.dumps(
                        author.get('display_name_alternatives'),
                        ensure_ascii=False)
                    # Using 'ror' instead of 'id'
                    author['last_known_institution'] = (
                                author.get('last_known_institution') or {}).get(
                        'ror')

                    # Flatten summary_stats into individual fields
                    summary_stats = author.get('summary_stats', {})
                    author['2yr_mean_citedness'] = summary_stats.get('2yr_mean_citedness')
                    author['h_index'] = summary_stats.get('h_index')
                    author['i10_index'] = summary_stats.get('i10_index')
                    author['2yr_works_count'] = summary_stats.get('2yr_works_count')
                    author['2yr_cited_by_count'] = summary_stats.get('2yr_cited_by_count')
                    author['2yr_i10_index'] = summary_stats.get('2yr_i10_index')
                    author['2yr_h_index'] = summary_stats.get('2yr_h_index')

                    # Write to authors.csv.gz
                    authors_writer.writerow(author)

                    # ids
                    # Write to ids.csv.gz
                    if author_ids := author.get('ids'):
                        author_ids['author_id'] = author_id
                        ids_writer.writerow(author_ids)

                    # counts_by_year
                    # Write counts_by_year to counts_by_year.csv.gz
                    if counts_by_year := author.get('counts_by_year'):
                        for count_by_year in counts_by_year:
                            count_by_year['author_id'] = author_id
                            counts_by_year_writer.writerow(count_by_year)

                    # Write topic associations to author_topics.csv.gz
                    if topics := author.get('topics'):
                        for topic in topics:
                            topics_writer.writerow({
                                'author_id': author_id,
                                'topic_id': topic['id']
                            })

            files_done += 1
            if FILES_PER_ENTITY and files_done >= FILES_PER_ENTITY:
                break


def flatten_topics():
    with gzip.open(csv_files['topics']['topics']['name'], 'wt',
                   encoding='utf-8') as topics_csv:
        topics_writer = csv.DictWriter(topics_csv,
                                       fieldnames=csv_files['topics']['topics'][
                                           'columns'])
        topics_writer.writeheader()

        seen_topic_ids = set()
        files_done = 0
        for jsonl_file_name in glob.glob(
                os.path.join(SNAPSHOT_DIR, 'data', 'topics', '*', '*.gz')):
            print(jsonl_file_name)
            with gzip.open(jsonl_file_name, 'r') as topics_jsonl:
                for line in topics_jsonl:
                    if not line.strip():
                        continue
                    topic = json.loads(line)
                    topic['keywords'] = '; '.join(topic.get('keywords', ''))
                    if not (
                    topic_id := topic.get('id')) or topic_id in seen_topic_ids:
                        continue
                    seen_topic_ids.add(topic_id)
                    for key in ('subfield', 'field', 'domain'):
                        topic[f'{key}_id'] = topic[key]['id']
                        topic[f'{key}_display_name'] = topic[key]['display_name']
                        del topic[key]
                    topic['updated_date'] = topic['updated']
                    del topic['updated']
                    topic['wikipedia_id'] = topic['ids'].get('wikipedia')
                    del topic['ids']
                    del topic['created_date']
                    topics_writer.writerow(topic)
            files_done += 1
            if FILES_PER_ENTITY and files_done >= FILES_PER_ENTITY:
                break


def init_dict_writer(csv_file, file_spec, **kwargs):
    writer = csv.DictWriter(
        csv_file, fieldnames=file_spec['columns'], **kwargs
    )
    writer.writeheader()
    return writer


if __name__ == '__main__':
    flatten_topics()
    flatten_authors()
=======
# This script converts the data from the author and topics folder that are downloaded from the OpenAlex AWS bucket
# Put this in the directory above where the data gets downloaded
# run this using
# python3 flatten-openalex-jsonl.py
# results in CSV files for authors, author_ids, author_counts_by_year, author_topics, topics
# Source: https://github.com/ourresearch/openalex-documentation-scripts/blob/main/flatten-openalex-jsonl.py#L252

import csv
import glob
import gzip
import json
import os

SNAPSHOT_DIR = 'openalex-snapshot'
CSV_DIR = 'csv-files'

if not os.path.exists(CSV_DIR):
    os.mkdir(CSV_DIR)

FILES_PER_ENTITY = int(os.environ.get('OPENALEX_DEMO_FILES_PER_ENTITY', '0'))

csv_files = {
    'authors': {
        'authors': {
            'name': os.path.join(CSV_DIR, 'authors.csv.gz'),
            'columns': [
            'id', 
            'orcid', 
            'display_name', 
            'display_name_alternatives',
            'works_count', 
            'cited_by_count',
            'last_known_institution',  
            'works_api_url', 'updated_date',
            '2yr_mean_citedness',  
            'h_index',  
            'i10_index',  
            '2yr_works_count',  
            '2yr_cited_by_count',  
            '2yr_i10_index',  
            '2yr_h_index'
            ]
        },
        'ids': {
            'name': os.path.join(CSV_DIR, 'authors_ids.csv.gz'),
            'columns': [
                'author_id', 
                'openalex', 
                'orcid', 
                'scopus', 
                'twitter',
                'wikipedia', 
                'mag'
            ]
        },
        'counts_by_year': {
            'name': os.path.join(CSV_DIR, 'authors_counts_by_year.csv.gz'),
            'columns': [
                'author_id', 
                'year', 
                'works_count', 
                'cited_by_count',
                'oa_works_count'
            ]
        },
        'author_topics': {
            'name': os.path.join(CSV_DIR, 'author_topics.csv.gz'),
            'columns': [
                'author_id', 
                'topic_id'
            ]
        }
    },
    'topics': {
        'topics': { 
            'name': os.path.join(CSV_DIR, 'topics.csv.gz'),
            'columns': ['id', 'display_name', 'subfield_id',
                        'subfield_display_name', 'field_id',
                        'field_display_name',
                        'domain_id', 'domain_display_name', 'description',
                        'keywords', 'works_api_url', 'wikipedia_id',
                        'works_count', 'cited_by_count', 'updated_date', 'siblings']
        }
    }
}


def flatten_authors():
    file_spec = csv_files['authors']

    with gzip.open(file_spec['authors']['name'], 'wt',
                   encoding='utf-8') as authors_csv, \
            gzip.open(file_spec['ids']['name'], 'wt',
                      encoding='utf-8') as ids_csv, \
            gzip.open(file_spec['counts_by_year']['name'], 'wt',
                      encoding='utf-8') as counts_by_year_csv, \
            gzip.open(file_spec['author_topics']['name'], 'wt',
                      encoding='utf-8') as topics_csv:

        # Writers for the CSV files
        authors_writer = csv.DictWriter(
            authors_csv, fieldnames=file_spec['authors']['columns'],
            extrasaction='ignore'
        )
        authors_writer.writeheader()

        ids_writer = csv.DictWriter(ids_csv,
                                    fieldnames=file_spec['ids']['columns'])
        ids_writer.writeheader()

        counts_by_year_writer = csv.DictWriter(counts_by_year_csv, fieldnames=
        file_spec['counts_by_year']['columns'])
        counts_by_year_writer.writeheader()

        topics_writer = csv.DictWriter(
            topics_csv, fieldnames=file_spec['author_topics']['columns']
        )
        topics_writer.writeheader()

        files_done = 0
        for jsonl_file_name in glob.glob(
                os.path.join(SNAPSHOT_DIR, 'data', 'authors', '*', '*.gz')):
            print(jsonl_file_name)
            with gzip.open(jsonl_file_name, 'r') as authors_jsonl:
                for author_json in authors_jsonl:
                    if not author_json.strip():
                        continue

                    author = json.loads(author_json)

                    if not (author_id := author.get('id')):
                        continue

                    # authors
                    # flatten display_name_alternatives
                    author['display_name_alternatives'] = json.dumps(
                        author.get('display_name_alternatives'),
                        ensure_ascii=False)
                    # Using 'ror' instead of 'id'
                    author['last_known_institution'] = (
                                author.get('last_known_institution') or {}).get(
                        'ror')

                    # Flatten summary_stats into individual fields
                    summary_stats = author.get('summary_stats', {})
                    author['2yr_mean_citedness'] = summary_stats.get('2yr_mean_citedness')
                    author['h_index'] = summary_stats.get('h_index')
                    author['i10_index'] = summary_stats.get('i10_index')
                    author['2yr_works_count'] = summary_stats.get('2yr_works_count')
                    author['2yr_cited_by_count'] = summary_stats.get('2yr_cited_by_count')
                    author['2yr_i10_index'] = summary_stats.get('2yr_i10_index')
                    author['2yr_h_index'] = summary_stats.get('2yr_h_index')

                    # Write to authors.csv.gz
                    authors_writer.writerow(author)

                    # ids
                    # Write to ids.csv.gz
                    if author_ids := author.get('ids'):
                        author_ids['author_id'] = author_id
                        ids_writer.writerow(author_ids)

                    # counts_by_year
                    # Write counts_by_year to counts_by_year.csv.gz
                    if counts_by_year := author.get('counts_by_year'):
                        for count_by_year in counts_by_year:
                            count_by_year['author_id'] = author_id
                            counts_by_year_writer.writerow(count_by_year)

                    # Write topic associations to author_topics.csv.gz
                    if topics := author.get('topics'):
                        for topic in topics:
                            topics_writer.writerow({
                                'author_id': author_id,
                                'topic_id': topic['id']
                            })

            files_done += 1
            if FILES_PER_ENTITY and files_done >= FILES_PER_ENTITY:
                break


def flatten_topics():
    with gzip.open(csv_files['topics']['topics']['name'], 'wt',
                   encoding='utf-8') as topics_csv:
        topics_writer = csv.DictWriter(topics_csv,
                                       fieldnames=csv_files['topics']['topics'][
                                           'columns'])
        topics_writer.writeheader()

        seen_topic_ids = set()
        files_done = 0
        for jsonl_file_name in glob.glob(
                os.path.join(SNAPSHOT_DIR, 'data', 'topics', '*', '*.gz')):
            print(jsonl_file_name)
            with gzip.open(jsonl_file_name, 'r') as topics_jsonl:
                for line in topics_jsonl:
                    if not line.strip():
                        continue
                    topic = json.loads(line)
                    topic['keywords'] = '; '.join(topic.get('keywords', ''))
                    if not (
                    topic_id := topic.get('id')) or topic_id in seen_topic_ids:
                        continue
                    seen_topic_ids.add(topic_id)
                    for key in ('subfield', 'field', 'domain'):
                        topic[f'{key}_id'] = topic[key]['id']
                        topic[f'{key}_display_name'] = topic[key]['display_name']
                        del topic[key]
                    topic['updated_date'] = topic['updated']
                    del topic['updated']
                    topic['wikipedia_id'] = topic['ids'].get('wikipedia')
                    del topic['ids']
                    del topic['created_date']
                    topics_writer.writerow(topic)
            files_done += 1
            if FILES_PER_ENTITY and files_done >= FILES_PER_ENTITY:
                break


def init_dict_writer(csv_file, file_spec, **kwargs):
    writer = csv.DictWriter(
        csv_file, fieldnames=file_spec['columns'], **kwargs
    )
    writer.writeheader()
    return writer


if __name__ == '__main__':
    flatten_topics()
    flatten_authors()
>>>>>>> 2e31c95efc0568fd8706e2d328185b05979afca3
