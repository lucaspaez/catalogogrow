import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock global objects si es necesario
global.window = window;
global.document = document;
