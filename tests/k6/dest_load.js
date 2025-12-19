import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Πιο αργή άνοδος σε 15 χρήστες
    { duration: '3m', target: 10 }, // Παραμονή για 3 λεπτά για σταθερό δείγμα
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% των αιτημάτων κάτω από 500ms
    'http_req_failed': ['rate<0.01'],   // Σφάλματα λιγότερα από 1%
  },
};

export default function () {
  const res = http.get('http://localhost:3000/v1/destinations');
  check(res, { 'status is 200': (r) => r.status === 200 });
  
  // Τυχαία αναμονή μεταξύ 1-3 δευτερολέπτων για πιο φυσική κίνηση
  sleep(1 + Math.random() * 2);
}