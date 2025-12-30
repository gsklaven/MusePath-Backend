/**
 * Destinations Endpoint Load Test
 * 
 * Objective:
 * Verify system performance under sustained normal load for the destinations endpoint.
 * 
 * Scenarios:
 * - Ramp up: To 100 VUs in 1m
 * - Steady State: 100 VUs for 3m
 * - Ramp down: To 0 VUs in 30s
 * 
 * Thresholds:
 * - 95% of requests < 600ms
 * - Error rate < 1%
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up to 100 VUs
    { duration: '3m', target: 100 }, // Steady load for 3 minutes (Endurance)
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<600'], // Stricter limit for normal load
    'http_req_failed': ['rate<0.01'],   // Errors less than 1%
  },
};

export default function () {
  const res = http.get('http://localhost:3000/v1/destinations');
  
  check(res, { 
    'status is 200': (r) => r.status === 200,
    'correct payload': (r) => r.json().success === true
  });
  
  // Random sleep to avoid thundering herd
  sleep(1 + Math.random());
}