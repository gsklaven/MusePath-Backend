/**
 * Search Endpoint Spike Test
 * 
 * Objective:
 * Verify system stability and recovery under sudden traffic spikes for the search endpoint.
 * 
 * Scenarios:
 * - Warmup: 10 VUs for 10s
 * - Spike: Jump to 500 VUs in 30s
 * - Sustain: Hold 500 VUs for 1m
 * - Cooldown: Drop to 10 VUs in 20s
 * 
 * Thresholds:
 * - 95% of requests < 1000ms
 * - Error rate < 5%
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },  // Προθέρμανση
    { duration: '30s', target: 500 }, // Spike στους 500 χρήστες
    { duration: '1m', target: 500 },  // Διατήρηση πίεσης
    { duration: '20s', target: 10 },  // Αποκλιμάκωση
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% των αναζητήσεων κάτω από 1 δευτερόλεπτο
    'http_req_failed': ['rate<0.05'],    // Ανοχή σφάλματος έως 5% λόγω spike
  },
};

export default function () {
  const keywords = ['ancient', 'art', 'greece', 'roman'];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  
  const res = http.get(`http://localhost:3000/v1/exhibits/search?keyword=${randomKeyword}`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has data': (r) => r.json().data && r.json().data.length >= 0,
  });
  
  sleep(1 + Math.random());
}