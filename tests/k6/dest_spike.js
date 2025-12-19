import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 10 }, 
    { duration: '30s', target: 30 }, // Απότομη άνοδος (Spike)
    { duration: '1m', target: 30 },  // Διατήρηση του spike
    { duration: '20s', target: 10 }, 
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // Πιο χαλαρό όριο για το spike
    'http_req_failed': ['rate<0.05'],    // Ανοχή σφάλματος έως 5%
  },
};

export default function () {
  const res = http.get('http://localhost:3000/v1/destinations');
  check(res, { 'status is 200': (r) => r.status === 200 });
  
  sleep(1);
}