

declare var manoirDeviceApp: Manoir.IManoirDeviceApp;

declare namespace Manoir {
    interface IManoirDeviceApp {
        setApplication(url: string): void;
        saveDeviceId(deviceId: string): void;
        getDeviceId(): string;

    }
}

declare namespace Manoir.Common {
    

    export abstract class ManoirAppPage {
        checkLogin(autoRedirect: boolean): boolean;
    }
}
