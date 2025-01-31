export class ArtifactRequest {
    hash: string;
    filePath: string;

    constructor(hash: string, filePath: string) {
        this.hash = hash;
        this.filePath = filePath;
    }
}