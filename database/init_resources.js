const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Initialize resources database schema
function initializeResourcesDB() {
  const dbPath = path.join(__dirname, '../mindmate.db');
  const db = new sqlite3.Database(dbPath);
  
  const schemaSQL = fs.readFileSync(path.join(__dirname, 'resources_schema.sql'), 'utf8');
  
  return new Promise((resolve, reject) => {
    db.exec(schemaSQL, (err) => {
      if (err) {
        console.error('Error initializing resources schema:', err);
        reject(err);
      } else {
        console.log('Resources database schema initialized successfully');
        resolve();
      }
      db.close();
    });
  });
}

// Seed sample resources data
function seedResourcesData() {
  const dbPath = path.join(__dirname, '../mindmate.db');
  const db = new sqlite3.Database(dbPath);
  
  const sampleResources = [
    {
      id: 'res_study_techniques',
      title: 'Effective Study Techniques',
      type: 'pdf',
      url: '/static/resources/effective-study-techniques.pdf',
      thumbnail: '/static/thumbs/study.png',
      description: 'Practical strategies for time-blocking, revision, and exam planning.',
      tags: JSON.stringify(['exam', 'time_management', 'study']),
      approved_by: 'University Counseling Cell',
      popularity: 125,
      is_hotline: false,
      content_text: 'study techniques time management exam preparation revision planning'
    },
    {
      id: 'res_sleep_hygiene',
      title: 'Sleep Hygiene Guide',
      type: 'pdf',
      url: '/static/resources/sleep-hygiene-guide.pdf',
      thumbnail: '/static/thumbs/sleep.png',
      description: 'Evidence-based strategies for better sleep quality and managing insomnia.',
      tags: JSON.stringify(['sleep', 'wellness', 'health']),
      approved_by: 'University Health Services',
      popularity: 98,
      is_hotline: false,
      content_text: 'sleep hygiene insomnia better sleep quality rest wellness'
    },
    {
      id: 'res_stress_management',
      title: 'Stress Management Workshop',
      type: 'workshop',
      url: 'https://university.edu/workshops/stress-management',
      thumbnail: '/static/thumbs/stress.png',
      description: 'Interactive workshop on mindfulness, breathing techniques, and stress reduction.',
      tags: JSON.stringify(['stress', 'mindfulness', 'workshop']),
      approved_by: 'Student Wellness Center',
      popularity: 156,
      is_hotline: false,
      content_text: 'stress management mindfulness breathing techniques relaxation workshop'
    },
    {
      id: 'res_crisis_helpline',
      title: 'Campus Crisis Helpline',
      type: 'hotline',
      url: null,
      thumbnail: '/static/thumbs/crisis.png',
      description: '24/7 crisis support line staffed by trained counselors.',
      tags: JSON.stringify(['crisis', 'counseling', 'emergency']),
      approved_by: 'University Health Services',
      popularity: 89,
      is_hotline: true,
      hotline_number: '+91-123-456-7890',
      content_text: 'crisis helpline emergency counseling support 24/7'
    },
    {
      id: 'res_focus_meditation',
      title: 'Focus & Concentration Meditation',
      type: 'video',
      url: 'https://university.edu/videos/focus-meditation',
      thumbnail: '/static/thumbs/meditation.png',
      description: 'Guided meditation sessions to improve focus and concentration for studying.',
      tags: JSON.stringify(['focus', 'meditation', 'mindfulness']),
      approved_by: 'Student Wellness Center',
      popularity: 203,
      is_hotline: false,
      content_text: 'focus concentration meditation mindfulness guided sessions studying'
    },
    {
      id: 'res_anxiety_coping',
      title: 'Anxiety Coping Strategies',
      type: 'pdf',
      url: '/static/resources/anxiety-coping-strategies.pdf',
      thumbnail: '/static/thumbs/anxiety.png',
      description: 'Research-backed techniques for managing anxiety and panic symptoms.',
      tags: JSON.stringify(['anxiety', 'mental_health', 'coping']),
      approved_by: 'University Counseling Cell',
      popularity: 167,
      is_hotline: false,
      content_text: 'anxiety coping strategies panic symptoms mental health techniques'
    },
    {
      id: 'res_time_management',
      title: 'Time Management Masterclass',
      type: 'video',
      url: 'https://university.edu/videos/time-management',
      thumbnail: '/static/thumbs/time.png',
      description: 'Comprehensive guide to prioritization, scheduling, and productivity techniques.',
      tags: JSON.stringify(['time_management', 'productivity', 'study']),
      approved_by: 'Academic Success Center',
      popularity: 134,
      is_hotline: false,
      content_text: 'time management productivity prioritization scheduling study skills'
    },
    {
      id: 'res_counseling_services',
      title: 'Counseling Services Info',
      type: 'pdf',
      url: '/static/resources/counseling-services.pdf',
      thumbnail: '/static/thumbs/counseling.png',
      description: 'Complete guide to campus counseling services, appointments, and support groups.',
      tags: JSON.stringify(['counseling', 'mental_health', 'support']),
      approved_by: 'University Counseling Cell',
      popularity: 78,
      is_hotline: false,
      content_text: 'counseling services mental health support groups appointments therapy'
    }
  ];
  
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO resources 
      (id, title, type, url, thumbnail, description, tags, approved_by, popularity, is_hotline, hotline_number, content_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let completed = 0;
    sampleResources.forEach((resource) => {
      stmt.run([
        resource.id, resource.title, resource.type, resource.url, resource.thumbnail,
        resource.description, resource.tags, resource.approved_by, resource.popularity,
        resource.is_hotline ? 1 : 0, resource.hotline_number, resource.content_text
      ], (err) => {
        if (err) {
          console.error('Error inserting resource:', err);
          reject(err);
          return;
        }
        completed++;
        if (completed === sampleResources.length) {
          stmt.finalize();
          console.log(`Seeded ${sampleResources.length} sample resources`);
          resolve();
        }
      });
    });
    
    db.close();
  });
}

module.exports = { initializeResourcesDB, seedResourcesData };