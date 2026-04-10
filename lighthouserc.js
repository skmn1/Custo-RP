// @ts-check
'use strict';

/** @type {import('@lhci/cli').LHCIConfig} */
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173/app/ess/dashboard',
        'http://localhost:4173/app/ess/schedule',
        'http://localhost:4173/app/ess/payslips',
      ],
      numberOfRuns: 3,
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local',
      settings: {
        preset: 'desktop',
        onlyCategories: ['pwa', 'performance', 'accessibility', 'best-practices'],
        // Disable storage reset so the SW and caches persist between runs
        disableStorageReset: false,
      },
    },
    assert: {
      assertions: {
        'categories:pwa': ['error', { minScore: 0.9 }],
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        // PWA must-haves
        'installable-manifest': 'error',
        'service-worker': 'error',
        'maskable-icon': 'error',
        'themed-omnibox': 'warn',
        'splash-screen': 'warn',
        'viewport': 'error',
        // Performance budget
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 5000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
