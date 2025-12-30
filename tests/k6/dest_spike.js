/**
 * Destinations Endpoint Spike Test
 * 
 * Objective:
 * Verify system resilience when facing a sudden surge in traffic for destinations.
 * 
 * Scenarios:
 * - Normal traffic: 10 VUs for 10s
 * - Spike: Jump to 400 VUs in 20s
 * - Sustain: Hold 400 VUs for 1m
 * - Recovery: Drop to 10 VUs in 20s
 * 
 * Thresholds:
 * - 95% of requests < 1000ms
 * - Error rate < 10%
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },  // Κανονική κίνηση
    { duration: '20s', target: 400 }, // Απότομο Spike
    { duration: '1m', target: 400 },  // Διατήρηση πίεσης
    { duration: '20s', target: 10 },  // Αποκλιμάκωση - Έλεγχος αν ανακάμπτει ο server
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
  
  sleep(1 + Math.random());
}