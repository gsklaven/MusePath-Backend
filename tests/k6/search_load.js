import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 6 }, // Σταδιακή άνοδος στο όριο (6 VUs)
    { duration: '2m', target: 6 }, // Παραμονή στο όριο για έλεγχο σταθερότητας
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // NFR: 95% των αναζητήσεων < 500ms
    'http_req_failed': ['rate<0.01'],   // NFR: Λιγότερο από 1% σφάλματα
  },
};

export default function () {
  // Χρήση δυναμικών keywords για να στρεσάρουμε το φιλτράρισμα
  const keywords = ['starry', 'mona', 'ancient', 'art'];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  
  const res = http.get(`http://localhost:3000/v1/exhibits/search?keyword=${randomKeyword}`);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'has data': (r) => r.json().data.length >= 0,
  });
  
  sleep(1);
}