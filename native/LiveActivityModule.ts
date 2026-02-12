import { NativeModules } from 'react-native';

const { LiveActivityModule } = NativeModules;

interface LiveActivityInterface {
  startLiveActivity(timestamp: number): Promise<string>;
  stopLiveActivity(): Promise<void>;
  enableProximitySensor(): Promise<void>;
  disableProximitySensor(): Promise<void>;
}

// Fallback prevent crash before native build
const FallbackModule: LiveActivityInterface = {
  startLiveActivity: async () => {
    console.warn('LiveActivityModule is not linked. Run native build.');
    return '';
  },
  stopLiveActivity: async () => {
     console.warn('LiveActivityModule is not linked.');
  },
  enableProximitySensor: async () => {
    console.warn('LiveActivityModule is not linked.');
  },
  disableProximitySensor: async () => {
    console.warn('LiveActivityModule is not linked.');
  },
};

export default (LiveActivityModule || FallbackModule) as LiveActivityInterface;
