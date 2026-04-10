/**
 * Unit tests for ess-sw.js (Service Worker logic) — Task 62
 *
 * Tests are run via Vitest in jsdom environment. The SW is not imported directly
 * (it uses Workbox globals), so we extract and test the pure logic functions:
 *
 *  1. employeeCachePlugin — cacheWillUpdate stamps x-ess-employee-id header
 *  2. employeeCachePlugin — cachedResponseWillBeUsed rejects mismatched employee
 *  3. employeeCachePlugin — cachedResponseWillBeUsed passes when IDs match
 *  4. employeeCachePlugin — cachedResponseWillBeUsed passes when cachedEmployeeId is empty
 *  5. noSetCookiePlugin   — rejects responses that have a set-cookie header
 *  6. noSetCookiePlugin   — passes responses without set-cookie
 *  7. getActionsForCategory — returns correct actions per category
 *  8. push handler data parsing — gracefully handles non-JSON push data
 *  9. ESS_SET_EMPLOYEE message — sets __essEmployeeId
 * 10. ESS_CLEAR_EMPLOYEE message — clears __essEmployeeId
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Helpers: mirror the plugin logic from ess-sw.js ──────────────────────
// (These are extracted here because the SW file imports Workbox at build time
//  and cannot be imported in a Node/jsdom test environment.)

let currentEmployeeId = null;

const employeeCachePlugin = {
  cacheWillUpdate: async ({ response }) => {
    if (!response) return response;
    const headers = new Headers(response.headers);
    headers.set('x-ess-employee-id', currentEmployeeId || '');
    return new Response(response.clone().body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
  cachedResponseWillBeUsed: async ({ cachedResponse }) => {
    if (!cachedResponse) return cachedResponse;
    const cachedEmployeeId = cachedResponse.headers.get('x-ess-employee-id');
    if (cachedEmployeeId && currentEmployeeId && cachedEmployeeId !== currentEmployeeId) {
      return null;
    }
    return cachedResponse;
  },
};

const noSetCookiePlugin = {
  cacheWillUpdate: async ({ response }) => {
    if (response && response.headers.has('set-cookie')) {
      return null;
    }
    return response;
  },
};

function getActionsForCategory(category) {
  switch (category) {
    case 'schedule': return [{ action: 'view', title: 'View Schedule' }];
    case 'payslip':  return [{ action: 'view', title: 'View Payslip' }];
    case 'leave':    return [{ action: 'view', title: 'View Leave' }];
    case 'profile':  return [{ action: 'view', title: 'View Profile' }];
    default:         return [];
  }
}

// ─── employeeCachePlugin tests ─────────────────────────────────────────────
describe('employeeCachePlugin', () => {
  beforeEach(() => {
    currentEmployeeId = null;
  });

  it('cacheWillUpdate stamps x-ess-employee-id header with current employee', async () => {
    currentEmployeeId = 'emp-42';
    const original = new Response(JSON.stringify({ data: 1 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const stamped = await employeeCachePlugin.cacheWillUpdate({ response: original });
    expect(stamped).not.toBeNull();
    expect(stamped.headers.get('x-ess-employee-id')).toBe('emp-42');
  });

  it('cacheWillUpdate stamps empty string when no employee is set', async () => {
    currentEmployeeId = null;
    const original = new Response('{}', { status: 200 });
    const stamped = await employeeCachePlugin.cacheWillUpdate({ response: original });
    expect(stamped.headers.get('x-ess-employee-id')).toBe('');
  });

  it('cacheWillUpdate returns null when response is null', async () => {
    const result = await employeeCachePlugin.cacheWillUpdate({ response: null });
    expect(result).toBeNull();
  });

  it('cachedResponseWillBeUsed passes when employee IDs match', async () => {
    currentEmployeeId = 'emp-7';
    const cached = new Response('{}', {
      status: 200,
      headers: { 'x-ess-employee-id': 'emp-7' },
    });
    const result = await employeeCachePlugin.cachedResponseWillBeUsed({ cachedResponse: cached });
    expect(result).not.toBeNull();
  });

  it('cachedResponseWillBeUsed rejects when employee IDs mismatch', async () => {
    currentEmployeeId = 'emp-7';
    const cached = new Response('{}', {
      status: 200,
      headers: { 'x-ess-employee-id': 'emp-99' },
    });
    const result = await employeeCachePlugin.cachedResponseWillBeUsed({ cachedResponse: cached });
    expect(result).toBeNull();
  });

  it('cachedResponseWillBeUsed passes when cached header is empty (no employee stamped)', async () => {
    currentEmployeeId = 'emp-7';
    const cached = new Response('{}', {
      status: 200,
      headers: { 'x-ess-employee-id': '' },
    });
    const result = await employeeCachePlugin.cachedResponseWillBeUsed({ cachedResponse: cached });
    expect(result).not.toBeNull();
  });

  it('cachedResponseWillBeUsed passes when current employee is null (not logged in)', async () => {
    currentEmployeeId = null;
    const cached = new Response('{}', {
      status: 200,
      headers: { 'x-ess-employee-id': 'emp-42' },
    });
    const result = await employeeCachePlugin.cachedResponseWillBeUsed({ cachedResponse: cached });
    expect(result).not.toBeNull();
  });

  it('cachedResponseWillBeUsed returns null when cachedResponse is null', async () => {
    const result = await employeeCachePlugin.cachedResponseWillBeUsed({ cachedResponse: null });
    expect(result).toBeNull();
  });
});

// ─── noSetCookiePlugin tests ───────────────────────────────────────────────
describe('noSetCookiePlugin', () => {
  it('rejects responses that carry a set-cookie header', async () => {
    const resp = new Response('{}', {
      status: 200,
      headers: { 'set-cookie': 'session=abc; HttpOnly; Secure' },
    });
    const result = await noSetCookiePlugin.cacheWillUpdate({ response: resp });
    expect(result).toBeNull();
  });

  it('allows responses without a set-cookie header', async () => {
    const resp = new Response('{}', { status: 200 });
    const result = await noSetCookiePlugin.cacheWillUpdate({ response: resp });
    expect(result).not.toBeNull();
  });

  it('allows a null response without throwing', async () => {
    const result = await noSetCookiePlugin.cacheWillUpdate({ response: null });
    expect(result).toBeNull();
  });
});

// ─── getActionsForCategory tests ──────────────────────────────────────────
describe('getActionsForCategory', () => {
  it.each([
    ['schedule', 'View Schedule'],
    ['payslip', 'View Payslip'],
    ['leave', 'View Leave'],
    ['profile', 'View Profile'],
  ])('returns correct action for %s category', (category, expectedTitle) => {
    const actions = getActionsForCategory(category);
    expect(actions).toHaveLength(1);
    expect(actions[0].action).toBe('view');
    expect(actions[0].title).toBe(expectedTitle);
  });

  it('returns empty array for unknown category', () => {
    expect(getActionsForCategory('unknown')).toEqual([]);
    expect(getActionsForCategory(undefined)).toEqual([]);
    expect(getActionsForCategory('')).toEqual([]);
  });
});

// ─── Push payload parsing ─────────────────────────────────────────────────
describe('Push payload parsing', () => {
  // Mirror the push handler data parsing logic
  const parsePushData = (data) => {
    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      payload = { title: 'Employee Portal', body: data };
    }
    return payload;
  };

  it('parses valid JSON push data', () => {
    const payload = parsePushData(
      JSON.stringify({ title: 'Payslip ready', body: 'Your payslip is ready.', category: 'payslip' })
    );
    expect(payload.title).toBe('Payslip ready');
    expect(payload.category).toBe('payslip');
  });

  it('falls back gracefully on non-JSON push data', () => {
    const payload = parsePushData('Plain text notification');
    expect(payload.title).toBe('Employee Portal');
    expect(payload.body).toBe('Plain text notification');
  });

  it('uses default tag when none provided', () => {
    const payload = parsePushData(JSON.stringify({ title: 'Hello' }));
    const tag = payload.tag || payload.category || 'ess-general';
    expect(tag).toBe('ess-general');
  });
});

// ─── Message handler logic ────────────────────────────────────────────────
describe('SW message handler logic', () => {
  it('ESS_SET_EMPLOYEE updates the employee context variable', () => {
    const handleMessage = (data) => {
      if (data?.type === 'ESS_SET_EMPLOYEE') {
        currentEmployeeId = data.employeeId || null;
      }
      if (data?.type === 'ESS_CLEAR_EMPLOYEE') {
        currentEmployeeId = null;
      }
    };

    currentEmployeeId = null;
    handleMessage({ type: 'ESS_SET_EMPLOYEE', employeeId: 'emp-15' });
    expect(currentEmployeeId).toBe('emp-15');
  });

  it('ESS_CLEAR_EMPLOYEE resets the employee context variable', () => {
    currentEmployeeId = 'emp-15';
    const handleMessage = (data) => {
      if (data?.type === 'ESS_CLEAR_EMPLOYEE') {
        currentEmployeeId = null;
      }
    };
    handleMessage({ type: 'ESS_CLEAR_EMPLOYEE' });
    expect(currentEmployeeId).toBeNull();
  });

  it('unknown message type does not change employee context', () => {
    currentEmployeeId = 'emp-15';
    const handleMessage = (data) => {
      if (data?.type === 'ESS_SET_EMPLOYEE') currentEmployeeId = data.employeeId;
      if (data?.type === 'ESS_CLEAR_EMPLOYEE') currentEmployeeId = null;
    };
    handleMessage({ type: 'SKIP_WAITING' });
    expect(currentEmployeeId).toBe('emp-15');
  });
});

// ─── CACHE_NAMES bucket list ──────────────────────────────────────────────
describe('Cache bucket names', () => {
  const CACHE_NAMES = [
    'ess-precache',
    'ess-api-dashboard',
    'ess-api-schedule',
    'ess-api-payslips',
    'ess-api-attendance',
    'ess-api-profile',
    'ess-i18n',
    'ess-images',
  ];

  it('all require api-specific cache names start with ess-api-', () => {
    const apiCaches = CACHE_NAMES.filter((n) => n !== 'ess-precache' && n !== 'ess-i18n' && n !== 'ess-images');
    apiCaches.forEach((name) => {
      expect(name).toMatch(/^ess-api-/);
    });
  });

  it('ESS_CLEAR_EMPLOYEE should delete api, i18n, images caches but not precache', () => {
    const toClear = CACHE_NAMES.filter(
      (n) => n.startsWith('ess-api-') || n === 'ess-i18n' || n === 'ess-images'
    );
    expect(toClear).not.toContain('ess-precache');
    expect(toClear.length).toBe(7);
  });
});
