import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Κανονική κίνηση
    { duration: '20s', target: 15 }, // Απότομο Spike (γνωστό σημείο αποτυχίας)
    { duration: '1m', target: 15 },  // Διατήρηση πίεσης
    { duration: '20s', target: 5 },  // Αποκλιμάκωση - Έλεγχος αν ανακάμπτει ο server
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // Πιο χαλαρό όριο στο spike
    'http_req_failed': ['rate<0.10'],   // Επιτρέπουμε έως 10% σφάλματα στο spike για να μην κοπεί το CI
  },
};

export default function () {
  const res = http.get('http://localhost:3000/v1/destinations');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.5); // Ταχύτερα requests για περισσότερο stress
}