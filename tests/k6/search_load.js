import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 300 }, // Σταδιακή άνοδος στο όριο (300 VUs)
    { duration: '3m', target: 300 }, // Παραμονή στο όριο για έλεγχο σταθερότητας
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // NFR: 95% των αναζητήσεων < 500ms
    'http_req_failed': ['rate<0.01'],   // NFR: Λιγότερο από 1% σφάλματα
  },
};

export default function () {
  const keywords = ['ancient', 'art', 'greece', 'roman'];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  
  const res = http.get(`http://localhost:3000/v1/exhibits/search?keyword=${randomKeyword}`);
  
  if (res.status !== 200) {
      console.log(`❌ Failed request! Status: ${res.status}, Body: ${res.body}, Keyword: ${randomKeyword}`);
  }

  check(res, {
    'is status 200': (r) => r.status === 200,
    'has data': (r) => {
        try {
            const json = r.json();
            return json.data && json.data.length >= 0;
        } catch (e) {
            return false;
        }
    },
  });
  
  sleep(1);
}