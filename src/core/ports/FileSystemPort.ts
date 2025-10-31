export interface FileSystemPort {
    write(path: string, content: string): Promise<void>;
    read(path: string): Promise<string>;
    exists(path: string): Promise<boolean>;
    rename(oldPath: string, newPath: string): Promise<void>;
    delete(path: string): Promise<void>;
    copy(source: string, destination: string): Promise<void>;
}