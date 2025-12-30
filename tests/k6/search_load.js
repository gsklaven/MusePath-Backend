/**
 * Search Endpoint Load Test
 * 
 * Objective:
 * Verify search functionality performance under sustained load.
 * 
 * Scenarios:
 * - Ramp up: To 100 VUs in 1m
 * - Steady State: 100 VUs for 3m
 * - Ramp down: To 0 VUs in 30s
 * 
 * Thresholds:
 * - 95% of requests < 500ms
 * - Error rate < 1%
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up to target (100 VUs)
    { duration: '3m', target: 100 }, // Stay at target to check stability
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // NFR: 95% of searches < 500ms
    'http_req_failed': ['rate<0.01'],   // NFR: Less than 1% errors
  },
};

export default function () {
  const keywords = ['ancient', 'art', 'greece', 'roman'];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  
  const res = http.get(`http://localhost:3000/v1/exhibits/search?keyword=${randomKeyword}`);
  
  if (res.status !== 200) {
      console.log(`❌ Failed request! Status: ${res.status}, Body: ${res.body}, Keyword: ${randomKeyword}`);
  }

  check(res, {
    'is status 200': (r) => r.status === 200,
    'has data': (r) => {
        try {
            const json = r.json();
            return json.data && json.data.length >= 0;
        } catch (e) {
            return false;
        }
    },
  });
  
  sleep(1 + Math.random());
}