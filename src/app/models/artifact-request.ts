export class ArtifactRequest {
    name: string;
    filePath: string;

    constructor(name: string, filePath: string) {
        this.name = name;
        this.filePath = filePath;
    }
}