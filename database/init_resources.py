import sqlite3
import json
from datetime import datetime

# Initialize resources database
def init_resources_db():
    db_path = '../mindmate.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Read and execute schema
        with open('resources_schema.sql', 'r') as f:
            schema_sql = f.read()
        
        cursor.executescript(schema_sql)
        
        # Sample resources data
        sample_resources = [
            {
                'id': 'res_study_techniques',
                'title': 'Effective Study Techniques',
                'type': 'pdf',
                'url': '/static/resources/effective-study-techniques.pdf',
                'thumbnail': '/static/thumbs/study.png',
                'description': 'Practical strategies for time-blocking, revision, and exam planning.',
                'tags': json.dumps(['exam', 'time_management', 'study']),
                'approved_by': 'University Counseling Cell',
                'popularity': 125,
                'is_hotline': False,
                'content_text': 'study techniques time management exam preparation revision planning'
            },
            {
                'id': 'res_sleep_hygiene',
                'title': 'Sleep Hygiene Guide',
                'type': 'pdf',
                'url': '/static/resources/sleep-hygiene-guide.pdf',
                'thumbnail': '/static/thumbs/sleep.png',
                'description': 'Evidence-based strategies for better sleep quality and managing insomnia.',
                'tags': json.dumps(['sleep', 'wellness', 'health']),
                'approved_by': 'University Health Services',
                'popularity': 98,
                'is_hotline': False,
                'content_text': 'sleep hygiene insomnia better sleep quality rest wellness'
            },
            {
                'id': 'res_stress_management',
                'title': 'Stress Management Workshop',
                'type': 'workshop',
                'url': 'https://university.edu/workshops/stress-management',
                'thumbnail': '/static/thumbs/stress.png',
                'description': 'Interactive workshop on mindfulness, breathing techniques, and stress reduction.',
                'tags': json.dumps(['stress', 'mindfulness', 'workshop']),
                'approved_by': 'Student Wellness Center',
                'popularity': 156,
                'is_hotline': False,
                'content_text': 'stress management mindfulness breathing techniques relaxation workshop'
            },
            {
                'id': 'res_crisis_helpline',
                'title': 'Campus Crisis Helpline',
                'type': 'hotline',
                'url': None,
                'thumbnail': '/static/thumbs/crisis.png',
                'description': '24/7 crisis support line staffed by trained counselors.',
                'tags': json.dumps(['crisis', 'counseling', 'emergency']),
                'approved_by': 'University Health Services',
                'popularity': 89,
                'is_hotline': True,
                'hotline_number': '+91-123-456-7890',
                'content_text': 'crisis helpline emergency counseling support 24/7'
            },
            {
                'id': 'res_focus_meditation',
                'title': 'Focus & Concentration Meditation',
                'type': 'video',
                'url': 'https://university.edu/videos/focus-meditation',
                'thumbnail': '/static/thumbs/meditation.png',
                'description': 'Guided meditation sessions to improve focus and concentration for studying.',
                'tags': json.dumps(['focus', 'meditation', 'mindfulness']),
                'approved_by': 'Student Wellness Center',
                'popularity': 203,
                'is_hotline': False,
                'content_text': 'focus concentration meditation mindfulness guided sessions studying'
            },
            {
                'id': 'res_anxiety_coping',
                'title': 'Anxiety Coping Strategies',
                'type': 'pdf',
                'url': '/static/resources/anxiety-coping-strategies.pdf',
                'thumbnail': '/static/thumbs/anxiety.png',
                'description': 'Research-backed techniques for managing anxiety and panic symptoms.',
                'tags': json.dumps(['anxiety', 'mental_health', 'coping']),
                'approved_by': 'University Counseling Cell',
                'popularity': 167,
                'is_hotline': False,
                'content_text': 'anxiety coping strategies panic symptoms mental health techniques'
            },
            {
                'id': 'res_time_management',
                'title': 'Time Management Masterclass',
                'type': 'video',
                'url': 'https://university.edu/videos/time-management',
                'thumbnail': '/static/thumbs/time.png',
                'description': 'Comprehensive guide to prioritization, scheduling, and productivity techniques.',
                'tags': json.dumps(['time_management', 'productivity', 'study']),
                'approved_by': 'Academic Success Center',
                'popularity': 134,
                'is_hotline': False,
                'content_text': 'time management productivity prioritization scheduling study skills'
            },
            {
                'id': 'res_counseling_services',
                'title': 'Counseling Services Info',
                'type': 'pdf',
                'url': '/static/resources/counseling-services.pdf',
                'thumbnail': '/static/thumbs/counseling.png',
                'description': 'Complete guide to campus counseling services, appointments, and support groups.',
                'tags': json.dumps(['counseling', 'mental_health', 'support']),
                'approved_by': 'University Counseling Cell',
                'popularity': 78,
                'is_hotline': False,
                'content_text': 'counseling services mental health support groups appointments therapy'
            }
        ]
        
        # Insert sample resources
        for resource in sample_resources:
            cursor.execute('''
                INSERT OR REPLACE INTO resources 
                (id, title, type, url, thumbnail, description, tags, approved_by, popularity, is_hotline, hotline_number, content_text)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                resource['id'], resource['title'], resource['type'], resource['url'],
                resource['thumbnail'], resource['description'], resource['tags'],
                resource['approved_by'], resource['popularity'], resource['is_hotline'],
                resource.get('hotline_number'), resource['content_text']
            ))
        
        conn.commit()
        print(f"Resources database initialized successfully!")
        print(f"Seeded {len(sample_resources)} sample resources")
        
        # Verify the data
        cursor.execute("SELECT COUNT(*) FROM resources")
        count = cursor.fetchone()[0]
        print(f"Total resources in database: {count}")
        
    except Exception as e:
        print(f"Error initializing resources database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_resources_db()