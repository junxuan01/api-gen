export interface ServiceConfig {
    name: string;
    baseURL: string;
    schemaPath: string;
}
export interface Config {
    outputDir: string;
    schemaDir: string;
    services: ServiceConfig[];
}
/**
 * 加载配置文件
 */
export declare function loadConfig(): Promise<Config>;
/**
 * 保存配置文件
 */
export declare function saveConfig(config: Config): Promise<void>;
//# sourceMappingURL=config.d.ts.map