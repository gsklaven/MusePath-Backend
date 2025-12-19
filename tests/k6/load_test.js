import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ανέβασμα σε 20 χρήστες
    { duration: '1m', target: 20 },  // Σταθερά 20 χρήστες
    { duration: '30s', target: 0 },  // Κατέβασμα
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% των requests κάτω από 500ms
    http_req_failed: ['rate<0.01'],   // Σφάλματα κάτω από 1%
  },
};

export default function () {
  // Test Route A
  let res1 = http.get('http://localhost:3000/api');
  check(res1, { 'status is 200': (r) => r.status === 200 });

  // Test Route B
  let res2 = http.get('http://localhost:3000/api/data');
  check(res2, { 'status is 200': (r) => r.status === 200 });

  sleep(1);
}