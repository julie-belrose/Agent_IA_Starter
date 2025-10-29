import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { FileSystemAdapter } from '#adapters/FileSystemAdapter.js';
import { writeFile } from 'fs/promises';
import { FileSystemPort } from '#ports/FileSystemPort.js';

vi.mock('fs/promises', () => ({
    // vi.fn() remplace jest.fn()
    writeFile: vi.fn().mockResolvedValue(undefined),
}));

const mockWriteFile = writeFile as Mock;

describe('FileSystemAdapter (write)', () => {

    // --- Shared Test Data ---
    const TEST_PATH = 'path/test.txt';
    const TEST_CONTENT = 'Hello TDD';

    let adapter: FileSystemPort;

    // --- Setup: Runs before each test ---
    // 'beforeEach' now comes from Vitest
    beforeEach(() => {
        adapter = new FileSystemAdapter();
    });

    it('should call fs.promises.writeFile with the correct arguments', async () => {
        // 1. Arrange
        // 2. Act
        await adapter.write(TEST_PATH, TEST_CONTENT);
        // 3. Assert
        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile).toHaveBeenCalledWith(TEST_PATH, TEST_CONTENT);
    });
});


