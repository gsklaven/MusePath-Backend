import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 }, // Απότομη άνοδος σε 50 χρήστες
    { duration: '20s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Πιο χαλαρό threshold για το spike
    http_req_failed: ['rate<0.05'],    
  },
};

export default function () {
  http.get('http://localhost:3000/v1/health');
  http.get('http://localhost:3000/v1/destinations');
  sleep(1);
}