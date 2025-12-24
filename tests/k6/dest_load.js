import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 12 }, // Σταδιακή άνοδος σε 12 VUs
    { duration: '3m', target: 12 }, // Σταθερό φορτίο για 3 λεπτά (Endurance)
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<600'], // Αυστηρότερο όριο για κανονικό φορτίο
    'http_req_failed': ['rate<0.01'],   // Σφάλματα λιγότερα από 1%
  },
};

export default function () {
  const res = http.get('http://localhost:3000/v1/destinations');
  
  check(res, { 
    'status is 200': (r) => r.status === 200,
    'correct payload': (r) => r.json().success === true
  });
  
  // Τυχαίο sleep για να μην "χτυπάνε" όλοι οι χρήστες ταυτόχρονα στο millisecond
  sleep(1.5 + Math.random());
}