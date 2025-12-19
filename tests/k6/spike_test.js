import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 }, // Απότομη άνοδος σε 50 χρήστες
    { duration: '20s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // Πιο χαλαρό όριο για το spike
    'http_req_failed': ['rate<0.05'],    // Ανοχή σφάλματος έως 5%
  },
};

export default function () {
  // Χτυπάμε το κεντρικό health endpoint
  let res = http.get('http://localhost:3000/v1/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  
  sleep(1);
}