import {writeFile} from "fs/promises";

export class FileSystemAdapter {
    async write(path: string, content: string) {
        await writeFile(path, content);
    };
}
