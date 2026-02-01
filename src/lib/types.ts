export interface ToolSettings {
    refreshInterval?: number;
    [key: string]: any;
}

export interface ToolProps {
    id: string;
    settings?: ToolSettings;
    isDetached: boolean;
}

export interface ToolEmits {
    (e: 'close', id: string): void;
    (e: 'minimize', id: string): void;
    (e: 'update-settings', id: string, settings: ToolSettings): void;
    (e: 'toggle-detach', id: string): void;
}
