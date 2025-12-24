import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },  // Κανονική ροή
    { duration: '30s', target: 15 }, // Απότομο Spike (γνωστό όριο δυσκολίας του runner)
    { duration: '1m', target: 15 },  // Διατήρηση του Spike για έλεγχο αντοχής
    { duration: '20s', target: 5 },  // Αποκλιμάκωση
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% των αναζητήσεων κάτω από 1 δευτερόλεπτο
    'http_req_failed': ['rate<0.05'],    // Ανοχή σφάλματος έως 5% λόγω spike
  },
};

export default function () {
  const keywords = ['art', 'ancient', 'modern', 'history'];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  
  const res = http.get(`http://localhost:3000/v1/exhibits/search?keyword=${randomKeyword}`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has data': (r) => r.json().data.length >= 0,
  });
  
  sleep(1);
}